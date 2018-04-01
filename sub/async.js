let ajax = new XMLHttpRequest();
let JsonData;
//ajax用のやつを作った。
let leftidou = document.getElementById("idouup");
let rightidou = document.getElementById("idouback");
var idouvalue = 0;
let leftzougen = document.getElementById("zougenup");
let rightzougen = document.getElementById("zougenback");
var zougenvalue = 0;
//console.log(zouid[0]);
//console.log(idouid[0]);
//loadイベントにてロードしたらイベントが起こる
//openに内容を書いてsendで送る。
ajax.addEventListener("load",function(ev){
    if(ajax.readyState === 4 && ajax.status === 200){
        //console.log(ajax.response);
        JsonData = JSON.parse(ajax.response);
        if(JsonData.status === "default"){
            console.log(JsonData);
            SQLfunc(JsonData);
        }
        //ここに結果が来ている
    }
});

function init(){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("default");
};


leftidou.addEventListener("click",function(ev){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("ajax,idou," + idouvalue + ",up");
});

leftidou.addEventListener("click",function(ev){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("ajax,idou," + idouvalue + ",up");
});

rightzougen.addEventListener("click",function(ev){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("ajax,idou," + zougenvalue + ",down");
});


leftzougen.addEventListener("click",function(ev){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("ajax,zougen," + zougenvalue + ",up");
});


rightzougen.addEventListener("click",function(ev){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("ajax,zougen," + zouid[0] + ",down");
});



function SQLfunc(JsonData){
    let zougendatajs = document.getElementById("zougendata");
    let idoudatajs = document.getElementById("idoudata");
    let nowdatajs = document.getElementById("nowdata");
 
    idouvalue = JsonData.idou[0].id;
    zougenvalue = JsonData.zougen[0].id;
    for(let lop=0;lop<JsonData.zougen.length;lop++){

        let fragment = document.createDocumentFragment();
        let tr = document.createElement("tr");
        let idtd = document.createElement("td");
        let bunruitd = document.createElement("td");
        let basyotd = document.createElement("td");
        let kanetd = document.createElement("td");
        let syuruitd = document.createElement("td");
        let komentotd = document.createElement("td");
        let timetd = document.createElement("td");

        if(JsonData.zougen[lop].bunrui == "収入"){
            tr.setAttribute("class","ikane");
        }else{
            tr.setAttribute("class","okane");
        }
        kanetd.setAttribute("class","kane");
        idtd.textContent = JsonData.zougen[lop].id;
        bunruitd.textContent = JsonData.zougen[lop].bunrui;
        basyotd.textContent = JsonData.zougen[lop].basyo;
        JsonData.zougen[lop].kane = changekane(JsonData.zougen[lop].kane);
        kanetd.textContent = JsonData.zougen[lop].kane;
        syuruitd.textContent = JsonData.zougen[lop].syurui;
        komentotd.innerHTML = JsonData.zougen[lop].komento;
        timetd.textContent = JsonData.zougen[lop].time;
        fragment.appendChild(tr).appendChild(idtd);
        fragment.appendChild(tr).appendChild(bunruitd);
        fragment.appendChild(tr).appendChild(basyotd);
        fragment.appendChild(tr).appendChild(kanetd);
        fragment.appendChild(tr).appendChild(syuruitd);
        fragment.appendChild(tr).appendChild(komentotd);
        fragment.appendChild(tr).appendChild(timetd);
        zougendatajs.appendChild(fragment);
    }
    for(let lop=0;lop<JsonData.idou.length;lop++){

        let fragment = document.createDocumentFragment();
        let tr = document.createElement("tr");
        let idtd = document.createElement("td");
        let kanetd = document.createElement("td");
        let maetd = document.createElement("td");
        let atotd = document.createElement("td");
        let komentotd = document.createElement("td");
        let timetd = document.createElement("td");
        kanetd.setAttribute("class","kane");
        JsonData.idou[lop].kane = changekane(JsonData.idou[lop].kane);
        idtd.textContent = JsonData.idou[lop].id;
        kanetd.textContent = JsonData.idou[lop].kane;
        maetd.textContent = JsonData.idou[lop].mae;
        atotd.textContent = JsonData.idou[lop].ato;
        komentotd.innerHTML = JsonData.idou[lop].komento;
        timetd.textContent = JsonData.idou[lop].time;
        fragment.appendChild(tr).appendChild(idtd);
        fragment.appendChild(tr).appendChild(maetd);
        fragment.appendChild(tr).appendChild(atotd);
        fragment.appendChild(tr).appendChild(kanetd);
        fragment.appendChild(tr).appendChild(komentotd);
        fragment.appendChild(tr).appendChild(timetd);
        idoudatajs.appendChild(fragment);
    }
    for(let lop=0;lop<JsonData.zaisan.length;lop++){

        let fragment = document.createDocumentFragment();
        let tr = document.createElement("tr");
        let nametd = document.createElement("td");
        let kanetd = document.createElement("td");

        kanetd.setAttribute("class","kane");
        nametd.textContent = JsonData.zaisan[lop].name;
        JsonData.zaisan[lop].num = changekane(JsonData.zaisan[lop].num);
        kanetd.textContent = JsonData.zaisan[lop].num;
        fragment.appendChild(tr).appendChild(nametd);
        fragment.appendChild(tr).appendChild(kanetd);
        nowdatajs.appendChild(fragment);
    }
}

function changekane(num){
    var anum = "";
    let lop = 3;
    anum = num + "";
    while(lop< anum.length){
        anum = anum.substr(0,anum.length - lop) + "," + anum.substr(-1*lop);
        lop+=4;
    }
    return anum;
}
