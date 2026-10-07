/*
=========================================
DrugAssist

Fájl:
auth.js

Feladata:
Bejelentkezés, munkamenet kezelése és Supabase hitelesítés.

Verzió:
6.1.0
=========================================
*/

const Auth = {

    async login(username, password) {

        if (!username || !password) {
            return { success: false, message: "Kérjük, adja meg a felhasználónevet és a jelszót!" };
        }

        const isSupabaseReady = typeof supabase !== "undefined" && 
                                supabase && 
                                typeof supabase.from === "function" &&
                                typeof CONFIG !== "undefined" &&
                                CONFIG.supabase?.url &&
                                !CONFIG.supabase.url.includes("YOUR_SUPABASE");

        if (isSupabaseReady) {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('username', username.trim())
                    .single();

                if (error || !data) {
                    return { success: false, message: "Hibás felhasználónév vagy jelszó!" };
                }

                if (data.password !== password) {
                    return { success: false, message: "Hibás felhasználónév vagy jelszó!" };
                }

                // Munkamenet elmentése
                const userSession = {
                    id: data.username,
                    username: data.username,
                    name: data.name,
                    role: data.role || 'user',
                    loginTime: new Date().toISOString()
                };

                sessionStorage.setItem("drugassist_user", JSON.stringify(userSession));

                // Eseménynaplózás Supabase-ben
                await this.logAction(data.username, data.name, "LOGIN", "Sikeres bejelentkezés");

                return { success: true, user: userSession };

            } catch (err) {
                console.error("Hitelesítési hiba:", err);
                return { success: false, message: "Adatbázis-csatlakozási hiba történt." };
            }
        } else {
            // Fallback teszt környezethez (ha nincs Supabase kapcsolat)
            if (username.toUpperCase() === "G03" && password === "1234") {
                const userSession = {
                    id: "G03",
                    username: "G03",
                    name: "Dr. Tarszabó Gergely",
                    role: "admin",
                    loginTime: new Date().toISOString()
                };
                sessionStorage.setItem("drugassist_user", JSON.stringify(userSession));
                return { success: true, user: userSession };
            }
            return { success: false, message: "Hibás felhasználónév vagy jelszó!" };
        }
    },

    getCurrentUser() {
        const user = sessionStorage.getItem("drugassist_user");
        return user ? JSON.parse(user) : null;
    },

    requireAuth() {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = "index.html";
        }
        return user;
    },

    logout() {
        const user = this.getCurrentUser();
        if (user) {
            this.logAction(user.username, user.name, "LOGOUT", "Kijelentkezés");
        }
        sessionStorage.removeItem("drugassist_user");
        window.location.href = "index.html";
    },

    async logAction(username, userName, action, details = "") {
        if (typeof supabase !== "undefined" && supabase && typeof supabase.from === "function") {
            try {
                await supabase.from('audit_logs').insert([{
                    username: username,
                    user_name: userName,
                    action: action,
                    details: details
                }]);
            } catch (err) {
                console.warn("Audit log hiba:", err);
            }
        }
    }
};
