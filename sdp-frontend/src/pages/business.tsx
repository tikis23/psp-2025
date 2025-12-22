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
import { getMerchantUsers, getMerchant } from "@/services/merchantService"
import { createNewUser } from "@/services/userService"
import { getTaxRates, createTaxRate, deleteTaxRate } from "@/services/taxService"
import { getDiscounts, createDiscount, deleteDiscount } from "@/services/discountService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Merchant, User, TaxRate, Discount } from "@/types"
import { useEffect, useState } from "react"

const AdminPage = () => {
    const { user } = useAuth()

    const [merchant, setMerchant] = useState<Merchant | null>(null)
    const [taxes, setTaxes] = useState<TaxRate[]>([])
    const [discounts, setDiscounts] = useState<Discount[]>([])

    useEffect(() => {
        if (user === null) {
            window.location.href = "/login"
        }
    }, [user])

    useEffect(() => {
        if (!user || user.role !== "BUSINESS_OWNER") return
        if (user.merchantId === undefined) return
        getMerchant(user.merchantId).then(setMerchant)
    }, [user])

    useEffect(() => {
        if (!user || user.role !== "BUSINESS_OWNER") return
        if (user.merchantId === undefined) return
        getTaxRates(user.merchantId).then(setTaxes)
        getDiscounts(user.merchantId).then(setDiscounts)
    }, [user])

    if (user === undefined) return null
    if (user?.role !== "BUSINESS_OWNER" || !user.merchantId) return <AccessDenied />

    const merchantId = user.merchantId

    return (
        <div className="w-full flex flex-col items-center gap-y-12 py-10 px-4">
            <div className="flex flex-col items-center gap-y-4 w-full">
                <div className="text-3xl font-semibold mb-4">Business</div>
                <div className="flex flex-col w-full max-w-md gap-4">
                    {merchant && (
                        <MerchantUsersDialog
                            key={merchant.id}
                            merchant={merchant}
                        />
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-y-4 w-full border-t pt-10">
                <div className="text-3xl font-semibold mb-4">Tax Management</div>
                <div className="flex flex-col w-full max-w-2xl gap-2">
                    {taxes.map((tax) => (
                        <div key={tax.id} className="flex justify-between items-center border p-4 rounded-lg bg-white shadow-sm">
                            <div>
                                <div className="font-medium text-lg">{tax.name}</div>
                                <div className="text-sm text-gray-500">Rate: {(tax.rate * 100).toFixed(2)}%</div>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => deleteTaxRate(tax.id).then(() => setTaxes(t => t.filter(x => x.id !== tax.id)))}>
                                Delete
                            </Button>
                        </div>
                    ))}
                </div>
                <CreateTaxDialog onCreated={(newTax) => setTaxes([...taxes, newTax])} merchantId={merchantId} />
            </div>

            <div className="flex flex-col items-center gap-y-4 w-full border-t pt-10">
                <div className="text-3xl font-semibold mb-4">Discount Management</div>
                <div className="flex flex-col w-full max-w-2xl gap-2">
                    {discounts.map((discount) => (
                        <div key={discount.id} className="flex justify-between items-center border p-4 rounded-lg bg-white shadow-sm">
                            <div>
                                <div className="font-medium text-lg">{discount.code}</div>
                                <div className="text-sm text-gray-500">
                                    {discount.value} {discount.type === "PERCENTAGE" ? "%" : "Fixed Amount"} — {discount.scope} scope
                                </div>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => deleteDiscount(discount.id).then(() => setDiscounts(d => d.filter(x => x.id !== discount.id)))}>
                                Delete
                            </Button>
                        </div>
                    ))}
                </div>
                <CreateDiscountDialog onCreated={(newDiscount) => setDiscounts([...discounts, newDiscount])} merchantId={merchantId} />
            </div>
        </div>
    )
}

function CreateTaxDialog({ onCreated, merchantId }: { onCreated: (tax: TaxRate) => void, merchantId: number }) {
    const [name, setName] = useState("")
    const [rate, setRate] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const tax = await createTaxRate({ name, rate: parseFloat(rate) / 100 }, merchantId)
            onCreated(tax)
            setName("")
            setRate("")
        } catch (error) {
            console.error("Failed to create tax rate:", error)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="outline">Create New Tax</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Tax Rate</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tax Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. VAT" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Rate (%)</Label>
                        <Input type="number" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="e.g. 21" required />
                    </div>
                    <DialogFooter><Button type="submit">Save Tax Rate</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function CreateDiscountDialog({ onCreated, merchantId }: { onCreated: (discount: Discount) => void, merchantId: number }) {
    const [code, setCode] = useState("")
    const [value, setValue] = useState("")
    const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE")
    const [scope, setScope] = useState<"ORDER" | "PRODUCT">("ORDER")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const discount = await createDiscount({
                code,
                value: parseFloat(value),
                type,
                scope
            }, merchantId)
            onCreated(discount)
            setCode("")
            setValue("")
        } catch (error) {
            console.error("Failed to create discount:", error)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild><Button variant="outline">Create New Discount</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Discount</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Code</Label>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SUMMER20" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Value</Label>
                        <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="10" required />
                    </div>
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select onValueChange={(v: any) => setType(v)} defaultValue={type}>
                            <SelectTrigger className="bg-black text-white border-gray-600">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Scope</Label>
                        <Select onValueChange={(v: any) => setScope(v)} defaultValue={scope}>
                            <SelectTrigger className="bg-black text-white border-gray-600">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ORDER">Whole Order</SelectItem>
                                <SelectItem value="PRODUCT">Specific Product</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter><Button type="submit">Save Discount</Button></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
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

                <div className="flex flex-col gap-y-3">
                    {users?.map((user) => (
                        <UserEntry key={user.email} user={user} />
                    ))}
                </div>

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
            <div className="text-xs text-gray-400 font-mono mt-1">{user.role}</div>
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