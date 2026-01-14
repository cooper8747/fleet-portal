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

// --- 1. HARDCODED CONFIGURATION (Source of Truth) ---
const isDev = process.env.NODE_ENV === "development";

const URLS = {
  portal: isDev ? "http://localhost:3000" : "https://fleet-portal.vercel.app",
  vessel: isDev ? "http://localhost:3001" : "https://v0-cruising-fleet-member-activity.vercel.app",
  member: isDev ? "http://localhost:3002" : "https://fleet-member-activity.vercel.app",
  vendors: isDev ? "http://localhost:3003" : "https://fleet-vendors.vercel.app",
  downloads: isDev ? "http://localhost:3004" : "https://fleet-downloads.vercel.app",
};

// --- 2. TYPES ---
type AppType = "portal" | "vessel" | "member" | "vendors" | "downloads";

type FleetNavbarProps = {
  currentApp?: AppType; // Optional: We will auto-detect if missing
};

// --- 3. HELPER: Auto-Detect App (Backup Logic) ---
const detectApp = (path: string): AppType => {
  if (typeof window === "undefined") return "portal";
  const host = window.location.hostname;
  
  if (host.includes("fleet-portal") || path.includes(":3000")) return "portal";
  if (host.includes("v0-cruising") || path.includes(":3001")) return "vessel";
  if (host.includes("member-activity") || path.includes(":3002")) return "member";
  if (host.includes("vendors") || path.includes(":3003")) return "vendors";
  if (host.includes("downloads") || path.includes(":3004")) return "downloads";
  
  return "portal"; // Fallback
};

function NavbarContent({ currentApp }: FleetNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ids, setIds] = useState({ contactId: "", accountId: "" });
  
  // We use raw window.location to be absolutely sure of what the user sees
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- 4. THE BRAIN: Unbreakable ID Resolver ---
  useEffect(() => {
    // 1. Identify where we are
    const app = currentApp || detectApp(window.location.href);
    
    // 2. Grab potential IDs
    const queryContact = searchParams.get("contactId");
    const queryAccount = searchParams.get("accountId");
    const pathId = pathname?.split("/").find((seg) => /^\d{10,}$/.test(seg)); // Finds 7039...
    
    // 3. Load Memory
    const storageContact = localStorage.getItem("fleet_contact_id");
    const storageAccount = localStorage.getItem("fleet_account_id");

    let finalContactId = "";
    let finalAccountId = "";

    // --- STRICT LOGIC PER APP ---
    
    if (app === "vessel") {
      // VESSEL APP RULES: 
      // Path = AccountID. Query = ContactID.
      if (pathId) finalAccountId = pathId;
      else finalAccountId = queryAccount || storageAccount || "";

      // CRITICAL FIX: If on Vessel, the Path ID is NOT a Contact ID. Ignore it for contact.
      finalContactId = queryContact || storageContact || "";
      
      // Poison Check: If our "Contact ID" matches the Vessel Account ID, it's wrong. Wipe it.
      if (finalContactId === finalAccountId) {
        console.warn("Poisoned ID detected. Cleaning...");
        finalContactId = ""; 
      }
    } 
    
    else if (app === "portal" || app === "member") {
      // PORTAL/MEMBER RULES:
      // Path = ContactID. Query = AccountID.
      if (pathId) finalContactId = pathId;
      else finalContactId = queryContact || storageContact || "";

      finalAccountId = queryAccount || storageAccount || "";
    } 
    
    else {
      // STATIC APPS (Vendors/Downloads):
      // Trust the Backpack (Query) first, then Memory.
      finalContactId = queryContact || storageContact || "";
      finalAccountId = queryAccount || storageAccount || "";
    }

    // 4. Update State & Memory
    if (finalContactId) localStorage.setItem("fleet_contact_id", finalContactId);
    if (finalAccountId) localStorage.setItem("fleet_account_id", finalAccountId);

    setIds({ contactId: finalContactId, accountId: finalAccountId });

  }, [pathname, searchParams, currentApp]);


  // --- 5. LINK BUILDER ---
  const getLink = (target: AppType) => {
    const base = URLS[target];
    const { contactId, accountId } = ids;
    const q = new URLSearchParams();

    // Always pack the backpack
    if (contactId) q.set("contactId", contactId);
    if (accountId) q.set("accountId", accountId);

    switch (target) {
      case "portal":
      case "member":
        // Target expects ContactID in path
        if (contactId) {
          q.delete("contactId"); // Remove from query since it's in path
          return `${base}/${contactId}?${q.toString()}`;
        }
        return `${base}?${q.toString()}`;

      case "vessel":
        // Target expects AccountID in path
        if (accountId) {
          q.delete("accountId"); // Remove from query since it's in path
          return `${base}/${accountId}?${q.toString()}`;
        }
        return `${base}?${q.toString()}`;

      default:
        // Vendors/Downloads (Static)
        return `${base}?${q.toString()}`;
    }
  };

  const links = [
    { name: "Fleet Portal", href: getLink("portal"), icon: <Home size={18} /> },
    { name: "Vessel Activity", href: getLink("vessel"), icon: <Ship size={18} /> },
    { name: "Member Activity", href: getLink("member"), icon: <Users size={18} /> },
    { name: "Vendor Directory", href: getLink("vendors"), icon: <BookOpen size={18} /> },
    { name: "Downloads", href: getLink("downloads"), icon: <Download size={18} /> },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between bg-slate-900 text-white px-4 shadow-md font-sans">
        <Link href={getLink("portal")} className="flex items-center gap-2 hover:text-sky-400 transition-colors">
          <Home size={24} strokeWidth={2.2} aria-label="Portal Home" />
        </Link>
        <button
          className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-400"
          onClick={() => setIsOpen((v) => !v)}
        >
          <Menu size={28} />
        </button>
      </nav>

      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-slate-800 shadow-xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col pt-7`}
      >
        <button
          className="absolute top-4 right-4 p-1 text-zinc-200 hover:text-white"
          onClick={() => setIsOpen(false)}
        >
          <X size={24} />
        </button>
        <ul className="mt-6 space-y-2 px-5">
          {links.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
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

// 6. EXPORT
export default function FleetNavbar(props: FleetNavbarProps) {
  return (
    <Suspense fallback={<div className="h-14 bg-slate-900" />}>
      <NavbarContent {...props} />
    </Suspense>
  );
}