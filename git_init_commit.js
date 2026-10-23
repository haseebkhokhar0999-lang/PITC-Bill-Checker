const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Super/Antigravity/PITC-Bill-Checker';

async function initAndCommit() {
  console.log('1. Initializing git repo...');
  await git.init({ fs, dir, defaultBranch: 'main' });

  console.log('2. Reading files to stage...');
  // Read all files ignoring node_modules, .git, etc.
  function getFiles(currentDir, relativePrefix = '') {
    let files = [];
    const items = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const item of items) {
      if (item.name === 'node_modules' || item.name === '.git' || item.name === 'pnpm-lock.yaml') continue;
      const relPath = relativePrefix ? `${relativePrefix}/${item.name}` : item.name;
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        files = files.concat(getFiles(fullPath, relPath));
      } else {
        files.push(relPath);
      }
    }
    return files;
  }

  const allFiles = getFiles(dir);
  console.log(`Found ${allFiles.length} project files to track.`);

  console.log('3. Staging files...');
  for (const f of allFiles) {
    await git.add({ fs, dir, filepath: f });
  }

  console.log('4. Creating commit...');
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Super',
      email: 'user@local.domain',
    },
    message: 'Initial commit: PITC Bill Checker with multi-company auto-discovery, live CCMS payment verification, and 100% responsive UI',
  });

  console.log('Commit created successfully! SHA:', sha);

  const log = await git.log({ fs, dir, depth: 1 });
  console.log('Latest commit message:', log[0].commit.message);
}

initAndCommit().catch(console.error);
