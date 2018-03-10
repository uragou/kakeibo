
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


//http://m-miya.blog.jp/archives/1035999721.html
function forsql(data){
    //replace自体が一回しか実行されない g付ければok
    data = data.replace(/&/g,'a');
    data = data.replace(/'/g,"a");
    data = data.replace(/`/g,'a');
    data = data.replace(/"/g,'a');
    data = data.replace(/</g,'a');
    data = data.replace(/>/g,'a');
    data = data.replace(/_/g,'a');
	return data;
}

function forHTML(data){
    data = data.replace(/&/g,'a');
    data = data.replace(/'/g,"a");
    data = data.replace(/`/g,'a');
    data = data.replace(/"/g,'a');
    data = data.replace(/</g,'a');
    data = data.replace(/>/g,'a');
    data = data.replace(/_/g,'a');
	return data;
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
        }else if(req.url == "/favicon.ico"){
            console.log("ない");
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
        bunkatu=postdata.split("&");

        for(let lop=0;lop<bunkatu.length;lop++){
            let bunkatuiti,taisyo = "";
            //長いほうのデコードだと特殊記号も変換できる
            taisyo = decodeURIComponent(bunkatu[lop]);
            bunkatuiti = taisyo.indexOf("=");
            //そのままだと = も含まれた
            bunkatu[lop] = taisyo.substr(bunkatuiti+1);
        }
        bunkatu[4] = forsql(bunkatu[4]);
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

    let insertData = "INSERT INTO zougen (bunrui,basyo,kane,syurui,komento,time) VALUES('" + bunkatu[0] + "','" + bunkatu[1] + "'," + bunkatu[2] + ",'" + bunkatu[3] + "','" + bunkatu[4] + "', DATE(NOW()) );";
    connection.query(insertData, function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        //console.log(err);
    });
}

function idouadd(bunkatu){
    let insertData = "INSERT INTO idou (kane,mae,ato,komento,time) VALUES(" + bunkatu[1] + ",'" + bunkatu[2] + "','" + bunkatu[3] + "','" + bunkatu[4] + "', DATE(NOW()) );";
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
    connection.query('SELECT * FROM zougen ORDER BY id DESC LIMIT 10;', function (err, results) {
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
    connection.query('SELECT * FROM idou ORDER BY id DESC LIMIT 10;', function (err, results) {
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
