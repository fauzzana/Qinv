import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IconAsset, IconPackages } from "@tabler/icons-react"

export function CardImage() {
  return (
    <div className="flex flex-row items-center gap-4 px-4 py-6">
      <Card className="relative mx-auto w-full max-w-sm pt-0">
        <div className="absolute inset-0 z-30 aspect-video" />
        <div className="flex h-48 items-center justify-center bg-muted">
          <IconAsset className="size-24 text-muted-foreground" />
        </div>
        <CardHeader >
          <CardTitle className="justify-self-center align-middle" >Scan Asset</CardTitle>
          <CardDescription>
            Scan the QR code of the asset to view details and manage inventory, like computer, printer, etc.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full cursor-pointer">SCAN QR</Button>
        </CardFooter>
      </Card>
      <Card className="relative mx-auto w-full max-w-sm pt-0">
        <div className="absolute inset-0 z-30 aspect-video" />
        <div className="flex h-48 items-center justify-center bg-muted">
          <IconPackages className="size-24 text-muted-foreground" />
        </div>
        <CardHeader>
          <CardTitle className="justify-self-center align-middle">Scan Item</CardTitle>
          <CardDescription>
            Scan the QR code of the item to view details and manage inventory, like chair, table, etc.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full cursor-pointer">SCAN QR</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
