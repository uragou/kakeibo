
let buntrijs = document.getElementById('bunrui');

//http://kakeibo.lucky-days.jp/interview/how-to-classify/guidance/
buntrijs.addEventListener("change",SorS,false);

SorS(event);

function SorS(event){
    console.log(this.value);
    let naiyoujs = document.getElementById("naiyou");
    let fragment = document.createDocumentFragment();
    naiyoujs.innerHTML="";
    if(this.value == 2){
        var opts = new Array(11);
        for(let lop = 0; lop< opts.length ; lop++){
            opts[lop] = document.createElement("option");
        }
        opts[0].setAttribute("value","syokuhi");
        opts[0].textContent="食費";
        opts[1].setAttribute("value","benkyo");
        opts[1].textContent="勉強費";
        opts[2].setAttribute("value","zaka");
        opts[2].textContent="雑貨費";
        opts[3].setAttribute("value","yukyou");
        opts[3].textContent="遊興費";
        opts[4].setAttribute("value","koutu");
        opts[4].textContent="交通費";
        opts[5].setAttribute("value","midasi");
        opts[5].textContent="身だしなみ";
        opts[6].setAttribute("value","iryo");
        opts[6].textContent="医療費";
        opts[7].setAttribute("value","tuusin");
        opts[7].textContent="通信費";
        opts[8].setAttribute("value","inhura");
        opts[8].textContent="水道・電気・ガス";
        opts[9].setAttribute("value","zeikin");
        opts[9].textContent="税金";
        opts[10].setAttribute("value","sonota");
        opts[10].textContent="その他";
        for(let lop = 0; lop< opts.length ; lop++){
            fragment.appendChild(opts[lop]);
        }
    }else{
        var opts = new Array(5);
        for(let lop = 0; lop< opts.length ; lop++){
            opts[lop] = document.createElement("option");
        }
        opts[0].setAttribute("value","kyuyo");
        opts[0].textContent="給料";
        opts[1].setAttribute("value","hurou");
        opts[1].textContent="不労所得";
        opts[2].setAttribute("value","syoukin");
        opts[2].textContent="賞金";
        opts[3].setAttribute("value","oiwai");
        opts[3].textContent="お祝い金";
        opts[4].setAttribute("value","sonota");
        opts[4].textContent="その他";
        for(let lop = 0; lop< opts.length ; lop++){
            fragment.appendChild(opts[lop]);
        } 
    }
    naiyoujs.appendChild(fragment);
}
