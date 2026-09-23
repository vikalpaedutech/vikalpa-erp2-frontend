// // C:\Users\shubh\OneDrive\Desktop\vikalpaerpv2\frontend\src\config\navigation.js

export const navigationItems = [
  { label: "Dashboard", path: "/dashboard", permission: "dashboard.view", section: null },
  { label: "Attendance", path: "/attendance", permission: "attendance.view", section: "Attendance & Reports" },
  { label: "My Attendance & Reports", path: "/attendance/my", permission: "attendance.report.view", section: "Attendance & Reports" },
  { label: "Leave Dashboard", path: "/leave/dashboard", permission: "leave.dashboard.view", section: "Attendance & Reports" },
  { label: "Apply Leave", path: "/leave/apply", permission: "leave.apply", section: "Attendance & Reports" },
  { label: "My Leaves", path: "/leave/my", permission: "leave.my.view", section: "Attendance & Reports" },
  { label: "Leave Approvals", path: "/leave/approvals", permission: "leave.approval.view", section: "Attendance & Reports" },
];

export const administrationItems = [
  // ============================================================
  // DASHBOARDS
  // ============================================================
  { label: "Students Dashboard", path: "/dashboards/students", permission: "dashboard.students.view", section: "Dashboards" },
  { label: "Attendance Dashboard", path: "/dashboards/attendance", permission: "dashboard.attendance.view", section: "Dashboards" },
  { label: "Student Attendance", path: "/dashboards/student-attendance", permission: "dashboard.student-attendance.view", section: "Dashboards" },
  { label: "Absentee Calling Overview", path: "/dashboards/absentee-calling-overview", permission: "dashboard.absentee-calling-overview.view", section: "Dashboards" },
  { label: "Absentee Calling", path: "/dashboards/absentee-calling", permission: "dashboard.absentee-calling.view", section: "Dashboards" },
  { label: "Center Attendance Upload", path: "/dashboards/center-attendance-upload", permission: "dashboard.center-attendance-upload.view", section: "Dashboards" },
  { label: "Download Students", path: "/dashboards/download-students", permission: "dashboard.download-students.view", section: "Dashboards" },
  { label: "Exams & Marks Upload", path: "/dashboards/exams-marks", permission: "dashboard.exams-marks.view", section: "Dashboards" },
  { label: "Monitoring Report", path: "/center-monitoring/report", permission: "monitoring.report.view", section: "Dashboards" },
  { label: "Copy Checking Dashboard", path: "/dashboards/copy-checking", permission: "dashboard.copy-checking.view", section: "Dashboards" },

  // ============================================================
  // USER & ACCESS
  // ============================================================
  { label: "Roles", path: "/admin/roles", permission: "role.manage", section: "USER & ACCESS", group: "Permission Administrations", roles: ["admin"] },
  { label: "Permissions", path: "/admin/permissions", permission: "permission.manage", section: "USER & ACCESS", group: "Permission Administrations", roles: ["admin"] },
  { label: "User Permissions", path: "/admin/user-permissions", permission: "user-permission.manage", section: "USER & ACCESS", group: "User Administrations", roles: ["admin"] },
  { label: "Role Permissions", path: "/admin/role-permissions", permission: "role-permission.manage", section: "USER & ACCESS", group: "User Administrations", roles: ["admin"] },
  { label: "Users", path: "/admin/users", permission: "user.manage", section: "USER & ACCESS", group: "User Administrations", roles: ["admin"] },
  { label: "Bulk Onboard Users", path: "/admin/users/bulk-onboard", roles: ["admin"], section: "USER & ACCESS", group: "User Administrations" },
  { label: "User Roles", path: "/admin/user-roles", permission: "user-role.manage", section: "USER & ACCESS", group: "User Administrations", roles: ["admin"] },
  { label: "User Designation", path: "/admin/user-designations", permission: "user-designation.manage", section: "USER & ACCESS", group: "User Administrations", roles: ["admin"] },
  { label: "User Access", path: "/admin/user-access", permission: "user-access.manage", section: "USER & ACCESS", group: "User Administrations", roles: ["admin"] },
  { label: "User Region Access", path: "/admin/user-region-access", permission: "user-region-access.manage", section: "USER & ACCESS", group: "User Administrations", roles: ["admin"] },

  // ============================================================
  // STUDENT MANAGEMENT
  // ============================================================
  { label: "Students", path: "/students", permission: "student.view", section: "STUDENT MANAGEMENT", group: "Students Administrations", roles: ["admin", "cm", "cc", "aci"] },
  { label: "Onboard Students", path: "/students/onboard", permission: "student.create", section: "STUDENT MANAGEMENT", group: "Students Administrations", roles: ["admin"] },
  { label: "Bulk Onboard Students", path: "/students/bulk-onboard", permission: "student.bulk.create", section: "STUDENT MANAGEMENT", group: "Students Administrations", roles: ["admin"] },
  { label: "Student SLC, Add, Transfer Request", path: "/student-requests", permission: "student.request.view", section: "STUDENT MANAGEMENT", group: "Students Administrations", roles: ["admin", "cm"] },
  { label: "Center Monitoring Management", path: "/center-monitoring-management", permission: "monitoring.manage", section: "STUDENT MANAGEMENT", group: "Center Monitoring Management", roles: ["admin"] },
  { label: "Center Monitoring", path: "/center-monitoring", permission: "monitoring.view", section: "STUDENT MANAGEMENT", group: "Center Monitoring Management", roles: ["cm", "cc", "aci", "admin"] },
  { label: "Student Attendance", path: "/student-attendance", permission: "student-attendance.view", section: "STUDENT MANAGEMENT", group: "Student Management", roles: ["admin", "cm", "cc"] },
  { label: "Copy Checking", path: "/copy-checking", permission: "copy-checking.view", section: "STUDENT MANAGEMENT", group: "Student Management", roles: ["admin", "cm", "cc", "aci"] },
  { label: "Class Interaction", path: "/class-interaction", permission: "class-interaction.view", section: "STUDENT MANAGEMENT", group: "Student Management", roles: ["admin", "cm", "cc", "aci"] },
  { label: "Upload Class PDF", path: "/center-wise-attendance", permission: "center-attendance.view", section: "STUDENT MANAGEMENT", group: "Student Management", roles: ["admin", "cm", "cc", "aci"] },
  { label: "User Attendance", path: "/admin/attendance/access-based", permission: "attendance.access.manage", section: "STUDENT MANAGEMENT", group: "Student Management", roles: ["admin", "aci", "cm"] },
  { label: "Exams/Marks Upload", path: "/exams", permission: "exam.view", section: "ACADEMIC MANAGEMENT", group: "Exam Management", roles: ["admin", "cc", "aci"] },
  { label: "Exam Management", path: "/exam-management", permission: "exam.manage", section: "ACADEMIC MANAGEMENT", group: "Exam Management", roles: ["admin"] },

  // ============================================================
  // REGION MANAGEMENT
  // ============================================================
  { label: "Districts", path: "/admin/districts", permission: "region.district.view", section: "REGION MANAGEMENT", group: "Program, Batch, Region Admin", roles: ["admin", "cm"] },
  { label: "Blocks", path: "/admin/blocks", permission: "region.block.view", section: "REGION MANAGEMENT", group: "Program, Batch, Region Admin", roles: ["admin", "cm"] },
  { label: "Centers", path: "/admin/centers", permission: "region.center.view", section: "REGION MANAGEMENT", group: "Program, Batch, Region Admin", roles: ["admin", "cm"] },
  { label: "Programs", path: "/admin/programs", permission: "program.view", section: "ADMINISTRATIONS", group: "Program, Batch, Region Admin", roles: ["admin"] },
  { label: "Batches", path: "/admin/batches", permission: "batch.view", section: "ADMINISTRATIONS", group: "Program, Batch, Region Admin", roles: ["admin"] },
  { label: "Department", path: "/admin/departments", permission: "department.manage", section: "ADMINISTRATIONS", group: "Program, Batch, Region Admin", roles: ["admin"] },
  { label: "Designation", path: "/admin/designations", permission: "designation.manage", section: "ADMINISTRATIONS", group: "Program, Batch, Region Admin", roles: ["admin"] },

  // ============================================================
  // FINANCE
  // ============================================================
  { label: "Bills", path: "/finance/bills", permission: "finance.bill.view", section: "FINANCE", roles: ["admin", "cm", "cc", "aci"] },
  { label: "Bill Verification", path: "/finance/bill-verification", permission: "finance.bill.verify", section: "FINANCE", roles: ["admin", "aci", "cm"] },
  { label: "Bill Approval", path: "/finance/bill-approval", permission: "finance.bill.approve", section: "FINANCE", roles: ["admin", "cm", "aci"] },
  { label: "Bill Auditor", path: "/admin/bill-auditors", permission: "finance.auditor.manage", section: "FINANCE", roles: ["admin"] },
  { label: "Bill Dashboard", path: "/finance/bill-dashboard", permission: "finance.dashboard.view", section: "FINANCE", roles: ["admin", "cm"] },

  // ============================================================
  // ADMINISTRATIONS / HR / GAMIFICATION
  // ============================================================
  { label: "Attendance Management", path: "/admin/attendance", permission: "attendance.manage", section: "HR MANAGEMENT", group: "Attendance Management" },
  { label: "Leave Types", path: "/admin/leave-types", permission: "leave.type.manage", section: "HR MANAGEMENT", group: "Attendance Management", roles: ["admin"] },
  { label: "Leave Approval Rules", path: "/admin/leave-approval-rules", permission: "leave.rule.manage", section: "HR MANAGEMENT", group: "Attendance Management", roles: ["admin"] },
  { label: "Leave Balance Management", path: "/admin/leave-balances", permission: "leave.balance.manage", section: "HR MANAGEMENT", group: "Attendance Management", roles: ["admin"] },

  { label: "Gamification Eligible Roles", path: "/admin/gamification/roles", permission: "gamification.role.manage", section: "GAMIFICATION ADMINISTRATIONS", roles: ["admin"] },
  { label: "Gamification Dashboard", path: "/admin/gamification", permission: "gamification.manage", section: "GAMIFICATION ADMINISTRATIONS", roles: ["admin"] },
  { label: "Gamification Criteria", path: "/admin/gamification/criteria", permission: "gamification.criteria.manage", section: "GAMIFICATION ADMINISTRATIONS", roles: ["admin"] },
  { label: "Gamification Participants", path: "/admin/gamification/participants", permission: "gamification.participant.manage", section: "GAMIFICATION ADMINISTRATIONS", roles: ["admin"] },

  // ============================================================
  // CALLING MANAGEMENT
  // ============================================================
  { label: "Calling Types", path: "/calling/types", permission: "calling-type.manage", section: "CALLING MANAGEMENT", group: "Calling Administration", roles: ["admin"] },
  { label: "Calling Details", path: "/calling/details", permission: "calling-detail.manage", section: "CALLING MANAGEMENT", group: "Calling Administration", roles: ["admin", "cm"] },
  { label: "Call History", path: "/calling/history", permission: "calling.history.view", section: "CALLING MANAGEMENT", group: "Calling Administration", roles: ["admin", "cm"] },
  { label: "Calls", path: "/calling/calls", permission: "calling.view", section: "CALLING MANAGEMENT", group: "Calling Management", roles: ["admin", "cm", "cc", "aci"] },
  { label: "Absentee Calling", path: "/calling/absentee-calling", permission: "calling.absentee.view", section: "CALLING MANAGEMENT", group: "Calling Management", roles: ["admin", "cm", "cc", "aci"] },
];

export const SIDEBAR_SECTIONS = [
  "Attendance & Reports",
  "Dashboards",
  "User & Access",
  "Student Management",
  "Region Management",
  "Finance",
  "HR Management",
  "Gamification Administrations",
  "Calling Management",
];
