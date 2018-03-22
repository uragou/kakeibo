
var http = require('http');
var fs   = require('fs');
var port = 55555;
let server = http.createServer();

server.listen(port, function(){
    console.log('listening on *:'+port);
});
let date = new Date();
let hdate = "";

if(date.getMonth()+1 < 10){
    hdate = date.getFullYear()+'0'+ (date.getMonth()+1) ;
}else{
   hdate = date.getFullYear()+''+ (date.getMonth()+1) ;
}
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
    connection.query('SELECT * FROM zougen'+ hdate +' ORDER BY id DESC LIMIT 10;', function (err, results) {
        if(err){
            CreateTable();
            UpdateTables();
        }
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
        }else if(req.url == "/sub/sql.js"){
            res.writeHead(200,{"Content-Type": "text/javascript"});
            Sfile("./sub/sql.js",res);
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
        Sfile("./index.html",res);
    }

}

function postshori(req,res){
    var postdata="";
    let bunkatu = [];
    req.on("data",function(data){
        postdata += data;
    });
    req.on("end",function(){
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
                        return zaisanAdd("in",bunkatu[3],bunkatu[1]);
                    },
                    reject => {
                        console.log(reject);
                    }

                ).then(
                    resolve =>{
                        console.log(resolve);
                        idouadd(bunkatu);
                    },
                    reject => {
                        console.log(reject);
                    }

                );
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
        connection.query("SELECT id,kane FROM zaisan WHERE name='" + basyo + "';", function (err, results) {
            //console.log('--- results ---');
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
            insertData = "UPDATE zaisan SET kane =" + bufnum + " WHERE id=" + results[0].id + ";";

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
        if(path == "./sub/sql.js"){
            sqladd(path,res,data);
        }else{
            res.end(data);
        }
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

function sqladd(path,res,data){
    connection.query('SELECT name,kane FROM zaisan;', function (err, results) {
        //console.log('--- results ---');
        //console.log(results);

        res.write ("\n let name =[]; \n let num =[];");
        for(let lop=0; lop < results.length ;lop++){
            
            res.write("\n name[" + lop + "] = \"" + results[lop].name + "\";");
            res.write("\n num[" + lop + "] = " + results[lop].kane + ";");
        }
    });
    connection.query('SELECT * FROM zougen'+ hdate +' ORDER BY id DESC LIMIT 10;', function (err, results) {
        //console.log('--- results ---');
        //console.log(results);

        res.write ("\n let zouid =[]; \n let zoubunrui =[];\n let zoubasyo =[];\n let zoukane =[];");
        res.write ("\n let zousyurui =[]; \n let zoukomento =[];\n let zoutime =[];");
        for(let lop=0; lop < results.length ;lop++){
            res.write("\n zouid[" + lop + "] = \"" + results[lop].id + "\";");
            res.write("\n zoubunrui[" + lop + "] = \"" + results[lop].bunrui + "\";");
            res.write("\n zoubasyo[" + lop + "] = \"" + results[lop].basyo + "\";");
            res.write("\n zoukane[" + lop + "] = " + results[lop].kane + ";");
            res.write("\n zousyurui[" + lop + "] = \"" + results[lop].syurui + "\";");
            if(!results[lop].komento){
                res.write("\n zoukomento[" + lop + "] = \"\";");
            }else{
                let komentoHTML = forHTML(results[lop].komento);
                res.write("\n zoukomento[" + lop + "] = \"" + komentoHTML + "\";");
            }
            //何故かデータベースの値と家計簿に送った値の2つとは異なる日付になっている？
            //console.log(results[lop].time);
            res.write("\n zoutime[" + lop + "] = \"" + results[lop].time.getFullYear() + "年 " + (results[lop].time.getMonth()+1) + "月 " + results[lop].time.getDate() + "日" + "\";");
        }
    });
    connection.query('SELECT * FROM idou'+ hdate +' ORDER BY id DESC LIMIT 10;', function (err, results) {
        //console.log('--- results ---');
        //console.log(results);

        res.write ("\n let idouid =[]; \n let idoukane =[];\n let idoumae =[];");
        res.write ("\n let idouato =[]; \n let idoukomento =[];\n let idoutime =[];");
        for(let lop=0; lop < results.length ;lop++){
            res.write("\n idouid[" + lop + "] = \"" + results[lop].id + "\";");
            res.write("\n idoukane[" + lop + "] = " + results[lop].kane + ";");
            res.write("\n idoumae[" + lop + "] = \"" + results[lop].mae + "\";");
            res.write("\n idouato[" + lop + "] = \"" + results[lop].ato + "\";");
            if(!results[lop].komento){
                res.write("\n idoukomento[" + lop + "] = \"\";");
            }else{
                let komentoHTML = forHTML(results[lop].komento);
                res.write("\n idoukomento[" + lop + "] = \"" + komentoHTML + "\";");
            }
            //何故かデータベースの値と家計簿に送った値の2つとは異なる日付になっている？
            //console.log(results[lop].time);
            res.write("\n idoutime[" + lop + "] = \"" + results[lop].time.getFullYear() + "年 " + (results[lop].time.getMonth()+1) + "月 " + results[lop].time.getDate() + "日" + "\";");
        }
        res.write(data);
        res.end();
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