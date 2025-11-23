"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/user-data-table";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { columns } from "./columns";

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const { data } = await authClient.getSession();

            if (!data?.user) {
                window.location.href = "/login";
                return;
            }

            if (data.user.role !== "admin") {
                window.location.href = "/";
                return;
            }

            setSession(data);
            loadUsers();
        } catch (error) {
            console.error("Session check failed:", error);
            window.location.href = "/login";
        }
    };

    const loadUsers = async () => {
        try {
            const result = await authClient.admin.listUsers({});
            if (result.data) {
                setUsers(result.data.users);
            }
        } catch (error) {
            console.error("Failed to load users:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoadingSpinner text="Loading users..." />;
    }

    const user = session?.user ? {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || "",
        role: session.user.role,
    } : undefined;

    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" user={user} />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 flex-col p-4 md:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">User Management</h1>
                            <p className="text-muted-foreground">Manage system users</p>
                        </div>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Users ({users.length})</CardTitle>
                            <CardDescription>All registered users</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DataTable columns={columns} data={users} />
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
