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
import { MaintenanceAsset } from "@/components/asset/MaintenanceAsset";
import { prisma } from "@/lib/prisma";

async function getMaintenanceAssets() {
  const assets = await prisma.asset.findMany({
    where: {
      status: 3, // Maintenance status
    },
    include: {
      category: true,
      location: true,
      maintenances: {
        orderBy: {
          create_at: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      purcase_date: "desc",
    },
  })

  return assets.map(asset => ({
    asset_serial: asset.asset_serial,
    name: asset.name,
    description: asset.description,
    category: {
      category_name: asset.category.category_name,
    },
    location: {
      location_name: asset.location.location_name,
    },
    qty: asset.qty,
    purcase_date: asset.purcase_date.toISOString().split('T')[0],
    purcase_price: asset.purcase_price,
    status: asset.status,
    qr_code_path: asset.qr_code_path,
    image: asset.image,
    condition: asset.maintenances[0]?.condition,
    maintenance: asset.maintenances.map(m => ({
      attachment: m.attachment,
      create_at: m.create_at.toISOString(),
      date_end: m.date_end ? m.date_end.toISOString().split('T')[0] : null,
      status_maintain: asset.maintenances[0]?.status_maintain,
    })),
  }))
}

export default async function assetPage() {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    redirect("/");
  }

  const maintenanceAssets = await getMaintenanceAssets()
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
                <BreadcrumbLink href="/admin/assetManagement">Data Asset</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Asset Maintenance</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold">Asset Management - Data Asset - Maintenance</h1>
            <p className="text-muted-foreground">
              View and manage asset maintenance
            </p>
          </div>
          <div className="px-4 lg:px-6">
            <MaintenanceAsset data={maintenanceAssets} />
          </div>
        </div>
      </div>
    </div>
  )
}