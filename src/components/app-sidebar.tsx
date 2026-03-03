"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconChartLine,
  IconWallet,
  IconReceipt2,
  IconStar,
  IconHistory,
  IconChartPie,
  IconCurrencyRupee,
  IconSparkles,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Markets",
      url: "/markets",
      icon: IconChartLine,
    },
    {
      title: "Holdings",
      url: "/holdings",
      icon: IconWallet,
    },
    {
      title: "Orders",
      url: "/orders",
      icon: IconReceipt2,
    },
    {
      title: "Watchlist",
      url: "/watchlist",
      icon: IconStar,
    },
    {
      title: "AI Advisor",
      url: "/ai-advisor",
      icon: IconSparkles,
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
  documents: [
    {
      name: "Trade History",
      url: "/trade-history",
      icon: IconHistory,
    },
    {
      name: "Portfolio Analytics",
      url: "/analytics",
      icon: IconChartPie,
    },
    {
      name: "Funds & Balance",
      url: "/funds",
      icon: IconCurrencyRupee,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  const data = {
    user: {
      _id: session?.user?._id || "",
      name: session?.user?.name || "User",
      email: session?.user?.email || "user@example.com",
      avatar: session?.user?.image || "https://img.freepik.com/premium-vector/investor-art-business-illustration_1295705-24340.jpg?semt=ais_hybrid&w=740&q=80",
    },
    navMain: staticData.navMain,
    navSecondary: staticData.navSecondary,
    documents: staticData.documents,
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
