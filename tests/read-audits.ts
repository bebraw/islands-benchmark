import fs from "fs";
import { glob } from "glob";

function readAudits(pageType: string, auditType: string) {
  const files = glob.sync("benchmark-output/" + pageType + "*-audit.json");

  const audits = files
    .map((f) => fs.readFileSync(f, { encoding: "utf-8" }))
    .map((d) => JSON.parse(d));

  return audits.map((a) => a["audits"][auditType]["numericValue"]);
}

export { readAudits };
