require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read the migration file
    const sql = fs.readFileSync('C:\\dev2\\uangku-v1\\drizzle\\migrations\\0002_update_budgets_manual.sql', 'utf8');
    
    // Split by semicolons and filter out empty statements
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    console.log(`Found ${statements.length} statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'; // Add back the semicolon
      console.log(`Executing statement ${i + 1}/${statements.length}:`, statement.substring(0, 50) + '...');
      
      try {
        await client.query(statement);
        console.log(`Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`Error executing statement ${i + 1}:`, err.message);
        // Don't break on error, continue with others
      }
    }
    
    console.log('Migration completed');
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
  }
}

runMigration();