import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
} from "lucide-react"

export const contractStatuses = [
  { value: 'Draft', label: 'Draft', icon: FileText },
  { value: 'Pending', label: 'Pending', icon: Clock },
  { value: 'Active', label: 'Active', icon: CheckCircle },
  { value: 'Terminated', label: 'Terminated', icon: XCircle },
  { value: 'Expired', label: 'Expired', icon: AlertCircle },
] 