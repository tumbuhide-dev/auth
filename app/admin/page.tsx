import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    return (
      <main className="max-w-7xl mx-auto p-4">
        <p>You do not have permission to view this page.</p>
      </main>
    )
  }

  const user = session.user

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {user.name}!</p>
      </main>
      <MobileBottomNav user={user} />
    </>
  )
}
