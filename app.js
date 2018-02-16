var http = require('http');
var fs   = require('fs');
var port = 55555;

let server = http.createServer();

server.listen(port, function(){
    console.log('listening on *:'+port);
});

//接続
server.on("request",getdata);

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
    }else if(req.url == "/sub/zougen.js"){
        res.writeHead(200,{"Content-Type": "text/javascript"});
        Sfile("./sub/zougen.js",res);
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
        }else if(path == "./sub/zougen.js"){
            zougenadd(path,res,data);
        }else{
            res.end(data);
        }
        console.log("転送");
    });
}

function sqladd(path,res,data){
    connection.query('select name,kane from zaisan;', function (err, results) {
        //console.log('--- results ---');
        //console.log(results);

        res.write ("\n let name =[]; \n let num =[];");
        for(let lop=0; lop < results.length ;lop++){
            
            res.write("\n name[" + lop + "] = \"" + results[lop].name + "\";");
            res.write("\n num[" + lop + "] = " + results[lop].kane + ";");
        }
        res.write(data);
        res.end();
    });
}
/*
id int AUTOINCREMENT　　主キー
bunrui varchar 8
basyo varchar 32
kane int
syurui varchar 32
komento varchar 255;
time date
*/



//途中！！！
function zougenadd(path,res,data){
    connection.query('select * from zougen;', function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        res.write ("\n let id =[]; \n let bunrui =[];\n let basyo =[];\n let kane =[];");
        res.write ("\n let syurui =[]; \n let komento =[];\n let time =[];");
        for(let lop=0; lop < results.length ;lop++){
            res.write("\n id[" + lop + "] = \"" + results[lop].id + "\";");
            res.write("\n bunrui[" + lop + "] = \"" + results[lop].bunrui + "\";");
            res.write("\n basyo[" + lop + "] = \"" + results[lop].basyo + "\";");
            res.write("\n kane[" + lop + "] = \"" + results[lop].kane + "\";");
            res.write("\n syurui[" + lop + "] = \"" + results[lop].syurui + "\";");
            if(results[lop].komento == "null"){
                res.write("\n komento[" + lop + "] = \" \";");
            }else{
                res.write("\n komento[" + lop + "] = \"" + results[lop].komento + "\";");
            }
            console.log(results[lop].time);
            res.write("\n time[" + lop + "] = \"" + results[lop].time + "\";");
        }
        res.write(data);
        res.end();
    });
}