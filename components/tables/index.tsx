'use client'

import { columns } from './columns'
import { DataTable } from './DataTable'
import { Loading } from '@/components/ui/loading'
import { useContracts } from '@/contexts/ContractsContext'

export const ContractsTable = () => {
  const { contracts, loading, highlightedRows } = useContracts()

  if (loading) {
    return <Loading />
  }

  return (
    <DataTable
      columns={columns}
      data={contracts}
      highlightedRows={highlightedRows}
    />
  )
}
