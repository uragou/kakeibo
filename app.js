//httpリクエストを受け付ける
var http = require('http');
var fs   = require('fs');
//ポート番号は55555
var port = 55555;
let server = http.createServer();
//待ち受ける
server.listen(port, function(){
    console.log('listening on *:'+port);
});

//今日の日付を取得、1月ごとのデータを格納するのに使用する。
let date = new Date();
let hdate = "";
let NowMaxzougen;
let NowMaxidou;

//new Dateは0～11で月を返すので01~12に修正している。
if(date.getMonth()+1 < 10){
    hdate = date.getFullYear()+'0'+ (date.getMonth()+1) ;
}else{
   hdate = date.getFullYear()+''+ (date.getMonth()+1) ;
}
//接続
server.on("request",getdata);
         
//mysqlからのデータ取得する。dbConfigはデータベースにアクセスするためのオブジェクト
var mysql = require('mysql');
let dbConfig = {
    host: 'localhost',
    database: 'kakeibo_db',
    user: 'kakeibo',
    password: 'kakeibokey'
};
let connection = mysql.createConnection(dbConfig);
connection.connect();
init();

//QUOTEにより変なデータがSQLにいかないようにできるが、連続の"""だと失敗(データは挿入されない)

function forHTML(data){

    //replace自体が一回しか実行されない g付ければok
    //配列の感じじゃなく、本当に文字数
    data = data.substr(1,data.length-2);
    data = data.replace(/&/g,'&amp;');  
    data = data.replace(/'/g,"&#x27;");
    data = data.replace(/`/g,'&#x60;');
    data = data.replace(/"/g,'&quot;');
    data = data.replace(/</g,'&lt;');
    data = data.replace(/>/g,'&gt;');
    data = data.replace(/ /g,'&nbsp;');
	return data;
}

//テーブルがあるかどうか作成
//というより、月日が変わった時の処理
function init(){
    connection.query('SELECT * FROM zaisan', function (err, results) {
        if(err){
            Inittable();
        }
    });
    connection.query('SELECT * FROM zougen'+ hdate +' ORDER BY id DESC LIMIT 10;', function (err, results) {
        if(err){
            CreateTable();
            UpdateTables();
        }
    });
}

function Inittable(){
    connection.query("CREATE TABLE kakeibo_db.zaisan (name VARCHAR(20) NOT NULL PRIMARY KEY,kane INT NOT NULL);", function(err,results){
        console.log("財産データベース作成中");
    });
    connection.query("CREATE TABLE kakeibo_db.zaihistory (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(20) NOT NULL PRIMARY KEY,kane INT NOT NULL);", function(err,results){
        console.log("財産履歴データベース作成中");
    });
}


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
        }else if(req.url == "/sub/async.js"){
            res.writeHead(200,{"Content-Type": "text/javascript"});
            Sfile("./sub/async.js",res);
        }else if(req.url == "/sub/index.css"){
            res.writeHead(200,{"Content-Type": "text/css"});
            Sfile("./sub/index.css",res);
        }else if(req.url == "/sub/back.png"){
            res.writeHead(200,{"Content-Type": "image/png"});
            BSfile("./sub/back.png",res);
        }else if(req.url == "/sub/aikon.ico"){
            res.writeHead(200,{"Content-Type": "image/x-icon"});
            BSfile("./sub/aikon.ico",res);
        }else{
            res.writeHead(200,{"Content-Type": "image/png"});
            BSfile("./sub/sonota.png",res);
        }
    }else if(req.method == "POST"){
        //上の統合しようよ
        postshori(req,res);
    }

}

function SQLjson(path,res,code,zou,ido,vec){
    //console.log("ここまで");
    console.log(code,zou,ido,vec);
    res.writeHead(200,{"Content-Type": "application/json"});
    let Jstatus;
    if(code === "default"){
        Jstatus = "default";
    }else{
        Jstatus = "next";
    }

    var Json =  {
        "status" : Jstatus
    }
    connection.query('SELECT name,kane FROM zaisan;', function (err, results) {
        var Jdata = new Object();
        Jdata.zaisan = [];
        for(let lop=0; lop < results.length ;lop++){
            Jdata.zaisan[lop] = {
                "name" : results[lop].name,
                "num" : results[lop].kane
            }
        }
        Object.assign(Json,Jdata);
    });

    let ZougenQuery = "";
    let IdouQuery = "";
    if(code === "zougen"){
        if(vec === "down" && zou - 10 > 0){
            zou = parseInt(zou) - 10;
        }else if(vec === "up"){
            //プラス方向はどうせWHEREだから大丈夫
            zou = parseInt(zou) + 10;
        }
    }else if(code === "idou"){
        if(vec === "down" && ido - 10 > 0){
            ido = parseInt(ido) - 10;
        }else if(vec === "up"){
            //プラス方向はどうせWHEREだから大丈夫
            ido = parseInt(ido) + 10;
        }
    }
    
    if(code === "default"){
        ZougenQuery = 'SELECT * FROM zougen'+ hdate +' ORDER BY id DESC LIMIT 10;';
        IdouQuery = 'SELECT * FROM idou'+ hdate +' ORDER BY id DESC LIMIT 10;';
    }else{
        ZougenQuery = 'SELECT * FROM zougen'+ hdate +' WHERE id <= '+ zou +'  ORDER BY id DESC LIMIT 10';
        IdouQuery = 'SELECT * FROM idou'+ hdate +' WHERE id <= '+ ido +'  ORDER BY id DESC LIMIT 10';
    }

    connection.query(ZougenQuery, function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        var Jdata = new Object();
        //もしテーブルが空なら
        if(results.length === 0){
            Jdata.zougen = "今月のデータはありません";
        }else{
            Jdata.zougen=[];
            NowMaxzougen = results[0].id;
            for(let lop=0; lop < results.length ;lop++){
                let komentoHTML = forHTML(results[lop].komento);
                let jikan = results[lop].time.getFullYear() + "年 " + (results[lop].time.getMonth()+1) + "月 " + results[lop].time.getDate() + "日";
                Jdata.zougen[lop] = {
                    "id" : results[lop].id,
                    "bunrui" : results[lop].bunrui,
                    "basyo" : results[lop].basyo,
                    "kane" : results[lop].kane,
                    "syurui" : results[lop].syurui,
                    "komento" : komentoHTML,
                    "time" : jikan
                }
            }
        }
        Object.assign(Json,Jdata);
    });
    connection.query(IdouQuery, function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        var Jdata = new Object();
        //もしテーブルが空なら
        if(results.length === 0){
            Jdata.idou = "今月のデータはありません";
        }else{
            Jdata.idou = [];
            NowMaxidou = results[0].id;
            for(let lop=0; lop < results.length ;lop++){
                let komentoHTML = forHTML(results[lop].komento);
                let jikan = results[lop].time.getFullYear() + "年 " + (results[lop].time.getMonth()+1) + "月 " + results[lop].time.getDate() + "日";
                Jdata.idou[lop] = {
                    "id" : results[lop].id,
                    "mae" : results[lop].mae,
                    "ato" : results[lop].ato,
                    "kane" : results[lop].kane,
                    "komento" : komentoHTML,
                    "time" : jikan
                }
            }
        }
        Object.assign(Json,Jdata);
        Json = JSON.stringify(Json);
        //console.log(Json);
        res.write(Json);
        res.end();
    });
}


function postshori(req,res){
    var postdata="";
    let bunkatu = [];
    req.on("data",function(data){
        postdata += data;
    });
    req.on("end",function(){
        console.log(postdata);
        if (postdata === "begin"){
            res.writeHead(200,{"Content-Type": "application/json"});
            Sfile("./sub/index.json",res);
        }else if (postdata === "default"){
            SQLjson("./sub/Sdata.json",res,"default",0,0,"default");
        }else if(postdata.substr(0,4) === "ajax"){
            let splitdata = postdata.split(",");
            SQLjson("./sub/Sdata.json",res,splitdata[1],splitdata[2],splitdata[3],splitdata[4]);
        }else{
            console.log(bunkatu);
            bunkatu=postdata.split("&");

            for(let lop=0;lop<bunkatu.length;lop++){
                let bunkatuiti,taisyo = "";
                //長いほうのデコードだと特殊記号も変換できる
                //ただし半角スペースが+になったからreplace
                //data = data.replace(/</g,'&lt;');
                bunkatu[lop] = bunkatu[lop].replace(/\+/g," ");
                taisyo = decodeURIComponent(bunkatu[lop]);
                bunkatuiti = taisyo.indexOf("=");
                //そのままだと = も含まれた
                bunkatu[lop] = taisyo.substr(bunkatuiti+1);
            }
            // bunkatu[0]は分類
            if( bunkatu[0] == "移動"){
                if(bunkatu[2] != bunkatu[3]){
                    zaisanAdd("out",bunkatu[2],bunkatu[1]).then(
                        resolve =>{
                            console.log(resolve);
                            zaisanAdd("in",bunkatu[3],bunkatu[1]).then(
                                resolve =>{
                                    console.log(resolve);
                                    idouadd(bunkatu);
                                },
                                reject => {
                                    console.log(reject);
                                }
        
                            );
                        },
                        reject => {
                            console.log(reject);
                        }

                    )
                }else{
                    console.log("同じじゃん");
                }
            }else{
                var send = "";
                if(bunkatu[0] == "収入"){
                    send = "in";
                }else{
                    send = "out";
                }

                zaisanAdd(send,bunkatu[1],bunkatu[2]).then(
                    //アロー演算子ってマジで何なんだよ
                    resolve =>{
                        console.log(resolve);
                        zougenAdd(bunkatu);
                    },
                    reject => {
                        console.log(reject);
                    }

                );
            }

            console.log(postdata);
            console.log(bunkatu);
            Sfile("./index.html",res);
        }
    });
    
}

function zougenAdd(bunkatu){

    let insertData = "INSERT INTO zougen"+ hdate +"  (bunrui,basyo,kane,syurui,komento,time) VALUES('" + bunkatu[0] + "','" + bunkatu[1] + "'," + bunkatu[2] + ",'" + bunkatu[3] + "',QUOTE('" + bunkatu[4] + "'), DATE(NOW()) );";
    connection.query(insertData, function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        //console.log(err);
    });
}

function idouadd(bunkatu){
    let insertData = "INSERT INTO idou"+ hdate +" (kane,mae,ato,komento,time) VALUES(" + bunkatu[1] + ",'" + bunkatu[2] + "','" + bunkatu[3] + "',QUOTE('" + bunkatu[4] + "'), DATE(NOW()) );";
    connection.query(insertData, function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        //console.log(err);
    });
}

function zaisanAdd(io,basyo,num){
    // bunkatu[1]は場所
    return new Promise((resolve,reject)=>{
        var insertData;
        var bufnum;
        connection.query("SELECT * FROM zaisan WHERE name='" + basyo + "';", function (err, results) {
            //console.log('--- results ---');
            //console.log(results[0].name);
            //results[0].kaneは金額
            if(io == "in"){
                //console.log( parseInt(results[0].kane, 10)  + parseInt(num, 10));
                bufnum = results[0].kane + parseInt(num, 10);
                resolve("OK");
            }else if(io == "out"){
                //console.log(results[0].kane - parseInt(num, 10));
                if(  (parseInt(results[0].kane, 10)  - parseInt(num, 10)) < 0){
                    reject("金額がマイナスになるエラー\n");
                    return -1;
                }else{
                    bufnum = parseInt(results[0].kane, 10) - parseInt(num, 10);
                }
                resolve("OK");
            }
            insertData = "UPDATE zaisan SET kane =" + bufnum + " WHERE name = \"" + results[0].name + "\";";
            connection.query(insertData, function (err, results) {
                console.log('--- results ---');
                console.log(results);
                console.log(err);
            });
        });
    });
}

function Sfile(path,res){
    fs.readFile(path,"UTF-8",function(err ,data){
        if(err){
            console.log("------err------");
            console.log(err);
        }
        //./sub/sql.js 以外
        res.end(data);
        console.log("転送");
    });
}
function BSfile(path,res){
    fs.readFile(path,function(err ,data){
        if(err){
            console.log("------err------");
            console.log(err);
        }
        res.end(data);
        console.log("転送");
    });
}

function CreateTable(){
    let table = ["CREATE TABLE kakeibo_db.zougen" + hdate + " (id int AUTO_INCREMENT,bunrui varchar(8),basyo varchar(32),kane int,syurui varchar(32),komento varchar(255),time date,primary key(id));",
                "CREATE TABLE kakeibo_db.idou" + hdate + " (id int AUTO_INCREMENT,kane int,mae varchar(32),ato varchar(32),komento varchar(255),time date,primary key(id));"];
    for(let lop = 0; lop < 2 ;lop++){
        connection.query(table[lop], function (err, results) {
            console.log("新テーブル作成"+ (lop+1) + "/2");
        });
    }
    console.log("作成終了");
    
}

function UpdateTables(){
    let query = "SELECT * FROM zaisan;";
    connection.query(query, function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        for(let lop=0; lop < results.length ;lop++){
            AddData("INSERT INTO zaihistory (zaisanID,name,kane,time) VALUES( "+ results[lop].id +",'"+results[lop].name+"',"+results[lop].kane+",DATE(NOW()) );");
        }
    });
}

function AddData(NewData){
    console.log(NewData);
    connection.query(NewData, function (err, results) {
        console.log(err);
    });
}