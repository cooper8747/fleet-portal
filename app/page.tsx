import DarkModeToggle from "./components/DarkModeToggle";
import { apps } from "../apps";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#10172a] via-[#253661] to-[#233e57] text-gray-900 dark:text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center p-6 border-b border-slate-800/60 dark:border-slate-700 bg-transparent backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 drop-shadow-xl">Fleet Management Suite</h1>
        <DarkModeToggle />
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-8 px-2 text-center">
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
                  href={app.link}
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
