# Japan 2026 trip page — photos

This page auto-loads whatever's in `./photos/` through `photos.json`. Until
real photos are added it falls back to placeholder images so the layout is
fully previewable.

## Add your photos

1. Drop your downloaded, web-resolution images (~1600px wide max) into
   `./photos/`.
2. Regenerate the manifest:
   ```
   node generate-manifest.mjs
   ```
3. Refresh the page — real photos replace the placeholders automatically.

## Optional: pin a photo to a specific leg

Name a file with one of these prefixes and it's assigned to that section
instead of being spread evenly across all four:

- `tokyo-bay-*` / `tokyo-bay_*`
- `hakone-*` / `hakone_*`
- `osaka-*` / `osaka_*`
- `tokyo-*` / `tokyo_*`

Everything else (and any overflow) fills in evenly across the four legs and
always appears in the full Gallery section regardless of tagging.
