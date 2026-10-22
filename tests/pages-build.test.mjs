import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, readdir, rm, access, cp, mkdir, writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildSite} from '../build.mjs';
import {normalizeBasePath, sitePath} from '../assets/site-path.mjs';

test('site URLs preserve queries, fragments, external links and root hosting', () => {
  assert.equal(normalizeBasePath('pinehaven-golf-club'), '/pinehaven-golf-club/');
  for (const invalid of ['../site', '/a?b/', 'https://example.com', '/./']) {
    assert.throws(() => normalizeBasePath(invalid));
  }
  const base = '/pinehaven-golf-club/';
  assert.equal(sitePath('/', base), base);
  assert.equal(sitePath('/visitors/?date=2026-10-23#booking', base), base + 'visitors/?date=2026-10-23#booking');
  for (const url of ['#booking', 'https://example.com', '//example.com', base + 'course/']) {
    assert.equal(sitePath(url, base), url);
  }
  assert.equal(sitePath('/assets/favicon.svg'), '/assets/favicon.svg');
});

test('Pages export contains all nine routes, prefixed resources and no source documents', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'pinehaven-build-test-'));
  try {
    const base = '/pinehaven-golf-club/';
    const result = await buildSite({outDir, basePath: base});
    assert.equal(result.pages, 9);
    for (const route of ['', 'course', 'visitors', 'membership', 'academy', 'clubhouse', 'contact', 'privacy', 'terms']) {
      const html = await readFile(join(outDir, route, 'index.html'), 'utf8');
      assert.match(html, /href="\/pinehaven-golf-club\/assets\/style.css"/);
      const urls = [...html.matchAll(/\b(?:href|src|action)="(\/(?!\/)[^"]*)"/g)].map(match => match[1]);
      assert(urls.length > 10);
      assert(urls.every(url => url.startsWith(base)), route + ' has unprefixed URL');
      for (const url of urls) await access(join(outDir, url.slice(base.length).split(/[?#]/)[0]));
    }
    assert.match(await readFile(join(outDir, 'index.html'), 'utf8'), /data-page="\/"/);
    assert.match(await readFile(join(outDir, 'assets/style.css'), 'utf8'), /url\('\/pinehaven-golf-club\/assets\/fonts\/manrope.ttf'\)/);
    assert.match(await readFile(join(outDir, 'assets/app.mjs'), 'utf8'), /sitePath\(`\/visitors\//);
    assert.match(await readFile(join(outDir, 'assets/course.mjs'), 'utf8'), /sitePath\(`\/assets\/images\/holes\//);
    await access(join(outDir, '.nojekyll'));
    const top = await readdir(outDir);
    assert(!top.some(file => ['src', 'work', 'README.md', 'serve.mjs', '.git'].includes(file)));
  } finally {
    await rm(outDir, {recursive: true, force: true});
  }
});

test('publisher excludes stale dist files and preserves the source checkout and deployment history', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'pinehaven-publish-test-'));
  const fixture = join(temporary, 'source');
  const remote = join(temporary, 'remote.git');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const git = args => execFileSync('git', args, {cwd: fixture, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']}).trim();
  const publish = () => execFileSync(process.execPath, ['scripts/publish-pages.mjs'], {cwd: fixture, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']});
  try {
    await mkdir(fixture);
    for (const name of ['assets', 'src', 'scripts', 'build.mjs']) {
      await cp(join(root, name), join(fixture, name), {recursive: true});
    }
    await writeFile(join(fixture, '.gitignore'), 'dist/\n');
    git(['init', '-b', 'main']);
    git(['config', 'user.name', 'Pages test']);
    git(['config', 'user.email', 'pages@example.invalid']);
    git(['add', '.']);
    git(['commit', '-m', 'Fixture source']);
    git(['init', '--bare', remote]);
    git(['remote', 'add', 'origin', remote]);
    await mkdir(join(fixture, 'dist'));
    await writeFile(join(fixture, 'dist', 'stale-private-document.txt'), 'must not publish');
    publish();
    const remoteGit = args => git(['--git-dir=' + remote, ...args]);
    const first = remoteGit(['rev-parse', 'gh-pages']);
    const paths = remoteGit(['ls-tree', '-r', '--name-only', 'gh-pages']).split('\n');
    assert(paths.includes('index.html') && paths.includes('assets/site-path.mjs'));
    assert(!paths.some(path => /stale-private|^src\/|^scripts\/|^dist\//.test(path)));
    assert.equal(git(['branch', '--show-current']), 'main');
    assert.equal(git(['status', '--porcelain']), '');
    assert.match(publish(), /already contains/);
    assert.equal(remoteGit(['rev-parse', 'gh-pages']), first);
    await writeFile(join(fixture, 'assets', 'release.txt'), 'second release');
    git(['add', 'assets/release.txt']);
    git(['commit', '-m', 'Second release']);
    publish();
    assert.equal(remoteGit(['rev-parse', 'gh-pages^']), first);
    assert.equal(remoteGit(['show', 'gh-pages:assets/release.txt']), 'second release');
    assert.equal(git(['status', '--porcelain']), '');
  } finally {
    await rm(temporary, {recursive: true, force: true});
  }
});
