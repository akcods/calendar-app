# 📅 Angular Calendar App

A feature-rich **calendar application** built with Angular, supporting event creation, editing, drag & drop rescheduling, search & filter, and multiple views for seamless event management.

---

## 🚀 Features

- ✅ Create, update, delete events  
- ✅ Categorize events with colors (Work, Personal, Important)  
- ✅ Drag & drop events across dates for rescheduling  
- ✅ Expandable day view with scroll for more than 2 events  
- ✅ Event modal for quick view, edit, and delete
- ✅ Search and filter events by title, description, or category
- ✅ Responsive design with Angular CDK drag-drop  

---

## 📦 Installation Guide

### Prerequisites
- **Node.js**: `>= 18.x`  
- **Angular CLI**: `>= 17.x`  
- **npm**: `>= 9.x`

### Clone Repository
```bash
git clone https://github.com/akcods/calendar-app.git
cd calendar-app
```
### Install Dependencies
    npm install
### Start Development Server
    ng serve
### 🧪 Running Unit Tests
    ng test
### Code Coverage
    ng test --code-coverage

# 📊 Tech Stack

    - Angular 17 (framework)
    - Angular CDK (drag & drop)
    - RxJS (state management & search debounce)
    - TypeScript
    - Jasmine/Karma (testing framework)

# 🌐 Live Demo
[Calendar app](https://akcods.github.io)

# 📖 Usage Notes

    Click on any date cell to add a new event

    Click on an event to view/edit/delete

    If there are more than 2 events on a day, click +X more to expand and view them

    Drag an event to another day cell to reschedule

    Use the search bar to filter events dynamically