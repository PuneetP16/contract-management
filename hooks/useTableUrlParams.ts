/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Table, ColumnFiltersState, Updater } from "@tanstack/react-table";

export function useTableUrlParams<TData>(
  table: Table<TData>,
  excludeColumns: string[] = []
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prevFiltersRef = useRef<string>("");

  // Debounced URL update to prevent rapid changes
  const debouncedSyncFiltersToUrl = useDebouncedCallback(
    (filters: ColumnFiltersState) => {
      const params = new URLSearchParams(searchParams?.toString());

      // Remove existing filter params
      Array.from(params.keys()).forEach((key) => {
        if (!excludeColumns.includes(key)) {
          params.delete(key);
        }
      });

      // Add current filters to params
      filters.forEach((filter) => {
        if (!excludeColumns.includes(filter.id) && filter.value) {
          if (Array.isArray(filter.value)) {
            // Handle range filters
            const [min, max] = filter.value;
            if (min) params.set(`${filter.id}Min`, min.toString());
            if (max) params.set(`${filter.id}Max`, max.toString());
          } else {
            params.set(filter.id, filter.value.toString());
          }
        }
      });

      const queryString = params.toString();
      const currentFiltersString = JSON.stringify(filters);

      // Only update URL if filters have actually changed
      if (prevFiltersRef.current !== currentFiltersString) {
        prevFiltersRef.current = currentFiltersString;
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(newUrl as string, { scroll: false });
      }
    },
    300 // 300ms debounce
  );

  // Initialize filters from URL on mount
  useEffect(() => {
    const columnFilters = table
      .getAllColumns()
      .filter((column) => !excludeColumns.includes(column.id))
      .map((column) => {
        const { filterVariant } = (column.columnDef.meta ?? {}) as {
          filterVariant?: "text" | "select" | "range";
        };

        if (filterVariant === "range") {
          const min = searchParams?.get(`${column.id}Min`);
          const max = searchParams?.get(`${column.id}Max`);
          if (min || max) {
            return {
              id: column.id,
              value: [min, max],
            };
          }
        } else {
          const value = searchParams?.get(column.id);
          if (value) {
            return {
              id: column.id,
              value,
            };
          }
        }
        return null;
      })
      .filter(Boolean);

    if (columnFilters.length) {
      table.setColumnFilters(columnFilters as Updater<ColumnFiltersState>);
    }
  }, []); // Only run on mount

  // Subscribe to filter changes
  useEffect(() => {
    const filters = table.getState().columnFilters;
    debouncedSyncFiltersToUrl(filters);
  }, [table.getState().columnFilters, debouncedSyncFiltersToUrl]);

  return { debouncedSyncFiltersToUrl };
}
