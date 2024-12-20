import React from 'react'
import { Button } from '../ui/button'
import { PlusCircleIcon } from 'lucide-react'

export const AddNewContractBtn = () => {
  return (
    <Button className='h-8 w-8 md:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'>
      <PlusCircleIcon />
      <span className="hidden md:inline">Add new Contract</span>
    </Button>
  )
}