const DB_NAME = 'hkr_finance_db_v11';
const PLAN_NAME = 'hkr_plans_db_v11';

let dataFinance = JSON.parse(localStorage.getItem(DB_NAME)) || [];
let vaultPlans = JSON.parse(localStorage.getItem(PLAN_NAME)) || [];

// 1. FUNGSI NAVIGASI
function switchTab(tab, event) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById('page-' + tab).classList.add('active');
    if(event) event.currentTarget.classList.add('active');
    updateUI();
}

// 2. FUNGSI TRANSAKSI HARIAN
function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = parseInt(document.getElementById('nominal').value);
    const sumber = document.getElementById('sumber').value;
    const tipe = document.getElementById('tipe').value;

    if (!ket || !nom) return alert("Isi keterangan dan nominal!");

    dataFinance.push({ id: Date.now(), keterangan: ket, nominal: nom, sumber: sumber, tipe: tipe });
    save();
    document.getElementById('keterangan').value = "";
    document.getElementById('nominal').value = "";
}

// 3. FUNGSI DIGITAL TOP UP
function prosesTopUp() {
    const nom = parseInt(document.getElementById('nominalTopUp').value);
    if (!nom) return alert("Masukkan nominal!");

    dataFinance.push({ id: Date.now(), keterangan: "Top Up Digital", nominal: nom, tipe: 'masuk', sumber: 'digital' });
    save();
    document.getElementById('nominalTopUp').value = "";
    alert("Digital Balance Updated!");
}

// 4. FUNGSI VAULT (BUAT PLAN)
function createVaultPlan() {
    const nama = document.getElementById('inputNamaGoal').value.trim();
    const target = parseInt(document.getElementById('inputTargetNominal').value);
    
    if (!nama || !target) return alert("Isi nama dan target tabungan!");

    vaultPlans.push({ id: Date.now(), nama: nama, target: target });
    localStorage.setItem(PLAN_NAME, JSON.stringify(vaultPlans));
    
    document.getElementById('inputNamaGoal').value = "";
    document.getElementById('inputTargetNominal').value = "";
    updateUI();
}

// 5. FUNGSI NABUNG KE VAULT
function prosesTabungan(aksi) {
    const planId = parseInt(document.getElementById('pilihPlan').value);
    const nom = parseInt(document.getElementById('nominalNabung').value);
    if (!nom || !planId) return alert("Pilih target dan masukkan nominal!");

    if (aksi === 'masuk') {
        dataFinance.push({ id: Date.now(), keterangan: `Vault Save`, nominal: nom, tipe: 'keluar', sumber: 'cash', planId: planId });
    } else {
        dataFinance.push({ id: Date.now(), keterangan: `Vault Release`, nominal: nom, tipe: 'masuk', sumber: 'cash', planId: planId, isWithdraw: true });
    }
    save();
    document.getElementById('nominalNabung').value = "";
}

// 6. FUNGSI DELETE & SAVE
function save() {
    localStorage.setItem(DB_NAME, JSON.stringify(dataFinance));
    updateUI();
}

function deletePlan(id) {
    if(confirm("Hapus target ini?")) {
        vaultPlans = vaultPlans.filter(p => p.id !== id);
        dataFinance = dataFinance.filter(d => d.planId !== id);
        localStorage.setItem(PLAN_NAME, JSON.stringify(vaultPlans));
        save();
    }
}

// 7. UPDATE TAMPILAN
function updateUI() {
    let cash = 0, digital = 0;
    const container = document.getElementById('vaultPlansContainer');
    const selectPlan = document.getElementById('pilihPlan');
    
    if(container) container.innerHTML = "";
    if(selectPlan) selectPlan.innerHTML = "<option value=''>Pilih Target...</option>";

    dataFinance.forEach(d => {
        let m = d.tipe === 'masuk' ? 1 : -1;
        if(d.sumber === 'cash') cash += (d.nominal * m);
        if(d.sumber === 'digital') digital += (d.nominal * m);
    });

    document.getElementById('saldoAktif').innerText = `Rp ${(cash+digital).toLocaleString()}`;
    document.getElementById('saldoCash').innerText = `Rp ${cash.toLocaleString()}`;
    document.getElementById('saldoDigital').innerText = `Rp ${digital.toLocaleString()}`;
    if(document.getElementById('saldoDigitalHalaman')) document.getElementById('saldoDigitalHalaman').innerText = `Rp ${digital.toLocaleString()}`;

    vaultPlans.forEach(plan => {
        let saldoPlan = 0;
        dataFinance.filter(d => d.planId === plan.id).forEach(d => {
            saldoPlan += d.isWithdraw ? -d.nominal : d.nominal;
        });
        let persen = Math.min((saldoPlan / plan.target) * 100, 100);
        
        if(container) {
            container.innerHTML += `
                <div class="premium-card gold-variant" style="margin-bottom:15px; border:1px solid rgba(245, 158, 11, 0.3); padding:20px; border-radius:20px;">
                    <div style="display:flex; justify-content:space-between">
                        <p class="card-label" style="color:var(--gold)">${plan.nama}</p>
                        <p class="card-label">${Math.floor(persen)}%</p>
                    </div>
                    <h1 style="font-size:1.8rem; margin:10px 0">Rp ${saldoPlan.toLocaleString()}</h1>
                    <div class="progress-track" style="background:rgba(255,255,255,0.05); height:8px; border-radius:10px; overflow:hidden;">
                        <div style="width:${persen}%; background:var(--gold); height:100%"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px">
                        <p style="font-size:10px; opacity:0.6">Goal: Rp ${plan.target.toLocaleString()}</p>
                        <button onclick="deletePlan(${plan.id})" style="background:rgba(239,68,68,0.2); color:#ef4444; border:none; padding:5px 10px; border-radius:8px; font-size:10px; font-weight:700;">HAPUS</button>
                    </div>
                </div>`;
        }
        if(selectPlan) selectPlan.innerHTML += `<option value="${plan.id}">${plan.nama}</option>`;
    });

    const areaNabung = document.getElementById('areaNabungVault');
    if(areaNabung) areaNabung.style.display = vaultPlans.length > 0 ? 'block' : 'none';
}

window.onload = updateUI;
