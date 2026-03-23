# FraudShield Data Directory

This folder contains the live JSON database files written by the Next.js API routes.

## Files

### `users.json`
All registered user accounts.
```json
{
  "version": 1,
  "updatedAt": 1234567890,
  "users": [
    {
      "id": "user_1234_abc",
      "name": "Margaret Wilson",
      "email": "margaret@example.com",
      "passwordHash": "...",
      "avatar": "MW",
      "createdAt": 1234567890,
      "lastLogin": 1234567890
    }
  ]
}
```

### `sessions.json`
All training progress, keyed by user ID.
```json
{
  "version": 1,
  "updatedAt": 1234567890,
  "sessions": {
    "user_1234_abc": {
      "startTime": 1234567890,
      "attempts": [...],
      "modules": {
        "real_or_fraud": { "completed": 3, "total": 6, "score": 300, "maxScore": 600 },
        "recognition":   { "completed": 1, "total": 3, "score": 90,  "maxScore": 300 },
        "chat":          { "completed": 0, "total": 2, "score": 0,   "maxScore": 200 },
        "adaptive":      { "completed": 7, "total": 999, "score": 600, "maxScore": 99900 }
      }
    }
  }
}
```

## Viewing / Exporting

Open in any text editor — they are plain JSON files.

Or hit the export endpoint while the server is running:
```
GET http://localhost:3000/api/db/export
```
This downloads a `fraudshield_export_*.json` file with all data (passwords stripped).

## Important
- Add `data/*.json` to `.gitignore` before pushing to GitHub to avoid leaking user data.
- For production, migrate to a real database (PostgreSQL, MongoDB, etc.).
