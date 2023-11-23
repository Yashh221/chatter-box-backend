import express, { Express } from "express";
import dotenv from 'dotenv'
import path = require("path");
import connectDB from "./config/db";
import { router } from './routes/userRoutes'
import { notFound , errorHandler } from "./middlewares/errorMiddleware";
import chatRouter from "./routes/chatRoutes";
import messageRouter from "./routes/messageRoutes";
import { Server, Socket } from "socket.io";
import { User } from "./models/userModel";
import cors from 'cors'
dotenv.config({path:path.resolve(__dirname, './.env') })

connectDB();

const app : Express = express();
const PORT = process.env.PORT || 9000;
const server = app.listen(PORT,()=>{
    console.log(`Port is listening at ${PORT}`)
});

const io = new Server(server,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:5173"
    }
});
io.on("Connection",(socket : Socket)=>{
    console.log("connected to socket.io");
    socket.on("setup",(userData)=>{
        socket.join(userData._id);
        socket.emit("connected");
    });
    socket.on('join chat',(room)=>{
        socket.join(room);
        console.log("User joined room " + room)
    });

    socket.on('typing',(room)=>{
        socket.in(room).emit("typing");
    })
    socket.on('stop typing',(room)=>{
        socket.in(room).emit("stop typing");
    })

    socket.on('new message',(newMessageReceived)=>{
        const chat = newMessageReceived.chat;
        if(!chat.user)
        {
            return console.log('chat.user not defined');
        }

        chat.user.forEach( (usr : User)   =>{
            if(usr._id == newMessageReceived.sender._id) return;
            socket.in(usr._id).emit("message received",newMessageReceived
            );
        })
    });
    socket.off("setup",(userData)=>{
        console.log("User Disconnected")
        socket.leave(userData._id)
    })
}),
app.use(express.json())
app.use(cors())
app.use('/api/user',router)
app.use('/api/chats',chatRouter)
app.use('/api/message',messageRouter)
app.use(notFound)
app.use(errorHandler)