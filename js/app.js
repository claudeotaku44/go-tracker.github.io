// @ts-nocheck
document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // Custom Styled Alert Function (Toast)
  // ==========================================
  let toastContainer = null;

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
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="display: inline-flex; width: 24px; height: 24px; border-radius: 50%; align-items: center; justify-content: center; background: rgba(255,255,255,0.12); font-size: 0.95rem;">
          ${success ? "✓" : "!"}
        </span>
        <span style="flex: 1;">${message}</span>
      </div>
    `;

    Object.assign(alertBox.style, {
      width: "100%",
      padding: "16px 18px",
      borderRadius: "16px",
      color: "#fff",
      backgroundColor: success
        ? "rgba(16, 185, 129, 0.9)"
        : "rgba(239, 68, 68, 0.93)",
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
      setTimeout(() => {
        if (alertBox.parentElement) {
          alertBox.remove();
        }
      }, 300);
    }, 3200);
  }

  let loadingOverlay = null;

  function createLoader() {
    if (loadingOverlay) return loadingOverlay;

    loadingOverlay = document.createElement("div");
    Object.assign(loadingOverlay.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.55)",
      zIndex: "10000",
      color: "#fff",
      fontSize: "1rem",
      fontFamily: "Inter, sans-serif",
      backdropFilter: "blur(4px)",
      transition: "opacity 0.2s ease",
    });

    loadingOverlay.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 18px 24px; background: rgba(15, 23, 42, 0.9); border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
        <span class="loader-spinner" style="width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.25); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite;"></span>
        <span>Loading...</span>
      </div>
    `;

    const styleEl = document.createElement("style");
    styleEl.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
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
    if (loadingOverlay) {
      loadingOverlay.style.opacity = "0";
      setTimeout(() => {
        if (loadingOverlay) {
          loadingOverlay.style.display = "none";
        }
      }, 200);
    }
  }

  let confirmOverlay = null;

  function createConfirmModal() {
    if (confirmOverlay) return confirmOverlay;

    confirmOverlay = document.createElement("div");
    Object.assign(confirmOverlay.style, {
      position: "fixed",
      inset: "0",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: "10001",
      opacity: "0",
      transition: "opacity 0.2s ease",
      padding: "20px",
    });

    confirmOverlay.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.96); border-radius: 18px; width: min(420px, 100%); padding: 28px; box-shadow: 0 18px 45px rgba(0,0,0,0.3); color: #f8fafc; text-align: center;">
        <div style="font-size: 1.15rem; font-weight: 700; margin-bottom: 12px;">Confirm delete</div>
        <div style="color: #cbd5e1; margin-bottom: 24px;">Are you sure you want to delete this transaction? This action cannot be undone.</div>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="confirm-btn-cancel" style="background: transparent; border: 1px solid rgba(255,255,255,0.18); color: #f8fafc; padding: 12px 18px; border-radius: 12px; cursor: pointer; min-width: 110px;">Cancel</button>
          <button type="button" class="confirm-btn-confirm" style="background: #ef4444; border: none; color: #fff; padding: 12px 18px; border-radius: 12px; cursor: pointer; min-width: 110px;">Delete</button>
        </div>
      </div>
    `;

    document.body.appendChild(confirmOverlay);
    return confirmOverlay;
  }

  function showConfirmModal() {
    const overlay = createConfirmModal();
    overlay.style.display = "flex";
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });

    return new Promise((resolve) => {
      const cancelButton = overlay.querySelector(".confirm-btn-cancel");
      const confirmButton = overlay.querySelector(".confirm-btn-confirm");

      function cleanup() {
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.style.display = "none";
        }, 200);
        cancelButton.removeEventListener("click", onCancel);
        confirmButton.removeEventListener("click", onConfirm);
      }

      function onCancel() {
        cleanup();
        resolve(false);
      }

      function onConfirm() {
        cleanup();
        resolve(true);
      }

      cancelButton.addEventListener("click", onCancel);
      confirmButton.addEventListener("click", onConfirm);
    });
  }

  // ==========================================
  // 0. Global Auth Guard & Path Resolution
  // ==========================================
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
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

  // ==========================================
  // 1. Dynamic Active Navbar Links
  // ==========================================
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    const href = link.getAttribute("href") || "";

    if (
      (isIndexPage &&
        (href.includes("index.html") ||
          href.includes("#home") ||
          href === "./index.html")) ||
      (isHistoryPage && href.includes("history.html")) ||
      (isAddPage && href.includes("add.html")) ||
      (isSettingPage && href.includes("setting.html"))
    ) {
      link.classList.add("active");
    }

    if (
      href &&
      !href.startsWith("#") &&
      link.hostname === window.location.hostname
    ) {
      link.addEventListener("click", () => showLoader());
    }
  });

  // ==========================================
  // 1a. Index Page Transaction Summary
  // ==========================================
  if (isIndexPage) {
    const totalBalanceNode = document.querySelector(".total .amount");
    const incomeAmountNode = document.querySelector(".income .amount");
    const expenseAmountNode = document.querySelector(".lost .amount");
    const homeAvatar = document.getElementById("home-avatar");
    const homeGreetingName = document.getElementById("home-greeting-name");

    const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    const userTransactions = transactions.filter(
      (transaction) => transaction.userEmail === currentUser?.email,
    );

    const incomeTotal = userTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const expenseTotal = userTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

    const balanceTotal = incomeTotal - expenseTotal;

    if (totalBalanceNode) {
      totalBalanceNode.textContent = `$${balanceTotal.toFixed(2)}`;
    }
    if (incomeAmountNode) {
      incomeAmountNode.textContent = `$${incomeTotal.toFixed(2)}`;
    }
    if (expenseAmountNode) {
      expenseAmountNode.textContent = `$${expenseTotal.toFixed(2)}`;
    }
    if (homeGreetingName) {
      homeGreetingName.textContent = currentUser.name || "User";
    }
    if (homeAvatar) {
      homeAvatar.innerHTML = "";
      if (currentUser.avatar) {
        const img = document.createElement("img");
        img.src = currentUser.avatar;
        img.alt = currentUser.name
          ? `${currentUser.name} avatar`
          : "User avatar";
        homeAvatar.appendChild(img);
      } else {
        homeAvatar.textContent = currentUser.name
          ? currentUser.name.charAt(0).toUpperCase()
          : "U";
      }
    }
  }

  // ==========================================
  // 2. Auth Page Logic (Login / Sign Up Toggle)
  // ==========================================
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const formLogin = document.getElementById("form-login");
  const formSignup = document.getElementById("form-signup");

  if (tabLogin && tabSignup && formLogin && formSignup) {
    tabLogin.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
      formLogin.classList.remove("hidden");
      formSignup.classList.add("hidden");
    });

    tabSignup.addEventListener("click", () => {
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
      formSignup.classList.remove("hidden");
      formLogin.classList.add("hidden");
    });

    const forgotPasswordLink = document.querySelector(".forgot-password-link");
    const backToLoginLink = document.querySelector(".back-to-login");
    const formForgot = document.getElementById("form-forgot");

    function showLoginView() {
      formLogin.classList.remove("hidden");
      formSignup.classList.add("hidden");
      formForgot.classList.add("hidden");
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
    }

    function showSignupView() {
      formSignup.classList.remove("hidden");
      formLogin.classList.add("hidden");
      formForgot.classList.add("hidden");
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
    }

    function showForgotView() {
      formForgot.classList.remove("hidden");
      formLogin.classList.add("hidden");
      formSignup.classList.add("hidden");
      tabLogin.classList.remove("active");
      tabSignup.classList.remove("active");
    }

    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", (e) => {
        e.preventDefault();
        showForgotView();
      });
    }

    if (backToLoginLink) {
      backToLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        showLoginView();
      });
    }

    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = formLogin.querySelectorAll("input");
      const email = inputs[0].value.trim();
      const password = inputs[1].value.trim();

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(
        (u) => u.email === email && u.password === password,
      );

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = paths.index;
      } else {
        showCustomAlert(
          "Invalid email or password. Please try again.",
          "error",
        );
      }
    });

    formForgot.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = formForgot.querySelectorAll("input");
      const email = inputs[0].value.trim();
      const password = inputs[1].value.trim();
      const confirmPassword = inputs[2].value.trim();

      if (!email || !password || !confirmPassword) {
        showCustomAlert("Please complete all fields.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showCustomAlert("Passwords do not match.", "error");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex((u) => u.email === email);

      if (userIndex === -1) {
        showCustomAlert("No account found for that email address.", "error");
        return;
      }

      users[userIndex].password = password;
      localStorage.setItem("users", JSON.stringify(users));
      showCustomAlert(
        "Password updated successfully. Please log in.",
        "success",
      );
      setTimeout(() => {
        showLoginView();
      }, 500);
    });

    formSignup.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputs = formSignup.querySelectorAll("input");
      const name = inputs[0].value.trim();
      const email = inputs[1].value.trim();
      const password = inputs[2].value.trim();

      if (!name || !email || !password) {
        showCustomAlert("Please fill out all fields.", "error");
        return;
      }

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const userExists = users.some((u) => u.email === email);

      if (userExists) {
        showCustomAlert("User already exists! Please log in.", "error");
      } else {
        const newUser = { name, email, password };
        users.push(newUser);

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        window.location.href = paths.index;
      }
    });
  }

  // ==========================================
  // 3. Add Transaction Logic (add.html)
  // ==========================================
  const addForm = document.querySelector("form.card");
  const saveBtn = document.querySelector(".btn-submit");

  if (isAddPage && addForm && saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();

      const titleInput = addForm.querySelector("input[type='text']");
      const amountInput = addForm.querySelector("input[type='number']");
      const typeSelect = addForm.querySelector("select");

      const title = titleInput?.value.trim() || "";
      const amount = amountInput?.value.trim() || "";
      const type = typeSelect?.value || "expense";

      if (!title || !amount) {
        showCustomAlert("Please fill out all fields.", "error");
        return;
      }

      const transactions =
        JSON.parse(localStorage.getItem("transactions")) || [];

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
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      transactions.push(newTransaction);
      localStorage.setItem("transactions", JSON.stringify(transactions));

      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
      saveBtn.style.opacity = "0.7";
      showLoader();

      setTimeout(() => {
        showCustomAlert(
          `Successfully added: ${title} for $${parseFloat(amount).toFixed(2)}`,
          "success",
        );
        addForm.reset();
        window.location.href = `${paths.history}#txn-${newTransaction.id}`;
      }, 800);
    });
  }

  // ==========================================
  // 4. History Page Transaction Rendering
  // ==========================================
  if (isHistoryPage) {
    const historyList = document.querySelector(".history-list");
    const incomeValue = document.querySelector(".summary-value.income");
    const expenseValue = document.querySelector(".summary-value.expense");
    const balanceValue = document.querySelector(".summary-value.balance");

    function renderHistory() {
      const transactions =
        JSON.parse(localStorage.getItem("transactions")) || [];
      const userTransactions = transactions.filter(
        (transaction) => transaction.userEmail === currentUser.email,
      );

      const incomeTotal = userTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

      const expenseTotal = userTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

      const balanceTotal = incomeTotal - expenseTotal;

      if (incomeValue) {
        incomeValue.textContent = `$${incomeTotal.toFixed(2)}`;
      }

      if (expenseValue) {
        expenseValue.textContent = `$${expenseTotal.toFixed(2)}`;
      }

      if (balanceValue) {
        balanceValue.textContent = `$${balanceTotal.toFixed(2)}`;
        balanceValue.style.color = balanceTotal >= 0 ? "#10b981" : "#ef4444";
      }

      if (!historyList) return;

      if (userTransactions.length === 0) {
        historyList.innerHTML = `
          <div class="empty-state" style="padding: 40px; text-align: center; color: #cbd5e1;">
            <h3>No transactions yet</h3>
            <p>Add a transaction to see it listed here.</p>
          </div>
        `;
      } else {
        historyList.innerHTML = userTransactions
          .map((transaction) => {
            const amount = Number(transaction.amount).toFixed(2);
            const isIncome = transaction.type === "income";
            return `
              <div id="txn-${transaction.id}" class="t-item">
                <div class="t-info">
                  <span class="t-title">${transaction.title}</span>
                  <span class="t-date">${transaction.date} • ${isIncome ? "Income" : "Expense"}</span>
                </div>
                <div class="t-right">
                  <span class="t-amount ${isIncome ? "income" : "expense"}">
                    ${isIncome ? "+" : "-"}$${amount}
                  </span>
                  <button type="button" class="delete-btn" data-id="${transaction.id}" aria-label="Delete transaction">×</button>
                </div>
              </div>
            `;
          })
          .join("");

        const targetId = window.location.hash.slice(1);
        if (targetId) {
          const targetItem = historyList.querySelector(
            `#${CSS.escape(targetId)}`,
          );
          if (targetItem) {
            targetItem.scrollIntoView({ behavior: "smooth", block: "center" });
            targetItem.classList.add("highlighted");
            setTimeout(() => targetItem.classList.remove("highlighted"), 2600);
          }
        }
      }

      historyList.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = Number(button.dataset.id);
          const confirmed = await showConfirmModal();

          if (!confirmed) {
            return;
          }

          const transactionItem = button.closest(".t-item");
          if (transactionItem) {
            transactionItem.classList.add("removing");
          }

          setTimeout(() => {
            const currentTransactions =
              JSON.parse(localStorage.getItem("transactions")) || [];
            const updated = currentTransactions.filter(
              (transaction) => transaction.id !== id,
            );
            localStorage.setItem("transactions", JSON.stringify(updated));
            showCustomAlert("Transaction deleted.", "success");
            renderHistory();
          }, 200);
        });
      });
    }

    renderHistory();
  }

  // ==========================================
  // 5. Profile Page Data Binding
  // ==========================================
  if (isSettingPage && currentUser) {
    const profileName = document.querySelector(".profile-name");
    const profileEmail = document.querySelector(".profile-email");
    const avatar = document.querySelector(".avatar");
    const settingsItems = document.querySelectorAll(
      ".settings-list li[data-action]",
    );
    const settingsPanel = document.getElementById("settings-action-card");

    function refreshProfileDisplay() {
      if (profileName) profileName.textContent = currentUser.name || "User";
      if (profileEmail)
        profileEmail.textContent = currentUser.email || "No email provided";
      if (avatar) {
        avatar.innerHTML = "";
        if (currentUser.avatar) {
          const img = document.createElement("img");
          img.src = currentUser.avatar;
          img.alt = currentUser.name
            ? `${currentUser.name} avatar`
            : "User avatar";
          avatar.appendChild(img);
        } else {
          avatar.textContent = currentUser.name
            ? currentUser.name.charAt(0).toUpperCase()
            : "U";
        }
      }
    }

    function hideSettingsPanel() {
      if (settingsPanel) {
        settingsPanel.classList.add("hidden");
        settingsPanel.innerHTML = "";
      }
    }

    async function showSettingsPanel(action) {
      if (!settingsPanel) return;

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex(
        (user) => user.email === currentUser.email,
      );

      let content = "";

      if (action === "account") {
        content = `
          <div class="settings-panel-header">
            <h3>Account Settings</h3>
            <button type="button" class="settings-panel-close">×</button>
          </div>
          <form id="account-form">
            <div class="form-group">
              <label>Premium Avatar</label>
              <div class="avatar-upload-wrapper" id="avatar-upload-wrapper">
                <div class="avatar-preview" id="avatar-preview">
                  ${currentUser.avatar ? `<img src="${currentUser.avatar}" alt="${currentUser.name || "User"} avatar">` : `<div class="avatar-preview__placeholder">Your avatar</div>`}
                </div>
                <div class="avatar-upload-box" id="avatar-upload-box">
                  <div class="upload-icon">📸</div>
                  <p class="upload-title">Upload Avatar</p>
                  <p class="upload-hint">PNG, JPG, or GIF • Max 5MB</p>
                  <input type="file" class="form-control avatar-file-input" name="avatar" id="avatar-input" accept=".png,.jpg,.jpeg,.gif">
                </div>
              </div>
              <div class="file-error" id="file-error" style="display: none;"></div>
              ${currentUser.avatar ? `<button type="button" class="btn-change-avatar" id="change-avatar-btn" style="margin-top: 10px;">Change Avatar</button>` : ""}
            </div>
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-control" name="name" value="${currentUser.name || ""}" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" name="password" placeholder="Leave blank to keep current">
            </div>
            <button type="submit" class="btn-action">Save Changes</button>
          </form>
        `;
      } else if (action === "preferences") {
        const compactEnabled =
          localStorage.getItem("historyCompact") === "true";
        content = `
          <div class="settings-panel-header">
            <h3>Preferences</h3>
            <button type="button" class="settings-panel-close">×</button>
          </div>
          <div class="settings-toggle-row">
            <span>Compact history view</span>
            <label style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="compact-toggle" ${compactEnabled ? "checked" : ""}>
              <span>${compactEnabled ? "On" : "Off"}</span>
            </label>
          </div>
          <p style="color: var(--text-muted); margin-top: 12px;">Compact view reduces padding in history rows.</p>
        `;
      } else if (action === "export") {
        content = `
          <div class="settings-panel-header">
            <h3>Export Data</h3>
            <button type="button" class="settings-panel-close">×</button>
          </div>
          <p style="color: var(--text-muted); margin-bottom: 20px;">Download your transactions as a JSON file.</p>
          <button type="button" class="btn-action" id="export-data-btn">Export Transactions</button>
        `;
      } else if (action === "help") {
        content = `
          <div class="settings-panel-header">
            <h3>Help & Support</h3>
            <button type="button" class="settings-panel-close">×</button>
          </div>
          <p style="color: var(--text-muted); margin-bottom: 16px;">Need help? Contact our support team at <strong>support@gotracker.app</strong>.</p>
          <p style="color: var(--text-muted);">We can help with account recovery, transaction import/export, or app settings.</p>
        `;
      }

      settingsPanel.innerHTML = content;
      settingsPanel.classList.remove("hidden");

      const closeButton = settingsPanel.querySelector(".settings-panel-close");
      closeButton?.addEventListener("click", hideSettingsPanel);

      if (action === "account") {
        const form = settingsPanel.querySelector("#account-form");
        const preview = settingsPanel.querySelector("#avatar-preview");
        const fileInput = settingsPanel.querySelector("#avatar-input");

        // File type validation
        const allowedTypes = ["image/png", "image/jpeg", "image/gif"];
        const maxFileSize = 5 * 1024 * 1024; // 5MB
        const errorBox = settingsPanel.querySelector("#file-error");
        const uploadBox = settingsPanel.querySelector("#avatar-upload-box");
        const uploadWrapper = settingsPanel.querySelector(
          "#avatar-upload-wrapper",
        );

        fileInput?.addEventListener("change", () => {
          const file = fileInput.files?.[0];
          if (file) {
            // Validate file type
            if (!allowedTypes.includes(file.type)) {
              errorBox.textContent =
                "❌ Invalid format. Please use PNG, JPG, or GIF.";
              errorBox.style.display = "block";
              fileInput.value = "";
              return;
            }

            // Validate file size
            if (file.size > maxFileSize) {
              errorBox.textContent =
                "❌ File is too large. Maximum size is 5MB.";
              errorBox.style.display = "block";
              fileInput.value = "";
              return;
            }

            // Hide error if file is valid
            errorBox.style.display = "none";

            const reader = new FileReader();
            reader.onload = () => {
              if (preview) {
                preview.innerHTML = `<img src="${reader.result}" alt="Avatar preview">`;
              }
              uploadBox.style.display = "none";
              uploadWrapper.classList.add("has-preview");
            };
            reader.readAsDataURL(file);
          }
        });

        // Drag and drop support
        uploadBox?.addEventListener("dragover", (e) => {
          e.preventDefault();
          uploadBox.style.backgroundColor = "rgba(59, 130, 246, 0.15)";
          uploadBox.style.borderColor = "rgba(59, 130, 246, 0.5)";
        });

        uploadBox?.addEventListener("dragleave", () => {
          uploadBox.style.backgroundColor = "";
          uploadBox.style.borderColor = "";
        });

        uploadBox?.addEventListener("drop", (e) => {
          e.preventDefault();
          uploadBox.style.backgroundColor = "";
          uploadBox.style.borderColor = "";
          const droppedFiles = e.dataTransfer?.files;
          if (droppedFiles && droppedFiles.length > 0) {
            fileInput.files = droppedFiles;
            fileInput.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });

        // Change avatar button
        const changeAvatarBtn =
          settingsPanel.querySelector("#change-avatar-btn");
        changeAvatarBtn?.addEventListener("click", (e) => {
          e.preventDefault();
          uploadBox.style.display = "flex";
          uploadWrapper.classList.remove("has-preview");
          fileInput.value = "";
          preview.innerHTML = `<div class="avatar-preview__placeholder">Your avatar</div>`;
        });

        form?.addEventListener("submit", async (event) => {
          event.preventDefault();
          const formData = new FormData(form);
          const name = formData.get("name")?.toString().trim() || "";
          const password = formData.get("password")?.toString().trim();
          const avatarFile = formData.get("avatar");

          if (!name) {
            showCustomAlert("Name cannot be empty.", "error");
            return;
          }

          if (avatarFile && avatarFile instanceof File && avatarFile.size > 0) {
            currentUser.avatar = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(avatarFile);
            });
          }

          currentUser.name = name;
          if (password) {
            currentUser.password = password;
          }

          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...currentUser };
            localStorage.setItem("users", JSON.stringify(users));
          }
          localStorage.setItem("currentUser", JSON.stringify(currentUser));
          refreshProfileDisplay();
          showCustomAlert("Profile updated successfully.", "success");
          hideSettingsPanel();
        });
      }

      if (action === "preferences") {
        const toggle = settingsPanel.querySelector("#compact-toggle");
        toggle?.addEventListener("change", () => {
          const enabled = toggle.checked;
          localStorage.setItem("historyCompact", enabled ? "true" : "false");
          showCustomAlert(
            `Compact history view ${enabled ? "enabled" : "disabled"}.`,
            "success",
          );
        });
      }

      if (action === "export") {
        const exportButton = settingsPanel.querySelector("#export-data-btn");
        exportButton?.addEventListener("click", () => {
          const transactions =
            JSON.parse(localStorage.getItem("transactions")) || [];
          const userTransactions = transactions.filter(
            (transaction) => transaction.userEmail === currentUser.email,
          );
          const blob = new Blob([JSON.stringify(userTransactions, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `transactions_${currentUser.email.replace(/[@.]/g, "_")}.json`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          showCustomAlert("Transactions exported successfully.", "success");
        });
      }
    }

    settingsItems.forEach((item) => {
      item.addEventListener("click", () => {
        showSettingsPanel(item.dataset.action);
      });
    });

    refreshProfileDisplay();
  }

  // ==========================================
  // 6. Logout Logic
  // ==========================================
  const logoutBtn = document.querySelector(".btn-logout");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.href = paths.auth;
    });
  }
});

async function register() {
  if ("serviceWorker" in navigator) {
    try {
      // Use an absolute path starting with a forward slash '/'
      const registration = await navigator.serviceWorker.register("/js/sw.js");
      console.log("Service Worker registered successfully:", registration);
    } catch (error) {
      console.log("Service Worker registration failed:", error);
    }
  }
}

window.addEventListener("load", register);