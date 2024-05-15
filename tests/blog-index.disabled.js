const { test } = require("@playwright/test");
const { playAudit } = require("playwright-lighthouse");
const playwright = require("playwright");
const { getReportsConfiguration, readAudits } = require("./utils");

// Example HOST: http://127.0.0.1:8788/breezewind-on-edge
const EDGE_URL = process.env.HOST + "/posts/";

const thresholds = {
  performance: 50,
  accessibility: 50,
  "best-practices": 50,
  seo: 50,
  pwa: 10,
};

// Run the audit five times to capture differences
test("audit blog index #1", () => auditBlogIndex(1));
test("audit blog index #2", () => auditBlogIndex(2));
test("audit blog index #3", () => auditBlogIndex(3));
test("audit blog index #4", () => auditBlogIndex(4));
test("audit blog index #5", () => auditBlogIndex(5));

test.afterAll(() => {
  console.log("index:", readAudits(process.env.NAME + "-index-"));
});

async function auditBlogIndex(n) {
  const port = 9222;
  const browser = await playwright["chromium"].launch({
    args: [`--remote-debugging-port=${port}`],
  });
  const page = await browser.newPage();
  await page.goto(EDGE_URL);

  await playAudit({
    page,
    thresholds,
    reports: getReportsConfiguration(process.env.NAME + "-index-" + n),
    port,
  });

  await browser.close();
}
