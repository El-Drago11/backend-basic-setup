import express from 'express'
import { userImagesUpload } from '../../../utils/multer.js';
import { adminEditProfile, adminlogin, changePasword, forgotPasword, getAdminProfile, resetPassword, sendVerifyOTP, verifyCode, verifyEmailPhone } from '../../controllers/adminController/AdminAuthController.js';
import { authenticateToken } from '../../../middleware/auth.js';

const adminAuthRouter = express.Router();

//login
adminAuthRouter.post("/login",adminlogin);

//Update Profile Details
adminAuthRouter.put("/update-profile/:id",authenticateToken,userImagesUpload,adminEditProfile);

//Get Profile Details
adminAuthRouter.get("/get-profile",authenticateToken,getAdminProfile);

//Change Password
adminAuthRouter.post("/change-password",authenticateToken,changePasword);

//forgot password
adminAuthRouter.post("/forgot-password",forgotPasword);

//Verify code
adminAuthRouter.post("/verify-otp",verifyCode);

//reset password
adminAuthRouter.post("/reset-password",resetPassword)

//send verification otp to mobile/email
adminAuthRouter.post("/send-otp",sendVerifyOTP);

//verify email/phone number otp
adminAuthRouter.post("/verify-email-phone-otp",verifyEmailPhone);

export default adminAuthRouter;