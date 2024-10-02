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

  console.log(cfVanillaSizes, cfDisqusSizes, cfLazyDisqusSizes, cfIslandsSizes);
}

export { printSizes };
