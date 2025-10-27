let canvas = document.getElementById("kanvas");
let context = canvas.getContext("2d");

let data = [];
let i = 0, j = 0;
let proses = false;

// tombol mulai sorting
document.getElementById("btnMulai").addEventListener("click", function(){
    if(proses) return;
    let input = document.getElementById("inputData").value;
    data = input.split(",").map(x => parseInt(x.trim()));
    i = 0; j = 0;
    proses = true;
    document.getElementById("info").innerText = "Proses sorting sedang berjalan...";
    loopSort();
});

// tombol acak ulang
document.getElementById("btnAcak").addEventListener("click", function(){
    if(proses) return;
    data = [];
    for(let x=0; x<6; x++){
        data.push(Math.floor(Math.random()*10)+1);
    }
    document.getElementById("inputData").value = data.join(",");
    gambarArray(-1,-1);
});

function loopSort(){
    if(i < data.length){
        if(j < data.length - i - 1){
            if(data[j] > data[j+1]){
                let temp = data[j];
                data[j] = data[j+1];
                data[j+1] = temp;
            }
            gambarArray(j, j+1);
            j++;
            setTimeout(loopSort, 400);
        } else {
            j = 0;
            i++;
            setTimeout(loopSort, 400);
        }
    } else {
        proses = false;
        document.getElementById("info").innerText = "Sorting selesai ✅";
        gambarArray(-1, -1);
    }
}

function gambarArray(a, b){
    context.clearRect(0, 0, canvas.width, canvas.height);
    let lebar = 50;
    let jarak = 15;
    let startX = 60;
    let warnaPelangi = ["#ff595e","#ffca3a","#8ac926","#1982c4","#6a4c93","#ff924c"];

    for(let k=0; k<data.length; k++){
        let tinggi = data[k]*25;
        let warna = warnaPelangi[k % warnaPelangi.length];
        if(k === a || k === b){
            warna = "tomato";
        }
        drawRect(startX + (lebar+jarak)*k, canvas.height-tinggi-20, lebar, tinggi, warna);

        context.fillStyle = "black";
        context.font = "14px Arial";
        context.fillText(data[k], startX + (lebar+jarak)*k + 18, canvas.height-5);
    }
}

function drawRect(x, y, w, h, warna){
    context.fillStyle = warna;
    context.fillRect(x, y, w, h);
}
