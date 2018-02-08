var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = 55555;

//app.use(express.static('public'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
app.use('/', express.static('sub'));

http.listen(port, function(){
    console.log('listening on *:55555');
});

//接続
io.on('connection', function(socket){
    console.log('a user connected');

    //mysqlからのデータ取得したい
    console.log("開始");
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

            socket.emit('nowdata',json);
                console.log(json);
        }
        
        console.log(results[0].name);
    });

    //切断
    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
    
});

/*
 //https://socket.io/get-started/chat/
 var app = require('express')();
 var http = require('http').Server(app);
 var socket = require('socket.io')(http);
 let port = 55555;
 
 
-http.listen(port);
-
-socket.on('connection', saisyo);
-
-
-function saisyo(){
-
+http.listen(port,function(){
+     //mysqlからのデータ取得したい
+    console.log("開始");
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
+            console.log(json);
         }
         
         console.log(results[0].name);
     });
+});
 
+app.get('/', function(req, res){
+  res.sendFile(__dirname + '/test.html');
+});
 
-    socket.on('disconnect', setudan);
-}
+socket.on('connection',function(socket){
+
+    console.log('user connected');
+    //切断イベント
+    socket.on('disconnect',function(){
+        console.log('user disconnected');
+    });
+    socket.on('message',function(){
+        io.emit('message',"aaa");
+    });
+});
 
 function setudan(){
     console.log('user disconnected');
 }
*/