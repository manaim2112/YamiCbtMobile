#!/usr/bin/env node
/**
 * Release script — bumps version, creates git tag, and pushes to trigger
 * the GitHub Actions build workflow.
 *
 * Usage:
 *   npm run release          → patch bump (1.0.0 → 1.0.1)
 *   npm run release minor    → minor bump (1.0.0 → 1.1.0)
 *   npm run release major    → major bump (1.0.0 → 2.0.0)
 *   npm run release 1.2.3    → explicit version
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  console.log(`  → ${cmd}`);
  return execSync(cmd, { stdio: opts.silent ? 'pipe' : 'inherit', encoding: 'utf8' });
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

function bumpVersion(current, type) {
  const [major, minor, patch] = current.split('.').map(Number);
  switch (type) {
    case 'major': return `${major + 1}.0.0`;
    case 'minor': return `${major}.${minor + 1}.0`;
    case 'patch':
    default:      return `${major}.${minor}.${patch + 1}`;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const appJsonPath = path.join(__dirname, '..', 'app.json');

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

  const currentVersion = pkg.version;
  const bumpType = process.argv[2] || 'patch';

  // Determine new version
  let newVersion;
  if (/^\d+\.\d+\.\d+/.test(bumpType)) {
    newVersion = bumpType; // explicit version passed
  } else {
    newVersion = bumpVersion(currentVersion, bumpType);
  }

  console.log(`\n🚀 YamiCBT Mobile Release\n`);
  console.log(`  Current version : ${currentVersion}`);
  console.log(`  New version     : ${newVersion}`);
  console.log(`  Bump type       : ${bumpType}\n`);

  // Check for uncommitted changes
  try {
    const status = run('git status --porcelain', { silent: true });
    if (status.trim()) {
      console.error('❌ You have uncommitted changes. Please commit or stash them first.\n');
      console.error(status);
      process.exit(1);
    }
  } catch {
    console.error('❌ Not a git repository or git is not installed.');
    process.exit(1);
  }

  // Confirm
  const answer = await ask(`  Proceed with release v${newVersion}? (y/N) `);
  if (answer.toLowerCase() !== 'y') {
    console.log('\n  Aborted.\n');
    process.exit(0);
  }

  console.log('\n📦 Updating version numbers...');

  // Update package.json
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('  ✓ package.json');

  // Update app.json (expo.version + android.versionCode)
  appJson.expo.version = newVersion;
  if (appJson.expo.android) {
    const [major, minor, patch] = newVersion.split('.').map(Number);
    // versionCode: MMMNNNPPP (e.g. 1.2.3 → 1002003)
    appJson.expo.android.versionCode = major * 1_000_000 + minor * 1_000 + patch;
  }
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log('  ✓ app.json');

  console.log('\n🔖 Creating git commit and tag...');
  run(`git add package.json app.json`);
  run(`git commit -m "chore: release v${newVersion}"`);
  run(`git tag v${newVersion}`);

  console.log('\n📤 Pushing to GitHub...');
  run(`git push`);
  run(`git push origin v${newVersion}`);

  console.log(`\n✅ Released v${newVersion}!`);
  console.log(`\n   GitHub Actions will now:`);
  console.log(`   1. Build APK + AAB via EAS`);
  console.log(`   2. Create GitHub Release with both artifacts`);
  console.log(`\n   Track progress at: https://github.com/$(git remote get-url origin | sed 's/.*github.com[:/]//;s/\\.git$//')/actions\n`);
}

main().catch((err) => {
  console.error('\n❌ Release failed:', err.message);
  process.exit(1);
});
