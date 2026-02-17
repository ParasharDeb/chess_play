# 🚀 Contributing to Chess Play

Thank you for your interest in contributing to Chess Play! We're excited to have you join our community. This guide will help you get started with contributing code, documentation, and improvements.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Style Guide](#style-guide)
- [Need Help?](#need-help)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing opinions and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment of any kind
- Discriminatory language or actions
- Disruptive behavior
- Publishing private information

---

## Getting Started

### Prerequisites

Before contributing, you should have:

- GitHub account
- Git installed locally - [Install Git](https://git-scm.com/downloads)
- Node.js 20.x and pnpm 8.x - [Setup Guide](./SETUP.md)
- Basic understanding of TypeScript and React (for code contributions)

### Quick Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/chess_play.git
   cd chess_play
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ParasharDeb/chess_play.git
   ```
4. **Install dependencies** (see [Development Setup](#development-setup))

---

## Development Setup

### Option 1: Docker (Recommended)

```bash
docker-compose up --build
```

See [SETUP.md - Docker](./SETUP.md#quick-start-with-docker) for detailed instructions.

### Option 2: Manual Setup

Follow the [manual installation guide](./SETUP.md#manual-installation) in SETUP.md.

### Verify Your Setup

```bash
# Check all services are running
pnpm dev
# or
docker-compose up

# Test API endpoint
curl http://localhost:3001/health

# Open frontend
# http://localhost:3000
```

---

## How to Contribute

### 1. 🔍 Choose an Issue

- Browse our [Issues page](https://github.com/ParasharDeb/chess_play/issues)
- Look for issues labeled:
  - `good first issue` - Perfect for newcomers
  - `help wanted` - We need your help!
  - `bug` - Something needs fixing
  - `enhancement` - New features
- **Check if it's already assigned** - Comment to claim it
- Ask questions if something is unclear

### 2. 🌿 Create a Branch

Create a descriptive branch for your work:

```bash
# Update main branch
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b issue-123-fix-login-validation
```

**Branch Naming Convention**:
```
<type>/<issue-number>-<short-description>

Examples:
- fix/123-login-validation-bug
- feat/456-add-user-profile-page
- docs/789-update-readme
- refactor/101-cleanup-game-logic
```

Allowed types: `fix`, `feat`, `docs`, `style`, `refactor`, `test`, `chore`

### 3. ✍️ Make Your Changes

- **Keep changes focused** - One issue per PR when possible
- **Write clear code** - Use meaningful variable names
- **Add comments** - Explain complex logic
- **Update relevant files** - Don't just update code, update docs too
- **Add TypeScript types** - Avoid `any` when possible

### 4. 🧪 Test Your Changes

```bash
# Run linter
pnpm lint

# Run tests (if available)
pnpm test

# Manual testing
# - For backend: Test API endpoints with curl or Postman
# - For frontend: Test in browser at http://localhost:3000
# - For WebSocket: Test game connections
```

### 5. 📝 Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "Fix: resolve login validation bug on signup"
```

See [Commit Guidelines](#commit-guidelines) for detailed format.

### 6. 🔄 Keep Your Branch Updated

Before submitting, sync with upstream:

```bash
git fetch upstream
git rebase upstream/main
```

If there are conflicts:
```bash
# Resolve conflicts in your editor, then:
git add .
git rebase --continue
```

### 7. 📤 Push Your Changes

```bash
git push origin issue-123-fix-login-validation
```

### 8. 🔗 Open a Pull Request

1. Go to https://github.com/ParasharDeb/chess_play
2. Click **"New Pull Request"**
3. Select your branch
4. Fill in the PR description using the template:

   ```markdown
   ## Description
   Brief description of what this PR does.

   ## Issue
   Closes #123

   ## Type of Change
   - [ ] Bug fix (non-breaking change fixing an issue)
   - [ ] New feature (non-breaking change adding functionality)
   - [ ] Breaking change (fix or feature causing existing functionality to change)
   - [ ] Documentation update

   ## Changes Made
   - Change 1
   - Change 2

   ## Testing
   Describe how you tested your changes:
   - [ ] Manual testing in browser
   - [ ] API endpoint tests
   - [ ] WebSocket connection tests

   ## Screenshots (if applicable)
   Include screenshots or GIFs for UI changes.

   ## Checklist
   - [ ] My code follows the style guide
   - [ ] I've updated relevant documentation
   - [ ] I've tested my changes
   - [ ] No new warnings are generated
   ```

5. Click **"Create Pull Request"**

---

## Commit Guidelines

### Commit Message Format

We follow the Conventional Commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **fix**: Bug fixes
- **feat**: New features
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Dependency updates, tooling changes

### Scope (Optional)

Specify what part of the code was changed:
- `frontend`, `backend`, `ws-server`, `database`, `docker`, `ci`, etc.

### Examples

```bash
# Good commits
git commit -m "fix(frontend): resolve memory leak in game component"
git commit -m "feat(backend): add user authentication endpoint"
git commit -m "docs(setup): update installation instructions"
git commit -m "refactor(ws-server): improve game manager performance"

# Bad commits
git commit -m "fixed stuff"
git commit -m "WIP: random changes"
git commit -m "Update"
```

---

## Pull Request Process

### What to Expect

1. **Automated Checks**: GitHub Actions will run:
   - Linting checks
   - Build verification
   - TypeScript compilation
   - Tests (if available)

2. **Code Review**: A maintainer will review your changes
   - We'll provide constructive feedback
   - Be open to suggestions
   - Respond to comments promptly

3. **Approval**: Once approved, we'll merge your PR
   - You'll be added to our contributors list
   - Changes will be deployed

### Tips for Faster Review

- Keep PRs small and focused
- Add detailed descriptions
- Include tests
- Follow the style guide
- Respond to feedback quickly

### Handling Feedback

If requested changes are made:

```bash
# Make the requested changes
# Add a new commit (don't amend, we want to see the conversation)
git add .
git commit -m "Address review feedback: explain change here"
git push origin your-branch-name
```

---

## Reporting Bugs

Found a bug? Help us fix it!

### Bug Report Template

When opening an issue, use this template:

```markdown
## Description
Brief description of the bug.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen?

## Actual Behavior
What actually happens?

## Environment
- OS: Windows/macOS/Linux
- Node version: 20.x
- Browser (if frontend): Chrome, Firefox, etc.
- Docker or Manual setup?

## Screenshots/Logs
Include error messages or screenshots.

## Additional Context
Any other relevant information.
```

---

## Suggesting Features

Have an idea for an improvement?

### Feature Request Template

```markdown
## Description
Clear description of the suggested feature.

## Use Case
Why would this be useful?

## Proposed Solution
How you envision this working.

## Alternatives
Any alternative approaches?

## Additional Context
Screenshots, mockups, or examples.
```

---

## Style Guide

### TypeScript

- Use `const` and `let`, avoid `var`
- Add type annotations for function parameters
- Avoid `any` type - use proper types
- Use meaningful variable names

```typescript
// Good
const getUserById = (id: string): Promise<User> => {
  // implementation
};

// Avoid
const getX = (a: any): any => {
  // implementation
};
```

### React/Next.js

- Use functional components with hooks
- Use TypeScript for props
- Keep components small and focused
- Extract reusable logic to custom hooks

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);
```

### File Structure

- Component files: PascalCase (`GameBoard.tsx`)
- Utility files: camelCase (`gameUtils.ts`)
- Constants: UPPER_SNAKE_CASE in `constants.ts`

### Comments

- Use clear, concise comments
- Explain *why*, not *what*
- Keep comments updated with code

```typescript
// Good
// Exponential backoff for retry attempts
const delay = Math.pow(2, attemptCount) * 1000;

// Avoid
// Add 1000 to result
const result = x + 1000;
```

---

## Need Help?

### Getting Unstuck

1. **Check existing issues** for similar problems
2. **Read the docs** in [SETUP.md](./SETUP.md) and README
3. **Ask in GitHub Discussions** or create an issue
4. **Join our community** - links in main README

### Questions?

- Comment on the issue you're working on
- Open a Discussion for general questions
- Tag maintainers with `@ParasharDeb` if urgent

### Local Testing Checklist

Before submitting your PR, verify:

```bash
# ✅ Code compiles
pnpm build

# ✅ Linting passes
pnpm lint

# ✅ Services run without errors
pnpm dev          # or docker-compose up

# ✅ API works
curl http://localhost:3001/health

# ✅ Frontend loads
# Open http://localhost:3000

# ✅ No console errors
# Check browser DevTools console
```

---

## Recognition

We appreciate all contributors! Your work helps make Chess Play better.

- All contributors are listed in our [CONTRIBUTORS.md](./CONTRIBUTORS.md)
- Active contributors may be given more responsibility
- Your commits appear in the project history

---

## License

By contributing, you agree that your contributions will be licensed under the same license as this project (ISC License).

---

## Additional Resources

- **GitHub Help**: https://docs.github.com/en
- **Git Tutorial**: https://git-scm.com/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **React Documentation**: https://react.dev
- **Next.js Guide**: https://nextjs.org/docs

---

Thank you for contributing to Chess Play! 🎉 We're thrilled to have you as part of our community.

**Happy coding!** ♟️

Include:

A clear title

Description of what you changed

Why the change is needed

Link the related issue

Example:

Closes #42