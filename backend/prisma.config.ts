import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.local first (Windows), then .env (Docker)
const envLocalPath = resolve(__dirname, '.env.local');
const envPath = resolve(__dirname, '.env');

if (existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else {
  dotenv.config({ path: envPath });
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@postgres:5432/realestate?schema=public',
  },
});
