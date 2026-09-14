# IAM Digital Covet

Identity and Access Management platform for the Digital Covet ecosystem. Provides centralized authentication, authorization, user directory management, and OAuth2 provider services for downstream applications (Share, Portfolio).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [SolidStart](https://start.solidjs.com) (SolidJS) |
| Auth | [Better Auth](https://www.better-auth.com/) with plugins (2FA, Admin, OAuth2 Provider, Email OTP, JWT, Organization) |
| Database | PostgreSQL via [Prisma](https://www.prisma.io/) ORM |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Components | [Ark UI](https://ark-ui.com/) (Solid) |
| Icons | [Lucide](https://lucide.dev/) |
| Email | [Zeptomail](https://wwwzeptomail.com/) transactional service |
| Deployment | [Vercel](https://vercel.com/) via Nitro v2 preset |
| Runtime | Node.js >= 22 |

## Prerequisites

- [Node.js](https://nodejs.org/) >= 22
- [pnpm](https://pnpm.io/) >= 11
- A running PostgreSQL instance
- A [Zeptomail](https://www.zenomail.com/) account (for transactional emails)

## Getting Started

```bash
# 1. Clone the repository
git clone <repository-url>
cd iam-digitalcovet

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# 4. Run database migrations
pnpm prisma:migrate:dev

# 5. Seed the database (creates initial OAuth clients and admin user)
pnpm db:seed

# 6. Start the development server
pnpm dev
```

The application will be available at `http://localhost:5173`.

## Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (e.g., `postgresql://user:password@host:5432/dbname`) |
| `BETTER_AUTH_SECRET` | Yes | Secret key for Better Auth session signing |
| `BETTER_AUTH_URL` | No | Base URL for auth endpoints. Defaults to `http://localhost:5173` in development, `https://iam.digitalcovet.com` in production |
| `ZEPTOMAIL_URL` | Yes | Zeptomail API endpoint URL |
| `ZEPTOMAIL_TOKEN` | Yes | Zeptomail API authentication token |
| `ZEPTOMAIL_SENDER_ADDRESS` | Yes | Verified sender email address for transactional emails |
| `OAUTH_CLIENT_SECRET` | Yes | OAuth2 client secret for the default client |
| `OAUTH_CLIENT_SECRET_SHARE` | Yes | OAuth2 client secret for the Share application |

> **Warning:** Never commit your `.env` file or expose these values in client-side code.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the Vite development server |
| `pnpm build` | Generate Prisma client and build for production |
| `pnpm start` | Start the production server |
| `pnpm preview` | Preview the production build locally |
| `pnpm prisma:migrate:dev` | Run Prisma migrations in development mode |
| `pnpm prisma:migrate:deploy` | Deploy pending migrations (production) |
| `pnpm prisma:generate` | Regenerate the Prisma client |
| `pnpm prisma:studio` | Open Prisma Studio for database inspection |
| `pnpm prisma:format` | Format the Prisma schema |
| `pnpm prisma:validate` | Validate the Prisma schema |
| `pnpm db:seed` | Run the database seed script (OAuth client setup) |

## Architecture

### Routes

```
src/routes/
  index.tsx                    # User directory dashboard (home)
  auth/login.tsx               # Email/password login
  auth/forgot-password.tsx     # Password reset request
  auth/reset-password.tsx      # Password reset form
  auth/verify-2fa.tsx          # Two-factor authentication prompt
  auth-settings/               # Auth method and password policy settings
  account-settings/            # User profile and security settings
  roles-access.tsx             # RBAC role and permission management
  audit-logs.tsx               # Audit log viewer
  apps.tsx                     # Connected applications
  consent.tsx                  # OAuth2 consent screen
  api/[...auth].ts             # Better Auth API catch-all route
  api/front-channel-logout.ts  # Cross-app logout notification endpoint
  api/account-settings.ts      # Account settings API
```

### Authentication Flow

1. User submits credentials to `/api/auth/sign-in/email`
2. Better Auth validates against the database
3. If 2FA is enabled, user is redirected to `/auth/verify-2fa` for TOTP code entry
4. On success, a session is created and a JWT is issued
5. Audit logs are written for both successful and failed attempts

### OAuth2 Provider

The IAM system acts as an OAuth2 authorization server for downstream applications:

- **Share** (`client_id: share`) -- trusted client, skip consent
- **Portfolio** (`client_id: portfolio`) -- trusted client, skip consent

Supported flows: Authorization Code with PKCE. Supported scopes: `openid`, `profile`, `email`, `offline_access`.

Front-channel logout notifications are sent to connected apps when a session ends.

### Role-Based Access Control (RBAC)

| Role | Capabilities |
|------|-------------|
| `superadmin` | Full admin access + user impersonation |
| `admin` | User management, role assignment, system settings |
| `employee` | Self-service only (profile, sessions) |

Permissions are managed via the `better-auth/admin` plugin and stored in the database (`role`, `permission`, `permission_section` tables).

### Audit Logging

The following events are tracked in the `audit_log` table:

- `session_initiated` / `failed_login` -- authentication events
- `token_renewed` -- OAuth2 token exchanges
- `granted_role` -- RBAC changes
- `policy_violation` -- password policy enforcement
- `file_deleted` -- file operations

Each log entry includes actor info, IP address, geolocation, timestamp, and status.

## Database

The Prisma schema is located at `prisma/schema.prisma`. Key models:

- `User` -- core user records with roles, 2FA status, and app access
- `Session` -- active user sessions with device/IP tracking
- `TwoFactor` -- TOTP secrets and backup codes
- `OauthClient` -- registered OAuth2 applications
- `OauthAccessToken` / `OauthRefreshToken` -- token storage
- `AuditLog` -- event log entries
- `Role` / `Permission` / `PermissionSection` -- RBAC definitions
- `PasswordPolicy` -- configurable password rules
- `AuthMethodConfig` -- authentication provider status

### Migration Workflow

```bash
# Development: create a new migration
pnpm prisma:migrate:dev

# Production: apply pending migrations
pnpm prisma:migrate:deploy
```

## Deployment

This project is configured for [Vercel](https://vercel.com/) deployment using the Nitro v2 preset.

The `pnpm build` script runs `prisma generate` before the Vite build to ensure the Prisma client is up to date.

See `vite.config.ts` for the Nitro preset configuration and `vercel.json` for deployment settings.

## License

[MIT](LICENSE)
