// Regenerate photos.json from whatever image files are in ./photos/
// Run from this directory: node generate-manifest.mjs
import { readdirSync, writeFileSync } from 'node:fs';

const files = readdirSync(new URL('./photos/', import.meta.url))
	.filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f))
	.sort();

writeFileSync(new URL('./photos.json', import.meta.url), JSON.stringify(files, null, 2) + '\n');

console.log('Wrote photos.json with ' + files.length + ' photo(s).');
