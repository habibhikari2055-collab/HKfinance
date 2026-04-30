// 1. DATA INITIALIZATION
const DATA_KEY = 'hkr_v10_final_data';
const PLAN_KEY = 'hkr_v10_final_plans';

let dataFinance = JSON.parse(localStorage.getItem(DATA_KEY)) || [];
let vaultPlans = JSON.parse(localStorage.getItem(PLAN_KEY)) || [];

// 2. NAVIGATION FUNCTION (Biar bisa pindah halaman)
function switchTab(tab) {
    // Sembunyikan semua halaman
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Matikan semua status active di nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    // Tampilkan halaman yang dipilih
    const targetPage = document.getElementById('page-' + tab);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Aktifkan tombol nav yang diklik
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    updateUI();
}

// 3. CREATE VAULT PLAN
function createVaultPlan() {
    const namaInput = document.getElementById('inputNamaGoal');
    const targetInput = document.getElementById('inputTargetNominal');
    
    if (!namaInput || !targetInput) return;

    const nama = namaInput.value.trim();
    const target = parseInt(targetInput.value);

    if (nama === "" || isNaN(target) || target <= 0) {
        alert("Isi nama dan target dengan angka yang benar!");
        return;
    }

    const newPlan = {
        id: Date.now(),
        nama: nama,
        target: target
    };

    vaultPlans.push(newPlan);
    localStorage.setItem(PLAN_KEY, JSON.stringify(vaultPlans));
    
    namaInput.value = "";
    targetInput.value = "";
    
    updateUI();
}

// 4. VAULT TRANSACTION (IN/OUT)
function prosesTabungan(aksi) {
    const planId = parseInt(document.getElementById('pilihPlan').value);
    const nom = parseInt(document.getElementById('nominalNabung').value);
    
    if (!nom || !planId) {
        alert("Pilih target dan masukkan nominal!");
        return;
    }

    if (aksi === 'masuk') {
        // Uang keluar dari Cash, masuk ke Vault
        dataFinance.push({ 
            id: Date.now(), 
            keterangan: `Safe: ${nom}`, 
            nominal: nom, 
            tipe: 'keluar', 
            sumber: 'cash', 
            planId: planId, 
            tanggal: new Date().toISOString() 
        });
    } else {
        // Uang keluar dari Vault, masuk ke Cash
        dataFinance.push({ 
            id: Date.now(), 
            keterangan: `Release: ${nom}`, 
            nominal: nom, 
            tipe: 'masuk', 
            sumber: 'cash', 
            planId: planId, 
            isWithdraw: true, 
            tanggal: new Date().toISOString() 
        });
    }
    
    save();
    document.getElementById('nominalNabung').value = "";
}

// 5. CORE FUNCTIONS (Save, Delete, Update)
function save() {
    localStorage.setItem(DATA_KEY, JSON.stringify(dataFinance));
    updateUI();
}

function deletePlan(id) {
    if (confirm("Hapus plan ini?")) {
        vaultPlans = vaultPlans.filter(p => p.id !== id);
        dataFinance = dataFinance.filter(d => d.planId !== id);
        localStorage.setItem(PLAN_KEY, JSON.stringify(vaultPlans));
        save();
    }
}

function updateUI() {
    const container = document.getElementById('vaultPlansContainer');
    const selectPlan = document.getElementById('pilihPlan');
    let cash = 0, digital = 0;

    // Hitung Saldo Utama
    dataFinance.forEach(d => {
        let m = d.tipe === 'masuk' ? 1 : -1;
        if(d.sumber === 'cash') cash += (d.nominal * m);
        if(d.sumber === 'digital') digital += (d.nominal * m);
    });

    // Update Tampilan Saldo Atas
    if(document.getElementById('saldoAktif')) document.getElementById('saldoAktif').innerText = `Rp ${(cash + digital).toLocaleString()}`;
    if(document.getElementById('saldoCash')) document.getElementById('saldoCash').innerText = `Rp ${cash.toLocaleString()}`;
    if(document.getElementById('saldoDigital')) document.getElementById('saldoDigital').innerText = `Rp ${digital.toLocaleString()}`;

    // Update Vault Section
    if (container) {
        container.innerHTML = "";
        if (selectPlan) selectPlan.innerHTML = "<option value=''>Pilih Target...</option>";

        vaultPlans.forEach(plan => {
            let saldoPlan = 0;
            dataFinance.filter(d => d.planId === plan.id).forEach(d => {
                saldoPlan += d.isWithdraw ? -d.nominal : d.nominal;
            });

            let persen = Math.min((saldoPlan / plan.target) * 100, 100);
            
            container.innerHTML += `
                <div class="premium-card gold-variant" style="margin-bottom:15px">
                    <div style="display:flex; justify-content:space-between">
                        <p class="card-label">${plan.nama}</p>
                        <p class="card-label">${Math.floor(persen)}%</p>
                    </div>
                    <h1 style="font-size:1.8rem; margin:10px 0">Rp ${saldoPlan.toLocaleString()}</h1>
                    <div class="progress-track" style="background:rgba(0,0,0,0.2); height:8px; border-radius:10px; overflow:hidden">
                        <div style="width:${persen}%; background:#fff; height:100%"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px">
                        <p style="font-size:10px">Target: Rp ${plan.target.toLocaleString()}</p>
                        <button onclick="deletePlan(${plan.id})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:5px; font-size:9px">HAPUS</button>
                    </div>
                </div>`;
            
            if (selectPlan) selectPlan.innerHTML += `<option value="${plan.id}">${plan.nama}</option>`;
        });

        // Munculkan area nabung kalau ada plan
        const areaNabung = document.getElementById('areaNabungVault');
        if(areaNabung) areaNabung.style.display = vaultPlans.length > 0 ? 'block' : 'none';
    }
}

// 6. INITIAL LOAD
window.onload = () => {
    updateUI();
};
