const fs = require("fs");
const glob = require("glob");
// const { range } = require("../utils");

function getReportsConfiguration(prefix) {
  return {
    formats: { json: true, html: true, csv: true },
    name: prefix + "-audit",
    directory: "benchmark-output",
    // Test against mobile to throttle connection
    formFactor: "mobile",
  };
}

function printCSV() {
  // Check the output JSON files for possible audits
  const auditTypes = [
    "first-contentful-paint",
    "server-response-time",
    "interactive",
  ];

  auditTypes.forEach((auditType) => {
    const edgeIndexFCPs = readAudits("cf-edge-index-", auditType);
    const edgePageFCPs = readAudits("cf-edge-page-", auditType);
    const edgeWithIsrIndexFCPs = readAudits(
      "cf-edge-with-isr-index-",
      auditType
    );
    const edgeWithIsrPageFCPs = readAudits("cf-edge-with-isr-page-", auditType);
    const vanillaIndexFCPs = readAudits("cf-vanilla-index-", auditType);
    const vanillaPageFCPs = readAudits("cf-vanilla-page-", auditType);
    const netlifyIndexFCPs = readAudits("netlify-vanilla-index-", auditType);
    const netlifyPageFCPs = readAudits("netlify-vanilla-page-", auditType);

    function pickRow(i) {
      return `${i + 1},${edgeIndexFCPs[i]},${edgePageFCPs[i]},${
        edgeWithIsrIndexFCPs[i]
      },${edgeWithIsrPageFCPs[i]},${vanillaIndexFCPs[i]},${
        vanillaPageFCPs[i]
      },${netlifyIndexFCPs[i]},${netlifyPageFCPs[i]}`;
    }

    console.log(`\nAudit type: ${auditType}`);
    // This output should go to main.tex
    console.log(`a,b,c,d,e,f,g,h,i
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
  const calculatedRows = {
    ssrIndex: {},
    ssrPost: {},
    isrIndex: {},
    isrPost: {},
    ssgIndex: {},
    ssgPost: {},
    netlifySsgIndex: {},
    netlifySsgPost: {},
  };

  auditTypes.forEach((auditType) => {
    const edgeIndexValues = readAudits("cf-edge-index-", auditType);
    const edgePageValues = readAudits("cf-edge-page-", auditType);
    const edgeWithIsrIndexValues = readAudits(
      "cf-edge-with-isr-index-",
      auditType
    );
    const edgeWithIsrPageValues = readAudits(
      "cf-edge-with-isr-page-",
      auditType
    );
    const ssgIndexValues = readAudits("cf-vanilla-index-", auditType);
    const ssgPageValues = readAudits("cf-vanilla-page-", auditType);
    const netlifyIndexValues = readAudits("netlify-vanilla-index-", auditType);
    const netlifyPageValues = readAudits("netlify-vanilla-page-", auditType);

    calculatedRows.ssrIndex[auditType] = {
      firstRun: edgeIndexValues[0],
      median: median(edgeIndexValues.slice(1)),
      average: average(edgeIndexValues.slice(1)),
    };
    calculatedRows.ssrPost[auditType] = {
      firstRun: edgePageValues[0],
      median: median(edgePageValues.slice(1)),
      average: average(edgePageValues.slice(1)),
    };
    calculatedRows.isrIndex[auditType] = {
      firstRun: edgeWithIsrIndexValues[0],
      median: median(edgeWithIsrIndexValues.slice(1)),
      average: average(edgeWithIsrIndexValues.slice(1)),
    };
    calculatedRows.isrPost[auditType] = {
      firstRun: edgeWithIsrPageValues[0],
      median: median(edgeWithIsrPageValues.slice(1)),
      average: average(edgeWithIsrPageValues.slice(1)),
    };
    calculatedRows.ssgIndex[auditType] = {
      firstRun: ssgIndexValues[0],
      median: median(ssgIndexValues.slice(1)),
      average: average(ssgIndexValues.slice(1)),
    };
    calculatedRows.ssgPost[auditType] = {
      firstRun: ssgPageValues[0],
      median: median(ssgPageValues.slice(1)),
      average: average(ssgPageValues.slice(1)),
    };
    calculatedRows.netlifySsgIndex[auditType] = {
      firstRun: netlifyIndexValues[0],
      median: median(netlifyIndexValues.slice(1)),
      average: average(netlifyIndexValues.slice(1)),
    };
    calculatedRows.netlifySsgPost[auditType] = {
      firstRun: netlifyPageValues[0],
      median: median(netlifyPageValues.slice(1)),
      average: average(netlifyPageValues.slice(1)),
    };
  });

  function getRow(name, property) {
    return `${name} & ${Math.round(
      calculatedRows[property]["first-contentful-paint"].firstRun
    )} & ${Math.round(
      calculatedRows[property]["first-contentful-paint"].median
    )} & ${Math.round(
      calculatedRows[property]["first-contentful-paint"].average
    )} & ${Math.round(
      calculatedRows[property]["server-response-time"].firstRun
    )} & ${Math.round(
      calculatedRows[property]["server-response-time"].median
    )} & ${Math.round(
      calculatedRows[property]["server-response-time"].average
    )} \\\\\n`;
  }

  const rows = [
    ["CF SSR index", "ssrIndex"],
    ["CF SSR post", "ssrPost"],
    ["CF ISR index", "isrIndex"],
    ["CF ISR post", "isrPost"],
    ["CF SSG index", "ssgIndex"],
    ["CF SSG post", "ssgPost"],
    ["Netlify SSG index", "netlifySsgIndex"],
    ["Netlify SSG post", "netlifySsgPost"],
  ];

  console.log(rows.map((row) => getRow(row[0], row[1])).join(""));
}

function median(values) {
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

function average(values) {
  const sum = values.reduce((a, b) => a + b, 0);

  return sum / values.length;
}

function readAudits(pageType, auditType) {
  const files = glob.sync("benchmark-output/" + pageType + "*-audit.json");

  const audits = files.map((f) => fs.readFileSync(f)).map((d) => JSON.parse(d));

  return audits.map((a) => a["audits"][auditType]["numericValue"]);
}

function range(n, customizer) {
  return Array.from(Array(n), (_, i) => customizer(i));
}

module.exports = { getReportsConfiguration, printCSV, printTable, readAudits };
