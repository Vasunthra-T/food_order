module.exports = app => {
    const user = require("../controllers/user.controller.js");
    const userService = require("../services/user.service.js");
    const validate = require("../validations/user.validation.js")
    const auth = require('../common/authMiddleware');

  
    let router = require("express").Router();

    // Create a new user
    router.post("/", validate.userValidation, async (req, res) => {
      try {
        const { name, mobile, email, address, password } = req.body;
        const newUser = await userService.createUser({ name, mobile, email, address, password });
        res.status(200).json(newUser); 
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  
    // Get all users
    router.get("/", async (_req, res) => {
      try {
        let users = await userService.getAllUsers();
        res.status(200).send(users);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get user by id
    router.get("/:id", async (req, res) => {
      try {
        const userDetails = await userService.getUserById(req.params.id);
        res.status(200).json(userDetails);
      } catch(error) {
        res.status(500).json({ error: error.message });
      }
    });

    //user login with jwt
    router.post("/login", async (req, res) => {
      try {
        const accessToken = await userService.userLogin(req.body);
        res.status(200).json(accessToken);
      
      } catch (error) {
        res.status(500).json({ error: error.message });

      }
    });

    // Authenticate token
    // router.get("/authenticate", auth.verifyToken, async (req, res) => {
    //   try {
    //     console.log("Entering function");
    //     res.status(200).send("User authorized");

    //   } catch (err) {
    //     res.status(err.status).json({
    //         message: err.message,
    //       });
    //   }

    // });


    // Update user by id
    router.put("/:id", validate.userValidation, async (req, res) => {
      try {
        const user = {
          name : req.body.name,
          email : req.body.email,
          mobile : req.body.mobile,
          address : req.body.address
        }
        const updatedUser = await userService.updateUserById(req.params.id, user);
        res.status(200).json(updatedUser);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Delete user by id
    router.delete("/:id", async (req, res) => {
      try {
        const deletedUser = await userService.deleteUserById(req.params.id);
        res.status(200).json(deletedUser);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  
    // Delete all users
    // router.delete("/", user.deleteAll);
  
    app.use("/api/users", router);
  };