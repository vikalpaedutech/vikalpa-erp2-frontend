# ERP Frontend Update

## Attendance
- `/attendance/my` now displays and exports check-in/check-out times.
- Attendance entry has a Check Out action after check-in.
- Existing attendance dashboard/access-based attendance functionality preserved.
- `/attendance` retains Dashboard and Apply Leave actions.

## Leave
- Apply Leave now supports multiple PDF/image attachments.
- My Leaves has a View action for complete leave details.
- Leave detail shows:
  - complete reason
  - remarks
  - attachments
  - status
  - approval history
  - approver remarks/rejection/approval reasons
  - balance at application
- Leave Approvals now opens a dedicated review page.
- Approver can review the complete application and approve/reject from that page.
- Leave pages are rendered inside AppLayout so the sidebar remains available.

## User Management
- Added Bulk Onboard Users page.
- Added Download Template.
- Added upload for CSV/XLS/XLSX.
- Added bulk onboarding button on Users page.
- Added active/inactive field to user create/edit UI.

No existing Access Based Attendance implementation was intentionally replaced.


## HR Management permissions, Employee profiles and attendance export
- Added HR Management permission module entries for Employee Profile, Attendance Management, Bulk Attendance, Leave Types, Leave Policies, Leave Accrual Report, Leave Approval Rules, Leave Balance Management and Attendance Export. Existing permission codes are retained so existing assignments remain compatible.
- HR pages are now permission-gated at route level; admin bypass remains supported by AuthContext.
- Added Employee Directory and Employee Profile routes at `/admin/employees` and `/admin/employees/:employeeId`. Profiles use the existing user-management APIs and never expose password/token fields from the backend.
- Added Export Excel action to Attendance Management. It exports the currently displayed roster and active filters as an Excel-compatible UTF-8 CSV file.
- New permission records are seeded by the existing startup permission seeder. Restart backend once so permissions appear in User Permissions and Role Permissions.
