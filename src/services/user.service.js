const userRepository = require("../repositories/user.repository");
const redisModule = require("../common/redis");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


class UserService {
  async createUser(user) {
    try {
      const existingEmail = await userRepository.findByEmail(user.email);
      if (existingEmail) {
        return { message: "User with the email id already exists" };
      }

      const existingMobile = await userRepository.findByMobile(user.mobile);
      if (existingMobile) {
        return { message: "User with the mobile number already exists" };
      }
      const hashedPassword = await bcrypt.hash(user.password, 10);
      user.password = hashedPassword;

      return await userRepository.create(user);
    } catch (error) {
      throw new Error("Error while creating a user: " + error.message);
    }
  }

  async getAllUsers() {
    try {
      return await userRepository.findAll();
    } catch (error) {
      throw new Error("Error fetching user details: " + error.message);
    }
  }

  async getUserById(id) {
    try {
        const cacheKey = `user_profile_${id}`;
        const redisClient = redisModule.getRedisClient();
        
        const cachedInfo = await redisClient.getAsync(cacheKey);

        if (cachedInfo) {
            console.log("Entereing 1");
            return JSON.parse(cachedInfo);
        } else {
            const user = await userRepository.findById(id);

            if (!user) {
                throw new Error("No user found");
            }

            // Cache user data in Redis
            await redisClient.setexAsync(cacheKey, 3600, JSON.stringify(user)); // Cache for 1 hour
            console.log(user);

            return user;
        }
    } catch (error) {
        throw new Error("Error fetching user details: " + error.message);
    }
 }

 async userLogin(body) {
  try {
    const userDetails = await userRepository.findByEmail(body.email);
  
    if (!userDetails) {
      throw new Error('User Not Found!');
    } else if (await bcrypt.compare(body.password, userDetails.password)) {
      const tokenPayload = {
        email: userDetails.email,
      };
      const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY);
      return accessToken;
            
    } else {
      throw new Error('Wrong Password!')
    }
  } catch (error) {
    throw new Error("Error logging in: " + error.message);
  }

 }


  async updateUserById(id, user) {
    try {
      const existingEmail = await userRepository.findByEmail(user.email);
      if (existingEmail && existingEmail.id != id) {
        return { message: "User with the email id already exists. Try with some other email!" };
      }

      const existingMobile = await userRepository.findByMobile(user.mobile);
      if (existingMobile && existingMobile.id != id) {
        return { message: "User with the mobile number already exists" };
      }

      await userRepository.update(id, user);
      return { message: "User details updated successfully" };
    } catch (error) {
      throw new Error("Error updating user details: " + error.message);
    }
  }

  async deleteUserById(id) {
    try {
      const num = await userRepository.delete(id);
      if (num === 0) {
        throw new Error("User not found");
      }
      return { message: "User deleted successfully" };
    } catch (error) {
      throw new Error("Error deleting user: " + error.message);
    }
  }

}
  
//   async deleteAll() {
//     try {
//       await userRepository.deleteAll();
//       return { message: "Users deleted successfully" };
//     } catch (error) {
//       throw new Error("Error deleting users: " + error.message);
//     }
//   }


module.exports = new UserService();
