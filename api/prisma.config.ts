import path from 'path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load .env relative to current working directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ Could not resolve DIRECT_URL or DATABASE_URL from .env');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: dbUrl || '',
  },
});