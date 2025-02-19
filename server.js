
const express=require('express');

const http=require('http');

const PORT=process.env.PORT || 3000;
const app=express();
const server=http.createServer(app); // create a server
const io=require('socket.io')(server); // create a socket server
app.use(express.static("public")); // serve static files to external sources
app.get('/',(req,res)=>{
    res.send(__dirname+"/public/index.html");
});
let connectedUsers=[];

io.on('connection',(socket)=>{
    connectedUsers.push(socket.id);
    socket.on('pre-offer',(data)=>{
       const {callType,calleePersonalCode}=data;
         const connectedUser=connectedUsers.find(socketId=>socketId===calleePersonalCode);

         if(connectedUser){
             const data={
                 callType,
                 callerSocketId:socket.id
             }
             io.to(calleePersonalCode).emit('pre-offer',data);
            }
            else{

                const data={
                    preOfferAnswer:"CALLEE_NOT_FOUND",
    
                }
    
                io.to(socket.id).emit('pre-offer-answer',data);
    
            }

    });
    socket.on('pre-offer-answer',(data)=>{
        console.log("pre-offer-answer came");
        console.log(data);
        const {callerSocketId,preOfferAnswer}=data;
        const connectedUser=connectedUsers.find(socketId=>socketId===callerSocketId);
        if(connectedUser){
            io.to(callerSocketId).emit('pre-offer-answer',data);
        }
        
    });	
    socket.on('webRTC-signaling',(data)=>{
        const {connectedUserSocketId}=data;
        const connectedUser=connectedUsers.find(socketId=>socketId===connectedUserSocketId);
        if(connectedUser){
            io.to(connectedUserSocketId).emit('webRTC-signaling',data); 
        }
    });
    socket.on('disconnect',()=>{
        connectedUsers=connectedUsers.filter(socketId=>socketId!==socket.id);
    });

    
});

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});