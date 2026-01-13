"use client";
import { useState, useEffect, Suspense } from "react";
import {
  Home,
  Menu,
  X,
  Ship,
  Users,
  BookOpen,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

// --- CONFIGURATION ---
const isDev = process.env.NODE_ENV === "development";

const APPS = {
  portal: {
    prod: "https://fleet-portal.vercel.app",
    dev: "http://localhost:3000",
  },
  vessel: {
    prod: "https://v0-cruising-fleet-member-activity.vercel.app",
    dev: "http://localhost:3001",
  },
  member: {
    prod: "https://cruisingfleet.vercel.app",
    dev: "http://localhost:3002",
  },
  vendors: {
    prod: "https://fleet-vendors.vercel.app",
    dev: "http://localhost:3003",
  },
  downloads: {
    prod: "https://fleet-downloads.vercel.app",
    dev: "http://localhost:3004",
  },
};

const getBaseUrl = (appKey: keyof typeof APPS) => {
  return isDev ? APPS[appKey].dev : APPS[appKey].prod;
};

const navLinks = [
  {
    name: "Fleet Portal",
    href: `${getBaseUrl("portal")}/:id`, 
    icon: <Home size={18} />, 
    isStatic: false
  },
  {
    name: "Vessel Activity",
    href: `${getBaseUrl("vessel")}/:id`, 
    icon: <Ship size={18} />,
    isStatic: false
  },
  {
    name: "Member Activity",
    href: `${getBaseUrl("member")}/:id`, 
    icon: <Users size={18} />,
    isStatic: false
  },
  {
    name: "Vendor Directory",
    href: getBaseUrl("vendors"), 
    icon: <BookOpen size={18} />, 
    isStatic: true
  },
  {
    name: "Downloads",
    href: getBaseUrl("downloads"), 
    icon: <Download size={18} />, 
    isStatic: true
  },
];

function NavbarContent({ manualId }: { manualId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // --- BRUTE FORCE ID DETECTION ---
  // 1. Check for explicit "?id=..." in URL
  const queryId = searchParams.get("id");

  // 2. Check for long number in the path (Zoho IDs are 18-19 digits)
  // This splits the URL /portal/703911... into parts and finds the number.
  const pathId = pathname?.split("/").find(segment => /^\d{10,}$/.test(segment));

  // 3. Final Decision
  const effectiveId = manualId || queryId || pathId;

  // --- LINK RESOLUTION ---
  const resolveHref = (link: typeof navLinks[0]) => {
    // Case A: Dynamic Route (Needs /:id)
    if (!link.isStatic) {
      if (effectiveId) {
        return link.href.replace(":id", encodeURIComponent(String(effectiveId)));
      }
      return link.href.replace("/:id", ""); // Fallback to root if no ID
    }

    // Case B: Static Route (Downloads/Vendors) -> Needs ?id= appended
    if (link.isStatic && effectiveId) {
      const separator = link.href.includes("?") ? "&" : "?";
      return `${link.href}${separator}id=${encodeURIComponent(String(effectiveId))}`;
    }

    return link.href;
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between bg-slate-900 text-white px-4 shadow-md font-sans">
        <Link
          href={resolveHref(navLinks[0])}
          className="flex items-center gap-2 hover:text-sky-400 transition-colors"
        >
          <Home size={24} strokeWidth={2.2} aria-label="Portal Home" />
        </Link>
        <button
          className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-400"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Open Navigation Menu"
        >
          <Menu size={28} />
        </button>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Mobile Drawer Content */}
      <div
        className={
          `fixed top-0 right-0 h-full w-64 bg-slate-800 shadow-xl z-50 transition-transform duration-300 ` +
          (isOpen ? "translate-x-0" : "translate-x-full") +
          " flex flex-col pt-7"
        }
      >
        <button
          className="absolute top-4 right-4 p-1 text-zinc-200 hover:text-white"
          onClick={() => setIsOpen(false)}
          aria-label="Close Menu"
        >
          <X size={24} />
        </button>
        <ul className="mt-6 space-y-2 px-5">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={resolveHref(link)}
                className="flex items-center gap-3 px-3 py-2 rounded text-white hover:bg-slate-700 hover:text-sky-400 font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function FleetNavbar(props: { manualId?: string }) {
  return (
    <Suspense fallback={<div className="h-14 bg-slate-900" />}>
      <NavbarContent {...props} />
    </Suspense>
  );
}