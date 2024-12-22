'use client'

import { useFormStatus } from 'react-dom'
import { useActionState, useEffect, useRef } from 'react'
import { z } from 'zod'

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
import { contractSchema, type FormState, type ContractFormProps, type ContractFormUpdate, Contract } from '@/types'
import { pusherClient } from '@/lib/pusher'
import { generateUUID } from '@/lib/utils'

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
        id: generateUUID(),
        createdAt: new Date().toISOString(),
      }
      : {
        id: initialData!.id,
        createdAt: initialData!.createdAt,
        updatedAt: new Date().toISOString(),
      }
  });

  if (!validatedFields.success) {
    return {
      message: `Failed to ${mode} contract`,
      errors: validatedFields.error.flatten().fieldErrors,
      values: {
        clientName: formData.get("clientName") as Contract["clientName"],
        contractTitle: formData.get("contractTitle") as Contract["contractTitle"],
        startDate: formData.get("startDate") as Contract["startDate"],
        endDate: formData.get("endDate") as Contract["endDate"],
        status: formData.get("status") as Contract["status"],
        value: formData.get("value") as unknown as Contract["value"],
      } as Contract
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
      values: {
        clientName: formData.get("clientName") as Contract["clientName"],
        contractTitle: formData.get("contractTitle") as Contract["contractTitle"],
        startDate: formData.get("startDate") as Contract["startDate"],
        endDate: formData.get("endDate") as Contract["endDate"],
        status: formData.get("status") as Contract["status"],
        value: formData.get("value") as unknown as Contract["value"],
      } as Contract
    }
  }
}

function SubmitButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus()
  const text = mode === 'create' ? 'Create' : 'Update'

  return (
    <Button type="submit" disabled={pending}>
      {pending ? `${text.slice(0, -1)}ing...` : `${text} Contract`}
    </Button>
  )
}

export function ContractForm({ 
  mode = 'create',
  initialData,
  onSuccess,
  onLocalUpdate
}: ContractFormProps) {
  const [state, formAction] = useActionState(
    async (prevState: FormState, formData: FormData) =>
      handleContract(prevState, formData, mode, initialData, onLocalUpdate),
    initialState
  )
  const formRef = useRef<HTMLFormElement>(null)

  const values = state?.values || initialData || {} as Contract

  useEffect(() => {
    if (state?.message === `Contract ${mode}d successfully`) {
      if (onSuccess) {
        onSuccess()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.message, onSuccess])

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split('T')[0]
  }
  return (
    <form 
      ref={formRef}
      action={formAction}
      className="space-y-4"
    >
      <div className="space-y-2 mt-2">
        <Label htmlFor="clientName">Client Name</Label>
        <Input
          id="clientName"
          name="clientName"
          placeholder="Enter client name"
          defaultValue={values.clientName}
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
          defaultValue={values.contractTitle}
          aria-describedby="contractTitle-error"
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
              defaultValue={values.startDate && formatDateForInput(values.startDate)}
              aria-describedby="startDate-error"
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
              defaultValue={values.endDate && formatDateForInput(values.endDate)}
              aria-describedby="endDate-error"
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
        <Select name="status" defaultValue={values.status || 'Draft'}>
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
          defaultValue={values.value}
          aria-describedby="value-error"
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
