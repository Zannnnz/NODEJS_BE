import initModels from "../models/init-models.js";
import sequelize from '../models/connect.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import transporter from "../config/transporter.js";
import { createRefToken, createRefTokenAsyncKey, createToken, createTokenAsyncKey } from "../config/jwt.js";
import cypto from 'crypto';
import speakeasy from 'speakeasy';


const model = initModels(sequelize);

const register = async(req,res,next) => {
  try {
      const {fullName, email, pass}= req.body;
      console.log({fullName,email,pass});
      const userExits= await model.users.findOne({
         where:{
            email:email,
         }
      });
      if(userExits){
         return res.status(400).json({message:"Already account"})
      }
      const secret = speakeasy.generateSecret({length:15});
      //B3: thêm người mới vào
      const newAccount  = await model.users.create({
         full_name:fullName,
         email:email,
         pass_word:bcrypt.hashSync(pass,10),
         secret: secret.base32 // tạo secret cho login 2 lớp
      });
      // cấu hình info email
      const mailOption = {
         from:process.env.MAIL_USER,
         to: email,
         subject:"Welcome to our service",
         text:`Hello ${fullName} .Best Regards.`
      }
      // gửi mail
      transporter.sendMail(mailOption,(error,info) => {
         if(error){
            return res.status(500).json({message:"error"});
         }
         return res.status(200).json({
            message: "Success Register",
            data:newAccount,
         });
      })
  } catch (error) {
   return res.status(500).json({message:"error"});
}
};
const login= async (req,res) => {
  try {
   //B1: lấy email và password từ body req
   //B2: check user thông qua email(get user từ db)
   //B2.1: nếu không có user => ra error user not found
   //B2.2: nếu có user => check tiếp password
   //B2.2.1: nếu password không trùng nhau => password error
   //B2.2.2: nếu password trùng => tạo access token
   let{email,pass_word}=req.body;
   let user = await model.users.findOne({
      where:{
         email,
      }
   });
   if(!user){
      return res.status(400).json({message:"Email is wrong"});
   }
   let checkPass = bcrypt.compareSync(pass_word,user.pass_word);
   if (!checkPass){
      return res.status(400).json({message:"Passwword is wrong"});
   }
   // tạo token 
   //function style của jwt 
   //param1: nơi tạo payload và lưu vào token
   //param2: key tạo token 
   //param3: chứa thông tin settings live time của token và thuật toán để tạo token 
   let payload= {
      userID: user.user_id,
   }
   let accessToken = createToken({userId:user.user_id});
   // creat refresh token và lưu vào database
   let refreshToken =createRefToken({userID:user.user_id});
   await model.users.update({
      refresh_token: refreshToken
   },{
      where:{user_id:user.user_id}
   });
   // lưu refresh token vào cookie
   res.cookie('refreshToken',refreshToken,{
      httpOnly: true, // cookie không thể truy cập từ javascript
      secure:false, // để chạy dưới local host
      sameSite:'LAX', // để đảm bảo cookie được gửi trong các domain khác nhau
      maxAge:7*24*60*60*1000

   })
   return res.status(200).json({
      message:"login successfully",
      data: accessToken,
   });
  } catch (error) {
   return res.status(500).json({message:"error"});
  }
}

const loginFaceBook = async (req,res) => {
   try {
      //B1: Lấy id, email, name từ request
      //B2: check id(app_face_id trong db)
      //B2.1: nếu có app_face_idd => tạo access token => gửi về FE
      //B2.2: nếu không có app_face_id => tạo user mới => tạo access token => gửi về FE
      let {id,email,name}= req.body;
      let user = await model.users.findOne({
         where:{face_app_id: id}
      })
      if(!user){
         let newUser ={
            full_name: name,
            face_app_id: id,
            email,
         }
         user = await model.users.create(newUser);
      }
      let accessToken = createToken({userId:user.user_id})
      return res.status(200).json({
         message:"login successfully",
         data: accessToken,
      });
   } catch (error) {

      return res.status(500).json({message:"error"});
   }
}

const extendToken = async (req,res)=>{
   // Lấy refresh token từ cookie request
   const refreshToken= req.cookies.refreshToken;
   console.log("refreshToken", refreshToken)
   if(!refreshToken){
       return res.status(401)
   }
   const checkRefToken= await model.users.findOne({
       where:{
           refresh_token: refreshToken
       }
   });
   if(!checkRefToken){
       return res.status(401)
   }
   // const newToken = createToken({userId:checkRefToken.user_id})
   const newToken = createTokenAsyncKey({userId:checkRefToken.user_id})
   console.log("newToken", newToken)
   return res.status(200).json({message:"Success",data:newToken})
}

const loginAsyncKey = async (req,res) => {
   try {
      //B1: lấy email và password từ body req
      //B2: check user thông qua email(get user từ db)
      //B2.1: nếu không có user => ra error user not found
      //B2.2: nếu có user => check tiếp password
      //B2.2.1: nếu password không trùng nhau => password error
      //B2.2.2: nếu password trùng => tạo access token
      let{email,pass_word,code}=req.body;
      let user = await model.users.findOne({
         where:{
            email,
         }
      });
      if(!user){
         return res.status(400).json({message:"Email is wrong"});
      }
      let checkPass = bcrypt.compareSync(pass_word,user.pass_word);
      if (!checkPass){
         return res.status(400).json({message:"Passwword is wrong"});
      }

      // check code nhập từ req
      const verify =speakeasy.totp.verify({
         secret: user.secret,
         encoding: 'base32',
         token:code
      })
      if (!verify){
         return res.status(400).json({message:"Invalid 2FA"});
      }
      // tạo token 
      //function style của jwt 
      //param1: nơi tạo payload và lưu vào token
      //param2: key tạo token 
      //param3: chứa thông tin settings live time của token và thuật toán để tạo token 
      let payload= {
         userID: user.user_id,
      }
      let accessToken = createTokenAsyncKey({userId:user.user_id});
      // creat refresh token và lưu vào database
      let refreshToken =createRefTokenAsyncKey({userID:user.user_id});
      await model.users.update({
         refresh_token: refreshToken
      },{
         where:{user_id:user.user_id}
      });
      // lưu refresh token vào cookie
      res.cookie('refreshToken',refreshToken,{
         httpOnly: true, // cookie không thể truy cập từ javascript
         secure:false, // để chạy dưới local host
         sameSite:'LAX', // để đảm bảo cookie được gửi trong các domain khác nhau
         maxAge:7*24*60*60*1000
   
      })
      return res.status(200).json({
         message:"login successfully",
         data: accessToken,
      });
     } catch (error) {
      return res.status(500).json({message:"error"});
     }
}
const forgotPass = async (req,res) => {
  try {
   // lấy email trong body
   let{email}= req.body;
   // kiểm tra email có tồn tại trong databas
   let checkEmail = await model.users.findOne({
      where:{
         email
      }
   })
   if (!checkEmail){
      res.status(400).json({message:"Email is wrong"});
   }
   let randomCode = cypto.randomBytes(5).toString("hex");
   // tạo biến lưu expired
   let expired = new Date(new Date().getTime() + 1 * 60 * 60 * 1000);
   // lưu code vào database
   await model.code.create({
      code: randomCode,
      expired
   })
   // send code reset pass qua mail
   // cấu hình info email
   const mailOption = {
      from:process.env.MAIL_USER,
      to: email,
      subject:"Forgot PassWord",
      html: `<h1> Code to reset your password: ${randomCode}</h1>`,
   }
   // gửi mail
   transporter.sendMail(mailOption,(error,info) => {
      if(error){
         return res.status(500).json({message:"error"});
      }
      return res.status(200).json({
         message: "Please check your email. We already send code to config your password",
      });
   })
  } catch (error) {
   return res.status(500).json({message:"error API forgot password"});
  }
}

const changePass = async (req,res) => {
  try {
   let{code,email,newPass}=req.body;
   // kiểm tra code có tồn tại trong database không
   let checkCode = await model.code.findOne({
      where:{
         code
      }
   })
   if(!checkCode){
      return res.status(400).json({message:"Code is wrong"});
   }
   // kiểm tra email có tồn tại trong db 
   let checkEmail = await model.users.findOne({
      where:{
         email
      }
   })
   if (!checkEmail){
      return res.status(400).json({message:"Email is wrong"});
   }
   // check code có còn expired hay không
   let hashNewPass = bcrypt.hashSync(newPass,10);
   checkEmail.pass_word = hashNewPass;
   checkEmail.save();
   // remove code sau khi change pass thành công
   await model.code.destroy({
      where:{
         code
      }
   })
   return res.status(200).json({message:"Change Password Successfully"});
  } catch (error) {
   return res.status(500).json({message:"error API change password"});
  }
}

export {
   register,
   login,
   loginFaceBook,
   extendToken,
   loginAsyncKey,
   forgotPass,
   changePass,
}