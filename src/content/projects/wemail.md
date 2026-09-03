---
title: WeMail
description: An open-source disposable email workspace built on Cloudflare.
startYear: 2026
status: ongoing
category: software
locations: []
roles:
  - developer
  - designer
media:
  - software-development
cover: /home/projects/wemail/cover.jpg
order: 1
updated: '2026-08-30'
draft: false
relatedPosts: []
relatedAlbum: []
---

## Context

WeMail is an open-source disposable email workspace built on Cloudflare. It brings temporary mailbox creation, inbound reading, controlled outbound sending, API keys, announcements, Webhooks, Telegram notifications, and administration into one product surface. The source and deployment documentation are available in the [WeMail GitHub repository](https://github.com/WeOpen/WeMail).

## Problem and constraints

Many temporary email tools optimize for a single short-lived inbox. WeMail needed to support a longer-lived, multi-user workspace without introducing a traditional application server. Incoming Email Routing events, session boundaries, mailbox ownership, quotas, retention, attachments, remote-image safety, outbound policy, and administrator controls all had to remain understandable from the same interface.

The system also needed to stay portable for self-hosting. Infrastructure-specific identifiers and secrets could not live in the repository, while local development, staged deployment, database migrations, and production verification still needed repeatable paths.

## Role

I designed and developed WeMail across the React interface, Worker APIs, shared data contracts, D1 schema, integration tests, and Cloudflare deployment workflow. The work moves between product information architecture and implementation: deciding where a capability belongs, then carrying that decision through types, APIs, states, tests, and release checks.

## Key decisions and process

The codebase uses a pnpm monorepo to keep the React application, Hono Worker, and shared TypeScript contracts close without collapsing their boundaries. Cloudflare Email Routing feeds the Worker; D1 stores durable records, KV supports cache and coordination, and optional R2 storage leaves room for larger message assets.

The interface separates current mail work from long-lived configuration. Inbox and outbound views focus on reading, composing, filtering, and delivery records. Sender identities, signatures, retry rules, DNS readiness, and templates live in settings, where they can be maintained without crowding the everyday workflow.

Reliability is treated as a product feature rather than a deployment afterthought. Scoped API keys, explicit loading and failure states, guarded remote images, audit trails, migration checks, and staged Cloudflare releases make the operational model visible to both users and maintainers.

## Outcome

WeMail is an ongoing open-source product with a working path from local setup to Cloudflare deployment. The current workspace supports receiving and organizing mail, outbound delivery controls, developer integrations, notifications, user administration, and the operational checks needed to run those capabilities together.

[View WeMail on GitHub](https://github.com/WeOpen/WeMail)

![A cream envelope with an orange wax seal connected to modular mail-routing elements on a dark surface](/home/projects/wemail/cover.jpg)

![Minimal zine poster for WeMail with a compact mail-routing collage, large paper space, and one structural color accent](/home/projects/wemail/wemail-minimal-zine-poster.png)
