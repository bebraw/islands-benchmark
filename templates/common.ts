function baseTemplate({
  base,
  title,
  content,
}: {
  base: string;
  title: string;
  content: string;
}) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <base href="${base}" />
      <title>${title}</title>
    </head>
    <body>
      <main style="margin: 0 auto 0 auto; max-width: 80ch;">
        <h1>${title}</h1>
        <p>${content}</p>
      </main>
    </body>
  </html>`;
}

export { baseTemplate };
