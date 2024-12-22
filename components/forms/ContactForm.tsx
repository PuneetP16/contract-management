'use client'

import { useFormStatus } from 'react-dom'
import { useActionState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { contractStatuses } from '@/data/constants'
import { contractSchema, type FormState, type ContractFormProps, type ContractFormUpdate } from '@/types'
import { z } from 'zod'
import { pusherClient } from '@/lib/pusher'

const initialState: FormState = { message: null, errors: {} };

export async function handleContract(
  prevState: FormState,
  formData: FormData,
  mode: 'create' | 'edit',
  initialData?: z.infer<typeof contractSchema>,
  onLocalUpdate?: (update: ContractFormUpdate) => void
): Promise<FormState> {

  const rawData = {
    clientName: formData.get('clientName'),
    contractTitle: formData.get('contractTitle'),
    startDate: formData.get('startDate'),
    endDate: formData.get('endDate'),
    status: formData.get('status'),
    value: Number(formData.get('value')),
  }


  const validatedFields = contractSchema.safeParse({
    ...rawData,
    ...mode === 'create'
      ? {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      : {
        id: initialData!.id,
        createdAt: initialData!.createdAt,
        updatedAt: new Date().toISOString(),
      }
  });

  if (!validatedFields.success) {
    console.error('validatedFields error', validatedFields.error.flatten().fieldErrors)
    return {
      message: `Failed to ${mode} contract`,
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const contract = validatedFields.data


  try {
    const socketId = pusherClient.connection.socket_id

    const response = await fetch('/api/contracts', {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contract,
        socketId
      }),
    })


    if (!response.ok) {
      throw new Error(`Failed to ${mode} contract`)
    }

    const data = await response.json()


    // Trigger local update immediately after successful API response
    if (onLocalUpdate) {
      onLocalUpdate({
        type: mode === 'create' ? 'contract.created' : 'contract.updated',
        data: data,
      })
    }

    return {
      message: `Contract ${mode}d successfully`,
      data
    }
  } catch (error) {
    console.error(error)
    return {
      message: `Failed to ${mode} contract`,
      errors: { form: ['Something went wrong'] },
    }
  }
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus()
  const text = mode === 'create' ? 'Creat' : 'Updat'

  return (
    <Button type="submit" disabled={pending}>
      {pending ? `${text}ing...` : `${text} Contract`}
    </Button>
  )
}

export function ContractForm({ mode = 'create', initialData, onSuccess, onLocalUpdate }: ContractFormProps) {
  const [state, formAction] = useActionState(
    async (prevState: FormState, formData: FormData) =>
      handleContract(prevState, formData, mode, initialData, onLocalUpdate),
    initialState
  )

  useEffect(() => {
    if (state.message && !state.errors) {
      if (onSuccess) {
        onSuccess()
      }
    }
  }, [state, onSuccess])

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2 mt-2">
        <Label htmlFor="clientName">Client Name</Label>
        <Input
          id="clientName"
          name="clientName"
          placeholder="Enter client name"
          defaultValue={initialData?.clientName}
          aria-describedby="clientName-error"
          className='mt-2'
        />
        {state.errors?.clientName &&
          state.errors.clientName.map((error: string) => (
            <p id="clientName-error" className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contractTitle">Contract Title</Label>
        <Input
          id="contractTitle"
          name="contractTitle"
          placeholder="Enter contract title"
          defaultValue={initialData?.contractTitle}
          aria-describedby="contractTitle-error"
          required
        />
        {state.errors?.contractTitle &&
          state.errors.contractTitle.map((error: string) => (
            <p id="contractTitle-error" className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <div className="relative">
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={initialData ? formatDateForInput(initialData.startDate) : undefined}
              aria-describedby="startDate-error"
              required
            />
          </div>
          {state.errors?.startDate &&
            state.errors.startDate.map((error: string) => (
              <p id="startDate-error" className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <div className="relative">
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={initialData ? formatDateForInput(initialData.endDate) : undefined}
              aria-describedby="endDate-error"
              required
            />
          </div>
          {state.errors?.endDate &&
            state.errors.endDate.map((error: string) => (
              <p id="endDate-error" className="mt-2 text-sm text-red-500" key={error}>
                {error}
              </p>
            ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={initialData?.status || "Draft"}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {contractStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.status &&
          state.errors.status.map((error: string) => (
            <p id="status-error" className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Contract Value</Label>
        <Input
          id="value"
          name="value"
          type="number"
          placeholder="Enter contract value"
          defaultValue={initialData?.value}
          aria-describedby="value-error"
          required
        />
        {state.errors?.value &&
          state.errors.value.map((error: string) => (
            <p id="value-error" className="mt-2 text-sm text-red-500" key={error}>
              {error}
            </p>
          ))}
      </div>

      {state.errors?.form &&
        state.errors.form.map((error: string) => (
          <p className="mt-2 text-sm text-red-500" key={error}>
            {error}
          </p>
        ))}

      <div className="mt-6 flex justify-end">
        <SubmitButton mode={mode} />
      </div>
    </form>
  )
}
