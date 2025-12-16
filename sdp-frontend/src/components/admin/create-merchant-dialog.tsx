import React from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

export function CreateMerchantDialog({
    onSubmitCallback
}: {
    onSubmitCallback: (
        e: React.FormEvent<HTMLFormElement>,
        merchantName: string,
        merchantAddress: string,
        contactInfo: string
    ) => void
}) {

    const [open, setOpen] = React.useState(false)
    const [merchantName, setMerchantName] = React.useState("")
    const [merchantAddress, setMerchantAddress] = React.useState("")
    const [contactInfo, setContactInfo] = React.useState("")

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setOpen(false)
        onSubmitCallback(e, merchantName, merchantAddress, contactInfo)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create New Merchant</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Merchant</DialogTitle>
                    <DialogDescription>
                        Fill in the details to create a new merchant.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="merchant-name">Merchant Name</Label>
                        <Input
                            id="merchant-name"
                            type="text"
                            placeholder="Enter merchant name"
                            className="mt-1 w-full"
                            onChange={(e) => setMerchantName(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="merchant-address">Merchant Address</Label>
                        <Input
                            id="merchant-address"
                            type="text"
                            placeholder="Enter merchant address"
                            className="mt-1 w-full"
                            onChange={(e) => setMerchantAddress(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="contact-info">Contact Info</Label>
                        <Input
                            id="contact-info"
                            type="text"
                            placeholder="Enter contact info"
                            className="mt-1 w-full"
                            onChange={(e) => setContactInfo(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">Create Merchant</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}