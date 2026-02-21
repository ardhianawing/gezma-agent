#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting GEZMA Agent..."
node server.js
