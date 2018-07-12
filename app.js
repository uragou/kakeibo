//httpリクエストを受け付ける

let http = require('http');
let fs   = require('fs');
let index = require('./sub/index.json');

//ポート番号は55555
let port = 55555;
let server = http.createServer();

//待ち受ける
server.listen(port, function(){
    console.log('listening on *:'+port);
});

//今日の日付を取得、1月ごとのデータを格納するのに使用する。
let date = new Date();
let hdate = "";
let Today = "";

//現在のデータを格納しておく
let Nzougen = new Array();
let Nidou = new Array();

//new Dateは0～11で月を返すので01~12に修正している。
//hdateはテーブルを作成するための年と月で、Todayは送信データを調べるための年、月、日
if(date.getMonth()+1 < 10){

    hdate = date.getFullYear()+'0'+ (date.getMonth()+1) ;
    Today =  date.getFullYear()+'0'+ (date.getMonth()+1) + (date.getDate());

}else{

   hdate = date.getFullYear()+''+ (date.getMonth()+1) ;
   Today =  date.getFullYear() + (date.getMonth()+1) + (date.getDate());

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

//始めに一度だけinit関数を呼ぶ
init();
//--------------------------------------------------------------------たまに動く関数たち---------------------------------------------------------------

/*  テーブルがあるかどうか作成
  というより、月日が変わった時の処理
  簡単なSQL文を送って、エラーが帰ってきたら各関数に移動してテーブルを作る
  時間があったら、ちゃんとエラー文の内容を見て動作させたい*/
function init(){
    init1().then(
        suc =>{
            //console.log(suc);
            return init2();
        },
        err =>{
            //console.log(err);
            return init2();
        }
    ).then(
        suc =>{
            //console.log(suc);
        }
    );
}

function init1(){
    return  new Promise( (resolve,reject) =>{
        connection.query('SELECT * FROM zaisan;', function (err, results) {
            if(err){
                //根本となるzaisanテーブルとzaihistoryテーブルの作成（通常は一度飲み）
                Inittable();
                reject("財産データがないので作成");
            }else{
                resolve("財産データあり");
            }
        });
    });
}

function init2(){
    return  new Promise( (resolve,reject) =>{
        connection.query('SELECT id FROM zougen'+ hdate +' ORDER BY id DESC;', function (err, results) {
            if(err){
                //zaisanテーブル以外の作成（月に一度、起動時に作成）
                CreateTable();
                UpdateTables();
                reject("今月のデータがないので作成");
            }else{
                resolve("今月のデータあり");
            }
        });
    });
}



/*  zaisanテーブルを作成し、各項目を残高0の状態で作成する*/
function Inittable(){
    InittableFunc1().then(
        suc => {
            console.log(suc);
            return InittableFunc2(index.Bzaisan[0]);
        },
        err => {
            console.log(err);
        }
    ).then(
        suc => {
            console.log(suc);
            return InittableFunc2(index.Bzaisan[1]);
        },
        err => {
            console.log(err);
        }
    ).then(
        suc => {
            console.log(suc);
            return InittableFunc2(index.Bzaisan[2]);
        },
        err => {
            console.log(err);
        }
    ).then(
        suc => {
            console.log(suc);
            return InittableFunc2(index.Bzaisan[3]);
        },
        err => {
            console.log(err);
        }
    ).then(
        suc => {
            console.log(suc);
            return InittableFunc3();
        },
        err => {
            console.log(err);
        }
    )
}

function InittableFunc1(){
    return new Promise( (resolve,reject) =>{
        connection.query("CREATE TABLE kakeibo_db.zaisan (name VARCHAR(20) NOT NULL PRIMARY KEY,kane INT NOT NULL);", function(err,results){
            if(!(err)){
                resolve("財産データベース作成中");
            }else{
                reject("財産データベース作成失敗 by InittableFunc1");
            }
        });
    });
}

function InittableFunc2(){
    return new Promise( (resolve,reject) =>{
        connection.query("INSERT INTO zaisan (name,kane) VALUES(\""+ data +"\",0);", function(err,results){
            if(!(err)){
                resolve("財産データ作成中");
            }else{
                reject("財産データ作成失敗 by InittableFunc2");
            }
        });
    });
}

function InittableFunc3(){
    return new Promise( (resolve,reject) =>{
        connection.query("CREATE TABLE kakeibo_db.zaihistory (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(20) NOT NULL PRIMARY KEY,kane INT NOT NULL);", function(err,results){
            if(!(err)){
                resolve("財産履歴作成中");
            }else{
                reject("財産履歴作成失敗 by InittableFunc3");
            }
        });
    });
}


/*  その月のzougenテーブルとidouテーブルを作成する
  作成するときは年と月を組み合わせた数字を先頭に置く*/
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

/*  月の最初の起動時にzaisanテーブルの各残高状態をzaihistoryテーブルに入れる
  いずれなにかするときに活用したい。*/
function UpdateTables(){
    let query = "SELECT * FROM zaisan;";
    connection.query(query, function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        for(let lop=0; lop < results.length ;lop++){
            AddData("INSERT INTO zaihistory (name,kane,time) VALUES( '"+results[lop].name+"',"+results[lop].kane+",DATE(NOW()) );");
        }
    });
}

/*  UpdateTablesの付属関数、各要素をzaihisutoryテーブルに入れる部分 */
function AddData(NewData){
    console.log(NewData);
    connection.query(NewData, function (err, results) {
        console.log(err);
    });
}

//---------------------------------------------------------メインの関数たち----------------------------------------------------------------

/*  GETでリクエストが来たら、内容に従ってファイルを送る
  要求が来たらヘッダー内容を書いて、テキストファイルならSfile関数
  バイナリデータならBSfile関数に移動する
  POSTの場合はpostshoriに移動する */
function getdata(req,res){
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
        switch(req.url){
            case "/sub/Sdata.json":
            case "/sub/index.json":
                ajaxsyori(req,res);
                break;
            case "/":

                postshori(req,res);
                break;
            default:
                console.log("ありえない要求");
                break;
        }
        
    }

}


/*  各ファイルを転送する時に使用する関数たち
  違いはテキストファイルを送るときに必要な "UTF-8" の部分くらい*/

function Sfile(path,res){
    fs.readFile(path,"UTF-8",function(err ,data){
        if(err){
            console.log("------err------");
            console.log(err);
        }
        res.end(data);
    });
}

function BSfile(path,res){
    fs.readFile(path,function(err ,data){
        if(err){
            console.log("------err------");
            console.log(err);
        }
        res.end(data);
    });
}


/*  POSTでリクエストが送られてきた場合に処理する関数
  Ajaxによる非同期通信と、家計簿データ書き込み時はこっちから要求される*/
  function postshori(req,res){
    var postdata="";
    let bunkatu = [];
    //データ受け取り部分
    req.on("data",function(data){
        postdata += data;
    });
    req.on("end",function(){
        console.log(postdata);
        //console.log(req);
        //送られてきたデータの先頭によって、何の要求かを判断する


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
        if( !(Henkan(bunkatu[5]) == "error") ){
            
            if( bunkatu[0] == "移動"){
                if(bunkatu[2] != bunkatu[3]){
                    //promiseじゃない気がする。書き直し
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

            }else if(bunkatu[0] == "収入" || bunkatu[0] == "支出"){
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
            }else{
                console.log("POST受信データがおかしい");
            }
        }else{
            console.log("日付関連のエラー");
        }

        //console.log(postdata);
        //console.log(bunkatu);
        Sfile("./index.html",res);
        
    });
    
}

function ajaxsyori(req,res){
    var postdata="";
    //データ受け取り部分
    req.on("data",function(data){
        postdata += data;
    });
    req.on("end",function(){
        //送られてきたデータの先頭によって、何の要求かを判断する
        postdata = JSON.parse(postdata);

        switch(postdata.status){
            case "begin":
                /*　bgein　は最初のリクエスト時にindex.jsonをAjaxで要求されたときの先頭
                既に作成されてあるため、そのまま送れる*/
                res.writeHead(200,{"Content-Type": "application/json"});
                Sfile("./sub/index.json",res);
                break;
            case "default":
                /*　default　は最初のリクエスト時にSdata.jsonをAjaxで要求されたときの先頭
                データベースからデータを取り出す際に使われるファイルであり、要求された時点で自分で生成するため
                SQL関連の処理をするSQLjsonに移動する*/
                SQLjson("./sub/Sdata.json",res,postdata);
                break;
            case "ajax":
                /*　ajax　は家計簿内の四つのボタンを押したときに送られるAjaxによる要求の先頭
                基本的な内容はdefaultと処理は同じだが、データベースから取り出す位置は押されたボタンの内容によって変わるため
                送られてきた内容を分割してSQLjsonに処理を移す*/
                SQLjson("./sub/Sdata.json",res,postdata);
                break;
            case "delete":
                Sakujo(postdata,res);
                break;
            default:
                console.log("謎のajaxが来たエラー by ajaxsyori");
                break;
        }
    });
}

function Sakujo(postdata,res){
    console.log(postdata);
    //id は数値のみなので数値以外ならエラー起こす
    let ID = parseInt(postdata.Target);
    if( (postdata.type === "zougen" || postdata.type === "idou") && (ID > 0) ){

        if( postdata.type === "zougen"){

            SakujoZo1(ID).then(
                suc =>{
                    return SakujoZo2(suc);
                },
                err =>{
                    console.log(err);
                    return ErrFunc();
                }
            ).then(
                suc =>{
                    return SakujoZo3(suc);
                },
                err =>{
                    console.log(err);
                    return ErrFunc();
                }
            ).then(
                suc =>{
                    return SakujoZo4(ID,postdata.type);
                },
                err =>{
                    console.log(err);
                    return ErrFunc();
                }
            ).then(
                suc =>{
                    //削除処理の前にjson作らないか心配
                    console.log(postdata.type + " テーブルのID= " + postdata.Target +" を削除する ");
                    SQLjson("./sub/Sdata.json",res,postdata);
                },
                err =>{
                    console.log(err);
                    res.writeHead(200,{"Content-Type": "application/json"});
                    let obj = new Object();
                    obj.status = "error";
                    obj.Func = "Sakujo";
                    obj = JSON.stringify(obj);
                    res.end(obj);
                }
            );

        }else if( postdata.type === "idou"){

            let mobj = new Object();
            let aobj = new Object();
            SakujoId1(ID).then(
                suc =>{
                    mobj.basyo = suc.mae;
                    mobj.kane = suc.mkane;
                    aobj.basyo = suc.ato;
                    aobj.kane = suc.akane;
                    return SakujoZo2(mobj);
                },
                err =>{
                    console.log(err);
                    return ErrFunc();
                }
            ).then(
                suc =>{
                    mobj = suc;
                    return SakujoZo2(aobj);
                },
                err =>{
                    console.log(err);
                    return ErrFunc();
                }
            ).then(
                suc =>{
                    aobj = suc;
                    return SakujoZo3(mobj);
                },
                err =>{
                    console.log(err);
                    return ErrFunc();
                }
            ).then(
                suc =>{
                    return SakujoZo3(aobj);
                },
                err =>{
                    console.log(err);
                    return ErrFunc();
                }
            ).then(
                suc =>{
                    return SakujoZo4(ID,postdata.type);
                },
                err =>{
                    console.log(err);
                    return ErrFunc();
                }
            ).then(
                suc =>{
                    console.log(postdata.type + " テーブルのID= " + postdata.Target +" を削除する ");
                    SQLjson("./sub/Sdata.json",res,postdata);
                },
                err =>{
                    console.log(err);
                    res.writeHead(200,{"Content-Type": "application/json"});
                    let obj = new Object();
                    obj.status = "error";
                    obj.Func = "Sakujo";
                    obj = JSON.stringify(obj);
                    res.end(obj);
                }
            );
        }else{
            console.log("存在しないテーブル");
        }
    }else{
        console.log("存在しないテーブルを狙われるエラー　by Sakujo");
    }
}
function ErrFunc(){
    return new Promise( (resolve,reject) =>{
        reject(" ");
    });
}

//まずは該当データから金額など必要データを手に入れる
//この時点での金額データは足し引きする金額
function SakujoZo1(Id){
    return new Promise((resolve,reject) => {

        let insertData = "SELECT bunrui,basyo,kane FROM zougen" + hdate + " WHERE id = " + Id;
        connection.query(insertData, function (err, results) {

            if(err){
                reject("クエリ1で失敗　by SakujoZo1");
            }else{
                let obj = new Object();
                obj.basyo = results[0].basyo;
                obj.kane = results[0].kane; 
                if(results[0].bunrui === "収入"){
                    obj.kane = -1 * obj.kane;
                }
                resolve(obj);
            }
        });
    });
}

//次にzaisanデータから金額を取り出す
//この時点からの金額データは足し引き後の金額

function SakujoZo2(obj){
    return new Promise((resolve,reject) => {

        let insertData  ="SELECT kane FROM zaisan WHERE name = '" + obj.basyo + "'";
        connection.query(insertData, function (err, results) {

            if(err){
                reject("クエリ2で失敗　by SakujoZo2");
            }else{
                obj.kane = obj.kane + results[0].kane;
                if(obj.kane >= 0){
                    resolve(obj);
                }else{
                    reject("クエリ2で金額矛盾　by SakujoZo2");
                }
            }
        });
    });
}

//zaisanテーブルから指定金額を再計算する
function SakujoZo3(obj){

    return new Promise((resolve,reject) => {
        let insertData  ="UPDATE zaisan SET kane = " + obj.kane + " WHERE name = '" + obj.basyo + "'";

        connection.query(insertData, function (err, results) {
            if(err){
                reject("クエリ3で失敗　by SakujoZo3");
            }else{
                resolve(obj);
            }
        });
    });
}

//最後にzougenテーブルから削除する
function SakujoZo4(ID,Tget){
    return new Promise((resolve,reject) => {

        let insertData = "DELETE FROM "+ Tget + hdate + " WHERE id = " + ID;
        connection.query(insertData, function (err, results) {
            if(err){
                reject("クエリ4で失敗　by SakujoZo4");
            }else{
                resolve(ID);
            }
        });
    });
}

function SakujoId1(Id){
    return new Promise((resolve,reject) => {

        let insertData = "SELECT kane,mae,ato FROM idou" + hdate + " WHERE id = " + Id;
        connection.query(insertData, function (err, results) {
            if(err){
                reject("クエリ1で失敗　by SakujoZo1");
            }else{

                let obj = new Object();
                obj.mae = results[0].mae;
                obj.ato = results[0].ato;
                obj.mkane = results[0].kane;
                obj.akane = -1*results[0].kane;
                //maeのデータは増えるのでそのまま、atoのデータは減るので-してる
                resolve(obj);
            }
        });
    });
}

//QUOTEにより変なデータがSQLにいかないようにできる

/*  forHTMLはデータベースから取り出したデータの中にそのまま表示するのは困る記号を変換する
   HTMLで安全に表示するために必要 */
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


function SQLjson(path,res,obj){
    //console.log("ここまで");
    let zougenDataNum = 10;
    let idouDataNum = 5;
    console.log(obj);
    res.writeHead(200,{"Content-Type": "application/json"});
    let Jstatus;
    if(obj.status === "default"){
        Jstatus = "default";
    }else{
        Jstatus = "next";
    }

    let Json =  {
        "status" : Jstatus
    }
    connection.query('SELECT name,kane FROM zaisan;', function (err, results) {
        let Jdata = new Object();
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
    
    if(obj.status === "default"){

        ZougenQuery = 'SELECT * FROM zougen'+ hdate +' ORDER BY id DESC LIMIT ' + zougenDataNum + ';';
        IdouQuery = 'SELECT * FROM idou'+ hdate +' ORDER BY id DESC LIMIT ' + idouDataNum + ';';

    }else if(obj.status === "ajax"){

        obj.zougen.Max = parseInt(obj.zougen.Max);
        obj.zougen.Min = parseInt(obj.zougen.Min);
        obj.idou.Max = parseInt(obj.idou.Max);
        obj.idou.Min = parseInt(obj.idou.Min);

        if(obj.type === "zougen"){

            IdouQuery = 'SELECT * FROM idou'+ hdate +' WHERE id <= '+ obj.idou.Max +'  ORDER BY id DESC LIMIT ' + idouDataNum + ';';
            if(obj.vec === "up"){
                ZougenQuery = 'SELECT * FROM zougen'+ hdate +' WHERE id > '+ obj.zougen.Max +'  ORDER BY id ASC LIMIT ' + zougenDataNum + ';';
            }else if(obj.vec === "down"){
                ZougenQuery = 'SELECT * FROM zougen'+ hdate +' WHERE id < '+ obj.zougen.Min +'  ORDER BY id DESC LIMIT ' + zougenDataNum + ';';
            }
        
        }else if(obj.type === "idou"){

            ZougenQuery = 'SELECT * FROM zougen'+ hdate +' WHERE id <= '+ obj.zougen.Max +'  ORDER BY id DESC LIMIT ' + zougenDataNum + ';';
            if(obj.vec === "up"){
                IdouQuery = 'SELECT * FROM idou'+ hdate +' WHERE id > '+ obj.idou.Max +'  ORDER BY id ASC LIMIT ' + idouDataNum + ';';
            }else if(obj.vec === "down"){
                IdouQuery = 'SELECT * FROM idou'+ hdate +' WHERE id < '+ obj.idou.Min +'  ORDER BY id DESC LIMIT ' + idouDataNum + ';';
            }
        }else{
            console.log("謎のタイプエラー by SQLjson");
            res.end();
            return;
        }
    }else if(obj.status === "delete"){

        obj.zougen.Max = parseInt(obj.zougen.Max);
        obj.zougen.Min = parseInt(obj.zougen.Min);
        obj.idou.Max = parseInt(obj.idou.Max);
        obj.idou.Min = parseInt(obj.idou.Min);
        ZougenQuery = 'SELECT * FROM zougen'+ hdate +' ORDER BY id DESC LIMIT ' + zougenDataNum + ';';
        IdouQuery = 'SELECT * FROM idou'+ hdate +' ORDER BY id DESC LIMIT ' + idouDataNum + ';';

    }else{
        console.log("謎のステータスエラー by SQLjson");
        console.log(obj.status);
        res.end();
        return;
    }
    

    connection.query(ZougenQuery, function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        if(results.length != 0){
            Nzougen = results;
        }

        let Jdata = new Object();
        //もしテーブルが空なら
        if(results.length === 0 && Nzougen.length === 0){
            Jdata.zougen = "今月のデータはありません";
        }else{
            if(obj.type === "zougen" && obj.vec == "up"){
                results.reverse();
            }
            if(results.length === 0){
                results = Nzougen;
            }

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
        if(results.length != 0){
            Nidou = results;
        }

        let Jdata = new Object();
        //もしテーブルが空なら
        if(results.length === 0 && Nidou.length === 0){
            Jdata.idou = "今月のデータはありません";
        }else{
            if(obj.type === "idou" && obj.vec == "up"){
                results.reverse();
            }
            if(results.length === 0){
                results = Nidou;
            }

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

//zougenやidouの書き込みが失敗してもzaisanに書き込んでしまっているのを直したい。というかエラー処理をやりたい

function zougenAdd(bunkatu){

    let insertData = "INSERT INTO zougen"+ hdate +"  (bunrui,basyo,kane,syurui,komento,time) VALUES('" + bunkatu[0] + "','" + bunkatu[1] + "'," + bunkatu[2] + ",'" + bunkatu[3] + "',QUOTE('" + bunkatu[4] + "'), DATE(NOW()) );";
    console.log(Henkan(bunkatu[5]));
    console.log(parseInt(  Henkan(bunkatu[5])  ));

    if(bunkatu[5] === "today"){
        console.log("正常な今日");
    }else if(parseInt(Today) <= parseInt(  Henkan(bunkatu[5])  )){
        console.log("昨日以前じゃないじゃん");
        return;
    }else if(parseInt(Today) > parseInt( Henkan(bunkatu[5]) )){
        insertData = "INSERT INTO zougen"+ hdate +"  (bunrui,basyo,kane,syurui,komento,time) VALUES('" + bunkatu[0] + "','" + bunkatu[1] + "'," + bunkatu[2] + ",'" + bunkatu[3] + "',QUOTE('" + bunkatu[4] + "'), DATE('" + bunkatu[5] +"') );";
    }else{
        console.log("日付関連のデータがおかしい");
        return;
    }

    connection.query(insertData, function (err, results) {
        //console.log('--- results ---');
        //console.log(results);
        //console.log(err);
    });
}

function idouadd(bunkatu){
    let insertData = "INSERT INTO idou"+ hdate +" (kane,mae,ato,komento,time) VALUES(" + bunkatu[1] + ",'" + bunkatu[2] + "','" + bunkatu[3] + "',QUOTE('" + bunkatu[4] + "'), DATE(NOW()) );";
    
    if(bunkatu[5] === "today"){
        console.log("正常な今日");
    }else if(parseInt(Today) <= parseInt(  Henkan(bunkatu[5])  )){
        console.log("昨日以前じゃないじゃん");
        return;
    }else if(parseInt(Today) > parseInt( Henkan(bunkatu[5]) )){
        insertData = "INSERT INTO idou"+ hdate +" (kane,mae,ato,komento,time) VALUES(" + bunkatu[1] + ",'" + bunkatu[2] + "','" + bunkatu[3] + "',QUOTE('" + bunkatu[4] + "'), DATE('"+ bunkatu[5] +"') );";
    }else{
        console.log("日付関連のデータがおかしい");
        return;
    }
        
    console.log(insertData);
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

function Henkan(DayData){
    if(DayData === "today"){
        return "today";
    }
    try{
        let ReDayData = DayData.replace(/-/g,"");
        if(ReDayData < 19000000){
            return "error";
        }else{
            return ReDayData;
        }
    }catch(err){
        console.log(err);
        console.log("受信日付データがおかしい");
        return "error";
    }
}

