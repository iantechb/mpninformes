const DEPARTMENTS = [
  "Presidencia",
  "Secretaria",
  "Tesoreria",
  "Mayordomia",
  "JA",
  "Ministerio Personal",
  "Nuevo Tiempo",
  "Ministerio de la Mujer",
  "Asociacion Ministerial",
  "Ministerio Infantil / del Menor",
];

const DISTRICT_DIRECTORY = [
  { region: "BAGUA", districtName: "Bagua A", pastorName: "Cristian Coronel Vasquez", phone: "948490601", email: "criss240389@gmail.com" },
  { region: "BAGUA", districtName: "Bagua B", pastorName: "Hugo Capcha Atoche", phone: "948581176 / 973283531", email: "hugocapcha@teologia.edu.pe" },
  { region: "BAGUA", districtName: "Imaza", pastorName: "Jhonatan Lopez Apaza", phone: "948508409", email: "jhona.loap@gmail.com" },
  { region: "BAGUA", districtName: "Utcubamba A", pastorName: "Carlos David Aviles Lastrera", phone: "948837894 / 984748076", email: "avilesdav15@gmail.com" },
  { region: "BAGUA", districtName: "Utcubamba B", pastorName: "Marcos Mendoza Vasquez", phone: "980981165", email: "marcosmendoza@upeu.edu.pe" },
  { region: "BAGUA", districtName: "Utcubamba C", pastorName: "Ricardo Vega Matta", phone: "948109028", email: "ricardogermanvegamatta@gmail.com" },
  { region: "BAGUA", districtName: "Utcubamba D", pastorName: "Walter Puertas Espinoza (Regional)", phone: "948113235", email: "walterpuertas.2530@gmail.com" },
  { region: "JAEN", districtName: "Jaen A", pastorName: "Ronal Roger Quispe Rivera", phone: "948566910", email: "ronaldqr10@gmail.com" },
  { region: "JAEN", districtName: "Jaen B", pastorName: "Rolando Segura Lucano", phone: "948671468", email: "rolandosegura@teologia.edu.pe; rolisegura@gmail.com" },
  { region: "JAEN", districtName: "Jaen C", pastorName: "Jorge Luis Rojas Yauri (Regional)", phone: "948809598", email: "magdalenaalvalara@gmail.com" },
  { region: "JAEN", districtName: "Jaen D", pastorName: "Merling Cabrera Rodrigo", phone: "947922344", email: "merlingcabrera@teologia.edu.pe" },
  { region: "JAEN", districtName: "San Ignacio A", pastorName: "Luis Miguel La Madrid Cholan", phone: "997207098", email: "luismiguellamadridcholan@gmail.com" },
  { region: "JAEN", districtName: "San Ignacio B", pastorName: "Mijail Tolentino Granados Principe", phone: "974722143", email: "mijailgranados@gmail.com" },
  { region: "JAEN", districtName: "San Ignacio C", pastorName: "Adan Job Yndigoyen Torocahua", phone: "948669107", email: "adan_yt@upeu.edu.pe" },
  { region: "JAEN", districtName: "San Ignacio D", pastorName: "Carlos Zavala Taminche", phone: "948864434", email: "carzata77@gmail.com" },
  { region: "JAEN", districtName: "San Ignacio E", pastorName: "Elver Olivera Tantalean", phone: "948648871", email: "elolta1008@gmail.com" },
  { region: "CAJAMARCA", districtName: "Cutervo Norte", pastorName: "Alexander Laura Flores", phone: "953003420", email: "alexiss32165@gmail.com" },
  { region: "CAJAMARCA", districtName: "Cutervo Sur", pastorName: "Abimael Huaman Ojeda (Regional)", phone: "996014487", email: "abimaelhuaman2023@gmail.com; abimaelhuaman@teologia.edu.pe" },
  { region: "CAJAMARCA", districtName: "Santa Cruz \"A\"", pastorName: "Mauricio Martinez Calvay", phone: "974722760", email: "mauriciomartinez@teologia.edu.pe" },
  { region: "CAJAMARCA", districtName: "Santa Cruz \"B\"", pastorName: "Daniel Herrera Sanchez", phone: "953003015", email: "herrerasanchezdaniel@gmail.com" },
  { region: "CAJAMARCA", districtName: "Santa Cruz \"C\"", pastorName: "Juan Carlos Huaman Zurita", phone: "948657258", email: "juanhuamanz@upeu.edu.pe" },
  { region: "CAJAMARCA", districtName: "Udima", pastorName: "Deyvis Mendoza Mendoza", phone: "974722346 / 928894613", email: "deyvismendoza94@gmail.com" },
  { region: "CHICLAYO NORTE", districtName: "Jayanca", pastorName: "Wilfredo Hugo Ramos Mendez", phone: "948670976", email: "israel_josias@hotmail.com.ar" },
  { region: "CHICLAYO NORTE", districtName: "J. L. O. Atusparias", pastorName: "Angel Campos Llempen", phone: "948590687", email: "angel43campos@gmail.com" },
  { region: "CHICLAYO NORTE", districtName: "J. L. O. Centro", pastorName: "Juan Augusto Razuri Abanto", phone: "948508678", email: "razpicitosoficial@gmail.com" },
  { region: "CHICLAYO NORTE", districtName: "J. L. O. El Dorado \"A\"", pastorName: "Carlos Guerrero Sanchez (Regional)", phone: "948642059", email: "cmgs@outlook.com" },
  { region: "CHICLAYO NORTE", districtName: "J. L. O. El Dorado \"B\"", pastorName: "Roberto Alcantara Acuna", phone: "948839514", email: "robertogenius519@gmail.com" },
  { region: "CHICLAYO NORTE", districtName: "J. L. O. Roma", pastorName: "Samuel Anamuro Apaza", phone: "948834029", email: "pastorsamuel.a.a@gmail.com" },
  { region: "CHICLAYO NORTE", districtName: "Lambayeque", pastorName: "Aldo Palomino Robles", phone: "948802287", email: "aldopalomino1@hotmail.com" },
  { region: "CHICLAYO NORTE", districtName: "Olmos", pastorName: "Abimael Vivanco Principe", phone: "948832095", email: "principe10m@outlook.com" },
  { region: "CHICLAYO CENTRO", districtName: "Chiclayo Central", pastorName: "Lucio Aranda Aguilar", phone: "948584287", email: "" },
  { region: "CHICLAYO CENTRO", districtName: "Chiclayo Primavera", pastorName: "Wilder Mathews Paredes (Regional)", phone: "986244233", email: "wilmapa@gmail.com" },
  { region: "CHICLAYO CENTRO", districtName: "Chiclayo San Antonio", pastorName: "Cesar Marquez Pumacahua", phone: "948620240", email: "cesar_13mp@hotmail.com" },
  { region: "CHICLAYO CENTRO", districtName: "Chiclayo Satelite \"A\"", pastorName: "Joel Infante Bobadilla", phone: "948120243", email: "bjmrj10@gmail.com" },
  { region: "CHICLAYO CENTRO", districtName: "Chiclayo Satelite \"B\"", pastorName: "Teofilo Garcia Aguilar", phone: "948402750", email: "teofilo22garcia@gmail.com" },
  { region: "CHICLAYO CENTRO", districtName: "Ferrenafe", pastorName: "David Pasapera Loaisa", phone: "948662651", email: "david_pasapera@hotmail.com" },
  { region: "CHICLAYO CENTRO", districtName: "Patapo", pastorName: "Luis Osorio Marquina", phone: "948694440", email: "lais713@outlook.com" },
  { region: "CHICLAYO SUR", districtName: "Cayalti", pastorName: "Carlos Abel Chafloque Chaponan", phone: "948404713", email: "carlosabelch@gmail.com" },
  { region: "CHICLAYO SUR", districtName: "Chiclayo Santa Victoria", pastorName: "Eduardo Felix Alania Palpan", phone: "948497353", email: "edufeve@gmail.com" },
  { region: "CHICLAYO SUR", districtName: "La Victoria \"A\"", pastorName: "Wilfredo Marchan", phone: "948109820", email: "w.marchancarrillo@gmail.com" },
  { region: "CHICLAYO SUR", districtName: "La Victoria \"B\"", pastorName: "Jose Orli Guevara Bernal (Regional)", phone: "948883779", email: "jorli222@hotmail.com" },
  { region: "BAJO PIURA", districtName: "Castilla \"A\"", pastorName: "Orlando Zurita Cordova", phone: "948846766", email: "pastorconpasion@outlook.com" },
  { region: "BAJO PIURA", districtName: "Castilla \"B\"", pastorName: "Elden Llalli Ramos (Regional)", phone: "948005591", email: "eldenllalli3@gmail.com" },
  { region: "BAJO PIURA", districtName: "Chulucanas", pastorName: "Noe Guevara Zavaleta", phone: "948866403", email: "noegueza@gmail.com" },
  { region: "BAJO PIURA", districtName: "Huancabamba", pastorName: "Jhon Salazar Ramos", phone: "948538843", email: "edinson.201220366@gmail.com" },
  { region: "BAJO PIURA", districtName: "Sechura", pastorName: "Alejandro Cardenas Valverde", phone: "948830026", email: "aacv600@gmail.com" },
  { region: "ALTO PIURA", districtName: "Las Lomas", pastorName: "Henry Belarmino Mollinedo Osorio", phone: "948679802", email: "pr.murdochenry28@gmail.com" },
  { region: "ALTO PIURA", districtName: "Paita", pastorName: "Merlins Yoel Acuna Chavez", phone: "984152045", email: "merlinsacu@gmail.com" },
  { region: "ALTO PIURA", districtName: "Piura \"A\"", pastorName: "Angel Gabriel Garcia Perez (Regional)", phone: "948615286", email: "angel_garciape@hotmail.com" },
  { region: "ALTO PIURA", districtName: "Piura \"B\"", pastorName: "Pedro Manuel Giron Galvez", phone: "987121960", email: "girongalvespedromanuel@gmail.com" },
  { region: "ALTO PIURA", districtName: "Piura \"C\"", pastorName: "Carlos Magno Noblecilla Cardoza", phone: "948830283", email: "carlos_nc@outlook.com.pe" },
  { region: "ALTO PIURA", districtName: "Piura \"D\"", pastorName: "Jose Enoc Correa Suarez", phone: "948806512", email: "enoccorrea5@gmail.com" },
  { region: "ALTO PIURA", districtName: "Sullana", pastorName: "Luis Ray Quispitongo Cardenas", phone: "948857913", email: "califray@hotmail.com" },
  { region: "TUMBES", districtName: "Talara", pastorName: "Jacson Ran Villar Ureta", phone: "953003795", email: "jacspas7908@gmail.com" },
  { region: "TUMBES", districtName: "Tumbes \"A\"", pastorName: "Elmer Salazar Lopez (Regional)", phone: "948814058", email: "elmersalo79@outlook.com" },
  { region: "TUMBES", districtName: "Tumbes \"B\"", pastorName: "Francisco Lingan Acuna", phone: "948669877", email: "lingan2011@hotmail.com" },
];

const TOTAL_DISTRICTS = DISTRICT_DIRECTORY.length;
const STORAGE_KEY = "mpn-informes-v1";

const state = {
  districts: [],
  selectedDistrictId: null,
};

const el = {
  stats: document.getElementById("stats"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  districtTableBody: document.getElementById("districtTableBody"),
  detailsModal: document.getElementById("detailsModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalMeta: document.getElementById("modalMeta"),
  departmentChecklist: document.getElementById("departmentChecklist"),
  saveChangesBtn: document.getElementById("saveChangesBtn"),
  exportCsvBtn: document.getElementById("exportCsvBtn"),
};

function createInitialDistricts() {
  return DISTRICT_DIRECTORY.map((item, i) => ({
    id: i + 1,
    region: item.region,
    districtName: item.districtName,
    pastorName: item.pastorName,
    phone: item.phone,
    email: item.email,
    reports: Object.fromEntries(DEPARTMENTS.map((dept) => [dept, false])),
    updatedAt: new Date().toISOString(),
  }));
}

function normalizeState(parsed) {
  if (!Array.isArray(parsed) || parsed.length !== TOTAL_DISTRICTS) {
    return createInitialDistricts();
  }

  return DISTRICT_DIRECTORY.map((item, i) => {
    const existing = parsed[i] || {};
    const existingReports =
      existing.reports && typeof existing.reports === "object" ? existing.reports : {};
    return {
      id: i + 1,
      region: item.region,
      districtName: item.districtName,
      pastorName: item.pastorName,
      phone: item.phone,
      email: item.email,
      reports: Object.fromEntries(
        DEPARTMENTS.map((dept) => [dept, Boolean(existingReports[dept])])
      ),
      updatedAt: existing.updatedAt || new Date().toISOString(),
    };
  });
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    state.districts = createInitialDistricts();
    persistState();
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    state.districts = normalizeState(parsed);
    persistState();
    return;
  } catch (err) {
    console.error("No se pudo cargar el estado guardado.", err);
  }

  state.districts = createInitialDistricts();
  persistState();
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.districts));
}

function getProgress(record) {
  const completed = Object.values(record.reports).filter(Boolean).length;
  const total = DEPARTMENTS.length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

function getStatus(record) {
  const { completed, total } = getProgress(record);
  if (completed === 0) return "pending";
  if (completed === total) return "completed";
  return "in-progress";
}

function getMissingDepartments(record) {
  return DEPARTMENTS.filter((dept) => !record.reports[dept]);
}

function renderStats(filtered) {
  const total = filtered.length;
  const completed = filtered.filter((d) => getStatus(d) === "completed").length;
  const inProgress = filtered.filter((d) => getStatus(d) === "in-progress").length;
  const pending = filtered.filter((d) => getStatus(d) === "pending").length;

  const avg =
    total === 0
      ? 0
      : Math.round(
          filtered.reduce((acc, d) => acc + getProgress(d).percentage, 0) / total
        );

  const cards = [
    ["Distritos en vista", total],
    ["Completados", completed],
    ["En proceso", inProgress],
    ["Pendientes", pending],
    ["Promedio de avance", `${avg}%`],
  ];

  el.stats.innerHTML = cards
    .map(
      ([label, value]) => `
      <article class="stat-card">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
      </article>
    `
    )
    .join("");
}

function renderTable() {
  const query = el.searchInput.value.trim().toLowerCase();
  const statusFilter = el.statusFilter.value;

  const filtered = state.districts.filter((record) => {
    const searchPass =
      record.districtName.toLowerCase().includes(query) ||
      record.pastorName.toLowerCase().includes(query) ||
      record.region.toLowerCase().includes(query) ||
      record.phone.toLowerCase().includes(query) ||
      record.email.toLowerCase().includes(query);

    const status = getStatus(record);
    const statusPass = statusFilter === "all" ? true : status === statusFilter;

    return searchPass && statusPass;
  });

  renderStats(filtered);

  el.districtTableBody.innerHTML = filtered
    .map((record) => {
      const { completed, total, percentage } = getProgress(record);
      const status = getStatus(record);
      const statusLabel =
        status === "completed"
          ? "Completado"
          : status === "in-progress"
          ? "En proceso"
          : "Pendiente";
      const missing = getMissingDepartments(record);
      const missingText =
        missing.length === 0
          ? "Sin faltantes"
          : missing.length <= 3
          ? missing.join(", ")
          : `${missing.slice(0, 3).join(", ")} +${missing.length - 3}`;

      return `
        <tr>
          <td>${record.districtName}</td>
          <td>${record.pastorName}</td>
          <td>
            <div class="progress-shell">
              <div class="progress-bar" style="width:${percentage}%"></div>
            </div>
            <small>${completed}/${total} (${percentage}%)</small>
          </td>
          <td><span class="tag ${status}">${statusLabel}</span></td>
          <td class="missing-list">${missingText}</td>
          <td><button data-action="open" data-id="${record.id}">Ver / editar</button></td>
        </tr>
      `;
    })
    .join("");
}

function openDetails(id) {
  const district = state.districts.find((d) => d.id === id);
  if (!district) return;

  state.selectedDistrictId = id;
  el.modalTitle.textContent = `${district.districtName} - ${district.pastorName}`;
  el.modalMeta.innerHTML = `
    <p><strong>Region:</strong> ${district.region}</p>
    <p><strong>Celular:</strong> ${district.phone || "No registrado"}</p>
    <p><strong>Email:</strong> ${district.email || "No registrado"}</p>
  `;

  el.departmentChecklist.innerHTML = DEPARTMENTS.map(
    (dept) => `
      <label class="department-item">
        <input type="checkbox" data-dept="${dept}" ${district.reports[dept] ? "checked" : ""} />
        <span>${dept}</span>
      </label>
    `
  ).join("");

  el.detailsModal.showModal();
}

function saveDetails() {
  const id = state.selectedDistrictId;
  const district = state.districts.find((d) => d.id === id);
  if (!district) return;

  const checkboxes = el.departmentChecklist.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach((cb) => {
    district.reports[cb.dataset.dept] = cb.checked;
  });

  district.updatedAt = new Date().toISOString();
  persistState();
  el.detailsModal.close();
  renderTable();
}

function exportCsv() {
  const header = [
    "Region",
    "Distrito",
    "Pastor",
    "Celular",
    "Email",
    "Estado",
    "Avance (%)",
    "Completados",
    "Faltantes",
    ...DEPARTMENTS,
  ];

  const rows = state.districts.map((record) => {
    const { completed, total, percentage } = getProgress(record);
    const status = getStatus(record);
    const statusLabel =
      status === "completed"
        ? "Completado"
        : status === "in-progress"
        ? "En proceso"
        : "Pendiente";

    return [
      record.region,
      record.districtName,
      record.pastorName,
      record.phone,
      record.email,
      statusLabel,
      percentage,
      `${completed}/${total}`,
      getMissingDepartments(record).join(" | "),
      ...DEPARTMENTS.map((dept) => (record.reports[dept] ? "SI" : "NO")),
    ];
  });

  const csv = [header, ...rows]
    .map((row) => row.map((item) => `"${String(item).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `consolidado_mpn_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  el.searchInput.addEventListener("input", renderTable);
  el.statusFilter.addEventListener("change", renderTable);

  el.districtTableBody.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "open") return;
    openDetails(Number(target.dataset.id));
  });

  el.saveChangesBtn.addEventListener("click", saveDetails);
  el.exportCsvBtn.addEventListener("click", exportCsv);
}

loadState();
bindEvents();
renderTable();
