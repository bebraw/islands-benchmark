import { average } from "./math.ts";
import { readAuditDiagnostics } from "./read-audits.ts";

function printSizes() {
  const diagnosticField = "totalByteWeight";
  const testPrefix = "test-output/blog-benchmark/mobile/";
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

export { printSizes };
