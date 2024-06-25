import { writeFileSync } from "fs";
import { Cluster } from "puppeteer-cluster";
import { type Page } from "puppeteer";
import { startFlow } from "lighthouse";
import { printCSV } from "./print-csv.ts";
import { readAudits } from "./read-audits.ts";
import { average, median, range } from "./math.ts";

async function main() {
  const amountOfRuns = 5;
  const testPrefix = "cf";
  const testTypes = ["ssr-ecommerce", "islands-ecommerce"];

  // Prepare an execution cluster
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 1,
  });

  // Add a task
  cluster.task(ecommerceTest);

  // Execute test permutations
  getTests(
    amountOfRuns,
    testPrefix,
    "https://comments-benchmark.pages.dev",
    testTypes,
  ).forEach((t) => cluster.queue(t));

  // Shut down
  await cluster.idle();
  await cluster.close();

  // Finish
  printCSV(amountOfRuns, testPrefix, testTypes);
  printTable();
}

main();

// Generate test permutations
function getTests(
  amountOfRuns: number,
  type: string,
  prefix: string,
  names: string[],
) {
  return range(amountOfRuns).flatMap((i) =>
    names.map((name: string) => ({ type, prefix, name, n: i + 1 })),
  );
}

// Adapted from https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md
async function ecommerceTest({
  page,
  data,
}: {
  page: Page;
  data: { type: string; prefix: string; name: string; n: number };
}) {
  const { type, prefix, name, n } = data;
  const url = `${prefix}/${name}`;

  console.log("Testing", url, "run", n);

  const flow = await startFlow(page, {
    config: {
      extends: "lighthouse:default",
      settings: {
        formFactor: "mobile",
      },
    },
  });

  // Phase 1 - Navigate to the page.
  await flow.navigate(url);

  // Phase 2 - Interact with the page and submit the search form.

  // Enter letter p to the search field and press "search"
  await page.type('*[name="search"]', "p");

  await flow.startNavigation();
  await page.click('*[type="submit"]');

  // The page won't refresh for the islands solution so it's better
  // to wait for navigation then.
  await Promise.race([
    page.waitForNavigation(),
    page.waitForSelector("#products"),
  ]);

  await flow.endNavigation();

  // Phase 3 - Write a flow report.
  // TODO: Make sure output directory exists before writing
  writeFileSync(
    `report-output/${type}-${name}-${n}-report.html`,
    await flow.generateReport(),
  );

  // Phase 4 - Save results as JSON.
  // TODO: Make sure output directory exists before writing
  writeFileSync(
    `benchmark-output/${type}-${name}-${n}-audit.json`,
    JSON.stringify(await flow.createFlowResult(), null, 2),
  );
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
