// Puppeteer has to be used for these tests as flow testing doesn't seem possible
// with playwright yet!
import fs from "fs";
import { mkdirp } from "mkdirp";
import { Cluster } from "puppeteer-cluster";
import { type Page } from "puppeteer";
import { startFlow } from "lighthouse";
// import { printCSV } from "./print-csv.ts";
import { range } from "./math.ts";

// TODO: Consider crashing if any selector times out or if test throws
async function main() {
  const amountOfRuns = 5;
  const testPrefix = "cf";
  const testTypes = ["ecommerce-ssr", "ecommerce-islands"];

  // TODO: Consider using Puppeteer directly instead of clustering
  // Prepare an execution cluster
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    // It is important to limit concurrency to one as otherwise
    // results don't seem to make sense for some reason (cache?).
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
  // printCSV(amountOfRuns, testPrefix, testTypes);
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
  await page.type("input[name=search]", "p");

  await flow.startTimespan();

  // TODO: Use startNavigation for the SSR case
  // await flow.startNavigation();
  await page.click('*[type="submit"]');
  // await flow.endNavigation();

  // The page won't refresh for the islands solution so it's better
  // to wait for navigation then.
  await Promise.race([
    page.waitForNavigation(),
    page.waitForSelector("#products"),
  ]);

  await flow.endTimespan();

  console.log("Writing report for run", n);

  try {
    // Phase 3 - Write a flow report.
    await mkdirp("report-output");
    await fs.promises.writeFile(
      `report-output/${name}-${type}-${n}-report.html`,
      await flow.generateReport(),
    );

    // Phase 4 - Save results as JSON.
    await mkdirp("benchmark-output");
    await fs.promises.writeFile(
      `benchmark-output/${name}-${type}-${n}-audit.json`,
      JSON.stringify(await flow.createFlowResult(), null, 2),
    );

    console.log("Wrote reports for run", n);
  } catch (error) {
    console.error(error);
  }
}
