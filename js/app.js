// @ts-nocheck
document.addEventListener("DOMContentLoaded", () => {
  let toastContainer = null;
  let loadingOverlay = null;
  let confirmOverlay = null;

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

  function createConfirmModal() {
    if (confirmOverlay) return confirmOverlay;
    confirmOverlay = document.createElement("div");
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
        <div style="font-size:1.15rem;font-weight:700;margin-bottom:12px;">Confirm delete</div>
        <div style="color:#cbd5e1;margin-bottom:24px;">Are you sure you want to delete this transaction?</div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="confirm-btn-cancel" style="background:transparent;border:1px solid rgba(255,255,255,0.18);color:#f8fafc;padding:12px 18px;border-radius:12px;cursor:pointer;min-width:110px;">Cancel</button>
          <button type="button" class="confirm-btn-confirm" style="background:#ef4444;border:none;color:#fff;padding:12px 18px;border-radius:12px;cursor:pointer;min-width:110px;">Delete</button>
        </div>
      </div>
    `;
    document.body.appendChild(confirmOverlay);
    return confirmOverlay;
  }

  function showConfirmModal() {
    const overlay = createConfirmModal();
    const cancelButton = overlay.querySelector(".confirm-btn-cancel");
    const confirmButton = overlay.querySelector(".confirm-btn-confirm");

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

  const currentUser = safeJsonParse(localStorage.getItem("currentUser"), null);
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

    if (homeAvatar && currentUser) {
      homeAvatar.innerHTML = "";
      if (currentUser.avatar) {
        const img = document.createElement("img");
        img.src = currentUser.avatar;
        img.alt = currentUser.name ? `${currentUser.name} avatar` : "User avatar";
        homeAvatar.appendChild(img);
      } else {
        homeAvatar.textContent = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U";
      }
    }
  }

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
          const confirmed = await showConfirmModal();
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

  if (isSettingPage && currentUser) {
    const profileName = document.querySelector(".profile-name");
    const profileEmail = document.querySelector(".profile-email");
    const avatar = document.querySelector(".avatar");

    if (profileName) profileName.textContent = currentUser.name || "User";
    if (profileEmail) profileEmail.textContent = currentUser.email || "No email provided";
    if (avatar) {
      avatar.innerHTML = "";
      if (currentUser.avatar) {
        const img = document.createElement("img");
        img.src = currentUser.avatar;
        img.alt = currentUser.name ? `${currentUser.name} avatar` : "User avatar";
        avatar.appendChild(img);
      } else {
        avatar.textContent = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U";
      }
    }
  }

  document.querySelector(".btn-logout")?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = paths.auth;
  });
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js")
    .then((registration) => {
      console.log("Service Worker registered successfully with scope: ", registration.scope);
    })
    .catch((error) => {
      console.log("Service Worker registration failed: ", error);
    });
}