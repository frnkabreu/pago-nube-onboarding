export function fmtMXN(n: number): string {
  return `MXN ${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`
}
