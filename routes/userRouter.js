import express from "express";
import { LoginEmail,VerifyOtp ,CreateUser,LoginUser,ResetPassword,ForgetPassword} from "../controllers/userController.js";

const router=express.Router();

router.post("/login_email",LoginEmail);
router.post("/verify_otp",VerifyOtp);
router.post("/registeration",CreateUser);
router.post("/login",LoginUser);
router.post("/forget_password",ForgetPassword);
router.post("/reset_password/:id/:token",ResetPassword);

export default router;