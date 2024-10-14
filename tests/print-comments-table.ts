import { average } from "./math.ts";
import { readAuditField } from "./read-audits.ts";

function printTable() {
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
    .map(
      (variant) =>
        [variant.name]
          .concat(
            fieldGetters.map((field) =>
              average(
                readAuditField(testPrefix + variant.prefix, field),
              ).toString(),
            ),
          )
          .join("|") + "\\\\",
    )
    .join("\n");

  console.log("Titles:");
  console.log(titles.join("|") + "\\\\");
  console.log();
  console.log("Rows:");
  console.log(rows);
}

export { printTable };
