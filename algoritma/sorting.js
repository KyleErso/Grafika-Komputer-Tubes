export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function startBubbleSort(dataArray, callbacks) {
  let data = [...dataArray];
  let n = data.length;
  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      await callbacks.onCompare(j, j + 1);
      if (data[j] > data[j + 1]) {
        await callbacks.onSwap(j, j + 1);
        [data[j], data[j + 1]] = [data[j + 1], data[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  await callbacks.onFinish(data);
}
