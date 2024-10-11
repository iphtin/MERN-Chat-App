import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors"
import multer from "multer";
import  { fileURLToPath } from "url"
import path from "path";
import dotenv from "dotenv";
import { updateRegister } from "./controllers/auth.js";
import authRoutes from "./routes/auth.js"
import MsgRoutes from "./routes/messages.js"
import usersRoutes from "./routes/users.js"
import { addMessage } from "./controllers/messages.js";
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}))
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}))
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "public/assets");
    },
    filename: function (req, file, cb){
        cb(null, file.originalname)
    }
})

const upload = multer({ storage });


app.put("/auth/update", upload.single("picture"), updateRegister);
app.post('/messages/addmsg', upload.single('image'), addMessage); 

// ROUTER SET UP
app.use("/auth", authRoutes);
app.use("/messages", MsgRoutes);
app.use("/users", usersRoutes);

// mongo SET UP

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

  const PORT = process.env.PORT || 6001;
  const server = app.listen(PORT, () =>
      console.log(`Server started on ${PORT}`)
  );
  
  const io = new Server(server, {
      cors: {
          origin: "http://localhost:3000",
          credentials: true,
      },
  });
  
  global.onlineUsers = new Map();
  
  io.on("connection", (socket) => {
      global.chatSocket = socket;
      
      // When a user connects, update their status
      socket.on("add-user", (userId) => {
          onlineUsers.set(userId, {
              online: true,
              socketId: socket.id,
              lastSeen: new Date()
          });
  
          io.emit("user-status", {
              userId: userId,
              online: true
          });
      });
  
      // Get the status of a user
      socket.on("get-user-status", (requestedUserId) => {
          const status = onlineUsers.get(requestedUserId) || { 
              online: false, 
              lastSeen: null 
          };
          
          socket.emit("user-status", {
              userId: requestedUserId,
              online: status.online,
              lastSeenAt: status.lastSeen
          });
      });
  
      // Handle sending messages
      socket.on("send-msg", (data) => {
        console.log("Online Users Map:", onlineUsers); // Log the map
        console.log("SendMsg", data);
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket && sendUserSocket.socketId) {
          io.to(sendUserSocket.socketId).emit("msg-recieve", {
            message: data.message,
            image: data.image,
            sentAt: data.sentAt
          });
        } else {
          console.log('User not found or offline:', data.to);
        }
      });      
  
      // When a user disconnects, update their status
      socket.on('disconnect', () => {
          const userId = Array.from(onlineUsers.entries()).find(
              ([key, value]) => value.socketId === socket.id
          )?.[0];
  
          if (userId) {
              onlineUsers.set(userId, {
                  online: false,
                  lastSeen: new Date()
              });
  
              io.emit("user-status", {
                  userId: userId,
                  online: false,
                  lastSeenAt: new Date()
              });
          }
          console.log('user disconnected');
      });
  
      // When a user logs out, update their status
      socket.on("logout", () => {
          const userId = Array.from(onlineUsers.entries()).find(
              ([key, value]) => value.socketId === socket.id
          )?.[0];
  
          if (userId) {
              onlineUsers.set(userId, {
                  online: false,
                  lastSeen: new Date()
              });
              
              io.emit("user-status", {
                  userId: userId,
                  online: false,
                  lastSeenAt: new Date()
              });
          }
      });
  });
  