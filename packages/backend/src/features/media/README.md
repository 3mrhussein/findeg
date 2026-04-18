# Media Feature

The **Media Feature** strictly isolates file physical storage physics from the rest of the generic FindEg marketplace domain logic.

## 🎯 Core Responsibilities

- **Storage Polymorphism**: Providing transparent interfaces (e.g. `IMediaStorageProvider`) to swap seamlessly between Local disk storage (Development) and CDN Edge networks (Production).
- **MIME & Integrity Check**: Strictly enforcing boundary checks ensuring massive payloads or malicious executed files never breach the catalog systems.

---

## 🏗️ Domain Entities Map

| Entity                  | System Role                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| `MediaAsset.ts`         | A pointer containing the canonical UUID, the CDN string path, and multi-language semantic Alt tags. |
| `ResponsiveMediaSet.ts` | Virtual maps pointing to pre-computed edge transformations (Mobile, Tablet, Desktop Retina).        |

---

## 🔐 Configuration Boundaries

- **Never Base64**: The backend Database (Postgres via Drizzle) MUST NEVER store raw binary media. It only stores the `String key` metadata.
- **Provider Injection**: The presentation layer never touches S3 logic directly; the backend exposes a pre-signed URL generation service via `ServiceResult` mapping.

---

&copy; 2026 FindEg.com
