import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Same file the running API uses (NestJS ConfigModule + Prisma Client both
// read backend/.env). Docker overrides DATABASE_URL through `environment:`.
dotenv.config({ path: resolve(__dirname, '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  engine: 'classic',
  datasource: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/buildup?schema=public',
  },
});
