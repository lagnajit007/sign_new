// One-off design-system color remap. Replaces legacy hex literals with the new
// sanjog palette across all source files. Case-insensitive on the hex digits.
const fs = require('fs');
const path = require('path');

// legacy -> new. Keys MUST be lowercase 6-digit hexes.
const MAP = {
  '704ee7': '7D54FF', // primary purple
  '684ad6': '6840E0', // darker purple
  '5a3dc9': '6840E0',
  '5f3dc4': '6840E0',
  'f5f7fb': 'FAF7FF', // page bg
  '191d23': '2D1B69', // headings
  '64748b': '7E7A93', // body text
  'a0abbb': '7E7A93', // muted text
  '57e371': '22C55E', // success green
  'f0c332': 'FFC83D', // gold
  'ff9160': 'FF7A59', // orange -> coral
  'ff6265': 'FF7A59', // coral/red -> coral
  'ff4f5e': 'FF7A59', // red -> coral
  'ff5a5f': 'FF7A59',
  '3acbe8': '5EC8FF', // teal -> sky
  '3874ff': '5EC8FF', // blue -> sky
  '3182ce': '5EC8FF', // chart blue -> sky
  'e3dbfe': 'EAE4FF', // light purple tint
  'ebeafc': 'EAE4FF',
  'd5cfff': 'EAE4FF',
  'e8e4f8': 'EAE4FF',
  'e2e8f0': 'EAE4FF', // grey border -> soft
  'd0d5dd': 'EAE4FF', // grey border -> soft
  'e6ebf3': 'EAE4FF',
};

// Hexes to intentionally preserve (not in MAP, just documenting): ff2600.

const ROOT = path.join(__dirname, '..', 'src');
const EXTS = new Set(['.tsx', '.ts', '.css', '.jsx', '.js']);

let filesChanged = 0;
let totalReplacements = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (EXTS.has(path.extname(entry.name))) {
      remapFile(full);
    }
  }
}

function remapFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const [oldHex, newHex] of Object.entries(MAP)) {
    // Match #<hex> case-insensitively, with word boundary after so we don't
    // partially match an 8-digit hex.
    const re = new RegExp('#' + oldHex + '(?![0-9a-fA-F])', 'gi');
    src = src.replace(re, () => {
      count++;
      return '#' + newHex;
    });
  }
  if (count > 0) {
    fs.writeFileSync(file, src, 'utf8');
    filesChanged++;
    totalReplacements += count;
    console.log(`  ${count.toString().padStart(3)}  ${path.relative(ROOT, file)}`);
  }
}

walk(ROOT);
console.log(`\nDone: ${totalReplacements} replacements across ${filesChanged} files.`);
