/*
B1: npm init -> tạo file package.json
B2: tạo file js 
B3: install lib express (npm i express)
B4: update file json
  + thêm type module
  + thêm script start server "start:""node indexjs"
B5: khời tạo dự án:
  + import thư viện express (import express from 'express')
  + tạo object app (const app= express())
  + khởi tạo port cho BE
  + start server
 */


import express from 'express';
import { OK,INTERNAL_SERVER } from './const.js';
import rootRoutes from './src/routes/root.router.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io'; // lib socker io dung đề tạo server chat realtime
import {createServer} from 'http';
// import initModels from "./src/models/init-models.js";
import initModels from './src/models/init-models.js';
import sequelize from './src/models/connect.js';


const app= express();
const model = initModels(sequelize);


//thêm middleware cors để FE có thể call API tới BE
app.use(cors({
  origin:"http://localhost:3000",
  credentials: true // cho phép FE lấy cookie và lưu vào cookie browser
}));

// tạo http server
const server = createServer(app);

// tạo socketIO server
// io : object cho socket server
// socker : object cho socket client
const io = new Server(server,{
  cors:{
    origin: "*"
  }
});

// nghe event kết nối từ client(FE) qua SocketIo
// on() nhận event
// emit gửi event đi
// on và emit có 2 params
// param 1: event type: event của socketIO hoặc event của user tự define
// param 2 : function
let number =0;
io.on('connection',(socket) => {
  console.log(socket.id);

  socket.on("send-click",() => {
    number +=1;
    //server gửi event cho tất cả client 
    io.emit("send-number",number);
  })

  socket.on("send-click-reduce",() => {
   number -=1;
   io.emit("send-number",number); 
  })
  // nhận event mess
  socket.on("send-mess",async({user_id,content}) => {
    let newChat = {
      user_id,
      content,
      date: new Date()
    };
    await model.chat.create(newChat)
    io.emit("sv-send-mess",{user_id,content});
  })
});

// nhận event like, dislike
let likeCount = 0;
let dislikeCount = 0;
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.emit("send-like", likeCount);

  socket.on("like", () => {
    likeCount++;
    io.emit("send-like", likeCount);
  });

  socket.on("unlike", () => {
    if (likeCount > 0) {
      likeCount--;
      io.emit("send-like", likeCount);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
  
  // Thêm sự kiện cho dislike
  socket.on("dislike", () => {
    dislikeCount++;
    io.emit("send-dislike", dislikeCount);
  });

  socket.on("undislike", () => {
    if (dislikeCount > 0) {
      dislikeCount--;
      io.emit("send-dislike", dislikeCount);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// BE sẽ nhận event từ FE client 


// define middlewear để public hình ra ngoài 
app.use(express.static("."));

//thêm middleware để đọc data json
app.use(express.json());

//thêm middleware để đọc cookie từ request
app.use(cookieParser());

//import rootRoutes
app.use(rootRoutes);

// hello
app.get(`/test`,(req,res) => {
  res.send("hellooooooo");
});

//demo get query từ URL
app.get(`/test-query`, (req,res) => {
      let query =req.query;
      res.send(query);
});

// demo get header from req
app.get(`/test-header`, (req,res) => {
  let headers =req.headers;
  res.send(headers);
});

server.listen(8080,() => {
  console.log("Server online at port 8080");
});

