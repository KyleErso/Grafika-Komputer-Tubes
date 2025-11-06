import { clearWhite, draw_filled_rect, finish_drawing } from "../lib/graflib.js";
import {data, LEBAR_KOTAK, JARAK_KOTAK,START_X, START_Y_OFFSET, SKALA_TINGGI,WARNA_UTAMA, WARNA_HIGHLIGHT} from "./state.js";

// Gambar seluruh Batang array * Ukuran di state.js 
export function gambarArray(h, a = -1, b = -1) {
  clearWhite();
  data.forEach((val, i) => {
    draw_filled_rect( START_X + (LEBAR_KOTAK + JARAK_KOTAK) * i, h - val * SKALA_TINGGI - START_Y_OFFSET, LEBAR_KOTAK, val * SKALA_TINGGI, (i === a || i === b) ? WARNA_HIGHLIGHT : WARNA_UTAMA);
  });
  finish_drawing();
}


// Animasi penukaran dua batang pakai drawing dan delay
export async function animateSwap(h, iA, iB) {
  gambarArray(h, iA, iB);
  finish_drawing();
  await new Promise(r => setTimeout(r, 500));
  [data[iA], data[iB]] = [data[iB], data[iA]];
  gambarArray(h, iA, iB);
  finish_drawing();
  await new Promise(r => setTimeout(r, 500));
  gambarArray(h);
  finish_drawing();
}

