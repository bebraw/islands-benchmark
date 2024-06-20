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
const amountOfRuns = 5;

testSuites("cf", "https://comments-benchmark.pages.dev", [
  "ssr-ecommerce",
  "islands-ecommerce",
]);
test.afterAll(() => {
  printCSV(amountOfRuns);
  printTable();
});

// The idea is to run similar test cases at the same time to avoid
// weirdness related to connectivity as connection speed may vary.
function testSuites(type: string, prefix: string, names: string[]) {
  range(5).forEach((i) =>
    names.forEach((name: string) =>
      test(prefix + " - " + name + " audit ecommerce #" + (i + 1), () =>
        auditEcommercePage(type, prefix, name, i + 1),
      ),
    ),
  );
}

async function auditEcommercePage(
  type: string,
  prefix: string,
  name: string,
  n: number,
) {
  const port = 9222;
  const browser = await playwright["chromium"].launch({
    args: [`--remote-debugging-port=${port}`],
  });
  const url = `${prefix}/${name}`;
  const page = await browser.newPage();
  await page.goto(url);

  // Enter letter p to the search field and click "search"
  page.locator('*[name="search"]').fill("p");
  await page.locator('*[type="submit"]').click();

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
    ssr: Record<string, CalculatedRow>;
    islands: Record<string, CalculatedRow>;
  } = {
    ssr: {},
    islands: {},
  };
  type CalculatedRow = {
    firstRun?: number;
    median?: number;
    average?: number;
  };

  auditTypes.forEach((auditType: string) => {
    const ssrFCPs = readAudits("ssr-ecommerce-", auditType);
    const islandsFCPs = readAudits("islands-ecommerce-", auditType);

    calculatedRows.ssr[auditType] = {
      firstRun: ssrFCPs[0],
      median: median(ssrFCPs),
      average: average(ssrFCPs),
    };
    calculatedRows.islands[auditType] = {
      firstRun: islandsFCPs[0],
      median: median(islandsFCPs),
      average: average(islandsFCPs),
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
    ["SSR", "ssr"],
    ["Islands", "islands"],
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
