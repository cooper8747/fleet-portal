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
import { useParams, useSearchParams } from "next/navigation";

// --- URL CONFIGURATION ---
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

// Define the links structure
const navLinks = [
  {
    name: "Fleet Portal",
    href: `${getBaseUrl("portal")}/:id`, // Dynamic path
    icon: <Home size={18} />, 
    isStatic: false
  },
  {
    name: "Vessel Activity",
    href: `${getBaseUrl("vessel")}/:id`, // Dynamic path
    icon: <Ship size={18} />,
    isStatic: false
  },
  {
    name: "Member Activity",
    href: `${getBaseUrl("member")}/:id`, // Dynamic path
    icon: <Users size={18} />,
    isStatic: false
  },
  {
    name: "Vendor Directory",
    href: getBaseUrl("vendors"), // Static path (needs ?id=)
    icon: <BookOpen size={18} />, 
    isStatic: true
  },
  {
    name: "Downloads",
    href: getBaseUrl("downloads"), // Static path (needs ?id=)
    icon: <Download size={18} />, 
    isStatic: true
  },
];

// 1. Create the content component (Inner)
function NavbarContent({ manualId }: { manualId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Hooks to grab data from URL
  const params = useParams(); 
  const searchParams = useSearchParams();

  // --- ID DETECTION LOGIC ---
  // A. Check Route Params (e.g. /portal/123)
  const routeCandidates = ["contactID", "accountID", "id", "slug"];
  const routeId = routeCandidates
    .map((key) => params?.[key])
    .find((val) => typeof val === "string" && val);

  // B. Check Query Params (e.g. /downloads?id=123)
  const queryId = searchParams.get("id");

  // C. Final ID Decision
  const effectiveId = manualId || routeId || queryId;

  // Debugging: Uncomment if you still have issues to see what the navbar sees
  // console.log("Navbar Detected:", { routeId, queryId, effectiveId });

  // --- LINK RESOLUTION ---
  const resolveHref = (link: typeof navLinks[0]) => {
    // Case 1: Dynamic Route (needs /:id replaced)
    if (!link.isStatic) {
      if (effectiveId) {
        return link.href.replace(":id", encodeURIComponent(String(effectiveId)));
      }
      // If no ID, strip the /:id and go to root
      return link.href.replace("/:id", "");
    }

    // Case 2: Static Route (Downloads/Vendors)
    // We must append ?id=123 so the next app knows who we are
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

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
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

// 2. Export the Wrapped Component
// We wrap in Suspense because useSearchParams() causes build warnings if not suspended.
export default function FleetNavbar(props: { manualId?: string }) {
  return (
    <Suspense fallback={<div className="h-14 bg-slate-900" />}>
      <NavbarContent {...props} />
    </Suspense>
  );
}