import Joi from "joi";

const regsiterSchema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
    password: Joi.string().min(8).alphanum().required()
    // Add other wish properties as needed
  });
  const loginSchema = Joi.object({
    email: Joi.string().email().required(),
 
    password: Joi.string().min(8).alphanum().required()
    // Add other wish properties as needed
  });
  
  // Function to validate a wish object against the schema
  const validateRegister = (regsiter) => {
    return regsiterSchema.validate(regsiter);
  };
  const validateLogin = (regsiter) => {
    return loginSchema.validate(regsiter);
  };
  export {validateRegister, validateLogin}