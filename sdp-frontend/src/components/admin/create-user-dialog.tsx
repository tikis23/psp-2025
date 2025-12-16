import React from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import type { User } from "@/types"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const AVAILABLE_ROLES = ["EMPLOYEE", "BUSINESS_OWNER"]

export function CreateUserDialog({
    onSubmitCallback
}: {
    onSubmitCallback: (
        userData: User,
        password: string
    ) => void
}) {

    const [open, setOpen] = React.useState(false)
    const [userName, setUserName] = React.useState("")
    const [userEmail, setUserEmail] = React.useState("")
    const [userRole, setUserRole] = React.useState("")
    const [password, setPassword] = React.useState("")

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setOpen(false)
        onSubmitCallback({ name: userName, email: userEmail, role: userRole }, password)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create User</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new user for this merchant.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="user-name">User Name</Label>
                        <Input
                            id="user-name"
                            type="text"
                            placeholder="Enter user name"
                            className="mt-1 w-full"
                            onChange={(e) => setUserName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="user-email">User Email</Label>
                        <Input
                            id="user-email"
                            type="text"
                            placeholder="Enter user email"
                            className="mt-1 w-full"
                            onChange={(e) => setUserEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="user-role">User Role</Label>
                        <Select onValueChange={(value) => setUserRole(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Roles</SelectLabel>
                                    {AVAILABLE_ROLES.map((role) => (
                                        <SelectItem
                                            key={role}
                                            value={role}
                                        >
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="user-password">Password</Label>
                        <Input
                            id="user-password"
                            type="password"
                            placeholder="Enter password"
                            className="mt-1 w-full"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">Create User</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog >
    )
}