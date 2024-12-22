import { sql } from '@vercel/postgres';
import { promises as fs } from 'fs';
import path from 'path';
import { Contract } from '@/types';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function initializeDatabase() {
  try {
    // Drop existing table
    await sql`DROP TABLE IF EXISTS contracts`;
    console.log('Dropped existing table');

    // Create table
    await sql`
      CREATE TABLE contracts (
        id VARCHAR(255) PRIMARY KEY,
        client_name VARCHAR(100) NOT NULL,
        contract_title VARCHAR(200) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status VARCHAR(20) CHECK (status IN ('Draft', 'Pending', 'Active', 'Expired', 'Terminated')),
        value DECIMAL CHECK (value > 0 AND value <= 1000000000),
        description TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP
      )
    `;
    console.log('Created contracts table');

    // Create status index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)
    `;
    console.log('Created status index');

    // Create dates index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(start_date, end_date)
    `;
    console.log('Created dates index');

    console.log('✓ Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    // Verify database connection
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set');
    }

    // Initialize database first
    await initializeDatabase();

    // Read contracts from JSON file
    const dataFilePath = path.join(process.cwd(), 'data', 'contracts.json');
    const contractsData = await fs.readFile(dataFilePath, 'utf-8');
    const contracts: Contract[] = JSON.parse(contractsData);

    console.log('Seeding contracts...');

    // Insert contracts
    for (const contract of contracts) {
      try {
        await sql`
          INSERT INTO contracts (
            id,
            client_name,
            contract_title,
            start_date,
            end_date,
            status,
            value,
            description,
            created_at,
            updated_at
          ) VALUES (
            ${contract.id},
            ${contract.clientName},
            ${contract.contractTitle},
            ${contract.startDate},
            ${contract.endDate},
            ${contract.status},
            ${contract.value},
            ${contract.description || null},
            ${contract.createdAt},
            ${contract.updatedAt || null}
          )
        `;
        console.log(`✓ Inserted contract: ${contract.contractTitle}`);
      } catch (error) {
        console.error(`Failed to insert contract ${contract.contractTitle}:`, error);
        throw error;
      }
    }

    console.log(`✓ Seeded ${contracts.length} contracts successfully`);
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  });
