let ajax = new XMLHttpRequest();
let JsonData;
//ajax用のやつを作った。
let leftidou = document.getElementById("idouup");
let rightidou = document.getElementById("idouback");
var idouvalue = 0;
let leftzougen = document.getElementById("zougenup");
let rightzougen = document.getElementById("zougenback");
var zougenvalue = 0;
//loadイベントにてロードしたらイベントが起こる
//openに内容を書いてsendで送る。

/*
  ajaxの核部分、nodeから送られてくるjsonファイルを受け取ってSQLfunc関数に渡す
最初はdefaultデータを取得し、ボタンを押すとnextデータを取得する。
BeginFunc関数はindex.jsにある。本当はbody部分に二つ関数を書きたかったが、エラーとなるうえどちらが先に実行されるか分からず、
不安定なためこちらがdefaultデータを受け取ってからBeginFuncで次のajax通信を開始する。
asnc.jsで実行するとここでjsonを受け取ることになり、別のjsファイルにうまく引き継げなかったため、関数ごとindex.jsに移動した。
*/
ajax.onloadend = function(){
    if(ajax.readyState === 4 && ajax.status === 200){
        //console.log(ajax.response);
        JsonData = JSON.parse(ajax.response);
        //コンソール画面（f12）に送られてきたjsonが表示される
        console.log(JsonData);
        if(JsonData.status === "default" || JsonData.status === "next"){
            SQLfunc(JsonData);
            if(JsonData.status === "default"){
                BeginFunc();
            }
        }
        //ここに結果が来ている
    }
};

/*
  このinit関数はindex.htmlの<body onload="init()">により実行される関数である
イベントはonloadのため表示されたときに一度だけ実行する。「default」と送り、defaultデータのjsonを要求する。
ajax.openの第三引数は非同期かどうかを決める引数であり、falseだと警告される。（特に今回のような任意の回数ajaxする時）
*/
function init(){
    //非同期　false じゃないと連続で受け取れない
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("default");
};


/*
  下の4つの関数は文字通りそれぞれindex.htmlの4つのボタンに対応している。
ボタンを押すとそれぞれに対応したjsonを要求しする。例えばleftidouのボタンを押すと、
zougenデータはそのままにidouデータは最初に表示されているデータより、10件古いデータを送ってくる。
これにより各データの履歴を参照することができる。
送る内容は、まずajaxであることを示す「ajax」どちらの履歴をたどるかを示す「zougen」or「idou」
今、何件目のデータを表示しているかを示す「zougenvalue」「idouvalue」
古い履歴を見るか、新しいデータを見るかを決める「up」「down」
*/
rightidou.addEventListener("click",function(ev){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("ajax,idou," + zougenvalue + "," + idouvalue + ",down");
});

leftidou.addEventListener("click",function(ev){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("ajax,idou," + zougenvalue + "," + idouvalue + ",up");
});

rightzougen.addEventListener("click",function(ev){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("ajax,zougen," + zougenvalue + "," + idouvalue + ",down");
});


leftzougen.addEventListener("click",function(ev){
    ajax.open('POST','/sub/Sdata.json' , true);
    ajax.send("ajax,zougen," + zougenvalue + "," + idouvalue + ",up");
});



/*
  zaisan,zougen,idouの各データをテーブルに格納する。
ajaxするたびに新しく作り直す。
*/
function SQLfunc(JsonData){

    let zougendatajs = document.getElementById("zougendata");
    let idoudatajs = document.getElementById("idoudata");
    let nowdatajs = document.getElementById("nowdata");
    nowdatajs.innerHTML = "";
    zougendatajs.innerHTML = "";
    idoudatajs.innerHTML = "";

    let nowfrag = document.createDocumentFragment();
    let nowhead = document.createElement("thead");
    let nowtr = document.createElement("tr");

    let zoufrag = document.createDocumentFragment();
    let zouhead = document.createElement("thead");
    let zoutr = document.createElement("tr");

    let idoufrag = document.createDocumentFragment();
    let idouhead = document.createElement("thead");
    let idoutr = document.createElement("tr");

    let zaicel = ["保管場所","金額"];
    let zoucel = ["分類","場所","金額","種類","コメント","日付"];
    let zouop = ["tableOther","tableOther",
                    "tablekane","tableHow","","tableDate"];
    let idoucel = ["移動元","移動先","金額","コメント","日付"];
    let idouop = ["tableOther","tableOther",
                    "tablekane","","tableDate"];

    //zaisanデータをテーブルに格納する
    for(let lop=0;lop<zaicel.length;lop++){
        let celth = document.createElement("th");
        celth.textContent = zaicel[lop];
        nowfrag.appendChild(nowhead).appendChild(nowtr).appendChild(celth);
    }
    nowdatajs.appendChild(nowfrag);
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

    //zougenデータをテーブルに格納する。データがない時はないと表示する。
    if(JsonData.zougen === "今月のデータはありません"){

        let Nzougen = document.createElement("h1");
        Nzougen.textContent = JsonData.zougen;
        zougendatajs.appendChild(Nzougen);
    }else{

        for(let lop=0;lop<zoucel.length;lop++){
            let celth = document.createElement("th");
            celth.textContent = zoucel[lop];
            celth.setAttribute("class",zouop[lop]);
            zoufrag.appendChild(zouhead).appendChild(zoutr).appendChild(celth);
        }
        zougendatajs.appendChild(zoufrag);

        zougenvalue = JsonData.zougen[0].id;

        for(let lop=0;lop<JsonData.zougen.length;lop++){

            let fragment = document.createDocumentFragment();
            let tr = document.createElement("tr");
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
            bunruitd.textContent = JsonData.zougen[lop].bunrui;
            basyotd.textContent = JsonData.zougen[lop].basyo;
            JsonData.zougen[lop].kane = changekane(JsonData.zougen[lop].kane);
            kanetd.textContent = JsonData.zougen[lop].kane;
            syuruitd.textContent = JsonData.zougen[lop].syurui;
            komentotd.innerHTML = JsonData.zougen[lop].komento;
            timetd.textContent = JsonData.zougen[lop].time;
            fragment.appendChild(tr).appendChild(bunruitd);
            fragment.appendChild(tr).appendChild(basyotd);
            fragment.appendChild(tr).appendChild(kanetd);
            fragment.appendChild(tr).appendChild(syuruitd);
            fragment.appendChild(tr).appendChild(komentotd);
            fragment.appendChild(tr).appendChild(timetd);
            zougendatajs.appendChild(fragment);
        }
    }

    //idouデータをテーブルに格納する。データがない時はないと表示する。
    if(JsonData.idou === "今月のデータはありません"){
        let Nidou = document.createElement("h1");
        Nidou.textContent = JsonData.idou;
        idoudatajs.appendChild(Nidou);
    }else{
        for(let lop=0;lop<idoucel.length;lop++){
            let celth = document.createElement("th");
            celth.textContent = idoucel[lop];
            celth.setAttribute("class",idouop[lop]);
            idoufrag.appendChild(idouhead).appendChild(idoutr).appendChild(celth);
        }
        idoudatajs.appendChild(idoufrag);
        idouvalue = JsonData.idou[0].id;

        for(let lop=0;lop<JsonData.idou.length;lop++){

            let fragment = document.createDocumentFragment();
            let tr = document.createElement("tr");
            let kanetd = document.createElement("td");
            let maetd = document.createElement("td");
            let atotd = document.createElement("td");
            let komentotd = document.createElement("td");
            let timetd = document.createElement("td");

            tr.setAttribute("class","ukane");

            kanetd.setAttribute("class","kane");
            JsonData.idou[lop].kane = changekane(JsonData.idou[lop].kane);
            kanetd.textContent = JsonData.idou[lop].kane;
            maetd.textContent = JsonData.idou[lop].mae;
            atotd.textContent = JsonData.idou[lop].ato;
            komentotd.innerHTML = JsonData.idou[lop].komento;
            timetd.textContent = JsonData.idou[lop].time;
            fragment.appendChild(tr).appendChild(maetd);
            fragment.appendChild(tr).appendChild(atotd);
            fragment.appendChild(tr).appendChild(kanetd);
            fragment.appendChild(tr).appendChild(komentotd);
            fragment.appendChild(tr).appendChild(timetd);
            idoudatajs.appendChild(fragment);
        }
    }
}

//送られてくる金額データはただの整数であるため、3桁ずつに区切って見やすくする
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
