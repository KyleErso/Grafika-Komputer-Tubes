import {
    clearWhite,
    draw_filled_rect,
    draw_polygon,
    fillMatrix,
    get_warna_titik,
    finish_drawing
} from "../lib/graflib.js";

import { createTranslation, transform_array } from "../lib/transform_matrix.js";

import {
    data,
    LEBAR_KOTAK,
    JARAK_KOTAK,
    START_X,
    START_Y_OFFSET,
    SKALA_TINGGI,
    WARNA_UTAMA,
    WARNA_HIGHLIGHT,
    WARNA_SWAP
} from "./state.js";


// Menggambar seluruh array data dalam bentuk batang (bar chart).
// highlightA & highlightB digunakan untuk memberi warna khusus.

export function gambarArray(canvasHeight, highlightA = -1, highlightB = -1, skipA = -1, skipB = -1) {
    clearWhite(); // bersihkan kanvas

    for (let k = 0; k < data.length; k++) {
        // Lewati bar yang sedang dianimasikan
        if (k === skipA || k === skipB) continue;

        const tinggi = data[k] * SKALA_TINGGI;
        const x = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * k;
        const y = canvasHeight - tinggi - START_Y_OFFSET;

        // Warna bar biasa atau highlight
        const warna = (k === highlightA || k === highlightB) ? WARNA_HIGHLIGHT : WARNA_UTAMA;

        // Gambar batang dengan fungsi dari graflib.js
        draw_filled_rect(x, y, LEBAR_KOTAK, tinggi, warna);
    }
}

/**
 * Animasikan pertukaran (swap) dua batang di posisi indexA dan indexB.
 * Menggunakan Promise agar bisa ditunggu (await) sebelum lanjut ke langkah berikutnya.
 */
export function animateSwap(canvasHeight, indexA, indexB) {
    return new Promise(resolve => {
        const totalSteps = 20;
        let step = 0;

        // Hitung posisi awal dan tinggi masing-masing bar
        const tinggiA = data[indexA] * SKALA_TINGGI;
        const tinggiB = data[indexB] * SKALA_TINGGI;

        const xA = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * indexA;
        const yA = canvasHeight - tinggiA - START_Y_OFFSET;
        const xB = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * indexB;
        const yB = canvasHeight - tinggiB - START_Y_OFFSET;

        // Bentuk dasar kotak sebelum translasi
        const baseA = [
            { x: 0, y: 0 },
            { x: LEBAR_KOTAK, y: 0 },
            { x: LEBAR_KOTAK, y: tinggiA },
            { x: 0, y: tinggiA }
        ];
        const baseB = [
            { x: 0, y: 0 },
            { x: LEBAR_KOTAK, y: 0 },
            { x: LEBAR_KOTAK, y: tinggiB },
            { x: 0, y: tinggiB }
        ];

        const jarak = xB - xA; // jarak horizontal antar bar

        // Fungsi untuk tiap frame animasi
        function frame() {
            if (step > totalSteps) {
                // Setelah animasi selesai → tukar data di array
                [data[indexA], data[indexB]] = [data[indexB], data[indexA]];
                resolve();
                return;
            }

            // Gambar ulang background tanpa 2 bar yang bergerak
            gambarArray(canvasHeight, -1, -1, indexA, indexB);

            // Hitung posisi sementara berdasarkan langkah ke-step
            const p = step / totalSteps;
            const txA = jarak * p;
            const txB = -jarak * p;

            // Matriks translasi untuk tiap bar
            const matA = createTranslation(xA + txA, yA);
            const matB = createTranslation(xB + txB, yB);

            // Transformasikan koordinat dasar ke posisi baru
            const tA = transform_array(baseA, matA);
            const tB = transform_array(baseB, matB);

            // Gambar outline dan isi kedua bar yang sedang bergerak
            draw_polygon(tA, WARNA_SWAP);
            draw_polygon(tB, WARNA_SWAP);

            const cA = { x: Math.round(xA + txA + LEBAR_KOTAK / 2), y: Math.round(yA + tinggiA / 2) };
            const cB = { x: Math.round(xB + txB + LEBAR_KOTAK / 2), y: Math.round(yB + tinggiB / 2) };

            fillMatrix(cA.x, cA.y, get_warna_titik(cA.x, cA.y), WARNA_SWAP);
            fillMatrix(cB.x, cB.y, get_warna_titik(cB.x, cB.y), WARNA_SWAP);

            finish_drawing();
            step++;
            requestAnimationFrame(frame); // lanjut frame berikutnya
        }

        frame(); // mulai animasi
    });
}
