import React, { useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { useNavigate, useLocation } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || "/"

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (error: any) {
      const errorDescription = error?.data?.error || "Login failed"
      console.log(errorDescription)
      if (errorDescription.includes("PASSWORD_EXPIRED")) {
        toast.error("Credentials Expired", {
          action: {
            label: "Press here to reset password",
            onClick: () => navigate("/change-password"),
          },
        })
      } else {
        toast.error(error.message, {
          description: error.data,
        })
      }
    }
  }

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage
