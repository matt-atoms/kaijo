# Umami Tracking

This starter provides lightweight Umami helpers in `features/umami/` for SSR-safe analytics.

## Overview

- Helpers no-op when Umami is not loaded
- Supports page views and custom events
- Supports identify calls with optional metadata
- The script tag in `app/shared-web-layout.tsx` only renders with a `data-domains` allowlist derived from `NEXT_PUBLIC_URL` (apex + www) and is skipped entirely on localhost setups, so local and preview visits are never tracked

## Usage

```tsx
import { track, identify } from "~/features/umami/tracking";

track();
track("cta-primary", { id: "hero" });
identify("user_123", { plan: "pro" });
```

## Setup

1. Add the Umami script in your layout/head based on your Umami dashboard settings
2. Use `track` and `identify` in client runtime paths where analytics are needed
