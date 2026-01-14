import { apps } from "../apps";
import { Suspense } from "react";
// We don't need "use client" for the main logic if this is a server component, 
// but since you had it, we'll keep it to avoid breaking your DarkModeToggle.
"use client"; 

import DarkModeToggle from "./components/DarkModeToggle";

// --- URL CONFIGURATION (Matches Navbar) ---
const isDev = process.env.NODE_ENV === "development";

const APP_URLS = {
  // Use the keys that match your apps.ts 'name' or logic if possible.
  // I will map them by checking the app name string.
  portal: { prod: "https://fleet-portal.vercel.app", dev: "http://localhost:3000" },
  vessel: { prod: "https://v0-cruising-fleet-member-activity.vercel.app", dev: "http://localhost:3001" },
  member: { prod: "https://cruisingfleet.vercel.app", dev: "http://localhost:3002" },
  vendors: { prod: "https://fleet-vendors.vercel.app", dev: "http://localhost:3003" },
  downloads: { prod: "https://fleet-downloads.vercel.app", dev: "http://localhost:3004" },
};

const getBaseUrl = (key: keyof typeof APP_URLS) => isDev ? APP_URLS[key].dev : APP_URLS[key].prod;

type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function Home({ params, searchParams }: PageProps) {
  // 1. CAPTURE THE IDs
  // The Portal URL is like .../portal/703911... -> params.id is the ContactID
  const contactId = params?.id;
  
  // Check the backpack for an AccountID
  const accountId = searchParams?.accountId as string;

  // 2. LINK GENERATOR LOGIC
  const getSmartLink = (appName: string) => {
    // Standardize name to match our config keys
    const name = appName.toLowerCase();
    
    // Construct the query string (The Backpack)
    const query = new URLSearchParams();
    if (contactId) query.set("contactId", contactId);
    if (accountId) query.set("accountId", accountId);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    // A. MEMBER ACTIVITY (Contact Based)
    if (name.includes("member")) {
      const base = getBaseUrl("member");
      // Member app takes ContactID in path
      return contactId ? `${base}/${contactId}${queryString}` : `${base}${queryString}`;
    }

    // B. VESSEL ACTIVITY (Account Based)
    if (name.includes("vessel")) {
      const base = getBaseUrl("vessel");
      // Vessel app takes AccountID in path.
      // If we HAVE an accountID, put it in the path.
      if (accountId) {
        // Remove accountId from query since it's in the path now
        query.delete("accountId");
        return `${base}/${accountId}?${query.toString()}`;
      }
      // If we DON'T have AccountID, we send them to the root with the ContactID in the backpack.
      // The Vessel App MUST look it up.
      return `${base}${queryString}`;
    }

    // C. VENDORS & DOWNLOADS (Static)
    if (name.includes("vendor")) return `${getBaseUrl("vendors")}${queryString}`;
    if (name.includes("download")) return `${getBaseUrl("downloads")}${queryString}`;

    // Default fallback
    return "#";
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#10172a] via-[#253661] to-[#233e57] text-gray-900 dark:text-zinc-100 flex flex-col pt-20">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-2 px-2 text-center shrink-0">
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100/90 mb-2 drop-shadow">
          Select a tool to get started
        </h2>
        <p className="text-zinc-300 text-sm mb-2 max-w-xl">
          One dashboard to access all your fleet utilities.
        </p>
      </section>

      {/* App Grid */}
      <main className="flex-1 w-full px-4 pb-10 mt-4 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto h-full items-stretch">
          {apps.map((app) => {
            const Icon = app.icon;
            // Generate the link dynamically based on the current user's ID
            const smartHref = getSmartLink(app.name);

            return (
              <div
                key={app.name}
                style={{ height: '100%' }}
                className="group bg-white/80 dark:bg-slate-800/80 shadow-xl rounded-xl p-6 flex flex-col items-center border border-slate-200/30 dark:border-slate-700/60 backdrop-blur-lg transition-transform hover:scale-[1.01]"
              >
                <div className="mb-4">
                  <Icon
                    size={48}
                    className="drop-shadow-md text-sky-800 dark:text-sky-300"
                  />
                </div>
                
                <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2 text-center">
                  {app.name}
                </h3>
                
                <p 
                  style={{ textAlign: 'center' }}
                  className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 w-full"
                >
                  {app.description}
                </p>

                <div className="flex-1 w-full" />

                {/* UPDATED LINK: Uses smartHref instead of app.link */}
                <a
                  href={smartHref}
                  className="w-full inline-block px-4 py-2 rounded-md text-base bg-blue-600 hover:bg-sky-700 text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg hover:shadow-xl text-center"
                >
                  Open Tool
                </a>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}