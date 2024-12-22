'use client'

import { createContext, useContext, ReactNode } from 'react'
import { Contract, ContractUpdate } from '@/types'
import { useContractsManager } from '@/hooks/useContractsManager'

type ContractsContextType = {
  contracts: Contract[]
  loading: boolean
  highlightedRows: { [key: string]: string }
  handleLocalUpdate: (update: ContractUpdate) => void
}

const ContractsContext = createContext<ContractsContextType | undefined>(undefined)

export function ContractsProvider({ children }: { children: ReactNode }) {
  const contractsManager = useContractsManager()

  return (
    <ContractsContext.Provider value={contractsManager}>
      {children}
    </ContractsContext.Provider>
  )
}

export function useContracts() {
  const context = useContext(ContractsContext)
  if (context === undefined) {
    throw new Error('useContracts must be used within a ContractsProvider')
  }
  return context
}
