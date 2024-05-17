import * as fs from "fs";
import { glob } from "glob";
import { test } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import playwright from "playwright";

const thresholds = {
  performance: 50,
  accessibility: 50,
  "best-practices": 50,
  seo: 50,
  pwa: 10,
};

testSuites("cf", "https://comments-benchmark.pages.dev", [
  "vanilla",
  "disqus",
  "lazy-disqus",
  "islands",
]);
test.afterAll(() => {
  printCSV();
  printTable();
});

// The idea is to run similar test cases at the same time to avoid
// weirdness related to connectivity as connection speed may vary.
function testSuites(type: string, prefix: string, names: string[]) {
  range(5).forEach((i) =>
    names.forEach((name: string) =>
      test(prefix + " - " + name + " audit blog index #" + (i + 1), () =>
        auditBlogPage(type, prefix, name, i + 1),
      ),
    ),
  );
  /*
  range(5).forEach((i) =>
    names.forEach((name) =>
      test(prefix + " - " + name + " audit blog page #" + (i + 1), () =>
        auditBlogPage(type, prefix, name, i + 1),
      ),
    ),
  );
  */
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

/*
async function auditBlogPage(type, prefix, name, n) {
  const port = 9223;
  const browser = await playwright["chromium"].launch({
    args: [`--remote-debugging-port=${port}`],
  });
  const page = await browser.newPage();
  await page.goto(`${prefix}/${name}/posts/`);

  const links = page.locator("a");
  await links.first().click();

  await playAudit({
    page,
    thresholds,
    reports: getReportsConfiguration(type + "-" + name + "-page-" + n),
    port,
  });

  await browser.close();
}
*/

// Utils
function printCSV() {
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
${range(5)
  .map((i) => pickRow(i))
  .join("\n")}`);
  });
}

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

function median(values: number[]) {
  const amount = values.length;

  if (amount % 2) {
    // For example, length is 5 -> pick 2nd from a zero-indexed array
    return values[Math.floor(amount / 2)];
  }

  // For example, length is 6 -> pick average of indices 2 and 3
  return (
    (values[Math.floor(amount / 2)] + values[Math.floor(amount / 2) - 1]) / 2
  );
}

function average(values: number[]) {
  const sum = values.reduce((a, b) => a + b, 0);

  return sum / values.length;
}

function readAudits(pageType: string, auditType: string) {
  const files = glob.sync("benchmark-output/" + pageType + "*-audit.json");

  const audits = files.map((f) => fs.readFileSync(f)).map((d) => JSON.parse(d));

  return audits.map((a) => a["audits"][auditType]["numericValue"]);
}

function range(n: number, customizer = (i: number) => i) {
  return Array.from(Array(n), (_, i) => customizer(i));
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
