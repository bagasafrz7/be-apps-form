import dotenv from "dotenv";
import mongoose from "mongoose";

const env = dotenv.config().parsed;

const connection = () => {
 mongoose.connect(env.MONGODB_URI, {
  dbName: env.MONGODB_NAME,
 });

 const connection = mongoose.connection;
 connection.on("error", console.error.bind(console, "Connection Error :"));
 connection.once("open", () => {
  console.log(`Connected to MongoDB, DB name : ${env.MONGODB_NAME}`);
 });
};

export default connection;
