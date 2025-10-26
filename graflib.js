let imagedata;
let canvas_handler;
let contex;
let pts = []
let cols = []
let on = false
let handler = null
const BORDER = { r: 200, g: 0, b: 0 }

export function get_warna_titik(x, y) {
    let warna = { r: 0, g: 0, b: 0, a: 255 };
    let index = 4 * (x + (y * canvas_handler.width));
    warna.r = imagedata.data[index];
    warna.g = imagedata.data[index + 1];
    warna.b = imagedata.data[index + 2];
    warna.a = 255;
    return warna;
}

export function dda_line(x0, y0, x1, y1, color) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    if (steps === 0) {
        const xr = Math.round(x0), yr = Math.round(y0);
        if (xr >= 0 && yr >= 0 && xr < canvas_handler.width && yr < canvas_handler.height) {
            draw_dot(xr, yr, color);
        }
        return;
    }

    const x_inc = dx / steps;
    const y_inc = dy / steps;
    let x = x0;
    let y = y0;

    for (let i = 0; i <= steps; i++) {
        const xr = Math.round(x);
        const yr = Math.round(y);
        if (xr >= 0 && yr >= 0 && xr < canvas_handler.width && yr < canvas_handler.height) {
            draw_dot(xr, yr, color);
        }
        x += x_inc;
        y += y_inc;
    }
}

export function flod_fill(x, y, color_yg_diganti, color_baru) {
    let warna_titik = get_warna_titik(x, y);
    // console.log(warna_titik, color_yg_diganti);
    // console.log (x,y);
    if (warna_titik.r == color_yg_diganti.r && warna_titik.g == color_yg_diganti.g && warna_titik.b == color_yg_diganti.b) {
        draw_dot(x, y, color_baru);
        flod_fill(x + 1, y, color_yg_diganti, color_baru);
        flod_fill(x - 1, y, color_yg_diganti, color_baru);
        flod_fill(x, y + 1, color_yg_diganti, color_baru);
        flod_fill(x, y - 1, color_yg_diganti, color_baru);
    }

    // console.log("warna_titik :", warna_titik.r, warna_titik.g, warna_titik.b);
    // console.log("color_yg_diganti :", color_yg_diganti.r, color_yg_diganti.g, color_yg_diganti.b);
}

export function flod_fill_nonrekursif(x, y, color) {
    const stack = [];

    while (stack.length > 0) {
        const current = stack.pop();

    }
}

export function fillMatrix(x, y, color_yg_diganti, color_baru) {
    if (color_yg_diganti.r === color_baru.r &&
        color_yg_diganti.g === color_baru.g &&
        color_yg_diganti.b === color_baru.b) {
        return; 
    }

    const Stack = [];
    Stack.push([x, y]);

    while (Stack.length > 0) {
        const [cx, cy] = Stack.pop();
        if (cx < 0 || cy < 0 || cx >= canvas_handler.width || cy >= canvas_handler.height) {
            continue;
        }
        const warna_titik = get_warna_titik(cx, cy);
        if (!(
            warna_titik.r === color_yg_diganti.r &&
            warna_titik.g === color_yg_diganti.g &&
            warna_titik.b === color_yg_diganti.b
        )) {
            continue;
        }
        draw_dot(cx, cy, color_baru);

        Stack.push([cx + 1, cy]);
        Stack.push([cx - 1, cy]);
        Stack.push([cx, cy + 1]);
        Stack.push([cx, cy - 1]);
    }

    finish_drawing(); 
}

export function init_graphics(nama_canvas = "myCanvas") {
    canvas_handler = document.getElementById(nama_canvas);
    contex = canvas_handler.getContext("2d");
    imagedata = contex.getImageData(0, 0, canvas_handler.width, canvas_handler.height);
}

export function draw_dot(x, y, color) {
    let index = 4 * (x + (y * canvas_handler.width));
    imagedata.data[index] = color.r;
    imagedata.data[index + 1] = color.g;
    imagedata.data[index + 2] = color.b;
    imagedata.data[index + 3] = 255;

}

export function draw_circle(center, radius, color) {
    for (let x = center.x - radius; x <= center.x + radius; x++) {
        let y = center.y + Math.sqrt(Math.pow(radius, 2) - Math.pow(x - center.x, 2));
        draw_dot(x, Math.round(y), color)
    }

    for (let x = center.x - radius; x <= center.x + radius; x++) {
        let y = center.y - Math.sqrt(Math.pow(radius, 2) - Math.pow(x - center.x, 2));
        draw_dot(x, Math.round(y), color)
    }

    for (let y = center.y - radius; y <= center.y + radius; y++) {
        let x = center.x + Math.sqrt(Math.pow(radius, 2) - Math.pow(y - center.y, 2));
        draw_dot(Math.round(x), y, color)
    }

    for (let y = center.y - radius; y <= center.y + radius; y++) {
        let x = center.x - Math.sqrt(Math.pow(radius, 2) - Math.pow(y - center.y, 2));
        draw_dot(Math.round(x), y, color)
    }
}

export function draw_triangle(p1, p2, p3, color) {
    dda_line(p1.x, p1.y, p2.x, p2.y, color);
    dda_line(p2.x, p2.y, p3.x, p3.y, color);
    dda_line(p3.x, p3.y, p1.x, p1.y, color);
}

export function draw_square(center, side, color) {
    const half = side / 2;
    const tl = { x: Math.round(center.x - half), y: Math.round(center.y - half) };
    const tr = { x: Math.round(center.x + half), y: Math.round(center.y - half) };
    const br = { x: Math.round(center.x + half), y: Math.round(center.y + half) };
    const bl = { x: Math.round(center.x - half), y: Math.round(center.y + half) };

    dda_line(tl.x, tl.y, tr.x, tr.y, color);
    dda_line(tr.x, tr.y, br.x, br.y, color);
    dda_line(br.x, br.y, bl.x, bl.y, color);
    dda_line(bl.x, bl.y, tl.x, tl.y, color);
}

export function draw_circle_anotway(center, radius, color) {
    for (let i = 0; i <= Math.PI * 2; i += 0.001) {
        let x = center.x + radius * Math.cos(i + 1 / radius)
        let y = center.y + radius * Math.sin(i + 1 / radius)
        draw_dot(Math.round(x), Math.round(y), color)
    }
}

export function draw_elips(center, radius, color) {
    for (let teta = 0; teta <= Math.PI * 2; teta += 0.001) {
        let x = center.x + (radius.x * Math.cos(teta + 1))
        let y = center.y + (radius.y * Math.sin(teta + 1))
        draw_dot(Math.round(x), Math.round(y), color)
    }
}

export function obatNyamuk(center, radius, color) {
    for (let teta = 0; teta <= Math.PI * 6; teta += 0.001) {
        radius = 10 * teta
        let x = center.x + radius * Math.cos(teta + 1)
        let y = center.y + radius * Math.sin(teta + 1)
        draw_dot(Math.round(x), Math.round(y), color)
    }
}

export function drawFlower(center, radius, n, color) {
    for (let teta = 0; teta <= Math.PI * 2; teta += 0.001) {
        let x = center.x + radius * Math.cos(teta * n) * Math.cos(teta)
        let y = center.y + radius * Math.cos(teta * n) * Math.sin(teta)
        draw_dot(Math.round(x), Math.round(y), color)
    }
}

export function drawMistletoe(center, radius, color) {
    let phi = 0
    let teta = 0

    for (let i = 0; i <= Math.PI * 2; i += 0.001) {
        teta = teta + 1 / radius
        phi = phi + 30 / radius

        let x = center.x + (radius * Math.cos(teta * 2) + 10 * Math.sin(phi)) * Math.cos(teta);
        let y = center.y + (radius * Math.cos(teta * 2) + 10 * Math.sin(phi)) * Math.sin(teta);

        draw_dot(Math.round(x), Math.round(y), { r: 0, g: 255, b: 0 })
    }

    for (let i = 0; i <= Math.PI * 2; i += 0.001) {
        let x = center.x + (radius * 0.2) * Math.cos(i + 1 / radius)
        let y = center.y + (radius * 0.2) * Math.sin(i + 1 / radius)
        draw_dot(Math.round(x), Math.round(y), { r: 255, g: 0, b: 0 })
    }
}

export function finish_drawing() {
    contex.putImageData(imagedata, 0, 0);
}

function randCol() {
    return { r: Math.floor(Math.random()*206)+20, g: Math.floor(Math.random()*206)+20, b: Math.floor(Math.random()*206)+20 }
}

function centroid(a,b,c){
    return { x: Math.round((a.x+b.x+c.x)/3), y: Math.round((a.y+b.y+c.y)/3) }
}

function clearWhite(){
    for (let i=0;i<imagedata.data.length;i+=4){
        imagedata.data[i]=255
        imagedata.data[i+1]=255
        imagedata.data[i+2]=255
        imagedata.data[i+3]=255
    }
}

function redraw(){
    clearWhite()
    for (let i=0;i<=pts.length-3;i++){
        let p1=pts[i], p2=pts[i+1], p3=pts[i+2]
        draw_triangle(p1,p2,p3,BORDER)
        let c = centroid(p1,p2,p3)
        let w = get_warna_titik(c.x,c.y)
        let fill = cols[i] || randCol()
        fillMatrix(c.x,c.y,{ r:w.r, g:w.g, b:w.b }, fill)
    }
    finish_drawing()
}

function addPoint(x,y){
    pts.push({ x: Math.round(x), y: Math.round(y) })
    if (pts.length>=3) cols.push(randCol())
    redraw()
}

export function enable_kaleidoscope(){
    handler = function(e){
        const r = canvas_handler.getBoundingClientRect()
        const x = e.clientX - r.left
        const y = e.clientY - r.top
        addPoint(x,y)
    }
    canvas_handler.addEventListener("click", handler)
    on = true
}

export function disable_kaleidoscope(){
    canvas_handler.removeEventListener("click", handler)
    on = false
}

export function reset_kaleidoscope(){
    pts = []
    cols = []
    clearWhite()
    finish_drawing()
}

export function draw_polygon(titik, color) {
    for (let i = 0; i < titik.length - 1; i++) {
        dda_line(titik[i].x, titik[i].y, titik[i + 1].x, titik[i + 1].y, color);
    }
    dda_line(titik[titik.length - 1].x, titik[titik.length - 1].y, titik[0].x, titik[0].y, color);
}

export function translasi(titik, T) {
    return titik.map(titik_lama => {
        var x_baru = titik_lama.x + T.x;
        var y_baru = titik_lama.y + T.y;
        return {x: x_baru, y: y_baru};
    });
}

export function skala(titik, S, pusat = { x: 0, y: 0 }) {
    // 1. Geser ke origin (0,0)
    let titik_di_origin = translasi(titik, { x: -pusat.x, y: -pusat.y });
    
    // 2. Skala di origin
    let titik_skala = titik_di_origin.map(t => {
        return { x: t.x * S.x, y: t.y * S.y };
    });
    
    // 3. Kembalikan ke posisi semula
    let titik_baru = translasi(titik_skala, { x: pusat.x, y: pusat.y });
    
    return titik_baru;
    
}


export function draw_function(func, xMin, xMax, step, color, scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0) {
    const points = [];
    
    for (let x = xMin; x <= xMax; x += step) {
        const y = func(x);
        
        if (!isNaN(y) && isFinite(y)) {
            const screenX = offsetX + x * scaleX;
            const screenY = offsetY - y * scaleY;
            points.push({ x: screenX, y: screenY });
        }
    }
    
    for (let i = 0; i < points.length - 1; i++) {
        const x1 = Math.round(points[i].x);
        const y1 = Math.round(points[i].y);
        const x2 = Math.round(points[i + 1].x);
        const y2 = Math.round(points[i + 1].y);
        
        if (x1 >= 0 && y1 >= 0 && x1 < canvas_handler.width && y1 < canvas_handler.height &&
            x2 >= 0 && y2 >= 0 && x2 < canvas_handler.width && y2 < canvas_handler.height) {
            dda_line(x1, y1, x2, y2, color);
        }
    }
}

export function draw_axis(originX, originY, color = { r: 0, g: 0, b: 0 }) {
    dda_line(0, originY, canvas_handler.width, originY, color);
    dda_line(originX, 0, originX, canvas_handler.height, color);
}

export function draw_grid(originX, originY, spacing, color = { r: 200, g: 200, b: 200 }) {
    for (let x = originX % spacing; x < canvas_handler.width; x += spacing) {
        dda_line(x, 0, x, canvas_handler.height, color);
    }
    
    for (let y = originY % spacing; y < canvas_handler.height; y += spacing) {
        dda_line(0, y, canvas_handler.width, y, color);
    }
}
