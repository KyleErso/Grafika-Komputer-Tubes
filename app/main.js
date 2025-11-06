import { init_graphics, finish_drawing } from "../lib/graflib.js";
import { data, setCanvas } from "./state.js";
import { gambarArray, animateSwap } from "./render.js";
import { initDrag } from "./drag.js";
import { startMistletoe, stopMistletoe } from "./mistletoe.js";

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function startBubbleSort(canvas) {
  const n = data.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      gambarArray(canvas.height, j, j + 1); 
      finish_drawing();
      await sleep(200);
      if (data[j] > data[j + 1]) {
        await animateSwap(canvas.height, j, j + 1);
      }
    }
  }
  gambarArray(canvas.height);
  finish_drawing();
}

window.onload = () => {
  const canvas = document.getElementById("kanvasUtama");
  const input = document.getElementById("inputData");
  const btnAcak = document.getElementById("btnAcak");
  const btnMulai = document.getElementById("btnMulai");

  setCanvas(canvas);
  init_graphics("kanvasUtama");
  initDrag(canvas);


  btnAcak.onclick = () => {
    data.length = 0;
    const jumlah = Math.floor(Math.random() * 5) + 5;
    for (let i = 0; i < jumlah; i++) data.push(Math.floor(Math.random() * 9) + 1);
    input.value = data.join(",");
    gambarArray(canvas.height);
    finish_drawing();
  };

  btnMulai.onclick = async () => {
    const parsed = input.value
      .split(",")
      .map(x => parseInt(x.trim()))
      .filter(x => !isNaN(x) && x > 0);
    if (!parsed.length) return;
    data.splice(0, data.length, ...parsed);
    await startBubbleSort(canvas);
  };

  gambarArray(canvas.height);
  finish_drawing();
};
