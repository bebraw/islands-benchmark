# comments-benchmark

This repository contains a simple, comment system based benchmark to see how islands architecture running on edge compares against Disqus, a third-party solution.

## Edge server

To run the edge server locally, do the following:

0. `nvm use` to use the right version of Node
1. `npm install` to install dependencies
2. `npx playwright install` to install Playwright browsers
3. `npm start` to run the server

After that you should be able to access `localhost:3000` and the `/api/posts` path behind it. See the directory `/functions` to understand which endpoints are available.

## TypeScript

TypeScript is used for the edge code (CloudFlare workers) and the setup has been derived from `wrangler init`.

## Lighthouse

To generate Lighthouse results, run the following:

```
npm run lighthouse:<test type>
```

You can see the summaries in the output (FCP in ms) as a CSV to copy to `main.tex`.

To make sure you have the latest browsers installed for testing, use `npx playwright install`.

## Creating KV stores

Use the following commands to create KV stores at Cloudflare:

```
wrangler kv:namespace create COMMENTS
wrangler kv:namespace create COMMENTS --preview
```

To make sure your Pages instance find them, [see these instructions](https://developers.cloudflare.com/pages/platform/functions/#kv-namespace) on how to bind them.

## Autocannon tests

Autocannon (req/s) tests are behind `autocannon:` namespace. Example.

```
npm run autocannon:edge
npm run autocannon:edge-with-isr
npm run autocannon:ssg
```

To run the whole suite that emits a CSV suitable for `main.tex`, use `npm run autocannon` and copy the output.

## Printing box plots

To get easy to use prints for LaTeX box plots, run any of the `print:` prefixed npm commands. Note that you need a recent version of [Deno](https://deno.com/) to run those scripts.

## Tools

* https://github.com/Polymer/tachometer
* https://www.npmjs.com/package/benny

## References

* https://github.com/antoinefink/simple-static-comments
