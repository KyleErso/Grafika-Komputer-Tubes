import { init_graphics, finish_drawing } from "../lib/graflib.js";
import { data, proses, setCanvas } from "./state.js";
import { gambarArray, animateSwap } from "./render.js";
import { initDrag } from "./drag.js";

// Fungsi jeda (delay)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Bubble Sort dengan animasi visual
 * - Tidak memakai callback
 * - Langsung menggambar & menukar elemen di layar
 */
async function startBubbleSort(data, canvas, info) {
    const n = data.length;

    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            // Highlight elemen yang dibandingkan
            gambarArray(canvas.height, j, j + 1);
            finish_drawing();
            await sleep(300);

            // Jika urutan salah → tukar
            if (data[j] > data[j + 1]) {
                info.innerText = `Menukar ${data[j]} dan ${data[j + 1]}...`;
                await animateSwap(canvas.height, j, j + 1); // animasi sekaligus ubah array
            }
        }
    }

    // Setelah selesai
    info.innerText = "Sorting selesai!";
    gambarArray(canvas.height);
    finish_drawing();
}

window.onload = () => {
    // Ambil elemen HTML
    const canvas = document.getElementById("kanvasUtama");
    const info = document.getElementById("info");
    const input = document.getElementById("inputData");
    const btnAcak = document.getElementById("btnAcak");
    const btnMulai = document.getElementById("btnMulai");

    // Inisialisasi canvas & drag
    setCanvas(canvas);
    init_graphics("kanvasUtama");
    initDrag(canvas, info, input);

    // Tombol "Acak" → buat data baru
    btnAcak.onclick = () => {
        if (proses) return;
        data.length = 0;

        const jumlah = Math.floor(Math.random() * 5) + 5; // 5–9 data
        for (let i = 0; i < jumlah; i++) {
            data.push(Math.floor(Math.random() * 9) + 1);
        }

        input.value = data.join(",");
        info.innerText = "Data acak dibuat. Klik 'Mulai'.";
        gambarArray(canvas.height);
        finish_drawing();
    };

    // Tombol "Mulai" maka jalankan sorting
    btnMulai.onclick = async () => {
        if (proses) return;

        const raw = input.value.trim();
        if (!raw) {
            info.innerText = "Input data kosong. Klik 'Acak'.";
            return;
        }

        // Parsing input
        let parsed;
    
        try {
            // Ubah string menjadi array angka di simpan di variable parsed
            parsed = raw.split(",").map(x => parseInt(x.trim()));
            if (parsed.some(isNaN) || parsed.some(x => x <= 0)) throw new Error();
        } catch {
            info.innerText = "Format data salah. Contoh: 5,3,8,2.";
            return;
        }

        // Simpan data baru ke array global di state.js
        data.length = 0;
        data.push(...parsed);

        info.innerText = "Proses sorting...";
        await startBubbleSort(data, canvas, info);
    };

    // Gambar awal
    gambarArray(canvas.height);
    finish_drawing();
};
