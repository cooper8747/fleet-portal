"use client";
import DarkModeToggle from "../components/DarkModeToggle";
import { apps } from "../../apps";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const params = useParams();
  const searchParams = useSearchParams();
  const paramContactID = params?.contactID as string | undefined;
  const queryContactID = searchParams.get("contactID");
  const contactID = paramContactID || queryContactID;
  const [firstName, setFirstName] = useState<string | null>(null);
  const [accountID, setAccountID] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData(contactID: string) {
      try {
        const res = await fetch("/api/report");
        if (!res.ok) return;
        const data = await res.json();
        const colOrder = data.response?.result?.column_order || [];
        const idxContactID = colOrder.indexOf("ContactID");
        const idxFirstName = colOrder.indexOf("FirstName");
        const idxAccountID = colOrder.indexOf("AccountID");
        if (idxContactID === -1 || idxFirstName === -1 || idxAccountID === -1) return;
        const row = data.response?.result?.rows?.find((r: any[]) => r[idxContactID] === contactID);
        if (row) {
          setFirstName(row[idxFirstName]);
          setAccountID(row[idxAccountID]);
        }
      } catch {}
    }
    if (contactID) fetchData(contactID);
  }, [contactID]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10172a] via-[#253661] to-[#233e57] text-gray-900 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-8 px-2 text-center">
        {firstName && (
          <div className="text-lg font-semibold text-white mb-2 drop-shadow-sm">Welcome {firstName}</div>
        )}
        <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100/90 mb-2 drop-shadow">
          Select a tool to get started
        </h2>
        <p className="text-zinc-300 text-sm mb-2 max-w-xl">
          One dashboard to access all your fleet utilities.
        </p>
      </section>

      {/* App Grid */}
      <main className="flex-1 w-full px-4 pb-10">
        <div className="grid grid-cols-1 xxs:grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.name}
                className="group bg-white/80 dark:bg-slate-800/80 shadow-xl rounded-xl p-6 flex flex-col items-center transition-all hover:-translate-y-1 hover:shadow-2xl border border-slate-200/30 dark:border-slate-700/60 backdrop-blur-lg"
              >
                <div className="mb-4">
                  <Icon size={48} className="drop-shadow-md text-sky-800 dark:text-sky-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-1 text-center">
                  {app.name}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-7 text-left w-full">
                  {app.description}
                </p>
                <a
                  href={
                    app.name === 'Vessel Activity' && accountID
                      ? app.link.replace(':id', accountID)
                      : app.name === 'Member Activity' && contactID
                      ? app.link.replace(':id', contactID)
                      : app.link
                  }
                  className="w-full inline-block px-4 py-2 rounded-md text-base bg-blue-600 hover:bg-sky-700 text-white font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 shadow-lg group-hover:scale-[1.03] text-center"
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
