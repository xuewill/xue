#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CliError, EXIT, runCli } from './content-cli-lib.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const controller = new AbortController();
let interrupted = false;

process.once('SIGINT', () => {
  interrupted = true;
  process.stderr.write('Interrupted; stopping child processes and restoring content state…\n');
  controller.abort();
});

try {
  await runCli(process.argv.slice(2), {
    root: repositoryRoot,
    signal: controller.signal,
    io: {
      stdin: process.stdin,
      stdout: process.stdout,
      stderr: process.stderr
    }
  });
  process.exitCode = interrupted ? EXIT.interrupted : EXIT.success;
} catch (error) {
  const exitCode = interrupted
    ? EXIT.interrupted
    : error instanceof CliError
      ? error.exitCode
      : EXIT.runtime;
  process.stderr.write(`${error instanceof Error ? error.message : error}\n`);
  process.exitCode = exitCode;
}
