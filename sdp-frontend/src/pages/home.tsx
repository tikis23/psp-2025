import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate();

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="text-center">
              <p className="text-lg">Hello, {user.name}!</p>
              <p className="text-sm text-gray-600">Email: {user.email}</p>
              <Button
                className="mt-4"
                onClick={() => navigate("/orders", {
                  state: { newOrder: true }
                })}
              >Take Order</Button>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Loading user details...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage
