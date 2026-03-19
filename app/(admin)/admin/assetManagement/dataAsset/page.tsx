import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function assetPage() {
  const session = await auth();

  if (session?.user.role !== "ADMIN") {
    redirect("/");
  }
  return (
    <div className="flex flex-3 flex-col align-center justify-center">
      <h1 className="">Data Asset</h1>
    </div>
  )
}