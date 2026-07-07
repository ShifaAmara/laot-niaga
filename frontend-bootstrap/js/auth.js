/* ==========================================
   LAOT NIAGA
   AUTH.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initLogin();

    initRegister();

    initLogout();

    protectDashboard();

});

/* ==========================================
    LOGIN
========================================== */

function initLogin() {

    const form = document.querySelector("[data-login-form]");

    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const formData = new FormData(form);

        const email = formData.get("email");

        const password = formData.get("password");

        try {

            const data = await login(email, password);

            saveSession(data);

            alert("Login Berhasil");

            if (data.user.role === "umkm") {

                location.href = "dashboard-umkm.html";

            } else {

                location.href = "marketplace.html";

            }

        } catch (err) {

            alert(err.message);

        }

    });

}

/* ==========================================
    REGISTER
========================================== */

function initRegister() {

    const form = document.querySelector("[data-register-form]");

    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const payload = Object.fromEntries(

            new FormData(form)

        );

        try {

            const data = await register(payload);

            saveSession(data);

            alert("Registrasi Berhasil");

            if (payload.role === "umkm") {

                location.href = "dashboard-umkm.html";

            } else {

                location.href = "marketplace.html";

            }

        } catch (err) {

            alert(err.message);

        }

    });

}

/* ==========================================
    LOGOUT
========================================== */

function initLogout() {

    document

        .querySelectorAll("[data-logout]")

        .forEach(btn => {

            btn.addEventListener("click", () => {

                logout();

            });

        });

}

/* ==========================================
    CEK LOGIN DASHBOARD
========================================== */

function protectDashboard() {

    if (!document.body.dataset.dashboard) return;

    const user = getUser();

    if (!user) {

        location.href = "login.html";

        return;

    }

    if (user.role !== "umkm") {

        alert("Akses ditolak");

        location.href = "marketplace.html";

    }

}

/* ==========================================
    USER INFO
========================================== */

function showUser() {

    const user = getUser();

    if (!user) return;

    document

        .querySelectorAll("[data-user-name]")

        .forEach(el => {

            el.textContent = user.store_name || user.name;

        });

}

showUser();