"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CaptionsIcon,
  LayoutDashboard,
  Map,
  Menu,
  ShieldUserIcon,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";
// import { cookies } from "next/headers";
import { logoutUser } from "@/actions/user.actions";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RoleName } from "../../generated/prisma"

export function Navbar() {
  const [userRole, setUserRole] = useState<RoleName | string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const router = useRouter();

  const navbarItems = [
    {
      icon: LayoutDashboard,
      name: "Dashboard",
      role: RoleName.citizen,
      href: "/user/dashboard",
    },
    {
      icon: Upload,
      name: "Reports",
      role: RoleName.citizen,
      href: "/user/reports",
    },
    {
      icon: Map,
      name: "Public Map",
      role: RoleName.citizen,
      href: "/user/map",
    },
    {
      icon: CaptionsIcon,
      name: "Your Submissions",
      role: RoleName.citizen,
      href: "/user/submissions",
    },
    {
      icon: ShieldUserIcon,
      name: "Admin Dashboard",
      role: RoleName.admin,
      href: "/admin/dashboard",
    },
    {
      icon: TrendingUp,
      name: "Analyst Dashboard",
      role: RoleName.analyst,
      href: "/analyst/dashboard",
    },
  ];

  const visibleItems = navbarItems.filter((item) => {
    if (userRole == RoleName.admin) return true;
    else {
      if (item.role === "citizen") return true;
      return item.role === userRole;
    }
  });

  const handleLogout = async () => {
    try {
      const res = await logoutUser();
      if (res.success) {
        toast.success("Logged out successfully");
        router.push("/auth");
      } else throw new Error("Failed to log out");
    } catch {
      toast.error("Failed to log out. Try again");
    }
  };

  useEffect(() => {
    const fetchPayload = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) throw new Error("Not authenticated");
        const data = await res.json();
        setUserRole(data.userPayload?.role);
      } catch (error) {
        setUserRole("");
      }
    };

    fetchPayload();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          isScrolled
            ? "bg-white/95 backdrop-blur-lg border-b border-gray-200/60 shadow-sm py-3"
            : "bg-white/90 backdrop-blur-sm py-4"
        )}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between ">
            <Link
              href="/"
              className="flex items-center gap-2 group no-underline">
              <div className="items-center gap-2">
                <span className="text-xl font-bold text-[#3871c1] group-hover:text-[#656263] transition-colors duration-200 ">
                  Aqua
                </span>
                <span className="text-xl font-bold text-[#656263] group-hover:text-[#3871c1] transition-colors duration-200 ">
                  Venta
                </span>
              </div>
            </Link>

            <div
              className={cn(
                "hidden transition-all duration-300 mx-10",
                isScrolled ? "lg:flex" : "md:flex",
                "items-center space-x-1"
              )}>
              {visibleItems.map(({ icon: Icon, name, role, href }) => {
                const isActive = pathname === href;
                return (
                  <Link key={name} href={href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg",
                        "hover:bg-blue-50 hover:text-blue-700",
                        isActive
                          ? "text-blue-700 bg-blue-50/80"
                          : "text-gray-600 hover:text-gray-900"
                      )}>
                      <Icon className="h-4 w-4 mr-2" />
                      {name}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                {userRole === "" ? (
                  <Button
                    onClick={() => router.push("/auth")}
                    variant="outline"
                    className="w-full justify-center text-sm font-medium border-gray-300 bg-transparent"
                    style={{ backgroundColor: "#ffffff", color: "#374151" }}>
                    Sign In
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleLogout()}
                    variant="outline"
                    className="w-full justify-center text-sm font-medium border-gray-300 bg-transparent"
                    style={{ backgroundColor: "#ffffff", color: "#374151" }}>
                    Log Out
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "p-2 transition-all duration-300",
                  isScrolled ? "lg:hidden" : "md:hidden"
                )}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
            isScrolled ? "lg:hidden" : "md:hidden"
          )}>
          <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200/60 shadow-lg">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="space-y-1">
                {visibleItems.map(({ icon: Icon, name, role, href }) => {
                  const isActive = pathname === href;
                  return (
                    <Link key={name} href={href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg",
                          "hover:bg-blue-50 hover:text-blue-700",
                          isActive
                            ? "text-blue-700 bg-blue-50/80 border-l-2 border-blue-600"
                            : "text-gray-600"
                        )}>
                        <Icon className="h-4 w-4" />
                        {name}
                      </Button>
                    </Link>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-gray-200/60 space-y-2">
                  {userRole === "" ? (
                    <Button
                      onClick={() => router.push("/auth")}
                      variant="outline"
                      className="w-full justify-center text-sm font-medium border-gray-300 bg-transparent"
                      style={{ backgroundColor: "#ffffff", color: "#374151" }}>
                      Sign In
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleLogout()}
                      variant="outline"
                      className="w-full justify-center text-sm font-medium border-gray-300 bg-transparent"
                      style={{ backgroundColor: "#ffffff", color: "#374151" }}>
                      Log Out
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={cn(
          "transition-all duration-500",
          isScrolled ? "h-16" : "h-20"
        )}
      />
    </>
  );
}
