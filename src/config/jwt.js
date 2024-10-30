import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';

let accessTokenPrivateKey=fs.readFileSync("access_token.private.key");
let accessTokenPublicKey=fs.readFileSync("access_token.public.key");
let refreshTokenPrivateKey=fs.readFileSync("refresh_token.private.key");
let refreshTokenPublicKey=fs.readFileSync("refresh_token.public.key");




//đọc file env
dotenv.config();
//create token 
export const createToken = (data) => {
  return jwt.sign({payload:data},process.env.ACCESS_TOKEN_KEY,{
   algorithm: "HS256",
   expiresIn: "5m"
  })
}

// create toke AsyncKey
export const createTokenAsyncKey = (data) => {
   return jwt.sign({payload:data},accessTokenPrivateKey,{
      algorithm: "RS256",
      expiresIn: "5m"
     })
};



export const verifyToken = (token) =>{
  try {
   jwt.verify(token,process.env.ACCESS_TOKEN_KEY);
   return true;
  } catch (error) {
   //không verify được token
   return false;
  }
}

export const verifyTokenAsyncKey = (token) =>{
   try {
    jwt.verify(token,accessTokenPublicKey);
    return true;
   } catch (error) {
    //không verify được token
    console.log(error);
    return false;
   }
 }

// refresh token
export const createRefToken = (data) => {
   return jwt.sign({payload:data},process.env.REFESH_SECRET,{
      algorithm: "HS256",
      expiresIn: "7d"
     })
}

export const createRefTokenAsyncKey = (data) => {
   return jwt.sign({payload:data},refreshTokenPrivateKey,{
      algorithm: "RS256",
      expiresIn: "10s"
     })
}

//create middleware token

export const middlewareToken = (req,res,next) =>{
   let {token} = req.headers;   
   let checkToken= verifyToken(token);

   if(checkToken){
   // nếu token hợp lệ =>pass=> qua router
      next();
   }
   else{
      return res.status(401).json({message:"Unauthorized"})
   }
}

export const middlewareTokenAsyncKey = (req,res,next) =>{
   let {token} = req.headers;
   let checkToken= verifyTokenAsyncKey(token);
   if(checkToken){
   // nếu token hợp lệ =>pass=> qua router
      next();
   }
   else{
      return res.status(401).json({message:"Unauthorized"})
   }
}