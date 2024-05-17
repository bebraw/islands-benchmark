import { readAudits } from "./read-audits.ts";
import { range } from "./math.ts";

function printCSV(amountOfRuns: number) {
  // Check the output JSON files for possible audits
  const auditTypes = [
    "first-contentful-paint",
    "server-response-time",
    "interactive",
  ];

  auditTypes.forEach((auditType) => {
    const cfVanillaFCPs = readAudits("cf-vanilla-", auditType);
    const cfDisqusFCPs = readAudits("cf-disqus-", auditType);
    const cfLazyDisqusFCPs = readAudits("cf-lazy-disqus-", auditType);
    const cfIslandsFCPs = readAudits("cf-islands-", auditType);

    function pickRow(i: number) {
      return `${i + 1},${cfVanillaFCPs[i]},${cfDisqusFCPs[i]},${
        cfLazyDisqusFCPs[i]
      },${cfIslandsFCPs[i]}`;
    }

    console.log(`\nAudit type: ${auditType}`);
    // This output should go to main.tex
    console.log(`a,b,c,d,e
${range(amountOfRuns)
  .map((i) => pickRow(i))
  .join("\n")}`);
  });
}

export { printCSV };
