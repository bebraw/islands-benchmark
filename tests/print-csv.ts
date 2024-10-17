import { readAudits } from "./read-audits.ts";
import { range } from "../math.ts";

function printCSV(
  amountOfRuns: number,
  testPrefix: string,
  testTypes: string[],
) {
  // Check the output JSON files for possible audits
  const auditTypes = [
    "first-contentful-paint",
    "server-response-time",
    "interactive",
  ];
  const testPrefixes = testTypes.map((t) => testPrefix + "-" + t + "-");

  auditTypes.forEach((auditType) => {
    const audits = testPrefixes.map((t) => readAudits(t, auditType));

    console.log(`\nAudit type: ${auditType}`);
    // This output should go to main.tex
    // TODO: Make alphabet generation dynamic
    console.log(`a,b,c,d,e
${range(amountOfRuns)
  .map((i) => `${i + 1},${audits.map((t) => t[i]).join(",")}`)
  .join("\n")}`);
  });
}

export { printCSV };
