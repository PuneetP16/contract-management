"use client"

import { ColumnDef } from "@tanstack/react-table"

import { Contract, type DataTableColumnMeta } from "@/types"
import { formatIndianCurrency, formattedDate } from '@/lib/utils'
import { DataTableColumnHeader } from './ColumnHeader'
import { contractStatuses } from '@/data/constants'
import { DataTableRowActions } from './RowAction'

export const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: "clientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }) => {
      return <div className="w-[80px] ml-1">{row.getValue("clientName")}</div>
    },
    enableSorting: true,
    enableHiding: false,
    meta: {
      filterVariant: "text",
    } as DataTableColumnMeta,
  },
  {
    accessorKey: "contractTitle",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contract" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("contractTitle")}
          </span>
        </div>
      )
    },
    meta: {
      filterVariant: "text",
    } as DataTableColumnMeta,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = contractStatuses.find(
        (status) => status.value === row.getValue("status")
      )
      if (!status) {
        return null
      }

      return (
        <div className="flex w-[100px] items-center">
          {status.icon && (
            <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{status.label}</span>
        </div>
      )
    },
    meta: {
      filterVariant: "select",
    } as DataTableColumnMeta,
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {formattedDate(row.getValue("startDate"))}
          </span>
        </div>
      )
    },
    meta: {
      filterVariant: "text",
    } as DataTableColumnMeta,
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {formattedDate(row.getValue("endDate"))}
          </span>
        </div>
      )
    },
    meta: {
      filterVariant: "text",
    } as DataTableColumnMeta,
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Value" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {formatIndianCurrency(row.getValue("value"))}
          </span>
        </div>
      )
    },
    meta: {
      filterVariant: "range",
    } as DataTableColumnMeta,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
