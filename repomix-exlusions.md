# Repomix command with exclusions
# This will include all source code while excluding build artifacts, docs, assets, etc.
repomix --ignore "dist/, node_modules/, docs/, *.md, LICENSE, assets/, insights/, schema/, public/, package-lock.json, *.png, *.jpg, *.jpeg, *.gif, *.svg, *.ico, *.webp, .DS_Store, Thumbs.db, .vscode/, .idea/, *.swp, *.swo, *.log, npm-debug.log*, *.tmp, .cache/, *.tsbuildinfo, *.map, *.min.js, *.min.css, .git/, webpack.config.js, postcss.config.js, tsconfig.json, tailwind.config.js, src/styles/**, repomix-output.xml, repomix-exlusions.md, repomix-parts/, split-repomix.js, index.html, webpack.dev.config.js"

# Split the output into manageable chunks
# Usage: node split-repomix.js [input-file] [max-lines-per-part]
node split-repomix.js repomix-output.xml 2500  # Default
node split-repomix.js repomix-output.xml 3000  # Larger chunks
node split-repomix.js repomix-output.xml 2000  # Smaller chunks