const Joi = require('joi');


module.exports = {
    userValidation: (req, res, next) => {
      const schema = Joi.object({
        name: Joi.string().alphanum().required().min(2).max(30),
        mobile: Joi.string().pattern(/^[0-9-+]{5,15}$/).required().min(5).max(15),
        email: Joi.string().email().required().min(5).max(30),
        address: Joi.string().required().min(5).max(50),
        password: Joi.string().required().min(5)
      }).options({
        abortEarly : false
      });
  
      const { error } = schema.validate(req.body);
      if (error) {
        const errorMessages = error.details.map((detail) => detail.message).join();
        return res.status(400).json({ message: errorMessages });
      }
      next();
    }
  };

