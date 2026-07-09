// @ts-nocheck
document.addEventListener("DOMContentLoaded", () => {
  let toastContainer = null;
  let loadingOverlay = null;
  let confirmOverlay = null;

  // --- Helper Utilities ---
  const safeJsonParse = (value, fallback) => {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  };

  function createToastContainer() {
    if (toastContainer) return toastContainer;
    toastContainer = document.createElement("div");
    Object.assign(toastContainer.style, {
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      alignItems: "center",
      width: "min(440px, calc(100% - 32px))",
      zIndex: "9999",
      pointerEvents: "none",
    });
    document.body.appendChild(toastContainer);
    return toastContainer;
  }

  function showCustomAlert(message, type = "error") {
    const container = createToastContainer();
    const alertBox = document.createElement("div");
    const success = type === "success";

    alertBox.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="display:inline-flex;width:24px;height:24px;border-radius:50%;align-items:center;justify-content:center;background:rgba(255,255,255,0.12);font-size:0.95rem;">
          ${success ? "✓" : "!"}
        </span>
        <span style="flex:1;">${message}</span>
      </div>
    `;

    Object.assign(alertBox.style, {
      width: "100%",
      padding: "16px 18px",
      borderRadius: "16px",
      color: "#fff",
      backgroundColor: success ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.93)",
      boxShadow: "0 18px 45px rgba(0,0,0,0.18)",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      fontSize: "0.95rem",
      fontWeight: "500",
      opacity: "0",
      transform: "translateY(-10px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
      pointerEvents: "auto",
    });

    container.appendChild(alertBox);

    requestAnimationFrame(() => {
      alertBox.style.opacity = "1";
      alertBox.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      alertBox.style.opacity = "0";
      alertBox.style.transform = "translateY(-10px)";
      setTimeout(() => alertBox.remove(), 300);
    }, 3200);
  }

  function createLoader() {
    if (loadingOverlay) return loadingOverlay;
    loadingOverlay = document.createElement("div");
    Object.assign(loadingOverlay.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.55)",
      zIndex: "10000",
      color: "#fff",
      fontSize: "1rem",
      fontFamily: "Inter, sans-serif",
      backdropFilter: "blur(4px)",
      transition: "opacity 0.2s ease",
    });
    loadingOverlay.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:18px 24px;background:rgba(15,23,42,0.9);border-radius:14px;">
        <span style="width:20px;height:20px;border:3px solid rgba(255,255,255,0.25);border-top-color:#fff;border-radius:50%;animation:spin 1s linear infinite;"></span>
        <span>Loading...</span>
      </div>
    `;
    const styleEl = document.createElement("style");
    styleEl.textContent = `@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`;
    document.head.appendChild(styleEl);
    document.body.appendChild(loadingOverlay);
    return loadingOverlay;
  }

  function showLoader() {
    const overlay = createLoader();
    overlay.style.display = "flex";
    overlay.style.opacity = "1";
  }

  function hideLoader() {
    if (!loadingOverlay) return;
    loadingOverlay.style.opacity = "0";
    setTimeout(() => {
      if (loadingOverlay) loadingOverlay.style.display = "none";
    }, 200);
  }

  function createConfirmModal(title = "Confirm Action", message = "Are you sure you want to proceed?") {
    if (!confirmOverlay) {
      confirmOverlay = document.createElement("div");
      document.body.appendChild(confirmOverlay);
    }
    
    Object.assign(confirmOverlay.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.6)",
      zIndex: "10001",
      opacity: "0",
      transition: "opacity 0.2s ease",
      padding: "20px",
    });
    
    confirmOverlay.innerHTML = `
      <div style="background:rgba(15,23,42,0.96);border-radius:18px;width:min(420px,100%);padding:28px;color:#f8fafc;text-align:center;">
        <div class="modal-title" style="font-size:1.15rem;font-weight:700;margin-bottom:12px;">${title}</div>
        <div class="modal-msg" style="color:#cbd5e1;margin-bottom:24px;">${message}</div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="confirm-btn-cancel" style="background:transparent;border:1px solid rgba(255,255,255,0.18);color:#f8fafc;padding:12px 18px;border-radius:12px;cursor:pointer;min-width:110px;">Cancel</button>
          <button type="button" class="confirm-btn-confirm" style="background:#ef4444;border:none;color:#fff;padding:12px 18px;border-radius:12px;cursor:pointer;min-width:110px;">Proceed</button>
        </div>
      </div>
    `;
    return confirmOverlay;
  }

  function showConfirmModal(title, message, confirmBtnText = "Proceed", isDanger = true) {
    const overlay = createConfirmModal(title, message);
    const cancelButton = overlay.querySelector(".confirm-btn-cancel");
    const confirmButton = overlay.querySelector(".confirm-btn-confirm");

    if (confirmButton) {
      confirmButton.textContent = confirmBtnText;
      confirmButton.style.backgroundColor = isDanger ? "#ef4444" : "#10b981";
    }

    overlay.style.display = "flex";
    requestAnimationFrame(() => (overlay.style.opacity = "1"));

    return new Promise((resolve) => {
      const cleanup = () => {
        overlay.style.opacity = "0";
        setTimeout(() => (overlay.style.display = "none"), 200);
        cancelButton?.removeEventListener("click", onCancel);
        confirmButton?.removeEventListener("click", onConfirm);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      const onConfirm = () => {
        cleanup();
        resolve(true);
      };

      cancelButton?.addEventListener("click", onCancel);
      confirmButton?.addEventListener("click", onConfirm);
    });
  }

  // --- Session & Route Management ---
  let currentUser = safeJsonParse(localStorage.getItem("currentUser"), null);
  const rawPath = window.location.pathname.replace(/\\/g, "/");
  const currentFile = rawPath.split("/").pop() || "index.html";
  const isInPagesFolder = rawPath.includes("/pages/");

  const paths = {
    auth: isInPagesFolder ? "auth.html" : "pages/auth.html",
    index: isInPagesFolder ? "../index.html" : "index.html",
    history: isInPagesFolder ? "history.html" : "pages/history.html",
    add: isInPagesFolder ? "add.html" : "pages/add.html",
    setting: isInPagesFolder ? "setting.html" : "pages/setting.html",
  };

  const isAuthPage = currentFile === "auth.html";
  const isHistoryPage = currentFile === "history.html";
  const isAddPage = currentFile === "add.html";
  const isSettingPage = currentFile === "setting.html";
  const isIndexPage = currentFile === "index.html";

  if (!currentUser && !isAuthPage) {
    window.location.href = paths.auth;
    return;
  }

  if (currentUser && isAuthPage) {
    window.location.href = paths.index;
    return;
  }

  // --- Navigation Layout Sync ---
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href") || "";

    if (
      (isIndexPage && (href.includes("index.html") || href.includes("#home") || href === "./index.html")) ||
      (isHistoryPage && href.includes("history.html")) ||
      (isAddPage && href.includes("add.html")) ||
      (isSettingPage && href.includes("setting.html"))
    ) {
      link.classList.add("active");
    }

    if (href && !href.startsWith("#") && link.hostname === window.location.hostname) {
      link.addEventListener("click", showLoader);
    }
  });

  // --- Helper: Avatar Render Engine ---
  function renderAvatarElement(container, user) {
    if (!container || !user) return;
    container.innerHTML = "";
    if (user.avatar) {
      const img = document.createElement("img");
      img.src = user.avatar;
      img.alt = user.name ? `${user.name} avatar` : "User avatar";
      Object.assign(img.style, {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "50%"
      });
      container.appendChild(img);
    } else {
      const initials = user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U";
      container.textContent = initials;
    }
  }

  // --- Index Dashboard View Logic ---
  if (isIndexPage) {
    const totalBalanceNode = document.querySelector(".total .amount");
    const incomeAmountNode = document.querySelector(".income .amount");
    const expenseAmountNode = document.querySelector(".lost .amount");
    const homeAvatar = document.getElementById("home-avatar");
    const homeGreetingName = document.getElementById("home-greeting-name");

    const transactions = safeJsonParse(localStorage.getItem("transactions"), []);
    const userTransactions = transactions.filter((t) => t.userEmail === currentUser?.email);

    const incomeTotal = userTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expenseTotal = userTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const balanceTotal = incomeTotal - expenseTotal;

    if (totalBalanceNode) totalBalanceNode.textContent = `$${balanceTotal.toFixed(2)}`;
    if (incomeAmountNode) incomeAmountNode.textContent = `$${incomeTotal.toFixed(2)}`;
    if (expenseAmountNode) expenseAmountNode.textContent = `$${expenseTotal.toFixed(2)}`;
    if (homeGreetingName) homeGreetingName.textContent = currentUser?.name || "User";

    renderAvatarElement(homeAvatar, currentUser);
  }

  // --- Auth Flow Form Logic ---
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const formLogin = document.getElementById("form-login");
  const formSignup = document.getElementById("form-signup");
  const formForgot = document.getElementById("form-forgot");

  if (tabLogin && tabSignup && formLogin && formSignup) {
    const showLoginView = () => {
      formLogin.classList.remove("hidden");
      formSignup.classList.add("hidden");
      formForgot?.classList.add("hidden");
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
    };

    const showSignupView = () => {
      formSignup.classList.remove("hidden");
      formLogin.classList.add("hidden");
      formForgot?.classList.add("hidden");
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
    };

    const showForgotView = () => {
      if (formForgot) formForgot.classList.remove("hidden");
      formLogin.classList.add("hidden");
      formSignup.classList.add("hidden");
      tabLogin.classList.remove("active");
      tabSignup.classList.remove("active");
    };

    tabLogin.addEventListener("click", showLoginView);
    tabSignup.addEventListener("click", showSignupView);

    document.querySelector(".forgot-password-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      showForgotView();
    });

    document.querySelector(".back-to-login")?.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginView();
    });

    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = formLogin.querySelectorAll("input");
      const email = inputs[0]?.value.trim() || "";
      const password = inputs[1]?.value.trim() || "";
      const users = safeJsonParse(localStorage.getItem("users"), []);
      const user = users.find((u) => u.email === email && u.password === password);

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = paths.index;
      } else {
        showCustomAlert("Invalid email or password. Please try again.", "error");
      }
    });

    if (formForgot) {
      formForgot.addEventListener("submit", (e) => {
        e.preventDefault();
        const inputs = formForgot.querySelectorAll("input");
        const email = inputs[0]?.value.trim() || "";
        const password = inputs[1]?.value.trim() || "";
        const confirmPassword = inputs[2]?.value.trim() || "";

        if (!email || !password || !confirmPassword) return showCustomAlert("Please complete all fields.", "error");
        if (password !== confirmPassword) return showCustomAlert("Passwords do not match.", "error");

        const users = safeJsonParse(localStorage.getItem("users"), []);
        const userIndex = users.findIndex((u) => u.email === email);
        if (userIndex === -1) return showCustomAlert("No account found for that email address.", "error");

        users[userIndex].password = password;
        localStorage.setItem("users", JSON.stringify(users));
        showCustomAlert("Password updated successfully. Please log in.", "success");
      });
    }

    formSignup.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = formSignup.querySelectorAll("input");
      const name = inputs[0]?.value.trim() || "";
      const email = inputs[1]?.value.trim() || "";
      const password = inputs[2]?.value.trim() || "";

      if (!name || !email || !password) return showCustomAlert("Please fill out all fields.", "error");

      const users = safeJsonParse(localStorage.getItem("users"), []);
      if (users.some((u) => u.email === email)) return showCustomAlert("User already exists! Please log in.", "error");

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      window.location.href = paths.index;
    });
  }

  // --- Add Transaction Form Logic ---
  const addForm = document.querySelector("form.card");
  const saveBtn = document.querySelector(".btn-submit");

  if (isAddPage && addForm && saveBtn && currentUser) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const titleInput = addForm.querySelector("input[type='text']");
      const amountInput = addForm.querySelector("input[type='number']");
      const typeSelect = addForm.querySelector("select");

      const title = titleInput?.value.trim() || "";
      const amount = amountInput?.value.trim() || "";
      const type = typeSelect?.value || "expense";

      if (!title || !amount) return showCustomAlert("Please fill out all fields.", "error");

      const transactions = safeJsonParse(localStorage.getItem("transactions"), []);
      const newTransaction = {
        id: Date.now(),
        userEmail: currentUser.email,
        title,
        amount: parseFloat(amount),
        type,
        date: new Date().toLocaleString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
      };

      transactions.push(newTransaction);
      localStorage.setItem("transactions", JSON.stringify(transactions));
      showCustomAlert(`Successfully added: ${title} for $${parseFloat(amount).toFixed(2)}`, "success");
      addForm.reset();
      window.location.href = `${paths.history}#txn-${newTransaction.id}`;
    });
  }

  // --- Transaction History View Logic ---
  if (isHistoryPage && currentUser) {
    const historyContainer = document.querySelector("#history-container");
    const incomeValue = document.querySelector(".summary-value.income");
    const expenseValue = document.querySelector(".summary-value.expense");
    const balanceValue = document.querySelector(".summary-value.balance");

    function renderHistory() {
      const transactions = safeJsonParse(localStorage.getItem("transactions"), []);
      const userTransactions = transactions.filter((t) => t.userEmail === currentUser.email);

      const incomeTotal = userTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const expenseTotal = userTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + Number(t.amount || 0), 0);
      const balanceTotal = incomeTotal - expenseTotal;

      if (incomeValue) incomeValue.textContent = `$${incomeTotal.toFixed(2)}`;
      if (expenseValue) expenseValue.textContent = `$${expenseTotal.toFixed(2)}`;
      if (balanceValue) {
        balanceValue.textContent = `$${balanceTotal.toFixed(2)}`;
        balanceValue.style.color = balanceTotal >= 0 ? "#10b981" : "#ef4444";
      }

      if (!historyContainer) return;

      if (userTransactions.length === 0) {
        historyContainer.innerHTML = `
          <div style="padding:40px;text-align:center;color:#cbd5e1;width:100%;">No transactions yet. Add one to get started.</div>
        `;
      } else {
        historyContainer.innerHTML = userTransactions.map((t) => {
          const amount = Number(t.amount).toFixed(2);
          const isIncome = t.type === "income";
          return `
            <div id="txn-${t.id}" class="t-item">
              <div class="t-info">
                <span class="t-title">${t.title}</span>
                <span class="t-date">${t.date}</span>
              </div>
              <div class="t-right">
                <span class="t-amount ${isIncome ? "income" : "expense"}">${isIncome ? "+" : "-"}$${amount}</span>
                <button type="button" class="delete-btn" data-id="${t.id}">&times;</button>
              </div>
            </div>
          `;
        }).join("");

        const targetId = window.location.hash.slice(1);
        if (targetId) {
          const targetRow = historyContainer.querySelector(`#${CSS.escape(targetId)}`);
          if (targetRow) targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      historyContainer.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = Number(button.dataset.id);
          const confirmed = await showConfirmModal("Confirm delete", "Are you sure you want to delete this transaction?", "Delete", true);
          if (!confirmed) return;

          const currentTransactions = safeJsonParse(localStorage.getItem("transactions"), []);
          const updated = currentTransactions.filter((t) => t.id !== id);
          localStorage.setItem("transactions", JSON.stringify(updated));
          showCustomAlert("Transaction deleted.", "success");
          renderHistory();
        });
      });
    }

    renderHistory();
  }

  // --- Dynamic Settings Panel System ---
  if (isSettingPage && currentUser) {
    const profileName = document.querySelector(".profile-name");
    const profileEmail = document.querySelector(".profile-email");
    const avatar = document.querySelector(".avatar");
    const settingsList = document.querySelector('.settings-list');
    const actionCard = document.getElementById('settings-action-card');

    const updateProfileUI = () => {
      if (profileName) profileName.textContent = currentUser.name || "User";
      if (profileEmail) profileEmail.textContent = currentUser.email || "No email provided";
      renderAvatarElement(avatar, currentUser);
    };

    // Initial load sync
    updateProfileUI();

    // Functional Content Templates
    const templates = {
      account: () => `
        <h3>Account Settings</h3>
        <form id="account-form" class="settings-form">
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px; align-items:center;">
            <div id="settings-avatar-preview" style="width:72px; height:72px; border-radius:50%; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:1.5rem; font-weight:bold; overflow:hidden;"></div>
            <label for="avatar-upload" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); padding:6px 14px; border-radius:8px; font-size:0.85rem; cursor:pointer; font-weight:500; transition: background 0.2s;">
              Change Avatar
            </label>
            <input type="file" id="avatar-upload" accept="image/png, image/jpeg, image/svg+xml, image/gif" style="display:none;" />
            <span style="font-size:0.75rem; color:#cbd5e1;">Supports PNG, JPEG, SVG, or GIF</span>
          </div>

          <label for="username">Name</label>
          <input type="text" id="username" value="${currentUser.name || ''}" required />
          
          <label for="email">Email Address</label>
          <input type="email" id="email" value="${currentUser.email || ''}" required />
          
          <button type="submit" class="btn-save">Save Changes</button>
        </form>
      `,
      preferences: () => `
        <h3>Preferences</h3>
        <div class="settings-form">
          <label for="currency">Default Currency</label>
          <select id="currency">
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
          
          <label for="notifications">
            <input type="checkbox" id="notifications" checked /> Enable Email Alerts
          </label>
          
          <button id="save-preferences" class="btn-save">Save Preferences</button>
        </div>
      `,
      export: () => `
        <h3>Export Data</h3>
        <p>Download a copy of your transaction history for backup or external use.</p>
        <div class="export-options">
          <button class="btn-export" data-format="csv">Export as CSV</button>
          <button class="btn-export" data-format="json">Export as JSON</button>
        </div>
      `,
      help: () => `
        <h3>Help & Support</h3>
        <p>Need assistance or found a bug? Drop us a line below.</p>
        <form id="support-form" class="settings-form">
          <label for="message">Your Message</label>
          <textarea id="message" rows="4" placeholder="How can we help you?" required></textarea>
          <button type="submit" class="btn-save">Submit Ticket</button>
        </form>
      `
    };

    // Attach Event Handlers to Dynamic Settings Form Elements
    const attachFormListeners = (actionType) => {
      if (actionType === 'account') {
        const previewBlock = document.getElementById("settings-avatar-preview");
        const fileInput = document.getElementById("avatar-upload");
        let localAvatarBase64 = currentUser.avatar || null;

        // Populate initial settings preview 
        renderAvatarElement(previewBlock, currentUser);

        // Manage immediate File Inputs
        fileInput?.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;

          const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/gif"];
          if (!allowedTypes.includes(file.type)) {
            return showCustomAlert("Unsupported format! Please use a valid PNG, JPEG, SVG, or GIF image.", "error");
          }

          const reader = new FileReader();
          reader.onload = (event) => {
            localAvatarBase64 = event.target.result;
            // Update context placeholder structure inside current module layout view
            renderAvatarElement(previewBlock, { name: currentUser.name, avatar: localAvatarBase64 });
          };
          reader.readAsDataURL(file);
        });

        document.getElementById('account-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const newName = document.getElementById('username').value.trim();
          const newEmail = document.getElementById('email').value.trim();

          const users = safeJsonParse(localStorage.getItem("users"), []);
          const userIndex = users.findIndex(u => u.email === currentUser.email);

          if (userIndex !== -1) {
            users[userIndex].name = newName;
            users[userIndex].email = newEmail;
            users[userIndex].avatar = localAvatarBase64;
            localStorage.setItem("users", JSON.stringify(users));
          }

          // Commit modifications to memory
          currentUser.name = newName;
          currentUser.email = newEmail;
          currentUser.avatar = localAvatarBase64;
          localStorage.setItem("currentUser", JSON.stringify(currentUser));

          updateProfileUI();
          showCustomAlert('Account settings updated successfully!', 'success');
        });
      }

      if (actionType === 'preferences') {
        document.getElementById('save-preferences').addEventListener('click', () => {
          const currency = document.getElementById('currency').value;
          const notifications = document.getElementById('notifications').checked;
          showCustomAlert(`Preferences Saved! Currency: ${currency} | Alerts: ${notifications ? 'Enabled' : 'Disabled'}`, 'success');
        });
      }

      if (actionType === 'export') {
        document.querySelectorAll('.btn-export').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const format = e.target.getAttribute('data-format');
            showCustomAlert(`Preparing logs for download in ${format.toUpperCase()} format...`, 'success');
          });
        });
      }

      if (actionType === 'help') {
        document.getElementById('support-form').addEventListener('submit', (e) => {
          e.preventDefault();
          showCustomAlert('Your support request has been received.', 'success');
          document.getElementById('message').value = '';
        });
      }
    };

    // Central Tab Router Delegation Execution Loop
    if (settingsList && actionCard) {
      settingsList.addEventListener('click', (e) => {
        const targetItem = e.target.closest('li[data-action]');
        if (!targetItem) return;

        document.querySelectorAll('.settings-list li').forEach(li => li.classList.remove('selected'));
        targetItem.classList.add('selected');

        const action = targetItem.getAttribute('data-action');
        if (templates[action]) {
          actionCard.innerHTML = templates[action]();
          actionCard.classList.remove('hidden');
          attachFormListeners(action);
          actionCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
  }

  // --- Central Logout Operations ---
  const logoutBtn = document.querySelector('.btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const confirmed = await showConfirmModal("Confirm Logout", "Are you sure you want to log out of Go Tracker?", "Log out", true);
      if (confirmed) {
        localStorage.removeItem("currentUser");
        window.location.href = paths.auth;
      }
    });
  }
});

// --- Service Worker Bootstrap ---
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then((registration) => {
      console.log("Service Worker registered successfully with scope: ", registration.scope);
    })
    .catch((error) => {
      console.log("Service Worker registration failed: ", error);
    });
}