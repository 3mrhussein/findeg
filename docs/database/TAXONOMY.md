# Hybrid Taxonomy Guide

This document explains the Hybrid Taxonomy system used for product classification, discovery, and filtering.

## Overview

We use a three-tier system:

1.  **Category Tree**: Strict hierarchy (e.g., Household > Kitchen > Cups) for main navigation.
2.  **Tag System**: Flexible, cross-cutting segments (e.g., "School Prep", "Minimalist style").
3.  **Structured Attributes**: Precise product data (e.g., "Color: Blue", "Paper Weight: 100 GSM") for filtering and smart matching.

---

## Tag System

Tags are grouped to provide semantical meaning.

### Common Tag Groups

- `usecase`: Why is the product used? (e.g., bullet-journaling, study-from-home)
- `style`: Aesthetic classification (e.g., minimalist, vibrant, professional)
- `seasonality`: Time-based relevancy (e.g., back-to-school, ramadan)
- `audience`: Who is it for? (e.g., students, artists, professionals)

### Querying by Tags

You can filter products by a list of `tagIds` or by entire `tagGroups`.
Multiple tags within the same group acts as an **OR** (unless specified), while tags across groups acts as an **AND**.

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
