/**
 * resize-icon.cjs
 * Resizes resources/icon.png into all Android mipmap densities (legacy + foreground).
 * Run with: node resize-icon.cjs
 */

const fs = require('fs');
const path = require('path');

const RES = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');
const SRC = path.join(__dirname, 'resources', 'icon.png');

// Standard Android mipmap sizes
const SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
};

async function main() {
    if (!fs.existsSync(SRC)) {
        console.error('ERROR: resources/icon.png not found!');
        process.exit(1);
    }

    const { Jimp } = require('jimp');
    const image = await Jimp.read(SRC);
    console.log(`Source image: ${image.width}x${image.height}`);

    for (const [dir, size] of Object.entries(SIZES)) {
        const outDir = path.join(RES, dir);
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        // Legacy icon (direct bitmap, used on Android < 8)
        await image.clone().resize({ w: size, h: size }).write(path.join(outDir, 'ic_launcher.png'));
        // Round icon (for Android launchers that support it)
        await image.clone().resize({ w: size, h: size }).write(path.join(outDir, 'ic_launcher_round.png'));
        // Foreground icon for adaptive icons (Android 8+)
        // Use a slightly smaller version (66% of canvas) so it fits in the safe zone
        const fgSize = Math.round(size * 1.0); // full size; background color handles the rest
        await image.clone().resize({ w: fgSize, h: fgSize }).write(path.join(outDir, 'ic_launcher_foreground.png'));

        console.log(`✓ ${dir}: ${size}x${size}px`);
    }

    console.log('\nDone! All mipmap icons generated.');
}

main().catch(e => { console.error(e); process.exit(1); });
