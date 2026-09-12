#!/usr/bin/env node
import { inspectSpread } from './spread-geometry.mjs';
if (process.argv.length !== 4 || process.argv[2] !== '--input') {
    console.error('Usage: node validate-spread.mjs --input spread.png');
    process.exitCode = 1;
}
else {
    inspectSpread(process.argv[3]).then(result => console.log(JSON.stringify(result, null, 2)))
        .catch(error => { console.error(error.message); process.exitCode = 1; });
}
