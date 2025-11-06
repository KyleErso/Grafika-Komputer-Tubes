import { data, canvasHeight, LEBAR_KOTAK, JARAK_KOTAK, START_X, START_Y_OFFSET, SKALA_TINGGI, WARNA_SWAP, canvasElement } from "./state.js";
import { gambarArray } from "./render.js";
import { clearWhite, draw_filled_rect, finish_drawing } from "../lib/graflib.js";

export function initDrag(canvas) {
  let dragIndex = -1;

  const posToIndex = (x, y) => data.findIndex((v,i) => {
    const bx = START_X + i*(LEBAR_KOTAK+JARAK_KOTAK);
    const by = canvasHeight - v*SKALA_TINGGI - START_Y_OFFSET;
    return x>=bx && x<=bx+LEBAR_KOTAK && y>=by && y<=by+v*SKALA_TINGGI;
  });

  const redraw = (mx=-1, my=-1) => {
    clearWhite();
    gambarArray(canvasHeight);
    if(dragIndex!==-1 && mx!==-1)
      draw_filled_rect(mx-LEBAR_KOTAK/2, my-data[dragIndex]*SKALA_TINGGI/2, LEBAR_KOTAK, data[dragIndex]*SKALA_TINGGI, WARNA_SWAP);
    finish_drawing();
  };

  canvas.onpointerdown = e => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left)*(canvas.width/r.width);
    const y = (e.clientY - r.top)*(canvas.height/r.height);
    dragIndex = posToIndex(x,y);
    redraw(x,y);
  };

  canvas.onpointermove = e => {
    if(dragIndex===-1) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left)*(canvas.width/r.width);
    const y = (e.clientY - r.top)*(canvas.height/r.height);
    redraw(x,y);
  };

  canvas.onpointerup = canvas.onpointerout = e => {
    if(dragIndex===-1) return;
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left)*(canvas.width/r.width);
    const y = (e.clientY - r.top)*(canvas.height/r.height);
    const dropIndex = posToIndex(x,y);
    if(dropIndex!==-1 && dropIndex!==dragIndex)
      [data[dragIndex], data[dropIndex]] = [data[dropIndex], data[dragIndex]];
    dragIndex=-1;
    redraw();
  };
}
