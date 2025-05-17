# Contribution GuideLines

### Contributing to Nepali Date Picker

Thank you for your interest in contributing to the Nepali Date Picker! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Getting Started](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Development Environment Setup](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Project Structure](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Development Workflow](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Branching Strategy](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Commit Guidelines](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Pull Request Process](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Coding Standards](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [TypeScript Guidelines](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [CSS Guidelines](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Documentation](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Testing](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Building](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Reporting Issues](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Feature Requests](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Release Process](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)
- [Community](https://www.notion.so/Contribution-GuideLines-1f612065a06b80fc942ff15ebd76aed4?pvs=21)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainers@ratoguras.com](mailto:maintainers@ratoguras.com).

We are committed to providing a welcoming and inclusive environment for everyone, regardless of gender, sexual orientation, ability, ethnicity, socioeconomic status, and religion.

### Our Standards

- Be respectful and inclusive of differing viewpoints and experiences
- Give and gracefully accept constructive feedback
- Focus on what is best for the community and the project
- Show empathy towards other community members

## Getting Started

### Development Environment Setup

1. **Fork the Repository**

Start by forking the repository to your GitHub account.

1. **Clone Your Fork**

```bash
git clone <https://github.com/your-username/nepali-date-picker.git>
cd nepali-date-picker
```

1. **Install Dependencies**

```bash
npm install
```

1. **Set Up Remote**

```bash
git remote add upstream <https://github.com/rato-guras-technology/nepali-date-picker.git>
```

1. **Start Development Server**

```bash
npm run dev
```

This will start a development server with hot reloading.

### Project Structure

```bash
nepali-date-picker/
├── src/                  # Source code
│   ├── components/       # UI components
│   ├── utils/            # Utility functions
│   ├── styles/           # CSS styles
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Main entry point
├── examples/             # Example usage
├── tests/                # Test files
├── dist/                 # Built distribution files (generated)
├── docs/                 # Documentation
├── .github/              # GitHub specific files
├── rollup.config.js      # Rollup configuration
├── tsconfig.json         # TypeScript configuration
├── package.json          # Package configuration
└── README.md             # Project readme
```

## Development Workflow

### Branching Strategy

We use a simplified Git flow with the following branches:

- `main`: Production-ready code. Protected branch, requires pull request and review.
- `develop`: Development branch. All feature branches should be created from and merged back into this branch.
- `feature/*`: For new features.
- `bugfix/*`: For bug fixes.
- `hotfix/*`: For critical fixes that need to be applied to production.

### Creating a Branch

1. Ensure you're on the develop branch and it's up to date:

```bash
git checkout develop
git pull upstream develop
```

1. Create a new branch:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b bugfix/issue-description
```

### Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```bash
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

Examples:

```bash
feat(calendar): add support for date range selection
fix(conversion): correct Nepali to Gregorian date conversion
docs(readme): update installation instructions
```

### Pull Request Process

1. **Update Your Branch**

Before submitting a pull request, make sure your branch is up to date with the develop branch:

```
git checkout develop
git pull upstream develop
git checkout your-branch-name
git rebase develop
```

1. **Push Your Branch**

```
git push origin your-branch-name
```

1. **Create a Pull Request**

Go to the GitHub repository and create a pull request from your branch to the `develop` branch of the main repository.

1. **PR Description**

Your pull request should include:

1. A clear description of the changes
2. Any relevant issue numbers (e.g., "Fixes #123")
3. Screenshots or GIFs for UI changes
4. Notes on any breaking changes
5. **Code Review**

Maintainers will review your code. Be open to feedback and make necessary changes.

1. **Continuous Integration**

All pull requests must pass automated tests and linting checks.

1. **Merging**

Once approved, a maintainer will merge your pull request.

## Coding Standards

### TypeScript Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Use interfaces for object shapes
- Use proper type annotations
- Avoid using `any` type when possible
- Use meaningful variable and function names

### CSS Guidelines

- Use CSS variables for theming
- Follow BEM (Block Element Modifier) naming convention
- Keep selectors as simple as possible
- Use responsive design principles
- Test on multiple browsers and screen sizes

### Documentation

- Document all public APIs, classes, and functions
- Use JSDoc comments for code documentation
- Update [README.md](http://readme.md/) when adding new features
- Add examples for new functionality
- Keep documentation up to date with code changes

## Testing

We use Jest for testing. All new features and bug fixes should include tests.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Place test files in the `tests` directory
- Name test files with `.test.ts` or `.test.tsx` extension
- Test both success and failure cases
- Mock external dependencies
- Focus on testing behavior, not implementation details

## Building

To build the package:

```bash
npm run build
```

This will generate the distribution files in the `dist` directory.

## Reporting Issues

If you find a bug or have a suggestion for improvement:

1. Check if the issue already exists in the [GitHub Issues](https://github.com/rato-guras-technology/nepali-date-picker/issues)
2. If not, create a new issue with:
3. A clear title and description
4. Steps to reproduce the issue
5. Expected and actual behavior
6. Screenshots if applicable
7. Environment information (browser, OS, package version)

## Feature Requests

We welcome feature requests! To suggest a new feature:

1. Check if the feature has already been requested or implemented
2. Create a new issue with the label "feature request"
3. Clearly describe the feature and its use case
4. Provide examples of how the feature would work
5. Explain why this feature would be beneficial to the project

## Release Process

Our release process follows these steps:

1. Merge approved pull requests into the `develop` branch
2. When ready for a release, create a release branch from `develop`
3. Perform final testing and version bumping
4. Merge the release branch into `main` and tag with the version number
5. Publish to npm

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- MAJOR version for incompatible API changes
- MINOR version for new functionality in a backward-compatible manner
- PATCH version for backward-compatible bug fixes

## Community

- Join our [Discord server](https://discord.gg/ratoguras) for discussions
- Follow us on [Twitter](https://twitter.com/ratoguras) for updates
- Subscribe to our [newsletter](https://ratoguras.com/newsletter) for major announcements

---

Thank you for contributing to the Nepali Date Picker! Your efforts help make this project better for everyone.
