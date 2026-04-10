import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "error" | "warning"
  duration?: number
  onClose: (id: string) => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = "default", onClose }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto w-full max-w-sm overflow-hidden rounded-card border shadow-lg",
          "animate-in slide-in-from-top-full duration-300",
          {
            "bg-white border-gray-200": variant === "default",
            "bg-green-50 border-green-200": variant === "success",
            "bg-red-50 border-red-200": variant === "error",
            "bg-yellow-50 border-yellow-200": variant === "warning",
          }
        )}
      >
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              {title && (
                <div
                  className={cn("text-sm font-semibold mb-1", {
                    "text-gray-900": variant === "default",
                    "text-green-900": variant === "success",
                    "text-red-900": variant === "error",
                    "text-yellow-900": variant === "warning",
                  })}
                >
                  {title}
                </div>
              )}
              {description && (
                <div
                  className={cn("text-sm", {
                    "text-gray-700": variant === "default",
                    "text-green-700": variant === "success",
                    "text-red-700": variant === "error",
                    "text-yellow-700": variant === "warning",
                  })}
                >
                  {description}
                </div>
              )}
            </div>
            <button
              onClick={() => onClose(id)}
              className={cn(
                "flex-shrink-0 rounded-lg p-1 transition-colors",
                {
                  "hover:bg-gray-100": variant === "default",
                  "hover:bg-green-100": variant === "success",
                  "hover:bg-red-100": variant === "error",
                  "hover:bg-yellow-100": variant === "warning",
                }
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }
)
Toast.displayName = "Toast"

export { Toast }

// Toast Container Component
export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({
  toasts,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const showToast = React.useCallback(
    (
      toast: Omit<ToastProps, "id" | "onClose"> & { id?: string }
    ) => {
      const id = toast.id || Math.random().toString(36).substr(2, 9)
      const duration = toast.duration || 3000

      const newToast: ToastProps = {
        ...toast,
        id,
        onClose: (toastId: string) => {
          setToasts((prev) => prev.filter((t) => t.id !== toastId))
        },
      }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
      }
    },
    []
  )

  return { toasts, showToast }
}
