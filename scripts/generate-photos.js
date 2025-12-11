import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');
const imagesDir = path.join(publicDir, 'images');

// Ensure directories exist
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}

// Generate 15 placeholder images (SVGs are text-based and easier to generate than JPGs)
console.log('Generating 15 memory placeholder photos...');

for (let i = 1; i <= 15; i++) {
    const hue = (i * 25) % 360;
    const color = `hsl(${hue}, 70%, 60%)`;
    const textColor = `hsl(${hue}, 70%, 20%)`;
    
    // Simple SVG with a colored rectangle and a number
    const svgContent = `
<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <rect x="20" y="20" width="360" height="360" fill="none" stroke="white" stroke-width="10" stroke-opacity="0.5"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dy=".35em">${i}</text>
  <text x="50%" y="80%" font-family="Arial, sans-serif" font-size="24" fill="white" fill-opacity="0.8" text-anchor="middle">MEMORY FRAGMENT</text>
</svg>
    `.trim();

    // Write file
    fs.writeFileSync(path.join(imagesDir, `${i}.svg`), svgContent);
}

console.log('✅ Generated 15 photos in public/images/');