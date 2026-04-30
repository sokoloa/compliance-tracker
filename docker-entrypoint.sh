#!/bin/sh
set -e

echo "Running database schema push..."
node node_modules/prisma/build/index.js db push

echo "Seeding task library..."
if [ -f "dist-seed/prisma/seed.js" ]; then
  node dist-seed/prisma/seed.js && echo "Seed complete."
else
  echo "Compiled seed not found — skipping."
fi

echo "Starting application..."
exec node server.js
