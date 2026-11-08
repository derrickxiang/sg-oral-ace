# Security Specification (`security_spec.md`)

## 1. Data Invariants
1. **Master Gate & Relational Sync**:
   - `/users/{userId}` can only be read, created, or updated by the authenticated and email-verified user whose `request.auth.uid == userId`.
   - `/users/{userId}/private/{docId}` isolates PII (`email`, `activePlanName`) and requires `exists(/databases/$(database)/documents/users/$(userId))` and `request.auth.uid == userId`.
   - `/users/{userId}/practices/{practiceId}` requires that the parent `/users/{userId}` document exists and its `uid == request.auth.uid`.
2. **Strict Schema & Size Guards**:
   - Every string field enforces strict `.size()` bounds matching `firebase-blueprint.json`.
   - Document IDs (`userId`, `docId`, `practiceId`) must pass `isValidId()` (`size <= 128` and regex `^[a-zA-Z0-9_\-]+$`).
3. **Temporal & Identity Immutability**:
   - `uid` / `userId` and `createdAt` are immutable across updates, and timestamps must equal `request.time`.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on `/users/{userId}`**: Adding `"isAdmin": true` -> Rejected by `.keys().hasOnly(...)`.
2. **Identity Spoofing on `/users/{userId}`**: Creating profile where `incoming().uid != request.auth.uid` -> Rejected.
3. **Unverified Email Write**: Writing with `request.auth.token.email_verified == false` -> Rejected.
4. **Cross-User Profile Read (PII Leak)**: Reading `/users/otherUser/private/info` -> Rejected (`request.auth.uid == userId`).
5. **Oversized ID Poisoning**: Creating `/users/{userId}/practices/{1500_char_id}` -> Rejected by `isValidId(practiceId)`.
6. **Value Poisoning on `planTier`**: Setting `planTier: "unlimited_hack"` -> Rejected by enum check `['trial', 'monthly_pro', 'annual_pro', 'school_pass']`.
7. **Timestamp Forgery on Create**: Passing a past/future `createdAt` instead of `request.time` -> Rejected by `incoming().createdAt == request.time`.
8. **Immortal Field Mutation on Update**: Changing `createdAt` or `uid` during update -> Rejected by `incoming().createdAt == existing().createdAt && incoming().uid == existing().uid`.
9. **Orphaned Subcollection Write**: Creating `/users/{userId}/practices/{practiceId}` when `/users/{userId}` does not exist -> Rejected by `exists(...)` Master Gate.
10. **Negative or Out-of-Range Score**: Creating a practice record with `totalScore: 999` -> Rejected by `totalScore >= 0 && totalScore <= 50`.
11. **Denial-of-Wallet String Bomb**: Sending a 100KB `initialTranscript` -> Rejected by `initialTranscript.size() <= 5000`.
12. **Unauthorized Blanket List Query**: Listing `/users/{userId}/practices` as a different user -> Rejected by `request.auth.uid == userId && resource.data.userId == request.auth.uid`.
