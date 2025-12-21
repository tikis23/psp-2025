import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context";
import { createOrder } from "@/services/orderService";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const HomePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate();

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null // Prevent rendering on server side
  }

  return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="text-center flex flex-col">
              <p className="text-lg">Hello, {user.name}!</p>
              <p className="text-sm text-gray-600">Email: {user.email}</p>
              <Button
                className="mt-4"
                onClick={() => {
                    createOrder(user.merchantId!).then((order) => {
                      toast.success("New order Opened");
                      navigate(`/orders/${order.id}`);
                    }).catch((error) => {
                      toast.error("Failed to create a new order. Please try again.");
                      console.error("Error creating order:", error);
                    });
                }}
              >Take Order
              </Button>
              
              <Button
                className="mt-4"
                onClick={() => navigate("/orders")}
              >View Orders
              </Button>
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
