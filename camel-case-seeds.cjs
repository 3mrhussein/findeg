const fs = require('fs');
const path = require('path');

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); });
}

function processObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(v => processObject(v));
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key of Object.keys(obj)) {
      newObj[toCamelCase(key)] = processObject(obj[key]);
    }
    return newObj;
  }
  return obj;
}

const dataDir = path.join(__dirname, 'db', 'seeds', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.trim().length === 0) return;
  const json = JSON.parse(content);
  const newJson = processObject(json);
  fs.writeFileSync(filePath, JSON.stringify(newJson, null, 2), 'utf8');
  console.log(`Converted ${file} to camelCase`);
});
