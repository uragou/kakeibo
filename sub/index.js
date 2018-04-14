let begin = new XMLHttpRequest();
let BData = "";
let buntrijs = document.getElementById('bunrui');
let okurujs = document.getElementById('okuru');
//http://kakeibo.lucky-days.jp/interview/how-to-classify/guidance/
//Mywindow.("oncancel",test,false);
//window.addEventListener("onbeforeunload",test,false);

begin.onloadend = function(){
    if(begin.readyState === 4 && begin.status === 200){
        Bdata = JSON.parse(begin.response);
        console.log(Bdata);
        //ここに結果が来ている
        SorS(event);
        buntrijs.addEventListener("change",SorS,false);
        //jsonが来てからイベント登録
    }
};

function BeginFunc(){
    //非同期　false じゃないと連続で受け取れない
    begin.open('POST','/sub/index.json' , true);
    begin.send("begin");
};

//location.href = "/sub/index.js"
function SorS(event){
    //event.preventDefault();
    let naiyoujs = document.getElementById("naiyou");
    let fragment = document.createDocumentFragment();
    naiyoujs.innerHTML="";

    if(this.value == "支出"){
        var opts = new Array(Bdata.Bsisyutu.length);
        for(let lop = 0; lop< Bdata.Bsisyutu.length ; lop++){
            opts[lop] = document.createElement("option");
            opts[lop].setAttribute("value",Bdata.Bsisyutu[lop]);
            opts[lop].textContent=Bdata.Bsisyutu[lop];
            fragment.appendChild(opts[lop]);
        }
        Fromto(this.value);

    }else if(this.value == "移動"){
        //Bidouは財産の種類でもある
        var opts = new Array(Bdata.Bidou.length);
        for(let lop = 0; lop< Bdata.Bidou.length ; lop++){
            opts[lop] = document.createElement("option");
            opts[lop].setAttribute("value",Bdata.Bidou[lop]);
            opts[lop].textContent=Bdata.Bsyunyu[lop];
            fragment.appendChild(opts[lop]);
        }
        Fromto(this.value);
    }else{
        var opts = new Array(Bdata.Bsyunyu.length);
        for(let lop = 0; lop< Bdata.Bsyunyu.length ; lop++){
            opts[lop] = document.createElement("option");
            opts[lop].setAttribute("value",Bdata.Bsyunyu[lop]);
            opts[lop].textContent=Bdata.Bsyunyu[lop];
            fragment.appendChild(opts[lop]);
        }
        Fromto(this.value);
    }
    naiyoujs.appendChild(fragment);

}


function Fromto(sentaku){

    let Select = document.createElement("select");
    let idoujs = document.getElementById("idou");
    let basyojs = document.getElementById("basyo");
    let fragment = document.createDocumentFragment();
    basyojs.innerHTML="";
    idoujs.innerHTML="";

    if(sentaku == "移動"){
        idoujs.textContent = "→";
        Select.setAttribute("name","doko");
        Select.setAttribute("id","doko");
    }else{
        basyojs.textContent = "出所 ";
        Select.setAttribute("name","doko");
        Select.setAttribute("id","doko");
    }

    var opts = new Array(Bdata.Bidou.length);
    for(let lop = 0; lop< Bdata.Bidou.length ; lop++){
        opts[lop] = document.createElement("option");
        opts[lop].setAttribute("value",Bdata.Bidou[lop]);
        opts[lop].textContent=Bdata.Bsyunyu[lop];
        fragment.appendChild(opts[lop]);
    }
    
    Select.appendChild(fragment);

    if(sentaku == "移動"){
        idoujs.appendChild(Select);
    }else{
        basyojs.appendChild(Select);
    }
}
