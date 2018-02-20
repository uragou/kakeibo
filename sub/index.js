
let buntrijs = document.getElementById('bunrui');
let okurujs = document.getElementById('okuru');
//http://kakeibo.lucky-days.jp/interview/how-to-classify/guidance/
buntrijs.addEventListener("change",SorS,false);
okurujs.addEventListener("click",sendivent,false);

SorS(event);

function SorS(event){
    //event.preventDefault();
    let naiyoujs = document.getElementById("naiyou");
    let fragment = document.createDocumentFragment();
    naiyoujs.innerHTML="";

    if(this.value == "支出"){
        var opts = new Array(11);
        for(let lop = 0; lop< opts.length ; lop++){
            opts[lop] = document.createElement("option");
        }
        opts[0].setAttribute("value","食費");
        opts[0].textContent="食費";
        opts[1].setAttribute("value","勉強費");
        opts[1].textContent="勉強費";
        opts[2].setAttribute("value","雑貨費");
        opts[2].textContent="雑貨費";
        opts[3].setAttribute("value","遊興費");
        opts[3].textContent="遊興費";
        opts[4].setAttribute("value","交通費");
        opts[4].textContent="交通費";
        opts[5].setAttribute("value","身だしなみ");
        opts[5].textContent="身だしなみ";
        opts[6].setAttribute("value","医療費");
        opts[6].textContent="医療費";
        opts[7].setAttribute("value","通信費");
        opts[7].textContent="通信費";
        opts[8].setAttribute("value","インフラ");
        opts[8].textContent="水道・電気・ガス";
        opts[9].setAttribute("value","税金");
        opts[9].textContent="税金";
        opts[10].setAttribute("value","その他");
        opts[10].textContent="その他";
        for(let lop = 0; lop< opts.length ; lop++){
            fragment.appendChild(opts[lop]);
        }

        Fromto(this.value);

    }else if(this.value == "移動"){
        var opts = new Array(2);
        for(let lop = 0; lop< opts.length ; lop++){
            opts[lop] = document.createElement("option");
        }
        opts[0].setAttribute("value","銀行");
        opts[0].textContent="銀行";
        opts[1].setAttribute("value","財布");
        opts[1].textContent="財布";
        for(let lop = 0; lop< opts.length ; lop++){
            fragment.appendChild(opts[lop]);
        } 
        Fromto(this.value);
        
    }else{
        var opts = new Array(5);
        for(let lop = 0; lop< opts.length ; lop++){
            opts[lop] = document.createElement("option");
        }
        opts[0].setAttribute("value","給料");
        opts[0].textContent="給料";
        opts[1].setAttribute("value","不労所得");
        opts[1].textContent="不労所得";
        opts[2].setAttribute("value","賞金");
        opts[2].textContent="賞金";
        opts[3].setAttribute("value","お祝い金");
        opts[3].textContent="お祝い金";
        opts[4].setAttribute("value","その他");
        opts[4].textContent="その他";
        for(let lop = 0; lop< opts.length ; lop++){
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

    var opts = new Array(2);
    for(let lop = 0; lop< opts.length ; lop++){
        opts[lop] = document.createElement("option");
    }
    opts[0].setAttribute("value","銀行");
    opts[0].textContent="銀行";
    opts[1].setAttribute("value","財布");
    opts[1].textContent="財布";
    for(let lop = 0; lop< opts.length ; lop++){
        fragment.appendChild(opts[lop]);
    } 

    Select.appendChild(fragment);

    if(sentaku == "移動"){
        idoujs.appendChild(Select);
    }else{
        basyojs.appendChild(Select);
    }
}

//多分使わない
function sendivent(event){
    event.preventDefault();

    var atai = document.forms.sqlsend;

    if(atai.bunrui.value == "移動"){
        var obj = {
            bunrui : atai.bunrui.value,
            basyo : atai.doko.value,
            kane : atai.kane.value,
            syurui : atai.naiyou.value,
            komento : atai.text.value
        };
        
    }else{
        var obj = {
            bunrui:atai.bunrui.value,
            kane:atai.kane.value,
            from:atai.naiyou.value,
            to:atai.doko.value,
            komento:atai.text.value
        };
    }
    let json = JSON.stringify(obj);
    console.log(json);
}