export function randInt(min: number, max: number): number {
  const r = Math.random();
  return (r * (max - min + 1) + min) | 0;
}

export function shuffle(array: number[], index?: number): number[] {
  // if index is provided then set to to the first item in the array
  let min = 0;
  if (index !== undefined) {
    [array[0], array[index]] = [array[index], array[0]];
    min = 1;
  }

  for (let j, i = min; i < array.length; i++) {
    j = randInt(i, array.length - 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
