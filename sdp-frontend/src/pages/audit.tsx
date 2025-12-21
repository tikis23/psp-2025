import { useAuth } from "@/contexts/auth-context"
import { getAuditLogs } from "@/services/auditService"
import type { AuditLogEntry, AuditLogPage } from "@/types/audit"
import { useState, useEffect } from "react"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PAGE_SIZE = 20

const AuditPage = () => {
    const { user } = useAuth()
    const [logs, setLogs] = useState<AuditLogEntry[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [pageNumber, setPageNumber] = useState<number>(0)
    const [totalPages, setTotalPages] = useState<number>(1)

    // Redirect unauthenticated
    useEffect(() => {
        if (user === null) {
            window.location.href = "/login"
        }
    }, [user])

    const fetchLogs = async () => {
        if (user && user.merchantId) {
            setIsLoading(true)
            try {
                const data: AuditLogPage = await getAuditLogs(user.merchantId, undefined, pageNumber, PAGE_SIZE)
                setLogs(data.content)
                setTotalPages(data.totalPages)
            } catch (error) {
                console.error("Failed to fetch audit logs:", error)
            } finally {
                setIsLoading(false)
            }
        }
    }

    // Fetch logs when user or pageNumber changes
    useEffect(() => {
        if (user && user.merchantId !== undefined) {
            fetchLogs()
        }
    }, [user, pageNumber])

    if (user === undefined) return null

    if (user?.role !== "BUSINESS_OWNER") return <InsufficientPrivileges />

    return (
        <div className="w-full flex flex-col items-center gap-y-4">
            <div className="text-3xl font-semibold mb-4">Audit Logs</div>
            <div className="flex flex-col w-full items-center gap-4">
                {isLoading ? (
                    <div>Loading...</div>
                ) : logs.length === 0 ? (
                    <div>No audit logs found.</div>
                ) : (
                    <div className="flex flex-col w-1/2 gap-y-2">
                        {logs.map(log => <AuditLogCard key={log.id} log={log} />)}
                    </div>
                )}
            </div>
            <div className="mt-6">
                <AuditLogPageSelector
                    activePage={pageNumber + 1}
                    totalPages={totalPages}
                    onPageChange={page => setPageNumber(page - 1)}
                />
            </div>
        </div>
    )
}

function AuditLogPageSelector({
    activePage,
    totalPages,
    onPageChange,
}: {
    activePage: number
    totalPages: number
    onPageChange: (page: number) => void
}) {
    // Helper to generate page numbers (show up to 5 pages, with ellipsis if needed)
    const getPages = () => {
        const pages: (number | "ellipsis")[] = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (activePage <= 3) {
                pages.push(1, 2, 3, 4, "ellipsis", totalPages)
            } else if (activePage >= totalPages - 2) {
                pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                pages.push(1, "ellipsis", activePage - 1, activePage, activePage + 1, "ellipsis", totalPages)
            }
        }
        return pages
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={e => {
                            e.preventDefault()
                            if (activePage > 1) onPageChange(activePage - 1)
                        }}
                        aria-disabled={activePage === 1}
                    />
                </PaginationItem>
                {getPages().map((page, idx) =>
                    page === "ellipsis" ? (
                        <PaginationItem key={`ellipsis-${idx}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={page}>
                            <PaginationLink
                                href="#"
                                isActive={page === activePage}
                                onClick={e => {
                                    e.preventDefault()
                                    if (page !== activePage) onPageChange(page as number)
                                }}
                            >
                                {page}
                            </PaginationLink>
                        </PaginationItem>
                    )
                )}
                <PaginationItem>
                    <PaginationNext
                        href="#"
                        onClick={e => {
                            e.preventDefault()
                            if (activePage < totalPages) onPageChange(activePage + 1)
                        }}
                        aria-disabled={activePage === totalPages}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

function AuditLogCard({ log }: { log: AuditLogEntry }) {
    const dateString = new Date(log.createdAt).toLocaleString()
    return (
        <Card className="h-24">
            <CardHeader>
                <CardTitle>{log.actionType}</CardTitle>
                <CardDescription>{log.actorName} - {dateString}</CardDescription>
            </CardHeader>
        </Card>
    )
}

function InsufficientPrivileges() {
    return (
        <div className="w-full flex flex-col items-center gap-y-4">
            <div className="text-3xl font-semibold mb-4">Audit Logs</div>
            <div>You do not have sufficient privileges to view audit logs.</div>
        </div>
    )
}

export default AuditPage