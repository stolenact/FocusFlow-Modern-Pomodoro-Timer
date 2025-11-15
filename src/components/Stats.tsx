import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Stats() {
  const todayStats = useQuery(api.pomodoro.getTodayStats);
  const weeklyStats = useQuery(api.pomodoro.getWeeklyStats);
  const achievements = useQuery(api.pomodoro.getAchievements);

  if (!todayStats || !weeklyStats) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const maxSessions = Math.max(...weeklyStats.map(day => day.sessions), 1);

  return (
    <div className="space-y-8">
      {/* Today's Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Today's Progress 📊
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Daily Goal Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Goal Progress</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {todayStats.workSessions}/{todayStats.dailyGoal} sessions
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-500 to-orange-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${todayStats.goalProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {todayStats.goalProgress.toFixed(0)}% complete
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-6 text-center border border-red-200 dark:border-red-800">
            <div className="text-4xl mb-2">🍅</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {todayStats.workSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Work Sessions
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-2xl p-6 text-center border border-green-200 dark:border-green-800">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatMinutes(todayStats.totalMinutes)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Total Time
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 text-center border border-blue-200 dark:border-blue-800">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {todayStats.totalSessions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Total Sessions
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 text-center border border-yellow-200 dark:border-yellow-800">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {achievements?.length || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Achievements
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Weekly Overview 📈
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Your productivity journey over the past 7 days
          </p>
        </div>

        <div className="space-y-6">
          {/* Chart */}
          <div className="flex items-end justify-between gap-2 h-48 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900/50 rounded-2xl p-4">
            {weeklyStats.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-red-500 to-orange-500 rounded-t-lg min-h-[4px] transition-all duration-500 hover:from-red-400 hover:to-orange-400 relative group"
                    style={{
                      height: `${(day.sessions / maxSessions) * 100}%`,
                    }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.sessions} sessions<br />
                      {formatMinutes(day.minutes)}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {day.sessions}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getDayName(day.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {weeklyStats.reduce((sum, day) => sum + day.sessions, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Sessions
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatMinutes(weeklyStats.reduce((sum, day) => sum + day.minutes, 0))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Time
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(weeklyStats.reduce((sum, day) => sum + day.sessions, 0) / 7)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Daily Average
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {weeklyStats.filter(day => day.sessions > 0).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Active Days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Achievements 🏆
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your productivity milestones
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement._id}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6 border border-yellow-200 dark:border-yellow-800 text-center"
              >
                <div className="text-4xl mb-3">{achievement.icon}</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {achievement.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-8 text-center text-white shadow-2xl">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-2xl font-bold mb-2">Keep Going!</h3>
        <p className="text-red-100">
          {todayStats.workSessions === 0 
            ? "Start your first session today and build momentum!"
            : todayStats.workSessions < 4
            ? "You're off to a great start! Keep the focus flowing."
            : todayStats.workSessions < 8
            ? "Excellent progress! You're in the zone today."
            : "Incredible dedication! You're a productivity champion! 🏆"
          }
        </p>
        {todayStats.goalProgress >= 100 && (
          <div className="mt-4 p-4 bg-white/20 rounded-xl">
            <p className="font-semibold">🎉 Daily goal achieved! Amazing work!</p>
          </div>
        )}
      </div>
    </div>
  );
}
