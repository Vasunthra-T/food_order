const Joi = require('joi');

module.exports = {
    itemValidation: (req, res, next) => {
      const schema = Joi.object({
        name: Joi.string().required().min(2).max(30),
        description: Joi.string().required().min(3).max(100),
        price: Joi.number().integer().min(0).required()
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

