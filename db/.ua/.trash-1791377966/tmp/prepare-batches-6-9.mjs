import fs from 'node:fs';

const root = '/Users/amr/projects/findeg/db';
const ua = `${root}/.ua`;
const data = JSON.parse(fs.readFileSync(`${ua}/intermediate/batches.json`, 'utf8'));

for (const batch of data.batches.filter(({ batchIndex }) => batchIndex >= 6 && batchIndex <= 9)) {
  const input = {
    projectRoot: root,
    batchFiles: batch.files,
    batchImportData: batch.batchImportData,
  };
  fs.writeFileSync(`${ua}/tmp/ua-file-analyzer-input-${batch.batchIndex}.json`, `${JSON.stringify(input, null, 2)}\n`);
}
