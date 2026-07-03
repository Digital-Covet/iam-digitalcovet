# Directory Structure
```
src/routes/api/[..auth].ts
```

# Files

## File: src/routes/api/[..auth].ts
```typescript
import { toSolidStartHandler } from "better-auth/solid-start";
import { auth } from "@/lib/auth";
export const { GET, POST } = toSolidStartHandler(auth);
```
