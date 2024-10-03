// Puppeteer has to be used for these tests as flow testing doesn't seem possible
// with playwright yet!
import fs from "fs";
import { mkdirp } from "mkdirp";
import puppeteer, { type Page } from "puppeteer";
import { startFlow } from "lighthouse";
import { range } from "./math.ts";

async function main() {
  const amountOfRuns = 5;
  const testPrefix = "cf";
  const testTypes = ["ecommerce-ssr", "ecommerce-islands"];

  runTests(
    amountOfRuns,
    testPrefix,
    "https://comments-benchmark.pages.dev",
    testTypes,
  );
}

main();

async function runTests(
  amountOfRuns: number,
  type: string,
  prefix: string,
  names: string[],
) {
  // Generate test permutations to run
  const testConfigurations = range(amountOfRuns).flatMap((i) =>
    names.map((name: string) => ({ type, prefix, name, n: i + 1 })),
  );

  const browser = await puppeteer.launch();

  for (const configuration of testConfigurations) {
    const page = await browser.newPage();

    try {
      await ecommerceTest({ page, configuration });
    } catch (error) {
      console.error(error);
    }
  }

  await browser.close();
}

// Adapted from https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md
async function ecommerceTest({
  page,
  configuration,
}: {
  page: Page;
  configuration: { type: string; prefix: string; name: string; n: number };
}) {
  const { type, prefix, name, n } = configuration;
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
}
