#!/usr/bin/env sh
# Mac/Linux: start a local server and open the app.
cd "$(dirname "$0")"
echo "Open http://localhost:8801/docs/  (Ctrl+C to stop)"
npx --yes http-server . -p 8801 -c-1 2>/dev/null || python3 -m http.server 8801
