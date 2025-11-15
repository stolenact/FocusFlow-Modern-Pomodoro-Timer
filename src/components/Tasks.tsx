import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function Tasks() {
  const activeTasks = useQuery(api.pomodoro.getTasks, { completed: false });
  const completedTasks = useQuery(api.pomodoro.getTasks, { completed: true });
  const createTask = useMutation(api.pomodoro.createTask);
  const updateTask = useMutation(api.pomodoro.updateTask);
  const deleteTask = useMutation(api.pomodoro.deleteTask);

  const [showCompleted, setShowCompleted] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Id<"tasks"> | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedPomodoros: 1,
    priority: "medium" as "low" | "medium" | "high",
    category: "",
    dueDate: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      estimatedPomodoros: 1,
      priority: "medium",
      category: "",
      dueDate: "",
    });
    setEditingTask(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
      };

      if (editingTask) {
        await updateTask({ taskId: editingTask, ...taskData });
        toast.success("Task updated successfully! ✏️");
      } else {
        await createTask(taskData);
        toast.success("Task created successfully! ✨");
      }
      
      resetForm();
    } catch (error) {
      toast.error("Failed to save task. Please try again.");
      console.error("Task save error:", error);
    }
  };

  const handleEdit = (task: any) => {
    setFormData({
      title: task.title,
      description: task.description || "",
      estimatedPomodoros: task.estimatedPomodoros,
      priority: task.priority,
      category: task.category || "",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
    });
    setEditingTask(task._id);
    setShowCreateForm(true);
  };

  const handleToggleComplete = async (taskId: Id<"tasks">, completed: boolean) => {
    try {
      await updateTask({ taskId, completed: !completed });
      toast.success(completed ? "Task reopened! 🔄" : "Task completed! 🎉");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async (taskId: Id<"tasks">) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask({ taskId });
        toast.success("Task deleted successfully! 🗑️");
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
      case "medium": return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
      case "low": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
      default: return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return "🔴";
      case "medium": return "🟡";
      case "low": return "🟢";
      default: return "⚪";
    }
  };

  if (!activeTasks) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Task Management 📋
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Organize your work and track progress
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <span className="text-xl">{showCreateForm ? "❌" : "➕"}</span>
            {showCreateForm ? "Cancel" : "Add Task"}
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="Enter task title..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Enter task description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Pomodoros
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.estimatedPomodoros}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedPomodoros: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as "low" | "medium" | "high" }))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                  placeholder="e.g., Work, Personal, Study..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">💾</span>
                {editingTask ? "Update Task" : "Create Task"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">❌</span>
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Toggle Completed Tasks */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Active Tasks ({activeTasks.length})
          </h3>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {showCompleted ? "Hide" : "Show"} Completed ({completedTasks?.length || 0})
          </button>
        </div>
      </div>

      {/* Active Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTasks.map((task) => (
          <div
            key={task._id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {getPriorityIcon(task.priority)} {task.priority}
                </span>
                {task.category && (
                  <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                    {task.category}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(task)}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              {task.title}
            </h4>
            
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {task.description}
              </p>
            )}

            <div className="space-y-3">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-300">Progress</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {task.completedPomodoros}/{task.estimatedPomodoros} 🍅
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((task.completedPomodoros / task.estimatedPomodoros) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Due Date */}
              {task.dueDate && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  📅 Due: {new Date(task.dueDate).toLocaleDateString()}
                </div>
              )}

              {/* Complete Button */}
              <button
                onClick={() => handleToggleComplete(task._id, task.completed)}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                ✅ Mark Complete
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No active tasks
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Create your first task to get started!
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            ➕ Add Your First Task
          </button>
        </div>
      )}

      {/* Completed Tasks */}
      {showCompleted && completedTasks && completedTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Completed Tasks ({completedTasks.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.map((task) => (
              <div
                key={task._id}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 opacity-75"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white line-through">
                    {task.title}
                  </h4>
                  <button
                    onClick={() => handleToggleComplete(task._id, task.completed)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    🔄 Reopen
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  ✅ {task.completedPomodoros}/{task.estimatedPomodoros} pomodoros completed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
