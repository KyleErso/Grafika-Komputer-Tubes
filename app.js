// app.js
import {
  init_graphics,
  finish_drawing,
  draw_circle,
  draw_dot,
  draw_square,
  draw_triangle,
  draw_polygon,
  fillMatrix,
  get_warna_titik
} from './lib/graflib.js';

// DOM
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d'); // hanya untuk clearRect & event coords
const width = canvas.width;
const height = canvas.height;

let arr = [];
let running = false;
let speed = 300; // ms per step
let steps = []; // queue of steps produced by algorithm (for step-by-step replay)
let playTimer = null;

// inisialisasi graflib (penting):
init_graphics('myCanvas');

// Util: redraw canvas using graflib primitives
function clearCanvasAndSync() {
  // gunakan clearRect (diperbolehkan) lalu init_graphics untuk sinkronisasi imagedata
  ctx.clearRect(0, 0, width, height);
  init_graphics('myCanvas');
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomArray(n = 12, min = 10, max = 180) {
  const a = [];
  for (let i = 0; i < n; i++) a.push(randInt(min, max));
  return a;
}

function drawArray(current = {}) {
  // current: object yang mungkin berisi highlight ranges or colors
  clearCanvasAndSync();

  const margin = 40;
  const usableW = width - margin * 2;
  const count = arr.length;
  const gap = Math.max(6, Math.floor(usableW / count / 1.6));
  const stepX = Math.floor(usableW / count);
  const baseY = height - 40;

  for (let i = 0; i < count; i++) {
    const xCenter = margin + i * stepX + Math.floor(stepX / 2);
    const val = arr[i];
    // represent value as circle radius
    const radius = Math.max(6, Math.min(40, Math.round((val / 200) * 36)));

    // choose color: if current.step highlights index
    let color = { r: 30, g: 144, b: 255 };
    if (current && current.colors && current.colors[i]) color = current.colors[i];

    // draw circle outline using graflib (it draws outline). We'll then fill by calling fillMatrix from centroid
    draw_circle({ x: xCenter, y: baseY - val }, radius, { r: 0, g: 0, b: 0 });

    // fill: we need the centroid point inside the circle to start flood fill
    // compute centroid (center point)
    const cx = xCenter;
    const cy = baseY - val;

    // get current color at centroid (to know replacement target)
    const existing = get_warna_titik(cx, cy);
    // draw a dot of border color so flood starts from inside: set centroid to border color temporarily
    draw_dot(cx, cy, existing);
    // use fillMatrix to fill with desired color. The function expects the color to be replaced —
    // if centroid has background color (white) we pass that as color_yg_diganti
    // But better: we assume background is white (255,255,255). Use fillMatrix with that assumption.
    fillMatrix(cx, cy, { r: 255, g: 255, b: 255 }, color);

    // draw a small label of value: we can draw using draw_dot to form digits is costly — we skip text drawing.
  }

  finish_drawing();
}

// --- Merge Sort with step logging ---

function* mergeSortSteps(a) {
  // generator that yields snapshots after each merge action
  function* mergeSortRec(arrSegment, leftIndex) {
    const n = arrSegment.length;
    if (n <= 1) {
      return arrSegment.slice();
    }
    const mid = Math.floor(n / 2);
    const left = yield* mergeSortRec(arrSegment.slice(0, mid), leftIndex);
    const right = yield* mergeSortRec(arrSegment.slice(mid), leftIndex + mid);

    // merge
    const merged = [];
    let i = 0, j = 0;
    while (i < left.length || j < right.length) {
      if (j >= right.length || (i < left.length && left[i] <= right[j])) {
        merged.push(left[i++]);
      } else {
        merged.push(right[j++]);
      }
      // yield a partial view: arr with the merged subarray placed back at leftIndex
      const snapshot = a.slice();
      for (let k = 0; k < merged.length; k++) snapshot[leftIndex + k] = merged[k];
      // color highlight for the merged portion (assign rainbow-ish colors)
      const colors = snapshot.map(() => undefined);
      for (let k = 0; k < merged.length; k++) {
        colors[leftIndex + k] = {
          r: Math.floor(50 + 205 * Math.random()),
          g: Math.floor(50 + 205 * Math.random()),
          b: Math.floor(50 + 205 * Math.random())
        };
      }
      yield { snapshot, colors };
    }

    return merged;
  }

  // create a copy for step generation
  const copy = a.slice();
  const gen = mergeSortRec(copy, 0);
  // consume generator by forwarding yielded states
  let res = gen.next();
  while (!res.done) {
    yield res.value;
    res = gen.next();
  }
}

function prepareSteps(arraySource) {
  steps = [];
  const gen = mergeSortSteps(arraySource);
  for (const s of gen) {
    steps.push(s);
  }
}

// controls
const btnRandom = document.getElementById('btn-random');
const btnStep = document.getElementById('btn-step');
const btnPlay = document.getElementById('btn-play');
const btnReset = document.getElementById('btn-reset');
const btnLoad = document.getElementById('btn-load');
const inputArray = document.getElementById('input-array');
const speedRange = document.getElementById('speed');

btnRandom.addEventListener('click', () => {
  arr = generateRandomArray(12, 20, 180);
  prepareSteps(arr);
  drawArray();
});

btnReset.addEventListener('click', () => {
  if (playTimer) clearInterval(playTimer);
  running = false;
  arr = [];
  steps = [];
  clearCanvasAndSync();
  finish_drawing();
});

btnLoad.addEventListener('click', () => {
  const val = inputArray.value.trim();
  if (!val) return;
  const parts = val.split(',').map(s => parseInt(s.trim())).filter(x => !isNaN(x));
  if (parts.length === 0) return;
  arr = parts;
  prepareSteps(arr);
  drawArray();
});

btnStep.addEventListener('click', () => {
  if (steps.length === 0) {
    prepareSteps(arr);
  }
  const next = steps.shift();
  if (!next) return;
  arr = next.snapshot;
  drawArray({ colors: next.colors });
});

btnPlay.addEventListener('click', () => {
  if (running) {
    // pause
    running = false;
    btnPlay.textContent = 'Play';
    if (playTimer) clearInterval(playTimer);
    return;
  }
  running = true;
  btnPlay.textContent = 'Pause';
  if (steps.length === 0) prepareSteps(arr);
  playTimer = setInterval(() => {
    if (steps.length === 0) {
      clearInterval(playTimer);
      running = false;
      btnPlay.textContent = 'Play';
      return;
    }
    const next = steps.shift();
    arr = next.snapshot;
    drawArray({ colors: next.colors });
  }, speed);
});

speedRange.addEventListener('input', (e) => {
  speed = parseInt(e.target.value, 10);
  if (running) {
    clearInterval(playTimer);
    playTimer = setInterval(() => {
      if (steps.length === 0) { clearInterval(playTimer); running=false; btnPlay.textContent='Play'; return; }
      const next = steps.shift();
      arr = next.snapshot;
      drawArray({ colors: next.colors });
    }, speed);
  }
});

// initial
arr = generateRandomArray(12, 20, 160);
prepareSteps(arr);
drawArray();

// Interaksi: klik untuk ubah nilai (simple)
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // hit test which circle was clicked
  const margin = 40;
  const usableW = width - margin * 2;
  const stepX = Math.floor(usableW / arr.length);
  const baseY = height - 40;

  for (let i = 0; i < arr.length; i++) {
    const xCenter = margin + i * stepX + Math.floor(stepX / 2);
    const val = arr[i];
    const cy = baseY - val;
    const radius = Math.max(6, Math.min(40, Math.round((val / 200) * 36)));
    const dx = x - xCenter;
    const dy = y - cy;
    if (dx * dx + dy * dy <= radius * radius) {
      const newVal = prompt('Ubah nilai indeks ' + i + ' (nilai saat ini: ' + val + ')', String(val));
      const nv = parseInt(newVal);
      if (!isNaN(nv)) {
        arr[i] = nv;
        prepareSteps(arr);
        drawArray();
      }
      break;
    }
  }
});

