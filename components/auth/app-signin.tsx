import { BtnGoogleSignIn } from "./btn-signin"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function CardDemo() {
  return (
    <div className="flex w-full h-screen">
      <div className="w-full flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Sign in with your Google account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BtnGoogleSignIn />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}