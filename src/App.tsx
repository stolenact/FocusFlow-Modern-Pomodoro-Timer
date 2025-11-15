import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { Stats } from "./components/Stats";
import { Settings } from "./components/Settings";
import { useState } from "react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"timer" | "stats" | "settings">("timer");
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-red-200 dark:border-red-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍅</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              FocusFlow
            </h1>
          </div>
          
          <Authenticated>
            <div className="flex items-center gap-4">
              <nav className="flex gap-1">
                <button
                  onClick={() => setActiveTab("timer")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "timer"
                      ? "bg-red-500 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                  }`}
                >
                  Timer
                </button>
                <button
                  onClick={() => setActiveTab("stats")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "stats"
                      ? "bg-red-500 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                  }`}
                >
                  Stats
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === "settings"
                      ? "bg-red-500 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                  }`}
                >
                  Settings
                </button>
              </nav>
              <SignOutButton />
            </div>
          </Authenticated>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <Content activeTab={activeTab} />
      </main>
      
      <Toaster />
    </div>
  );
}

function Content({ activeTab }: { activeTab: "timer" | "stats" | "settings" }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Unauthenticated>
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <span className="text-white text-4xl">🍅</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              FocusFlow
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              Boost your productivity with the Pomodoro Technique. Focus better, work smarter.
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {loggedInUser?.name || loggedInUser?.email?.split('@')[0] || "Focuser"}! 🎯
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Ready to boost your productivity?
            </p>
          </div>

          {activeTab === "timer" && <PomodoroTimer />}
          {activeTab === "stats" && <Stats />}
          {activeTab === "settings" && <Settings />}
        </div>
      </Authenticated>
    </div>
  );
}
