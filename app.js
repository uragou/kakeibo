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
    if(req.method == "GET"){
        if(req.url == "/"){
            res.writeHead(200,{"Content-Type": "text/html"});
            Sfile("./index.html",res);
        }else if(req.url == "/sub/index.js"){
            res.writeHead(200,{"Content-Type": "text/javascript"});
            Sfile("./sub/index.js",res);
        }else if(req.url == "/sub/zougen.js"){
            res.writeHead(200,{"Content-Type": "text/javascript"});
            Sfile("./sub/sql.js",res);
        }
        else if(req.url == "/favicon.ico"){
            console.log("ない");
        }
    }else if(req.method == "POST"){
        console.log(req);
    }

}

function Sfile(path,res){
    fs.readFile(path,"UTF-8",function(err ,data){
        if(err){
            console.log("------err------");
            console.log(err);
        }
        if(path == "./sub/sql.js"){
            sqladd(path,res,data);
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
    });
    connection.query('select * from zougen order by id desc limit 10;;', function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        res.write ("\n let zouid =[]; \n let zoubunrui =[];\n let zoubasyo =[];\n let zoukane =[];");
        res.write ("\n let zousyurui =[]; \n let zoukomento =[];\n let zoutime =[];");
        for(let lop=0; lop < results.length ;lop++){
            res.write("\n zouid[" + lop + "] = \"" + results[lop].id + "\";");
            res.write("\n zoubunrui[" + lop + "] = \"" + results[lop].bunrui + "\";");
            res.write("\n zoubasyo[" + lop + "] = \"" + results[lop].basyo + "\";");
            res.write("\n zoukane[" + lop + "] = \"" + results[lop].kane + "\";");
            res.write("\n zousyurui[" + lop + "] = \"" + results[lop].syurui + "\";");
            if(!results[lop].komento){
                res.write("\n zoukomento[" + lop + "] = \"\";");
            }else{
                res.write("\n zoukomento[" + lop + "] = \"" + results[lop].komento + "\";");
            }
            //何故かデータベースの値と家計簿に送った値の2つとは異なる日付になっている？
            //console.log(results[lop].time);
            res.write("\n zoutime[" + lop + "] = \"" + results[lop].time.getFullYear() + "年 " + (results[lop].time.getMonth()+1) + "月 " + results[lop].time.getDate() + "日" + "\";");
        }
    });
    connection.query('select * from idou order by id desc limit 10;', function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        res.write ("\n let idouid =[]; \n let idoukane =[];\n let idoumae =[];");
        res.write ("\n let idouato =[]; \n let idoukomento =[];\n let idoutime =[];");
        for(let lop=0; lop < results.length ;lop++){
            res.write("\n idouid[" + lop + "] = \"" + results[lop].id + "\";");
            res.write("\n idoukane[" + lop + "] = \"" + results[lop].kane + "\";");
            res.write("\n idoumae[" + lop + "] = \"" + results[lop].mae + "\";");
            res.write("\n idouato[" + lop + "] = \"" + results[lop].ato + "\";");
            if(!results[lop].komento){
                res.write("\n idoukomento[" + lop + "] = \"\";");
            }else{
                res.write("\n idoukomento[" + lop + "] = \"" + results[lop].komento + "\";");
            }
            //何故かデータベースの値と家計簿に送った値の2つとは異なる日付になっている？
            //console.log(results[lop].time);
            res.write("\n idoutime[" + lop + "] = \"" + results[lop].time.getFullYear() + "年 " + (results[lop].time.getMonth()+1) + "月 " + results[lop].time.getDate() + "日" + "\";");
        }
        res.write(data);
        res.end();
    });
}
