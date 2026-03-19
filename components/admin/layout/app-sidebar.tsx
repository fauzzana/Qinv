"use client"

import * as React from "react"
import {
  AudioWaveform,
  Boxes,
  Command,
  House,
  GalleryVerticalEnd,
  Settings2,
  FileUser,
  Package,
} from "lucide-react"

import { NavMain } from "@/components/admin/layout/nav-main"
import { NavProjects } from "@/components/admin/layout/nav-projects"
import { NavUser } from "@/components/admin/layout/nav-user"
import { TeamSwitcher } from "@/components/admin/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { url } from "inspector"
import { is, tr } from "zod/v4/locales"

// This is sample data.
const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/admin/dashboard",
      icon: House,
    }
  ],
  navMain: [
    {
      title: "User Management",
      url: "#",
      icon: FileUser,
      isActive: true,
      items: [
        {
          title: "Status Users",
          url: "/admin/userManagement/statusUsers",
        },
        {
          title: "Roles & Permissions",
          url: "/admin/userManagement/permission",
        },
        {
          title: "Activity Logs",
          url: "/admin/userManagement/activityLog",
        },
      ],
    },
    {
      title: "Asset Management",
      url: "#",
      icon: Boxes,
      isActive: true,
      items: [
        {
          title: "Data Assets",
          url: "/admin/assetManagement/dataAsset",
        },
        {
          title: "Scan",
          url: "/admin/assetManagement/scanPage",
        },
        {
          title: "Reports Maintenance",
          url: "/admin/assetManagement/assetMaintenance",
        },
      ],
    },
    {
      title: "Inventory Management",
      url: "#",
      icon: Package,
      isActive: true,
      items: [
        {
          title: "Data Items",
          url: "#",
        },
        {
          title: "Scan",
          url: "#",
        },
        {
          title: "Transactions",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "More",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Location",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
