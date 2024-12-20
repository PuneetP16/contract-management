import { ModeToggle } from './ModelToggle'
import { AddNewContractBtn } from './AddNewContractBtn'
import { FilterSheetBtn } from './FilterSheetBtn'

export const Header = () => {
  return (
    <div className="flex justify-between p-4 md:p-8 items-center md:items-stretch">
      <section>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Contract Management</h2>
        <p className="text-md text-muted-foreground hidden md:block">Manage your contracts with ease</p>
      </section>
      <section className='flex gap-2 items-center'>
        <ModeToggle />
        <FilterSheetBtn />
        <AddNewContractBtn />
      </section>
    </div>
  )
}
