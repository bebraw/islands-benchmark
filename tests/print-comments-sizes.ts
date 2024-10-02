import { readAuditDiagnostics } from "./read-audits.ts";

function printSizes() {
  const diagnosticField = "totalByteWeight";
  const cfVanillaSizes = readAuditDiagnostics("cf-vanilla-", diagnosticField);
  const cfDisqusSizes = readAuditDiagnostics("cf-disqus-", diagnosticField);
  const cfLazyDisqusSizes = readAuditDiagnostics(
    "cf-lazy-disqus-",
    diagnosticField,
  );
  const cfIslandsSizes = readAuditDiagnostics("cf-islands-", diagnosticField);
  const rows = [
    ["Islands", average(cfIslandsSizes)],
    ["Lazy Disqus", average(cfLazyDisqusSizes)],
    ["Disqus", average(cfDisqusSizes)],
    ["Vanilla", average(cfVanillaSizes)],
  ];

  console.log(rows.map((r) => `${r[0]} & ${r[1]} \\\\`).join("\n"));
}

function average(values: number[]) {
  const sum = values.reduce((a, b) => a + b, 0);

  return sum / values.length;
}

export { printSizes };
