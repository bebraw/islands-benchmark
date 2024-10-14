import fs from "fs";
import { globSync } from "glob";

// TODO: Likely this could replace functions below
function readAuditField(
  pageType: string,
  // TODO: Get the right type from Lighthouse somehow
  fieldCb: (o: Record<string, unknown>) => string,
) {
  const files = globSync(pageType + "*-audit.json");

  const audits = files
    .map((f) => fs.readFileSync(f, { encoding: "utf-8" }))
    .map((d) => JSON.parse(d));

  return audits.map((a) => {
    if (a.audits) {
      return fieldCb(a.audits);
    }

    if (a.steps) {
      return a.steps
        .map(
          // @ts-expect-error This is fine for now. Maybe
          // the exact type is available through Lighthouse
          (s) => fieldCb(s.lhr.audits) || 0,
        )
        .reduce((a: number, b: number) => a + b, 0);
    }

    throw new Error("Missing audits or steps property");
  });
}

function readAudits(pageType: string, auditType: string) {
  const files = globSync(pageType + "*-audit.json");

  const audits = files
    .map((f) => fs.readFileSync(f, { encoding: "utf-8" }))
    .map((d) => JSON.parse(d));

  return audits.map((a) => {
    if (a.audits) {
      return a.audits[auditType].numericValue;
    }

    if (a.steps) {
      return a.steps
        .map(
          // @ts-expect-error This is fine for now. Maybe
          // the exact type is available through Lighthouse
          (s) => s.lhr.audits[auditType]?.numericValue || 0,
        )
        .reduce((a: number, b: number) => a + b, 0);
    }

    throw new Error("Missing audits or steps property");
  });
}

function readAuditDiagnostics(pageType: string, diagnosticField: string) {
  const files = globSync(pageType + "*-audit.json");

  const audits = files
    .map((f) => fs.readFileSync(f, { encoding: "utf-8" }))
    .map((d) => JSON.parse(d));

  return audits.map((a) => {
    if (a.audits) {
      return a.audits.diagnostics.details.items[0][diagnosticField];
    }

    if (a.steps) {
      return a.steps
        .map(
          // @ts-expect-error This is fine for now. Maybe
          // the exact type is available through Lighthouse
          (s) =>
            s.lhr.audits.diagnostics?.details.items[0][diagnosticField] || 0,
        )
        .reduce((a: number, b: number) => a + b, 0);
    }

    throw new Error("Missing audits or steps property");
  });
}

export { readAudits, readAuditDiagnostics, readAuditField };
