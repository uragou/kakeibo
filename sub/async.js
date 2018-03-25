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
leftidou.addEventListener("click",function(ev){
    ajax.open('POST','/sub/sql.js' , true);
    ajax.send("ajax" + idouid[0] + ",up");
    console.log(ajax.response);
});

rightidou.addEventListener("click",function(ev){
    ajax.open('POST','/sub/sql.js' , true);
    ajax.send("ajax" + idouid[0] + ",down");
    console.log(ajax.response);
});


leftzougen.addEventListener("click",function(ev){
    ajax.open('POST','/sub/sql.js' , true);
    ajax.send("ajax" + zouid[0] + ",up");
    console.log(ajax.response);
});


rightzougen.addEventListener("click",function(ev){
    ajax.open('POST','/sub/sql.js' , true);
    ajax.send("ajax" + zouid[0] + ",down");
    console.log(ajax.response);
});




