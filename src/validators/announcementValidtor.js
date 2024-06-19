import Joi from "joi";

const announcementSchema = Joi.object({
    title: Joi.string()
    .min(3)
    .required(),
    content: Joi.string()
    .min(3)
    .required(),

    // Add other wish properties as needed
  });

  // Function to validate a wish object against the schema
  const validateAnnouncement = (announcement) => {
    return announcementSchema.validate(announcement);
  };
  
  export {validateAnnouncement}