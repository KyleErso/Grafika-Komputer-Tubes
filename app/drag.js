import { getMousePos, getBoxAt } from "./helper.js";
import {
    data,
    canvasHeight,
    LEBAR_KOTAK,
    JARAK_KOTAK,
    START_X,
    START_Y_OFFSET,
    SKALA_TINGGI,
    WARNA_SWAP
} from "./state.js";
import { gambarArray } from "./render.js";
import { clearWhite, draw_filled_rect, finish_drawing } from "../lib/graflib.js";

let isDragging = false;
let dragIndex = -1;
let mouseX = 0, mouseY = 0;
let dragOffsetX = 0, dragOffsetY = 0;
let infoElem = null, inputField = null;

/**
 * Inisialisasi fitur drag pada canvas.
 * Menghubungkan event mouse dengan fungsi handler.
 */
export function initDrag(canvas, info, input) {
    infoElem = info;
    inputField = input;

    canvas.addEventListener("mousedown", e => onMouseDown(e));
    canvas.addEventListener("mousemove", e => onMouseMove(e));
    canvas.addEventListener("mouseup", e => onMouseUp(e));
    canvas.addEventListener("mouseout", e => onMouseUp(e)); 
}

/**
 * Menggambar ulang seluruh canvas,
 * dan kalau sedang drag, gambar bar yang di-drag di posisi kursor.
 */
function redrawCanvas() {
    clearWhite();

    // Gambar semua bar, kecuali yang sedang di-drag
    gambarArray(canvasHeight, -1, -1, isDragging ? dragIndex : -1);

    // Gambar bar yang sedang di-drag mengikuti posisi mouse
    if (isDragging && dragIndex !== -1) {
        const tinggi = data[dragIndex] * SKALA_TINGGI;
        const x = mouseX - dragOffsetX;
        const y = mouseY - dragOffsetY;
        draw_filled_rect(x, y, LEBAR_KOTAK, tinggi, WARNA_SWAP);
    }

    finish_drawing();
}

/**
 * Ketika mouse ditekan → cek apakah klik mengenai bar mana.
 * Jika iya, aktifkan mode drag.
 */
function onMouseDown(e) {
    [mouseX, mouseY] = getMousePos(e);
    dragIndex = getBoxAt(
        mouseX, mouseY,
        data, canvasHeight,
        LEBAR_KOTAK, JARAK_KOTAK, START_X, START_Y_OFFSET, SKALA_TINGGI
    );
// Jika mengenai bar, mulai drag
    if (dragIndex !== -1) {
        isDragging = true;
        const tinggi = data[dragIndex] * SKALA_TINGGI;
        const x_pos = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * dragIndex;
        const y_pos = canvasHeight - tinggi - START_Y_OFFSET;

        // Simpan offset agar posisi bar tetap relatif terhadap klik
        dragOffsetX = mouseX - x_pos;
        dragOffsetY = mouseY - y_pos;

        if (infoElem) infoElem.innerText = "onclick kotak " + data[dragIndex] + "...";
        redrawCanvas();
    }
}

/**
 * Saat mouse digerakkan (drag aktif) → update posisi kursor dan redraw.
 */
function onMouseMove(e) {
    if (!isDragging) return;
    [mouseX, mouseY] = getMousePos(e);
    redrawCanvas();
}


 // Saat mouse dilepas - lepas mode drag, dan jika dilepas di atas bar lain = tukar posisi.
 
function onMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;

    const [mx, my] = getMousePos(e);
    const dropIndex = getBoxAt(
        mx, my,
        data, canvasHeight,
        LEBAR_KOTAK, JARAK_KOTAK, START_X, START_Y_OFFSET, SKALA_TINGGI
    );

    // Jika dilepas di atas bar lain →-tukar posisi data
    if (dropIndex !== -1 && dropIndex !== dragIndex) {
        if (infoElem) infoElem.innerText = `Menukar ${data[dragIndex]} dengan ${data[dropIndex]}.`;
        [data[dragIndex], data[dropIndex]] = [data[dropIndex], data[dragIndex]];

        if (inputField) inputField.value = data.join(",");
    } else {
        if (infoElem) infoElem.innerText = "dibatalkan";
    }

    dragIndex = -1;
    redrawCanvas();
}
