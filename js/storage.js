/*
=========================================
DrugAssist - storage.js
Supabase Adatkezelő Modul
=========================================
*/

const Storage = {

    // --- 1. BETEGEK ÉS MEGRENDELÉSEK LEKÉRDEZÉSE ---

    // Beteglista lekérése (opcionálisan osztály szerint szűrve)
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

    // Megrendelések/Gyógyszerek lekérése státusz alapján ('pending', 'prepared', stb.)
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

    // --- 2. ADATOK MENTÉSE (PDF IMPORTÁLÁS UTÁN) ---

    async savePatientWithOrders(patientData, ordersList) {
        if (!supabase) return false;

        // 1. Beteg mentése vagy frissítése (upsert patient_code alapján)
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

        // 2. Megrendelt gyógyszerek beszúrása a beteghez
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

    // --- 3. STÁTUSZ MÓDOSÍTÁSA (Előkészítés / Ellenőrzés) ---

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

    // --- 4. ARCHIVÁLÁS / ELVÉGZETT FELADATOK ---

    async completeOrder(orderData, user = { name: 'Rendszer', reviewer: 'Rendszer' }) {
        if (!supabase) return false;

        // 1. Beszúrás a completed_tasks táblába
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

        // 2. Eredeti tétel státuszának frissítése 'completed'-re
        await this.updateOrderStatus(orderData.id, 'completed');
        return true;
    },

    // --- 5. GYÓGYSZERTÖRZSKERESÉS ---

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
