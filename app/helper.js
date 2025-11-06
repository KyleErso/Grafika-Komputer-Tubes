// app/helpers.js
import { canvasElement } from "./state.js";

// Get mouse position relative to canvas (account for CSS scaling)
export function getMousePos(e) {
    if (!canvasElement) return [0,0];
    const rect = canvasElement.getBoundingClientRect();
    const scaleX = canvasElement.width / rect.width;
    const scaleY = canvasElement.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    return [mx, my];
}

// Determine which box index the (mx,my) hits
export function getBoxAt(mx, my, data, canvasHeight, LEBAR_KOTAK, JARAK_KOTAK, START_X, START_Y_OFFSET, SKALA_TINGGI) {
    for (let k = 0; k < data.length; k++) {
        const tinggi = data[k] * SKALA_TINGGI;
        const x_pos = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * k;
        const y_pos = canvasHeight - tinggi - START_Y_OFFSET;
        if (mx >= x_pos && mx <= x_pos + LEBAR_KOTAK && my >= y_pos && my <= y_pos + tinggi) {
            return k;
        }
    }
    return -1;
}
