
/*var mysql = require('mysql');
 
let dbConfig = {
     host: '127.0.0.1',
     user: 'kakeibo',
     password: '',
     database: 'kakeibo_db'
    };
let connection = mysql.createConnection(dbConfig);

connection.query('SELECT name,kane FROM zaisan');*/

let http = require('http');
let port = 55555;
let server = http.createServer();

server.on('request',naiyo);
server.listen(port);

function naiyo(req,res){
    res.writeHead(200, {'Content-Type': 'text/plain'});

    var mysql = require('mysql');
 
    let dbConfig = {
        host: 'localhost',
        database: 'kakeibo_db',
        user: 'kakeibo',
        password: 'kakeibokey'
    };
    let connection = mysql.createConnection(dbConfig);
    connection.connect();

    /*var query = connection.query('select name,kane from zaisan;', function (err, results) {
        console.log('--- results ---');
        console.log(results);
    });*/
    
    var query = connection.query('SELECT name,kane FROM zaisan;',function (error, results, fields){
        console.log(error);
        console.log(results);
        console.log(fields);
    });
    console.log("実行");
    res.end('Hello World\n');
}

