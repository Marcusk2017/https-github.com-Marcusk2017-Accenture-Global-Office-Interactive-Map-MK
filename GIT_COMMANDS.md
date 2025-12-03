# Git Commands Reference

This file contains common Git commands for managing your Accenture Office Connect project.

## Basic Workflow

### 1. Check Status
See what files have been modified or added:
```bash
git status
```

### 2. Add Files
Add all modified and new files:
```bash
git add .
```

Or add specific files:
```bash
git add apps/frontend/src/App.tsx
git add apps/frontend/src/components/MapView.tsx
```

### 3. Commit Changes
Commit with a descriptive message:
```bash
git commit -m "Your commit message here"
```

Examples of good commit messages:
- `git commit -m "Add satellite view and custom Mapbox style"`
- `git commit -m "Update welcome screen text and add Graphik font"`
- `git commit -m "Implement globe auto-reset functionality"`

### 4. Push to GitHub
Push your commits to the main branch:
```bash
git push origin main
```

## Complete Push Workflow (All-in-One)

To quickly commit and push all your changes:

```bash
# Step 1: Check what's changed
git status

# Step 2: Add all changes
git add .

# Step 3: Commit with a message
git commit -m "Update globe features and welcome screen"

# Step 4: Push to GitHub
git push origin main
```

## Other Useful Commands

### View Commit History
```bash
git log
```

Or for a simplified view:
```bash
git log --oneline
```

### View Changes (Before Committing)
See what you've changed in files:
```bash
git diff
```

### Undo Changes (Before Committing)
Discard changes to a specific file:
```bash
git restore apps/frontend/src/App.tsx
```

Discard all changes:
```bash
git restore .
```

### Pull Latest Changes
Get the latest changes from GitHub:
```bash
git pull origin main
```

### Create a New Branch
```bash
git checkout -b feature/new-feature-name
```

### Switch Between Branches
```bash
git checkout main
git checkout feature/new-feature-name
```

### View Remote Repository
```bash
git remote -v
```

## Tips

1. **Commit Often**: Make small, focused commits rather than large ones
2. **Write Clear Messages**: Your future self will thank you
3. **Pull Before Push**: Always pull the latest changes before pushing
4. **Check Status**: Run `git status` frequently to know what's going on

## Troubleshooting

### If you get a merge conflict:
1. Open the conflicting files
2. Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Resolve the conflicts manually
4. Run `git add .` to mark as resolved
5. Run `git commit` to complete the merge

### If push is rejected:
```bash
git pull origin main --rebase
git push origin main
```

### If you need to undo the last commit (but keep changes):
```bash
git reset --soft HEAD~1
```

## Quick Reference Card

| Command | Description |
|---------|-------------|
| `git status` | Check current status |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit staged changes |
| `git push origin main` | Push to GitHub |
| `git pull origin main` | Pull from GitHub |
| `git log` | View commit history |
| `git diff` | View uncommitted changes |
| `git restore .` | Discard all changes |

---

**Current Project:** Accenture Office Connect  
**Last Updated:** December 2025

