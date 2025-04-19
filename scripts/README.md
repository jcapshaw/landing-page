# Admin Scripts

This directory contains utility scripts for administrative tasks.

## Available Scripts

### 1. Set Admin User Script

The script allows you to set a user as an admin in the Firebase authentication system.

### Prerequisites

- Node.js installed
- Firebase service account credentials file (`firebase-service-account.json`) in the root directory

### Usage

#### Using Shell Scripts (Simplest Method)

We've created shell scripts that don't require npm or ts-node, just Node.js:

```bash
# Navigate to the project root
cd /path/to/your/project

# Make the scripts executable (if not already)
chmod +x scripts/set-admin.sh scripts/check-role.sh

# Set demo@liftedtrucks.com as admin
./scripts/set-admin.sh

# Check the user's role
./scripts/check-role.sh
```

#### Using npm scripts (Alternative)

We've also added npm scripts if you prefer that approach:

```bash
# Navigate to the project root
cd /path/to/your/project

# OPTION 1: Using JavaScript version (works without additional dependencies)
npm run set-admin:js

# OPTION 2: Using TypeScript version with npx (automatically downloads ts-node if needed)
npm run set-admin
```

> **Note:** If you encounter "ts-node: not found" errors, use the shell scripts or JavaScript version with `npm run set-admin:js` instead.

#### Manual Execution

If you prefer to run the scripts directly:

##### JavaScript Version

```bash
# Navigate to the project root
cd /path/to/your/project

# Run the script
node scripts/set-admin-user.js
```

##### TypeScript Version

```bash
# Navigate to the project root
cd /path/to/your/project

# Install ts-node if you don't have it
npm install -g ts-node

# Run the script with ts-node
ts-node scripts/set-admin-user.ts

# Alternatively, compile and run
npx tsc scripts/set-admin-user.ts
node scripts/set-admin-user.js
```

### What the script does

1. Initializes the Firebase Admin SDK using the service account credentials
2. Looks up the user with email "demo@liftedtrucks.com"
3. Sets the custom claims for this user with the "admin" role
4. Updates the user document in Firestore with the new role

### Modifying the script

If you need to set a different user as admin, edit the `targetEmail` variable in the script:

```javascript
// Change this line in the main function
const targetEmail = 'another-email@example.com';
```

### Troubleshooting

If you encounter any errors:

1. Make sure the `firebase-service-account.json` file exists in the root directory
2. Verify that the email address exists in your Firebase Authentication system
3. Check the console output for specific error messages

### 2. Check User Role Script

The `check-user-role.ts` script allows you to check a user's current role and other account details.

#### Usage

##### Using Shell Script (Simplest Method)

```bash
# Check the default user (demo@liftedtrucks.com)
./scripts/check-role.sh

# Check a specific user by email
./scripts/check-role.sh user@example.com
```

##### Using npm scripts (Alternative)

```bash
# OPTION 1: Using JavaScript version (works without additional dependencies)
# Check the default user (demo@liftedtrucks.com)
npm run check-role:js

# Check a specific user by email
npm run check-role:js user@example.com

# OPTION 2: Using TypeScript version with npx (automatically downloads ts-node if needed)
# Check the default user (demo@liftedtrucks.com)
npm run check-role

# Check a specific user by email
npm run check-role -- user@example.com
```

> **Note:** If you encounter "ts-node: not found" errors, use the shell scripts or JavaScript version with `npm run check-role:js` instead.

This script will display:
- Basic user information (email, display name, UID, etc.)
- Role information from both custom claims and Firestore
- Account status details (email verified, disabled, creation time, etc.)

Use this script to verify that the admin role was set correctly after running the set-admin script.

## Alternative: Using the Admin UI

If you prefer to use the UI, you can:

1. Sign in with an existing admin account
2. Navigate to the Admin Users page at `/admin/users`
3. Find the user with email "demo@liftedtrucks.com"
4. Use the role dropdown to select "Admin"

Note: This requires that you already have an admin account to access the admin section.