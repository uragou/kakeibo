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
    //console.log(req);
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
        if(path == "./sub/index.js"){
            sqladd(path,res,data);
        }else{
            res.end(data);
        }
        console.log("転送");
    });
}

function sqladd(path,res,data){
    //mysqlからのデータ取得したい
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
        let objname;
        let objnum;

        res.write ("\n let name =[]; \n let num =[];");
        for(let lop=0; lop < results.length ;lop++){
            objname = "\n name[" + lop + "] = \"" + results[lop].name + "\";";
            objnum = "\n num[" + lop + "] = " + results[lop].kane + ";";
            console.log(objname);
            console.log(objnum);
            
            res.write(objname);
            res.write(objnum);
        }
        res.write(data);
        res.end();
    });
}