/**
 * Quick test script to verify JSON storage backend works
 * Run with: node scripts/test-json-storage.js
 */

const fs = require('fs');
const path = require('path');

// Read the config
const configPath = path.join(__dirname, '..', 'config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ config.json not found');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
console.log('✅ Config loaded:', config.storage.type);

// Check if data file exists
const dataFilePath = path.join(__dirname, '..', config.storage.options.filePath);
if (!fs.existsSync(dataFilePath)) {
  console.error(`❌ Data file not found: ${dataFilePath}`);
  process.exit(1);
}

// Get file stats
const stats = fs.statSync(dataFilePath);
console.log(`✅ Data file found: ${(stats.size / 1024).toFixed(2)} KB`);

// Count lines
const content = fs.readFileSync(dataFilePath, 'utf-8');
const lines = content.split('\n').filter(line => line.trim().length > 0);
console.log(`✅ Total documents: ${lines.length}`);

// Parse first few lines to verify format
try {
  const sampleSize = Math.min(3, lines.length);
  for (let i = 0; i < sampleSize; i++) {
    const parsed = JSON.parse(lines[i]);
    if (!parsed.Item) {
      throw new Error('Invalid format: missing Item wrapper');
    }
    console.log(`✅ Line ${i + 1} parsed successfully`);
  }
} catch (error) {
  console.error('❌ Error parsing data file:', error.message);
  process.exit(1);
}

// Check backup directory
const backupPath = path.join(__dirname, '..', config.storage.options.backupPath);
if (!fs.existsSync(backupPath)) {
  console.log(`⚠️  Backup directory will be created: ${backupPath}`);
} else {
  console.log(`✅ Backup directory exists: ${backupPath}`);
}

console.log('\n✅ JSON storage backend is ready to use!');
console.log('\nTo start the application with JSON storage:');
console.log('  npm run dev');
