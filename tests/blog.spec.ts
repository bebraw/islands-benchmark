import { test } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import playwright from "playwright";
import { readAudits } from "./read-audits.ts";
import { printCSV } from "./print-csv.ts";
import { average, median, range } from "./math.ts";

const thresholds = {
  performance: 50,
  accessibility: 50,
  "best-practices": 50,
  seo: 50,
  pwa: 10,
};
const testPrefix = "cf";
const amountOfRuns = 5;
const testTypes = ["vanilla", "disqus", "lazy-disqus", "islands"];

testSuites(testPrefix, "https://comments-benchmark.pages.dev", testTypes);
test.afterAll(() => {
  printCSV(amountOfRuns, testPrefix, testTypes);
  printTable();
});

// The idea is to run similar test cases at the same time to avoid
// weirdness related to connectivity as connection speed may vary.
function testSuites(type: string, prefix: string, names: string[]) {
  range(amountOfRuns).forEach((i) =>
    names.forEach((name: string) =>
      test(prefix + " - " + name + " audit blog index #" + (i + 1), () =>
        auditBlogPage(type, prefix, name, i + 1),
      ),
    ),
  );
}

async function auditBlogPage(
  type: string,
  prefix: string,
  name: string,
  n: number,
) {
  const port = 9222;
  const browser = await playwright["chromium"].launch({
    args: [`--remote-debugging-port=${port}`],
  });
  const url = `${prefix}/${name}/10/`;
  const page = await browser.newPage();
  await page.goto(url);

  await playAudit({
    page,
    thresholds,
    reports: getReportsConfiguration(type + "-" + name + "-" + n),
    port,
  });

  await browser.close();
}

// Utils

// TODO: This code could be condensed a lot
function printTable() {
  // Check the output JSON files for possible audits
  const auditTypes = [
    "first-contentful-paint",
    // Skip TTI as it seems to follow FCP closely
    // "interactive",
    "server-response-time",
  ];
  const calculatedRows: {
    cfVanilla: Record<string, CalculatedRow>;
    cfDisqus: Record<string, CalculatedRow>;
    cfLazyDisqus: Record<string, CalculatedRow>;
    cfIslands: Record<string, CalculatedRow>;
  } = {
    cfVanilla: {},
    cfDisqus: {},
    cfLazyDisqus: {},
    cfIslands: {},
  };
  type CalculatedRow = {
    firstRun?: number;
    median?: number;
    average?: number;
  };

  auditTypes.forEach((auditType: string) => {
    const cfVanillaFCPs = readAudits("cf-vanilla-", auditType);
    const cfDisqusFCPs = readAudits("cf-disqus-", auditType);
    const cfLazyDisqusFCPs = readAudits("cf-lazy-disqus-", auditType);
    const cfIslandsFCPs = readAudits("cf-islands-", auditType);

    calculatedRows.cfVanilla[auditType] = {
      firstRun: cfVanillaFCPs[0],
      median: median(cfVanillaFCPs),
      average: average(cfVanillaFCPs),
    };
    calculatedRows.cfDisqus[auditType] = {
      firstRun: cfDisqusFCPs[0],
      median: median(cfDisqusFCPs),
      average: average(cfDisqusFCPs),
    };
    calculatedRows.cfLazyDisqus[auditType] = {
      firstRun: cfLazyDisqusFCPs[0],
      median: median(cfLazyDisqusFCPs),
      average: average(cfLazyDisqusFCPs),
    };
    calculatedRows.cfIslands[auditType] = {
      firstRun: cfIslandsFCPs[0],
      median: median(cfIslandsFCPs),
      average: average(cfIslandsFCPs),
    };
  });

  function getRow(name: string, property: string) {
    return `${name} & ${Math.round(
      // @ts-expect-error This is fine
      calculatedRows[property]["first-contentful-paint"].firstRun,
    )} & ${Math.round(
      // @ts-expect-error This is fine
      calculatedRows[property]["first-contentful-paint"].median,
    )} & ${Math.round(
      // @ts-expect-error This is fine
      calculatedRows[property]["first-contentful-paint"].average,
    )} & ${Math.round(
      // @ts-expect-error This is fine
      calculatedRows[property]["server-response-time"].firstRun,
    )} & ${Math.round(
      // @ts-expect-error This is fine
      calculatedRows[property]["server-response-time"].median,
    )} & ${Math.round(
      // @ts-expect-error This is fine
      calculatedRows[property]["server-response-time"].average,
    )} \\\\\n`;
  }

  const rows = [
    ["CF vanilla", "cfVanilla"],
    ["CF Disqus", "cfDisqus"],
    ["CF lazy Disqus", "cfLazyDisqus"],
    ["CF islands", "cfIslands"],
  ];

  console.log(rows.map((row) => getRow(row[0], row[1])).join(""));
}

function getReportsConfiguration(prefix: string) {
  return {
    formats: { json: true, html: true, csv: true },
    name: prefix + "-audit",
    directory: "benchmark-output",
    // Test against mobile to throttle connection
    formFactor: "mobile",
  };
}
