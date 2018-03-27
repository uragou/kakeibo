let ajax = new XMLHttpRequest();
//ajax用のやつを作った。
let leftidou = document.getElementById("idouup");
let rightidou = document.getElementById("idouback");
var idouvalue = idouid[0];
let leftzougen = document.getElementById("zougenup");
let rightzougen = document.getElementById("zougenback");
var zougenvalue = zouid[0];
console.log(zouid[0]);
console.log(idouid[0]);
//loadイベントにてロードしたらイベントが起こる
//openに内容を書いてsendで送る。
ajax.addEventListener("load",function(ev){
    if(ajax.readyState === 4 && ajax.status === 200){
        console.log(ajax.response);
        //ここに結果が来ている
        location.reload();
    }
});

leftidou.addEventListener("click",function(ev){
    ajax.open('POST','/sub/sql.js' , true);
    ajax.send("ajax,idou," + idouid[0] + ",up");
});

rightidou.addEventListener("click",function(ev){
    ajax.open('POST','/sub/sql.js' , true);
    ajax.send("ajax,idou," + idouid[0] + ",down");
});


leftzougen.addEventListener("click",function(ev){
    ajax.open('POST','/sub/sql.js' , true);
    ajax.send("ajax,zougen," + zouid[0] + ",up");
});


rightzougen.addEventListener("click",function(ev){
    ajax.open('POST','/sub/sql.js' , true);
    ajax.send("ajax,zougen," + zouid[0] + ",down");
});





