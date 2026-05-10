/**
 * WebMCP Tool Definitions for FindEg Platform
 * Chrome 146 navigator.modelContext.registerTool() implementation
 */

export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

const callToolApi = async (tool: string, params: Record<string, unknown>) => {
  const response = await fetch('/api/v1/webmcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool, params }),
  });
  return response.json();
};

export const TOOLS: WebMCPTool[] = [
  // --- Navigation ---
  {
    name: 'findeg_navigate_to_page',
    description: 'Navigate to a specific page within the FindEg admin or storefront.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'The path to navigate to (e.g., /admin/products).' },
      },
      required: ['path'],
    },
    execute: async (params) => {
      const { path } = params as { path: string };
      window.location.href = path;
      return { success: true };
    },
  },

  // --- Brands ---
  {
    name: 'findeg_create_brand',
    description: 'Create a new brand in the catalog with localized names.',
    inputSchema: {
      type: 'object',
      properties: {
        nameEn: { type: 'string' },
        nameAr: { type: 'string' },
        slug: { type: 'string' },
        logoUrl: { type: 'string' },
        descriptionEn: { type: 'string' },
        descriptionAr: { type: 'string' },
        isActive: { type: 'boolean' },
      },
      required: ['nameEn', 'nameAr', 'slug'],
    },
    execute: (params) => callToolApi('findeg_create_brand', params),
  },
  {
    name: 'findeg_update_brand',
    description: "Update an existing brand's details.",
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        input: {
          type: 'object',
          properties: {
            nameEn: { type: 'string' },
            nameAr: { type: 'string' },
            slug: { type: 'string' },
            logoUrl: { type: 'string' },
            descriptionEn: { type: 'string' },
            descriptionAr: { type: 'string' },
            isActive: { type: 'boolean' },
          },
        },
      },
      required: ['id', 'input'],
    },
    execute: (params) => callToolApi('findeg_update_brand', params),
  },
  {
    name: 'findeg_delete_brand',
    description: 'Permanently delete a brand.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },
    execute: (params) => callToolApi('findeg_delete_brand', params),
  },
  {
    name: 'findeg_toggle_brand_status',
    description: 'Toggle the active status of a brand.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },
    execute: (params) => callToolApi('findeg_toggle_brand_status', params),
  },

  // --- Categories ---
  {
    name: 'findeg_create_category',
    description: 'Create a new product category with bilingual translations.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        parentId: { type: 'number' },
        isActive: { type: 'boolean' },
        nameEn: { type: 'string' },
        nameAr: { type: 'string' },
        descriptionEn: { type: 'string' },
        descriptionAr: { type: 'string' },
      },
      required: ['slug', 'nameEn', 'nameAr'],
    },
    execute: (params) => callToolApi('findeg_create_category', params),
  },
  {
    name: 'findeg_delete_category',
    description: 'Delete a category and its subcategories.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },
    execute: (params) => callToolApi('findeg_delete_category', params),
  },

  // --- Products ---
  {
    name: 'findeg_set_product_status',
    description: 'Enable or disable a product.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        isActive: { type: 'boolean' },
      },
      required: ['id', 'isActive'],
    },
    execute: (params) => callToolApi('findeg_set_product_status', params),
  },
  {
    name: 'findeg_delete_product',
    description: 'Permanently delete a product.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
      },
      required: ['id'],
    },
    execute: (params) => callToolApi('findeg_delete_product', params),
  },

  // --- Inventory ---
  {
    name: 'findeg_update_stock',
    description: 'Update the stock count for a product variant.',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'number' },
        variantId: { type: 'number' },
        quantity: { type: 'number' },
      },
      required: ['productId', 'quantity'],
    },
    execute: (params) => callToolApi('findeg_update_stock', params),
  },

  // --- Orders ---
  {
    name: 'findeg_update_order_status',
    description: 'Update order fulfillment status.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        update: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            },
            trackingNumber: { type: 'string' },
            notes: { type: 'string' },
          },
          required: ['status'],
        },
      },
      required: ['id', 'update'],
    },
    execute: (params) => callToolApi('findeg_update_order_status', params),
  },
];

/**
 * Registers all FindEg tools with the browser's Model Context.
 */
let toolsRegistered = false;

export function registerAllTools() {
  const nav = navigator as unknown as {
    modelContext?: { registerTool?: (tool: Record<string, unknown>) => void };
  };
  const ctx = nav.modelContext;
  if (!ctx || !ctx.registerTool) {
    console.warn('WebMCP is not supported in this browser.');
    return false;
  }

  if (toolsRegistered) {
    console.log('[WebMCP]: Tools already registered, skipping.');
    return true;
  }

  try {
    TOOLS.forEach((tool) => {
      ctx.registerTool!({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: tool.execute,
      });
    });
    toolsRegistered = true;
    console.log(`[WebMCP]: Successfully registered ${TOOLS.length} tools.`);
    return true;
  } catch (error) {
    console.error('[WebMCP Registration Error]:', error);
    return false;
  }
}
