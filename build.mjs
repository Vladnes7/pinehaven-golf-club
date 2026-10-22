import {writeFile, mkdir, cp, readdir, readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, join} from 'node:path';
import {parseArgs} from 'node:util';
import {PAGES} from './src/pages.mjs';
import {header, footer} from './src/components.mjs';
import {HOLES} from './assets/course.mjs';
import {normalizeBasePath, sitePath} from './assets/site-path.mjs';

const root = fileURLToPath(new URL('./', import.meta.url));
export async function buildSite({outDir = root, basePath = '/'} = {}) {
  const output = resolve(root, outDir);
  const base = normalizeBasePath(basePath);
  if (output === resolve(root) && base !== '/') throw new Error('Use a separate output directory for a prefixed build');
  await mkdir(output, {recursive: true});
  if (output !== resolve(root)) {
    await cp(join(root, 'assets'), join(output, 'assets'), {recursive: true});
    for (const file of await readdir(join(output, 'assets'))) {
      if (!file.endsWith('.css')) continue;
      const path = join(output, 'assets', file);
      const css = await readFile(path, 'utf8');
      await writeFile(path, css.replace(/url\((['"]?)(\/(?!\/)[^)'"\s]+)\1\)/g,
        (_, quote, url) => `url(${quote}${sitePath(url, base)}${quote})`));
    }
    await writeFile(join(output, '.nojekyll'), '');
  }
  for (const [route, page] of Object.entries(PAGES)) {
    const dir = join(output, route);
    await mkdir(dir, {recursive: true});
    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content"><meta name="theme-color" content="#07533b"><meta name="description" content="Pinehaven. Лесной гольф-клуб, академия и клубный дом. Вымышленный портфолио-проект."><title>${page.title} · Pinehaven</title><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="/assets/fonts/manrope.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/assets/scrollcraft.css"><link rel="stylesheet" href="/assets/style.css"><link rel="stylesheet" href="/assets/experience.css"><link rel="stylesheet" href="/assets/finishing.css"><script defer src="/assets/scrollcraft.js"></script><script type="module" src="/assets/app.mjs"></script></head><body data-page="${route}">${header(route)}<main id="main">${page.render()}</main>${footer()}</body></html>`;
    await writeFile(join(dir, 'index.html'), html.replace(/\b(href|src|action)="(\/(?!\/)[^"]*)"/g,
      (_, attribute, url) => `${attribute}="${sitePath(url, base)}"`));
  }
  await writeFile(join(output, 'assets/scorecard.csv'), '\uFEFFЛунка;Название;Пар;Метры;Индекс\n' +
    HOLES.map(h => [h.number, h.name, h.par, h.meters, h.index].join(';')).join('\n'));
  return {output, base, pages: Object.keys(PAGES).length};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const {values} = parseArgs({options: {'out-dir': {type: 'string'}, base: {type: 'string'}}});
  const result = await buildSite({outDir: values['out-dir'], basePath: values.base});
  console.log(`Built ${result.pages} static pages and scorecard (base: ${result.base})`);
}
