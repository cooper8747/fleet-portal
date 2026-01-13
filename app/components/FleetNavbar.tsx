"use client";
import { useState } from "react";
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
import { useParams } from "next/navigation";

// --- SMART URL CONFIGURATION ---
const isDev = process.env.NODE_ENV === "development";

// Define URLs for both environments
// These dev ports match the plan: Portal(3000), Vessel(3001), Member(3002), Vendors(3003), Downloads(3004)
const APPS = {
  portal: {
    prod: "https://your-portal-url.com", // UPDATE THIS when you know your real Portal URL
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

// Helper function to get the current environment's URL
const getBaseUrl = (appKey: keyof typeof APPS) => {
  return isDev ? APPS[appKey].dev : APPS[appKey].prod;
};

// --- NAVIGATION CONFIG ---
const navLinks = [
  {
    name: "Fleet Portal",
    // Uses contactID if available
    href: `${getBaseUrl("portal")}/:id`,
    icon: <Home size={18} />, 
    type: "contactID" 
  },
  {
    name: "Vessel Activity",
    // Uses accountID
    href: `${getBaseUrl("vessel")}/:id`,
    icon: <Ship size={18} />,
    type: "accountID"
  },
  {
    name: "Member Activity",
    // Uses contactID
    href: `${getBaseUrl("member")}/:id`,
    icon: <Users size={18} />,
    type: "contactID"
  },
  {
    name: "Vendor Directory",
    // Static link (no ID needed)
    href: getBaseUrl("vendors"),
    icon: <BookOpen size={18} />, 
    type: null
  },
  {
    name: "Downloads",
    // Static link (no ID needed)
    href: getBaseUrl("downloads"),
    icon: <Download size={18} />, 
    type: null
  },
];

type FleetNavbarProps = {
  manualId?: string;
};

export default function FleetNavbar({ manualId }: FleetNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();

  // 1. Detect any ID present in the current URL
  const candidates = ["contactID", "accountID", "id", "slug"];
  const detectedId =
    manualId ||
    candidates.map((key) => params?.[key]).find((val) => typeof val === "string" && val);

  // 2. Resolve the final link
  const resolveHref = (link: typeof navLinks[0]) => {
    // If static link (no :id placeholder), return as is
    if (!link.href.includes(":id")) return link.href;

    // If we have an ID, inject it
    if (detectedId) {
      return link.href.replace(":id", encodeURIComponent(String(detectedId)));
    }

    // Fallback: If no ID is found, strip the placeholder and go to the app root
    try {
      const cleanUrl = link.href.replace("/:id", "");
      return cleanUrl; 
    } catch {
      return "/";
    }
  };

  return (
    <>
      {/* Fixed top navbar */}
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

      {/* Slide-out drawer overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      {/* Slide-out drawer */}
      <div
        className={
          `fixed top-0 right-0 h-full w-64 bg-slate-800 shadow-xl z-50 transition-transform duration-300 ` +
          (isOpen ? "translate-x-0" : "translate-x-full") +
          " flex flex-col pt-7"
        }
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
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