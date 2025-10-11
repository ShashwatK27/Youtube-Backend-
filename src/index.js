import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js"; 
dotenv.config({
  path: "./config/.env"
});



try {
  await connectDB();
  console.log("Database connected successfully");
  
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.log("Error starting server:", err);
}












/*
import express from "express";

const app = express();
(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error",(error)=>{
          console.log("ERROR:",error);
          throw error;
        })
        app.listen(process.env.PORT, ()=>{
          console.log(`Server is running on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error('DB connection error:', error);
        throw error;
    }
})();
*/