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

    // Osztályok betöltése a Supabase-ből adott napra
    async loadWards(targetDate = null) {
        const isSupabaseReady = typeof supabase !== "undefined" && 
                                supabase && 
                                typeof supabase.from === "function" &&
                                typeof CONFIG !== "undefined" &&
                                CONFIG.supabase?.url &&
                                !CONFIG.supabase.url.includes("YOUR_SUPABASE");

        if (isSupabaseReady) {
            try {
                let query = supabase.from('wards').select('*');

                if (targetDate) {
                    // YYYY-MM-DD formátum feldolgozása
                    const cleanDate = targetDate.replace(/\./g, '-');
                    const startOfDay = new Date(`${cleanDate}T00:00:00`).toISOString();
                    const endOfDay = new Date(`${cleanDate}T23:59:59`).toISOString();

                    query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
                }

                const { data, error } = await query;

                if (error) {
                    console.error("Hiba a Supabase osztályok lekérésekor:", error);
                    // Ha a dátum szerinti szűrés hibát ad, próbáljuk meg szűrés nélkül
                    const fallback = await supabase.from('wards').select('*');
                    return fallback.data || [];
                } else if (data) {
                    Utils.log(`Osztályok betöltve (${targetDate || 'összes'}):`, data.length, "db osztály");
                    return data;
                }
            } catch (err) {
                console.warn("Supabase csatlakozási hiba, váltás helyi tárolóra:", err);
            }
        }

        // LocalStorage fallback
        const localData = localStorage.getItem(CONFIG.storage.WARDS);
        return localData ? JSON.parse(localData) : [];
    },

    async mergeWard(ward) {
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
                    .upsert({
                        wardCode: ward.wardCode,
                        wardName: ward.wardName,
                        patients: ward.patients,
                        created_at: new Date().toISOString()
                    }, { onConflict: 'wardCode' });

                if (error) {
                    console.error("Hiba az osztály Supabase mentésekor:", error);
                } else {
                    Utils.log("Osztály elmentve a Supabase-be:", ward.wardName);
                }
            } catch (err) {
                console.error("Supabase mentési hiba:", err);
            }
        }

        // Helyi mentés frissítése is
        let wards = JSON.parse(localStorage.getItem(CONFIG.storage.WARDS) || "[]");
        const index = wards.findIndex(w => w.wardCode === ward.wardCode);
        if (index >= 0) {
            wards[index] = ward;
        } else {
            wards.push(ward);
        }
        localStorage.setItem(CONFIG.storage.WARDS, JSON.stringify(wards));
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
