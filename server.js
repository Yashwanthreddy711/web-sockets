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

io.on('connection',(socket)=>{
    console.log("New user connected",socket.id);
    // socket.on('message',(msg)=>{
    //     console.log(msg);
    //     io.emit('message',msg);
    // });
});

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});