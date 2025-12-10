# TODO: Implement Budget-Transaction Linking with Cascading Deletes

- [x] Confirmed that budgets already have unique identifiers via auto-incrementing `id` field
- [x] Created migration to change budget_id foreign key to cascade delete
- [x] Run the migration to update database
- [ ] Test budget deletion to ensure transactions are deleted
