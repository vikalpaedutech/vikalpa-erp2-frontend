# Leave + Attendance Frontend Setup

This frontend was updated against the supplied backend API structure.

## Preserved

- Existing Attendance Management page
- Existing Access Based Attendance page and its working filters/access logic
- Existing role-code based attendance access flow
- Existing student/finance/calling/etc. features

## Updated attendance

- User attendance camera submission uses multipart/form-data.
- Special attendance types require Visited Location + Remarks:
  - Orientation
  - Feild Visit
  - Event
  - Center Visit
- Non-CC users can select different attendance types and mark each type separately on the same date when the backend permits it.
- Attendance history has date/type/status filters.
- Attendance report downloads as an Excel-compatible `.xls` file without adding a new npm dependency.

## Leave frontend

Routes added:

- `/leave/dashboard`
- `/leave/apply`
- `/leave/my`
- `/leave/approvals`
- `/admin/leave-types`
- `/admin/leave-approval-rules`

Features:

- Leave type selection
- Full Day / Half Day application
- First Half / Second Half
- Server-compatible number of days calculation
- Future leave applications
- My Leaves filtering
- Pending leave withdrawal
- Future approved leave cancellation
- Approval dashboard
- Approve / Reject workflow
- Admin Leave Type CRUD/deactivation
- Admin Leave Approval Rule configuration
- Department -> Designation -> Approver mapping
- Leave dashboard summary and upcoming leaves

## Important backend limitation

The supplied backend currently has `UserLeaveBalance` and `LeaveBalanceTransaction` models and uses them during leave application/approval, but it does not expose dedicated balance-management GET/adjustment APIs in the supplied route set. Therefore this frontend does not invent balance APIs. A dedicated Leave Balance / HR Balance Management UI should be added after those backend APIs exist.
