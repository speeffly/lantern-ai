import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load ../.env relative to compiled or source output, else fallback to cwd
const candidatePaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(process.cwd(), '.env')
];

for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    console.log(`✅ Loaded environment variables from ${p}`);
    break;
  }
}
