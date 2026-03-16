"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  House,
  GalleryVerticalEnd,
  Settings2,
  FileUser,
  Icon,
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

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
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
      url: "#",
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
          url: "#",
        },
        {
          title: "Roles & Permissions",
          url: "#",
        },
        {
          title: "Activity Logs",
          url: "#",
        },
      ],
    },
    {
      title: "Asset Management",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Data Assets",
          url: "#",
        },
        {
          title: "Scan",
          url: "#",
        },
        {
          title: "Reports Maintenance",
          url: "#",
        },
      ],
    },
    {
      title: "Inventory Management",
      url: "#",
      icon: BookOpen,
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
