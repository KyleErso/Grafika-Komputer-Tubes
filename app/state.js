// Variabel global & konstanta visualisasi
export let data = [];
export let proses = false;

export let canvasElement = null;
export let canvasHeight = 400;

export const LEBAR_KOTAK = 60;
export const JARAK_KOTAK = 20;
export const START_X = 50;
export const START_Y_OFFSET = 20;
export const SKALA_TINGGI = 30;

export const WARNA_UTAMA = { r: 66, g: 135, b: 245 };
export const WARNA_HIGHLIGHT = { r: 245, g: 66, b: 66 };
export const WARNA_SWAP = { r: 66, g: 245, b: 135 };

export function setCanvas(el) {
    canvasElement = el;
    canvasHeight = el?.height || 400;
}
