"use client"
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { IconSun, IconMoon, IconDeviceLaptop } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AccountSettings } from "@/components/account-settings"
import { Loader2 } from "lucide-react"

interface UserSettings {
  name: string
  email: string
  authProvider: "credentials" | "google"
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { setTheme } = useTheme()
  const router = useRouter()
  const [orderExecutionAlerts, setOrderExecutionAlerts] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loadingSettings, setLoadingSettings] = useState(false)

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => { if (!data.error) setOrderExecutionAlerts(data.orderExecutionAlerts ?? false) })
      .catch(() => {})
  }, [])

  async function openAccount() {
    setAccountOpen(true)
    if (settings) return
    setLoadingSettings(true)
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      if (!data.error) setSettings(data)
    } catch {
      toast.error("Failed to load account settings")
    } finally {
      setLoadingSettings(false)
    }
  }

  async function toggleNotifications() {
    const next = !orderExecutionAlerts
    setOrderExecutionAlerts(next)
    try {
      const res = await fetch("/api/settings/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderExecutionAlerts: next }),
      })
      if (!res.ok) throw new Error()
      toast.success(next ? "Trade execution emails enabled" : "Trade execution emails disabled")
    } catch {
      setOrderExecutionAlerts(!next)
      toast.error("Failed to update notification preference")
    }
  }

  return (
    <>
      <Sheet open={accountOpen} onOpenChange={setAccountOpen}>
        <SheetContent side="right" className="w-[40%] sm:max-w-none overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Account Settings</SheetTitle>
          </SheetHeader>
          {loadingSettings ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : settings ? (
            <AccountSettings
              settings={settings}
              onUpdate={() => {
                fetch("/api/settings")
                  .then(r => r.json())
                  .then(data => { if (!data.error) setSettings(data) })
                  .catch(() => {})
              }}
            />
          ) : null}
        </SheetContent>
      </Sheet>

      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg grayscale">
                  <AvatarImage src="https://play-lh.googleusercontent.com/-zYcIjV0McgHBmrHPug8SyMDavRUmrMNNu3PR3yF-Bx1MhdxttcOS3fhQCVIhm35rA=w240-h480-rw" alt={user.name} />
                  <AvatarFallback className="rounded-lg">AT</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
                <IconDotsVertical className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openAccount() }}>
                  <IconUserCircle />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/billing")}>
                  <IconCreditCard />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleNotifications}>
                  <IconNotification />
                  Notifications {orderExecutionAlerts ? "(On)" : "(Off)"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />

              <DropdownMenuLabel>Theme</DropdownMenuLabel>

              <DropdownMenuItem onClick={() => setTheme("light")}>
                <IconSun className="mr-2 size-4" />
                Light
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <IconMoon className="mr-2 size-4" />
                Dark
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setTheme("system")}>
                <IconDeviceLaptop className="mr-2 size-4" />
                System
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <IconLogout />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </>
  )
}
