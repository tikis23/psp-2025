import { Loader } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader className="w-10 h-10 animate-spin text-gray-500" />
    </div>
  )
}
