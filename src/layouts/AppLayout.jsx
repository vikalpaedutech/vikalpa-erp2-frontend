import {
  Outlet,
  NavLink,
  useLocation,
} from "react-router-dom";

import { useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  navigationItems,
  administrationItems,
  SIDEBAR_SECTIONS,
} from "../config/navigation";


/*
|--------------------------------------------------------------------------
| ICONS
|--------------------------------------------------------------------------
*/

const Icons = {
  dashboard: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),

  students: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  attendance: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
      />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <path d="m8 15 2 2 5-5" />
    </svg>
  ),

  copyChecking: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M8 3h9a2 2 0 0 1 2 2v12" />
      <path d="M6 6H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1" />
      <path d="M8 3v4h7" />
      <path d="m8 13 2 2 4-4" />
    </svg>
  ),

  finance: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
      <path d="M15 15h2" />
    </svg>
  ),

  calling: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2
        19.79 19.79 0 0 1-8.63-3.07
        19.5 19.5 0 0 1-6-6
        19.79 19.79 0 0 1-3.07-8.67
        A2 2 0 0 1 4.11 2h3
        a2 2 0 0 1 2 1.72
        12.84 12.84 0 0 0 .7 2.81
        2 2 0 0 1-.45 2.11L8.09 9.91
        a16 16 0 0 0 6 6l1.27-1.27
        a2 2 0 0 1 2.11-.45
        12.84 12.84 0 0 0 2.81.7
        A2 2 0 0 1 22 16.92z"
      />
    </svg>
  ),

  admin: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M12 2l8 4v6c0 5-3.5 8.5-8 10
        -4.5-1.5-8-5-8-10V6l8-4z"
      />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),

  region: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
      <circle cx="7" cy="6" r="2" />
      <circle cx="15" cy="12" r="2" />
      <circle cx="9" cy="18" r="2" />
    </svg>
  ),

  users: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5
        a4 4 0 0 0-4 4v2"
      />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  settings: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0
        .33 1.82l.06.06a2 2 0 1 1-2.83 2.83
        l-.06-.06a1.65 1.65 0 0 0-1.82-.33
        1.65 1.65 0 0 0-1 1.51V21
        a2 2 0 1 1-4 0v-.09
        A1.65 1.65 0 0 0 7 19.4
        a1.65 1.65 0 0 0-1.82.33l-.06.06
        a2 2 0 1 1-2.83-2.83l.06-.06
        A1.65 1.65 0 0 0 2.6 15
        1.65 1.65 0 0 0 1.51-1H4
        a2 2 0 1 1 0-4h.09
        A1.65 1.65 0 0 0 5 7
        a1.65 1.65 0 0 0-.33-1.82l-.06-.06
        a2 2 0 1 1 2.83-2.83l.06.06
        A1.65 1.65 0 0 0 9.4 2.6
        1.65 1.65 0 0 0 1-1.51V1
        a2 2 0 1 1 4 0v.09
        A1.65 1.65 0 0 0 15 2.6
        1.65 1.65 0 0 0 1.82-.33l.06-.06
        a2 2 0 1 1 2.83 2.83l-.06.06
        A1.65 1.65 0 0 0 19.4 9
        1.65 1.65 0 0 0 1.51 1H21
        a2 2 0 1 1 0 4h-.09
        A1.65 1.65 0 0 0 19.4 15z"
      />
    </svg>
  ),

  menu: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  ),

  close: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-6 w-6"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  ),

  bell: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        d="M18 8a6 6 0 0 0-12 0
        c0 7-3 7-3 9h18c0-2-3-2-3-9"
      />
      <path d="M10 21h4" />
    </svg>
  ),

  logout: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  ),

  chevron: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
};


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getIcon = (item) => {

  const path =
    item.path || "";


  if (
    path === "/dashboard"
  ) {
    return Icons.dashboard;
  }


  if (
    path === "/copy-checking" ||
    path.includes("copy-checking")
  ) {
    return Icons.copyChecking;
  }


  if (
    path.includes("attendance")
  ) {
    return Icons.attendance;
  }


  if (
    path.includes("student")
  ) {
    return Icons.students;
  }


  if (
    path.includes("finance") ||
    path.includes("bill")
  ) {
    return Icons.finance;
  }


  if (
    path.includes("calling")
  ) {
    return Icons.calling;
  }


  if (
    path.includes("region") ||
    path.includes("district") ||
    path.includes("block") ||
    path.includes("center")
  ) {
    return Icons.region;
  }


  if (
    path.includes("user") ||
    path.includes("role")
  ) {
    return Icons.users;
  }


  return Icons.settings;
};


const getSection = (item) => item.section || "Administration";


/*
|--------------------------------------------------------------------------
| APP LAYOUT
|--------------------------------------------------------------------------
*/

function AppLayout() {

  const {
    user,
    logout,
    access,
    isAdmin,
  } = useAuth();


  const location =
    useLocation();


  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [collapsedSections, setCollapsedSections] = useState(() => new Set(SIDEBAR_SECTIONS));

  const toggleSection = (section) => {
    setCollapsedSections((current) => {
      const next = new Set(current);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };


  /*
   * ------------------------------------------------------------
   * ROLE EXTRACTION
   * ------------------------------------------------------------
   */

  const roleCodes =
    access?.roles
      ?.map((role) => {

        if (
          typeof role === "string"
        ) {
          return role.toLowerCase();
        }


        return (
          role?.roleCode ||
          role?.code ||
          role?.name ||
          ""
        ).toLowerCase();

      })
      .filter(Boolean) || [];


  /*
   * ------------------------------------------------------------
   * NAVIGATION FILTER
   * ------------------------------------------------------------
   */

  const canViewItem = (item) => {
    if (isAdmin) return true;
    if (!item.permission) return false;
    const required = String(item.permission).trim().toLowerCase();
    const codes = new Set(
      (access?.permissions || []).map(
        (p) => String(p?.permissionCode || "").trim().toLowerCase()
      )
    );
    return (
      codes.has(required) ||
      (required.startsWith("dashboard.") &&
        required.endsWith(".view") &&
        codes.has("dashboard.view"))
    );
  };


  const visibleNavigationItems = navigationItems.filter(canViewItem);
  const visibleAdministrationItems = administrationItems.filter(canViewItem);

  // Dashboard is a global/pinned entry and must never be duplicated
  // inside Administration or any other collapsible section.
  const groupedNavigation = [
    ...visibleNavigationItems,
    ...visibleAdministrationItems,
  ]
    .filter((item) => item.path !== "/dashboard")
    .reduce((groups, item) => {
      const section = getSection(item);
      if (!groups[section]) groups[section] = [];
      groups[section].push(item);
      return groups;
    }, {});

  // Keep the configured hierarchy first, but never silently drop a valid
  // navigation section that exists in navigation.js. This is important for
  // legacy/academic/admin sections that may not yet be listed in the primary
  // SIDEBAR_SECTIONS array.
  const sidebarSectionOrder = [
    ...SIDEBAR_SECTIONS,
    ...Object.keys(groupedNavigation).filter(
      (section) => !SIDEBAR_SECTIONS.includes(section)
    ),
  ];


  /*
   * ------------------------------------------------------------
   * LOGOUT
   * ------------------------------------------------------------
   */

  const handleLogout = async () => {

    await logout();

  };


  /*
   * ------------------------------------------------------------
   * CLOSE MOBILE SIDEBAR
   * ------------------------------------------------------------
   */

  const handleNavigation = () => {

    setSidebarOpen(false);

  };


  /*
   * ------------------------------------------------------------
   * PAGE TITLE
   * ------------------------------------------------------------
   */

  const getPageTitle = () => {

    if (
      location.pathname ===
      "/dashboard"
    ) {
      return "Dashboard";
    }


    const currentItem =
      [
        ...navigationItems,
        ...administrationItems,
      ].find((item) => {

        if (
          location.pathname ===
          item.path
        ) {
          return true;
        }


        return location.pathname.startsWith(
          `${item.path}/`
        );

      });


    return (
      currentItem?.label ||
      "Management"
    );

  };


  return (
    <div className="flex min-h-screen bg-slate-50">


      {/* ========================================================
          MOBILE OVERLAY
      ======================================================== */}

      {sidebarOpen && (

        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />

      )}


      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-[min(92vw,292px)] flex-col lg:w-[292px]
          border-r border-slate-200/80
          bg-white
          shadow-[8px_0_30px_-24px_rgba(15,23,42,0.35)]
          transition-transform duration-300
          lg:sticky lg:top-0 lg:z-30
          lg:h-screen
          lg:translate-x-0
          lg:shadow-none
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >


        {/* -------------------------------------------------------
            BRAND
        ------------------------------------------------------- */}

        <div className="flex h-[82px] items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white via-white to-slate-50 px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-extrabold text-white shadow-lg shadow-blue-200/60 ring-4 ring-blue-50">
              S
            </div>

            <div>

              <h1 className="text-[17px] font-extrabold tracking-tight text-slate-950">
                VIKALPA
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Management System
              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
          >
            {Icons.close}
          </button>

        </div>


        {/* -------------------------------------------------------
            NAVIGATION
        ------------------------------------------------------- */}

        <nav className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">

          {/* Dashboard stays pinned at the top */}
          {visibleNavigationItems.filter((item) => !item.section).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavigation}
              className={({ isActive }) => `group mb-2 flex items-center gap-3 rounded-2xl px-3.5 py-3.5 text-[14px] font-semibold transition-all duration-200 ${isActive ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/60" : "text-slate-800 hover:bg-slate-50 hover:text-slate-950"}`}
            >
              <span className="shrink-0">{getIcon(item)}</span>
              <span className="whitespace-normal break-words leading-5">{item.label}</span>
            </NavLink>
          ))}

          {/* Collapsible sidebar sections */}
          {sidebarSectionOrder.filter((section) => groupedNavigation[section]?.length).map((section) => {
            const items = groupedNavigation[section];
            const collapsed = collapsedSections.has(section);
            return (
              <div key={section} className="mt-3">
                <button
                  type="button"
                  onClick={() => toggleSection(section)}
                  className="group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-colors duration-200 hover:bg-slate-50"
                  aria-expanded={!collapsed}
                >
                  <span className="text-[12px] font-extrabold uppercase tracking-[0.10em] text-slate-900 group-hover:text-slate-950">{section}</span>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 group-hover:bg-slate-100 group-hover:text-slate-800 ${collapsed ? "rotate-0" : "rotate-90"}`}>{Icons.chevron}</span>
                </button>

                {!collapsed && (
                  <div className="mt-1 space-y-0.5">
                    {items.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={handleNavigation}
                        className={({ isActive }) => `group flex items-start gap-3 rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 shadow-sm"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                        }`}
                      >
                        <span className="mt-0.5 shrink-0">{getIcon(item)}</span>
                        <span className="min-w-0 flex-1 whitespace-normal break-words leading-5">
                          {item.label}
                        </span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

        </nav>

        {/* -------------------------------------------------------
            USER AREA
        ------------------------------------------------------- */}

        <div className="border-t border-slate-200 bg-white p-3">

          <div className="mb-2 flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white p-3 shadow-sm">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-extrabold text-blue-700 ring-1 ring-blue-200/60">

              {(
                user?.name ||
                "U"
              )
                .charAt(0)
                .toUpperCase()}

            </div>


            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-slate-800">
                {user?.name ||
                  "User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email ||
                  ""}
              </p>

            </div>

          </div>


          <NavLink
            to="/change-password"
            onClick={
              handleNavigation
            }
            className="mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >

            {Icons.settings}

            <span>
              Change Password
            </span>

          </NavLink>


          <button
            type="button"
            onClick={
              handleLogout
            }
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >

            {Icons.logout}

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* ========================================================
          MAIN AREA
      ======================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">


        {/* ======================================================
            TOP HEADER
        ====================================================== */}

        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">


          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              {Icons.menu}
            </button>


            <div className="min-w-0">

              <p className="hidden text-xs font-medium text-slate-400 sm:block">
                Vikalpa ERP
              </p>

              <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                {getPageTitle()}
              </h2>

            </div>

          </div>


          {/* RIGHT */}

          <div className="flex items-center gap-2 sm:gap-4">


            {/* Notification */}

            <button
              type="button"
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Notifications"
            >

              {Icons.bell}

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />

            </button>


            {/* Divider */}

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />


            {/* User */}

            <div className="hidden items-center gap-3 sm:flex">

              <div className="text-right">

                <p className="text-sm font-semibold text-slate-800">
                  {user?.name ||
                    "User"}
                </p>

                <p className="text-xs text-slate-500">
                  {isAdmin
                    ? "Administrator"
                    : "ERP User"}
                </p>

              </div>


              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">

                {(
                  user?.name ||
                  "U"
                )
                  .charAt(0)
                  .toUpperCase()}

              </div>

            </div>


          </div>

        </header>


        {/* ======================================================
            PAGE CONTENT
        ====================================================== */}

        <main className="min-w-0 flex-1 bg-slate-50/80 p-4 sm:p-6">

          <Outlet />

        </main>


      </div>

    </div>
  );
}

export default AppLayout;