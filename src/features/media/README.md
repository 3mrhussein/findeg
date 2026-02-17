# Media Feature

Owns file upload/storage workflows and URL generation for assets used across features.

## Use Cases

```mermaid
flowchart LR
    Admin --> UC1[Upload product/brand assets]
    Service --> UC2[Resolve public URL]
    Admin --> UC3[Delete obsolete assets]
```

## UML (Class View)

```mermaid
classDiagram
    class MediaService
    class IStorageProvider
    class LocalStorageProvider

    MediaService --> IStorageProvider
    LocalStorageProvider ..|> IStorageProvider
```

## Sequence (Upload)

```mermaid
sequenceDiagram
    participant API as /api/v1/upload
    participant Media as MediaService
    participant Storage as IStorageProvider
    API->>Media: upload(file)
    Media->>Storage: save(path, bytes)
    Storage-->>Media: public URL
    Media-->>API: upload result
```

## Layer Notes
- `application`: `MediaService` orchestration.
- `infrastructure`: storage provider adapters.

## Clean Architecture Boundaries
- Depends on `core` storage ports only.
- Catalog/admin features consume media URLs; they should not manage storage internals directly.

