# Security Architecture & Risk Mitigations

## 1. Threat Modeling & Defenses

| Threat / Vulnerability | Risk | Architecture Defense |
| :--- | :--- | :--- |
| **Client-Side Price Tampering** | High | The server recalculates totals using authoritative DB rates. Client prices in request payloads are ignored. |
| **Receipt Exposure / Upload Abuse** | High | JPEG/PNG/WebP allowlist, 5MB decoded size limit, cryptographically random names, storage outside the public web root, staff-authorized retrieval with `no-store` and `nosniff` headers. |
| **Insecure Direct Object Reference (IDOR)** | High | Orders have private random UUID tracking tokens (`trackingToken`) alongside public short IDs (`#PH-1024`). Users can only view tracking data matching their session/token. |
| **Privilege Escalation** | Critical | Role-based middleware and Server Action authorization guards checking session role before performing cashier/kitchen/manager operations. |
| **Duplicate Order Submissions** | Medium | Client-side button debouncing + Server Action idempotency key generated per checkout session. |
| **SQL Injection** | Low | Fully mitigated via Prisma ORM parameterized queries. |
| **Cross-Site Scripting (XSS)** | Medium | React virtual DOM auto-escaping + strict Content-Security-Policy (CSP) headers. |
| **Financial Fraud (Fake Bank Slips)** | High | Transfer orders remain in `PAYMENT_PENDING` until a human cashier inspects the receipt against merchant bank SMS notifications and manually approves. |

---

## 2. Receipt Upload Guardrails

```typescript
export const UPLOAD_CONSTRAINTS = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};
```
1. Filenames use cryptographic random UUIDs. Original client filenames are not used to construct filesystem paths.
2. Receipt files live under persistent `storage/receipts/`, outside the public web root, and are streamed only to authenticated admin/cashier sessions.
3. Production must configure a unique session secret of at least 32 bytes and private staff PINs. Development fallback credentials are disabled in production.

The built-in PIN-attempt lockout is process-local. Production deployments with multiple instances require a shared rate limiter; this application currently supports only a single persistent Node.js instance.
