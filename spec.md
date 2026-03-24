# Stop N Buy

## Current State
Admin access requires the `caffeineAdminToken` URL parameter to match the server-side token. When a user logs in without that token, the empty string doesn't match, so they're registered as a regular user and never see the Admin button.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `access-control.mo`: Remove token-matching requirement. The very first non-anonymous principal to log in is automatically assigned the admin role, regardless of any token. All subsequent users become regular users.

### Remove
- Token-gated admin assignment logic

## Implementation Plan
1. Update `access-control.mo` initialize function to assign admin to first caller unconditionally (already done).
2. Regenerate backend and redeploy.
