# Contributing to PageStash

Thank you for your interest in contributing to PageStash! This document provides guidelines and information for contributors.

## Development Process

### Getting Started

1. **Fork the repository** and clone your fork
2. **Follow the setup guide** in `docs/DEVELOPMENT_SETUP.md`
3. **Create a feature branch** from `main`
4. **Make your changes** following our coding standards
5. **Test thoroughly** before submitting
6. **Submit a pull request** with a clear description

### Branch Naming

Use descriptive branch names with prefixes:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

Examples:
- `feature/advanced-search`
- `fix/extension-popup-crash`
- `docs/api-documentation`

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, no code change
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `test` - Adding missing tests
- `chore` - Maintenance tasks

Examples:
- `feat(extension): add full-page screenshot capture`
- `fix(web): resolve search pagination issue`
- `docs: update development setup guide`

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper types for all functions and variables
- Use Zod schemas for data validation
- Prefer interfaces over types for object shapes

### React

- Use functional components with hooks
- Follow React best practices for performance
- Use proper prop types and default values
- Implement proper error boundaries

### Styling

- Use Tailwind CSS for styling
- Follow the design system in `packages/shared`
- Ensure responsive design for all screen sizes
- Maintain accessibility standards (WCAG 2.1 AA)

### Extension Development

- Follow Manifest V3 best practices
- Handle all permission requests properly
- Implement proper error handling
- Test across different browsers

## Testing

### Required Tests

- **Unit tests** for utility functions
- **Integration tests** for API endpoints
- **E2E tests** for critical user flows
- **Extension tests** for capture functionality

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
cd apps/web && npm test
cd apps/extension && npm test
```

## Documentation

### Code Documentation

- Document all public functions and classes
- Include JSDoc comments for complex logic
- Update README files when adding features
- Maintain API documentation

### User Documentation

- Update user guides for new features
- Include screenshots for UI changes
- Maintain troubleshooting guides
- Keep setup instructions current

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**: `npm test`
2. **Check TypeScript**: `npm run type-check`
3. **Lint your code**: `npm run lint`
4. **Build successfully**: `npm run build`
5. **Test manually** in both web app and extension

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Extension tested in browser

## Screenshots (if applicable)
Include screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### Review Process

1. **Automated checks** must pass (CI/CD)
2. **Code review** by maintainers
3. **Testing** in development environment
4. **Approval** from at least one maintainer
5. **Merge** to main branch

## Issue Reporting

### Bug Reports

Include:
- **Clear description** of the issue
- **Steps to reproduce** the problem
- **Expected vs actual behavior**
- **Environment details** (browser, OS, extension version)
- **Screenshots or videos** if applicable

### Feature Requests

Include:
- **Clear description** of the feature
- **Use case** and user story
- **Acceptance criteria**
- **Mockups or designs** if available

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

### Getting Help

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community Discord (link in README)

## Development Priorities

### Current Focus Areas

1. **Core functionality** - Extension capture and web app viewing
2. **Search improvements** - Better full-text search and filtering
3. **Performance** - Optimization for large clip libraries
4. **User experience** - Polish and accessibility improvements

### Future Roadmap

- Team collaboration features
- Advanced export capabilities
- Mobile app development
- Enterprise features

## Recognition

Contributors will be:
- **Listed** in our contributors section
- **Credited** in release notes for significant contributions
- **Invited** to join our contributor Discord channel
- **Considered** for maintainer roles based on contributions

## Questions?

- Check the [Development Setup Guide](docs/DEVELOPMENT_SETUP.md)
- Review the [Implementation Plan](IMPLEMENTATION_PLAN.md)
- Create an issue with the `question` label
- Join our community discussions

Thank you for contributing to PageStash! 🚀
