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
