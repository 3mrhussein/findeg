import { db } from './connection';
import { products } from './schema';
db.select({id: products.id, slug: products.slug}).from(products).limit(5).then(console.log).catch(console.error).finally(() => process.exit(0));
