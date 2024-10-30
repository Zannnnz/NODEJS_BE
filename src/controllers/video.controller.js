import initModels from "../models/init-models.js";
import sequelize from '../models/connect.js';
import { NUMBER, Op, where } from 'sequelize';
import video from "../models/video.js";
import { PrismaClient } from "@prisma/client";


const model = initModels(sequelize);
const prisma = new PrismaClient();


const getListVideo = async (req,res) => {
   try {
      let data = await model.video.findAll();
      res.status(200).json(data);
   } catch (error) {
      console.log(error)
      return res.status(500).json({message:"error"});
   }
}

const getTyppeVideo = async (req,res) => {
   try {
      let data = await model.video_type.findAll();
      res.status(200).json(data);
   } catch (error) {
      return res.status(500).json({message:"error"});
   }
}

const getTyppeDetails = async (req,res) => {
   try {
      let {typeID}= req.params;
      let data = await model.video.findAll({
         where: {
            type_id:typeID
         }
      })
      
      return res.status(200).json(data);
   } catch (error) {
      return res.status(500).json({message:"error"});
   }
}

const getVideoPage = async(req,res) => {
  try {
   let {page,size}=req.params;
   page =parseInt(page,10);
   size = parseInt(size,10);
   if(isNaN(page)|| page<0){
      return res.status(404).json({message:"Page is wrong"});
   }
   if(isNaN(size)|| size<0){
      return res.status(404).json({message:"Size is wrong"});
   }
   let index = (page - 1) * size;
   let data = await model.video.findAll({
      offset:index,
      limit:size,
   })
   res.status(200).json(data)
  } catch (error) {
   return res.status(500).json({message:"error"});
  }
}

const getVideo = async (req,res) => {
   try {
      let {videoid} =req.params;
      let data = await model.video.findOne({
         where:{
            video_id:videoid
         }
      });
      res.status(200).json(data);
   } catch (error) {
      console.log(error)
      return res.status(500).json({message:"error"});
   }
}

const searchVideo = async (req,res) => {
  try {
   let video_name= req.query.video_name || "";
   let data= await model.video.findAll({
      where:{
         video_name:{
            [Op.like]: `%${video_name}%` ,
         }
      },
   });
   return res.status(200).json(data);
  } catch (error) {
   return res.status(500).json({message:"error"});
  }
}

const uploadVideoAndThumbnail = async (req, res) => {
   try {
       // Lấy file video và thumbnail từ request
       let videoFile = req.files['source'] ? req.files['source'][0] : null; // Lấy file video
       let thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null; // Lấy file thumbnail

       // Lấy user_id từ params
       let userId = req.params.userId;

       // Lấy description và video_name từ body
       let { description, video_name } = req.body; // Thêm dòng này để lấy thông tin từ body

       // Kiểm tra xem file video có tồn tại không
       if (!videoFile) {
           return res.status(400).json({ message: "No video file provided" });
       }

       // Kiểm tra xem file thumbnail có tồn tại không
       if (!thumbnailFile) {
           return res.status(400).json({ message: "No thumbnail file provided" });
       }

       // Tạo đường dẫn cho video và thumbnail
       let videoPath = `/public/videos/${videoFile.filename}`; // Đường dẫn video
       let thumbnailPath = `/public/thumbnails/${thumbnailFile.filename}`; // Đường dẫn thumbnail

       // Tạo video mới với user_id
       let newVideo = await model.video.create({
           user_id: userId, // Lưu user_id
           source: videoPath, // Lưu đường dẫn video
           thumbnail: thumbnailPath, // Lưu đường dẫn thumbnail
           description, // Lưu description
           video_name // Lưu video_name
       });

       return res.status(201).json({ message: "Video and thumbnail uploaded successfully", data: newVideo });

   } catch (error) {
       console.error(error);
       return res.status(500).json({ message: "Error in uploading video and thumbnail" });
   } 
};



// const updateVideoInfo = async (req, res) => {
//    try {
//       const { video_id, userId } = req.params; // Lấy video_id và userId từ params
//       const { video_name, description } = req.body;

//       // Kiểm tra xem video có tồn tại không
//       let video = await prisma.video.findFirst({
//          where: {
//             video_id: Number(video_id),
//             user_id: Number(userId) // Kiểm tra xem video có thuộc về user này không
//          }
//       });

//       if (!video) {
//          return res.status(404).json({ message: "Video not found or does not belong to the user" });
//       }

//       // Cập nhật thông tin video
//       await prisma.video.update({
//          data: { video_name, description },
//          where: {
//             video_id: Number(video_id),
//          },
//       });

//       return res.status(200).json({ message: "Update successfully!" });
//    } catch (error) {
//       console.log(error);
//       return res.status(500).json({ message: 'Error updating video info' });
//    }
// };

const getVideosByUserId = async (req, res) => {
   try {
      let { userId } = req.params;
      let videos = await model.video.findAll({
         where: {
            user_id: userId
         }
      });
      res.status(200).json(videos);
   } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "error" });
   }
}


export{
   getListVideo,
   getTyppeVideo,
   getTyppeDetails,
   getVideoPage,
   getVideo,
   searchVideo,
   // uploadVideo,
   // uploadThumbnail,
   // updateVideoInfo,
   uploadVideoAndThumbnail,
   getVideosByUserId
}
