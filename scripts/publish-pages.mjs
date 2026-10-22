import {execFileSync} from 'node:child_process';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildSite} from '../build.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = (args, options = {}) => execFileSync('git', args, {
  cwd: root, encoding: 'utf8', ...options,
}).trim();
if (git(['status', '--porcelain'])) throw new Error('Commit source changes before publishing');
const source = git(['rev-parse', 'HEAD']);
const gitDir = git(['rev-parse', '--absolute-git-dir']);
const remote = git(['ls-remote', '--heads', 'origin', 'gh-pages']);
let parent;
if (remote) {
  git(['fetch', '--no-tags', 'origin', 'gh-pages']);
  parent = git(['rev-parse', 'FETCH_HEAD']);
}
// A separate index stages only the export, leaving the source checkout intact.
const temporary = await mkdtemp(join(tmpdir(), 'pinehaven-pages-'));
try {
  // Always publish a fresh export; files left in local dist never reach Pages.
  const {output} = await buildSite({outDir: join(temporary, 'site'), basePath: '/pinehaven-golf-club/'});
  const options = {cwd: output, env: {...process.env, GIT_INDEX_FILE: join(temporary, 'index')}};
  const artifactGit = args => git(['--git-dir=' + gitDir, '--work-tree=' + output, ...args], options);
  artifactGit(['read-tree', '--empty']);
  artifactGit(['add', '--all', '--', '.']);
  const tree = artifactGit(['write-tree']);
  if (parent && tree === git(['rev-parse', parent + '^{tree}'])) {
    console.log('GitHub Pages already contains this build');
  } else {
    const commit = git(['commit-tree', tree, ...(parent ? ['-p', parent] : [])], {
      input: `Deploy Pinehaven from ${source}\n`,
    });
    git(['push', 'origin', commit + ':refs/heads/gh-pages']);
    console.log(`Published static build: ${commit}`);
  }
} finally {
  await rm(temporary, {recursive: true, force: true});
}
