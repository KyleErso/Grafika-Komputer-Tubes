// Data dan status 
export let data = [];          // Array berisi nilai yang akan divisualisasikan
export let proses = false;     // Menandai apakah proses sorting sedang berjalan

// canvas 
export let canvasElement = null;
export let canvasHeight = 400; // Tinggi default canvas

// Konstanta bar
export const LEBAR_KOTAK = 60;        // Lebar setiap kotak
export const JARAK_KOTAK = 20;        // Jarak antar kotak
export const START_X = 50;            // Titik awal posisi X kotak pertama
export const START_Y_OFFSET = 20;     // Jarak dari dasar canvas
export const SKALA_TINGGI = 30;       // Faktor pengali tinggi kotak

//  Warna kotak
export const WARNA_UTAMA = { r: 0, g: 0, b: 245 };     // Biru: default
export const WARNA_HIGHLIGHT = { r: 245, g: 0, b: 0 };  // Merah: dibandingkan
export const WARNA_SWAP = { r: 0, g: 245, b: 0 };      // Hijau: sedang ditukar

// Inisialisasi canvas 
export function setCanvas(el) {
    canvasElement = el;                  // Simpan elemen canvas
    canvasHeight = el?.height || 400;    // Gunakan tinggi dari elemen (atau default 400)
}
