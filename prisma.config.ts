import 'dotenv/config'; // must be first import — env() below does not load .env itself
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: { url: env('DIRECT_URL') },
});
