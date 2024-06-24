import { writeFileSync } from "fs";
import puppeteer from "puppeteer";
import { startFlow } from "lighthouse";
import { readAudits } from "./read-audits.ts";
import { printCSV } from "./print-csv.ts";
import { average, median, range } from "./math.ts";

const amountOfRuns = 5;

async function main() {
  await testSuites("cf", "https://comments-benchmark.pages.dev", [
    "ssr-ecommerce",
    "islands-ecommerce",
  ]);

  printCSV(amountOfRuns);
  printTable();
}

main();

// The idea is to run similar test cases at the same time to avoid
// weirdness related to connectivity as connection speed may vary.
function testSuites(type: string, prefix: string, names: string[]) {
  return Promise.all(
    range(amountOfRuns).flatMap((i) =>
      names.map((name: string) =>
        test(prefix + " - " + name + " audit ecommerce #" + (i + 1), () =>
          auditEcommercePage(type, prefix, name, i + 1),
        ),
      ),
    ),
  );
}

function test(name: string, fn: () => void) {
  console.log(`Running test: ${name}`);

  return fn();
}

// Adapted from https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md
async function auditEcommercePage(
  type: string,
  prefix: string,
  name: string,
  n: number,
) {
  const url = `${prefix}/${name}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const flow = await startFlow(page, {
    config: {
      settings: {
        formFactor: "mobile",
      },
    },
  });

  // Phase 1 - Navigate to the page.
  await flow.navigate(url);

  // Phase 2 - Interact with the page and submit the search form.
  await flow.startTimespan();

  // Enter letter p to the search field and press "search"
  const searchElement = await page.waitForSelector(`*[name="search"]`);

  if (!searchElement) {
    throw new Error("Failed to find search element");
  }

  await searchElement.type("p");

  const submitElement = await page.waitForSelector(`*[type="submit"]`);

  if (!submitElement) {
    throw new Error("Failed to find submit element");
  }

  await submitElement.press("Enter");

  // Ensure search results have rendered
  await page.waitForSelector(`#products`);

  await flow.endTimespan();

  // Phase 3 - Analyze the new state.
  await flow.snapshot();

  // Phase 4 - Save results as JSON.
  writeFileSync(
    `benchmark-output/${type}-${name}-${n}-audit.json`,
    JSON.stringify(await flow.createFlowResult(), null, 2),
  );

  // Phase 5 - Clean up
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
    const ssrFCPs = readAudits("cf-ssr-ecommerce-", auditType);
    const islandsFCPs = readAudits("cf-islands-ecommerce-", auditType);

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
