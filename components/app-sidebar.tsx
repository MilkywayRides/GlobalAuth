"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconDashboard,
  IconSettings,
  IconUsers,
  IconHelp,
  IconKey,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { EmergencyShutdown } from "@/components/admin/emergency-shutdown"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Command, Plus } from "lucide-react"
import { appConfig } from "@/lib/app-config"

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: any }) {
  const pathname = usePathname()
  const isAdminSection = pathname?.startsWith('/admin')

  const navMain = isAdminSection ? [
    // Admin navigation
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: IconUsers,
    },
    {
      title: "OAuth Apps",
      url: "/admin/oauth",
      icon: IconSettings,
    },
    {
      title: "All Apps",
      url: "/admin/apps",
      icon: IconKey,
    }
  ] : [
    // User dashboard navigation
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "OAuth Apps",
      url: "/dashboard/oauth",
      icon: IconKey,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
    }
  ];

  const navSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Help",
      url: "#",
      icon: IconHelp,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{appConfig.name}</span>
                  <span className="truncate text-xs">{appConfig.description}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isAdminSection && (
          <div className="px-2 py-2 border-b">
            <div className="flex items-center justify-between gap-2">
              <Button size="sm" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Quick Create
              </Button>
              <EmergencyShutdown />
            </div>
          </div>
        )}
        <NavMain items={navMain} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
