import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'border shadow-md text-sm',
          success: '!bg-green-50 !text-green-800 !border-green-200',
          error: '!bg-red-50 !text-red-800 !border-red-200',
          warning: '!bg-yellow-50 !text-yellow-800 !border-yellow-200',
          info: '!bg-blue-50 !text-blue-800 !border-blue-200',
          icon: '[&_svg]:size-4',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
