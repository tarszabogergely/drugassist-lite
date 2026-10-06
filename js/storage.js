/*
=========================================
DrugAssist - storage.js
Supabase Adatkezelő Modul
Verzió: 2.0.0
=========================================
*/

const Storage = {

    // =========================================================
    // 1. DASHBOARD & FEJLESZTŐI INTERFÉSZ (loadWards, mergeWard, stb.)
    // =========================================================

    // Osztályok és betegeik betöltése Supabase-ből (vagy helyi tárolóból)
    async loadWards() {
        const isSupabaseReady = typeof supabase !== "undefined" && 
                                supabase && 
                                typeof supabase.from === "function" &&
                                typeof CONFIG !== "undefined" &&
                                CONFIG.supabase?.url &&
                                !CONFIG.supabase.url.includes("YOUR_SUPABASE");

        if (isSupabaseReady) {
            try {
                const { data, error } = await supabase
                    .from('wards')
                    .select('*');

                if (error) {
                    console.error("Hiba a Supabase osztályok lekérésekor:", error);
                } else if (data) {
                    // Ha a Supabase-ből sikeresen jött válasz (akár üres, akár tele), azt használjuk!
                    Utils.log("Osztályok sikeresen betöltve Supabase-ből:", data.length, "db osztály");
                    return data;
                }
            } catch (err) {
                console.warn("Supabase osztálybetöltési hiba, váltás helyi tárolóra:", err);
            }
        }

        // Fallback LocalStorage-ra (csak ha a Supabase egyáltalán nem elérhető)
        const localData = localStorage.getItem(CONFIG.storage.WARDS);
        return localData ? JSON.parse(localData) : [];
    },

    // PDF Import után osztály összefésülése/mentése
    async mergeWard(wardData) {
        if (!wardData) return false;

        // Ellenőrizzük, hogy a Supabase kliens valóban inicializálva van-e
        const isSupabaseReady = typeof supabase !== "undefined" && 
                                supabase && 
                                typeof supabase.from === "function" &&
                                !CONFIG.supabase.url.includes("YOUR_SUPABASE");

        if (isSupabaseReady) {
            try {
                const { error } = await supabase
                    .from('wards')
                    .upsert(wardData, { onConflict: 'wardCode' });

                if (error) console.error("Hiba az osztály Supabase mentésekor:", error);
            } catch (err) {
                console.warn("Supabase mentési hiba, váltás helyi tárolóra:", err);
            }
        }

        // Helyi mentés frissítése (LocalStorage)
        const wards = await this.loadWards();
        const existingIndex = wards.findIndex(w => w.wardCode === wardData.wardCode);

        if (existingIndex >= 0) {
            wards[existingIndex] = wardData;
        } else {
            wards.push(wardData);
        }

        localStorage.setItem(CONFIG.storage.WARDS, JSON.stringify(wards));
        return true;
    },

    // Osztályok törlése (új munkanap indításakor)
    async clearWards() {
        if (typeof supabase !== "undefined" && supabase) {
            try {
                await supabase.from('wards').delete().neq('id', 0);
            } catch (e) {
                console.warn("Supabase ürítési hiba:", e);
            }
        }
        localStorage.removeItem(CONFIG.storage.WARDS);
    },

    // Munkadátum kezelése
    loadWorkDate() {
        return localStorage.getItem(CONFIG.storage.WORK_DATE) || null;
    },

    saveWorkDate(date) {
        localStorage.setItem(CONFIG.storage.WORK_DATE, date);
    },

    // Felhasználó kezelése
    async saveUser(user) {
        localStorage.setItem(CONFIG.storage.USER, JSON.stringify(user));
    },

    loadUser() {
        const user = localStorage.getItem(CONFIG.storage.USER);
        return user ? JSON.parse(user) : { id: "G03", name: "Tarszabó Gergely" };
    },

    // Kijelölt osztály és beteg azonosító mentése/betöltése
    saveCurrentWard(wardCode) {
        localStorage.setItem(CONFIG.storage.CURRENT_WARD, wardCode);
    },

    loadCurrentWard() {
        return localStorage.getItem(CONFIG.storage.CURRENT_WARD) || null;
    },

    saveCurrentPatient(patientId) {
        localStorage.setItem(CONFIG.storage.CURRENT_PATIENT, patientId);
    },

    async loadPatient() {
        const patientId = localStorage.getItem(CONFIG.storage.CURRENT_PATIENT);
        if (!patientId) return null;

        const wards = await this.loadWards();
        for (const ward of wards) {
            const found = (ward.patients || []).find(p => p.patientId === patientId);
            if (found) return found;
        }
        return null;
    },

    async savePatient(updatedPatient) {
        const wards = await this.loadWards();
        let targetWard = null;

        for (const ward of wards) {
            const idx = (ward.patients || []).findIndex(p => p.patientId === updatedPatient.patientId);
            if (idx >= 0) {
                ward.patients[idx] = updatedPatient;
                targetWard = ward;
                break;
            }
        }

        if (targetWard) {
            await this.mergeWard(targetWard);
        }
    },

    // =========================================================
    // 2. BETEGEK ÉS MEGRENDELÉSEK LEKÉRDEZÉSE (Új Supabase API)
    // =========================================================

    async getPatients(ward = null) {
        if (!supabase) return [];
        let query = supabase.from('patients').select('*');
        if (ward) {
            query = query.eq('ward', ward);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Hiba a betegek lekérdezésekor:', error);
            return [];
        }
        return data || [];
    },

    async getOrdersByStatus(status = 'pending') {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('medication_orders')
            .select(`
                *,
                patients ( name, room, ward )
            `)
            .eq('status', status);

        if (error) {
            console.error('Hiba a megrendelések lekérésénél:', error);
            return [];
        }
        return data || [];
    },

    async savePatientWithOrders(patientData, ordersList) {
        if (!supabase) return false;

        const { data: patient, error: pError } = await supabase
            .from('patients')
            .upsert({
                patient_code: patientData.patient_code || patientData.id,
                name: patientData.name,
                ward: patientData.ward,
                room: patientData.room
            }, { onConflict: 'patient_code' })
            .select()
            .single();

        if (pError) {
            console.error('Hiba a beteg mentésekor:', pError);
            return false;
        }

        const formattedOrders = ordersList.map(order => ({
            patient_id: patient.id,
            raw_drug_name: order.raw_drug_name || order.name,
            normalized_name: order.normalized_name || order.name,
            dosage: order.dosage,
            quantity: order.quantity || 1,
            ward: patientData.ward,
            status: 'pending'
        }));

        const { error: oError } = await supabase
            .from('medication_orders')
            .insert(formattedOrders);

        if (oError) {
            console.error('Hiba a gyógyszerek mentésekor:', oError);
            return false;
        }

        return true;
    },

    async updateOrderStatus(orderId, newStatus) {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('medication_orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select();

        if (error) {
            console.error('Hiba a státusz frissítésekor:', error);
            return null;
        }
        return data;
    },

    async completeOrder(orderData, user = { name: 'Rendszer', reviewer: 'Rendszer' }) {
        if (!supabase) return false;

        const { error: cError } = await supabase
            .from('completed_tasks')
            .insert([{
                order_id: orderData.id,
                patient_name: orderData.patient_name || orderData.patients?.name || 'Ismeretlen',
                drug_name: orderData.normalized_name || orderData.raw_drug_name,
                prepared_by: user.name,
                reviewed_by: user.reviewer
            }]);

        if (cError) {
            console.error('Hiba az archiváláskor:', cError);
            return false;
        }

        await this.updateOrderStatus(orderData.id, 'completed');
        return true;
    },

    async searchDrug(term) {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('drug_database')
            .select('*')
            .ilike('name', `%${term}%`)
            .limit(20);

        if (error) {
            console.error('Hiba a keresésben:', error);
            return [];
        }
        return data || [];
    }
};
