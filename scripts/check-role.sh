#!/bin/bash

# Simple shell script to check the role of demo@liftedtrucks.com
# This script doesn't require npm or ts-node, just Node.js

# Check if an email was provided as an argument
if [ -n "$1" ]; then
  EMAIL="$1"
  echo "Checking role for user: $EMAIL"
  node scripts/check-user-role.js "$EMAIL"
else
  echo "Checking role for default user: demo@liftedtrucks.com"
  node scripts/check-user-role.js
fi

# Check exit code
if [ $? -ne 0 ]; then
  echo "❌ Failed to check user role. Check the error messages above."
fi