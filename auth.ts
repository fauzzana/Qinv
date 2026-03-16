import NextAuth from "next-auth"
import {prisma} from "./lib/prisma"
import {PrismaAdapter} from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: {strategy: "jwt"},
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'user'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    }
  }
})