import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

function run(args: string[]) {
  return spawnSync(process.execPath, ['scripts/content-cli.mjs', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' }
  });
}

describe('content CLI process contract', () => {
  it('provides top-level and subcommand help with zero exit status', () => {
    const top = run(['--help']);
    const subcommand = run(['preview', '--help']);
    const newCommand = run(['new', '--help']);

    expect(top.status).toBe(0);
    expect(top.stdout).toContain('npm run content -- <command>');
    expect(subcommand.status).toBe(0);
    expect(subcommand.stdout).toContain('npm run content -- preview <target>');
    expect(newCommand.status).toBe(0);
    expect(newCommand.stdout).toContain('npm run content -- new post');
  });

  it('emits parseable JSON for a non-interactive dry-run', () => {
    const result = run([
      'new',
      'post',
      '--slug',
      'process-contract-draft',
      '--title',
      'Process Contract Draft',
      '--description',
      'A temporary CLI contract fixture.',
      '--tags',
      'publishing',
      '--no-input',
      '--dry-run',
      '--json'
    ]);

    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      ok: true,
      action: 'create',
      dryRun: true,
      target: 'post/process-contract-draft'
    });
    expect([...result.stdout].map((character) => character.codePointAt(0))).not.toContain(27);
  });

  it('uses a stable usage exit code and sends errors to stderr', () => {
    const result = run(['new', 'post', '--no-input']);

    expect(result.status).toBe(2);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('Missing --slug');
  });
});
