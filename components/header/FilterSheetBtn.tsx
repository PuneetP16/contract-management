import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '../ui/button'
import { Filter } from 'lucide-react'

export const FilterSheetBtn = () => {
  return (
    <div className="lg:hidden -ml-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="w-8 h-8 bg-transparent border-transparent hover:border-transparent dark:border-transparent dark:hover:border-transparent text-foreground hover:bg-transparent hover:text-foreground md:shadow-none">
            <Filter size={16} />
          </Button>
        </SheetTrigger>
        <SheetContent side={"bottom"}>
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div >
  )
}
