#!/usr/bin/env node
// Generate PNG icons from favicon.svg for PWA
// Usage: node scripts/generate-icons.mjs

import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const svgPath = join(publicDir, 'favicon.svg');

const icons = [
  { name: 'apple-touch-icon.png', size: 180, padding: 20 },
  { name: 'icon-192.png', size: 192, padding: 20 },
  { name: 'icon-512.png', size: 512, padding: 50 },
];

async function generateIcons() {
  const svgBuffer = readFileSync(svgPath);

  for (const { name, size, padding } of icons) {
    const outputPath = join(publicDir, name);

    if (existsSync(outputPath)) {
      console.log(`✓ ${name} already exists, skipping`);
      continue;
    }

    // Create background + resized SVG overlay
    const iconBuffer = await sharp(svgBuffer)
      .resize(size - padding * 2, size - padding * 2)
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 250, g: 253, b: 247, alpha: 1 }, // #FAFDF7
      },
    })
      .composite([{ input: iconBuffer, top: padding, left: padding }])
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${name} (${size}x${size})`);
  }

  console.log('Done!');
}

generateIcons().catch((err) => {
  console.error('Icon generation failed:', err.message);
  process.exit(1);
});
