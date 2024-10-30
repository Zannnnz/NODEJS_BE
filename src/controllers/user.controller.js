import { OK,INTERNAL_SERVER } from '../../const.js';
import initModels from "../models/init-models.js";
import sequelize from '../models/connect.js';
import { Op, where } from 'sequelize';
import bcrypt from 'bcrypt';
import { PrismaClient } from "@prisma/client";

const model = initModels(sequelize);
const prisma = new PrismaClient();




const creatUser= async(req,res) => {
   // let prams= req.params;
   // let{id,hoTen}=prams;
   // let body =req.body;
   // res.send({
   //    id,
   //    hoTen
   // });
   //lấy data từ body của req
   try {
      const {full_name,email,pass_word}=req.body;
      // let newuser= await model.users.create({
      //    full_name,
      //    email,
      //    pass_word
      // })
      let newuser= await prisma.users.create({
       data:{
         full_name,
         email,
         pass_word
       }
      })
      return res.status(201).json(newuser);
   } catch (error) {
      return res.status(INTERNAL_SERVER).json({message:"error"});
   }
}

const getUser = async(req,res) => {
   try {
   //   const [data]= await pool.query(`SELECT * FROM users`);
   //   res.status(OK).json(data);
      let full_name =req.query.full_name||'';
      let data= await model.users.findAll({
         where:{
            full_name:{
               [Op.like]: `%${full_name}%` ,
               
            },
         },
         // attributes:['user_id','full_name'],
         // include:[
         //    {
         //       model:model.video,//chọn model muốn kết bảng
         //       as: 'videos',
         //       attributes: ['video_name','user_id'],//chỉ định model muốn hiển thị
         //       required:true,// default sẽ kết bảng theo left join muốn inner join thì required
         //       include:[{
         //          model:model.video_comment,
         //          as: 'video_comments'
         //       }],
         //    }
         // ]
      });
      return res.status(OK).json(data);
   } catch (error) {
     return res.status(INTERNAL_SERVER).json({message:'error'});
   }
}   

const deleteUser = async(req,res) => {
   try {
      let {user_id} = req.params;
   //   const [data]= await pool.query(`
   //    Delete FROM users
   //    Where users.users_id = ${users_id}
   //    `);
      // let user = await model.users.findByPk(user_id);
      let user = await prisma.users.findFirst({
         where:{
            user_id:Number(user_id)
         }
      });
      if(!user){
         return res.status(404).json({message:"User not found"})
      }
      // user.destroy();
      await prisma.users.delete({
         where:{
            user_id: Number(user_id)
         }
      })
      res.status(OK).json({message:"User deleted successfully!"});
   } catch (error) {
     return res.status(INTERNAL_SERVER).json({message:'error'});
   }
}
const updateUser = async(req,res) => {
   try {
      const {user_id} = req.params;
      const {full_name, pass_word,email,avatar}= req.body;
      //check user có hay không
      // let user = await model.users.findByPk(user_id);

      let user = await prisma.users.findFirst({
         where:{
            user_id: Number(user_id)
         }
      });
      if(!user){
         return res.status(404).json({message:"User not found"});
      }
      // cách 1 
      // let data = await model.users.update({
      //    full_name,pass_word},
      //    {
      //       where:{user_id}
      //    }
      // )
      await prisma.users.update({
         data:{full_name,pass_word,email,avatar},
         where:{
            user_id: Number(user_id),

         },
         data: {
            full_name,
            pass_word:bcrypt.hashSync(pass_word,10),
        },
     })
      // cách 2 
      // user.full_name = full_name || user.full_name;
      // user.pass_word = pass_word || user.pass_word;
      // await user.save(); 
      // prisma không support update trực tiếp
      return res.status(OK).json({message:"Update successfully!"})
   } catch (error) {
      console.log(error)
     return res.status(INTERNAL_SERVER).json({message:'error'});
   }
}

const uploadAvatar = async (req,res) => {
   try {
      let file = req.file;
      let userID= req.params.userID;

      let user = await model.users.findOne({
         where:{
            user_id:userID
         }
      })


      if(!user){
         return res.status(404).json({message: "User not found"});
      }
      let avatarPath = `/public/imgs/${file.filename}`;
      user.avatar=avatarPath || user.avatar;
      await user.save();

      return res.status(200).json({message: "Avatar updated successfully",data:avatarPath});

   } catch (error) {
      return res.status(500).json({message:"error api upload avatar"});
   }
}
const detailUser = async (req,res) => {
   try {
      let {userID} =req.params;
      let data = await model.users.findOne({
         where:{
            user_id:userID
         }
      });
      res.status(200).json(data);
   } catch (error) {
      console.log(error)
      return res.status(500).json({message:"error"});
   }
}

export{
   creatUser,
   getUser,
   deleteUser,
   updateUser,
   uploadAvatar,
   detailUser
}
