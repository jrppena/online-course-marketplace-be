import { DATABASE_URL } from '@config/env';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@/generated/prisma/client';

const adapter = new PrismaNeon({ connectionString: DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
