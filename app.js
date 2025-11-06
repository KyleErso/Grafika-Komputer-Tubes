import { init_graphics, finish_drawing, clearWhite, draw_filled_rect ,draw_polygon,fillMatrix,get_warna_titik,} from './lib/graflib.js';
import { createTranslation, transform_array } from './lib/transform_matrix.js';
import { startBubbleSort, sleep } from './algoritma/sorting.js';

// --- Variabel Global & State ---
let data = [];
let proses = false;
let infoStatus = document.getElementById("info");
let inputField = document.getElementById("inputData");
let canvasHeight; // Akan diisi saat init

// Variabel baru untuk Drag-and-Drop
let isDragging = false;
let dragIndex = -1; // Index kotak yang sedang di-drag
let dragOffsetX = 0; // Posisi X mouse relatif ke pojok kiri kotak
let dragOffsetY = 0; // Posisi Y mouse relatif ke pojok atas kotak
let mouseX = 0; // Posisi X mouse terakhir
let mouseY = 0; // Posisi Y mouse terakhir
let canvasElement; // Untuk menyimpan elemen canvas

// --- Konstanta Visualisasi ---
const LEBAR_KOTAK = 60;
const JARAK_KOTAK = 20;
const START_X = 50;
const START_Y_OFFSET = 20; // Jarak dari bawah canvas
const SKALA_TINGGI = 30; // Pengali tinggi
const WARNA_UTAMA = { r: 66, g: 135, b: 245 };
const WARNA_HIGHLIGHT = { r: 245, g: 66, b: 66 };
const WARNA_SWAP = { r: 66, g: 245, b: 135 };

// --- Inisialisasi ---
// (Kita bungkus dalam window.onload untuk memastikan canvas siap)
window.onload = () => {
    init_graphics("kanvasUtama"); // ID dari HTML

    // const canvas = document.getElementById("kanvasUtama"); // Kode lama
    canvasElement = document.getElementById("kanvasUtama"); // Kode baru

    // if (canvas) { // Kode lama
    if (canvasElement) { // Kode baru
        // canvasHeight = canvas.height; // Kode lama
        canvasHeight = canvasElement.height; // Kode baru

        // --- Event Listeners baru untuk Drag-and-Drop ---
        // Dibuat manual dan sederhana
        canvasElement.addEventListener('mousedown', onMouseDown);
        canvasElement.addEventListener('mousemove', onMouseMove);
        canvasElement.addEventListener('mouseup', onMouseUp);
        canvasElement.addEventListener('mouseout', onMouseUp); // Hentikan drag jika mouse keluar

    } else {
        console.error("Gagal mendapatkan tinggi canvas.");
        canvasHeight = 400; // Fallback
    }

    // Gambar kondisi awal (kosong)
    gambarArray([], -1, -1);
    finish_drawing();
};


// --- Helper baru untuk Mouse & Drag ---

// Fungsi baru untuk menggambar ulang seluruh canvas
// Ini akan dipanggil oleh fungsi drag-and-drop
function redrawCanvas() {
    // Jangan gambar ulang jika sedang sorting
    if (proses) return;

    clearWhite();

    // Gambar semua bar, lewati bar yang sedang di-drag
    // Kita gunakan parameter 'swapA' sebagai 'skipIndex'
    gambarArray(data, -1, -1, isDragging ? dragIndex : -1);

    // Gambar bar yang di-drag secara manual di posisi mouse
    if (isDragging && dragIndex !== -1) {
        const tinggi = data[dragIndex] * SKALA_TINGGI;
        // Hitung posisi kiri-atas kotak dari posisi mouse dan offset
        const x_pos = mouseX - dragOffsetX;
        const y_pos = mouseY - dragOffsetY;

        // Gunakan WARNA_SWAP agar terlihat menonjol
        draw_filled_rect(x_pos, y_pos, LEBAR_KOTAK, tinggi, WARNA_SWAP);
    }

    finish_drawing();
}

// Fungsi helper untuk mendapatkan posisi mouse relatif terhadap canvas
// (Memperhitungkan jika canvas di-scaling oleh CSS)
function getMousePos(e) {
    const rect = canvasElement.getBoundingClientRect();
    const scaleX = canvasElement.width / rect.width;
    const scaleY = canvasElement.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    return [mx, my];
}

// Fungsi helper untuk mengecek apakah mouse ada di atas kotak
// Mengembalikan index kotak, atau -1 jika tidak
function getBoxAt(mx, my) {
    // Kita harus iterasi data untuk menemukan kotak yang diklik
    for (let k = 0; k < data.length; k++) {
        const tinggi = data[k] * SKALA_TINGGI;
        const x_pos = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * k;
        const y_pos = canvasHeight - tinggi - START_Y_OFFSET;
        const w = LEBAR_KOTAK;
        const h = tinggi;

        // Cek apakah (mx, my) ada di dalam kotak ini
        if (mx >= x_pos && mx <= x_pos + w && my >= y_pos && my <= y_pos + h) {
            return k; // Ditemukan! Kembalikan index-nya
        }
    }
    return -1; // Tidak ada kotak yang diklik
}


// --- Fungsi Rendering (Menggunakan Graflib) ---
function gambarArray(dataArr, highlightA = -1, highlightB = -1, swapA = -1, swapB = -1) {
    clearWhite(); // Bersihkan canvas

    for (let k = 0; k < dataArr.length; k++) {
        if (k === swapA || k === swapB) continue;

        const tinggi = dataArr[k] * SKALA_TINGGI;
        const x_pos = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * k;
        const y_pos = canvasHeight - tinggi - START_Y_OFFSET;

        let warna = WARNA_UTAMA;
        if (k === highlightA || k === highlightB) {
            warna = WARNA_HIGHLIGHT;
        }

        draw_filled_rect(x_pos, y_pos, LEBAR_KOTAK, tinggi, warna);
    }
}

// --- Fungsi Animasi (Menggunakan Transform & Graflib) ---
function animateSwap(indexA, indexB) {
    return new Promise(resolve => {
        const tinggiA = data[indexA] * SKALA_TINGGI;
        const xA = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * indexA;
        const yA = canvasHeight - tinggiA - START_Y_OFFSET;
        const baseRectA = [
            { x: 0, y: 0 }, { x: LEBAR_KOTAK, y: 0 },
            { x: LEBAR_KOTAK, y: tinggiA }, { x: 0, y: tinggiA }
        ];

        const tinggiB = data[indexB] * SKALA_TINGGI;
        const xB = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * indexB;
        const yB = canvasHeight - tinggiB - START_Y_OFFSET;
        const baseRectB = [
            { x: 0, y: 0 }, { x: LEBAR_KOTAK, y: 0 },
            { x: LEBAR_KOTAK, y: tinggiB }, { x: 0, y: tinggiB }
        ];

        const jarakGerak = xB - xA;
        const totalSteps = 20; // Jumlah frame animasi
        let currentStep = 0;

        function animFrame() {
            if (currentStep > totalSteps) {
                // Tukar data di array UTAMA
                let temp = data[indexA];
                data[indexA] = data[indexB];
                data[indexB] = temp;
                resolve(); // Selesaikan Promise
                return;
            }

            // 1. Gambar semua bar statis
            gambarArray(data, -1, -1, indexA, indexB);

            // 2. Hitung progresi animasi
            const progress = currentStep / totalSteps;
            const txA = jarakGerak * progress; // A ke kanan
            const txB = -jarakGerak * progress; // B ke kiri

            // 3. Buat Matriks Translasi
            const matA = createTranslation(xA + txA, yA);
            const matB = createTranslation(xB + txB, yB);

            // 4. Terapkan Matriks
            const titikA = transform_array(baseRectA, matA);
            const titikB = transform_array(baseRectB, matB);

            // 5. Gambar kotak yang bergerak
            draw_polygon(titikA, WARNA_SWAP);
            draw_polygon(titikB, WARNA_SWAP);

            // 6. Isi warna
            const cA = { x: (xA + txA + LEBAR_KOTAK / 2), y: (yA + tinggiA / 2) };
            fillMatrix(cA.x, cA.y, get_warna_titik(cA.x, cA.y), WARNA_SWAP);

            const cB = { x: (xB + txB + LEBAR_KOTAK / 2), y: (yB + tinggiB / 2) };
            fillMatrix(cB.x, cB.y, get_warna_titik(cB.x, cB.y), WARNA_SWAP);

            // 7. Tampilkan ke canvas
            finish_drawing();

            currentStep++;
            // Gunakan requestAnimationFrame untuk animasi yang lebih mulus
            requestAnimationFrame(animFrame);
        }

        animFrame(); // Mulai frame pertama
    });
}

// --- Event Listeners untuk Mouse (Drag-and-Drop) ---

function onMouseDown(e) {
    // Jangan izinkan drag jika sorting sedang berjalan
    if (proses) return;

    [mouseX, mouseY] = getMousePos(e);
    dragIndex = getBoxAt(mouseX, mouseY);

    if (dragIndex !== -1) {
        // Ya, kita mengklik sebuah kotak!
        isDragging = true;

        // Hitung offset klik (posisi klik relatif ke pojok kiri atas kotak)
        // Ini agar kotak tidak "melompat" ke posisi kursor
        const tinggi = data[dragIndex] * SKALA_TINGGI;
        const x_pos = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * dragIndex;
        const y_pos = canvasHeight - tinggi - START_Y_OFFSET;

        dragOffsetX = mouseX - x_pos;
        dragOffsetY = mouseY - y_pos;

        infoStatus.innerText = "Dragging kotak " + data[dragIndex] + "...";
        redrawCanvas(); // Gambar ulang untuk "mengambil" kotak
    }
}

function onMouseMove(e) {
    // Hanya jalankan jika sedang drag DAN tidak sedang sorting
    if (!isDragging || proses) return;

    [mouseX, mouseY] = getMousePos(e);

    // Gambar ulang canvas di setiap gerakan mouse
    redrawCanvas();
}

function onMouseUp(e) {
    // Hanya jalankan jika kita sebelumnya sedang drag
    if (!isDragging) return;

    isDragging = false;

    // Dapatkan posisi mouse saat ini
    const [mx, my] = getMousePos(e);

    // Cek apakah kita meletakkannya di atas kotak lain
    const dropIndex = getBoxAt(mx, my);

    if (dropIndex !== -1 && dropIndex !== dragIndex) {
        // Ya, kita letakkan di atas kotak lain!
        // Tukar data di array
        infoStatus.innerText = `Menukar ${data[dragIndex]} dengan ${data[dropIndex]}.`;

        let temp = data[dragIndex];
        data[dragIndex] = data[dropIndex];
        data[dropIndex] = temp;

        // Perbarui juga input field agar konsisten
        inputField.value = data.join(",");

    } else {
        // Dilepas di tempat kosong
        infoStatus.innerText = "Drag dibatalkan.";
    }

    dragIndex = -1;
    redrawCanvas(); // Gambar ulang ke posisi akhir
}


// --- Event Listeners (Tombol) ---

document.getElementById("btnMulai").addEventListener("click", function () {
    if (proses) return;

    // 1. Baca dan parse data
    let input = inputField.value;
    if (!input) {
        infoStatus.innerText = "Input data kosong. Klik 'Acak'.";
        return;
    }

    try {
        data = input.split(",").map(x => {
            const num = parseInt(x.trim());
            if (num <= 0) throw new Error("Data tidak boleh 0 atau negatif");
            return num;
        });
        if (data.some(isNaN)) throw new Error("Data tidak valid");
    } catch (e) {
        infoStatus.innerText = "Format data salah. Contoh: 5,3,8,2. Hanya angka positif.";
        return;
    }

    proses = true;
    infoStatus.innerText = "Proses sorting sedang berjalan...";

    // 2. Definisikan Callbacks untuk Algoritma
    const callbacks = {
        onCompare: async (a, b) => {
            gambarArray(data, a, b);
            finish_drawing();
            await sleep(400); // Jeda untuk perbandingan
        },

        onSwap: async (a, b) => {
            infoStatus.innerText = `Menukar ${data[a]} dan ${data[b]}...`;
            await animateSwap(a, b); // Menunggu animasi selesai
        },

        onFinish: async (sortedArray) => {
            infoStatus.innerText = "Sorting selesai!";
            proses = false;
            data = sortedArray; // Update data global ke versi sorted
            gambarArray(data, -1, -1);
            finish_drawing();
        }
    };

    // 3. Panggil Algoritma
    startBubbleSort(data, callbacks);
});

document.getElementById("btnAcak").addEventListener("click", function () {
    if (proses) return;
    data = [];
    let jumlah = Math.floor(Math.random() * 5) + 5; // Acak 5-9 data
    for (let x = 0; x < jumlah; x++) {
        data.push(Math.floor(Math.random() * 9) + 1); // Angka 1-9
    }
    inputField.value = data.join(",");
    infoStatus.innerText = "Data acak dibuat. Klik 'Mulai'.";

    gambarArray(data);
    finish_drawing();
});