# Quickstart: React Chat Interface

## Development Setup

1. **Prerequisites**
   - Node.js 18+
   - Backend running at `http://localhost:8000`

2. **Installation**
   ```bash
   cd Frontend
   npm install
   ```

3. **Environment Variables**
   Create `Frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Key Commands
- `npm run build`: Production build (outputs to `dist/`)
- `npm run lint`: Run ESLint checks
- `npm run test`: Run unit tests (Vitest)

## Deployment Note
The `dist/` folder should be served as a static site. The backend CORS must allow the frontend origin.
