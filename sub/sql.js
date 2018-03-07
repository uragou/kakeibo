for(let lop=0;lop<zouid.length;lop++){
    zougensql(zouid[lop],zoubunrui[lop],zoubasyo[lop],zoukane[lop],zousyurui[lop],zoukomento[lop],zoutime[lop]);
}
for(let lop=0;lop<idouid.length;lop++){
    idousql(idouid[lop],idoukane[lop],idoumae[lop],idouato[lop],idoukomento[lop],idoutime[lop]);
}
for(let lop=0;lop<name.length;lop++){
    bsql(name[lop],num[lop]);
}

function bsql(name,num){
    let nowdatajs = document.getElementById("nowdata");
    let fragment = document.createDocumentFragment();
    let tr = document.createElement("tr");
    let nametd = document.createElement("td");
    let kanetd = document.createElement("td");
    kanetd.setAttribute("class","kane");
    nametd.textContent = name;
    num = changekane(num);
    kanetd.textContent = num;

    fragment.appendChild(tr)
    fragment.appendChild(nametd);
    fragment.appendChild(kanetd);
    nowdatajs.appendChild(fragment);
}

function zougensql(id,bunrui,basyo,kane,syurui,komento,time){
    let zougendatajs = document.getElementById("zougendata");
    let fragment = document.createDocumentFragment();
    let tr = document.createElement("tr");
    let idtd = document.createElement("td");
    let bunruitd = document.createElement("td");
    let basyotd = document.createElement("td");
    let kanetd = document.createElement("td");
    let syuruitd = document.createElement("td");
    let komentotd = document.createElement("td");
    let timetd = document.createElement("td");
    kanetd.setAttribute("class","kane");
    idtd.textContent = id;
    bunruitd.textContent = bunrui;
    basyotd.textContent = basyo;
    kane = changekane(kane);
    kanetd.textContent = kane;
    syuruitd.textContent = syurui;
    komentotd.textContent = komento;
    timetd.textContent = time;
    fragment.appendChild(tr)
    fragment.appendChild(idtd);
    fragment.appendChild(bunruitd);
    fragment.appendChild(basyotd);
    fragment.appendChild(kanetd);
    fragment.appendChild(syuruitd);
    fragment.appendChild(komentotd);
    fragment.appendChild(timetd);
    zougendatajs.appendChild(fragment);
}

function idousql(id,kane,mae,ato,komento,time){
    let idoudatajs = document.getElementById("idoudata");
    let fragment = document.createDocumentFragment();
    let tr = document.createElement("tr");
    let idtd = document.createElement("td");
    let kanetd = document.createElement("td");
    let maetd = document.createElement("td");
    let atotd = document.createElement("td");
    let komentotd = document.createElement("td");
    let timetd = document.createElement("td");
    kanetd.setAttribute("class","kane");
    kane = changekane(kane);
    idtd.textContent = id;
    kanetd.textContent = kane;
    maetd.textContent = mae;
    atotd.textContent = ato;
    komentotd.textContent = komento;
    timetd.textContent = time;
    fragment.appendChild(tr)
    fragment.appendChild(idtd);
    fragment.appendChild(kanetd);
    fragment.appendChild(maetd);
    fragment.appendChild(atotd);
    fragment.appendChild(komentotd);
    fragment.appendChild(timetd);
    idoudatajs.appendChild(fragment);
}

function changekane(num){
    var anum = "";
    let lop = 3;
    console.log("----------------");
    console.log(num);
    console.log(num.length);
    anum = num + "";
    while(lop< anum.length){
        anum = anum.substr(0,anum.length - lop) + "," + anum.substr(-1*lop);
        console.log(anum);
        lop+=4;
    }
    console.log(anum);
    return anum;
}