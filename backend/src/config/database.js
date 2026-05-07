import mongoose from "mongoose";
import { config } from "./config.js";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

export const dbConnect = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.log("Database connection failed", error);
        process.exit(1);
    }
};