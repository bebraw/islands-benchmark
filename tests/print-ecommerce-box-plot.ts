import { min, max, p25, p75, median, average } from "../math.ts";
import { readAudits } from "./read-audits.ts";

// TODO: This code could be condensed a lot
function printEcommerceBoxPlot() {
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
    p25?: number;
    p75?: number;
    firstRun?: number;
    median?: number;
    average?: number;
    min?: number;
    max?: number;
  };

  auditTypes.forEach((auditType) => {
    const testPrefix = "test-output/ecommerce-benchmark/mobile/";
    const ssrFCPs = readAudits(testPrefix + "ssr-cf-", auditType);
    const islandsFCPs = readAudits(testPrefix + "islands-cf-", auditType);

    calculatedRows.ssr[auditType] = getValues(ssrFCPs);
    calculatedRows.islands[auditType] = getValues(islandsFCPs);

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
    ["SSR", "ssr"],
    ["Islands", "islands"],
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

export { printEcommerceBoxPlot };
