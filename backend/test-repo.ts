import { DrizzleProductRepository } from './src/features/catalog/infrastructure/persistence/DrizzleProductRepository';
const repo = new DrizzleProductRepository();
repo.getBySlug('keychains-13', 'en').then(res => {
  console.log("RESULT:", res);
  process.exit(0);
}).catch(err => {
  console.error("ERROR:", err);
  process.exit(1);
});
