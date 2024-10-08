import { readAuditDiagnostics } from "./read-audits.ts";

function printSizes() {
  const diagnosticField = "totalByteWeight";
  const testPrefix = "test-output/blog-benchmark/";
  const cfSSRSizes = readAuditDiagnostics(
    testPrefix + "ecommerce-ssr-cf-",
    diagnosticField,
  );
  const cfIslandsSizes = readAuditDiagnostics(
    testPrefix + "ecommerce-islands-cf-",
    diagnosticField,
  );
  const rows = [
    ["SSR with islands", average(cfIslandsSizes)],
    ["SSR", average(cfSSRSizes)],
  ];

  console.log(rows.map((r) => `${r[0]} & ${r[1]} \\\\`).join("\n"));
}

function average(values: number[]) {
  const sum = values.reduce((a, b) => a + b, 0);

  return sum / values.length;
}

export { printSizes };
