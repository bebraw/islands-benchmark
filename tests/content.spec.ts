import process from "node:process";
import { test } from "@playwright/test";
import { playAudit } from "playwright-lighthouse";
import playwright from "playwright";
import desktopConfig from "lighthouse/core/config/lr-desktop-config.js";
import mobileConfig from "lighthouse/core/config/lr-mobile-config.js";
import { range } from "../math.ts";
import { AMOUNT_OF_RUNS } from "./config.ts";

const FORM_FACTOR = process.env.FORM_FACTOR;

if (!FORM_FACTOR) {
  throw new Error("Missing FORM_FACTOR");
}

const thresholds = {
  performance: 50,
  accessibility: 50,
  "best-practices": 50,
  seo: 50,
};
const testPrefix = "cf";
const amountOfRuns = AMOUNT_OF_RUNS;
const testTypes = ["ssr", "islands"];

testSuites(
  testPrefix,
  "https://comments-benchmark.pages.dev/content",
  testTypes,
);

// The idea is to run similar test cases at the same time to avoid
// weirdness related to connectivity as connection speed may vary.
function testSuites(type: string, prefix: string, names: string[]) {
  range(amountOfRuns).forEach((i) =>
    names.forEach((name: string) =>
      test(prefix + " - " + name + " audit content #" + (i + 1), () =>
        auditContentPage(type, prefix, name, i + 1),
      ),
    ),
  );
}

async function auditContentPage(
  type: string,
  prefix: string,
  name: string,
  n: number,
) {
  const port = 9222;
  // TODO: This is the spot where playwright can be run against different browsers
  // The available options are chromium, firefox, and webkit (Safari)
  const browser = await playwright["chromium"].launch({
    args: [`--remote-debugging-port=${port}`],
  });

  console.log("Using browser version", browser.version());

  const url = `${prefix}/${name}`;
  const page = await browser.newPage();
  await page.goto(url);

  await playAudit({
    page,
    thresholds,
    reports: getReportsConfiguration(type + "-" + name + "-" + n),
    port,
    config: FORM_FACTOR === "desktop" ? desktopConfig : mobileConfig,
  });

  await browser.close();
}

// Utils
function getReportsConfiguration(prefix: string) {
  return {
    formats: { json: true, html: true, csv: true },
    name: prefix + "-audit",
    directory: `test-output/content-benchmark/${FORM_FACTOR}`,
    formFactor: FORM_FACTOR,
  };
}
