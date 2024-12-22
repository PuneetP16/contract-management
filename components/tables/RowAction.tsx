"use client"

import { MoreHorizontal, AlertTriangle } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { contractSchema, type DataTableRowActionsProps } from "@/types"
import { toast } from "sonner"
import { pusherClient } from "@/lib/pusher"
import { ContractForm } from '@/components/forms/ContactForm'
import { useContracts } from '@/contexts/ContractsContext'

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const { handleLocalUpdate } = useContracts()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const contract = contractSchema.parse(row.original)

  const handleEditSuccess = () => {
    setEditDialogOpen(false)
  }

  const handleDelete = async () => {
    try {
      const socketId = pusherClient.connection.socket_id
      const response = await fetch(`/api/contracts`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contract.id,
          socketId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete contract')
      }

      // Update local state immediately
      handleLocalUpdate({
        type: 'contract.deleted',
        data: contract
      })

      setDeleteDialogOpen(false)
    } catch (error) {
      console.error('Error deleting contract:', error)
      toast.error('Failed to delete contract')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onSelect={() => setEditDialogOpen(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            Delete
            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
          </DialogHeader>
          <ContractForm
            mode="edit"
            initialData={contract}
            onSuccess={handleEditSuccess}
            onLocalUpdate={handleLocalUpdate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Contract
            </DialogTitle>
            <DialogDescription className="pt-4">
              Are you sure you want to delete this contract? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground">Client Name</p>
                <p>{contract.clientName}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Contract Title</p>
                <p>{contract.contractTitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground">Start Date</p>
                <p>{new Date(contract.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">End Date</p>
                <p>{new Date(contract.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground">Status</p>
                <p>{contract.status}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Value</p>
                <p>₹{contract.value.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Contract
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
