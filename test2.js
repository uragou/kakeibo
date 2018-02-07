const socket = io.connect('http://localhost:3000', {
  'sync disconnect on unload': true
});
var socket = io();

socket.on('message',ukeru);

function ukeru(data){
    let json = JSON.parse(data);
    console.log(json);
}
