# Hybrid Taxonomy Guide

This document explains the Hybrid Taxonomy system used for product classification, discovery, and filtering.

## Overview

We use a three-tier system:

1.  **Category Tree**: Strict hierarchy (e.g., Household > Kitchen > Cups) for main navigation.
2.  **Tag System**: Flexible, cross-cutting segments (e.g., "School Prep", "Minimalist style").
3.  **Structured Attributes**: Precise product data (e.g., "Color: Blue", "Paper Weight: 100 GSM") for filtering and smart matching.

---

### Querying by Tags

You can filter products by a list of `tagIds` or by entire `tagGroups`.
Multiple tags within the same group acts as an **OR** (unless specified), while tags across groups acts as an **AND**.

---

## Collections

Collections are manually curated marketing-driven groups of products. Unlike categories, they don't follow a strict hierarchy and are often used for landing pages, seasonal promotions, or "Shop by Room" experiences.

### Features

- **Flexible Grouping**: Products are associated with collections via **Tags**.
- **Dynamic Content**: Collections can automatically pull products that match certain tags.
- **Visual Control**: Custom hero images and sorting orders for storefront presentation.
- **Slug-based Links**: Routable via `/collections/[slug]`.

---

## Attribute System

Attributes provide specific data points that power storefront filters and the Smart List Engine for school-matching.

### Schema

- `attribute_definitions`: Defines the name and data type (`string`, `number`, `boolean`).
- `product_attributes`: Associates a value with a product.

### Key Attributes

- `color`: Hex code or localized name.
- `material`: Metal, Plastic, Wood, etc.
- `paper-weight`: GSM for notebooks/paper.
- `brand-collection`: Specific seasonal collection from a brand.

---

## Smart List Matching

The "Smart List Engine" uses **Attributes** and **Tags** to match a generic school list item (e.g., "Blue 80-page Notebook") to a specific range of products in our catalog.

1.  **Identify Intent**: Use `Category` (Notebooks).
2.  **Filter by Attributes**: Filter by `paper-weight` or `color` if specified in the list.
3.  **Refine by Tags**: Use `usecase=school-prep` to prioritize relevant results.
