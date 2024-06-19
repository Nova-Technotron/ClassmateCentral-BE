import mongoose from 'mongoose'

mongoose.Promise = Promise;

 export default (config) => {
  if (!config.mongoURI) {
    throw new Error('Connection error, Database url not found');
  }
  return mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};