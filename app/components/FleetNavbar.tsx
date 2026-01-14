"use client";
import { useState, Suspense } from "react";
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

// We define not just the URL, but which ID type that app expects in the main path
const APPS = {
  portal: {
    prod: "https://fleet-portal.vercel.app",
    dev: "http://localhost:3000",
    idType: "contact", // Portal routes are /:contactId
  },
  vessel: {
    prod: "https://v0-cruising-fleet-member-activity.vercel.app",
    dev: "http://localhost:3001",
    idType: "account", // Vessel routes are /:accountId
  },
  member: {
    prod: "https://cruisingfleet.vercel.app",
    dev: "http://localhost:3002",
    idType: "contact", // Member routes are /:contactId
  },
  vendors: {
    prod: "https://fleet-vendors.vercel.app",
    dev: "http://localhost:3003",
    idType: "none",
  },
  downloads: {
    prod: "https://fleet-downloads.vercel.app",
    dev: "http://localhost:3004",
    idType: "none",
  },
};

const getBaseUrl = (appKey: keyof typeof APPS) => {
  return isDev ? APPS[appKey].dev : APPS[appKey].prod;
};

// Identify which app we are currently inside based on the hostname/port
const getCurrentAppType = (hostname: string, port: string) => {
  if (isDev) {
    if (port === "3000") return "portal";
    if (port === "3001") return "vessel";
    if (port === "3002") return "member";
    if (port === "3003") return "vendors";
    if (port === "3004") return "downloads";
  } else {
    // Basic domain matching for production
    if (hostname.includes("fleet-portal")) return "portal";
    if (hostname.includes("member-activity")) return "vessel";
    if (hostname.includes("cruisingfleet")) return "member";
    if (hostname.includes("fleet-vendors")) return "vendors";
    if (hostname.includes("fleet-downloads")) return "downloads";
  }
  return "portal"; // Default fallback
};

const navLinks = [
  { name: "Fleet Portal", key: "portal", icon: <Home size={18} /> },
  { name: "Vessel Activity", key: "vessel", icon: <Ship size={18} /> },
  { name: "Member Activity", key: "member", icon: <Users size={18} /> },
  { name: "Vendor Directory", key: "vendors", icon: <BookOpen size={18} /> },
  { name: "Downloads", key: "downloads", icon: <Download size={18} /> },
];

function NavbarContent() {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 1. DETERMINE CURRENT STATE
  // We need to know: "What IDs do I have right now?"
  let currentContactId = searchParams.get("contactId");
  let currentAccountId = searchParams.get("accountId");

  // Brute Force: Find any long number in the path
  const pathId = pathname?.split("/").find((segment) => /^\d{10,}$/.test(segment));

  if (pathId) {
    // We found an ID in the path! But is it a Contact or Account ID?
    // We check which app we are running to decide.
    const port = typeof window !== "undefined" ? window.location.port : "";
    const hostname = typeof window !== "undefined" ? window.location.hostname : "";
    const currentApp = getCurrentAppType(hostname, port);
    const idType = APPS[currentApp as keyof typeof APPS].idType;

    if (idType === "contact") currentContactId = pathId;
    if (idType === "account") currentAccountId = pathId;
  }

  // Fallback: If we are missing an ID, check LocalStorage (The "Memory")
  if (typeof window !== "undefined") {
    if (!currentContactId) currentContactId = localStorage.getItem("fleet_contact_id");
    if (!currentAccountId) currentAccountId = localStorage.getItem("fleet_account_id");
    
    // Save whatever we found back to memory so it sticks
    if (currentContactId) localStorage.setItem("fleet_contact_id", currentContactId);
    if (currentAccountId) localStorage.setItem("fleet_account_id", currentAccountId);
  }

  // 2. BUILD THE LINKS
  const resolveHref = (appKey: string) => {
    const config = APPS[appKey as keyof typeof APPS];
    const baseUrl = getBaseUrl(appKey as keyof typeof APPS);

    // Build the "Backpack" (Query Params)
    const params = new URLSearchParams();
    if (currentContactId) params.set("contactId", currentContactId);
    if (currentAccountId) params.set("accountId", currentAccountId);

    // --- STRICT LINK BUILDING ---
    
    // CASE 1: Portal or Member App (MUST use ContactID in path)
    if (config.idType === "contact") {
      if (currentContactId) {
        params.delete("contactId"); // It's in the path, remove from query
        return `${baseUrl}/${currentContactId}?${params.toString()}`;
      }
      // If we DON'T have a ContactID, we cannot send them to /:id.
      // We send them to root, but keep the backpack in case the app can recover.
      return `${baseUrl}?${params.toString()}`;
    } 
    
    // CASE 2: Vessel App (MUST use AccountID in path)
    else if (config.idType === "account") {
      if (currentAccountId) {
        params.delete("accountId"); // It's in the path, remove from query
        return `${baseUrl}/${currentAccountId}?${params.toString()}`;
      }
      // If we don't have AccountID, send to root. 
      // The Vessel App's page.tsx logic will see the contactId in the query and redirect!
      return `${baseUrl}?${params.toString()}`; 
    } 
    
    // CASE 3: Static Apps (Vendors/Downloads)
    else {
      return `${baseUrl}?${params.toString()}`;
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between bg-slate-900 text-white px-4 shadow-md font-sans">
        <Link
          href={resolveHref("portal")}
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

      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

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
            <li key={link.key}>
              <Link
                href={resolveHref(link.key)}
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

export default function FleetNavbar() {
  return (
    <Suspense fallback={<div className="h-14 bg-slate-900" />}>
      <NavbarContent />
    </Suspense>
  );
}