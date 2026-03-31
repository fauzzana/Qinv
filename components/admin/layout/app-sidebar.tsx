"use client"

import * as React from "react"
import {
  IconHelp,
  IconInnerShadowTop,
  IconPackages,
  IconSearch,
  IconSettings,
  IconHome,
  IconUsers,
  IconAsset,
  IconQrcode,
  IconLocation,
  IconCategory
} from "@tabler/icons-react"

import { NavMore } from "@/components/admin/layout/nav-more"
import { NavInventory } from "@/components/admin/layout/nav-inventory"
import { NavMain } from "@/components/admin/layout/nav-main"
import { NavSecondary } from "@/components/admin/layout/nav-secondary"
import { NavUser } from "@/components/admin/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { fromJSONSchema } from "zod"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconHome,
    },
    {
      title: "Users",
      url: "/admin/userManagement/statusUsers",
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  inventory: [
    {
      name: "Data Assets",
      url: "/admin/assetManagement/dataAsset",
      icon: IconAsset,
    },
    {
      name: "Data Items",
      url: "/admin/inventoryManagement/dataItem",
      icon: IconPackages,
    },
    {
      name: "Scan QR Code",
      url: "/admin/scan",
      icon: IconQrcode,
    },
  ],
  more: [
    {
      name: "Location",
      url: "#",
      icon: IconLocation,
    },
    {
      name: "Category",
      url: "#",
      icon: IconCategory,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavInventory items={data.inventory} />
        <NavMore items={data.more} ></NavMore>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
