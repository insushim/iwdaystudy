#!/usr/bin/env node
// Generate Android mipmap icons from favicon.svg
import sharp from 'sharp';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const svgPath = join(rootDir, 'public', 'favicon.svg');
const resDir = join(rootDir, 'android', 'app', 'src', 'main', 'res');

const densities = [
  { name: 'mipmap-mdpi', size: 48 },
  { name: 'mipmap-hdpi', size: 72 },
  { name: 'mipmap-xhdpi', size: 96 },
  { name: 'mipmap-xxhdpi', size: 144 },
  { name: 'mipmap-xxxhdpi', size: 192 },
];

async function generateIcons() {
  const svgBuffer = readFileSync(svgPath);

  for (const { name, size } of densities) {
    const padding = Math.round(size * 0.1);
    const iconSize = size - padding * 2;

    const iconBuffer = await sharp(svgBuffer)
      .resize(iconSize, iconSize)
      .toBuffer();

    // Square icon
    const squarePath = join(resDir, name, 'ic_launcher.png');
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 250, g: 253, b: 247, alpha: 1 },
      },
    })
      .composite([{ input: iconBuffer, top: padding, left: padding }])
      .png()
      .toFile(squarePath);

    // Round icon (same image, Android rounds it with mask)
    const roundPath = join(resDir, name, 'ic_launcher_round.png');
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 250, g: 253, b: 247, alpha: 1 },
      },
    })
      .composite([{ input: iconBuffer, top: padding, left: padding }])
      .png()
      .toFile(roundPath);

    console.log(`✓ ${name} (${size}x${size})`);
  }

  console.log('Android icons generated!');
}

generateIcons().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
