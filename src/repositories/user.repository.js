const db = require("../models");
const User = db.User;

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findByMobile(mobile) {
    return await User.findOne({ where: { mobile } });
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  async findAll() {
    return await User.findAll();
  }

  async create(user) {
    return await User.create(user);
  }

  async update(id, user) {
    return await User.update(user, { where: { id } });
  }

  async delete(id) {
    return await User.destroy({ where: { id } });
  }

  async deleteAll() {
    return await User.truncate();
  }
}

module.exports = new UserRepository();
