import { Metadata } from "next";
import { CardDemo } from "@/components/auth/app-signin";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

export default function AuthPage() {
  return <CardDemo />;
}