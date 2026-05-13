// Module-level flag. Lives for the app session's lifetime (until process kill).
// Set to true when the user explicitly dismisses the auth screens without signing in.
let _allowed = false;

export const guestMode = {
  isAllowed: () => _allowed,
  allow: () => { _allowed = true; },
  reset: () => { _allowed = false; }, // called after sign-out so next launch still prompts
};
