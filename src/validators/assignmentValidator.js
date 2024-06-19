import Joi from "joi";

const assignmentSchema = Joi.object({
    title: Joi.string()
    .min(3)
    .required(),
    description: Joi.string()
    .min(3)
    .required(),
    duedate:Joi.date().iso().required()

    // Add other wish properties as needed
  });

  // Function to validate a wish object against the schema
  const validateAssignment = (assignment) => {
    return assignmentSchema.validate(assignment);
  };
  
  export {validateAssignment}