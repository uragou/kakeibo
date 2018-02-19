for(let lop=0;lop<id.length;lop++){
    zougensql(id[lop],bunrui[lop],basyo[lop],kane[lop],syurui[lop],komento[lop],time[lop]);
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
    idtd.textContent = id;
    bunruitd.textContent = bunrui;
    basyotd.textContent = basyo;
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
