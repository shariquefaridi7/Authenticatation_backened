import mongoose from "mongoose";

const emailOtp=mongoose.Schema({
   email:{
       type:String,
       required:true
   },otp:{
       type:String,
       required:true

   },
   createdAt:{
       type:Date,
       default:Date.now,
       index:{expires:300}
       //After 5 min  it deleted automatically from db
   }
},{timestamps:true});


const EmailOtp=mongoose.model("EmailOtp",emailOtp);

export default EmailOtp;