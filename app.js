// app.js
import { gambarArray } from "./lib/graflib.js";

let canvas = document.getElementById("kanvas");
let context = canvas.getContext("2d");

let data = [];
let i = 0, j = 0;
let proses = false;

document.getElementById("btnMulai").addEventListener("click", function(){
    if (proses) return;
    let input = document.getElementById("inputData").value;
    data = input.split(",").map(x => parseInt(x.trim()));
    i = 0; j = 0;
    proses = true;
    document.getElementById("info").innerText = "Proses sorting sedang berjalan...";
    loopSort();
});

document.getElementById("btnAcak").addEventListener("click", function(){
    if (proses) return;
    data = [];
    for (let x = 0; x < 6; x++) {
        data.push(Math.floor(Math.random() * 10) + 1);
    }
    document.getElementById("inputData").value = data.join(",");
    gambarArray(-1, -1, context, canvas, data);
});

function loopSort() {
    if (i < data.length) {
        if (j < data.length - i - 1) {
            if (data[j] > data[j + 1]) {
                let temp = data[j];
                data[j] = data[j + 1];
                data[j + 1] = temp;
            }
            gambarArray(j, j + 1, context, canvas, data);
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
        gambarArray(-1, -1, context, canvas, data);
    }
}
