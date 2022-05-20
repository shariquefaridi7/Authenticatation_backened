import express from 'express';

import cors from "cors";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from "dotenv";
import userRouter from "./routes/userRouter.js";

dotenv.config();
//const port =3001;
const app=express();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user",userRouter);
app.get("/",(req,res)=>{
    res.send("Server is Ready");

});



  const port =process.env.PORT || 4000;
  mongoose.connect(process.env.DB_URL).then(()=>app.listen(port,()=>console.log(`Server is running on port ${port}`)))
  .catch((e)=>console.log(e));