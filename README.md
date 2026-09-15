# Velora Skin — Minimalist Luxury Botanical E-Commerce Platform

A production-grade, full-stack headless e-commerce system built with an N-tier modular architecture, strict OWASP Top 10 threat mitigation, atomic inventory concurrency, and a high-fashion editorial frontend.

---

## 1. Executive Summary & Architectural Overview

Velora Skin was engineered to solve common architectural pitfalls found in standard e-commerce builds: client-side price tampering, race conditions during flash sales, session hijacking via script injection, and slow Time-To-Interactive (TTI) caused by excessive database round-trips.

```text
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



