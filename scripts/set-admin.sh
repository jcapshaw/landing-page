#!/bin/bash

# Simple shell script to set demo@liftedtrucks.com as admin
# This script doesn't require npm or ts-node, just Node.js

echo "Setting demo@liftedtrucks.com as admin..."
node scripts/set-admin-user.js

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ Admin role set successfully!"
  echo "You can now check the user's role with: bash scripts/check-role.sh"
else
  echo "❌ Failed to set admin role. Check the error messages above."
fi