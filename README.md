# Backlogly

Personal backlog management for games, books, assignments, knowledge, videos, and everything else. **Your backlog. Your next adventure.**

## Run and build

This project needs Node.js 20+ and pnpm/npm.

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

Open the local URL Vite prints. The first launch includes sample items, stored locally in IndexedDB. Use Settings to clear, export JSON/CSV, or import a Backlogly JSON export.

## PWA

Run a production build and serve it over HTTPS (localhost is allowed); browsers then offer an install option. The PWA caches its application shell for offline use.

## Reminders

Assignment reminders are calculated for exactly seven days before the due date and displayed in the item details. The web notification adapter requests browser permission when wired to a UI action; browsers cannot guarantee background delivery after an app is closed. `src/services/notifications.ts` is an abstraction designed to be replaced with Capacitor `LocalNotifications` for reliable native scheduling.

## Capacitor next steps

Install `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`, and/or `@capacitor/ios`; run `npx cap init`, build the Vite app, then `npx cap add android` / `ios` and `npx cap sync`. Replace the notification adapter with Capacitor Local Notifications and keep the existing repository interface if you later migrate IndexedDB to a synced backend.
