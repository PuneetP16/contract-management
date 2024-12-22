import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { faker } from "@faker-js/faker";

import { ContractStatus } from "@/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export interface Contract {
  id: string;
  clientName: string;
  contractTitle: string;
  startDate: Date;
  endDate: Date;
  status: ContractStatus;
  value: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contracts = Array.from({ length: 100 }, () => {
  const startDate = faker.date.between({
    from: "2023-01-01",
    to: "2023-12-31",
  });
  const endDate = faker.date.between({ from: startDate, to: "2024-12-31" });
  return {
    id: faker.string.uuid(),
    clientName: faker.company.name(),
    contractTitle: faker.commerce.productName(),
    startDate,
    endDate,
    status: faker.helpers.arrayElement([
      "Draft",
      "Pending",
      "Active",
      "Expired",
      "Terminated",
    ]),
    value: faker.number.int({ min: 1000, max: 100000 }),
    createdAt: startDate,
    updatedAt: endDate,
  };
});

fs.writeFileSync(
  path.join(__dirname, "contracts.json"),
  JSON.stringify(contracts, null, 2)
);

console.log("✅ Contracts data generated.");
