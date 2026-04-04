# Admin Product Management Guide

FindEg.com uses a robust product management system designed for stationery and school supplies, supporting complex variants, multiple units of measure (UoM), and tiered pricing for different customer groups.

## Core Concepts

### 1. Simple vs. Variable Products

- **Simple Product**: A product with no options (e.g., a specific black pen). It automatically has one default variant.
- **Variable Product**: A product with multiple options (e.g., a notebook available in multiple colors and sizes).

### 2. Pricing Modes

- **Shared Pricing**: All variants share the same base price, strike price, and cost price.
- **Per-Variant Pricing**: Each variant can have its own independent pricing. useful for different sizes or materials.

### 3. Units of Measure (UoM)

Products can be sold in different units (e.g., Each, Pack, Box, Carton).

- **Base Unit**: Usually "Each" or "Piece".
- **Factor**: The quantity of the base unit contained in this UoM (e.g., Box of 12 has a factor of 12).
- **Customer Groups**: Pricing can be set differently for "Public (B2C)" and "School (B2B)".

## Creating a Product

1. **Basic Info**: Enter localized names and descriptions for both English (LTR) and Arabic (RTL).
2. **Category & Brand**: Assign the product to a category and brand for better discovery.
3. **Variants**:
   - If the product has options, use the **Attribute Dimensions** tool.
   - Enter dimensions like "Color" (Blue, Red) and "Size" (0.5mm, 0.7mm).
   - Click **Generate Matrix** to build the combination list.
4. **Identity**: Enter the SKU and Barcode. SKU is uppercase only. Barcodes help with warehouse operations.
5. **Pricing**: Choose a pricing mode and set the EGP amounts.
6. **UoM Configuration**: Add the units you want to sell. For each unit, you can define specific price lists for customer groups.

## Best Practices

- **SKUs**: Use a consistent naming convention (e.g., `BRAND-CAT-MODEL-COLOR`).
- **Images**: High-quality images for each variant improve conversion.
- **Translations**: Always provide Arabic names as many customers prefer searching in Arabic.
- **Barcodes**: Use the global EAN/UPC barcode if available to avoid duplicates.
