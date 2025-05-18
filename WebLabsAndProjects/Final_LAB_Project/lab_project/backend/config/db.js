import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 6 deprecated these options, but good to be aware if using older versions
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true, // Mongoose 6: not supported
      // useFindAndModify: false, // Mongoose 6: not supported
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.red.bold);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;