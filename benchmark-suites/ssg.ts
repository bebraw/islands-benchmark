import b from "benny";
import { run as runBreezewind } from "../ssg/breezewind";
import { init as init11ty, run as run11ty } from "../ssg/11ty";
import { run as runReact } from "../ssg/react";
import { run as runVanilla } from "../ssg/vanilla";

const SUITE_NAME = "ssg";
const BENCHMARK_OUTPUT = "benchmark-output";
const OPTIONS = [1000];

function runOnce() {
  return b.suite(
    SUITE_NAME,
    ...OPTIONS.map((amount) =>
      b.add(`breezewind (${amount})`, async () => await runBreezewind(amount))
    ),
    ...OPTIONS.map((amount) =>
      b.add(`11ty (${amount})`, async () => {
        await init11ty(amount);

        return () => run11ty();
      })
    ),
    ...OPTIONS.map((amount) =>
      b.add(`react (${amount})`, async () => await runReact(amount))
    ),
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
  runOnce();
}

export default runOnce;
