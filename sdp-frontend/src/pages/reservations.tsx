import React, { useEffect, useState } from "react"
import { getAllReservations, createReservation, updateReservation, cancelReservation } from "@/services/reservationService"
import { getAllItems } from "@/services/itemService"
import type { Reservation, ReservationCreateRequest } from "@/services/reservationService"
import type { Item } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

export default function ReservationsPage() {
    const { user } = useAuth()

    const [reservations, setReservations] = useState<Reservation[]>([])
    const [services, setServices] = useState<Item[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    )

    const [editingId, setEditingId] = useState<number | null>(null)

    const [formData, setFormData] = useState<ReservationCreateRequest>({
        serviceId: 0,
        customerName: "",
        customerContact: "",
        appointmentTime: "",
    })

    useEffect(() => {
        loadData()
    }, [selectedDate])

    const loadData = async () => {
        setIsLoading(true)
        try {
            const [reservationsData, itemsData] = await Promise.all([
                getAllReservations(selectedDate),
                getAllItems()
            ])

            setReservations(reservationsData)
            setServices(itemsData.filter(item => item.type === "SERVICE_ITEM"))
        } catch (error) {
            console.error("Failed to load data:", error)
            toast.error("Failed to load reservations data")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.customerName || !formData.appointmentTime) {
            toast.error("Please fill in all required fields")
            return
        }

        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                serviceId: formData.serviceId || 1,
                appointmentTime: new Date(formData.appointmentTime).toISOString()
            }

            if (editingId) {
                await updateReservation(editingId, payload)
                toast.success("Appointment modified successfully")
            } else {
                await createReservation(payload)
                toast.success("Appointment booked successfully")
            }

            resetForm()
            loadData()
        } catch (error) {
            console.error("Operation failed:", error)
            const message = error instanceof Error ? error.message : "Operation failed"
            toast.error(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const startEdit = (res: Reservation) => {
        setEditingId(res.id)
        setFormData({
            serviceId: res.serviceId,
            customerName: res.customerName,
            customerContact: res.customerContact,
            appointmentTime: res.appointmentTime.slice(0, 16)
        })
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({
            serviceId: 0,
            customerName: "",
            customerContact: "",
            appointmentTime: "",
        })
    }

    const handleCancel = async (id: number) => {
        if (!confirm("Are you sure you want to cancel this appointment?")) return

        try {
            await cancelReservation(id)
            toast.success("Reservation cancelled")
            loadData()
        } catch (error) {
            console.error("Cancel failed:", error)
            toast.error("Failed to cancel reservation")
        }
    }

    if (!user) return null

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Reservations</h1>
                <p className="text-gray-600 mt-2">
                    Manage daily appointments.
                </p>
            </div>

            {/* REVERTED: Back to 3-column grid (1/3 + 2/3) to give table more space */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Create/Modify Form - Spans 1 column */}
                <div className="lg:col-span-1">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>{editingId ? "Modify Appointment" : "New Appointment"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Customer Name *</Label>
                                    <Input
                                        id="customerName"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact">Contact Info</Label>
                                    <Input
                                        id="contact"
                                        value={formData.customerContact}
                                        onChange={(e) => setFormData({...formData, customerContact: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="service">Service</Label>
                                    <select
                                        id="service"
                                        className="w-full p-2 border rounded-md bg-background text-sm"
                                        value={formData.serviceId}
                                        onChange={(e) => setFormData({...formData, serviceId: Number(e.target.value)})}
                                    >
                                        <option value={0}>Select a service...</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} - ${s.price.toFixed(2)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="time">Date & Time *</Label>
                                    <Input
                                        id="time"
                                        type="datetime-local"
                                        value={formData.appointmentTime}
                                        onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                                        required
                                    />
                                </div>

                                {/* Vertical stack kept so buttons fit in narrower column */}
                                <div className="flex flex-col gap-3 w-full pt-2">
                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting ? "Processing..." : (editingId ? "Modify Appointment" : "Book Appointment")}
                                    </Button>

                                    {editingId && (
                                        <Button
                                            type="button"
                                            className="w-full bg-gray-600 text-white hover:bg-gray-700"
                                            onClick={resetForm}
                                        >
                                            Cancel Modification
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Schedule Table - Spans 2 columns */}
                <div className="lg:col-span-2">
                    <Card className="shadow-sm h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Schedule</CardTitle>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="viewDate" className="whitespace-nowrap">View Date:</Label>
                                <Input
                                    id="viewDate"
                                    type="date"
                                    className="w-40"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading schedule...</div>
                            ) : reservations.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                                    <p className="text-gray-500">No reservations for {selectedDate}</p>
                                </div>
                            ) : (
                                <div className="w-full">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 uppercase">
                                        <tr>
                                            <th className="px-2 py-3 rounded-tl-lg">Time</th>
                                            <th className="px-2 py-3">Customer</th>
                                            <th className="px-2 py-3">Service</th>
                                            <th className="px-2 py-3">Status</th>
                                            <th className="px-2 py-3 rounded-tr-lg text-right">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {reservations.map((res) => (
                                            <tr key={res.id} className="bg-white hover:bg-gray-50">
                                                <td className="px-2 py-3 font-medium whitespace-nowrap">
                                                    {new Date(res.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-2 py-3">
                                                    <div className="font-medium text-gray-900 truncate max-w-[120px]">{res.customerName}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[120px]">{res.customerContact}</div>
                                                </td>
                                                <td className="px-2 py-3 truncate max-w-[120px]">{res.serviceName}</td>
                                                <td className="px-2 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                res.status === 'CONFIRMED'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                              {res.status}
                            </span>
                                                </td>
                                                <td className="px-2 py-3 text-right">
                                                    {res.status === 'CONFIRMED' && (
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                size="sm"
                                                                className="h-7 px-2 text-xs bg-blue-600 text-white hover:bg-blue-700"
                                                                onClick={() => startEdit(res)}
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                className="h-7 px-2 text-xs bg-red-600 text-white hover:bg-red-700"
                                                                onClick={() => handleCancel(res.id)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}