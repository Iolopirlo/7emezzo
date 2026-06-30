# 7emezzo für Cloudflare Pages

Diese Version ist für Cloudflare Pages vorbereitet. Die ursprüngliche Single-HTML-Datei wurde aufgeteilt:

- `index.html`
- `style.css`
- `script.js`
- `assets/` für eingebettete Bilder

## Upload zu GitHub / Cloudflare Pages

1. ZIP entpacken.
2. Alle Dateien und Ordner in dein GitHub-Repo hochladen.
3. Wichtig: `index.html` muss direkt im Root des Repos liegen.
4. Cloudflare Pages Settings:
   - Framework preset: None
   - Build command: leer
   - Build output directory: leer oder `/`
   - Root directory: leer
5. Commit pushen und Deployment abwarten.
