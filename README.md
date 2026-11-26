# Yeovil Handyman

Website for Yeovil Handyman, a handyman business in Yeovil, Somerset: https://yeovilhandyman.com

Plain HTML and CSS in `site/`, with no build step. Cloudflare Pages serves `site/` from the `main` branch, so every push goes live.

```
python -m http.server 8080 --directory site   # preview at http://localhost:8080
```

Project rules and hosting details: [CLAUDE.md](CLAUDE.md).
