const Joi = require('joi');

module.exports = {
    orderValidation: (req, res, next) => {
      const schema = Joi.object({
        code: Joi.string(),
        itemId: Joi.number().required(),
        userId: Joi.number().required()
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

