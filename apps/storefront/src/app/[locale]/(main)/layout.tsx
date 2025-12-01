import { retrieveCustomer } from "@/lib/data/customer"
import { checkRegion } from "@/lib/helpers/check-region"
import { Session } from "@talkjs/react"
import { redirect } from "next/navigation"
import Navbar from "@/components/psn/Navbar"
import Footer from "@/components/psn/Footer"
import ComparisonSidebar from "@/components/psn/ComparisonSidebar"
import CookieConsentBanner from "@/components/psn/CookieConsentBanner"

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const APP_ID = process.env.NEXT_PUBLIC_TALKJS_APP_ID
  const { locale } = await params

  const user = await retrieveCustomer()
  const regionCheck = await checkRegion(locale)

  if (!regionCheck) {
    return redirect("/")
  }

  if (!APP_ID || !user)
    return (
      <>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ComparisonSidebar />
        <CookieConsentBanner />
      </>
    )

  return (
    <>
      <Session appId={APP_ID} userId={user.id}>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ComparisonSidebar />
        <CookieConsentBanner />
      </Session>
    </>
  )
}
