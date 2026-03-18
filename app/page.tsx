import { ComponentExample } from "@/components/component-example";
import { CardDemo } from "@/components/auth/app-signin";
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/signin");
}