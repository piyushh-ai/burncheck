import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
  throw new Error("Please provide MONGO_URI in the environment variables");
}

if (!process.env.PORT) {
  throw new Error("Please provide PORT in the environment variables");
}

export const config = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
};
