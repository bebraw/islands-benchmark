import process from "node:process";
import { printContentTable } from "../tests/print-content-table.ts";
import { printCommentsBoxPlot } from "../tests/print-comments-box-plot.ts";
import { printCommentsSizes } from "../tests/print-comments-sizes.ts";
import { printCommentsTable } from "../tests/print-comments-table.ts";
import { printEcommerceBoxPlot } from "../tests/print-ecommerce-box-plot.ts";
import { printEcommerceSizes } from "../tests/print-ecommerce-sizes.ts";
import { printEcommerceTable } from "../tests/print-ecommerce-table.ts";
import { printSocialTable } from "../tests/print-social-table.ts";

const target = process.argv.at(-1);

switch (target) {
  case "content-table":
    printContentTable();
    break;
  case "comments-box-plot":
    printCommentsBoxPlot();
    break;
  case "comments-sizes":
    printCommentsSizes();
    break;
  case "comments-table":
    printCommentsTable();
    break;
  case "ecommerce-box-plot":
    printEcommerceBoxPlot();
    break;
  case "ecommerce-sizes":
    printEcommerceSizes();
    break;
  case "ecommerce-table":
    printEcommerceTable();
    break;
  case "social-table":
    printSocialTable();
    break;
  default:
    console.log("No matching target was found");
    break;
}
