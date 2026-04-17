const STORAGE_KEY = "device-lifecycle-demo-state-v1";
const SESSION_KEY = "device-lifecycle-session-v1";
const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date("2026-04-17T09:00:00-04:00");

const FIRST_NAMES = [
  "Jordan", "Maya", "Luis", "Avery", "Sofia", "Marcus", "Elena", "Noah", "Darius", "Leah",
  "Carmen", "Isaac", "Priya", "Andre", "Nina", "Caleb", "Bianca", "Owen", "Jade", "Rafael",
];

const LAST_NAMES = [
  "Nguyen", "Carter", "Martinez", "Thompson", "Rivera", "Patel", "Brooks", "Edwards", "Kim", "Flores",
  "Barnes", "Price", "Howard", "Reed", "Cook", "Bell", "Murphy", "Diaz", "Gray", "Ward",
];

const ISSUE_DESCRIPTIONS = [
  "Screen flickers during scan sessions.",
  "Battery is no longer holding a full shift charge.",
  "Trigger button is sticking intermittently.",
  "Device casing cracked near lower corner.",
  "Wi-Fi disconnects repeatedly on ramp coverage.",
  "Scanner engine fails to read damaged labels.",
  "Charging contacts appear worn and inconsistent.",
  "Touchscreen has dead zones near center area.",
];

const STATION_CODES = ["YTZ", "YYZ", "YUL", "YOW", "YHZ", "YVR", "YYC", "EWR", "BOS", "ORD"];
const CODE39_PATTERNS = {
  "0": "nnnwwnwnn",
  "1": "wnnwnnnnw",
  "2": "nnwwnnnnw",
  "3": "wnwwnnnnn",
  "4": "nnnwwnnnw",
  "5": "wnnwwnnnn",
  "6": "nnwwwnnnn",
  "7": "nnnwnnwnw",
  "8": "wnnwnnwnn",
  "9": "nnwwnnwnn",
  "A": "wnnnnwnnw",
  "B": "nnwnnwnnw",
  "C": "wnwnnwnnn",
  "D": "nnnnwwnnw",
  "E": "wnnnwwnnn",
  "F": "nnwnwwnnn",
  "G": "nnnnnwwnw",
  "H": "wnnnnwwnn",
  "I": "nnwnnwwnn",
  "J": "nnnnwwwnn",
  "K": "wnnnnnnww",
  "L": "nnwnnnnww",
  "M": "wnwnnnnwn",
  "N": "nnnnwnnww",
  "O": "wnnnwnnwn",
  "P": "nnwnwnnwn",
  "Q": "nnnnnnwww",
  "R": "wnnnnnwwn",
  "S": "nnwnnnwwn",
  "T": "nnnnwnwwn",
  "U": "wwnnnnnnw",
  "V": "nwwnnnnnw",
  "W": "wwwnnnnnn",
  "X": "nwnnwnnnw",
  "Y": "wwnnwnnnn",
  "Z": "nwwnwnnnn",
  "-": "nwnnnnwnw",
  ".": "wwnnnnwnn",
  " ": "nwwnnnwnn",
  "$": "nwnwnwnnn",
  "/": "nwnwnnnwn",
  "+": "nwnnnwnwn",
  "%": "nnnwnwnwn",
  "*": "nwnnwnwnn",
};

const state = createEmptyState();
let scannerStream = null;
let scannerAnimationFrame = null;
let scannerTarget = null;
let barcodeDetectorInstance = null;
let supabaseClient = null;
let activeBackend = "local";

const elements = {
  loginScreen: document.getElementById("loginScreen"),
  loginForm: document.getElementById("loginForm"),
  loginUsernameInput: document.getElementById("loginUsernameInput"),
  loginPasswordInput: document.getElementById("loginPasswordInput"),
  navTabs: document.querySelectorAll(".nav-tab"),
  viewTitle: document.getElementById("viewTitle"),
  snapshotStats: document.getElementById("snapshotStats"),
  metricCards: document.getElementById("metricCards"),
  checkedOutTableBody: document.getElementById("checkedOutTableBody"),
  dashboardStationFilter: document.getElementById("dashboardStationFilter"),
  stationSummaryList: document.getElementById("stationSummaryList"),
  warrantyList: document.getElementById("warrantyList"),
  repairQueueList: document.getElementById("repairQueueList"),
  offlineAlertList: document.getElementById("offlineAlertList"),
  kioskForm: document.getElementById("kioskForm"),
  agentIdInput: document.getElementById("agentIdInput"),
  deviceSerialInput: document.getElementById("deviceSerialInput"),
  checkoutDurationInput: document.getElementById("checkoutDurationInput"),
  scanDeviceBarcodeButton: document.getElementById("scanDeviceBarcodeButton"),
  reportDamageButton: document.getElementById("reportDamageButton"),
  durationWarning: document.getElementById("durationWarning"),
  kioskLookupResult: document.getElementById("kioskLookupResult"),
  directorySearch: document.getElementById("directorySearch"),
  directoryStatusFilter: document.getElementById("directoryStatusFilter"),
  directoryTableBody: document.getElementById("directoryTableBody"),
  deviceDetailPanel: document.getElementById("deviceDetailPanel"),
  addDeviceForm: document.getElementById("addDeviceForm"),
  newDeviceSerialInput: document.getElementById("newDeviceSerialInput"),
  newDeviceNameInput: document.getElementById("newDeviceNameInput"),
  newDeviceStationInput: document.getElementById("newDeviceStationInput"),
  newDeviceStatusSelect: document.getElementById("newDeviceStatusSelect"),
  newDeviceWarrantyInput: document.getElementById("newDeviceWarrantyInput"),
  newDeviceBarcodePreview: document.getElementById("newDeviceBarcodePreview"),
  repairForm: document.getElementById("repairForm"),
  repairDeviceSelect: document.getElementById("repairDeviceSelect"),
  repairAgentSelect: document.getElementById("repairAgentSelect"),
  repairIssueInput: document.getElementById("repairIssueInput"),
  repairTicketList: document.getElementById("repairTicketList"),
  addUserForm: document.getElementById("addUserForm"),
  newUserAgentIdInput: document.getElementById("newUserAgentIdInput"),
  newUserFullNameInput: document.getElementById("newUserFullNameInput"),
  newUserRoleSelect: document.getElementById("newUserRoleSelect"),
  newUserUsernameInput: document.getElementById("newUserUsernameInput"),
  newUserPasswordInput: document.getElementById("newUserPasswordInput"),
  addStationForm: document.getElementById("addStationForm"),
  newStationCodeInput: document.getElementById("newStationCodeInput"),
  newStationNameInput: document.getElementById("newStationNameInput"),
  stationAdminList: document.getElementById("stationAdminList"),
  backendBadge: document.getElementById("backendBadge"),
  sessionBadge: document.getElementById("sessionBadge"),
  seedResetButton: document.getElementById("seedResetButton"),
  logoutButton: document.getElementById("logoutButton"),
  toastRegion: document.getElementById("toastRegion"),
  metricCardTemplate: document.getElementById("metricCardTemplate"),
  scannerModal: document.getElementById("scannerModal"),
  scannerVideo: document.getElementById("scannerVideo"),
  scannerStatus: document.getElementById("scannerStatus"),
  closeScannerButton: document.getElementById("closeScannerButton"),
};

let selectedDeviceSerial = null;

bindEvents();
initializeApp();

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.viewTarget, tab.textContent.trim()));
  });

  elements.kioskForm.addEventListener("submit", (event) => {
    const submitter = event.submitter;
    event.preventDefault();

    if (!submitter) {
      return;
    }

    const action = submitter.dataset.action;
    if (action === "checkout") {
      handleCheckout();
    } else if (action === "return") {
      handleReturn();
    }
  });

  elements.reportDamageButton.addEventListener("click", handleDamageFromKiosk);
  elements.scanDeviceBarcodeButton.addEventListener("click", () => startBarcodeScanner("deviceSerial"));
  elements.dashboardStationFilter.addEventListener("change", renderApp);
  elements.directorySearch.addEventListener("input", renderDirectoryTable);
  elements.directoryStatusFilter.addEventListener("change", renderDirectoryTable);
  elements.directoryTableBody.addEventListener("click", handleDirectorySelection);
  elements.addDeviceForm.addEventListener("submit", handleAddDevice);
  elements.repairForm.addEventListener("submit", handleRepairSubmit);
  elements.addUserForm.addEventListener("submit", handleAddUser);
  elements.addStationForm.addEventListener("submit", handleAddStation);
  elements.agentIdInput.addEventListener("input", renderKioskLookup);
  elements.deviceSerialInput.addEventListener("input", renderKioskLookup);
  elements.newDeviceSerialInput.addEventListener("input", renderNewDeviceBarcodePreview);
  elements.checkoutDurationInput.addEventListener("change", () => {
    renderDurationWarning();
    renderKioskLookup();
  });
  elements.seedResetButton.addEventListener("click", resetDemoData);
  elements.logoutButton.addEventListener("click", handleLogout);
  elements.closeScannerButton.addEventListener("click", closeBarcodeScanner);
  elements.scannerModal.addEventListener("click", (event) => {
    if (event.target === elements.scannerModal) {
      closeBarcodeScanner();
    }
  });
}

async function initializeApp() {
  try {
    if (isSupabaseEnabled()) {
      supabaseClient = window.supabase.createClient(
        window.APP_CONFIG.supabaseUrl,
        window.APP_CONFIG.supabaseAnonKey
      );
      activeBackend = "supabase";
      const loaded = await loadStateFromSupabase();
      Object.assign(state, loaded);
    } else {
      activeBackend = "local";
      Object.assign(state, loadStateFromLocal());
    }
  } catch (error) {
    activeBackend = "local";
    Object.assign(state, loadStateFromLocal());
    toast("Supabase connection failed. Using local demo storage instead.", "error");
  }

  renderApp();
}

function createEmptyState() {
  return {
    session: loadSession(),
    stations: [],
    agents: [],
    devices: [],
    checkoutHistory: [],
    repairTickets: [],
  };
}

function isSupabaseEnabled() {
  return Boolean(
    window.APP_CONFIG?.useSupabase &&
      window.APP_CONFIG?.supabaseUrl &&
      window.APP_CONFIG?.supabaseAnonKey &&
      window.supabase?.createClient
  );
}

function switchView(viewId, title) {
  document.querySelectorAll(".view-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === viewId);
  });

  elements.navTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.viewTarget === viewId);
  });

  elements.viewTitle.textContent = title;
}

function currentUser() {
  return state.session?.agentId ? getAgent(state.session.agentId) : null;
}

function isAdminUser() {
  return currentUser()?.role === "Admin/Supervisor";
}

function applyAuthState() {
  const authenticated = Boolean(currentUser());
  document.body.classList.toggle("auth-locked", !authenticated);
  document.body.classList.toggle("auth-ready", authenticated);
}

function renderSessionBadge() {
  const user = currentUser();
  if (!user) {
    elements.sessionBadge.textContent = "";
    return;
  }

  const roleLabel = user.role === "Admin/Supervisor" ? "Admin" : "Ramp User";
  elements.sessionBadge.textContent = `${user.fullName} | ${roleLabel}`;
}

function renderBackendBadge() {
  elements.backendBadge.textContent =
    activeBackend === "supabase" ? "Backend | Supabase" : "Backend | Local Storage";
}

function applyRoleVisibility() {
  const adminOnly = document.querySelectorAll("[data-admin-only='true']");
  adminOnly.forEach((node) => {
    node.hidden = !isAdminUser();
  });

  const showAdminView = isAdminUser();
  if (!showAdminView && document.getElementById("admin").classList.contains("is-active")) {
    switchView("dashboard", "Dashboard");
  }

  elements.addDeviceForm.closest(".card").hidden = !showAdminView;
  document.getElementById("admin").hidden = !showAdminView;
}

function handleLogin(event) {
  event.preventDefault();
  const username = elements.loginUsernameInput.value.trim().toLowerCase();
  const password = elements.loginPasswordInput.value;
  const agent = state.agents.find(
    (item) => (item.username || "").toLowerCase() === username && item.password === password
  );

  if (!agent) {
    toast("Invalid username or password.", "error");
    return;
  }

  state.session = { agentId: agent.agentId };
  elements.loginForm.reset();
  renderApp();
  toast(`Signed in as ${agent.fullName}.`, "success");
}

function handleLogout() {
  closeBarcodeScanner();
  state.session = null;
  applyAuthState();
  saveState();
}

function renderApp() {
  applyAuthState();
  if (!currentUser()) {
    saveState();
    return;
  }

  setDefaultWarrantyDate();
  populateStationFilters();
  renderSnapshot();
  renderMetrics();
  renderDashboardTables();
  populateRepairFormOptions();
  renderDirectoryTable();
  renderRepairTickets();
  renderKioskLookup();
  renderNewDeviceBarcodePreview();
  renderDurationWarning();
  renderStationAdminList();
  renderBackendBadge();
  renderSessionBadge();
  applyRoleVisibility();
  saveState();
}

function renderSnapshot() {
  const stats = summarizeDevices();
  elements.snapshotStats.innerHTML = [
    miniStat("Agents", state.agents.length),
    miniStat("Devices", state.devices.length),
    miniStat("Open Repairs", openRepairTickets().length),
    miniStat("Offline Alerts", offlineDevices().length),
  ].join("");
}

function renderMetrics() {
  const devices = dashboardDevices();
  const metrics = [
    { label: "Available", value: countByStatus("Available", devices), meta: "Ready for shift handoff" },
    { label: "Checked Out", value: countByStatus("Checked Out", devices), meta: "Currently assigned to agents" },
    { label: "In Repair", value: countByStatus("In Repair", devices), meta: "Unavailable pending service" },
    { label: "History Records", value: dashboardHistory().length, meta: "Audit trail transactions" },
  ];

  elements.metricCards.innerHTML = "";
  metrics.forEach((metric) => {
    const fragment = elements.metricCardTemplate.content.cloneNode(true);
    fragment.querySelector(".metric-label").textContent = metric.label;
    fragment.querySelector(".metric-value").textContent = metric.value;
    fragment.querySelector(".metric-meta").textContent = metric.meta;
    elements.metricCards.appendChild(fragment);
  });
}

function renderDashboardTables() {
  const devices = dashboardDevices();
  const visibleSerials = new Set(devices.map((device) => device.serialNumber));
  const checkedOutRows = activeTransactions()
    .slice()
    .filter((transaction) => visibleSerials.has(transaction.deviceSerial))
    .sort((a, b) => new Date(b.checkoutAt) - new Date(a.checkoutAt))
    .map((transaction) => {
      const device = getDevice(transaction.deviceSerial);
      const agent = getAgent(transaction.agentId);
      return `
        <tr>
          <td>${device.stationCode || "N/A"}</td>
          <td>${device.deviceName}</td>
          <td>${device.serialNumber}</td>
          <td>${agent ? `${agent.fullName} (${agent.agentId})` : "Unassigned"}</td>
          <td>${formatDateTime(transaction.checkoutAt)}</td>
        </tr>
      `;
    });

  elements.checkedOutTableBody.innerHTML = checkedOutRows.join("") || emptyTableRow("No active device assignments.", 5);

  const stationSummaries = summarizeByStation(devices).map(({ stationCode, count, available, checkedOut, inRepair }) =>
    stackItem(stationCode, `${count} total • ${available} available • ${checkedOut} out • ${inRepair} repair`)
  );
  elements.stationSummaryList.innerHTML = stationSummaries.join("") || stackItem("No station data", "No devices match the selected station.");

  const warrantyItems = devices
    .filter((device) => daysUntil(device.warrantyExpirationDate) <= 30 && daysUntil(device.warrantyExpirationDate) >= 0)
    .sort((a, b) => new Date(a.warrantyExpirationDate) - new Date(b.warrantyExpirationDate))
    .slice(0, 10)
    .map((device) => stackItem(device.deviceName, `${device.serialNumber} • Expires ${formatDate(device.warrantyExpirationDate)}`));
  elements.warrantyList.innerHTML = warrantyItems.join("") || stackItem("No imminent warranty expirations", "Everything is outside the 30-day window.");

  const repairItems = devices
    .filter((device) => device.status === "In Repair")
    .slice(0, 10)
    .map((device) => {
      const ticket = openRepairTickets().find((repair) => repair.deviceSerial === device.serialNumber);
      return stackItem(device.deviceName, `${device.serialNumber} • ${ticket ? ticket.repairStatus : "Pending triage"}`);
    });
  elements.repairQueueList.innerHTML = repairItems.join("") || stackItem("No repair backlog", "All repair work is currently clear.");

  const offlineItems = offlineDevices().filter((device) => visibleSerials.has(device.serialNumber)).map((device) => {
    const agent = device.currentAssignedAgentId ? getAgent(device.currentAssignedAgentId) : null;
    return stackItem(
      device.deviceName,
      `${device.serialNumber} • ${agent ? agent.fullName : "No agent"} • Last seen ${formatDateTime(device.lastSeenOnline)}`
    );
  });
  elements.offlineAlertList.innerHTML = offlineItems.join("") || stackItem("No offline alerts", "All checked-out devices have checked in within 24 hours.");
}

function renderDirectoryTable() {
  const searchValue = elements.directorySearch.value.trim().toLowerCase();
  const statusValue = elements.directoryStatusFilter.value;

  const filteredDevices = state.devices.filter((device) => {
    const matchesSearch =
      !searchValue ||
      device.deviceName.toLowerCase().includes(searchValue) ||
      device.serialNumber.toLowerCase().includes(searchValue);
    const matchesStatus = statusValue === "All" || device.status === statusValue;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const stationCompare = (a.stationCode || "").localeCompare(b.stationCode || "");
    return stationCompare || a.deviceName.localeCompare(b.deviceName);
  });

  elements.directoryTableBody.innerHTML = filteredDevices
    .map((device) => {
      const agent = device.currentAssignedAgentId ? getAgent(device.currentAssignedAgentId) : null;
      return `
        <tr class="clickable-row ${selectedDeviceSerial === device.serialNumber ? "is-selected" : ""}" data-serial="${device.serialNumber}" tabindex="0" title="View device details">
          <td>${device.stationCode || "N/A"}</td>
          <td>${device.deviceName}</td>
          <td>${device.serialNumber}</td>
          <td>${statusPill(device.status)}</td>
          <td>${formatDate(device.warrantyExpirationDate)}</td>
          <td>${agent ? agent.fullName : "None"}</td>
        </tr>
      `;
    })
    .join("");

  if (!filteredDevices.length) {
    elements.directoryTableBody.innerHTML = emptyTableRow("No devices matched the current filters.", 6);
    selectedDeviceSerial = null;
    elements.deviceDetailPanel.innerHTML = "No device matches the current search or status filter.";
    return;
  }

  if (!selectedDeviceSerial || !filteredDevices.some((device) => device.serialNumber === selectedDeviceSerial)) {
    selectedDeviceSerial = filteredDevices[0].serialNumber;
  }

  renderDeviceDetail(selectedDeviceSerial);
}

function renderDeviceDetail(serialNumber) {
  const device = getDevice(serialNumber);
  if (!device) {
    elements.deviceDetailPanel.innerHTML = "The selected device could not be found.";
    return;
  }

  const history = state.checkoutHistory
    .filter((transaction) => transaction.deviceSerial === serialNumber)
    .sort((a, b) => new Date(b.checkoutAt) - new Date(a.checkoutAt))
    .slice(0, 8);

  const repairs = state.repairTickets
    .filter((ticket) => ticket.deviceSerial === serialNumber)
    .sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported))
    .slice(0, 6);

  const agent = device.currentAssignedAgentId ? getAgent(device.currentAssignedAgentId) : null;

  elements.deviceDetailPanel.innerHTML = `
    <div class="detail-panel">
      <div class="detail-summary">
        <strong>${device.deviceName}</strong>
        <span>${device.serialNumber}</span>
        <span>Station ${device.stationCode || "N/A"}</span>
        ${statusPill(device.status)}
        <span>Warranty expires ${formatDate(device.warrantyExpirationDate)}</span>
        <span>Last seen online ${formatDateTime(device.lastSeenOnline)}</span>
        <span>Assigned agent ${agent ? `${agent.fullName} (${agent.agentId})` : "None"}</span>
      </div>

      ${renderBarcodeCard(device)}

      <div>
        <p class="section-title">Recent Checkout History</p>
        ${history.map((item) => historyItem(item)).join("") || '<p class="detail-placeholder">No checkout history found.</p>'}
      </div>

      <div>
        <p class="section-title">Repair Tickets</p>
        ${repairs.map((ticket) => repairItem(ticket)).join("") || '<p class="detail-placeholder">No repair tickets found.</p>'}
      </div>
    </div>
  `;
}

function renderRepairTickets() {
  const tickets = state.repairTickets
    .slice()
    .sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported))
    .slice(0, 16);

  elements.repairTicketList.innerHTML = tickets.map((ticket) => repairItem(ticket, isAdminUser())).join("");

  document.querySelectorAll("[data-ticket-id]").forEach((button) => {
    button.addEventListener("click", () => resolveRepairTicket(button.dataset.ticketId));
  });
}

function renderKioskLookup() {
  const agentId = elements.agentIdInput.value.trim().toUpperCase();
  const serial = elements.deviceSerialInput.value.trim().toUpperCase();
  const agent = agentId ? getAgent(agentId) : null;
  const device = serial ? getDevice(serial) : null;

  if (!agentId && !serial) {
    elements.kioskLookupResult.textContent = "Enter an agent ID and serial number to validate an assignment.";
    return;
  }

  elements.kioskLookupResult.innerHTML = `
    <div class="detail-summary">
      <strong>${device ? device.deviceName : "Unknown device"}</strong>
      <span>${serial || "No serial entered yet"}</span>
      <span>${device ? `Station ${device.stationCode || "N/A"}` : "Station pending"}</span>
      ${device ? statusPill(device.status) : ""}
      <span>Checkout duration ${getSelectedCheckoutDuration()} day(s)</span>
      <span>Agent ${agent ? `${agent.fullName} (${agent.agentId})` : agentId ? "Not found" : "Not entered"}</span>
      <span>${device ? `Last seen ${formatDateTime(device.lastSeenOnline)}` : "Device lookup pending"}</span>
    </div>
  `;
}

function populateRepairFormOptions() {
  elements.repairDeviceSelect.innerHTML = state.devices
    .map((device) => `<option value="${device.serialNumber}">${device.deviceName} • ${device.serialNumber}</option>`)
    .join("");

  elements.repairDeviceSelect.innerHTML = state.devices
    .map((device) => `<option value="${device.serialNumber}">${device.stationCode || "N/A"} | ${device.deviceName} | ${device.serialNumber}</option>`)
    .join("");

  elements.repairAgentSelect.innerHTML = state.agents
    .map((agent) => `<option value="${agent.agentId}">${agent.fullName} • ${agent.agentId}</option>`)
    .join("");
}

async function handleCheckout() {
  if (!currentUser()) {
    toast("Sign in to continue.", "error");
    return;
  }

  const agentId = elements.agentIdInput.value.trim().toUpperCase();
  const serial = elements.deviceSerialInput.value.trim().toUpperCase();
  const checkoutDurationDays = getSelectedCheckoutDuration();
  const agent = getAgent(agentId);
  const device = getDevice(serial);

  if (!agent) {
    toast("Agent ID was not found.", "error");
    return;
  }

  if (!device) {
    toast("Device serial number was not found.", "error");
    return;
  }

  if (device.status !== "Available") {
    toast(`Cannot check out ${device.deviceName} because it is ${device.status}.`, "error");
    return;
  }

  const transaction = {
    transactionId: `TX-${String(state.checkoutHistory.length + 1).padStart(5, "0")}`,
    deviceSerial: serial,
    agentId,
    checkoutAt: now.toISOString(),
    checkoutDurationDays,
    checkinAt: null,
    transactionStatus: "Active",
  };

  state.checkoutHistory.unshift(transaction);
  device.status = "Checked Out";
  device.currentAssignedAgentId = agentId;
  device.lastSeenOnline = now.toISOString();

  await syncDatabase();
  renderApp();
  toast(`${device.deviceName} checked out to ${agent.fullName}.`, "success");
  if (checkoutDurationDays > 5) {
    toast("Checkout is over 5 days. Please make sure the device is fully charged.", "error");
  }
}

async function handleReturn() {
  if (!currentUser()) {
    toast("Sign in to continue.", "error");
    return;
  }

  const serial = elements.deviceSerialInput.value.trim().toUpperCase();
  const device = getDevice(serial);

  if (!device) {
    toast("Device serial number was not found.", "error");
    return;
  }

  const activeTransaction = state.checkoutHistory.find(
    (transaction) => transaction.deviceSerial === serial && !transaction.checkinAt
  );

  if (!activeTransaction) {
    toast("No active checkout record exists for this device.", "error");
    return;
  }

  activeTransaction.checkinAt = now.toISOString();
  activeTransaction.transactionStatus = "Closed";
  device.status = "Available";
  device.currentAssignedAgentId = null;
  device.lastSeenOnline = now.toISOString();

  await syncDatabase();
  renderApp();
  toast(`${device.deviceName} returned successfully.`, "success");
}

function handleDamageFromKiosk() {
  if (!currentUser()) {
    toast("Sign in to continue.", "error");
    return;
  }

  const agentId = elements.agentIdInput.value.trim().toUpperCase();
  const serial = elements.deviceSerialInput.value.trim().toUpperCase();
  const agent = getAgent(agentId);
  const device = getDevice(serial);

  if (!agent || !device) {
    toast("Enter a valid agent ID and device serial before reporting damage.", "error");
    return;
  }

  elements.repairAgentSelect.value = agentId;
  elements.repairDeviceSelect.value = serial;
  elements.repairIssueInput.value = `Reported at kiosk by ${agent.fullName}. Add issue details here.`;
  switchView("repairs", "Repair Center");
  elements.navTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.viewTarget === "repairs");
  });
}

async function handleRepairSubmit(event) {
  event.preventDefault();

  if (!currentUser()) {
    toast("Sign in to continue.", "error");
    return;
  }

  const serial = elements.repairDeviceSelect.value;
  const agentId = elements.repairAgentSelect.value;
  const issueDescription = elements.repairIssueInput.value.trim();
  const device = getDevice(serial);
  const agent = getAgent(agentId);

  if (!device || !agent || !issueDescription) {
    toast("Complete all repair form fields before submitting.", "error");
    return;
  }

  const ticket = {
    ticketId: `RP-${String(state.repairTickets.length + 1).padStart(4, "0")}`,
    deviceSerial: serial,
    reportedByAgentId: agentId,
    dateReported: now.toISOString(),
    issueDescription,
    repairStatus: "Pending",
  };

  state.repairTickets.unshift(ticket);
  device.status = "In Repair";

  const activeTransaction = state.checkoutHistory.find(
    (transaction) => transaction.deviceSerial === serial && !transaction.checkinAt
  );
  if (activeTransaction) {
    activeTransaction.checkinAt = now.toISOString();
    activeTransaction.transactionStatus = "Closed";
  }

  device.currentAssignedAgentId = null;
  elements.repairForm.reset();
  populateRepairFormOptions();
  await syncDatabase();
  renderApp();
  toast(`${device.deviceName} moved to repair with ticket ${ticket.ticketId}.`, "success");
}

async function handleAddDevice(event) {
  event.preventDefault();

  if (!isAdminUser()) {
    toast("Only admins can add devices.", "error");
    return;
  }

  const serialNumber = elements.newDeviceSerialInput.value.trim().toUpperCase();
  const deviceNameInput = elements.newDeviceNameInput.value.trim();
  const stationCode = elements.newDeviceStationInput.value.trim().toUpperCase();
  const status = elements.newDeviceStatusSelect.value;
  const warrantyDate = elements.newDeviceWarrantyInput.value;

  if (!serialNumber || !warrantyDate || !stationCode) {
    toast("Serial number, station, and warranty expiration are required.", "error");
    return;
  }

  if (!isValidIataCode(stationCode)) {
    toast("Station must be a 3-letter IATA code.", "error");
    return;
  }

  if (!state.stations.some((station) => station.code === stationCode)) {
    toast(`Station ${stationCode} is not configured yet. Add the station first.`, "error");
    return;
  }

  if (getDevice(serialNumber)) {
    toast(`A device with serial ${serialNumber} already exists.`, "error");
    return;
  }

  const generatedIndex = state.devices.length + 1;
  const device = {
    serialNumber,
    deviceName: deviceNameInput || `Scanner ${String(generatedIndex).padStart(3, "0")}`,
    stationCode,
    barcodeValue: buildBarcodeValue(serialNumber),
    status,
    warrantyExpirationDate: new Date(`${warrantyDate}T12:00:00`).toISOString(),
    lastSeenOnline: now.toISOString(),
    currentAssignedAgentId: null,
  };

  state.devices.unshift(device);
  selectedDeviceSerial = serialNumber;
  elements.directorySearch.value = "";
  elements.directoryStatusFilter.value = "All";
  elements.addDeviceForm.reset();
  setDefaultWarrantyDate();
  await syncDatabase();
  renderApp();
  toast(`${device.deviceName} was added to inventory.`, "success");
}

async function handleAddUser(event) {
  event.preventDefault();

  if (!isAdminUser()) {
    toast("Only admins can add users.", "error");
    return;
  }

  const agentId = elements.newUserAgentIdInput.value.trim().toUpperCase();
  const fullName = elements.newUserFullNameInput.value.trim();
  const role = elements.newUserRoleSelect.value;
  const username = elements.newUserUsernameInput.value.trim().toLowerCase();
  const password = elements.newUserPasswordInput.value;

  if (!agentId || !fullName || !username || !password) {
    toast("Complete all user fields before submitting.", "error");
    return;
  }

  if (getAgent(agentId)) {
    toast(`Agent ID ${agentId} already exists.`, "error");
    return;
  }

  if (state.agents.some((agent) => (agent.username || "").toLowerCase() === username)) {
    toast(`Username ${username} is already in use.`, "error");
    return;
  }

  state.agents.push({
    agentId,
    fullName,
    role,
    username,
    password,
  });

  elements.addUserForm.reset();
  await syncDatabase();
  renderApp();
  toast(`${fullName} was added successfully.`, "success");
}

async function handleAddStation(event) {
  event.preventDefault();

  if (!isAdminUser()) {
    toast("Only admins can add stations.", "error");
    return;
  }

  const code = elements.newStationCodeInput.value.trim().toUpperCase();
  const name = elements.newStationNameInput.value.trim();

  if (!isValidIataCode(code) || !name) {
    toast("Enter a valid 3-letter station code and station name.", "error");
    return;
  }

  if (state.stations.some((station) => station.code === code)) {
    toast(`Station ${code} already exists.`, "error");
    return;
  }

  state.stations.push({ code, name });
  elements.addStationForm.reset();
  await syncDatabase();
  renderApp();
  toast(`Station ${code} was added.`, "success");
}

function renderStationAdminList() {
  if (!elements.stationAdminList) {
    return;
  }

  elements.stationAdminList.innerHTML = state.stations
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((station) => stackItem(station.code, station.name))
    .join("");
}

function handleDirectorySelection(event) {
  const row = event.target.closest("[data-serial]");
  if (!row) {
    return;
  }

  selectedDeviceSerial = row.dataset.serial;
  renderDirectoryTable();
}

async function resolveRepairTicket(ticketId) {
  if (!isAdminUser()) {
    toast("Only admins can resolve repair tickets.", "error");
    return;
  }

  const ticket = state.repairTickets.find((item) => item.ticketId === ticketId);
  if (!ticket || ticket.repairStatus === "Resolved") {
    return;
  }

  ticket.repairStatus = "Resolved";
  const device = getDevice(ticket.deviceSerial);
  const stillOpen = openRepairTickets().some((openTicket) => openTicket.deviceSerial === ticket.deviceSerial);
  if (device && !stillOpen) {
    device.status = "Available";
    device.lastSeenOnline = now.toISOString();
  }

  await syncDatabase();
  renderApp();
  toast(`Repair ticket ${ticketId} marked resolved.`, "success");
}

async function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, createSeedData());
  selectedDeviceSerial = null;
  await syncDatabase();
  renderApp();
  toast("Demo data reset to the original seeded state.", "success");
}

function loadStateFromLocal() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return normalizeState(JSON.parse(saved));
  }
  return createSeedData();
}

async function loadStateFromSupabase() {
  const [stations, agents, devices, checkoutHistory, repairTickets] = await Promise.all([
    fetchTable("stations"),
    fetchTable("agents"),
    fetchTable("devices"),
    fetchTable("checkout_history"),
    fetchTable("repair_tickets"),
  ]);

  const isEmpty =
    !stations.length && !agents.length && !devices.length && !checkoutHistory.length && !repairTickets.length;

  if (isEmpty && window.APP_CONFIG?.seedDemoDataOnEmptyDatabase) {
    const seeded = createSeedData();
    await writeStateToSupabase(seeded);
    return seeded;
  }

  return normalizeState({
    session: loadSession(),
    stations: stations.map((station) => ({ code: station.code, name: station.name })),
    agents: agents.map((agent) => ({
      agentId: agent.agent_id,
      fullName: agent.full_name,
      role: agent.role,
      username: agent.username,
      password: agent.password,
    })),
    devices: devices.map((device) => ({
      serialNumber: device.serial_number,
      deviceName: device.device_name,
      stationCode: device.station_code,
      barcodeValue: device.barcode_value,
      status: device.status,
      warrantyExpirationDate: device.warranty_expiration_date,
      lastSeenOnline: device.last_seen_online,
      currentAssignedAgentId: device.current_assigned_agent_id,
    })),
    checkoutHistory: checkoutHistory.map((transaction) => ({
      transactionId: transaction.transaction_id,
      deviceSerial: transaction.device_serial,
      agentId: transaction.agent_id,
      checkoutAt: transaction.checkout_at,
      checkoutDurationDays: transaction.checkout_duration_days,
      checkinAt: transaction.checkin_at,
      transactionStatus: transaction.transaction_status,
    })),
    repairTickets: repairTickets.map((ticket) => ({
      ticketId: ticket.ticket_id,
      deviceSerial: ticket.device_serial,
      reportedByAgentId: ticket.reported_by_agent_id,
      dateReported: ticket.date_reported,
      issueDescription: ticket.issue_description,
      repairStatus: ticket.repair_status,
    })),
  });
}

function saveState() {
  persistSession();
  if (activeBackend === "local") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      session: null,
    }));
  }
}

async function syncDatabase() {
  if (activeBackend !== "supabase") {
    saveState();
    return;
  }

  await writeStateToSupabase(state);
  persistSession();
}

function normalizeState(savedState) {
  return {
    ...savedState,
    session: savedState.session || null,
    stations: (savedState.stations || STATION_CODES.map((code) => ({ code, name: code }))).map((station) => ({
      code: station.code,
      name: station.name || station.code,
    })),
    agents: (savedState.agents || []).map((agent, index) => ({
      ...agent,
      username:
        agent.agentId === "AG001"
          ? "admin.yyz"
          : agent.agentId === "AG019"
            ? "ramp.yyz"
            : agent.username || buildUsername(agent.fullName, index),
      password:
        agent.agentId === "AG001"
          ? "Admin123!"
          : agent.agentId === "AG019"
            ? "Ramp123!"
            : agent.password || (agent.role === "Admin/Supervisor" ? "Admin123!" : "Ramp123!"),
    })),
    checkoutHistory: (savedState.checkoutHistory || []).map((transaction) => ({
      ...transaction,
      checkoutDurationDays: Number(transaction.checkoutDurationDays) || 1,
    })),
    devices: (savedState.devices || []).map((device, index) => ({
      ...device,
      stationCode: isValidIataCode(device.stationCode || "") ? device.stationCode : STATION_CODES[index % STATION_CODES.length],
      barcodeValue: device.barcodeValue || buildBarcodeValue(device.serialNumber),
    })),
  };
}

async function fetchTable(table) {
  const { data, error } = await supabaseClient.from(table).select("*");
  if (error) {
    throw error;
  }
  return data || [];
}

async function writeStateToSupabase(sourceState) {
  await upsertTable("stations", sourceState.stations.map((station) => ({
    code: station.code,
    name: station.name,
  })));

  await upsertTable("agents", sourceState.agents.map((agent) => ({
    agent_id: agent.agentId,
    full_name: agent.fullName,
    role: agent.role,
    username: agent.username,
    password: agent.password,
  })));

  await upsertTable("devices", sourceState.devices.map((device) => ({
    serial_number: device.serialNumber,
    device_name: device.deviceName,
    station_code: device.stationCode,
    barcode_value: device.barcodeValue,
    status: device.status,
    warranty_expiration_date: device.warrantyExpirationDate,
    last_seen_online: device.lastSeenOnline,
    current_assigned_agent_id: device.currentAssignedAgentId,
  })));

  await upsertTable("checkout_history", sourceState.checkoutHistory.map((transaction) => ({
    transaction_id: transaction.transactionId,
    device_serial: transaction.deviceSerial,
    agent_id: transaction.agentId,
    checkout_at: transaction.checkoutAt,
    checkout_duration_days: transaction.checkoutDurationDays,
    checkin_at: transaction.checkinAt,
    transaction_status: transaction.transactionStatus,
  })));

  await upsertTable("repair_tickets", sourceState.repairTickets.map((ticket) => ({
    ticket_id: ticket.ticketId,
    device_serial: ticket.deviceSerial,
    reported_by_agent_id: ticket.reportedByAgentId,
    date_reported: ticket.dateReported,
    issue_description: ticket.issueDescription,
    repair_status: ticket.repairStatus,
  })));
}

async function upsertTable(table, rows) {
  if (!rows.length) {
    return;
  }

  const { error } = await supabaseClient.from(table).upsert(rows);
  if (error) {
    throw error;
  }
}

function loadSession() {
  const saved = localStorage.getItem(SESSION_KEY);
  return saved ? JSON.parse(saved) : null;
}

function persistSession() {
  if (state.session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(state.session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

function setDefaultWarrantyDate() {
  if (!elements.newDeviceWarrantyInput.value) {
    const defaultDate = new Date(now.getTime() + 365 * DAY_MS);
    elements.newDeviceWarrantyInput.value = toDateInputValue(defaultDate);
  }
}

function createSeedData() {
  const stations = STATION_CODES.map((code) => ({ code, name: stationNameFromCode(code) }));
  const agents = Array.from({ length: 250 }, (_, index) => {
    const number = index + 1;
    const role = number <= 18 ? "Admin/Supervisor" : "Agent";
    const fullName = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[index % LAST_NAMES.length]}`;
    return {
      agentId: `AG${String(number).padStart(3, "0")}`,
      fullName,
      role,
      username:
        number === 1
          ? "admin.yyz"
          : number === 19
            ? "ramp.yyz"
            : buildUsername(fullName, index),
      password: number === 1 ? "Admin123!" : number === 19 ? "Ramp123!" : role === "Admin/Supervisor" ? "Admin123!" : "Ramp123!",
    };
  });

  const devices = Array.from({ length: 300 }, (_, index) => {
    const number = index + 1;
    let status = "Available";
    if (number > 240 && number <= 285) {
      status = "Checked Out";
    } else if (number > 285) {
      status = "In Repair";
    }

    const assignedAgent = status === "Checked Out" ? agents[(number - 241) % 220 + 20] : null;
    const warrantyDate = new Date(now.getTime() + ((index % 90) - 15) * DAY_MS);
    const lastSeenOffset = status === "Checked Out" ? (index % 3 === 0 ? 30 : 6) * 60 * 60 * 1000 : 2 * 60 * 60 * 1000;
    return {
      serialNumber: `TC78-${String(number).padStart(4, "0")}`,
      deviceName: `Scanner ${String(number).padStart(3, "0")}`,
      stationCode: STATION_CODES[index % STATION_CODES.length],
      barcodeValue: buildBarcodeValue(`TC78-${String(number).padStart(4, "0")}`),
      status,
      warrantyExpirationDate: warrantyDate.toISOString(),
      lastSeenOnline: new Date(now.getTime() - lastSeenOffset).toISOString(),
      currentAssignedAgentId: assignedAgent ? assignedAgent.agentId : null,
    };
  });

  const checkoutHistory = [];
  for (let index = 0; index < 500; index += 1) {
    const device = devices[index % devices.length];
    const agent = agents[index % agents.length];
    const checkoutAt = new Date(now.getTime() - (index + 3) * 17 * 60 * 60 * 1000);
    const isActiveSeed = device.status === "Checked Out" && !checkoutHistory.some(
      (record) => record.deviceSerial === device.serialNumber && !record.checkinAt
    );
    const checkinAt = isActiveSeed ? null : new Date(checkoutAt.getTime() + ((index % 10) + 4) * 60 * 60 * 1000).toISOString();

    checkoutHistory.push({
      transactionId: `TX-${String(index + 1).padStart(5, "0")}`,
      deviceSerial: device.serialNumber,
      agentId: isActiveSeed && device.currentAssignedAgentId ? device.currentAssignedAgentId : agent.agentId,
      checkoutAt: checkoutAt.toISOString(),
      checkoutDurationDays: (index % 7) + 1,
      checkinAt,
      transactionStatus: checkinAt ? "Closed" : "Active",
    });
  }

  const repairTickets = Array.from({ length: 28 }, (_, index) => {
    const device = devices[272 + (index % 28)];
    const agent = agents[(index * 7) % agents.length];
    return {
      ticketId: `RP-${String(index + 1).padStart(4, "0")}`,
      deviceSerial: device.serialNumber,
      reportedByAgentId: agent.agentId,
      dateReported: new Date(now.getTime() - index * 36 * 60 * 60 * 1000).toISOString(),
      issueDescription: ISSUE_DESCRIPTIONS[index % ISSUE_DESCRIPTIONS.length],
      repairStatus: index < 15 ? "Pending" : index < 22 ? "In Progress" : "Resolved",
    };
  });

  return { agents, devices, checkoutHistory, repairTickets, stations, session: null };
}

function getAgent(agentId) {
  return state.agents.find((agent) => agent.agentId === agentId);
}

function getDevice(serialNumber) {
  return state.devices.find((device) => device.serialNumber === serialNumber);
}

function activeTransactions() {
  return state.checkoutHistory.filter((transaction) => !transaction.checkinAt);
}

function openRepairTickets() {
  return state.repairTickets.filter((ticket) => ticket.repairStatus !== "Resolved");
}

function offlineDevices() {
  return state.devices.filter((device) => {
    const lastSeen = new Date(device.lastSeenOnline).getTime();
    return device.status === "Checked Out" && now.getTime() - lastSeen > DAY_MS;
  });
}

function summarizeDevices() {
  return {
    available: countByStatus("Available"),
    checkedOut: countByStatus("Checked Out"),
    inRepair: countByStatus("In Repair"),
  };
}

function countByStatus(status, devices = state.devices) {
  return devices.filter((device) => device.status === status).length;
}

function daysUntil(dateString) {
  const target = new Date(dateString).getTime();
  return Math.ceil((target - now.getTime()) / DAY_MS);
}

function toDateInputValue(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function populateStationFilters() {
  const currentValue = elements.dashboardStationFilter.value || "All";
  const options = ["All", ...getStationCodes()];
  elements.dashboardStationFilter.innerHTML = options
    .map((stationCode) => `<option value="${stationCode}">${stationCode === "All" ? "All Stations" : stationCode}</option>`)
    .join("");
  elements.dashboardStationFilter.value = options.includes(currentValue) ? currentValue : "All";
}

function getStationCodes() {
  return (state.stations || []).map((station) => station.code).sort();
}

function selectedStation() {
  return elements.dashboardStationFilter.value || "All";
}

function dashboardDevices() {
  const stationCode = selectedStation();
  return stationCode === "All"
    ? state.devices
    : state.devices.filter((device) => device.stationCode === stationCode);
}

function dashboardHistory() {
  const visibleSerials = new Set(dashboardDevices().map((device) => device.serialNumber));
  return state.checkoutHistory.filter((transaction) => visibleSerials.has(transaction.deviceSerial));
}

function summarizeByStation(devices) {
  const groups = new Map();
  devices.forEach((device) => {
    const stationCode = device.stationCode || "N/A";
    const current = groups.get(stationCode) || {
      stationCode,
      count: 0,
      available: 0,
      checkedOut: 0,
      inRepair: 0,
    };
    current.count += 1;
    if (device.status === "Available") current.available += 1;
    if (device.status === "Checked Out") current.checkedOut += 1;
    if (device.status === "In Repair") current.inRepair += 1;
    groups.set(stationCode, current);
  });
  return [...groups.values()].sort((a, b) => a.stationCode.localeCompare(b.stationCode));
}

function isValidIataCode(value) {
  return /^[A-Z]{3}$/.test(value);
}

function buildUsername(fullName, index = 0) {
  const base = fullName.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "");
  return `${base || "user"}.${String(index + 1).padStart(2, "0")}`;
}

function stationNameFromCode(code) {
  const names = {
    YTZ: "Toronto City",
    YYZ: "Toronto Pearson",
    YUL: "Montreal",
    YOW: "Ottawa",
    YHZ: "Halifax",
    YVR: "Vancouver",
    YYC: "Calgary",
    EWR: "Newark",
    BOS: "Boston",
    ORD: "Chicago O'Hare",
  };
  return names[code] || code;
}

function getSelectedCheckoutDuration() {
  return Number(elements.checkoutDurationInput.value) || 1;
}

function renderDurationWarning() {
  const showWarning = getSelectedCheckoutDuration() > 5;
  elements.durationWarning.classList.toggle("is-hidden", !showWarning);
}

function renderNewDeviceBarcodePreview() {
  const serialNumber = elements.newDeviceSerialInput.value.trim().toUpperCase() || "TC78-XXXX";
  const previewDevice = {
    serialNumber,
    barcodeValue: buildBarcodeValue(serialNumber),
  };
  elements.newDeviceBarcodePreview.innerHTML = renderBarcodeCard(previewDevice, "New device barcode");
}


function renderBarcodeCard(device, title = "Device barcode") {
  const barcodeValue = device.barcodeValue || buildBarcodeValue(device.serialNumber);
  return `
    <div class="barcode-card">
      <strong>${title}</strong>
      ${generateBarcodeSvg(barcodeValue)}
      <div class="barcode-code">${barcodeValue}</div>
    </div>
  `;
}

function buildBarcodeValue(serialNumber) {
  return `DEV-${serialNumber}`;
}

function generateBarcodeSvg(value) {
  const normalized = value.replace(/[^A-Z0-9 .$/+%\-]/gi, "").toUpperCase();
  const encodedValue = `*${normalized}*`;
  const bars = [];
  const narrow = 2;
  const wide = 6;
  const gap = 2;
  let position = 18;

  for (const char of encodedValue) {
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS["-"];
    for (let index = 0; index < pattern.length; index += 1) {
      const unit = pattern[index] === "w" ? wide : narrow;
      const isBar = index % 2 === 0;
      if (isBar) {
        bars.push(`<rect x="${position}" y="10" width="${unit}" height="52" fill="#03182d"></rect>`);
      }
      position += unit;
    }
    position += gap;
  }

  const width = Math.max(position + 18, 240);
  return `
    <svg class="barcode-svg" viewBox="0 0 ${width} 92" role="img" aria-label="Code 39 barcode for ${normalized}">
      <rect x="0" y="0" width="${width}" height="92" rx="16" fill="#ffffff"></rect>
      ${bars.join("")}
      <text x="${width / 2}" y="80" text-anchor="middle" font-size="11" letter-spacing="2" fill="#5d7288">${normalized}</text>
    </svg>
  `;
}

async function startBarcodeScanner(target) {
  scannerTarget = target;

  if (!("mediaDevices" in navigator) || !navigator.mediaDevices.getUserMedia || !("BarcodeDetector" in window)) {
    toast("Barcode scanning is not available here. Enter the serial manually.", "error");
    return;
  }

  try {
    const formats = await getSupportedBarcodeFormats();
    if (!formats.length) {
      toast("This browser does not support Code 39 barcode decoding. Enter the serial manually.", "error");
      return;
    }

    barcodeDetectorInstance = new BarcodeDetector({ formats });
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });

    elements.scannerVideo.srcObject = scannerStream;
    elements.scannerModal.classList.remove("is-hidden");
    elements.scannerModal.setAttribute("aria-hidden", "false");
    elements.scannerStatus.textContent = "Point the camera at a device barcode.";
    await elements.scannerVideo.play();
    scanBarcodeFrame();
  } catch (error) {
    closeBarcodeScanner();
    toast("Unable to start camera scanning. Please allow camera access or enter the serial manually.", "error");
  }
}

async function getSupportedBarcodeFormats() {
  const preferred = ["code_39", "code_128", "qr_code", "ean_13", "ean_8"];
  if (typeof BarcodeDetector.getSupportedFormats === "function") {
    const supported = await BarcodeDetector.getSupportedFormats();
    return preferred.filter((format) => supported.includes(format));
  }
  return preferred;
}

async function scanBarcodeFrame() {
  if (!barcodeDetectorInstance || !elements.scannerVideo.srcObject) {
    return;
  }

  try {
    const barcodes = await barcodeDetectorInstance.detect(elements.scannerVideo);
    if (barcodes.length) {
      const rawValue = (barcodes[0].rawValue || "").trim().toUpperCase();
      const device = resolveScannedDevice(rawValue);
      if (device) {
        applyScannedDevice(device);
        toast(`${device.deviceName} barcode scanned successfully.`, "success");
        closeBarcodeScanner();
        return;
      }
      elements.scannerStatus.textContent = `Scanned ${rawValue}, but no matching device was found.`;
    }
  } catch (error) {
    elements.scannerStatus.textContent = "Scanning is active. Hold the barcode steady in view.";
  }

  scannerAnimationFrame = window.requestAnimationFrame(scanBarcodeFrame);
}

function resolveScannedDevice(rawValue) {
  return state.devices.find((device) => {
    const barcodeValue = (device.barcodeValue || buildBarcodeValue(device.serialNumber)).toUpperCase();
    return barcodeValue === rawValue || device.serialNumber.toUpperCase() === rawValue;
  });
}

function applyScannedDevice(device) {
  if (scannerTarget === "deviceSerial") {
    elements.deviceSerialInput.value = device.serialNumber;
    renderKioskLookup();
  }
}

function closeBarcodeScanner() {
  if (scannerAnimationFrame) {
    window.cancelAnimationFrame(scannerAnimationFrame);
    scannerAnimationFrame = null;
  }

  if (scannerStream) {
    scannerStream.getTracks().forEach((track) => track.stop());
    scannerStream = null;
  }

  elements.scannerVideo.srcObject = null;
  elements.scannerModal.classList.add("is-hidden");
  elements.scannerModal.setAttribute("aria-hidden", "true");
  elements.scannerStatus.textContent = "Point the camera at a device barcode.";
}

function emptyTableRow(message, colspan) {
  return `<tr><td colspan="${colspan}">${message}</td></tr>`;
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

function formatDateTime(dateString) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(dateString));
}

function miniStat(label, value) {
  return `<div class="mini-stat"><span>${label}</span><strong>${value}</strong></div>`;
}

function stackItem(title, meta) {
  return `<li class="stack-item"><strong>${title}</strong><p>${meta}</p></li>`;
}

function historyItem(transaction) {
  const agent = getAgent(transaction.agentId);
  return `
    <div class="history-item">
      <strong>${agent ? agent.fullName : transaction.agentId}</strong>
      <p>Checked out ${formatDateTime(transaction.checkoutAt)}</p>
      <p>${transaction.checkinAt ? `Returned ${formatDateTime(transaction.checkinAt)}` : "Still active"}</p>
    </div>
  `;
}

function repairItem(ticket, showResolveButton = false) {
  const agent = getAgent(ticket.reportedByAgentId);
  const device = getDevice(ticket.deviceSerial);
  return `
    <div class="ticket-item">
      <strong>${ticket.ticketId} • ${device ? device.deviceName : ticket.deviceSerial}</strong>
      <p>${ticket.issueDescription}</p>
      <p>Reported by ${agent ? agent.fullName : ticket.reportedByAgentId} on ${formatDateTime(ticket.dateReported)}</p>
      <p>Status: ${ticket.repairStatus}</p>
      ${showResolveButton && ticket.repairStatus !== "Resolved" ? `<button type="button" data-ticket-id="${ticket.ticketId}">Mark Resolved</button>` : ""}
    </div>
  `;
}

function statusPill(status) {
  const className = `status-${status.toLowerCase().replace(/\s+/g, "-")}`;
  return `<span class="status-pill ${className}">${status}</span>`;
}

function toast(message, type = "success") {
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;
  elements.toastRegion.appendChild(item);
  setTimeout(() => item.remove(), 2800);
}
