# TODO: Fix Google OAuth CORS Error

## Tasks
- [x] Remove incorrect fetch request in GoogleCallbackPage.jsx that causes CORS error
- [x] Ensure GoogleCallbackPage only handles query parameters from backend redirect
- [x] Update SignupPage.jsx to use correct frontend callback URL (localhost:5173)
- [x] Update GoogleAuthController to dynamically use frontend redirect URI from state
- [x] Add email verification check to login method to prevent unverified users from logging in
- [ ] Test the OAuth flow after changes
- [ ] Verify no breaking changes to existing functionality
