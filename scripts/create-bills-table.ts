// scripts/create-bills-table.ts
import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function createBillsTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    console.log('Creating bills table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id varchar NOT NULL,
        name varchar(100) NOT NULL,
        description text,
        amount numeric(14, 2) NOT NULL,
        currency varchar(3) DEFAULT 'IDR' NOT NULL,
        due_date date NOT NULL,
        next_due_date date NOT NULL,
        recurrence_pattern varchar(20),
        recurrence_interval numeric(3, 0),
        auto_notify boolean DEFAULT true NOT NULL,
        notify_days_before numeric(2, 0) DEFAULT '3' NOT NULL,
        wallet_id uuid,
        category_id uuid,
        is_paid boolean DEFAULT false NOT NULL,
        paid_date date,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
    
    console.log('Bills table created successfully!');
    
    // Add foreign key constraints
    try {
      await client.query(`
        ALTER TABLE bills 
        ADD CONSTRAINT bills_wallet_id_wallets_id_fk 
        FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL
      `);
      console.log('Wallet foreign key constraint added successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('Wallet foreign key constraint already exists or failed:', errorMessage);
    }
    
    try {
      await client.query(`
        ALTER TABLE bills 
        ADD CONSTRAINT bills_category_id_categories_id_fk 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      `);
      console.log('Category foreign key constraint added successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('Category foreign key constraint already exists or failed:', errorMessage);
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error creating bills table:', errorMessage);
  } finally {
    await client.end();
    process.exit(0);
  }
}

createBillsTable();