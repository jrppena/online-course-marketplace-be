import 'dotenv/config'; // must be first import — env() below does not load .env itself
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma', // folder path — merges schema.prisma + models/*.prisma
  datasource: { url: env('DIRECT_URL') },
});
