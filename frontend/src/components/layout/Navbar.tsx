"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Bell, ChevronDown } from "lucide-react";
import { useAuthStore, useUIStore, useIsSuperAdmin, useIsTheatreAdmin } from "@/store";
import clsx from "clsx";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "Theatres", href: "/theatres" },
  { label: "New & Popular", href: "/new" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const isSuperAdmin = useIsSuperAdmin();
  const isTheatreAdmin = useIsTheatreAdmin();

  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    clearAuth();
    setDropdownOpen(false);
    router.push("/");
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "RC";

  return (
    <nav
      className={clsx(
        "fixed top-0 left-0 right-0 z-nav h-[68px] flex items-center px-12 transition-all duration-300",
        scrolled
          ? "bg-background border-b border-border"
          : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      {/* Logo */}
      <Link
        href="/"
        className="font-display text-3xl text-primary tracking-widest shrink-0 hover:opacity-90 transition-opacity"
      >
        RED CINEMA
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-6 ml-8">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "nav-link text-sm font-medium transition-colors",
              pathname === link.href
                ? "text-white"
                : "text-text-secondary hover:text-white"
            )}
          >
            {link.label}
          </Link>
        ))}
        {isSuperAdmin && (
          <Link
            href="/admin"
            className={clsx(
              "nav-link text-sm font-medium",
              pathname.startsWith("/admin") ? "text-white" : "text-text-secondary hover:text-white"
            )}
          >
            Admin
          </Link>
        )}
        {isTheatreAdmin && !isSuperAdmin && (
          <Link
            href="/theatre-admin"
            className={clsx(
              "nav-link text-sm font-medium",
              pathname.startsWith("/theatre-admin") ? "text-white" : "text-text-secondary hover:text-white"
            )}
          >
            Dashboard
          </Link>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                onSubmit={handleSearch}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search movies..."
                  className="w-full bg-background border border-white rounded text-white text-sm px-3 py-1.5 outline-none placeholder:text-text-secondary"
                />
              </motion.form>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSearchOpen((p) => !p)}
            className="btn-icon w-9 h-9 text-text-secondary hover:text-white"
            aria-label="Search"
          >
            {searchOpen ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        {/* Auth / Profile */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button className="btn-icon w-9 h-9 text-text-secondary hover:text-white">
              <Bell size={18} />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 group"
              >
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                  {initials}
                </div>
                <ChevronDown
                  size={16}
                  className={clsx(
                    "text-text-secondary transition-transform",
                    dropdownOpen && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-52 bg-surface border border-border rounded-lg shadow-modal overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-border">
                      <div className="text-sm font-semibold">{user?.firstName} {user?.lastName}</div>
                      <div className="text-xs text-text-secondary mt-0.5">{user?.userEmail}</div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm hover:bg-surface-2 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/reservations"
                        className="block px-4 py-2.5 text-sm hover:bg-surface-2 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        My Bookings
                      </Link>
                      {isSuperAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2.5 text-sm text-primary hover:bg-surface-2 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-2 transition-colors border-t border-border mt-1"
                      >
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <button
            onClick={() => openAuthModal("login")}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded text-sm font-semibold transition-colors"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
