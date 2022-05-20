import mongoose from "mongoose";

const registeration=mongoose.Schema({
   email:{
       type:String,
       required:true
   },
   password:{
       type:String,
       required:true
   },
   name:{
       type:String,
       required:true
   },

   referalcode:{
       type:String
   }
});


const Registeration=mongoose.model("Registeration",registeration);

export default Registeration;