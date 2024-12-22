import { sql } from "@vercel/postgres";
import { Contract, ContractRow, ContractRowInput } from "@/types";

function rowToContract(row: ContractRow): Contract {
  return {
    id: row.id,
    clientName: row.client_name,
    contractTitle: row.contract_title,
    startDate: row.start_date.toISOString(),
    endDate: row.end_date.toISOString(),
    status: row.status,
    value: Number(row.value),
    description: row.description || "",
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at?.toISOString(),
  };
}

function contractToRow(contract: Contract): ContractRowInput {
  return {
    id: contract.id,
    client_name: contract.clientName,
    contract_title: contract.contractTitle,
    start_date: contract.startDate,
    end_date: contract.endDate,
    status: contract.status,
    value: contract.value,
    description: contract.description || null,
    created_at: contract.createdAt,
    updated_at: contract.updatedAt || null,
  };
}

export async function initializeDatabase(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS contracts (
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

    await sql`
      CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(start_date, end_date)
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

export async function getContracts(): Promise<Contract[]> {
  const { rows } = await sql<ContractRow>`
    SELECT * FROM contracts 
    ORDER BY created_at DESC
  `;
  return rows.map(rowToContract);
}

export async function getContractById(id: string): Promise<Contract | null> {
  const { rows } = await sql<ContractRow>`
    SELECT * FROM contracts 
    WHERE id = ${id}
  `;
  return rows.length > 0 ? rowToContract(rows[0]) : null;
}

export async function createContract(contract: Contract): Promise<Contract> {
  const row = contractToRow(contract);
  const { rows } = await sql<ContractRow>`
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
      ${row.id},
      ${row.client_name},
      ${row.contract_title},
      ${row.start_date},
      ${row.end_date},
      ${row.status},
      ${row.value},
      ${row.description},
      ${row.created_at},
      ${row.updated_at}
    )
    RETURNING *
  `;
  return rowToContract(rows[0]);
}

export async function updateContract(
  id: string,
  contract: Partial<Contract>
): Promise<Contract | null> {
  try {
    const { rows } = await sql<ContractRow>`
      UPDATE contracts 
      SET 
        client_name = COALESCE(${contract.clientName}, client_name),
        contract_title = COALESCE(${contract.contractTitle}, contract_title),
        start_date = COALESCE(${contract.startDate}, start_date),
        end_date = COALESCE(${contract.endDate}, end_date),
        status = COALESCE(${contract.status}, status),
        value = COALESCE(${contract.value}, value),
        description = COALESCE(${contract.description}, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return null;
    }

    return rowToContract(rows[0]);
  } catch (error) {
    console.error("Error updating contract:", error);
    throw error;
  }
}

export async function deleteContract(id: string): Promise<Contract | null> {
  const { rows } = await sql<ContractRow>`
    DELETE FROM contracts 
    WHERE id = ${id}
    RETURNING *
  `;
  return rows.length > 0 ? rowToContract(rows[0]) : null;
}
