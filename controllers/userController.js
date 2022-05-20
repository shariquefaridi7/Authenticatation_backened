import bcrypt from "bcrypt";
import axios from "axios";
import otpGenerator from "otp-generators";
import  EmailOtp from "../models/emailOtp.js";
import UserEmail from "../models/userModel.js";
import nodemailer from 'nodemailer';
import Registeration from "../models/registeration.js";
import jwt from "jsonwebtoken";






// Generting  the OTP and Store in database

export const LoginEmail= async(req,res)=>{

  const email=req.body.email;
    console.log(email)

    try{
        const user=await UserEmail.findOne({email});
        if(user){
            return res.status(400).json("User is registered already");
        }
    
        const OTP=otpGenerator.generate(6, { digits:true ,alphabets:false ,upperCase:false,specialChar:false });
         
     
        console.log(OTP);
        const salt=await bcrypt.genSalt(10);
        const hashOTp=await bcrypt.hash(OTP,salt);
         const result =new EmailOtp({email,otp:hashOTp});
       await result.save();


       // Send Mail
       const mailTransporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        requireTLS:true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });
    
    const mailDetails = {
        from: process.env.EMAIL,
        to: email,
        subject: `OTP`,
        text:` 
        OTP - ${OTP}
       
         `
    };
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs',err);
        } else {
            console.log('Email sent successfully');
        }
    });
    
        // ______________________Gmail END__________________
    
       res.json(result)
        

    }catch(err){
        console.log(err);
    }
   

}


//Verify the valid user with OTP
export const VerifyOtp= async (req,res)=>{


     const email=req.body.email;
     const otp=req.body.otp;

     console.log(otp);

    const otpHolder= await EmailOtp.find({email});
    if(otpHolder.length ==0 )  res.status(400).json("Your are Expired OTP!");
    const rightOptFind = otpHolder[otpHolder.length-1];
    const validUser=await bcrypt.compare(otp,rightOptFind.otp);

    if(rightOptFind.email === email && validUser){
        const user =new UserEmail({email});
          const token=user.generateJWT();
          const result=await user.save();
          const OTPDelete= await EmailOtp.deleteMany({
              email:rightOptFind.email
          });

          return res.status(200).json({
              message:"User is Registered Successfully",
              token,
              data:result
          })
    }else{
        return res.status(400).json("Your OTP is not valid");
    }
}


//Create user with email and password

export const CreateUser = async (req,res)=>{
    
    const name=req.body.name;
    const email=req.body.email;
    const password=req.body.password;
    const confirmPassword=req.body.confirmPassword;
    const referalcode=req.body.referalcode;

   
    
    try{
      const ExistedUser =await Registeration.findOne({email});
      if(ExistedUser) return res.status(400).json({message:"User is already have an account"});
      if(password ===! confirmPassword) return res.status(400).json({message:"Credential is not valid"});
       const hashPassword =await bcrypt.hash(password,12);
       const result= await Registeration.create({name,email,password:hashPassword,referalcode});
       const token= jwt.sign({email:result.email,id:result._id},"test",{expiresIn:"1h"});
       res.status(200).json({result,token});
    }catch(err){

        res.status(500).json({message:"Some went wrong"});
        console.log(err);
    }
}

// Verify user with password

export const LoginUser = async (req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    try{

        const ExistedUser =await Registeration.findOne({email});
        if(!ExistedUser) return res.status(400).json({message:"User do not have account"});
        const isCorrectPassword=await bcrypt.compare(password,ExistedUser.password)
        if(!isCorrectPassword) return res.status(400).json({message:"Credential is invalid"});
        const token= jwt.sign({email:ExistedUser.email,id:ExistedUser._id},"test",{expiresIn:"1h"});
        res.status(200).json({result:ExistedUser,token,user:"verified"});

    }catch(err){
        res.status(500).json({message:"Some went wrong"});
    console.log(err);
    }
}

// Reset the password with specific email

export const ForgetPassword = async (req,res)=>{
     const email= req.body.email;
    try{
           //Make sure User exist in the Database 
        const ExistedUser =await Registeration.findOne({email});
        if(!ExistedUser) return res.status(400).json({message:"User is not registered"});
    console.log(ExistedUser);
          // If User exit create One Time Password for specific time
          const secret=process.env.RESET_JWT_SECRET+ExistedUser.password;
          const token=jwt.sign({email:ExistedUser.email,id:ExistedUser._id},secret,{expiresIn:"15m"});
          const link=`http://localhost:4000/api/user/reset-password/${ExistedUser.id}/${token}`;
          console.log(link);
          res.status(200).json("Link has been send successfully")
          

       // Send Mail
       const mailTransporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:587,
        secure:false,
        requireTLS:true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS
        }
    });
    
    const mailDetails = {
        from: process.env.EMAIL,
        to: email,
        subject: `Reset Password Link`,
        text:` 
        Link for Reset Password- ${link}
       
         `
    };
    
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if(err) {
            console.log('Error Occurs',err);
        } else {
            console.log('Email sent successfully');
        }
    });
    
        // ______________________Gmail END__________________

        

    }catch(err){
    console.log(err);
    }
}

//Reset password 

export const ResetPassword= async(req,res)=>{
   const  id=req.params.id;
   const token=req.params.token;
 const password=req.body.password;
 const confirmPassword=req.body.confirmPassword;
  const ExistedUser= await Registeration.findOne({_id:id});
  if(!ExistedUser) return res.status(400).json("User is not valid");
  const secret=process.env.RESET_JWT_SECRET+ExistedUser.password;
    try {
           
          const payload=jwt.verify(token,secret);
          if(!payload) return res.status(400).json("Credentail is not valid...");
          if(password ===! confirmPassword) return res.status(400).json({message:"Credential is not valid"});
          const hashPassword =await bcrypt.hash(password,12);
          const updated= await Registeration.findByIdAndUpdate(ExistedUser_id,password,{new:true})
    } catch (error) {
        console.log(error);
        res.status(400).json(error)
    }
}