// graflib.js
export function gambarArray(a, b, context, canvas, data) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let lebar = 50;
    let jarak = 15;
    let startX = 60;
    let warnaPelangi = ["#ff595e","#ffca3a","#8ac926","#1982c4","#6a4c93","#ff924c"];

    for (let k = 0; k < data.length; k++) {
        let tinggi = data[k] * 25;
        let warna = warnaPelangi[k % warnaPelangi.length];
        if (k === a || k === b) warna = "tomato";

        drawRect(startX + (lebar + jarak) * k, canvas.height - tinggi - 20, lebar, tinggi, warna, context);
        context.fillStyle = "black";
        context.font = "14px Arial";
        context.fillText(data[k], startX + (lebar + jarak) * k + 18, canvas.height - 5);
    }
}

export function drawRect(x, y, w, h, warna, context) {
    context.fillStyle = warna;
    context.fillRect(x, y, w, h);
}
