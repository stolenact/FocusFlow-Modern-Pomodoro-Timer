import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

type TimerState = "idle" | "running" | "paused";
type SessionType = "work" | "break" | "longBreak";

export function PomodoroTimer() {
  const settings = useQuery(api.pomodoro.getUserSettings);
  const saveSession = useMutation(api.pomodoro.saveSession);
  const tasks = useQuery(api.pomodoro.getTasks, { completed: false });
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [currentSession, setCurrentSession] = useState<SessionType>("work");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalDuration, setTotalDuration] = useState(25 * 60);
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio with better sound
  useEffect(() => {
    if (audioRef.current) {
      // Create a more pleasant notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }, []);

  useEffect(() => {
    if (settings) {
      const duration = currentSession === "work" 
        ? settings.workDuration * 60
        : currentSession === "break"
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60;
      
      if (timerState === "idle") {
        setTimeLeft(duration);
        setTotalDuration(duration);
      }
    }
  }, [settings, currentSession, timerState]);

  useEffect(() => {
    if (timerState === "running") {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState]);

  // Update document title with timer
  useEffect(() => {
    if (timerState === "running") {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      document.title = `${timeString} - ${getSessionInfo().title} | FocusFlow`;
    } else {
      document.title = "FocusFlow - Pomodoro Timer";
    }
  }, [timeLeft, timerState, currentSession]);

  const playNotificationSound = () => {
    if (settings?.soundEnabled) {
      // Create a pleasant notification sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Create a pleasant chime sound
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  };

  const handleTimerComplete = async () => {
    setTimerState("idle");
    
    // Play notification sound
    playNotificationSound();

    // Show notification
    if (settings?.notificationsEnabled && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(
          currentSession === "work" ? "Work session complete!" : "Break time over!",
          {
            body: currentSession === "work" 
              ? "Time for a break! 🎉" 
              : "Ready to get back to work? 💪",
            icon: "/favicon.ico",
            tag: "pomodoro-timer"
          }
        );
      }
    }

    // Save session to database
    try {
      await saveSession({
        type: currentSession,
        duration: Math.round(totalDuration / 60),
        taskId: currentSession === "work" ? selectedTaskId || undefined : undefined,
      });
    } catch (error) {
      console.error("Failed to save session:", error);
    }

    // Handle session transitions
    if (currentSession === "work") {
      const newCompletedSessions = completedSessions + 1;
      setCompletedSessions(newCompletedSessions);
      
      if (newCompletedSessions % (settings?.sessionsUntilLongBreak || 4) === 0) {
        setCurrentSession("longBreak");
        toast.success("Great work! Time for a long break! 🌟", {
          duration: 5000,
        });
      } else {
        setCurrentSession("break");
        toast.success("Work session complete! Take a short break! ☕", {
          duration: 3000,
        });
      }

      // Auto-start break if enabled
      if (settings?.autoStartBreaks) {
        setTimeout(() => {
          setTimerState("running");
        }, 2000);
      }
    } else {
      setCurrentSession("work");
      toast.success("Break over! Ready to focus again? 🎯", {
        duration: 3000,
      });

      // Auto-start work session if enabled
      if (settings?.autoStartPomodoros) {
        setTimeout(() => {
          setTimerState("running");
        }, 2000);
      }
    }
  };

  const startTimer = () => {
    if (settings?.notificationsEnabled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setTimerState("running");
  };

  const pauseTimer = () => {
    setTimerState("paused");
  };

  const resetTimer = () => {
    setTimerState("idle");
    const duration = currentSession === "work" 
      ? (settings?.workDuration || 25) * 60
      : currentSession === "break"
      ? (settings?.shortBreakDuration || 5) * 60
      : (settings?.longBreakDuration || 15) * 60;
    setTimeLeft(duration);
    setTotalDuration(duration);
  };

  const skipSession = () => {
    handleTimerComplete();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  const getSessionInfo = () => {
    switch (currentSession) {
      case "work":
        return {
          title: "Focus Time",
          emoji: "🎯",
          color: "from-red-500 to-orange-500",
          bgColor: "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
        };
      case "break":
        return {
          title: "Short Break",
          emoji: "☕",
          color: "from-green-500 to-teal-500",
          bgColor: "from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20"
        };
      case "longBreak":
        return {
          title: "Long Break",
          emoji: "🌟",
          color: "from-blue-500 to-purple-500",
          bgColor: "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"
        };
    }
  };

  const sessionInfo = getSessionInfo();

  if (!settings) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Selection */}
      {currentSession === "work" && tasks && tasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Working on
          </h3>
          <select
            value={selectedTaskId || ""}
            onChange={(e) => setSelectedTaskId(e.target.value ? e.target.value as Id<"tasks"> : null)}
            className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
          >
            <option value="">Select a task (optional)</option>
            {tasks.map((task) => (
              <option key={task._id} value={task._id}>
                {task.title} ({task.completedPomodoros}/{task.estimatedPomodoros} 🍅)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Timer */}
      <div className={`bg-gradient-to-br ${sessionInfo.bgColor} rounded-3xl p-8 shadow-2xl border border-white/20`}>
        <audio ref={audioRef} preload="auto" />

        <div className="text-center space-y-8">
          {/* Session Header */}
          <div className="space-y-2">
            <div className="text-6xl animate-pulse-slow">{sessionInfo.emoji}</div>
            <h2 className={`text-3xl font-bold bg-gradient-to-r ${sessionInfo.color} bg-clip-text text-transparent`}>
              {sessionInfo.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Session {completedSessions + 1} • {completedSessions} completed today
            </p>
          </div>

          {/* Timer Display */}
          <div className="relative">
            <div className="w-80 h-80 mx-auto relative">
              {/* Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className="text-red-500" stopColor="currentColor" />
                    <stop offset="100%" className="text-orange-500" stopColor="currentColor" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Timer Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {timerState === "running" ? "Stay focused!" : 
                     timerState === "paused" ? "Paused" : "Ready to start?"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4 flex-wrap">
            {timerState === "idle" && (
              <button
                onClick={startTimer}
                className={`px-8 py-4 bg-gradient-to-r ${sessionInfo.color} text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}
              >
                <span className="text-xl">▶️</span>
                Start {sessionInfo.title}
              </button>
            )}
            
            {timerState === "running" && (
              <button
                onClick={pauseTimer}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-xl">⏸️</span>
                Pause
              </button>
            )}
            
            {timerState === "paused" && (
              <>
                <button
                  onClick={startTimer}
                  className={`px-6 py-4 bg-gradient-to-r ${sessionInfo.color} text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2`}
                >
                  <span className="text-xl">▶️</span>
                  Resume
                </button>
                <button
                  onClick={resetTimer}
                  className="px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="text-xl">🔄</span>
                  Reset
                </button>
              </>
            )}
            
            {(timerState === "running" || timerState === "paused") && (
              <button
                onClick={skipSession}
                className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-xl">⏭️</span>
                Skip
              </button>
            )}
          </div>

          {/* Session Progress */}
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-4">
            <div className="flex justify-center gap-2 mb-2">
              {Array.from({ length: settings.sessionsUntilLongBreak }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    i < completedSessions % settings.sessionsUntilLongBreak
                      ? `bg-gradient-to-r ${sessionInfo.color} shadow-lg`
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {settings.sessionsUntilLongBreak - (completedSessions % settings.sessionsUntilLongBreak)} sessions until long break
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
