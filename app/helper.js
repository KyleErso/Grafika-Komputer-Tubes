import { canvasElement } from "./state.js";

/**
 * Menghitung posisi kursor (mouse) terhadap posisi dan ukuran canvas sebenarnya.
 * Termasuk koreksi jika canvas diubah ukuran oleh CSS (scaling).
 **/
 
export function getMousePos(e) {
    // Dapatkan posisi dan ukuran canvas di layar
    const rect = canvasElement.getBoundingClientRect();

    // Hitung rasio scaling antara ukuran canvas asli dan ukuran tampilan di browser
    const scaleX = canvasElement.width / rect.width;
    const scaleY = canvasElement.height / rect.height;

    // Hitung posisi kursor (x,y) relatif terhadap canvas
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    return [mx, my];
}

/**
 * Mengecek apakah titik (mx,my) berada di dalam salah satu kotak data (bar).
 * Jika iya, mengembalikan index kotak tersebut. Jika tidak, mengembalikan -1.
 */
export function getBoxAt(mx, my, data, canvasHeight, LEBAR_KOTAK, JARAK_KOTAK, START_X, START_Y_OFFSET, SKALA_TINGGI) {
    // Telusuri setiap kotak (bar) satu per satu
    for (let k = 0; k < data.length; k++) {
        const tinggi = data[k] * SKALA_TINGGI; // tinggi bar berdasarkan nilai data
        const x_pos = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * k; // posisi X bar
        const y_pos = canvasHeight - tinggi - START_Y_OFFSET;    // posisi Y bar (dari bawah ke atas)

        // Periksa apakah titik (mx, my) ada di dalam area bar ke-k
        const diDalamX = mx >= x_pos && mx <= x_pos + LEBAR_KOTAK;
        const diDalamY = my >= y_pos && my <= y_pos + tinggi;

        if (diDalamX && diDalamY) {
            // Jika posisi kursor berada di dalam area bar, kembalikan index-nya
            return k;
        }
    }

    // Jika tidak mengenai bar mana pun, kembalikan -1
    return -1;
}
