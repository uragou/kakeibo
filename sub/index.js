/* 
  index.jsでは入力部分のプルダウンメニューをDOMで変更している
その時にajaxを用いてindex.jsを受け取っている


　　　　　ajax・DOMは動詞
*/

let begin = new XMLHttpRequest();
let BData = "";
let buntrijs = document.getElementById('bunrui');
let okurujs = document.getElementById('okuru');
let RadioBtn = document.getElementsByClassName("Rbtn");
let SwBtn = Array(RadioBtn.length);

//日付関連の各ラジオボタンにイベントを設定している。
for(let lop = 0; lop < RadioBtn.length ; lop++){
    SwBtn[lop] = document.getElementById("Radio"+lop);
    SwBtn[lop].addEventListener("change",RadioEvent,false);
}


/*  ラジオボタンにより、今日以外の家計簿をつけたい場合は入力必須の日付フォームを操作可能とする
  また「今日」のボタンを押すとdisabledがtrueになり、入力必須でなくなる
  入力できるのは90日前までにしている
*/
function RadioEvent(ev){
    let DayForm = document.getElementById("InputDay");
    if(this.value == "other"){

        SwBtn[0].checked = false;
        DayForm.setAttribute("value",kyou(-1));
        DayForm.setAttribute("max",kyou(-1));
        DayForm.setAttribute("min",kyou(-90));
        DayForm.disabled = false;
        console.log(DayForm);

    }else if(this.value == "today"){

        SwBtn[1].checked = false;
        DayForm.disabled = true;

    }else{
        console.log("ラジオボタンに謎の値 by RadioEvent");
        DayForm.disabled = true;

    }
};

/*  名前通り本日の日付を返す 形式は yyyy-mm-dd 
  引数は今日からの差　（明日なら１　おとといなら-2）*/
function kyou(sa){
    let date = new Date();
    date.setDate(date.getDate()+sa);
    let hdate;

    if(date.getMonth()+1 < 10){
        hdate = date.getFullYear() + "-0" + (date.getMonth()+1);
    }else{
        hdate = date.getFullYear() + "-" + (date.getMonth()+1);
    }
    if(date.getDate()<10){
        hdate = hdate + "-0" + date.getDate();
    }else{
        hdate = hdate + "-" + date.getDate();
    }
    return hdate;
}

/*
  ajaxでindex.jsonを取得する部分
postでbeginと送るとindex.jsonが送られてくる
送られてきたらSorS関数を一回実行してから
SorS関数をイベントとして登録する
*/
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

/*
  async.jsが最初のajaxを終わらせると実行される
*/
function BeginFunc(){

    begin.open('POST','/sub/index.json' , true);
    let obj = new Object();

    obj.status = "begin";
    obj = JSON.stringify(obj);
    begin.send(obj);

};

/*
  SorS関数はindex.htmlのsqlsend（入力フォーム部分）のDOMしている
分類部分のプルダウンメニューが変更された場合、分類部分の項目によって残りの入力部分の内容を変える
デフォルトは収入に設定されている。
イベントとして設定されているがイベント以前に一回
収入として設定するためにイベント前に一度だけ設定している
関数内のBdataはindex.jsonの内容である。
json内に各入力フォームに使う値を入れている。
*/
function SorS(event){
    //event.preventDefault();
    let naiyoujs = document.getElementById("naiyou");
    let fragment = document.createDocumentFragment();
    //一旦入力フォームの内容を全部消している
    naiyoujs.innerHTML="";
    
    /*
      この関数部分では種類、→部分（コメント入力欄の一つ左のプルダウンメニュー）を変更している。
    残りは関数内で実行しているFromto関数で変更している
    if文はthis.valueの値で分岐しているが、最初（ページを開いた時）は値がないため
    初期値では何も入れない
    this.valueには分類の値「収入」「支出」「移動」の値を入れている
    */

    if(this.value == "支出"){
        //分類を「支出」にした時の「種類」のプルダウンメニューを作っている
        var opts = new Array(Bdata.Bsisyutu.length);

        for(let lop = 0; lop< Bdata.Bsisyutu.length ; lop++){

            opts[lop] = document.createElement("option");
            opts[lop].setAttribute("value",Bdata.Bsisyutu[lop]);
            opts[lop].textContent=Bdata.Bsisyutu[lop];

            fragment.appendChild(opts[lop]);

        }
        Fromto(this.value);
        SubSwOn();

    }else if(this.value == "移動"){
        //Bzaisanは財産の種類でもある
        //分類を「移動」にした時の「→」部分のプルダウンメニューを作っている
        var opts = new Array(Bdata.Bzaisan.length);

        for(let lop = 0; lop< Bdata.Bzaisan.length ; lop++){

            opts[lop] = document.createElement("option");
            opts[lop].setAttribute("value",Bdata.Bzaisan[lop]);
            opts[lop].textContent=Bdata.Bzaisan[lop];

            fragment.appendChild(opts[lop]);

        }

        Fromto(this.value);
        SubSwOn();

    }else if(this.value == "収入"){

        //分類を「収入」にした時の「種類」のプルダウンメニューを作っている
        var opts = new Array(Bdata.Bsyunyu.length);

        for(let lop = 0; lop< Bdata.Bsyunyu.length ; lop++){

            opts[lop] = document.createElement("option");
            opts[lop].setAttribute("value",Bdata.Bsyunyu[lop]);
            opts[lop].textContent=Bdata.Bsyunyu[lop];

            fragment.appendChild(opts[lop]);

        }

        Fromto(this.value);
        SubSwOn();

    }else{

        //初期状態の時は送信ボタンを押せないようにする
        //<input id="okuru" type="submit" value="送  信">
        let Okuru = document.getElementById("okuru");

        Okuru.disabled = true;
        Okuru.setAttribute("value","　　　");
        Okuru.setAttribute("class","SendNo");

    }

    naiyoujs.appendChild(fragment);

}

//送信ボタンをONにする
function SubSwOn(){

    let Okuru = document.getElementById("okuru");

    Okuru.disabled = false;
    Okuru.setAttribute("value","送　信");
    Okuru.setAttribute("class","SendOk");
}


/*
  Fromto関数ではSorS関数で変更した内容以外をDOMしている
特に値しか変わっていない「収入」「支出」はともかく移動はかなり変わっているので
「移動」時のDOMがメインになっている
*/
function Fromto(sentaku){

    let Select = document.createElement("select");
    let idoujs = document.getElementById("idou");
    let basyojs = document.getElementById("basyo");
    let fragment = document.createDocumentFragment();

    basyojs.innerHTML="";
    idoujs.innerHTML="";

    if(sentaku == "移動"){
        /*
          this.valueが「移動」の時「→」を生成する。
        これは「種類」の右に空っぽの<span>タグが用意してあり
        「移動」選択時、ここに要素を入れている。
        */
        idoujs.textContent = "→";
        Select.setAttribute("name","doko");
        Select.setAttribute("id","doko");
    }else{
        /*
          this.valueが「収入」「支出」また、初期状態の時「出所」を生成する。
        これは「出所」の右に空っぽの<span>タグが用意してあり
        「収入」「支出」また、初期状態の時、ここに要素を入れている。
        */
        basyojs.textContent = "出所 ";
        Select.setAttribute("name","doko");
        Select.setAttribute("id","doko");
    }

    /*
      this.valueがなんであろうと実は入れる値は同じためこの部分だけ分離している
    「→」か「出所」部分のプルダウンメニューを作成している
    */
    var opts = new Array(Bdata.Bzaisan.length);

    for(let lop = 0; lop< Bdata.Bzaisan.length ; lop++){

        opts[lop] = document.createElement("option");
        opts[lop].setAttribute("value",Bdata.Bzaisan[lop]);
        opts[lop].textContent=Bdata.Bzaisan[lop];
        fragment.appendChild(opts[lop]);

    }
    
    Select.appendChild(fragment);

    //selectタグが完成したらappendChildしている
    if(sentaku == "移動"){

        idoujs.appendChild(Select);

    }else{

        basyojs.appendChild(Select);

    }
}