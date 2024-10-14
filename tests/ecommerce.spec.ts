// Puppeteer has to be used for these tests as flow testing doesn't seem possible
// with playwright yet!
import fs from "fs";
import { mkdirp } from "mkdirp";
import puppeteer, { type Page } from "puppeteer";
import { startFlow } from "lighthouse";
import desktopConfig from "lighthouse/core/config/lr-desktop-config.js";
import mobileConfig from "lighthouse/core/config/lr-mobile-config.js";
import { range } from "./math.ts";

type TestType = { name: string; mode: "timespan" | "navigation" };

const FORM_FACTOR = process.env.FORM_FACTOR;

if (!FORM_FACTOR) {
  throw new Error("Missing FORM_FACTOR");
}

async function main() {
  const amountOfRuns = 5;
  const testPrefix = "cf";
  const testTypes: TestType[] = [
    // Because of Lighthouse and differing logic of ssr and islands implemenations,
    // different test modes have to be used to capture navigation.
    { name: "ecommerce-ssr", mode: "navigation" },
    { name: "ecommerce-islands", mode: "timespan" },
  ];

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
  configurations: TestType[],
) {
  // Generate test permutations to run
  const testConfigurations = range(amountOfRuns).flatMap((i) =>
    configurations.map(({ name, mode }) => ({
      type,
      prefix,
      name,
      mode,
      n: i + 1,
    })),
  );

  const browser = await puppeteer.launch();

  console.log("Using browser version", await browser.version());

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
  configuration: {
    type: string;
    prefix: string;
    name: string;
    n: number;
    mode: TestType["mode"];
  };
}) {
  const { type, prefix, name, mode, n } = configuration;
  const url = `${prefix}/${name}`;

  console.log("Testing", url, "run", n);

  const flow = await startFlow(page, {
    config: FORM_FACTOR === "desktop" ? desktopConfig : mobileConfig,
  });

  // Phase 1 - Navigate to the page.
  await flow.navigate(url);

  // Phase 2 - Interact with the page and submit the search form.

  // Enter letter p to the search field and press "search"
  await page.type("input[name=search]", "p");

  if (mode === "timespan") {
    await flow.startTimespan();
  } else if (mode === "navigation") {
    await flow.startNavigation();
  }

  await page.click("input[type=submit]");

  if (mode === "timespan") {
    page.waitForSelector("#products");

    await flow.endTimespan();
  } else if (mode === "navigation") {
    page.waitForNavigation();

    await flow.endNavigation();
  }

  console.log("Writing reports for run", n);

  // Phase 3 - Write a flow report.
  const reportOutputDirectory = "test-output/ecommerce-report";
  await mkdirp(reportOutputDirectory);
  await fs.promises.writeFile(
    `${reportOutputDirectory}/${name}-${type}-${n}-report.html`,
    await flow.generateReport(),
  );

  // Phase 4 - Save results as JSON.
  const benchmarkOutputDirectory = `test-output/ecommerce-benchmark/${FORM_FACTOR}`;
  await mkdirp(benchmarkOutputDirectory);
  await fs.promises.writeFile(
    `${benchmarkOutputDirectory}/${name}-${type}-${n}-audit.json`,
    JSON.stringify(await flow.createFlowResult(), null, 2),
  );

  console.log("Wrote reports for run", n);
}
