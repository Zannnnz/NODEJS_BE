import express from 'express';
import { creatUser, deleteUser, detailUser, getUser,updateUser, uploadAvatar } from '../controllers/user.controller.js';
import { upload } from '../config/upload.js';
import { uploadCloud } from '../config/uploadCloud.js';
import { middlewareTokenAsyncKey } from '../config/jwt.js';
const userRoutes = express.Router();

userRoutes.post(`/create-users`,creatUser);
userRoutes.get(`/get-users`,getUser);
userRoutes.delete(`/delete-users/:user_id`,deleteUser);
userRoutes.put(`/update-users/:user_id`,updateUser);
userRoutes.post('/upload-avatar/:userID',upload.single("hinhanh"),uploadAvatar);
userRoutes.post('/upload-avatar-cloud',uploadCloud.single("hinhanh"),(req,res) => {
  let file = req.file;
  return res.status(200).json(file);
})
userRoutes.get('/details-user/:userID',detailUser)
export default userRoutes;