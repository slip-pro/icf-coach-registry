---
description: Rules for WordPress embedding approach
globs: ["src/**", "public/**"]
---

# WordPress Embedding Rules

- This project produces a standalone JS widget, NOT a WordPress plugin
- The widget must work when loaded via a single `<script>` tag on any HTML page
- CSS must be scoped (CSS modules, shadow DOM, or BEM with unique prefix) to avoid WP theme conflicts
- No jQuery dependency — use vanilla JS or lightweight alternatives
- The widget must not modify the host page DOM outside its container element
- Test the widget both standalone (local HTML file) and inside a WP page
