const DB_NAME = 'hkr_finance_v10_final';
const PLAN_NAME = 'hkr_plans_v10_final';

let dataFinance = JSON.parse(localStorage.getItem(DB_NAME)) || [];
let vaultPlans = JSON.parse(localStorage.getItem(PLAN_NAME)) || [];

// PINDAH HALAMAN
function switchTab(tab) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById('page-' + tab).classList.add('active');
    event.currentTarget.classList.add('active');
    updateUI();
}

// VAULT: BUAT TARGET BARU
function createVaultPlan() {
    const nama = document.getElementById('inputNamaGoal').value.trim();
    const target = parseInt(document.getElementById('inputTargetNominal').value);

    if (!nama || !target) {
        alert("Mohon isi nama target dan nominal target!");
        return;
    }

    vaultPlans.push({ id: Date.now(), nama: nama, target: target });
    localStorage.setItem(PLAN_NAME, JSON.stringify(vaultPlans));
    
    document.getElementById('inputNamaGoal').value = "";
    document.getElementById('inputTargetNominal').value = "";
    updateUI();
}

// VAULT: PROSES NABUNG/TARIK
function prosesTabungan(aksi) {
    const planId = parseInt(document.getElementById('pilihPlan').value);
    const nom = parseInt(document.getElementById('nominalNabung').value);
    
    if (!nom || !planId) return alert("Pilih target dan isi nominal!");

    if (aksi === 'masuk') {
        dataFinance.push({ id: Date.now(), keterangan: `Vault Save`, nominal: nom, tipe: 'keluar', sumber: 'cash', planId: planId });
    } else {
        dataFinance.push({ id: Date.now(), keterangan: `Vault Release`, nominal: nom, tipe: 'masuk', sumber: 'cash', planId: planId, isWithdraw: true });
    }
    
    save();
    document.getElementById('nominalNabung').value = "";
}

// TRANSAKSI HARIAN
function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = parseInt(document.getElementById('nominal').value);
    if (!ket || !nom) return;

    dataFinance.push({
        id: Date.now(),
        keterangan: ket,
        nominal: nom,
        sumber: document.getElementById('sumber').value,
        tipe: document.getElementById('tipe').value
    });
    
    save();
    document.getElementById('keterangan').value = "";
    document.getElementById('nominal').value = "";
}

function save() {
    localStorage.setItem(DB_NAME, JSON.stringify(dataFinance));
    updateUI();
}

function deletePlan(id) {
    if(confirm("Hapus target ini? Data riwayat di dalamnya juga akan hilang.")) {
        vaultPlans = vaultPlans.filter(p => p.id !== id);
        dataFinance = dataFinance.filter(d => d.planId !== id);
        localStorage.setItem(PLAN_NAME, JSON.stringify(vaultPlans));
        save();
    }
}

function toggleHistory(id) {
    const el = document.getElementById('hist-' + id);
    el.classList.toggle('active');
}

function updateUI() {
    let cash = 0, digital = 0;
    const container = document.getElementById('vaultPlansContainer');
    const selectPlan = document.getElementById('pilihPlan');
    
    container.innerHTML = "";
    if(selectPlan) selectPlan.innerHTML = "<option value=''>Pilih Target Tabungan...</option>";

    // Hitung Saldo Utama
    dataFinance.forEach(d => {
        let m = d.tipe === 'masuk' ? 1 : -1;
        if(d.sumber === 'cash') cash += (d.nominal * m);
        if(d.sumber === 'digital') digital += (d.nominal * m);
    });

    document.getElementById('saldoAktif').innerText = `Rp ${(cash+digital).toLocaleString()}`;
    document.getElementById('saldoCash').innerText = `Rp ${cash.toLocaleString()}`;
    document.getElementById('saldoDigital').innerText = `Rp ${digital.toLocaleString()}`;
    if(document.getElementById('saldoDigitalHalaman')) document.getElementById('saldoDigitalHalaman').innerText = `Rp ${digital.toLocaleString()}`;

    // Render Vault Plans
    vaultPlans.forEach(plan => {
        let saldoPlan = 0;
        let historyHTML = "";
        
        dataFinance.filter(d => d.planId === plan.id).forEach(d => {
            saldoPlan += d.isWithdraw ? -d.nominal : d.nominal;
            historyHTML += `<div class="hist-item"><span>${d.isWithdraw?'Out':'In'}</span><span>Rp ${d.nominal.toLocaleString()}</span></div>`;
        });

        let persen = Math.min((saldoPlan / plan.target) * 100, 100);
        
        container.innerHTML += `
            <div class="premium-card gold-variant" onclick="toggleHistory(${plan.id})">
                <div style="display:flex; justify-content:space-between">
                    <p class="card-label" style="color:var(--gold)">${plan.nama}</p>
                    <p class="card-label">${Math.floor(persen)}%</p>
                </div>
                <h1>Rp ${saldoPlan.toLocaleString()}</h1>
                <div class="progress-track"><div class="progress-fill" style="width:${persen}%"></div></div>
                <div style="display:flex; justify-content:space-between; align-items:center">
                    <p style="font-size:10px; opacity:0.6">Goal: Rp ${plan.target.toLocaleString()}</p>
                    <button class="btn-delete" onclick="event.stopPropagation(); deletePlan(${plan.id})">HAPUS</button>
                </div>
                <div class="history-container" id="hist-${plan.id}">
                    ${historyHTML || '<p style="font-size:10px; opacity:0.4">No history yet</p>'}
                </div>
            </div>
        `;
        if(selectPlan) selectPlan.innerHTML += `<option value="${plan.id}">${plan.nama}</option>`;
    });

    const areaNabung = document.getElementById('areaNabungVault');
    if(areaNabung) areaNabung.style.display = vaultPlans.length > 0 ? 'block' : 'none';
}

window.onload = updateUI;
