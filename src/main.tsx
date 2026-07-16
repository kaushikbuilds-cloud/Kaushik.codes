import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found');

const root = createRoot(rootEl);

/**
 * App is imported dynamically (inside try/catch) rather than statically.
 * Static imports resolve their whole dependency graph synchronously before
 * React ever mounts — if env validation throws in that chain, the page would
 * otherwise stay completely blank with only a console error. Catching it
 * here lets us render an actionable message instead.
 */
async function bootstrap() {
  try {
    const { default: App } = await import('./App');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (err) {
    root.render(<StartupError error={err} />);
  }
}

function StartupError({ error }: { error: unknown }) {
  // Duck-typed rather than `instanceof ConfigError` — importing the class
  // would statically pull in lib/env.ts, whose top-level validation throw
  // is exactly the failure this component exists to catch.
  const isConfigError = error instanceof Error && error.name === 'ConfigError';
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#fff',
        background: '#0a0a0b',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          border: '1px solid #26262a',
          borderRadius: 16,
          padding: 24,
          background: '#161618',
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          {isConfigError ? 'Setup needed ⚙️' : 'Something went wrong'}
        </h1>
        <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 12, lineHeight: 1.5 }}>
          {message}
        </p>
        {isConfigError && (
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 12, lineHeight: 1.5 }}>
            On Vercel: add these under Project → Settings → Environment Variables, then
            redeploy (Vite bakes them in at build time, so the site must rebuild after
            you add or change them).
          </p>
        )}
      </div>
    </div>
  );
}

void bootstrap();
