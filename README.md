# ⏱️ **FocusFlow — Modern Pomodoro Timer App**

**FocusFlow** is a sleek and fully-featured Pomodoro productivity app built with **React**, **TypeScript**, **TailwindCSS**, and **Vite**.
It includes **task management**, **statistics**, **customizable settings**, and **authentication** — everything you need to stay focused and boost productivity.

---

## ✨ **Features**

### 🔥 **Modern Pomodoro Timer**

* Clean, responsive UI
* Start / pause / reset controls
* Real-time progress visualization
* Automatic session switching (**work → break → long break**)

### 📝 **Task Manager**

* Add new tasks
* Mark tasks as completed
* Delete tasks
* Perfect for organizing your workflow alongside the timer

### 📊 **Productivity Stats**

* Track completed Pomodoro sessions
* View total focused time and session history
* User data stored persistently via **Convex backend**

### ⚙️ **Customizable Settings**

Customize:

* Work duration
* Short break
* Long break
* Number of cycles before long break
  Settings are saved automatically per user.

### 🔐 **Authentication**

* Sign in / Sign out
* User-specific tasks and stats
* Powered by the **Convex backend**

### 🎨 **Modern Tech Stack**

* ⚛️ **React + TypeScript**
* 🎨 **TailwindCSS**
* ⚡ **Vite bundler**
* ☁️ **Convex backend database**
* 📦 Modular, component-based architecture

---

## 🚀 **Live Demo**

Experience FocusFlow here:
🔗 **[https://dazzling-peccary-210.convex.app/](https://dazzling-peccary-210.convex.app/)**

---

## 📁 **Project Structure**

```
src/
│  App.tsx             → Main UI layout
│  main.tsx            → App entry
│  index.css           → Global styles
│  SignInForm.tsx      → Auth component
│  SignOutButton.tsx   → Logout UI
│
├─ components/
│    PomodoroTimer.tsx → Timer logic & UI
│    Tasks.tsx         → Task manager
│    Settings.tsx      → User settings
│    Stats.tsx         → Productivity stats
│
└─ lib/
     utils.ts          → Helper utilities
```

---

## 🔮 **Roadmap**

* [ ] Add dark mode
* [ ] Add sound notification options
* [ ] Add smoother animations & transitions
* [ ] Add weekly/monthly stats dashboard
* [ ] Add mobile PWA support (installable app)

---

## 📄 **License**

Released under the **MIT License**.
You are free to use, modify, and distribute this project — **attribution required**.

---

## ❤️ **Credits**

Created with passion by **@stolenact** & **Chef Convex**.
If you enjoy this project, consider leaving a ⭐!
