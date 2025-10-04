require('dotenv').config({ path: '.env.local' });

module.exports = {
  schema: './src/lib/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
};