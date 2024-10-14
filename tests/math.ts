function min(values: number[]) {
  // @ts-expect-error This is fine
  return values.toSorted((a, b) => a - b).at(0);
}

function max(values: number[]) {
  // @ts-expect-error This is fine
  return values.toSorted((a, b) => a - b).at(-1);
}

function p25(values: number[]) {
  // @ts-expect-error This is fine
  return values.toSorted((a, b) => a - b)[Math.floor(values.length * 0.25)];
}

function p75(values: number[]) {
  // @ts-expect-error This is fine
  return values.toSorted((a, b) => a - b)[Math.floor(values.length * 0.75)];
}

function median(values: number[]) {
  const amount = values.length;

  if (amount % 2) {
    // For example, length is 5 -> pick 2nd from a zero-indexed array
    return values[Math.floor(amount / 2)];
  }

  // For example, length is 6 -> pick average of indices 2 and 3
  return (
    (values[Math.floor(amount / 2)] + values[Math.floor(amount / 2) - 1]) / 2
  );
}

function average(values: number[]) {
  const sum = values.reduce((a, b) => a + b, 0);

  return sum / values.length;
}

function range(n: number, customizer = (i: number) => i) {
  return Array.from(Array(n), (_, i) => customizer(i));
}

export { min, max, p25, p75, median, average, range };
