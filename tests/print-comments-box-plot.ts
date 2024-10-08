import { readAudits } from "./read-audits.ts";

// TODO: This code could be condensed a lot
function printBoxPlot() {
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
    p25?: number;
    p75?: number;
    firstRun?: number;
    median?: number;
    average?: number;
    min?: number;
    max?: number;
  };

  auditTypes.forEach((auditType) => {
    const testPrefix = "test-output/blog-benchmark/";
    const cfVanillaFCPs = readAudits(testPrefix + "cf-vanilla-", auditType);
    const cfDisqusFCPs = readAudits(testPrefix + "cf-disqus-", auditType);
    const cfLazyDisqusFCPs = readAudits(
      testPrefix + "cf-lazy-disqus-",
      auditType,
    );
    const cfIslandsFCPs = readAudits(testPrefix + "cf-islands-", auditType);

    calculatedRows.cfVanilla[auditType] = getValues(cfVanillaFCPs);
    calculatedRows.cfDisqus[auditType] = getValues(cfDisqusFCPs);
    calculatedRows.cfLazyDisqus[auditType] = getValues(cfLazyDisqusFCPs);
    calculatedRows.cfIslands[auditType] = getValues(cfIslandsFCPs);

    function getValues(numbers: number[]) {
      return {
        p25: p25(numbers),
        p75: p75(numbers),
        median: median(numbers),
        average: average(numbers),
        min: min(numbers),
        max: max(numbers),
      };
    }
  });

  const rows = [
    ["CF vanilla", "cfVanilla"],
    ["CF Disqus", "cfDisqus"],
    ["CF lazy Disqus", "cfLazyDisqus"],
    ["CF islands", "cfIslands"],
  ];

  const template = ({
    median,
    p25,
    p75,
    min,
    max,
  }: {
    median: number;
    p25: number;
    p75: number;
    min: number;
    max: number;
  }) => `
    \\addplot+[
    boxplot prepared={
      median=${median},
      upper quartile=${p75},
      lower quartile=${p25},
      upper whisker=${max},
      lower whisker=${min}
    },
    ] coordinates {};`;

  // Order: FCP, SRT, FCP, SRT, ...
  // console.log("\nFCP (min, max, p25, p75, median, average)");
  console.log(
    rows
      .map(
        (row) =>
          template(
            // @ts-expect-error This is fine for now
            calculatedRows[row[1]]["first-contentful-paint"],
          ) +
          template(
            // @ts-expect-error This is fine for now
            calculatedRows[row[1]]["server-response-time"],
          ),
      )
      .join(""),
  );
  // console.log("\nSRT (min, max, p25, p75, median, average)");
  /*console.log(
    rows
      .map((row) =>
        template(
          // @ts-expect-error This is fine for now
          calculatedRows[row[1]]["server-response-time"],
        ),
      )
      .join(""),
  );*/
}

function min(values: number[]) {
  // @ts-expect-error This is fine
  return values.toSorted((a, b) => a - b).at(0);
}

function max(values: number[]) {
  // @ts-expect-error This is fine
  return values.toSorted((a, b) => a - b).at(-1);
}

function p25(values: number[]) {
  // @ts-expect-error This is fine
  return values.toSorted((a, b) => a - b)[Math.floor(values.length * 0.25)];
}

function p75(values: number[]) {
  // @ts-expect-error This is fine
  return values.toSorted((a, b) => a - b)[Math.floor(values.length * 0.75)];
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

export { printBoxPlot };
