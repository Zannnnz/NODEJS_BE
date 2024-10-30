import multer, { diskStorage } from "multer";

// process.cwd() trả về đường dẫn root của project
export const upload = multer({
   storage: diskStorage({
      destination: process.cwd() + "/public/imgs",
      filename: (req,file,callback) => {
        // timestamp_img_name
        let newName= new Date().getTime() + '_' + file.originalname;
        callback(null,newName);
      }
   })
});

export const uploadForVideo = multer({
   storage: diskStorage({
      destination: (req, file, cb) => {
         // Đặt thư mục lưu trữ video và thumbnail
         const dir = file.fieldname === 'source' ? '/public/videos' : '/public/thumbnails';
         cb(null, process.cwd() + dir);
      },
      filename: (req, file, cb) => {
         // Đặt tên file với timestamp và tên gốc
         const newName = `${Date.now()}_${file.originalname}`;
         cb(null, newName);
      }
   }),
   limits: {
      fileSize: 100 * 1024 * 1024 // Giới hạn kích thước file (100MB)
   },
   fileFilter: (req, file, cb) => {
      // Kiểm tra định dạng file cho video và thumbnail
      const videoTypes = ['video/mp4', 'video/x-msvideo', 'video/x-matroska', 'video/ogg'];
      const thumbnailTypes = ['image/jpeg', 'image/png', 'image/gif','image/svg+xml','image/webp'];

      if (file.fieldname === 'source' && videoTypes.includes(file.mimetype)) {
         cb(null, true); // Cho phép video
      } else if (file.fieldname === 'thumbnail' && thumbnailTypes.includes(file.mimetype)) {
         cb(null, true); // Cho phép thumbnail
      } else {
         cb(new Error('File type not allowed!'), false); // Từ chối file
      }
   }
});
