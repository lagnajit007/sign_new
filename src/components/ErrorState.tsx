"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import Button from "@/components/Button"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-[#2D1B69] mb-2">{title}</h3>
      <p className="text-[#7E7A93] text-sm text-center max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="primary" size="md" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}