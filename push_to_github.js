const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');

const dir = 'c:/Users/Super/Antigravity/PITC-Bill-Checker';

async function pushToGitHub(repoUrl, token, username = 'git', branch = 'main') {
  try {
    console.log(`Setting remote origin: ${repoUrl}`);
    try {
      await git.deleteRemote({ fs, dir, remote: 'origin' });
    } catch (e) {}

    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: repoUrl
    });

    console.log(`Pushing to ${branch} on GitHub...`);
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: branch,
      onAuth: () => ({
        username: username || 'token',
        password: token,
      }),
    });

    console.log('Push complete!', pushResult);
    return { success: true, pushResult };
  } catch (err) {
    console.error('Push failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { pushToGitHub };

// If run from command line: node push_to_github.js <repoUrl> <token>
if (require.main === module) {
  const args = process.argv.slice(2);
  const repoUrl = args[0];
  const token = args[1];
  const username = args[2] || 'git';
  if (!repoUrl) {
    console.log('Usage: node push_to_github.js <https://github.com/user/repo.git> <github_token>');
    process.exit(1);
  }
  pushToGitHub(repoUrl, token, username).then(res => {
    if (!res.success) process.exit(1);
  });
}
