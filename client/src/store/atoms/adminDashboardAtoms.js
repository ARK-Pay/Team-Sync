import { atom } from 'recoil';

// Atom to track the currently selected sidebar item
export const sidebarSelection = atom({
  key: 'sidebarSelection',
  default: 'dashboard'
});

// Atom to trigger project list refresh
export const projectRefreshTrigger = atom({
  key: 'projectRefreshTrigger',
  default: 0 // Increment this value to trigger refresh
});

// User table refresh trigger
export const userTableRefresh = atom({
  key: 'userTableRefresh',
  default: 0
});