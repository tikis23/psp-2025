import React, { useEffect, useState } from "react"
import { getAllReservations, createReservation, updateReservation, cancelReservation } from "@/services/reservationService"
import { getAllItems } from "@/services/itemService"
import { getEmployeesByMerchant } from "@/services/userService"
import type {Item, Reservation, ReservationCreateRequest, User} from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

export default function ReservationsPage() {
    const { user, isLoading: isAuthLoading } = useAuth()

    const [reservations, setReservations] = useState<Reservation[]>([])
    const [services, setServices] = useState<Item[]>([])
    const [employees, setEmployees] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    )

    const [editingId, setEditingId] = useState<number | null>(null)

    const [formData, setFormData] = useState<ReservationCreateRequest>({
        merchantId: 0,
        serviceId: 0,
        employeeId: 0,
        customerName: "",
        customerContact: "",
        appointmentTime: "",
    })

    useEffect(() => {
        if (user?.merchantId) {
            loadData()
        }
    }, [selectedDate, user?.merchantId])

    const loadData = async () => {
        if (!user?.merchantId) return
        setIsLoading(true)
        try {
            const [reservationsData, itemsData, employeesData] = await Promise.all([
                getAllReservations(user.merchantId, selectedDate),
                getAllItems(user.merchantId),
                getEmployeesByMerchant(user.merchantId)
            ])

            setReservations(reservationsData)
            setServices(itemsData.filter(item => item.type === "SERVICE_ITEM"))
            setEmployees(employeesData)

            if (employeesData.length > 0 && formData.employeeId === 0) {
                setFormData(prev => ({ ...prev, employeeId: employeesData[0].id }))
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load data")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user?.merchantId) {
            toast.error("User session not found")
            return
        }

        if (!formData.customerName || !formData.appointmentTime || !formData.employeeId) {
            toast.error("Please fill in all required fields (including Employee)");
            return;
        }

        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                merchantId: user.merchantId,
                serviceId: formData.serviceId || 0,
                employeeId: formData.employeeId || undefined,
            }

            if (editingId) {
                await updateReservation(editingId, payload)
                toast.success("Appointment modified")
            } else {
                await createReservation(payload)
                toast.success("Appointment booked")
            }

            resetForm()
            loadData()
        } catch (error) {
            console.error(error)
            toast.error("Operation failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    const startEdit = (res: Reservation) => {
        setEditingId(res.id)
        setFormData({
            merchantId: user?.merchantId || 0,
            serviceId: res.serviceId,
            employeeId: res.employeeId || 0,
            customerName: res.customerName,
            customerContact: res.customerContact,
            appointmentTime: res.appointmentTime.slice(0, 16)
        })
    }

    const resetForm = () => {
        setEditingId(null)
        setFormData({
            merchantId: user?.merchantId || 0,
            serviceId: 0,
            employeeId: 0,
            customerName: "",
            customerContact: "",
            appointmentTime: "",
        })
    }

    const handleCancel = async (id: number) => {
        if (!confirm("Are you sure?") || !user?.merchantId) return

        try {
            await cancelReservation(id, user.merchantId)
            toast.success("Cancelled")
            loadData()
        } catch (error) {
            console.error(error)
            toast.error("Cancel failed")
        }
    }

    if (isAuthLoading) return null
    if (!user) return <div className="p-8 text-center">Please log in.</div>

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Reservations</h1>
                <p className="text-gray-600 mt-2">
                    Manage daily appointments.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>{editingId ? "Modify" : "New"}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Customer Name *</Label>
                                    <Input
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Contact Info</Label>
                                    <Input
                                        value={formData.customerContact}
                                        onChange={(e) => setFormData({...formData, customerContact: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Service</Label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={formData.serviceId}
                                        onChange={(e) => setFormData({...formData, serviceId: Number(e.target.value)})}
                                    >
                                        <option value={0}>Select a service...</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Employee</Label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={formData.employeeId}
                                        onChange={(e) => setFormData({...formData, employeeId: Number(e.target.value)})}
                                    >
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Time *</Label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.appointmentTime}
                                        onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                                        required
                                    />
                                </div>

                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? "..." : (editingId ? "Modify" : "Book")}
                                </Button>
                                {editingId && <Button type="button" onClick={resetForm} className="w-full bg-gray-500">Cancel Edit</Button>}
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Schedule</CardTitle>
                            <Input
                                type="date"
                                className="w-40"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="text-center py-8 text-gray-500">Loading schedule...</div>
                            ) : reservations.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                                    <p className="text-gray-500">No reservations for {selectedDate}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-2 py-3">Time</th>
                                            <th className="px-2 py-3">Booked At</th>
                                            <th className="px-2 py-3">Customer</th>
                                            <th className="px-2 py-3">Service</th>
                                            <th className="px-2 py-3">Staff</th>
                                            <th className="px-2 py-3">Status</th>
                                            <th className="px-2 py-3 text-right">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                        {reservations.map((res) => (
                                            <tr key={res.id}>
                                                <td className="px-2 py-3 font-medium">
                                                    {new Date(res.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-2 py-3 text-xs text-gray-500">
                                                    {new Date(res.bookedAt).toLocaleString()}
                                                </td>
                                                <td className="px-2 py-3">{res.customerName}</td>
                                                <td className="px-2 py-3">{res.serviceName}</td>
                                                <td className="px-2 py-3">{res.employeeName}</td>
                                                <td className="px-2 py-3">{res.status}</td>
                                                <td className="px-2 py-3 text-right">
                                                    {res.status === 'CONFIRMED' && (
                                                        <div className="flex gap-1 justify-end">
                                                            <Button size="sm" onClick={() => startEdit(res)}>Edit</Button>
                                                            <Button size="sm" className="bg-red-500" onClick={() => handleCancel(res.id)}>X</Button>
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