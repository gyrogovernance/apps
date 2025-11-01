export function median(values: number[]): number {
  const arr = values.filter((v) => Number.isFinite(v));
  if (arr.length === 0) return NaN;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function mostCommon<T extends string | number>(values: T[]): T | undefined {
  if (values.length === 0) return undefined;
  const counts = values.reduce((acc, v) => {
    acc[v as any] = (acc[v as any] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const [winner] = Object.entries(counts).sort(([, a], [, b]) => b - a)[0] || [];
  return (winner as unknown) as T | undefined;
}


