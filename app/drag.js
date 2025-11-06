import { getMousePos, getBoxAt } from "./helpers.js";
import { data, canvasHeight, LEBAR_KOTAK, JARAK_KOTAK, START_X, START_Y_OFFSET, SKALA_TINGGI, WARNA_SWAP } from "./state.js";
import { gambarArray } from "./render.js";
import { clearWhite, draw_filled_rect, finish_drawing } from "../lib/graflib.js";

let isDragging = false;
let dragIndex = -1;
let mouseX = 0, mouseY = 0;
let dragOffsetX = 0, dragOffsetY = 0;
let infoElem, inputField;

export function initDrag(canvas, info, input) {
    infoElem = info;
    inputField = input;

    canvas.addEventListener("mousedown", e => onMouseDown(e, canvas));
    canvas.addEventListener("mousemove", e => onMouseMove(e, canvas));
    canvas.addEventListener("mouseup", e => onMouseUp(e, canvas));
    canvas.addEventListener("mouseout", e => onMouseUp(e, canvas));
}

function redrawCanvas() {
    clearWhite();
    gambarArray(canvasHeight, -1, -1, isDragging ? dragIndex : -1);
    if (isDragging && dragIndex !== -1) {
        const tinggi = data[dragIndex] * SKALA_TINGGI;
        const x = mouseX - dragOffsetX;
        const y = mouseY - dragOffsetY;
        draw_filled_rect(x, y, LEBAR_KOTAK, tinggi, WARNA_SWAP);
    }
    finish_drawing();
}

function onMouseDown(e, canvas) {
    [mouseX, mouseY] = getMousePos(e);
    dragIndex = getBoxAt(mouseX, mouseY, data, canvasHeight, LEBAR_KOTAK, JARAK_KOTAK, START_X, START_Y_OFFSET, SKALA_TINGGI);
    if (dragIndex !== -1) {
        isDragging = true;
        const tinggi = data[dragIndex] * SKALA_TINGGI;
        const x_pos = START_X + (LEBAR_KOTAK + JARAK_KOTAK) * dragIndex;
        const y_pos = canvasHeight - tinggi - START_Y_OFFSET;
        dragOffsetX = mouseX - x_pos;
        dragOffsetY = mouseY - y_pos;
        infoElem.innerText = "Dragging kotak " + data[dragIndex] + "...";
        redrawCanvas();
    }
}

function onMouseMove(e) {
    if (!isDragging) return;
    [mouseX, mouseY] = getMousePos(e);
    redrawCanvas();
}

function onMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    const [mx, my] = getMousePos(e);
    const dropIndex = getBoxAt(mx, my, data, canvasHeight, LEBAR_KOTAK, JARAK_KOTAK, START_X, START_Y_OFFSET, SKALA_TINGGI);
    if (dropIndex !== -1 && dropIndex !== dragIndex) {
        infoElem.innerText = `Menukar ${data[dragIndex]} dengan ${data[dropIndex]}.`;
        [data[dragIndex], data[dropIndex]] = [data[dropIndex], data[dragIndex]];
        inputField.value = data.join(",");
    } else {
        infoElem.innerText = "Drag dibatalkan.";
    }
    dragIndex = -1;
    redrawCanvas();
}
