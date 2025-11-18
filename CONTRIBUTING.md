# Contributing to BioLab Platform

## Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow TypeScript strict mode
   - Use ESLint and Prettier
   - Write meaningful commit messages

3. **Test locally**
   ```bash
   pnpm type-check
   pnpm lint
   pnpm build
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style

- Use TypeScript for all code
- Follow Airbnb style guide
- Components should be functional with hooks
- Use tailwind for styling
- Prefer composition over inheritance

## Commit Convention

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

## Adding New Modules

See README.md section "Per Aggiungere un Nuovo Modulo"
