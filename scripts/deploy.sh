#!/bin/bash

# Ensure environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ -z "$NEXTAUTH_SECRET" ]; then
  echo "Error: Required environment variables are not set"
  echo "Please ensure the following variables are set:"
  echo "- NEXT_PUBLIC_SUPABASE_URL"
  echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
  echo "- NEXTAUTH_SECRET"
  exit 1
fi

# Build the application
echo "Building the application..."
npm run build

# Deploy using SST
echo "Deploying with SST..."
npx sst deploy --stage prod 