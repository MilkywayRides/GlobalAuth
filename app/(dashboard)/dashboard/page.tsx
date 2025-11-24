"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
    const router = useRouter()
    const [apiStats, setApiStats] = useState({
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        activeKeys: 0
    })
    const [analyticsData, setAnalyticsData] = useState<any>(null)
    const [apiKeys, setApiKeys] = useState<any[]>([])
    const [topApiKeys, setTopApiKeys] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/login")
        }
    }, [session, isPending, router])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, keysRes] = await Promise.all([
                    fetch('/api/analytics'),
                    fetch('/api/keys')
                ])

                if (analyticsRes.ok) {
                    const analytics = await analyticsRes.json()
                    setAnalyticsData(analytics)
                    setTopApiKeys(analytics.topApiKeys || [])
                    setApiStats({
                        totalRequests: analytics.totalRequests || 0,
                        successRate: analytics.totalRequests > 0 
                            ? Math.round((analytics.successfulRequests / analytics.totalRequests) * 100)
                            : 100,
                        avgResponseTime: analytics.totalRequests > 0 ? 145 : 0,
                        activeKeys: 0
                    })
                }

                if (keysRes.ok) {
                    const keysData = await keysRes.json()
                    setApiKeys(keysData.keys || [])
                    setApiStats(prev => ({
                        ...prev,
                        activeKeys: keysData.keys?.filter((k: any) => k.isActive).length || 0
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (session) {
            fetchData()
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
                                                {apiStats.totalRequests > 0 ? (
                                                    <>
                                                        <TrendingUp className="inline h-3 w-3 mr-1" />
                                                        Total requests tracked
                                                    </>
                                                ) : (
                                                    "No requests yet"
                                                )}
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
                                                {apiStats.totalRequests > 0 ? (
                                                    <>
                                                        <Activity className="inline h-3 w-3 mr-1" />
                                                        {apiStats.successRate >= 95 ? "Excellent" : apiStats.successRate >= 80 ? "Good" : "Needs attention"}
                                                    </>
                                                ) : (
                                                    "No data yet"
                                                )}
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
                                                {apiStats.avgResponseTime > 0 ? "Average response" : "No data"}
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
                                                {apiStats.activeKeys > 0 ? `${apiStats.activeKeys} active` : "No keys yet"}
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
                                                    <CardTitle>Top 3 API Keys</CardTitle>
                                                    <CardDescription>
                                                        Most used API keys by request count
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    {topApiKeys.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {topApiKeys.map((key: any, idx: number) => (
                                                                <div key={idx} className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline">{idx + 1}</Badge>
                                                                        <span className="text-sm font-medium">{key.name}</span>
                                                                    </div>
                                                                    <Badge variant="secondary">{key.requests} requests</Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">No API key usage data available</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Request Volume</CardTitle>
                                                    <CardDescription>
                                                        API requests over the last 7 days
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    {analyticsData?.dailyUsage?.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {analyticsData.dailyUsage.map((day: any) => (
                                                                <div key={day.date} className="flex items-center justify-between">
                                                                    <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge variant="outline">{day.requests} requests</Badge>
                                                                        {day.errors > 0 && (
                                                                            <Badge variant="destructive">{day.errors} errors</Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">No data available</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Top Endpoints</CardTitle>
                                                <CardDescription>
                                                    Most frequently used API endpoints
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {analyticsData?.topEndpoints?.length > 0 ? (
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        {analyticsData.topEndpoints.map((endpoint: any, idx: number) => (
                                                            <div key={idx} className="flex items-center justify-between">
                                                                <span className="text-sm font-medium">{endpoint.endpoint}</span>
                                                                <Badge variant="secondary">{endpoint.requests} calls</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No endpoint data available</p>
                                                )}
                                            </CardContent>
                                        </Card>
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
                                                {apiKeys.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {apiKeys.map((key) => (
                                                            <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-semibold">{key.name}</h4>
                                                                        <Badge variant={key.isActive ? "default" : "secondary"}>
                                                                            {key.isActive ? "Active" : "Inactive"}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Created: {new Date(key.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                    {key.lastUsed && (
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Last used: {new Date(key.lastUsed).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                                        {key.key.substring(0, 12)}...
                                                                    </code>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                        <h3 className="text-lg font-semibold mb-2">No API Keys Yet</h3>
                                                        <p className="text-muted-foreground mb-4">
                                                            Create your first API key to start using BlazeNeuro services.
                                                        </p>
                                                        <Button>
                                                            <Key className="h-4 w-4 mr-2" />
                                                            Create Your First Key
                                                        </Button>
                                                    </div>
                                                )}
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
