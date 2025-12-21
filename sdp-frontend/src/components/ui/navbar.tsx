
import { useAuth } from "@/contexts/auth-context";
import { NavLink } from "react-router-dom"
import { Button } from "./button";

const NAV_ROUTES = [
    { to: "/home", label: "Orders" },
    { to: "/items", label: "Items" },
    { to: "/giftcards", label: "Gift Cards" },
    { to: "/admin", label: "Admin" },
    { to: "/reservations", label: "Reservations" },
    { to: "/refunds", label: "Refunds" },
];

const NavBar = () => {
    const { logout } = useAuth();

    return (
        <header className="w-full border-b bg-white">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
                <div className="text-sm font-semibold tracking-tight">POS Demo</div>

                <nav className="flex gap-6 text-sm">
                    {NAV_ROUTES.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `pb-1 transition-colors ${isActive
                                    ? "border-b-2 border-blue-500 text-blue-600"
                                    : "text-gray-600 hover:text-blue-500"
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>
                <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                </Button>
            </div>
        </header>
    )
}

export default NavBar
