# Media Feature

The `media` feature handles asset management, specifically focused on product images and branding logos.

## Responsibilities

- **File Uploads**: Buffering and storing files in a persistent storage system.
- **Asset Association**: Linking uploaded URLs to products, categories, or brands.
- **Cleanup**: Removing physical assets from storage when entities are deleted.

## Component Overview

### Application Layer (`/application`)

- **Ports**: `IStorageProvider` defining the abstraction for file systems or cloud storage (e.g., S3).
- **Services**: `MediaService` coordinating uploads and file naming conventions.

### Infrastructure Layer (`/infrastructure`)

- **Adapters**: Concrete implementations of storage providers (e.g., `LocalStorageProvider`).

## Architectural Boundaries

- **Depends On**: `core` (for storage abstractions).
- **Used By**: `catalog` (product images), `identity` (user avatars), `administration` (logo uploads).
