import Link from "next/link";
import { Github, Twitter, Instagram } from "lucide-react";

const LINKS = [
  { label: "FAQ", href: "#" },
  { label: "Help Centre", href: "#" },
  { label: "Account", href: "/profile" },
  { label: "Media Centre", href: "#" },
  { label: "Investor Relations", href: "#" },
  { label: "Jobs", href: "#" },
  { label: "Ways to Watch", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Cookie Preferences", href: "#" },
  { label: "Corporate Information", href: "#" },
  { label: "Contact Us", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-20 px-12 py-12">
      {/* Social */}
      <div className="flex gap-5 mb-8">
        {[Github, Twitter, Instagram].map((Icon, i) => (
          <a
            key={i}
            href="#"
            className="text-text-secondary hover:text-white transition-colors"
          >
            <Icon size={22} />
          </a>
        ))}
      </div>

      {/* Links grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
        {LINKS.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-text-secondary hover:text-white text-xs transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="font-display text-2xl text-primary tracking-widest">
          RED CINEMA
        </div>
        <p className="text-text-secondary text-xs">
          © {new Date().getFullYear()} Red Cinema. All rights reserved.
          <span className="mx-2">·</span>
          Built with Next.js 14 &amp; Spring Boot
        </p>
      </div>
    </footer>
  );
}
