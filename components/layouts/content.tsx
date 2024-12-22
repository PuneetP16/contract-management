'use client'

import { ContractsProvider } from '@/contexts/ContractsContext'
import { ContractsTable } from '@/components/tables'

export const Content = () => {
  return (
    <ContractsProvider>
      <div className="space-y-4 mt-8">
        <ContractsTable />
      </div>
    </ContractsProvider>
  )
}
