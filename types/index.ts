import { z } from "zod";
import { Table, Row, Column, ColumnDef } from "@tanstack/react-table";
import { HTMLAttributes } from "react";

const isValidDate = (val: string) => !isNaN(Date.parse(val));
const isAfterYear2000 = (val: string) => {
  const date = new Date(val);
  return date >= new Date('2000-01-01');
};

export const contractSchema = z.object({
  id: z.string(),
  clientName: z.string()
    .min(1, { message: "Client name is required" })
    .max(100, { message: "Client name cannot exceed 100 characters" })
    .refine((val) => /^[a-zA-Z0-9\s\-_,.&']+$/.test(val), {
      message: "Client name can only contain letters, numbers, spaces, hyphens, and basic punctuation",
    }),
  contractTitle: z.string()
    .min(1, { message: "Contract title is required" })
    .max(200, { message: "Contract title cannot exceed 200 characters" }),
  startDate: z.string()
    .refine(isValidDate, { message: "Invalid date format" })
    .refine(isAfterYear2000, { message: "Start date cannot be before year 2000" }),
  endDate: z.string()
    .refine(isValidDate, { message: "Invalid date format" })
    .refine(isAfterYear2000, { message: "End date cannot be before year 2000" }),
  status: z
    .enum(["Draft", "Pending", "Active", "Expired", "Terminated"])
    .default("Active"),
  value: z.number()
    .positive({ message: "Contract value must be positive" })
    .max(1000000000, { message: "Contract value cannot exceed 1 billion" })
    .refine((val) => Number.isFinite(val), {
      message: "Contract value must be a finite number",
    }),
  createdAt: z
    .string()
    .refine(isValidDate, { message: "Invalid date format" })
    .default(() => new Date().toISOString()),
  updatedAt: z
    .string()
    .refine(isValidDate, { message: "Invalid date format" })
    .optional(),
  description: z.string()
    .max(1000, { message: "Description cannot exceed 1000 characters" })
    .optional()
    .transform(val => val?.trim()),
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: "End date must be after or equal to start date",
  path: ["endDate"]
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const now = new Date();
  return data.status !== "Active" || startDate <= now;
}, {
  message: "Active contracts cannot have a future start date",
  path: ["status"]
}).refine((data) => {
  const endDate = new Date(data.endDate);
  const now = new Date();
  return data.status !== "Expired" || endDate < now;
}, {
  message: "Expired status can only be set for contracts past their end date",
  path: ["status"]
});

export type Contract = z.infer<typeof contractSchema>;
export type ContractStatus =
  | "Draft"
  | "Pending"
  | "Active"
  | "Expired"
  | "Terminated";

export interface FormState {
  message?: string | null;
  errors?: {
    clientName?: string[];
    contractTitle?: string[];
    startDate?: string[];
    endDate?: string[];
    status?: string[];
    value?: string[];
    form?: string[];
  };
  values?: Contract;
  data?: Contract;
}

export interface ContractFormProps {
  mode: "create" | "edit";
  initialData?: Contract;
  onSuccess?: () => void;
  onLocalUpdate?: (update: ContractFormUpdate) => void;
}

export interface ContractFormUpdate {
  type: "contract.created" | "contract.updated";
  data: Contract;
}

// Contract Update Types for PusherReal-time Updates
export type ContractUpdateType =
  | "contract.created"
  | "contract.updated"
  | "contract.deleted";

export interface ContractUpdate {
  type: ContractUpdateType;
  data: Contract;
}

// Database Types
export interface ContractRow {
  id: string;
  client_name: string;
  contract_title: string;
  start_date: Date;
  end_date: Date;
  status: Contract["status"];
  value: string;
  description: string | null;
  created_at: Date;
  updated_at: Date | null;
}

export interface ContractRowInput {
  id: string;
  client_name: string;
  contract_title: string;
  start_date: string;
  end_date: string;
  status: Contract["status"];
  value: number;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

// Table Types
export interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

export interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onLocalUpdate?: (update: ContractUpdate) => void;
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export interface DataTableFilterProps<TData> {
  column: Column<TData, unknown>;
}

export interface DataTableColumnMeta {
  filterVariant: "text" | "select" | "range";
}

export interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export interface DataTableColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  highlightedRows: { [key: string]: string };
}

// Content Types
export interface ContentState {
  contracts: Contract[];
  loading: boolean;
  highlightedRows: { [key: string]: string };
  highlightTimeouts: { [key: string]: NodeJS.Timeout };
}

// Theme Types
export type Theme = "light" | "dark" | "system";

// Options Types
export interface Option {
  value: string;
  label: string;
}

export interface OptionGroup {
  label: string;
  options: Option[];
}

// Hook Types
export interface TableUrlParams<TData> {
  table: Table<TData>;
  excludeColumns?: string[];
}
