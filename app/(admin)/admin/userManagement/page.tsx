import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserTable } from "@/components/admin/UserTable";
import { prisma } from "@/lib/prisma";

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userId: true,
      address: true,
      number: true,
      department: {
        select: {
          depart_name: true,
        },
      },
    },
    orderBy: {
      id: "desc",
    },
  })
  return users
}

export default async function statusUsersPage() {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await getUsers()

  return (
    <div className="flex flex-3 flex-col">
      <header className="sticky top-0 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-white z-10">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-6"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Status Users</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold">User Management - Status Users</h1>
            <p className="text-muted-foreground">
              View and manage all users in the system
            </p>
          </div>
          <div className="px-4 lg:px-6">
            <UserTable data={users} />
          </div>
        </div>
      </div>
    </div>
  )
}