const state = {
  user: null,
  sessionToken: localStorage.getItem("mpn_session_token") || "",
  departments: [],
  districts: [],
  selectedId: null,
};

const el = {
  loginView: document.getElementById("loginView"),
  appView: document.getElementById("appView"),
  loginForm: document.getElementById("loginForm"),
  loginInput: document.getElementById("loginInput"),
  passwordInput: document.getElementById("passwordInput"),
  loginError: document.getElementById("loginError"),
  sessionBar: document.getElementById("sessionBar"),
  welcomeText: document.getElementById("welcomeText"),
  logoutBtn: document.getElementById("logoutBtn"),
  stats: document.getElementById("stats"),
  adminControls: document.getElementById("adminControls"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  regionFilter: document.getElementById("regionFilter"),
  exportBtn: document.getElementById("exportBtn"),
  tableBody: document.getElementById("tableBody"),
  editModal: document.getElementById("editModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalMeta: document.getElementById("modalMeta"),
  checklist: document.getElementById("checklist"),
  saveBtn: document.getElementById("saveBtn"),
  usersPanel: document.getElementById("usersPanel"),
  usersBody: document.getElementById("usersBody"),
};

async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (state.sessionToken) {
    headers["X-Session-Token"] = state.sessionToken;
  }

  const res = await fetch(path, {
    credentials: "same-origin",
    headers,
    ...options,
  });

  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof payload === "object" ? payload.error : String(payload);
    throw new Error(message || "Error de servidor");
  }

  return payload;
}

function renderStats(summary) {
  const cards = [
    ["Distritos", summary.totalDistricts],
    ["Completados", summary.completed],
    ["En proceso", summary.inProgress],
    ["Pendientes", summary.pending],
    ["Promedio", `${summary.avgProgress}%`],
  ];

  el.stats.innerHTML = cards
    .map(
      ([label, value]) =>
        `<article class="stat"><small>${label}</small><strong>${value}</strong></article>`
    )
    .join("");
}

function statusLabel(status) {
  if (status === "completed") return "Completado";
  if (status === "in-progress") return "En proceso";
  return "Pendiente";
}

function missingText(record) {
  const missing = state.departments.filter((dept) => !record.reports[dept]);
  if (missing.length === 0) return "Sin faltantes";
  if (missing.length <= 3) return missing.join(", ");
  return `${missing.slice(0, 3).join(", ")} +${missing.length - 3}`;
}

function getFilteredDistricts() {
  if (state.user.role !== "admin") return state.districts;

  const q = el.searchInput.value.trim().toLowerCase();
  const status = el.statusFilter.value;
  const region = el.regionFilter.value;

  return state.districts.filter((d) => {
    const matchesQuery =
      !q ||
      d.districtName.toLowerCase().includes(q) ||
      d.pastorName.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q) ||
      d.phone.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q);
    const matchesStatus = status === "all" ? true : d.status === status;
    const matchesRegion = region ? d.region === region : true;
    return matchesQuery && matchesStatus && matchesRegion;
  });
}

function renderTable() {
  const rows = getFilteredDistricts();

  el.tableBody.innerHTML = rows
    .map((d) => {
      return `
        <tr>
          <td>${d.region}</td>
          <td>${d.districtName}</td>
          <td>${d.pastorName}</td>
          <td>
            <div class="progress"><span style="width:${d.percentage}%"></span></div>
            <small>${d.completed}/${d.total} (${d.percentage}%)</small>
          </td>
          <td><span class="tag ${d.status}">${statusLabel(d.status)}</span></td>
          <td>${missingText(d)}</td>
          <td><button data-action="edit" data-id="${d.id}">Ver / editar</button></td>
        </tr>
      `;
    })
    .join("");
}

function openEdit(id) {
  const d = state.districts.find((item) => item.id === id);
  if (!d) return;

  state.selectedId = id;
  el.modalTitle.textContent = `${d.districtName} - ${d.pastorName}`;
  el.modalMeta.innerHTML = `
    <p><strong>Region:</strong> ${d.region}</p>
    <p><strong>Celular:</strong> ${d.phone || "No registrado"}</p>
    <p><strong>Email:</strong> ${d.email || "No registrado"}</p>
  `;

  el.checklist.innerHTML = state.departments
    .map(
      (dept) => `
        <label class="check-item">
          <input type="checkbox" data-dept="${dept}" ${d.reports[dept] ? "checked" : ""} />
          <span>${dept}</span>
        </label>
      `
    )
    .join("");

  el.editModal.showModal();
}

async function saveEdit() {
  const id = state.selectedId;
  if (!id) return;

  const payload = {};
  el.checklist.querySelectorAll("input[type='checkbox']").forEach((cb) => {
    payload[cb.dataset.dept] = cb.checked;
  });

  await api(`/api/districts/${id}/reports`, {
    method: "PUT",
    body: JSON.stringify({ reports: payload }),
  });

  el.editModal.close();
  await refreshData();
}

async function loadUsers() {
  if (state.user.role !== "admin") return;
  const data = await api("/api/admin/users");
  const pastorUsers = data.users.filter((u) => u.role === "pastor");

  el.usersBody.innerHTML = pastorUsers
    .map(
      (u) => `
      <tr>
        <td>${u.id}</td>
        <td><code>${u.username}</code></td>
        <td>${u.role}</td>
        <td>${u.displayName}</td>
        <td>${u.email || "-"}</td>
        <td><button data-action="reset" data-id="${u.id}">Reset a PastorMPN2026!</button></td>
      </tr>
    `
    )
    .join("");
}

async function refreshData() {
  const [summaryData, districtsData] = await Promise.all([
    api("/api/summary"),
    api("/api/districts"),
  ]);

  state.districts = districtsData.districts;
  renderStats(summaryData.summary);
  renderTable();
}

function populateRegions(regions) {
  el.regionFilter.innerHTML = '<option value="">Todas</option>';
  regions.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    el.regionFilter.appendChild(opt);
  });
}

function applyRoleUI() {
  const isAdmin = state.user.role === "admin";
  el.adminControls.classList.toggle("hidden", !isAdmin);
  el.usersPanel.classList.toggle("hidden", !isAdmin);
  el.welcomeText.textContent = isAdmin
    ? `Administrador: ${state.user.displayName}`
    : `Pastor: ${state.user.displayName}`;
}

async function bootstrapSession() {
  try {
    const me = await api("/api/me");
    state.user = me.user;

    const deptData = await api("/api/departments");
    state.departments = deptData.departments;

    if (state.user.role === "admin") {
      const regionData = await api("/api/regions");
      populateRegions(regionData.regions);
    }

    el.loginView.classList.add("hidden");
    el.appView.classList.remove("hidden");
    el.sessionBar.classList.remove("hidden");

    applyRoleUI();
    await refreshData();
    if (state.user.role === "admin") await loadUsers();
  } catch (_err) {
    state.user = null;
    state.sessionToken = "";
    localStorage.removeItem("mpn_session_token");
    el.loginView.classList.remove("hidden");
    el.appView.classList.add("hidden");
    el.sessionBar.classList.add("hidden");
  }
}

function bindEvents() {
  el.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    el.loginError.textContent = "";

    try {
      const data = await api("/api/login", {
        method: "POST",
        body: JSON.stringify({
          login: el.loginInput.value,
          password: el.passwordInput.value,
        }),
      });
      state.sessionToken = data.sessionToken || "";
      localStorage.setItem("mpn_session_token", state.sessionToken);
      el.passwordInput.value = "";
      await bootstrapSession();
    } catch (err) {
      el.loginError.textContent = err.message;
    }
  });

  el.logoutBtn.addEventListener("click", async () => {
    try {
      await api("/api/logout", { method: "POST" });
    } finally {
      state.sessionToken = "";
      localStorage.removeItem("mpn_session_token");
      window.location.reload();
    }
  });

  el.searchInput.addEventListener("input", renderTable);
  el.statusFilter.addEventListener("change", renderTable);
  el.regionFilter.addEventListener("change", renderTable);

  el.tableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "edit") return;
    openEdit(Number(target.dataset.id));
  });

  el.saveBtn.addEventListener("click", async () => {
    try {
      await saveEdit();
    } catch (err) {
      alert(err.message);
    }
  });

  el.exportBtn.addEventListener("click", () => {
    window.location.href = "/api/admin/export.csv";
  });

  el.usersBody.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "reset") return;

    const userId = Number(target.dataset.id);
    try {
      await api("/api/admin/reset-password", {
        method: "POST",
        body: JSON.stringify({ userId, newPassword: "PastorMPN2026!" }),
      });
      alert("Contrasena reseteada.");
    } catch (err) {
      alert(err.message);
    }
  });
}

bindEvents();
bootstrapSession();
