import fs from "fs";
import { globSync } from "glob";

function readAudits(pageType: string, auditType: string) {
  const files = globSync("benchmark-output/" + pageType + "*-audit.json");

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

export { readAudits };
