function renderNavbar(activePage) {
  const mount = document.getElementById("navbar");
  if (!mount) return;

  const user = getUser();

  const links = [];
  if (user) {
    links.push({ page: "rooms", label: "ห้องประชุม/ห้องเรียน", href: "/pages/rooms.html" });
    links.push({ page: "my-bookings", label: "การจองของฉัน", href: "/pages/my-bookings.html" });
    if (["room_staff", "admin"].includes(user.role)) {
      links.push({ page: "staff-dashboard", label: "อนุมัติการจอง", href: "/pages/staff-dashboard.html" });
    }
    if (user.role === "admin") {
      links.push({ page: "admin-dashboard", label: "จัดการระบบ", href: "/pages/admin-dashboard.html" });
    }
  }

  const navLinks = links
    .map(
      (l) =>
        `<a href="${l.href}" class="${l.page === activePage ? "active" : ""}">${l.label}</a>`
    )
    .join("");

  const rightSide = user
    ? `<span class="user-chip">${user.full_name} · ${ROLE_LABELS[user.role] || user.role}</span>
       <button class="btn btn-outline btn-sm" id="logoutBtn">ออกจากระบบ</button>`
    : `<a href="/pages/login.html" class="btn btn-outline btn-sm">เข้าสู่ระบบ</a>
       <a href="/pages/register.html" class="btn btn-primary btn-sm">สมัครสมาชิก</a>`;

  mount.innerHTML = `
    <div class="container">
      <a href="/pages/rooms.html" class="brand">ระบบจองห้องออนไลน์</a>
      <nav>${navLinks}</nav>
      <div style="display:flex; align-items:center; gap:10px;">${rightSide}</div>
    </div>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearSession();
      window.location.href = "/pages/login.html";
    });
  }
}

function showAlert(container, message, type = "error") {
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  container.classList.remove("hidden");
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
}
