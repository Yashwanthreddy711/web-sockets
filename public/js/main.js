const socket=io('/');

socket.on('connect',()=>{
    console.log("Connected to server"); 
    console.log(socket.id);
})