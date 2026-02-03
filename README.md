# Project Template

Use this template when creating a new project in `projects/`.

---

## 📁 Structure

```
projects/<project-name>/
├── PROJECT.md          ← Main config (stack, rules, DoD)
├── README.md           ← Quick start
├── tasks/
│   ├── todo.md         ← Current work tracking
│   └── lessons.md      ← Mistakes & learnings
└── [project code]
```

---

## 🚀 Creating a New Project

### Option 1: Ask the Agent (Recommended)
From the root workspace (red status bar):
```
צור פרויקט חדש בשם "my-project" בתיקיית projects/
```

### Option 2: Manual
```powershell
# Create structure
mkdir projects/my-project
mkdir projects/my-project/tasks

# Copy templates
cp projects/_template/PROJECT.md projects/my-project/
cp projects/_template/PROJECT_README.md projects/my-project/README.md
cp projects/_template/tasks/* projects/my-project/tasks/
```

---

## 📄 File Purposes

| File | Purpose |
|------|---------|
| `PROJECT.md` | Stack, rules, security, Definition of Done |
| `README.md` | Quick start for humans |
| `tasks/todo.md` | Track current sprint |
| `tasks/lessons.md` | Document mistakes to prevent recurrence |

---

## ⚠️ Important

After creating a project:
1. **Fill in PROJECT.md** with actual stack and rules
2. **Open the project in a separate VS Code window**
3. **Never work on project code from the root workspace**
