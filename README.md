# Velora Skin — Minimalist Luxury Botanical E-Commerce Platform

A production-grade, full-stack headless e-commerce system built with an N-tier modular architecture, strict OWASP Top 10 threat mitigation, atomic inventory concurrency, and a high-fashion editorial frontend.

---

## 1. Executive Summary & Architectural Overview

Velora Skin was engineered to solve common architectural pitfalls found in standard e-commerce builds: client-side price tampering, race conditions during flash sales, session hijacking via script injection, and slow Time-To-Interactive (TTI) caused by excessive database round-trips.


┌────────────────────────────────────────────────────────────────────────┐
│                      CLIENT TIER (React 18 + Vite)                     │
│  - Tailwind CSS Luxury Design System   - TanStack React Query v5 Cache │
│  - Zustand Persistent State Stores     - Framer Motion Micro-UX        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / Cookie Auth (REST JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     EDGE SECURITY & REVERSE PROXY                      │
│  - Hardened Alpine Nginx               - Gzip Compression Engine       │
│  - Static Asset Immobility Caching     - Header Hardening (CSP, HSTS)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reverse Proxy (Internal Bridge)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER (Node.js Express)                  │
│  ├── Security: Helmet, Rate-Limit, Mongo-Sanitize, HPP                 │
│  ├── Auth: Dual-Token JWT (httpOnly), SHA-256 Reset/Verification       │
│  ├── Catalog: APIFeatures Pipeline (Filtering, Search, Sorting, Page)  │
│  ├── Orders: Server-Authoritative Price Calculation & Concurrency Guard│
│  └── Async Queue: Non-blocking Pug + Nodemailer Transactional Engine   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose Connection Pool
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PERSISTENCE TIER (MongoDB 7.0 Atlas)                 │
│  - Compound & Text Indexes for Sub-10ms Query Execution                │
│  - Atomic Document Manipulation ($inc, $gte)                           │
└────────────────────────────────────────────────────────────────────────┘




## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TanStack Query](https://img.shields.io/badge/React_Query_v5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)

### Backend & Middleware
![Node.js](https://img.shields.io/badge/Node.js_LTS-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express_5-404D59?style=for-the-badge)
![Stripe](https://img.shields.io/badge/Stripe_SDK-008CDD?style=for-the-badge&logo=stripe&logoColor=white)

### Database & DevOps
![MongoDB](https://img.shields.io/badge/MongoDB_7.0-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Multi--stage-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx_Alpine-009639?style=for-the-badge&logo=nginx&logoColor=white)

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, TanStack React Query v5, Zustand, Framer Motion, Lucide Icons |
| **Backend** | Node.js (ESM), Express 5, Mongoose, Nodemailer, Pug Engine, Stripe SDK |
| **Database** | MongoDB 7.0 (Compound, Multi-key & Full-Text Search Indexes) |
| **DevOps & Edge** | Docker, Docker Compose (Multi-stage builds), Nginx (Alpine), Gzip Compression |




### Stripe Webhook Idempotency & Cryptographic Verification

Order state mutations never rely on client-side browser redirects, preventing race conditions, incomplete transactions, or spoofed payloads. Stock decrements, order finalization, and digital invoice transmissions occur only after strict cryptographic verification of the raw webhook signature (`stripe.webhooks.constructEvent`).



[Stripe Gateway] ──► POST /api/v1/orders/webhook ──► Verify Raw Signature
                                                          │
   ┌──────────────────────────────────────────────────────┴────────┐
   ▼                                                               ▼
[ Valid Signature ]                                       [ Invalid Signature ]
   │                                                               │
   ├──► Idempotency Guard: Check if Order already processed       └──► Reject immediately with 400 Bad Request
   ├──► Atomic Stock Allocation ($inc)
   ├──► Mutate State: order.isPaid = true
   └──► Non-blocking Worker: Dispatch Pug HTML invoice via SMTP

