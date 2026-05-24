import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M23 9v2h-2v7a3 3 0 01-3 3h-4v-6h-4v6H6a3 3 0 01-3-3v-7H1V9l11-9 11 9zm-6 5a5 5 0 10-10 0 5 5 0 0010 0z" opacity="0"/>
    <path d="M9 20H6a1 1 0 01-1-1v-7.586l7-7 7 7V19a1 1 0 01-1 1h-3v-5H9v5zm3-17.414L2.5 11H1V9L12 0l11 9v2h-1.5L12 2.586z"/>
  </svg>
);

const NetworkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 16v6H3v-6a9 9 0 019-9 9 9 0 019 9v6h-9zm0 0"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M22 19h-6a4 4 0 01-8 0H2l1.5-2.5C4 15.5 4 14 4 12a8 8 0 1116 0c0 2 0 3.5.5 4.5L22 19zM12 21a2 2 0 002-2h-4a2 2 0 002 2z"/>
  </svg>
);

const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M21 3H3a2 2 0 00-2 2v16l4-4h16a2 2 0 002-2V5a2 2 0 00-2-2zm0 12H4.83L3 16.83V5h18v10z"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#666">
    <path d="M15.5 14h-.79l-.28-.27A6.5 6.5 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications } = useNotification();
  const [searchVal, setSearchVal] = useState("");

  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const navItems = [
    { to: "/feed", label: "Accueil", Icon: HomeIcon },
    { to: "/network", label: "Réseau", Icon: NetworkIcon },
    { to: "/notifications", label: "Notifications", Icon: BellIcon, badge: unreadCount },
    { to: "/profile", label: "Profil", Icon: PersonIcon },
  ];

  const initials = user?.nom
    ? user.nom.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <header style={S.navbar}>
      <div style={S.inner}>
        {/* Brand */}
        <div style={S.brand} onClick={() => navigate("/feed")}>
          <div style={S.logoBox}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="white">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
            </svg>
          </div>
          <span style={S.brandText}>MiniLinkedIn</span>
        </div>

        {/* Search */}
        <div style={S.searchWrap} onClick={() => navigate("/search")}>
          <span style={S.searchIcon}><SearchIcon /></span>
          <input
            type="text"
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Rechercher..."
            style={S.searchInput}
          />
        </div>

        {/* Nav links */}
        <nav style={S.nav}>
          {navItems.map(({ to, label, Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({ ...S.navItem, ...(isActive ? S.navItemActive : {}) })}
            >
              {({ isActive }) => (
                <>
                  <div style={S.iconWrap}>
                    <span style={{ color: isActive ? "#000" : "#666" }}><Icon /></span>
                    {badge > 0 && <span style={S.badge}>{badge > 9 ? "9+" : badge}</span>}
                  </div>
                  <span style={{ ...S.navLabel, color: isActive ? "#000" : "#666", fontWeight: isActive ? "600" : "400" }}>
                    {label}
                  </span>
                  {isActive && <div style={S.activeBar} />}
                </>
              )}
            </NavLink>
          ))}

          {/* Divider */}
          <div style={S.divider} />

          {/* User */}
          <div style={S.userMenu}>
            <div style={S.avatar}>{initials}</div>
            <div style={S.userInfo}>
              <span style={S.userName}>{user?.nom || user?.email || "Mon compte"}</span>
              <span style={S.userRole}>{user?.role || ""}</span>
            </div>
            <button onClick={handleLogout} style={S.logoutBtn} title="Déconnexion">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#dc2626">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

const S = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "#fff",
    borderBottom: "1px solid #E0DFDC",
    boxShadow: "0 0 0 1px rgba(0,0,0,.08),0 2px 4px rgba(0,0,0,.04)",
  },
  inner: {
    maxWidth: "1128px",
    margin: "0 auto",
    height: "52px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 16px",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    flexShrink: 0,
    textDecoration: "none",
  },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: "4px",
    background: "#0A66C2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandText: {
    fontWeight: "700",
    fontSize: "17px",
    color: "#0A66C2",
    fontFamily: "'Georgia', serif",
    letterSpacing: "-0.3px",
  },
  searchWrap: {
    position: "relative",
    width: "260px",
    flexShrink: 0,
    marginLeft: "8px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
  },
  searchInput: {
    width: "100%",
    height: "34px",
    paddingLeft: "38px",
    paddingRight: "12px",
    border: "none",
    borderRadius: "4px",
    background: "#EEF3F8",
    outline: "none",
    fontSize: "14px",
    color: "#000",
    boxSizing: "border-box",
  },
  nav: {
    display: "flex",
    alignItems: "stretch",
    marginLeft: "auto",
    height: "52px",
  },
  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 12px",
    textDecoration: "none",
    position: "relative",
    cursor: "pointer",
    minWidth: "72px",
    borderBottom: "2px solid transparent",
    transition: "color 0.15s",
  },
  navItemActive: {
    borderBottomColor: "#000",
  },
  activeBar: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: "2px",
    background: "#000",
  },
  iconWrap: {
    position: "relative",
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navLabel: {
    fontSize: "12px",
    marginTop: "2px",
    whiteSpace: "nowrap",
  },
  badge: {
    position: "absolute",
    top: "-6px",
    right: "-8px",
    background: "#CC1016",
    color: "#fff",
    borderRadius: "50%",
    minWidth: "16px",
    height: "16px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    padding: "0 3px",
  },
  divider: {
    width: "1px",
    height: "32px",
    background: "#E0DFDC",
    alignSelf: "center",
    margin: "0 4px",
  },
  userMenu: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "0 8px 0 12px",
    cursor: "pointer",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0A66C2, #70B5F9)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  },
  userName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#000",
    maxWidth: "120px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  userRole: {
    fontSize: "11px",
    color: "#666",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
    borderRadius: "4px",
  },
};