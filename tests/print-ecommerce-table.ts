import process from "node:process";
import { average, median } from "../math.ts";
import { readAuditField } from "./read-audits.ts";

const FORM_FACTOR = process.env.FORM_FACTOR;

function printEcommerceTable() {
  const testPrefix = `test-output/ecommerce-benchmark/${FORM_FACTOR}/`;
  const variants = [
    {
      name: "SSR",
      prefix: "ssr-cf-",
    },
    {
      name: "SSR with islands",
      prefix: "islands-cf-",
    },
  ];
  const titles = ["Variant", "FCP", "LCP", "TBT", "INP", "Bytes transferred"];
  const fieldGetters: ((o: Record<string, unknown>) => string)[] = [
    // @ts-expect-error This is fine for now
    (o) => o.metrics?.details.items[0].firstContentfulPaint,
    // @ts-expect-error This is fine for now
    (o) => o.metrics?.details.items[0].largestContentfulPaint,
    // @ts-expect-error This is fine for now
    (o) => o.metrics?.details.items[0].totalBlockingTime,
    // @ts-expect-error This is fine for now
    (o) => o.metrics?.details.items[0].interactive,
    // @ts-expect-error This is fine for now
    (o) => o.diagnostics?.details.items[0].totalByteWeight,
  ];
  const rows = variants
    .flatMap((variant) => [
      [
        processVariant(variant.name + " (average)", variant.prefix, average) +
          "\\\\",
        processVariant(variant.name + " (median)", variant.prefix, median) +
          "\\\\",
      ],
    ])
    .flat()
    .join("\n");

  function processVariant(
    title: string,
    prefix: string,
    fn: (numbers: number[]) => number,
  ) {
    return [title]
      .concat(
        fieldGetters.map((field) =>
          fn(readAuditField(testPrefix + prefix, field)).toString(),
        ),
      )
      .join("&");
  }

  console.log("Titles:");
  console.log(titles.join("&") + "\\\\");
  console.log();
  console.log("Rows:");
  console.log(rows);
}

export { printEcommerceTable };
