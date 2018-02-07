const socket = io.connect('http://localhost:55555', {
  'sync disconnect on unload': true
});

socket.on('message',ukeru);

function ukeru(data){
    let json = JSON.parse(data);
    console.log(json);
}