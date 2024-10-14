import { average, median } from "./math.ts";
import { readAuditField } from "./read-audits.ts";

function printCommentsTable() {
  const testPrefix = "test-output/blog-benchmark/mobile/";
  const variants = [
    {
      name: "Vanilla",
      prefix: "cf-vanilla-",
    },
    {
      name: "Disqus",
      prefix: "cf-disqus-",
    },
    {
      name: "Lazy Disqus",
      prefix: "cf-lazy-disqus-",
    },
    {
      name: "Islands",
      prefix: "cf-islands-",
    },
  ];
  const titles = ["Variant", "FCP", "LCP", "TBP", "Bytes transferred"];
  const fieldGetters: ((o: Record<string, unknown>) => string)[] = [
    // @ts-expect-error This is fine for now
    (o) => o.metrics.details.items[0].firstContentfulPaint,
    // @ts-expect-error This is fine for now
    (o) => o.metrics.details.items[0].largestContentfulPaint,
    // @ts-expect-error This is fine for now
    (o) => o.metrics.details.items[0].totalBlockingTime,
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
      .join("|");
  }

  console.log("Titles:");
  console.log(titles.join("|") + "\\\\");
  console.log();
  console.log("Rows:");
  console.log(rows);
}

export { printCommentsTable };
