import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";

import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import ChangePassword from "../pages/auth/ChangePassword";

import Programs from "../pages/admin/Programs";
import Batches from "../pages/admin/Batches";
import Districts from "../pages/admin/Districts";
import Blocks from "../pages/admin/Blocks";
import Centers from "../pages/admin/Centers";
import Permissions from "../pages/admin/Permissions";
import Roles from "../pages/admin/Roles";
import RolePermissions from "../pages/admin/RolePermissions";
import Users from "../pages/admin/Users";
import UserRoles from "../pages/admin/UserRoles";
import UserDesignations from "../pages/admin/UserDesignations";
import UserAccess from "../pages/admin/UserAccess";
import UserRegionAccess from "../pages/admin/UserRegionAccess";
import Departments from "../pages/admin/Departments";
import Designations from "../pages/admin/Designations";
import BulkOnboardUsers from "../pages/admin/BulkOnboardUsers";

import OnboardStudent from "../pages/admin/OnboardStudent";
import BulkOnboardStudents from "../pages/admin/BulkOnboardStudents";
import StudentRequests from "../pages/admin/StudentRequests";

import StudentAttendance from "../features/student-attendance/pages/StudentAttendance";

import Students from "../features/students/pages/Students";
import StudentDetails from "../features/students/pages/StudentDetails";

import Bills from "../features/finance/pages/Bills";
import BillDetails from "../features/finance/pages/BillDetails";
import BillVerification from "../features/finance/pages/BillVerification";
import BillApproval from "../features/finance/pages/BillApproval";
import BillAuditors from "../features/finance/pages/BillAuditors";
import BillDashboard from "../features/finance/pages/BillDashboard";

import CallingTypes from "../features/calling/pages/CallingTypes";
import CallingDetails from "../features/calling/pages/CallingDetails";
import Calls from "../features/calling/pages/Calls";
import CallHistory from "../features/calling/pages/CallHistory";
import AbsenteeCalling from "../features/calling/pages/AbsenteeCalling";

import CenterWiseAttendance from "../features/centerwise-attendance/pages/CenterWiseAttendance";

import Exams from "../features/exams/pages/Exams";
import CreateExam from "../features/exams/pages/CreateExam";
import ExamStudents from "../features/exams/pages/ExamStudents";

import ExamManagement from "../features/exams/pages/ExamManagement";
import CreateExamManagement from "../features/exams/pages/CreateExamManagement";
import EditExamManagement from "../features/exams/pages/EditExamManagement";

import StudentCopyChecking from "../features/student-copy-checking/pages/StudentCopyChecking";

import ClassInteraction from "../features/class-interaction/pages/ClassInteraction";
import ClassInteractionReport from "../features/class-interaction/pages/ClassInteractionReport";

import CenterMonitoring from "../features/center-monitoring/pages/CenterMonitoring";
import CenterMonitoringManagement from "../features/center-monitoring/pages/CenterMonitoringManagement";

import MonitoringReport from "../features/center-monitoring/pages/MonitoringReport";
// import MonitoringIndividualReport from "../features/center-monitoring/pages/MonitoringIndividualReport";

import MonitoringIndividualReport from "../features/center-monitoring/pages/MonitoringIndividualReport"
import AttendanceEntry from "../features/user-attendance/pages/AttendanceEntry";

import MyAttendance from "../features/user-attendance/pages/MyAttendance";
import ApplyLeave from "../features/user-leave/pages/ApplyLeave";
import MyLeaves from "../features/user-leave/pages/MyLeaves";
import LeaveApprovals from "../features/user-leave/pages/LeaveApprovals";
import LeaveDashboard from "../features/user-leave/pages/LeaveDashboard";
import LeaveTypes from "../features/user-leave/pages/LeaveTypes";
import LeaveApprovalRules from "../features/user-leave/pages/LeaveApprovalRules";
import LeaveBalanceManagement from "../features/user-leave/pages/LeaveBalanceManagement";
import LeaveDetails from "../features/user-leave/pages/LeaveDetails";
import LeaveApprovalDetails from "../features/user-leave/pages/LeaveApprovalDetails";

import AttendanceManagement from "../features/admin-attendance/pages/AttendanceManagement";
import AccessBasedAttendance from "../features/admin-attendance/pages/AccessBasedAttendance";
import GamificationDashboard from "../features/gamification/pages/GamificationDashboard";
import GamificationRoles from "../features/gamification/pages/GamificationRoles";
import GamificationParticipants from "../features/gamification/pages/GamificationParticipants";
import GamificationCriteria from "../features/gamification/pages/GamificationCriteria";
import UserPermissions from "../pages/admin/UserPermissions";
import DashboardAnalytics from "../features/analytics/pages/DashboardAnalytics";
import StudentsDashboard from "../features/dashboards/pages/StudentsDashboard";
import StudentAttendanceDashboard from "../features/dashboards/pages/StudentAttendanceDashboard";
import AbsenteeCallingDashboard from "../features/dashboards/pages/AbsenteeCallingDashboard";
import AbsenteeCallingOverviewDashboard from "../features/dashboards/pages/AbsenteeCallingOverviewDashboard";
import CenterAttendanceUploadDashboard from "../features/dashboards/pages/CenterAttendanceUploadDashboard";
import AttendanceDashboard from "../features/dashboards/pages/AttendanceDashboard";
import DownloadStudentsDashboard from "../features/dashboards/pages/DownloadStudentsDashboard";
import ExamsMarksDashboard from "../features/dashboards/pages/ExamsMarksDashboard";
import CopyCheckingDashboard from "../features/dashboards/pages/CopyCheckingDashboard";

function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/forgot-password/:resetToken"
          element={<ResetPassword />}
        />


        {/* =====================================================
            PROTECTED ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute />}>

          {/* ===================================================
              APPLICATION LAYOUT
          =================================================== */}

          <Route element={<AppLayout />}>

            {/* =================================================
                DASHBOARD
            ================================================= */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
            <Route path="/dashboards/students" element={<StudentsDashboard />} />
            <Route path="/dashboards/attendance" element={<AttendanceDashboard />} />
            <Route path="/dashboards/student-attendance" element={<StudentAttendanceDashboard />} />
            <Route path="/dashboards/absentee-calling-overview" element={<AbsenteeCallingOverviewDashboard />} />
            <Route path="/dashboards/absentee-calling" element={<AbsenteeCallingDashboard />} />
            <Route path="/dashboards/center-attendance-upload" element={<CenterAttendanceUploadDashboard />} />
            <Route path="/dashboards/download-students" element={<DownloadStudentsDashboard />} />
            <Route path="/dashboards/exams-marks" element={<ExamsMarksDashboard />} />
            <Route path="/dashboards/copy-checking" element={<CopyCheckingDashboard />} />

            <Route
              path="/change-password"
              element={<ChangePassword />}
            />


            {/* =================================================
                STUDENTS
            ================================================= */}

            <Route
              path="/students"
              element={<Students />}
            />

            <Route
              path="/students/:studentId"
              element={<StudentDetails />}
            />

            <Route
              path="/students/onboard"
              element={<OnboardStudent />}
            />

            <Route
              path="/students/bulk-onboard"
              element={
                <BulkOnboardStudents />
              }
            />

            <Route
              path="/student-requests"
              element={
                <StudentRequests />
              }
            />

            <Route
              path="/student-attendance"
              element={
                <StudentAttendance />
              }
            />

            <Route
              path="/center-wise-attendance"
              element={
                <CenterWiseAttendance />
              }
            />


            {/* =================================================
                COPY CHECKING
            ================================================= */}

            <Route
              path="/copy-checking"
              element={
                <StudentCopyChecking />
              }
            />


            {/* =================================================
                CLASS INTERACTION
            ================================================= */}

            <Route
              path="/class-interaction"
              element={
                <ClassInteraction />
              }
            />

            <Route
              path="/class-interaction/report"
              element={
                <ClassInteractionReport />
              }
            />


            {/* =================================================
                CENTER MONITORING
            ================================================= */}

            <Route
              path="/center-monitoring"
              element={
                <CenterMonitoring />
              }
            />

            <Route
              path="/center-monitoring/my-report"
              element={
                <MonitoringIndividualReport />
              }
            />

            <Route
              path="/center-monitoring/report"
              element={
                <MonitoringReport />
              }
            />

            <Route
              path="/center-monitoring-management"
              element={
                <CenterMonitoringManagement />
              }
            />


            {/* =================================================
                FINANCE
            ================================================= */}

            <Route
              path="/finance/bills"
              element={
                <Bills />
              }
            />

            <Route
              path="/finance/bills/:billId"
              element={
                <BillDetails />
              }
            />

            <Route
              path="/finance/bill-verification"
              element={
                <BillVerification />
              }
            />

            <Route
              path="/finance/bill-approval"
              element={
                <BillApproval />
              }
            />

            <Route
              path="/admin/bill-auditors"
              element={
                <BillAuditors />
              }
            />

            <Route
              path="/finance/bill-dashboard"
              element={
                <BillDashboard />
              }
            />


            {/* =================================================
                ADMINISTRATION
            ================================================= */}

            <Route
              path="/admin/programs"
              element={
                <Programs />
              }
            />

            <Route
              path="/admin/batches"
              element={
                <Batches />
              }
            />

            <Route
              path="/admin/districts"
              element={
                <Districts />
              }
            />

            <Route
              path="/admin/blocks"
              element={
                <Blocks />
              }
            />

            <Route
              path="/admin/centers"
              element={
                <Centers />
              }
            />

            <Route
              path="/admin/permissions"
              element={
                <Permissions />
              }
            />

            <Route
              path="/admin/roles"
              element={
                <Roles />
              }
            />

            <Route
              path="/admin/role-permissions"
              element={
                <RolePermissions />
              }
            />

            <Route
              path="/admin/users"
              element={
                <Users />
              }
            />

            <Route
              path="/admin/users/bulk-onboard"
              element={
                <BulkOnboardUsers />
              }
            />

            <Route
              path="/admin/user-roles"
              element={
                <UserRoles />
              }
            />

            <Route
              path="/admin/user-permissions"
              element={<UserPermissions />}
            />

            <Route
              path="/admin/user-designations"
              element={
                <UserDesignations />
              }
            />

            <Route
              path="/admin/user-access"
              element={
                <UserAccess />
              }
            />

            <Route
              path="/admin/user-region-access"
              element={
                <UserRegionAccess />
              }
            />

            <Route
              path="/admin/departments"
              element={
                <Departments />
              }
            />

            <Route
              path="/admin/designations"
              element={
                <Designations />
              }
            />

            <Route
              path="/exam-management"
              element={
                <ExamManagement />
              }
            />

            <Route
              path="/exam-management/create"
              element={
                <CreateExamManagement />
              }
            />

            <Route
              path="/exam-management/:examId/edit"
              element={
                <EditExamManagement />
              }
            />


            {/* =================================================
                CALLING MANAGEMENT
            ================================================= */}

            <Route
              path="/calling/types"
              element={
                <CallingTypes />
              }
            />

            <Route
              path="/calling/details"
              element={
                <CallingDetails />
              }
            />

            <Route
              path="/calling/calls"
              element={
                <Calls />
              }
            />

            <Route
              path="/calling/history"
              element={
                <CallHistory />
              }
            />

            <Route
              path="/calling/absentee-calling"
              element={
                <AbsenteeCalling />
              }
            />

            {/* =================================================
                LEAVE ADMINISTRATION
            ================================================= */}

            <Route
              path="/admin/leave-types"
              element={
                <LeaveTypes />
              }
            />

            <Route
              path="/admin/leave-approval-rules"
              element={
                <LeaveApprovalRules />
              }
            />

            <Route
              path="/admin/leave-balances"
              element={
                <LeaveBalanceManagement />
              }
            />

            {/* =================================================
                USER LEAVE MANAGEMENT
            ================================================= */}

            <Route
              path="/leave/dashboard"
              element={<LeaveDashboard />}
            />

            <Route
              path="/leave/apply"
              element={<ApplyLeave />}
            />

            <Route
              path="/leave/my"
              element={<MyLeaves />}
            />

            <Route
              path="/leave/my/:leaveId"
              element={<LeaveDetails />}
            />

            <Route
              path="/leave/approvals"
              element={<LeaveApprovals />}
            />

            <Route
              path="/leave/approvals/:leaveId"
              element={<LeaveApprovalDetails />}
            />

          </Route>


          {/* ===================================================
              EXAMS
          =================================================== */}

          <Route
            path="/exams"
            element={
              <Exams />
            }
          />

          <Route
            path="/exams/create"
            element={
              <CreateExam />
            }
          />

          <Route
            path="/exams/:examId/students"
            element={
              <ExamStudents />
            }
          />

<Route
  path="/attendance"
  element={<AttendanceEntry />}
/>

<Route
  path="/attendance/my"
  element={<MyAttendance />}
/>

<Route
  path="/admin/attendance"
  element={<AttendanceManagement />}
/>

<Route
  path="/admin/attendance/access-based"
  element={<AccessBasedAttendance />}
/>
            <Route
              path="/admin/gamification"
              element={<GamificationDashboard />}
            />

            <Route
              path="/admin/gamification/roles"
              element={<GamificationRoles />}
            />

            <Route
              path="/admin/gamification/participants"
              element={<GamificationParticipants />}
            />

            <Route
              path="/admin/gamification/criteria"
              element={<GamificationCriteria />}
            />

          {/* lastline */}

        </Route>


        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default AppRoutes;