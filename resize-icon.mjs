// resize-icon.mjs
// Resizes android/resources/icon.png into all Android mipmap sizes using sharp
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import path from 'path';

// We'll use Jimp as it's more commonly available as a dep
// This runs with: node resize-icon.mjs
