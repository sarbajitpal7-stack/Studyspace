
/* =========================================
   STUDYSPACE - AUTHENTICATION & CLOUD BACKUP
========================================= */

const SUPABASE_URL = "https://zwkdelxgbhrlhrukquns.supabase.co";

const SUPABASE_KEY = "sb_publishable_4TIFdmLgWxN9T2YUSP-kwA_RcbQJK_I";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const GUEST_BACKUP_KEY = "studyspace_auth_guest_backup_v1";

let currentUser = null;
let appReady = false;
let syncing = false;

let autoSyncTimer = null;
let cloudSyncInProgress = false;
let syncAgain = false;

/* =========================================
   LOCAL DATA MANAGEMENT
========================================= */

function getStudySpaceData() {
    const data = {};

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (
            key &&
            key.startsWith("studyspace_") &&
            key !== GUEST_BACKUP_KEY
        ) {
            data[key] = localStorage.getItem(key);
        }
    }

    return data;
}

function saveGuestBackup() {
    const guestData = getStudySpaceData();

    localStorage.setItem(
        GUEST_BACKUP_KEY,
        JSON.stringify(guestData)
    );
}

function restoreData(data) {
    syncing = true;

    Object.keys(localStorage)
        .filter(key =>
            key.startsWith("studyspace_") &&
            key !== GUEST_BACKUP_KEY
        )
        .forEach(key => localStorage.removeItem(key));

    Object.entries(data || {}).forEach(([key, value]) => {
        if (key.startsWith("studyspace_") &&
            key !== GUEST_BACKUP_KEY) {
            localStorage.setItem(key, value);
        }
    });

    syncing = false;
}

function restoreGuestBackup() {
    const backup = localStorage.getItem(GUEST_BACKUP_KEY);

    if (!backup) return false;

    try {
        restoreData(JSON.parse(backup));
        localStorage.removeItem(GUEST_BACKUP_KEY);
        return true;
    } catch (error) {
        console.error("Guest backup could not be restored:", error);
        return false;
    }
}

/* =========================================
   CLOUD BACKUP
========================================= */


async function syncToCloud() {
    if (!currentUser || !appReady) return;

    if (cloudSyncInProgress) {
        syncAgain = true;
        return;
    }

    cloudSyncInProgress = true;

    try {
        do {
            syncAgain = false;

            const snapshot = getStudySpaceData();

            const { error } = await supabaseClient
                .from("studyspace_data")
                .upsert({
                    user_id: currentUser.id,
                    data: snapshot,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                throw error;
            }

        } while (syncAgain);

        showAuthMessage("Your StudySpace data is backed up!");

    } catch (error) {
        console.error("Cloud sync failed:", error.message);
        showAuthMessage("Cloud sync failed: " + error.message);

    } finally {
        cloudSyncInProgress = false;
    }
}
async function loadCloudData(user) {
    const { data, error } = await supabaseClient
        .from("studyspace_data")
        .select("data")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        showAuthMessage("Could not load cloud data: " + error.message);
        throw error;
    }

    if (data && data.data) {
        restoreData(data.data);
        showAuthMessage("Your cloud data has been restored.");
        return;
    }

    const snapshot = getStudySpaceData();

    const { error: saveError } = await supabaseClient
        .from("studyspace_data")
        .upsert({
            user_id: user.id,
            data: snapshot,
            updated_at: new Date().toISOString()
        });

    if (saveError) {
        showAuthMessage("Could not create account backup: " + saveError.message);
        throw saveError;
    }

    showAuthMessage("Your account backup has been created.");
}
/* =========================================
   AUTHENTICATION UI
========================================= */

function createAuthUI() {
    const panel = document.createElement("div");

    panel.id = "studyspaceAuthPanel";

    panel.innerHTML = `
        <style>
            #studyspaceAuthPanel {
                position: fixed;
                right: 18px;
                bottom: 18px;
                z-index: 9999;
                width: 290px;
                max-width: calc(100vw - 36px);
                padding: 16px;
                border-radius: 14px;
                background: #17172b;
                color: white;
                border: 1px solid #454568;
                box-shadow: 0 8px 30px rgba(0,0,0,.3);
                font-family: Segoe UI, sans-serif;
            }

            #studyspaceAuthPanel h3 {
                margin: 0 0 10px;
                font-size: 17px;
            }

            #studyspaceAuthPanel p {
                font-size: 13px;
                margin: 8px 0;
                color: #c7c7dc;
                overflow-wrap: anywhere;
            }

            #studyspaceAuthPanel input {
                width: 100%;
                box-sizing: border-box;
                padding: 10px;
                margin: 6px 0;
                border-radius: 7px;
                border: 1px solid #555577;
                background: #25253d;
                color: white;
            }

            #studyspaceAuthPanel button {
                padding: 9px 12px;
                margin: 5px 3px 5px 0;
                border: none;
                border-radius: 7px;
                cursor: pointer;
                background: #8b5cf6;
                color: white;
                font-weight: 600;
            }

            #studyspaceAuthPanel button.secondary {
                background: #353552;
            }

            #studyspaceAuthPanel button:disabled {
                opacity: .6;
                cursor: not-allowed;
            }

            #studyspaceAuthMessage {
                font-size: 12px;
                color: #a5f3c4;
                overflow-wrap: anywhere;
            }

            #studyspaceAuthForm {
                display: none;
                margin-top: 10px;
            }
        </style>

        <h3>☁️ StudySpace Account</h3>

        <div id="studyspaceAuthStatus">
            <p>Loading account status...</p>
        </div>

        <div id="studyspaceAuthButtons">
            <button id="studyspaceLoginButton">Login</button>
            <button id="studyspaceSignupButton" class="secondary">
                Sign Up
            </button>
        </div>

        <div id="studyspaceAuthForm">
            <input
                type="email"
                id="studyspaceEmail"
                placeholder="Email address"
                autocomplete="email"
            >

            <input
                type="password"
                id="studyspacePassword"
                placeholder="Password"
                autocomplete="current-password"
            >

            <button id="studyspaceSubmitAuth">Continue</button>
            <button id="studyspaceResendEmail" class="secondary">
    Resend Confirmation Email
</button>
            <button id="studyspaceCancelAuth" class="secondary">
                Cancel
            </button>
        </div>

        <div id="studyspaceAccountActions" style="display:none">
            <button id="studyspaceSyncButton">Sync Now</button>
            <button id="studyspaceLogoutButton" class="secondary">
                Logout
            </button>
        </div>

        <p id="studyspaceAuthMessage" aria-live="polite">
            Guest mode is available.
        </p>
    `;

    document.body.appendChild(panel);

    document.getElementById("studyspaceLoginButton")
        .addEventListener("click", () => openAuthForm("login"));

    document.getElementById("studyspaceSignupButton")
        .addEventListener("click", () => openAuthForm("signup"));

    document.getElementById("studyspaceCancelAuth")
        .addEventListener("click", closeAuthForm);

    document.getElementById("studyspaceSubmitAuth")
        .addEventListener("click", submitAuth);
document.getElementById("studyspaceResendEmail")
    .addEventListener("click", resendConfirmationEmail);
    document.getElementById("studyspaceSyncButton")
        .addEventListener("click", syncToCloud);

    document.getElementById("studyspaceLogoutButton")
        .addEventListener("click", logoutUser);
}

let authMode = "login";

function openAuthForm(mode) {
    authMode = mode;

    document.getElementById("studyspaceAuthForm").style.display = "block";
    document.getElementById("studyspaceAuthButtons").style.display = "none";

    document.getElementById("studyspaceSubmitAuth").textContent =
        mode === "login" ? "Login" : "Create Account";
}

function closeAuthForm() {
    document.getElementById("studyspaceAuthForm").style.display = "none";
    document.getElementById("studyspaceAuthButtons").style.display = "block";
}

/* =========================================
   LOGIN AND SIGNUP
========================================= */

async function submitAuth() {
    const email = document.getElementById("studyspaceEmail").value.trim();
    const password = document.getElementById("studyspacePassword").value;

    if (!email || !password) {
        showAuthMessage("Please enter your email and password.");
        return;
    }

    if (password.length < 6) {
        showAuthMessage("Password must contain at least 6 characters.");
        return;
    }

    const button = document.getElementById("studyspaceSubmitAuth");
    button.disabled = true;

    try {
        let result;

        if (authMode === "signup") {
            result = await supabaseClient.auth.signUp({
                email,
                password
            });
        } else {
            result = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
        }

        if (result.error) {
            showAuthMessage(result.error.message);
            return;
        }

        if (!result.data.session) {
            showAuthMessage(
                "Check your email for the confirmation link. " +
                "You can continue using guest mode meanwhile."
            );
            return;
        }
saveGuestBackup();
        currentUser = result.data.user;

        await loadCloudData(currentUser);
        updateAuthStatus();
        closeAuthForm();

        document.getElementById("studyspacePassword").value = "";

        showAuthMessage("Welcome to StudySpace!");

        window.location.reload();

    } catch (error) {
        showAuthMessage(error.message);
    } finally {
        button.disabled = false;
    }
}

/* =========================================
   LOGOUT
========================================= */

async function logoutUser() {
    if (!currentUser) return;

    const confirmed = confirm(
        "Logout from StudySpace? Your account data will remain in the cloud."
    );

    if (!confirmed) return;

    const hadGuestBackup = restoreGuestBackup();

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        showAuthMessage("Logout failed: " + error.message);
        return;
    }

    currentUser = null;

    updateAuthStatus();

    showAuthMessage(
        hadGuestBackup
            ? "Logged out. Your guest data has been restored."
            : "Logged out. Guest mode is ready."
    );

    window.location.reload();
}

/* =========================================
   STATUS AND MESSAGES
========================================= */

function showAuthMessage(message) {
    const element = document.getElementById("studyspaceAuthMessage");

    if (element) {
        element.textContent = message;
    }
}

function updateAuthStatus() {
    const status = document.getElementById("studyspaceAuthStatus");
    const buttons = document.getElementById("studyspaceAuthButtons");
    const actions = document.getElementById("studyspaceAccountActions");

    if (currentUser) {
        status.innerHTML = `
            <p>Logged in as:</p>
            <p><strong>${escapeAuthText(currentUser.email)}</strong></p>
        `;

        buttons.style.display = "none";
        actions.style.display = "block";
    } else {
        status.innerHTML = "<p>Using StudySpace as a guest.</p>";

        buttons.style.display = "block";
        actions.style.display = "none";
    }
}

function escapeAuthText(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

/* =========================================
   STARTUP
========================================= */

async function startStudySpace() {
    createAuthUI();

    try {
        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
            showAuthMessage(error.message);
        } else if (data.session) {
            currentUser = data.session.user;
            await loadCloudData(currentUser);
        }
    } catch (error) {
        showAuthMessage("Account connection unavailable. Guest mode is ready.");
    }

    updateAuthStatus();

    // Load the existing dashboard only after cloud restoration.
    const script = document.createElement("script");
    script.src = "script.js";
   script.onload = () => {
    appReady = true;
    installAutoSync();
};
    document.body.appendChild(script);
}

startStudySpace();

async function resendConfirmationEmail() {
    const email = document
        .getElementById("studyspaceEmail")
        .value.trim();

    if (!email) {
        showAuthMessage("Please enter your email address first.");
        return;
    }

    const { error } = await supabaseClient.auth.resend({
        type: "signup",
        email: email,
        options: {
            emailRedirectTo:
                "https://sarbajitpal7-stack.github.io/Studyspace/"
        }
    });

    if (error) {
        showAuthMessage(error.message);
        return;
    }

    showAuthMessage(
        "A fresh confirmation email has been requested. Check your inbox."
    );
}

function scheduleAutoSync() {
    if (!currentUser || !appReady || syncing) return;

    clearTimeout(autoSyncTimer);

    autoSyncTimer = setTimeout(() => {
        syncToCloud();
    }, 2000);
}

function installAutoSync() {
    if (window.studySpaceAutoSyncInstalled) return;

    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;

    Storage.prototype.setItem = function(key, value) {
        originalSetItem.call(this, key, value);

        if (
            this === localStorage &&
            String(key).startsWith("studyspace_") &&
            key !== GUEST_BACKUP_KEY
        ) {
            scheduleAutoSync();
        }
    };

    Storage.prototype.removeItem = function(key) {
        originalRemoveItem.call(this, key);

        if (
            this === localStorage &&
            String(key).startsWith("studyspace_") &&
            key !== GUEST_BACKUP_KEY
        ) {
            scheduleAutoSync();
        }
    };

    window.studySpaceAutoSyncInstalled = true;
}
