import Joi from "joi";

const scheduleSchema = Joi.object({
    courseName: Joi.string()
    .min(3)
    .required(),
    dayOfWeek: Joi.string()
    .min(3)
    .required(),
    startTime: Joi.date().iso().required(),
    endTime : Joi.date().iso().greater(Joi.ref('startTime')).required()

    // Add other wish properties as needed
  });

  // Function to validate a wish object against the schema
  const validateSchedule = (body) => {
    return scheduleSchema.validate(body);
  };
  
  export {validateSchedule}