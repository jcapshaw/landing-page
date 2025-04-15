# Loading Animations Implementation

This document describes the loading animations implemented across the app.

## Components Created

1. **Loading Spinner (`components/ui/loading-spinner.tsx`)**
   - A customized spinner component that uses the Lifted Trucks logo and a spinning wheel/tire
   - Supports three sizes: small, medium, and large
   - Can be used anywhere in the app where loading states are needed

2. **Page Transition (`components/ui/page-transition.tsx`)**
   - Wraps the entire application to provide consistent loading animations between page transitions
   - Detects route changes and displays the spinner during navigation
   - Creates a smooth transition between pages

3. **Spinner CSS (`components/ui/spinner.module.css`)**
   - Contains all the styling for the spinner and page transitions
   - Includes animations for the spinning tire and fade transitions

## Implementation Details

- The spinner uses the company logo (`ltlogo.png`) and the tire icon (`treadicon.svg`) to create a branded loading experience
- The page transition component is integrated into the root layout to ensure consistent loading animations across the entire app
- The ProtectedLayout component has been updated to use the new spinner for authentication loading states
- Individual page loading states (like in the Inventory page) have been updated to use the new spinner

## Demo Page

A demo page has been created at `/loading-demo` to showcase the loading animations. This page allows you to:
- View the spinner in different sizes
- Test page transitions by navigating to different sections of the app

