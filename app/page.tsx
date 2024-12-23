import { Suspense } from 'react'

import { Content } from '@/components/layouts/content'
import { Header } from '@/components/layouts/header'

export default async function ContractsPage() {
  return (
    <div className='p-4 md:p-8'>
      <Suspense fallback={<div className='h-screen flex items-center justify-center'>Loading...</div>}>
        <Header />
        <Content />
      </Suspense>
    </div>
  )
}
