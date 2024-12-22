"use client"

import * as React from "react"
import { Column, HeaderContext } from "@tanstack/react-table"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { contractStatuses } from "@/data/constants"
import { DataTableFilterProps } from "@/types"

function getColumnTitle<TData>(column: Column<TData, unknown>): string {
  const header = column.columnDef.header
  if (typeof header === "function") {
    const rendered = header({ column } as HeaderContext<TData, unknown>)
    return rendered?.props?.title || column.id
  }
  return (header as string) || column.id
}

export function DataTableFilter<TData>({
  column,
}: DataTableFilterProps<TData>) {
  const { filterVariant } = (column.columnDef.meta ?? {}) as { filterVariant: "text" | "select" | "range" | "date" }

  if (!filterVariant || column.id === "actions") {
    return null
  }

  const columnFilterValue = column.getFilterValue()
  const facetedValues = column.getFacetedUniqueValues()
  const facetedMinMax = column.getFacetedMinMaxValues()

  if (filterVariant === "date") {
    return (
      <div className="grid gap-2">
        <Input
          type="text"
          value={(columnFilterValue ?? "") as string}
          onChange={(event) =>
            column.setFilterValue(event.target.value)
          }
          placeholder={`Filter ${getColumnTitle(column)}...`}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
    )
  }

  if (filterVariant === "range") {
    const minValue = facetedMinMax?.[0] ? Number(facetedMinMax[0]) : undefined
    const maxValue = facetedMinMax?.[1] ? Number(facetedMinMax[1]) : undefined

    return (
      <div className="grid gap-2">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            min={minValue}
            max={maxValue}
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(event) =>
              column.setFilterValue((old: [number, number]) => [
                event.target.value,
                old?.[1],
              ])
            }
            placeholder={`Min`}
            className="h-8 w-[70px]"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            min={minValue}
            max={maxValue}
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(event) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                event.target.value,
              ])
            }
            placeholder={`Max`}
            className="h-8 w-[80px]"
          />
        </div>
      </div>
    )
  }

  if (filterVariant === "select") {
    return (
      <Select
        value={columnFilterValue?.toString() ?? "all"}
        onValueChange={(value) => column.setFilterValue(value === "all" ? "" : value)}
      >
        <SelectTrigger className="h-8 w-[150px] border-dashed">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {contractStatuses.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              <div className="flex items-center space-x-2">
                <status.icon className="h-4 w-4 text-muted-foreground" />
                <span>{status.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const columnTitle = getColumnTitle(column)

  return (
    <div className="flex items-center">
      <Input
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        placeholder={`Filter ${columnTitle}... (${facetedValues.size})`}
        className={cn(
          "h-8 w-[150px] lg:w-[250px]"
        )}
      />
    </div>
  )
}
