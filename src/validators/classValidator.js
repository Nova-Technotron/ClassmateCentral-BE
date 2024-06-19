import Joi from "joi";

const classSchema = Joi.object({
    className: Joi.string()
    .min(3)
    .required(),
    className: Joi.string()
    .min(3)
    .required(),

    // Add other wish properties as needed
  });

  // Function to validate a wish object against the schema
  const validateClass = (body) => {
    return classSchema.validate(body);
  };
  
  export {validateClass}