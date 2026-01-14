"use client";
import { useState, Suspense, useEffect } from "react";
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
    idType: "contact",
  },
  vessel: {
    prod: "https://v0-cruising-fleet-member-activity.vercel.app",
    dev: "http://localhost:3001",
    idType: "account",
  },
  member: {
    prod: "https://fleet-member-activity.vercel.app",
    dev: "http://localhost:3002",
    idType: "contact",
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

const navLinks = [
  { name: "Fleet Portal", key: "portal", icon: <Home size={18} /> },
  { name: "Vessel Activity", key: "vessel", icon: <Ship size={18} /> },
  { name: "Member Activity", key: "member", icon: <Users size={18} /> },
  { name: "Vendor Directory", key: "vendors", icon: <BookOpen size={18} /> },
  { name: "Downloads", key: "downloads", icon: <Download size={18} /> },
];

type FleetNavbarProps = {
  currentApp: "portal" | "vessel" | "member" | "vendors" | "downloads";
};

function NavbarContent({ currentApp }: FleetNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // 1. DETERMINE CURRENT STATE
  let currentContactId = searchParams.get("contactId");
  let currentAccountId = searchParams.get("accountId");

  // Get ID from path
  const pathId = pathname?.split("/").find((segment) => /^\d{10,}$/.test(segment));

  if (pathId) {
    const idType = APPS[currentApp].idType;
    if (idType === "contact") currentContactId = pathId;
    if (idType === "account") currentAccountId = pathId;
  }

  // --- SELF-HEALING & MEMORY LOGIC ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    // A. Sanity Check: If on Vessel App, the path ID is an AccountID. 
    // If our stored "ContactID" matches this AccountID, it's POISON. Delete it.
    if (currentApp === "vessel" && pathId) {
        const storedContact = localStorage.getItem("fleet_contact_id");
        if (storedContact === pathId) {
            console.log("⚠️ Detected Poisoned Memory! Clearing invalid Contact ID.");
            localStorage.removeItem("fleet_contact_id");
        }
    }

    // B. Save Valid IDs to Memory
    if (currentContactId) localStorage.setItem("fleet_contact_id", currentContactId);
    if (currentAccountId) localStorage.setItem("fleet_account_id", currentAccountId);

  }, [currentContactId, currentAccountId, currentApp, pathId]);

  // C. Load from Memory (Only if we don't have one yet)
  if (typeof window !== "undefined") {
    if (!currentContactId) currentContactId = localStorage.getItem("fleet_contact_id");
    if (!currentAccountId) currentAccountId = localStorage.getItem("fleet_account_id");
  }

  // 2. BUILD THE LINKS
  const resolveHref = (targetAppKey: string) => {
    const config = APPS[targetAppKey as keyof typeof APPS];
    const baseUrl = getBaseUrl(targetAppKey as keyof typeof APPS);

    const params = new URLSearchParams();
    if (currentContactId) params.set("contactId", currentContactId);
    if (currentAccountId) params.set("accountId", currentAccountId);

    if (config.idType === "contact") {
      if (currentContactId) {
        params.delete("contactId");
        return `${baseUrl}/${currentContactId}?${params.toString()}`;
      }
      return `${baseUrl}?${params.toString()}`;
    } else if (config.idType === "account") {
      if (currentAccountId) {
        params.delete("accountId");
        return `${baseUrl}/${currentAccountId}?${params.toString()}`;
      }
      return `${baseUrl}?${params.toString()}`;
    } else {
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

      {/* Drawer Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Drawer Content */}
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

export default function FleetNavbar(props: FleetNavbarProps) {
  return (
    <Suspense fallback={<div className="h-14 bg-slate-900" />}>
      <NavbarContent {...props} />
    </Suspense>
  );
}