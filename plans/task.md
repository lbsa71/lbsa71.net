# Task: Add Edit Link to Menu for lbsa71@gmail.com

## Goal
When logged in as 'lbsa71@gmail.com', the menu should display a link to the edit start page at `/edit/st_ephan`.

## Success Condition
- Menu displays "Edit Documents" link when user.email === 'lbsa71@gmail.com'
- Link navigates to `/edit/st_ephan`
- Link does NOT appear for other logged-in users
- All tests passing
- Functionality works as expected in browser

## Context
- AuthMenu component in `_app.tsx` currently shows "Welcome, {user.email}" and "Logout" button
- User object from AuthContext contains email property
- Edit page already exists at `/edit/[user_id]/index.tsx`
- The user_id for lbsa71@gmail.com is `st_ephan` (based on admin_user_id mapping in config)
