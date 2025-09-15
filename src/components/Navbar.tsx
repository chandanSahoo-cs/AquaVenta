"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Upload, MapPin, FileText, Shield, TrendingUp, Menu, X, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

// Mock user role for demo - in real app this would come from auth context
const mockUserRole = "citizen" // Can be "citizen", "admin", or "analyst"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navbarItems = [
    {
      icon: LayoutDashboard,
      name: "Dashboard",
      role: "citizen",
      href: "/dashboard",
    },
    {
      icon: Upload,
      name: "Reports",
      role: "citizen",
      href: "/reports",
    },
    {
      icon: MapPin,
      name: "Map",
      role: "citizen",
      href: "/map",
    },
    {
      icon: FileText,
      name: "Submissions",
      role: "citizen",
      href: "/submissions",
    },
    {
      icon: Shield,
      name: "Admin",
      role: "admin",
      href: "/admin",
    },
    {
      icon: TrendingUp,
      name: "Analytics",
      role: "analyst",
      href: "/analytics",
    },
  ]

  const visibleItems = navbarItems.filter((item) => {
    if (item.role === "citizen") return true
    return item.role === mockUserRole
  })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isScrolled
            ? "bg-white/95 backdrop-blur-lg border-b border-gray-200/60 shadow-sm py-3"
            : "bg-white/90 backdrop-blur-sm py-4",
        )}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-200">
                  <Waves className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  AquaVenta
                </span>
              </div>
            </Link>

            <div
              className={cn(
                "hidden transition-all duration-300",
                isScrolled ? "lg:flex" : "md:flex",
                "items-center space-x-1",
              )}
            >
              {visibleItems.map(({ icon: Icon, name, role, href }) => {
                const isActive = pathname === href
                return (
                  <Link key={name} href={href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                        "hover:bg-blue-50 hover:text-blue-700",
                        isActive ? "text-blue-700 bg-blue-50/80" : "text-gray-600 hover:text-gray-900",
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {name}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                      )}
                    </Button>
                  </Link>
                )
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm font-medium border-gray-300 hover:border-blue-300 hover:text-blue-700 bg-transparent"
                  style={{ backgroundColor: "#ffffff", color: "#374151" }}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="text-sm font-medium shadow-sm"
                  style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#1d4ed8"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#2563eb"
                  }}
                >
                  Get Started
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={cn("p-2 transition-all duration-300", isScrolled ? "lg:hidden" : "md:hidden")}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200/60 shadow-lg">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="space-y-1">
                {visibleItems.map(({ icon: Icon, name, role, href }) => {
                  const isActive = pathname === href
                  return (
                    <Link key={name} href={href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg",
                          "hover:bg-blue-50 hover:text-blue-700",
                          isActive ? "text-blue-700 bg-blue-50/80 border-l-2 border-blue-600" : "text-gray-600",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {name}
                      </Button>
                    </Link>
                  )
                })}

                <div className="pt-4 mt-4 border-t border-gray-200/60 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-center text-sm font-medium border-gray-300 bg-transparent"
                    style={{ backgroundColor: "#ffffff", color: "#374151" }}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center text-sm font-medium"
                    style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1d4ed8"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#2563eb"
                    }}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={cn("transition-all duration-500", isScrolled ? "h-16" : "h-20")} />
    </>
  )
}
