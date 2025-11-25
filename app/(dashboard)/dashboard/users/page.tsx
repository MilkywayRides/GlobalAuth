"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  lastLogin: string;
  appName: string;
  clientId: string;
  accessLevel: 'basic' | 'full';
}

export default function UsersPage() {
  const [users, setUsers] = useState<AuthenticatedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const usersPerPage = 20;

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.appName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination for filtered results
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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

      setSession(data);
      loadUsers();
    } catch (error) {
      console.error("Session check failed:", error);
      window.location.href = "/login";
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/dashboard/oauth-users?" + new Date().getTime(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoadingSpinner text="Loading authenticated users..." />;
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
          <div className="flex items-center gap-4 mb-6">
            <Users className="h-8 w-8 text-primary" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">OAuth Authenticated Users</h1>
              <p className="text-muted-foreground">Users who have authenticated through OAuth API keys</p>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users, emails, or apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead>Client ID</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers && currentUsers.length > 0 ? currentUsers.map((authUser) => (
                    <TableRow key={`${authUser.id}-${authUser.clientId}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {authUser.image ? (
                            <img 
                              src={authUser.image} 
                              alt={authUser.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span className="font-medium">{authUser.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{authUser.email}</TableCell>
                      <TableCell>{authUser.appName}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {authUser.clientId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={authUser.accessLevel === 'full' ? 'default' : 'secondary'}>
                          {authUser.accessLevel === 'full' ? 'Full Access' : 'Basic Access'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(authUser.lastLogin).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No OAuth authenticated users found.</p>
                        <p className="text-sm">Users will appear here after authenticating through OAuth apps.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                  {searchQuery && ` (filtered from ${users.length} total)`}
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              isActive={currentPage === page}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
