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


// Swap 1-1 dengan highlight halus
export async function animateSwap(h, iA, iB) {
  // 1Highlight kedua bar
  gambarArray(h, iA, iB);
  finish_drawing();
  await new Promise(r => setTimeout(r, 500));
  // Tukar data
  [data[iA], data[iB]] = [data[iB], data[iA]];
  // Highlight lagi setelah swap
  gambarArray(h, iA, iB);
  finish_drawing();
  await new Promise(r => setTimeout(r, 500));
  // Gambar normal tanpa highlight
  gambarArray(h);
  finish_drawing();
}

