import b from "benny";
import { run as runVanilla } from "../ssg/vanilla";
import { range } from "../utils";

const SUITE_NAME = "scaling";
const BENCHMARK_OUTPUT = "benchmark-output";
const OPTIONS = range(3, (i) => Math.pow(10, i));

function run() {
  return b.suite(
    SUITE_NAME,
    ...OPTIONS.map((amount) =>
      b.add(`vanilla (${amount})`, async () => await runVanilla(amount))
    ),
    b.cycle(),
    b.complete(),
    b.save({ file: SUITE_NAME, folder: BENCHMARK_OUTPUT, version: "1.0.0" }),
    b.save({ file: SUITE_NAME, folder: BENCHMARK_OUTPUT, format: "chart.html" })
  );
}

if (require.main === module) {
  run();
}

export default run;
