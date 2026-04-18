# VentureMind v4 Security Specification

## Data Invariants
1. Chat messages must belong to a conversation, which must belong to the authenticated user.
2. User roles can only be updated by Admins.
3. Event logs and Service Analytics are append-only or system-managed, readable only by Admins.
4. Users can only read their own private profiles.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: User A trying to create a conversation for User B.
2. **Privilege Escalation**: User trying to set `role: 'admin'` in their profile update.
3. **Orphaned Message**: Trying to write a message to a conversation ID that doesn't exist for the user.
4. **ID Poisoning**: Injecting 1MB string as a `convId`.
5. **Waitlist Manipulation**: An unauthenticated user reading the entire waitlist.
6. **Log Deletion**: User trying to delete an audit log document.
7. **Analytics Tampering**: User incrementing their own "usage count" artificially.
8. **Shadow Field Injection**: Adding `isVerified: true` to a profile update message.
9. **Timestamp Spoofing**: Setting `createdAt` to a date in 2020.
10. **State Bypassing**: Updating message content after it has been sent (immutability).
11. **PII Leak**: Authenticated user trying to list all user documents to find emails.
12. **Cross-Service Read**: User trying to read another user's conversation by guessing the ID.

## Test Runner (Conceptual)
All tests defined in `firestore.rules.test.ts` (if we were running a full test suite) would verify `PERMISSION_DENIED` for above.
