import mongoose from "mongoose"
import asyncHandler from "../utils/asyncHandler.js";



export  const connectDB =async()=>{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to DB")  
       
}