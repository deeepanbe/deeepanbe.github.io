# DJ AI Android

Native Android client scaffold for the same multi-user backend.

## Architecture

- Kotlin + Jetpack Compose UI
- HTTPS API only
- Bearer access token stored with Android Keystore-backed encrypted storage in the production implementation
- Workspace/conversation/document/memory screens
- No OpenAI, Stripe, database, or backend secrets in the APK

## Backend

Set `DJ_AI_API_BASE_URL` at build time. The mobile client talks to the same `/auth`, `/workspaces`, `/conversations`, `/documents`, `/memory`, `/agent`, and `/billing` APIs used by the web app.

This repository contains the API contract and starter activity; production release signing, Play Console configuration, crash analytics, and device testing still require the owner's Android/Google accounts.