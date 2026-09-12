#!/usr/bin/env node
// Geometry diagram only, not generated art or an overlay for finished paintings.
import sharp from 'sharp';
import { paperPath } from './spread-geometry.mjs';
const output = new URL('../assets/paper-geometry.png', import.meta.url);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
  <defs><linearGradient id="fold"><stop stop-color="#f5eddc"/>
  <stop offset=".48" stop-color="#f5eddc"/><stop offset=".5" stop-color="#cbbca2"/>
  <stop offset=".52" stop-color="#f5eddc"/><stop offset="1" stop-color="#f5eddc"/></linearGradient></defs>
  <path d="${paperPath()}" transform="translate(.5 .5)" fill="url(#fold)" stroke="url(#fold)" stroke-width="1"/>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile(output.pathname);
console.log(output.pathname);
