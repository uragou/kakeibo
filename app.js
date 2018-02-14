var http = require('http');
var fs   = require('fs');
var port = 55555;

let server = http.createServer();

server.listen(port, function(){
    console.log('listening on *:'+port);
});

//接続
server.on("request",getdata);

function getdata(req,res){
    console.log(req);
    console.log("---------------");
    //console.log(res);
    console.log(req.url);
    if(req.url == "/"){
        res.writeHead(200,{"Content-Type": "text/html"});
        Sfile("./index.html",res);
    }else if(req.url == "/sub/index.js"){
        res.writeHead(200,{"Content-Type": "text/javascript"});
        Sfile("./sub/index.js",res);
    }
}


function Sfile(path,res){
    fs.readFile(path,"UTF-8",function(err ,data){
        if(err){
            console.log("------err------");
            console.log(err);
        }
        res.end(data);
        console.log("転送");
    });
}

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
    //console.log('--- results ---');
    //console.log(results);

    for(let lop=0; lop < results.length ;lop++){
        let obj = {
            type: 'st',
            name: results[lop].name,
            num: results[lop].kane
        };
    };
});