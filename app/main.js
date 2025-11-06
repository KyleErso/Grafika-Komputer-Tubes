// app/main.js
import { init_graphics, finish_drawing } from "../lib/graflib.js";
import { data, proses, setCanvas } from "./state.js";
import { gambarArray, animateSwap } from "./render.js";
import { initDrag } from "./drag.js";

// simple sleep helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Bubble sort implemented in main with animation (no callbacks)
async function startBubbleSort(data, canvas, info) {
    const n = data.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // highlight compared pair
            gambarArray(canvas.height, j, j + 1);
            finish_drawing();
            await sleep(300);

            if (data[j] > data[j + 1]) {
                info.innerText = `Menukar ${data[j]} dan ${data[j + 1]}...`;
                // animate swap (visual)
                await animateSwap(canvas.height, j, j + 1);
                // note: animateSwap performs the final swap of data array at end
                // so no need to swap again here.
            }
        }
    }

    info.innerText = "Sorting selesai!";
    gambarArray(canvas.height);
    finish_drawing();
}

window.onload = () => {
    const canvas = document.getElementById("kanvasUtama");
    const info = document.getElementById("info");
    const input = document.getElementById("inputData");
    const btnAcak = document.getElementById("btnAcak");
    const btnMulai = document.getElementById("btnMulai");

    setCanvas(canvas);
    init_graphics("kanvasUtama");
    initDrag(canvas, info, input);

    // Randomize button
    btnAcak.onclick = () => {
        if (proses) return;
        data.length = 0;
        const jumlah = Math.floor(Math.random() * 5) + 5;
        for (let i = 0; i < jumlah; i++) data.push(Math.floor(Math.random() * 9) + 1);
        input.value = data.join(",");
        info.innerText = "Data acak dibuat. Klik 'Mulai'.";
        gambarArray(canvas.height);
        finish_drawing();
    };

    // Start sorting
    btnMulai.onclick = async () => {
        if (proses) return;

        const raw = input.value.trim();
        if (!raw) {
            info.innerText = "Input data kosong. Klik 'Acak'.";
            return;
        }

        let parsed;
        try {
            parsed = raw.split(",").map(x => parseInt(x.trim()));
            if (parsed.some(isNaN) || parsed.some(x => x <= 0)) throw new Error();
        } catch {
            info.innerText = "Format data salah. Contoh: 5,3,8,2.";
            return;
        }

        data.length = 0;
        data.push(...parsed);

        info.innerText = "Proses sorting sedang berjalan...";
        await startBubbleSort(data, canvas, info);
    };

    // initial draw
    gambarArray(canvas.height);
    finish_drawing();
};
