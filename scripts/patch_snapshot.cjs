const fs = require("fs");

const snapshotPath = "./drizzle/meta/0005_snapshot.json";
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

const schemaMap = {
  identity: [
    "users",
    "auth_accounts",
    "guest_principals",
    "organization_memberships",
    "organizations",
    "password_credentials",
    "payment_methods",
    "permissions",
    "role_permissions",
    "roles",
    "user_permissions",
    "user_roles",
  ],
  catalog: [
    "brands",
    "categories",
    "products",
    "product_variants",
    "variant_attributes",
    "variant_images",
    "review_helpful_votes",
    "reviews",
    "variant_price_lists",
    "variant_sellable_uoms",
    "product_tags",
    "tags",
    "attribute_definitions",
    "product_attributes",
    "translations",
    "collection_tags",
    "collections",
  ],
  sales: ["order_items", "orders", "addresses", "discount_rules"],
  system: ["audit_log", "server_logs", "search_logs", "notifications"],
  inventory: ["inventory_balances", "stock_movements", "warehouses"],
  school_engine: [
    "school_list_item_alternatives",
    "school_list_items",
    "school_lists",
    "school_list_access_grants",
    "school_list_access_requests",
    "school_list_access_tokens",
    "school_list_code_attempts",
    "school_list_parent_sessions",
    "school_access",
    "school_list_sessions",
    "cart_kits",
  ],
};

// Also we see from previous drizzle output some tables. Add variations if needed.
const allTables = Object.keys(snapshot.tables);

for (const oldKey of allTables) {
  const tableObj = snapshot.tables[oldKey];
  const tableName = tableObj.name;

  // Find which schema it belongs to
  let newSchema = "";
  for (const [sch, tables] of Object.entries(schemaMap)) {
    if (tables.includes(tableName)) {
      newSchema = sch;
      break;
    }
  }

  if (newSchema) {
    if (tableObj.schema === "" || !tableObj.schema) {
      tableObj.schema = newSchema;
    }
    const newKey = `${newSchema}.${tableName}`;
    if (newKey !== oldKey) {
      snapshot.tables[newKey] = tableObj;
      delete snapshot.tables[oldKey];
    }
  }
}

// Ensure the schemas object exists in snapshot
if (!snapshot.schemas) {
  snapshot.schemas = {};
}
Object.keys(schemaMap).forEach((sch) => {
  snapshot.schemas[sch] = sch;
});

fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
console.log("Snapshot patched successfully!");
