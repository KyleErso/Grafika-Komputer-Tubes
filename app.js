import { quickSort } from './algoritma/sorting.js';

async function runSorting() {
  const data = [13, 72, 8, 9, 1, 5];
  const sorted = await quickSort(data, drawArray, 300);
  console.log(sorted);
}
runSorting();
