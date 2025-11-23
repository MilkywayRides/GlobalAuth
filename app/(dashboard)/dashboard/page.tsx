"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { LoadingSpinner, PageLoadingSpinner } from "@/components/ui/loading-spinner"
import {
    SidebarInset,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authClient } from "@/lib/auth-client"
import { 
    Key, 
    BarChart3, 
    Code2, 
    Globe, 
    Zap, 
    Users,
    TrendingUp,
    Activity,
    Clock,
    Shield
} from "lucide-react"
import data from "@/components/dashboard-data.json"

export default function DashboardPage() {
    const { data: session, isPending } = authClient.useSession()
    const [apiStats, setApiStats] = useState({
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        activeKeys: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Fetch API statistics
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/analytics')
                if (response.ok) {
                    const data = await response.json()
                    setApiStats({
                        totalRequests: data.totalRequests || 0,
                        successRate: data.totalRequests > 0 
                            ? Math.round((data.successfulRequests / data.totalRequests) * 100)
                            : 100,
                        avgResponseTime: 145, // Mock data
                        activeKeys: 2 // Mock data
                    })
                }
            } catch (error) {
                console.error('Failed to fetch API stats:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (session) {
            fetchStats()
        } else if (!isPending) {
            setIsLoading(false)
        }
    }, [session, isPending])

    if (isPending || isLoading) {
        return <PageLoadingSpinner text="Loading dashboard..." />
    }

    if (!session) {
        return null
    }

    const user = {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || "",
        role: session.user.role,
    }

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
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                            {/* Welcome Section */}
                            <div className="px-4 lg:px-6">
                                <div className="mb-6">
                                    <h1 className="text-3xl font-bold tracking-tight">
                                        Welcome back, {session.user.name}! 👋
                                    </h1>
                                    <p className="text-muted-foreground mt-2">
                                        Here's what's happening with your BlazeNeuro applications today.
                                    </p>
                                </div>

                                {/* Quick Stats Cards */}
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                                    <Card className="border-l-4 border-l-blue-500">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                API Requests
                                            </CardTitle>
                                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{apiStats.totalRequests.toLocaleString()}</div>
                                            <p className="text-xs text-muted-foreground">
                                                <TrendingUp className="inline h-3 w-3 mr-1" />
                                                +12% from last month
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-l-4 border-l-green-500">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Success Rate
                                            </CardTitle>
                                            <Shield className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{apiStats.successRate}%</div>
                                            <p className="text-xs text-muted-foreground">
                                                <Activity className="inline h-3 w-3 mr-1" />
                                                Excellent performance
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-l-4 border-l-purple-500">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Avg Response Time
                                            </CardTitle>
                                            <Zap className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{apiStats.avgResponseTime}ms</div>
                                            <p className="text-xs text-muted-foreground">
                                                <Clock className="inline h-3 w-3 mr-1" />
                                                -5ms from yesterday
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-l-4 border-l-orange-500">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Active API Keys
                                            </CardTitle>
                                            <Key className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{apiStats.activeKeys}</div>
                                            <p className="text-xs text-muted-foreground">
                                                <Users className="inline h-3 w-3 mr-1" />
                                                All keys active
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Main Dashboard Tabs */}
                            <div className="px-4 lg:px-6">
                                <Tabs defaultValue="overview" className="space-y-4">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                                        <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                                        <TabsTrigger value="applications">Applications</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overview" className="space-y-4">
                                        <SectionCards />
                                        <ChartAreaInteractive />
                                        <DataTable data={data} />
                                    </TabsContent>

                                    <TabsContent value="analytics" className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Request Volume</CardTitle>
                                                    <CardDescription>
                                                        API requests over the last 30 days
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <ChartAreaInteractive />
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Top Endpoints</CardTitle>
                                                    <CardDescription>
                                                        Most frequently used API endpoints
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium">/api/neural/predict</span>
                                                            <Badge variant="secondary">1,234 calls</Badge>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium">/api/auth/session</span>
                                                            <Badge variant="secondary">856 calls</Badge>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium">/api/models/list</span>
                                                            <Badge variant="secondary">432 calls</Badge>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="api-keys" className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle>API Keys Management</CardTitle>
                                                        <CardDescription>
                                                            Manage your API keys for accessing BlazeNeuro services
                                                        </CardDescription>
                                                    </div>
                                                    <Button>
                                                        <Key className="h-4 w-4 mr-2" />
                                                        Create New Key
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-center py-8">
                                                    <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                    <h3 className="text-lg font-semibold mb-2">API Keys Component</h3>
                                                    <p className="text-muted-foreground">
                                                        API Keys management component will be loaded here.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent value="applications" className="space-y-4">
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle>OAuth Applications</CardTitle>
                                                        <CardDescription>
                                                            Manage OAuth applications and integrations
                                                        </CardDescription>
                                                    </div>
                                                    <Button>
                                                        <Code2 className="h-4 w-4 mr-2" />
                                                        New Application
                                                    </Button>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-center py-8">
                                                    <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                    <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                                                    <p className="text-muted-foreground mb-4">
                                                        Create your first OAuth application to start integrating with BlazeNeuro.
                                                    </p>
                                                    <Button>
                                                        <Code2 className="h-4 w-4 mr-2" />
                                                        Create Application
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
