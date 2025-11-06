import { clearWhite, draw_filled_rect, draw_polygon, fillMatrix, get_warna_titik, finish_drawing } from "../lib/graflib.js";
import { createTranslation, transform_array } from "../lib/transform_matrix.js";
import { data, LEBAR_KOTAK, JARAK_KOTAK, START_X, START_Y_OFFSET, SKALA_TINGGI, WARNA_UTAMA, WARNA_HIGHLIGHT, WARNA_SWAP } from "./state.js";

export function gambarArray(canvasHeight, highlightA = -1, highlightB = -1, skipA = -1, skipB = -1) {
    clearWhite();
    for (let k = 0; k < data.length; k++) {
        if (k === skipA || k === skipB) continue;
        const tinggi = data[k] * SKALA_TINGGI;
        const x = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * k;
        const y = canvasHeight - tinggi - START_Y_OFFSET;
        const warna = (k === highlightA || k === highlightB) ? WARNA_HIGHLIGHT : WARNA_UTAMA;
        draw_filled_rect(x, y, LEBAR_KOTAK, tinggi, warna);
    }
}

export function animateSwap(canvasHeight, indexA, indexB) {
    return new Promise(resolve => {
        const totalSteps = 20;
        let step = 0;
        const tinggiA = data[indexA] * SKALA_TINGGI;
        const tinggiB = data[indexB] * SKALA_TINGGI;

        const xA = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * indexA;
        const yA = canvasHeight - tinggiA - START_Y_OFFSET;
        const xB = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * indexB;
        const yB = canvasHeight - tinggiB - START_Y_OFFSET;

        const baseA = [{x:0,y:0},{x:LEBAR_KOTAK,y:0},{x:LEBAR_KOTAK,y:tinggiA},{x:0,y:tinggiA}];
        const baseB = [{x:0,y:0},{x:LEBAR_KOTAK,y:0},{x:LEBAR_KOTAK,y:tinggiB},{x:0,y:tinggiB}];

        const jarak = xB - xA;

        function frame() {
            if (step > totalSteps) {
                [data[indexA], data[indexB]] = [data[indexB], data[indexA]];
                resolve();
                return;
            }

            gambarArray(canvasHeight, -1, -1, indexA, indexB);
            const p = step / totalSteps;
            const txA = jarak * p;
            const txB = -jarak * p;

            const matA = createTranslation(xA + txA, yA);
            const matB = createTranslation(xB + txB, yB);
            const tA = transform_array(baseA, matA);
            const tB = transform_array(baseB, matB);

            draw_polygon(tA, WARNA_SWAP);
            draw_polygon(tB, WARNA_SWAP);

            const cA = { x: xA + txA + LEBAR_KOTAK / 2, y: yA + tinggiA / 2 };
            const cB = { x: xB + txB + LEBAR_KOTAK / 2, y: yB + tinggiB / 2 };
            fillMatrix(cA.x, cA.y, get_warna_titik(cA.x, cA.y), WARNA_SWAP);
            fillMatrix(cB.x, cB.y, get_warna_titik(cB.x, cB.y), WARNA_SWAP);

            finish_drawing();
            step++;
            requestAnimationFrame(frame);
        }

        frame();
    });
}
