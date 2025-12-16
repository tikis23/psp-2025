import { CreateMerchantDialog } from "@/components/admin/create-merchant-dialog"
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { getAllMerchants, getMerchantUsers, createMerchant } from "@/services/merchantService"
import { createNewUser } from "@/services/userService"
import type { Merchant, User } from "@/types"
import { useEffect, useState } from "react"

const AdminPage = () => {
    const { user } = useAuth()

    const [merchants, setMerchants] = useState<Merchant[]>([])

    // Redirect unauthenticated
    useEffect(() => {
        if (user === null) {
            window.location.href = "/login"
        }
    }, [user])

    // Fetch merchants
    useEffect(() => {
        if (!user || user.role !== "SUPER_ADMIN") return
        getAllMerchants().then(setMerchants)
    }, [user])

    if (user === undefined) return null
    if (user?.role !== "SUPER_ADMIN") return <AccessDenied />

    return (
        <div className="w-full flex flex-col items-center gap-y-4">
            <div className="text-3xl font-semibold mb-4">Merchants</div>

            <div className="flex flex-col w-1/6 gap-4">
                {merchants.map((merchant) => (
                    <MerchantUsersDialog
                        key={merchant.id}
                        merchant={merchant}
                    />
                ))}
            </div>

            <CreateMerchantDialog onSubmitCallback={async (e, name, address, contactInfo) => {
                e.preventDefault()
                try {
                    const newMerchant = await createMerchant({ name, address, contactInfo })
                    setMerchants((prev) => [...prev, newMerchant])
                } catch (error) {
                    console.error("Failed to create merchant:", error)
                }
            }} />
        </div>
    )
}

function MerchantUsersDialog({
    merchant,
}: {
    merchant: Merchant
}) {
    const [users, setUsers] = useState<User[]>([])

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getMerchantUsers(merchant.id)
            setUsers(users)
        }
        fetchUsers()
    }, [merchant.id])

    return (
        <Dialog>
            <DialogTrigger className="w-full border p-4 rounded-lg hover:bg-gray-50 text-left">
                <div className="font-medium">{merchant.name}</div>
                <div className="text-sm text-gray-600">{merchant.address}</div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{merchant?.name}</DialogTitle>
                    <DialogDescription>
                        Users associated with this merchant
                    </DialogDescription>
                </DialogHeader>

                {users.length === 0 && (
                    <div className="text-gray-600">No users found for this merchant.</div>
                )}

                {users?.map((user) => (
                    <UserEntry key={user.email} user={user} />
                ))}
                <DialogFooter>
                    <CreateUserDialog
                        onSubmitCallback={
                            async (userData, password) => {
                                try {
                                    await createNewUser(
                                        { ...userData, merchantId: merchant.id }, password)
                                    const updatedUsers = await getMerchantUsers(merchant.id)
                                    setUsers(updatedUsers)
                                } catch (error) {
                                    console.error("Failed to create user:", error)
                                }
                            }
                        }
                    />
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function UserEntry({ user }: { user: User }) {
    return (
        <div className="border-b pb-2">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
        </div>
    )
}

function AccessDenied() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
                <p className="text-gray-700">
                    You do not have permission to access this page.
                </p>
            </div>
        </div>
    )
}

export default AdminPage    