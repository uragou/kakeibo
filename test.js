//https://socket.io/get-started/chat/
var app = require('express')();
var http = require('http').Server(app);
var socket = require('socket.io')(http);
let port = 55555;


http.listen(port);

socket.on('connection', saisyo);


function saisyo(){

    var mysql = require('mysql');
 
    let dbConfig = {
        host: 'localhost',
        database: 'kakeibo_db',
        user: 'kakeibo',
        password: 'kakeibokey'
    };
    let connection = mysql.createConnection(dbConfig);
    connection.connect();

    var query = connection.query('select name,kane from zaisan;', function (err, results) {
        console.log('--- results ---');
        console.log(results);

        for(let lop=0; lop < results.length ;lop++){
            let obj = {
                type: 'st',
                name: results[lop].name,
                num: results[lop].kane
            };
            let json = JSON.stringify(obj);

            socket.emit('message',json);
        }
        
        console.log(results[0].name);
    });


    socket.on('disconnect', setudan);
}

function setudan(){
    console.log('user disconnected');
}

    