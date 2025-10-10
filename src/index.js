import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js"; 
dotenv.config({
  path: "./config/.env"
});



connectDB()
.then(() => {
  app.listen(process.env.PORT||8000, () =>{
    console.log(`Serve is runnning on port:${ process.env.PORT }`);
  })
})
.catch((err) => {
  console.log("MongoDB connection failed !!!",err);
})












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