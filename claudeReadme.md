# Lifted Trucks Dealership Portal

A NextJS-based inventory management system for Lifted Trucks dealership. The application serves as an employee portal with the following key features:

## Main Purpose
- Vehicle inventory management
- Sales tracking
- Customer prospect management
- Daily logging functionality
- Dashboard with sales statistics and metrics

## Technologies
- NextJS 15 (React framework with server components)
- TypeScript
- Firebase/Firestore (authentication, database)
- TailwindCSS (styling)
- Radix UI components and ShadCN UI
- Chart.js for data visualization
- React Hook Form for form handling
- Zod for validation

## Key Sections
- Dashboard: Overview with MTD stats, inventory summary, hot prospects
- Inventory management: Add/edit vehicles with detailed information
- Daily log: Track customer interactions and sales activities
- Sales stats: Charts and metrics visualization
- User management: Admin controls with role-based permissions
- Authentication: Firebase auth with role-based access control

## Access Levels
The application implements a role-based permission system with three levels:
- Admin: Full access to all features
- Manager: Write access to vehicles and logs
- Salesperson: Read-only access to most features