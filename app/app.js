import { init_graphics, finish_drawing } from "../lib/graflib.js";
import { gambarArray, animateSwap } from "./render.js";
import { data, proses, setCanvas } from "./state.js";
import { initDrag } from "./drag.js";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startBubbleSort(data, canvas, info) {
    const n = data.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Highlight elemen yang dibandingkan
            gambarArray(canvas.height, j, j + 1);
            finish_drawing();
            await sleep(300);

            if (data[j] > data[j + 1]) {
                // Info swap
                info.innerText = `Menukar ${data[j]} dan ${data[j + 1]}...`;

                // Tukar elemen
                [data[j], data[j + 1]] = [data[j + 1], data[j]];

                // Animasi swap
                await animateSwap(canvas.height, j, j + 1);
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

    // Tombol acak data
    btnAcak.onclick = () => {
        if (proses) return;
        data.length = 0;

        const jumlah = Math.floor(Math.random() * 5) + 5; // 5–9 elemen
        for (let i = 0; i < jumlah; i++) {
            data.push(Math.floor(Math.random() * 9) + 1); // angka 1–9
        }

        input.value = data.join(",");
        info.innerText = "Data acak dibuat. Klik 'Mulai'.";
        gambarArray(canvas.height);
        finish_drawing();
    };

    // Tombol mulai sorting
    btnMulai.onclick = async () => {
        if (proses) return;

        const inputVal = input.value.trim();
        if (!inputVal) {
            info.innerText = "Input data kosong. Klik 'Acak'.";
            return;
        }

        // Parsing input ke array angka
        let parsed;
        try {
            parsed = inputVal.split(",").map(x => parseInt(x.trim()));
            if (parsed.some(isNaN) || parsed.some(x => x <= 0)) throw new Error();
        } catch {
            info.innerText = "Format data salah. Contoh: 5,3,8,2.";
            return;
        }

        // Set data baru
        data.length = 0;
        data.push(...parsed);

        info.innerText = "Proses sorting sedang berjalan...";
        await startBubbleSort(data, canvas, info);
    };

    // Tampilkan array awal
    gambarArray(canvas.height);
    finish_drawing();
};
