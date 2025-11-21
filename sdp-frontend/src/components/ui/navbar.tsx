import { NavLink } from "react-router-dom"

const NavBar = () => {
    return (
        <header className="w-full border-b bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
            <div className="text-sm font-semibold tracking-tight">POS Demo</div>

            <nav className="flex gap-6 text-sm">
            <NavLink
                to="/home"
                className={({ isActive }) =>
                `pb-1 transition-colors ${
                    isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`
                }
            >
                Home
            </NavLink>

            <NavLink
                to="/payments"
                className={({ isActive }) =>
                `pb-1 transition-colors ${
                    isActive
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-600 hover:text-blue-500"
                }`
                }
            >
                Payments
            </NavLink>
            </nav>
        </div>
        </header>
    )
}

export default NavBar
