import { range } from "./utils";

function getPosts(n = 100) {
  return Array.from(Array(n).keys()).map((id) => ({
    id: id.toString(),
    title: loremIpsum(id, 4),
    content: loremIpsum(id, 500),
  }));
}

// https://generator.lorem-ipsum.info/
const LOREM_IPSUM = `Lorem ipsum dolor sit amet, vix id altera vocibus fastidii. His ut tamquam copiosae, in modus moderatius duo. Nec posse movet labore at, graecis ancillae vel ut, alia illum persequeris has ei. His ad debet virtute, bonorum hendrerit eum ea. Iisque sensibus ex sea. Te novum decore percipitur sed, eos ne populo euismod, at etiam option evertitur per. Ut vis wisi mollis, et quando appellantur vim.

In pro porro labores propriae. Et elit mutat consectetuer mel, his cu summo adipisci. Ex justo latine quo, maluisset evertitur omittantur no vel, paulo petentium torquatos et sit. Vim ea laudem apeirian principes, velit lobortis te vix. Pri nisl reque equidem ea.

Legimus pertinacia ei nec. Ne eam invidunt legendos vituperata. Ornatus dissentias eum te, discere oporteat an nec. Ut quis harum laudem cum. Ad nonumy doming causae has, ea detracto quaestio maiestatis qui, paulo percipit quaerendum eum ea. An esse quando his.

Mel facete vidisse laoreet ea. No vis saepe officiis comprehensam, nec an impedit adolescens concludaturque. Vix omnis reprehendunt ei. Te nec nibh integre, sea an ipsum primis option.

Possit omittam moderatius ne mei, nihil saperet molestiae ne pro. Mei dolore sensibus in, accusamus appellantur duo in, ne eos magna propriae. Tale nobis delicata ne quo, at ius vocibus mnesarchum, nec facer debitis sapientem in. Ex pro dolore civibus eleifend, vivendum delicatissimi est ei. Nostrud volutpat cotidieque ut pro, cibo patrioque dissentias ea eos. Summo movet ut cum, mea legendos moderatius neglegentur eu.`;

function loremIpsum(start: number, amount: number) {
  const parts = LOREM_IPSUM.split(" ");

  // Generate enough text to cover the requested amount
  return range(Math.ceil((start + amount) / parts.length))
    .flatMap(() => parts)
    .slice(start, start + amount)
    .join(" ");
}

export { getPosts };
