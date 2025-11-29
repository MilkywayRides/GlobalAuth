"use client";

import { useEffect, useState } from "react";
import { Globe } from "@/components/globe";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Users } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

interface UserLocation {
  country: string;
  city: string;
  lat: number;
  lon: number;
  count: number;
}

export default function AdminGlobePage() {
  const { data: session } = authClient.useSession();
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUserLocations();
  }, []);

  const fetchUserLocations = async () => {
    try {
      const response = await fetch("/api/admin/user-locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations);
        setTotalUsers(data.totalUsers);
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const markers = locations.map((loc) => ({
    location: [loc.lat, loc.lon] as [number, number],
    size: Math.min(0.1 + (loc.count * 0.02), 0.3),
  }));

  const user = session?.user ? {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image || "",
    role: session.user.role,
  } : undefined;

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Global User Activity</h1>
                <p className="text-muted-foreground">
                  All users across the world
                </p>
              </div>
              <Card className="w-fit">
                <CardContent className="flex items-center gap-2 p-4">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{totalUsers}</div>
                    <div className="text-xs text-muted-foreground">Total Users</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Interactive Globe</CardTitle>
                  <CardDescription>
                    Drag to rotate • Each marker represents user activity from that region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <Globe markers={markers} />
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Active Regions</CardTitle>
                  <CardDescription>
                    {locations.length} regions with user activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : locations.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {locations.map((loc, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {loc.city}, {loc.country}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                            </div>
                          </div>
                          <Badge variant="secondary">{loc.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No user activity data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
