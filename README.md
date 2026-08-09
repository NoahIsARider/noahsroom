# noahisarider knowledge base navigation

This project builds a static navigation page from the `Knowlegde Base` section inside the exported bookmarks file.

## files that matter

- `favorites_7_28_26.html`: source bookmarks export
- `scripts/build.mjs`: build script
- `index.html`: generated page in the project root
- `dist/`: generated static deployment output

## how to update the site each time

1. Replace the old bookmarks export with the new one.
   - Keep the file in the project root.
   - If you want to keep using the current script without changes, keep the file name as `favorites_7_28_26.html`.

2. Run the build command in this folder:

```bash
npm run build
```

3. After the build finishes, these files will be refreshed automatically:
   - `index.html`
   - `knowledge-base.json`
   - everything inside `dist/`

4. Deploy the contents of `dist/` with your action workflow.

## notes

- The page only reads the `Knowlegde Base` branch from the bookmarks file.
- If you rename the bookmarks export file, update the `inputPath` in `scripts/build.mjs`.
- If you change the visual style, rebuild again before pushing.
