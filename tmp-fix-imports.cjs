const fs = require('fs');
const path = require('path');

const SCHEMA_DIR = path.join(process.cwd(), 'db/schema');

const fileMapping = {
  'schemas': '..',
  'addresses': '..',
  'identity-access': '../identity',
  'users': '../identity',
  'brands': '../catalog',
  'categories': '../catalog',
  'products': '../catalog',
  'product-variants': '../catalog',
  'variant-pricing': '../catalog',
  'product-attributes': '../catalog',
  'tags': '../catalog',
  'collections': '../catalog',
  'orders': '../sales',
  'cart-kits': '../sales',
  'discount-rules': '../sales',
  'reviews': '../sales',
  'inventory': '../inventory',
  'school-lists': '../school-engine',
  'school-list-sessions': '../school-engine',
  'school-access': '../school-engine',
  'audit-log': '../system',
  'server-logs': '../system',
  'search-logs': '../system',
  'notifications': '../system'
};

function processDirectory(dir, subDirName) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (!file.endsWith('.ts') || file === 'index.ts') continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;
    
    // Replace imports like: import ... from "./xyz"; -> import ... from "../folder/xyz";
    content = content.replace(/from\s+['"]\.\/([^'"]+)['"]/g, (match, importedFile) => {
      const targetFolder = fileMapping[importedFile];
      
      // If no mapping, ignore
      if (!targetFolder) return match;
      
      // If we are in the same folder as the target, stay relative
      // e.g. targetFolder == '../catalog' and subDirName == 'catalog'
      if (targetFolder === `../${subDirName}`) {
        return `from "./${importedFile}"`;
      }
      
      changed = true;
      return `from "${targetFolder}/${importedFile}"`;
    });
    
    // Also handle core domain value objects being moved or broken
    // e.g. '@/features/core/domain/value-objects'
    // Since `db/tsconfig.json` has standard roots, we should check if `@/` works for `@findeg/db` or if we need to change it.
    // The previous code had `@/features/...`. Now in db package this should be relative to the workspace, but `@/` resolves via the root `tsconfig.json`'s paths OR Next.js alias.
    // The workspace `backend` probably exposed `@/features/...`. In a shared `db` package, this `import` might fail unless `@/*` is mapped.
    // We will let `type-check` tell us about `@/` alias later. Only fixing intra-schema first.

    if (changed) {
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${subDirName}/${file}`);
    }
  }
}

// Process subdirectories
const dirs = ['identity', 'catalog', 'sales', 'inventory', 'school-engine', 'system'];
for (const d of dirs) {
  processDirectory(path.join(SCHEMA_DIR, d), d);
}
console.log("Done");
