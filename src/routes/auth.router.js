import express from 'express';
import { 
   login,
   loginFaceBook,
   register,
   extendToken,
   loginAsyncKey,
   forgotPass,
   changePass } from '../controllers/auth.controller.js';

const authRouter =express.Router();

authRouter.post("/register",register);
authRouter.post("/login",login); // login bằng khóa đối xứng
authRouter.post("/login-face",loginFaceBook);
authRouter.post("/extend-token",extendToken);
authRouter.post("/login-async-key",loginAsyncKey); // login khóa bất đối xứng
authRouter.post("/forgot-password",forgotPass); // quên mật khẩu
authRouter.post("/change-password",changePass); // đổi mật khẩu
export default authRouter;