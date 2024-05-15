import scaling from "./scaling";
import ssg from "./ssg";

async function main() {
  await scaling();
  await ssg();
}

main();
