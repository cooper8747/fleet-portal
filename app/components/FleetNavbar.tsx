"use client";
import { useState, useEffect } from "react";
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

const APPS = {
  portal: {
    prod: "https://fleet-portal.vercel.app", // ✅ Updated Production URL
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
    type: "contactID" 
  },
  {
    name: "Vessel Activity",
    href: `${getBaseUrl("vessel")}/:id`,
    icon: <Ship size={18} />,
    type: "accountID"
  },
  {
    name: "Member Activity",
    href: `${getBaseUrl("member")}/:id`,
    icon: <Users size={18} />,
    type: "contactID"
  },
  {
    name: "Vendor Directory",
    href: getBaseUrl("vendors"),
    icon: <BookOpen size={18} />, 
    type: null
  },
  {
    name: "Downloads",
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
  const [storedId, setStoredId] = useState<string | null>(null);
  const params = useParams();

  // 1. Detect ID from URL
  const candidates = ["contactID", "accountID", "id", "slug"];
  const urlId =
    manualId ||
    candidates.map((key) => params?.[key]).find((val) => typeof val === "string" && val);

  // 2. "Sticky ID" Logic: Save ID if found, Restore if missing
  useEffect(() => {
    if (urlId) {
      // If we have an ID in the URL, save it to memory
      localStorage.setItem("fleet_latest_id", String(urlId));
      setStoredId(String(urlId));
    } else {
      // If no ID in URL (e.g. Downloads app), try to retrieve from memory
      const saved = localStorage.getItem("fleet_latest_id");
      if (saved) setStoredId(saved);
    }
  }, [urlId]);

  // Use the ID from the URL first, fallback to the stored memory ID
  const effectiveId = urlId || storedId;

  // 3. Resolve Link Logic
  const resolveHref = (link: typeof navLinks[0]) => {
    // If static link (no :id placeholder), return as is
    if (!link.href.includes(":id")) return link.href;

    // If we have an ID (from URL or Memory), inject it
    if (effectiveId) {
      return link.href.replace(":id", encodeURIComponent(String(effectiveId)));
    }

    // Fallback: If absolutely no ID is found anywhere, go to root
    try {
      const cleanUrl = link.href.replace("/:id", "");
      return cleanUrl; 
    } catch {
      return "/";
    }
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