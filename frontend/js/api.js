const API_BASE = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? "http://localhost:5000/api"
  : "https://room-reservation-system-kabl.onrender.com/api";

function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

async function apiRequest(path, { method = "GET", body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const options = { method, headers };

  if (body !== undefined) {
    if (isForm) {
      options.body = body;
    } else {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  }
  return data;
}

function requireAuth(allowedRoles) {
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = "/pages/login.html";
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    window.location.href = "/pages/rooms.html";
    return null;
  }
  return user;
}

const ROLE_LABELS = {
  student: "นักศึกษา",
  staff: "บุคลากรมหาวิทยาลัย",
  external: "บุคคลภายนอก",
  room_staff: "เจ้าหน้าที่ดูแลห้อง",
  admin: "ผู้ดูแลระบบ",
};

const STATUS_LABELS = {
  pending: "รอดำเนินการ",
  approved: "อนุมัติแล้ว",
  rejected: "ถูกปฏิเสธ",
  cancelled: "ยกเลิกแล้ว",
  completed: "เสร็จสิ้น",
  available: "ว่าง",
  unavailable: "ไม่พร้อมใช้งาน",
  verified: "ตรวจสอบแล้ว",
  active: "ใช้งานอยู่",
  inactive: "ระงับการใช้งาน",
};

function statusBadge(status) {
  const label = STATUS_LABELS[status] || status;
  return `<span class="badge badge-${status}">${label}</span>`;
}
