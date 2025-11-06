// lib/graflib.js
// Gabungan: primitives drawing + utility + mistletoe animation.
// Menggunakan willReadFrequently untuk optimisasi getImageData.

import {
  createTranslation,
  multiplyMatrices,
  rotation_fp,
  transform_array
} from "./transform_matrix.js";

// ---------- internal state ----------
let imagedata = null;
let canvas_handler = null;
let contex = null;

// ---------- low-level pixel helpers ----------
export function init_graphics(nama_canvas = "myCanvas") {
  canvas_handler = document.getElementById(nama_canvas);
  if (!canvas_handler) {
    throw new Error(`Canvas "${nama_canvas}" tidak ditemukan`);
  }
  // bila banyak readback, beri opsi ini agar engine optimalkan
  contex = canvas_handler.getContext("2d", { willReadFrequently: true });
  imagedata = contex.getImageData(0, 0, canvas_handler.width, canvas_handler.height);
}

export function finish_drawing() {
  if (!contex || !imagedata) return;
  contex.putImageData(imagedata, 0, 0);
}

export function clearWhite() {
  if (!imagedata) return;
  for (let i = 0; i < imagedata.data.length; i += 4) {
    imagedata.data[i] = 255;
    imagedata.data[i + 1] = 255;
    imagedata.data[i + 2] = 255;
    imagedata.data[i + 3] = 255;
  }
}

// safe read pixel (rounded coords)
export function get_warna_titik(x, y) {
  if (!imagedata) return { r: 0, g: 0, b: 0, a: 0 };
  const xr = Math.round(x), yr = Math.round(y);
  if (xr < 0 || yr < 0 || xr >= canvas_handler.width || yr >= canvas_handler.height)
    return { r: 0, g: 0, b: 0, a: 0 };
  const idx = 4 * (xr + yr * canvas_handler.width);
  return {
    r: imagedata.data[idx],
    g: imagedata.data[idx + 1],
    b: imagedata.data[idx + 2],
    a: imagedata.data[idx + 3] ?? 255
  };
}

export function draw_dot(x, y, color) {
  if (!imagedata) return;
  const xr = Math.round(x), yr = Math.round(y);
  if (xr < 0 || yr < 0 || xr >= canvas_handler.width || yr >= canvas_handler.height) return;
  const idx = 4 * (xr + yr * canvas_handler.width);
  imagedata.data[idx] = color.r;
  imagedata.data[idx + 1] = color.g;
  imagedata.data[idx + 2] = color.b;
  imagedata.data[idx + 3] = 255;
}

export function dda_line(x0, y0, x1, y1, color) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) {
    draw_dot(x0, y0, color);
    return;
  }
  const xi = dx / steps;
  const yi = dy / steps;
  let x = x0, y = y0;
  for (let i = 0; i <= steps; i++) {
    draw_dot(x, y, color);
    x += xi; y += yi;
  }
}

export function draw_polygon(pts, color) {
  if (!pts || pts.length < 2) return;
  for (let i = 0; i < pts.length - 1; i++) {
    dda_line(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y, color);
  }
  dda_line(pts[pts.length - 1].x, pts[pts.length - 1].y, pts[0].x, pts[0].y, color);
}

export function draw_triangle(p1, p2, p3, color) {
  dda_line(p1.x, p1.y, p2.x, p2.y, color);
  dda_line(p2.x, p2.y, p3.x, p3.y, color);
  dda_line(p3.x, p3.y, p1.x, p1.y, color);
}

export function draw_square(center, side, color) {
  const half = side / 2;
  const tl = { x: Math.round(center.x - half), y: Math.round(center.y - half) };
  const tr = { x: Math.round(center.x + half), y: Math.round(center.y - half) };
  const br = { x: Math.round(center.x + half), y: Math.round(center.y + half) };
  const bl = { x: Math.round(center.x - half), y: Math.round(center.y + half) };
  draw_polygon([tl, tr, br, bl], color);
}

export function draw_circle(center, radius, color) {
  // circle perimeter via sample (not optimal but ok)
  for (let t = 0; t <= Math.PI * 2; t += 0.01) {
    const x = center.x + radius * Math.cos(t);
    const y = center.y + radius * Math.sin(t);
    draw_dot(Math.round(x), Math.round(y), color);
  }
}

// ---------- flood-fill (stack) ----------
export function fillMatrix(x, y, color_old, color_new) {
  if (!imagedata) return;
  if (color_old.r === color_new.r && color_old.g === color_new.g && color_old.b === color_new.b) return;
  const stack = [[Math.round(x), Math.round(y)]];
  const W = canvas_handler.width, H = canvas_handler.height;
  while (stack.length) {
    const [cx, cy] = stack.pop();
    if (cx < 0 || cy < 0 || cx >= W || cy >= H) continue;
    const c = get_warna_titik(cx, cy);
    if (c.r === color_old.r && c.g === color_old.g && c.b === color_old.b) {
      draw_dot(cx, cy, color_new);
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
  }
}

// ---------- simple filled rect (outline + fill using fillMatrix) ----------
export function draw_filled_rect(x, y, w, h, color) {
  const p1 = { x: Math.round(x), y: Math.round(y) };
  const p2 = { x: Math.round(x + w), y: Math.round(y) };
  const p3 = { x: Math.round(x + w), y: Math.round(y + h) };
  const p4 = { x: Math.round(x), y: Math.round(y + h) };
  draw_polygon([p1, p2, p3, p4], color);
  const cx = Math.round(x + w / 2);
  const cy = Math.round(y + h / 2);
  const old = get_warna_titik(cx, cy);
  if (old.r !== color.r || old.g !== color.g || old.b !== color.b) {
    fillMatrix(cx, cy, old, color);
  }
}

// ---------- simple recursive fill (kept for compatibility) ----------
export function flod_fill(x, y, color_old, color_new) {
  const c = get_warna_titik(x, y);
  if (c.r === color_old.r && c.g === color_old.g && c.b === color_old.b) {
    draw_dot(x, y, color_new);
    flod_fill(x + 1, y, color_old, color_new);
    flod_fill(x - 1, y, color_old, color_new);
    flod_fill(x, y + 1, color_old, color_new);
    flod_fill(x, y - 1, color_old, color_new);
  }
}

// ---------- simple transformations utilities (keperluan internal) ----------
export function translasi(pts, T) {
  return pts.map(p => ({ x: p.x + T.x, y: p.y + T.y }));
}
export function skala(pts, S, pusat = { x: 0, y: 0 }) {
  const shifted = translasi(pts, { x: -pusat.x, y: -pusat.y });
  const scaled = shifted.map(p => ({ x: p.x * S.x, y: p.y * S.y }));
  return translasi(scaled, { x: pusat.x, y: pusat.y });
}
export function rotasi(pts, deg, pusat = { x: 0, y: 0 }) {
  const rad = (deg * Math.PI) / 180, c = Math.cos(rad), s = Math.sin(rad);
  const shifted = translasi(pts, { x: -pusat.x, y: -pusat.y });
  const rotated = shifted.map(p => ({ x: Math.round(p.x * c - p.y * s), y: Math.round(p.x * s + p.y * c) }));
  return translasi(rotated, { x: pusat.x, y: pusat.y });
}

// ---------- mistletoe animation (self-contained loop) ----------
let _running = false;
let _animationId = null;
let _state = null;

function createDefaultMistleState(canvasId = "myCanvas") {
  return {
    canvasId,
    point_array: [
      { x: 50, y: 20 }, { x: 58, y: 42 }, { x: 80, y: 42 }, { x: 62, y: 56 },
      { x: 70, y: 80 }, { x: 50, y: 65 }, { x: 30, y: 80 }, { x: 38, y: 56 },
      { x: 20, y: 42 }, { x: 42, y: 42 }
    ],
    m: createTranslation(0, 20),
    p2: null,
    trajectory: [],
    time: 0,
    stars: [],
    clouds: []
  };
}

function mistle_drawFrame() {
  const s = _state;
  const canvas = document.getElementById(s.canvasId);
  const ctx = canvas.getContext("2d");
  // clear whole canvas (we use 2D context directly here)
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // lazy init stars/clouds
  if (s.stars.length === 0) {
    for (let i = 0; i < 30; i++) s.stars.push({ x: Math.random() * canvas.width, y: Math.random() * (canvas.height - 50), size: Math.random() * 2 + 1 });
  }
  if (s.clouds.length === 0) {
    s.clouds.push({ x: 100, y: 50 });
    s.clouds.push({ x: Math.max(200, canvas.width / 2), y: 80 });
    s.clouds.push({ x: canvas.width - 150, y: 60 });
  }

  // draw stars (simple thin cross)
  for (let i = 0; i < s.stars.length; i++) {
    const st = s.stars[i];
    const bright = Math.round(150 + Math.sin(s.time * 0.05 + i) * 100);
    ctx.fillStyle = `rgb(${bright},${bright},255)`;
    ctx.fillRect(Math.round(st.x) - 1, Math.round(st.y), 2, 1);
    ctx.fillRect(Math.round(st.x), Math.round(st.y) - 1, 1, 2);
  }

  // clouds as simple polygons (drawn via our imagedata functions)
  // use graflib polygon for soft consistent look — ensure init_graphics set correct canvas before using pixel primitives
  init_graphics(s.canvasId);
  for (let i = 0; i < s.clouds.length; i++) {
    const c = s.clouds[i];
    const cloudPoly = [
      { x: c.x, y: c.y + 10 }, { x: c.x + 15, y: c.y },
      { x: c.x + 30, y: c.y + 5 }, { x: c.x + 40, y: c.y + 15 },
      { x: c.x + 30, y: c.y + 20 }, { x: c.x + 10, y: c.y + 18 }
    ];
    draw_polygon(cloudPoly, { r: 200, g: 200, b: 220 });
  }

  // transform star polygon
  s.p2 = transform_array(s.p2, s.m);
  const yMove = Math.sin(s.time * 0.03) * 2;
  const t = createTranslation(1, yMove);
  const r = rotation_fp(s.p2[0].x, s.p2[0].y, 0.02);
  s.m = multiplyMatrices(t, r);
  s.p2 = transform_array(s.p2, s.m);

  // compute center
  let sumX = 0, sumY = 0;
  for (let i = 0; i < s.p2.length; i++) { sumX += s.p2[i].x; sumY += s.p2[i].y; }
  const centerX = sumX / s.p2.length;
  const centerY = sumY / s.p2.length;
  s.trajectory.push({ x: centerX, y: centerY });
  if (s.trajectory.length > 80) s.trajectory.shift();

  // draw trajectory using pixel lines (we use dda_line which depends on current imagedata)
  for (let i = 0; i < s.trajectory.length - 1; i++) {
    const fade = Math.round((i / s.trajectory.length) * 255);
    dda_line(Math.round(s.trajectory[i].x), Math.round(s.trajectory[i].y),
             Math.round(s.trajectory[i + 1].x), Math.round(s.trajectory[i + 1].y),
             { r: 255, g: fade, b: 100 });
    if (i % 5 === 0 && i > s.trajectory.length - 20) {
      dda_line(Math.round(s.trajectory[i].x - 2), Math.round(s.trajectory[i].y),
               Math.round(s.trajectory[i].x + 2), Math.round(s.trajectory[i].y),
               { r: 255, g: 255, b: 200 });
    }
  }

  // draw star polygon (filled outline + ddalines)
  draw_polygon(s.p2, { r: 255, g: 255, b: 0 });
  for (let i = 0; i < s.p2.length; i++) {
    const p1 = s.p2[i];
    const p2 = s.p2[(i + 1) % s.p2.length];
    dda_line(Math.round(p1.x), Math.round(p1.y), Math.round(p2.x), Math.round(p2.y), { r: 255, g: 200, b: 100 });
  }

  // reset if off-screen horizontally
  if (centerX > canvas.width + 50) {
    s.p2 = transform_array(s.point_array, createTranslation(0, 20));
    s.trajectory = [];
    s.time = 0;
  }

  s.time++;
  // finally flush imagedata to visible canvas
  finish_drawing();

  if (_running) _animationId = requestAnimationFrame(mistle_drawFrame);
}

export function startMistletoe(canvasId = "myCanvas") {
  if (_running) return;
  _running = true;
  _state = createDefaultMistleState(canvasId);
  // ensure initial transform
  init_graphics(_state.canvasId);
  _state.p2 = transform_array(_state.point_array, _state.m);
  draw_polygon(_state.p2, { r: 0, g: 255, b: 0 });
  finish_drawing();
  _animationId = requestAnimationFrame(mistle_drawFrame);
}

export function stopMistletoe() {
  _running = false;
  if (_animationId) cancelAnimationFrame(_animationId);
  _animationId = null;
  _state = null;
}
