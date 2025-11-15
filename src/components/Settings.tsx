import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function Settings() {
  const settings = useQuery(api.pomodoro.getUserSettings);
  const updateSettings = useMutation(api.pomodoro.updateSettings);

  const [formData, setFormData] = useState<{
    workDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    theme: "light" | "dark";
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    dailyGoal: number;
  }>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    notificationsEnabled: true,
    theme: "dark",
    autoStartBreaks: false,
    autoStartPomodoros: false,
    dailyGoal: 8,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        workDuration: settings.workDuration,
        shortBreakDuration: settings.shortBreakDuration,
        longBreakDuration: settings.longBreakDuration,
        sessionsUntilLongBreak: settings.sessionsUntilLongBreak,
        soundEnabled: settings.soundEnabled,
        notificationsEnabled: settings.notificationsEnabled,
        theme: settings.theme,
        autoStartBreaks: settings.autoStartBreaks,
        autoStartPomodoros: settings.autoStartPomodoros,
        dailyGoal: settings.dailyGoal,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateSettings(formData);
      
      // Apply theme immediately
      if (formData.theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      toast.success("Settings saved successfully! 🎉");
    } catch (error) {
      toast.error("Failed to save settings. Please try again.");
      console.error("Settings update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'focusflow-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success("Settings exported successfully! 📁");
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setFormData(importedSettings);
        toast.success("Settings imported successfully! 📥");
      } catch (error) {
        toast.error("Invalid settings file. Please try again.");
      }
    };
    reader.readAsText(file);
  };

  if (!settings) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">⚙️</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your Pomodoro experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Timer Durations */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              Timer Durations
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Work Session (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.workDuration}
                  onChange={(e) => handleInputChange("workDuration", parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.shortBreakDuration}
                  onChange={(e) => handleInputChange("shortBreakDuration", parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.longBreakDuration}
                  onChange={(e) => handleInputChange("longBreakDuration", parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sessions until long break
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={formData.sessionsUntilLongBreak}
                  onChange={(e) => handleInputChange("sessionsUntilLongBreak", parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Daily Goal (sessions)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.dailyGoal}
                  onChange={(e) => handleInputChange("dailyGoal", parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Automation */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Automation
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏯️</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Auto-start Breaks</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Automatically start break timers</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoStartBreaks}
                    onChange={(e) => handleInputChange("autoStartBreaks", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Auto-start Work Sessions</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Automatically start work timers after breaks</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoStartPomodoros}
                    onChange={(e) => handleInputChange("autoStartPomodoros", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🔔</span>
              Notifications
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔊</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Sound Notifications</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Play sound when timer completes</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.soundEnabled}
                    onChange={(e) => handleInputChange("soundEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Browser Notifications</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Show desktop notifications</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.notificationsEnabled}
                    onChange={(e) => handleInputChange("notificationsEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              Appearance
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange("theme", "light")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.theme === "light"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-red-300"
                }`}
              >
                <div className="text-2xl mb-2">☀️</div>
                <div className="font-medium text-gray-900 dark:text-white">Light Theme</div>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange("theme", "dark")}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.theme === "dark"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-red-300"
                }`}
              >
                <div className="text-2xl mb-2">🌙</div>
                <div className="font-medium text-gray-900 dark:text-white">Dark Theme</div>
              </button>
            </div>
          </div>

          {/* Import/Export */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">📁</span>
              Backup & Restore
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={exportSettings}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="text-xl">📤</span>
                Export Settings
              </button>

              <label className="px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                <span className="text-xl">📥</span>
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <span className="text-xl">💾</span>
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <span className="text-xl">💡</span>
          Pro Tips
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
          <li>• Standard Pomodoro: 25min work, 5min break, 15min long break</li>
          <li>• Enable notifications for better focus tracking</li>
          <li>• Use auto-start features to maintain flow</li>
          <li>• Set realistic daily goals to build consistency</li>
          <li>• Export your settings to backup your preferences</li>
        </ul>
      </div>
    </div>
  );
}
