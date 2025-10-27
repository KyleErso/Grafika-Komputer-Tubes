
export function quickSort(arr, callback, delay = 200) {
  if (arr.length <= 1) return arr;

  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }

  if (callback) callback([...left, pivot, ...right]);
  return new Promise(resolve => {
    setTimeout(async () => {
      const sortedLeft = await quickSort(left, callback, delay);
      const sortedRight = await quickSort(right, callback, delay);
      resolve([...sortedLeft, pivot, ...sortedRight]);
    }, delay);
  });
}
