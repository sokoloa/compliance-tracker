#!/bin/sh
set -e

echo "Running database schema push..."
npx prisma db push --skip-generate

echo "Seeding task library..."
if [ -f "dist-seed/prisma/seed.js" ]; then
  node dist-seed/prisma/seed.js && echo "Seed complete."
else
  echo "Compiled seed not found — skipping. Run 'npm run db:seed' manually if first boot."
fi

echo "Starting application..."
exec node server.js
