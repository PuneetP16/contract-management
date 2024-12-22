"use client"

import { useState } from "react"
import { X } from 'lucide-react'
import { Plus } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { type DataTableToolbarProps } from "@/types"
import { DataTableViewOptions } from './ViewOptions'
import { ContractForm } from '../forms/ContractForm'
import { useContracts } from '@/contexts/ContractsContext'

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [open, setOpen] = useState(false)
  const { handleLocalUpdate } = useContracts()

  const handleCreateSuccess = () => {
    setOpen(false)
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search contracts..."
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) =>
            table.setGlobalFilter(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3 sm:gap-1 gap-0.5"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 sm:gap-1 gap-0.5"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm">Add Contract</span>
        </Button>
        <DataTableViewOptions table={table} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Contract</DialogTitle>
          </DialogHeader>
          <ContractForm
            mode="create"
            onSuccess={handleCreateSuccess}
            onLocalUpdate={handleLocalUpdate}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
