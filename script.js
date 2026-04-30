let dataFinance = JSON.parse(localStorage.getItem('hkr_v10_data')) || [];
let vaultPlans = JSON.parse(localStorage.getItem('hkr_v10_plans')) || [];
let myChart = null;

function switchTab(tab) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    event.currentTarget.classList.add('active');
    updateUI();
}

function createVaultPlan() {
    const nama = document.getElementById('inputNamaGoal').value;
    const target = document.getElementById('inputTargetNominal').value;
    if(!nama || !target) return;
    
    vaultPlans.push({ id: Date.now(), nama: nama, target: parseInt(target) });
    localStorage.setItem('hkr_v10_plans', JSON.stringify(vaultPlans));
    document.getElementById('inputNamaGoal').value = "";
    document.getElementById('inputTargetNominal').value = "";
    updateUI();
}

function deletePlan(id) {
    if(confirm("Hapus plan ini? Saldo di dalamnya akan dianggap hilang.")) {
        vaultPlans = vaultPlans.filter(p => p.id !== id);
        dataFinance = dataFinance.filter(d => d.planId !== id);
        localStorage.setItem('hkr_v10_plans', JSON.stringify(vaultPlans));
        save();
    }
}

function toggleDetail(id) {
    document.getElementById('history-'+id).classList.toggle('active');
}

function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = document.getElementById('nominal').value;
    if (!ket || !nom) return;
    dataFinance.push({ id: Date.now(), keterangan: ket, nominal: parseInt(nom), tipe: document.getElementById('tipe').value, sumber: document.getElementById('sumber').value, tanggal: new Date().toISOString() });
    save();
    document.getElementById('keterangan').value = ""; document.getElementById('nominal').value = "";
}

function prosesTabungan(aksi) {
    const planId = parseInt(document.getElementById('pilihPlan').value);
    const nom = parseInt(document.getElementById('nominalNabung').value);
    if (!nom || !planId) return;

    if (aksi === 'masuk') {
        dataFinance.push({ id: Date.now(), keterangan: `Vault: ${nom}`, nominal: nom, tipe: 'keluar', sumber: 'cash', planId: planId, tanggal: new Date().toISOString() });
    } else {
        dataFinance.push({ id: Date.now(), keterangan: `Release: ${nom}`, nominal: nom, tipe: 'masuk', sumber: 'cash', planId: planId, isWithdraw: true, tanggal: new Date().toISOString() });
    }
    save();
    document.getElementById('nominalNabung').value = "";
}

function save() {
    localStorage.setItem('hkr_v10_data', JSON.stringify(dataFinance));
    updateUI();
}

function updateUI() {
    let cash = 0, digital = 0, inMon = 0, outMon = 0;
    const container = document.getElementById('vaultPlansContainer');
    const selectPlan = document.getElementById('pilihPlan');
    container.innerHTML = "";
    selectPlan.innerHTML = "<option value=''>Pilih Target...</option>";

    // Hitung Saldo Utama
    dataFinance.forEach(d => {
        let m = d.tipe === 'masuk' ? 1 : -1;
        if(d.sumber === 'cash') cash += (d.nominal * m);
        if(d.sumber === 'digital') digital += (d.nominal * m);
    });

    // Render Vault Plans
    vaultPlans.forEach(plan => {
        let saldoPlan = 0;
        let historyHTML = "";
        dataFinance.filter(d => d.planId === plan.id).forEach(d => {
            let isOut = d.isWithdraw;
            saldoPlan += isOut ? -d.nominal : d.nominal;
            historyHTML += `<div class="history-item"><span>${isOut?'Out':'In'}</span><span>Rp ${d.nominal.toLocaleString()}</span></div>`;
        });

        let persen = Math.min((saldoPlan / plan.target) * 100, 100);
        
        container.innerHTML += `
            <div class="premium-card gold-variant" onclick="toggleDetail(${plan.id})">
                <div style="display:flex; justify-content:space-between">
                    <p class="card-label">${plan.nama}</p>
                    <p class="card-label">${Math.floor(persen)}%</p>
                </div>
                <h1>Rp ${saldoPlan.toLocaleString()}</h1>
                <div class="progress-track"><div class="progress-fill" style="width:${persen}%"></div></div>
                <p style="font-size:9px; opacity:0.8">Target: Rp ${plan.target.toLocaleString()}</p>
                <div class="vault-history" id="history-${plan.id}">${historyHTML || 'Belum ada riwayat'}</div>
                <button class="btn-delete-plan" onclick="event.stopPropagation(); deletePlan(${plan.id})">DELETE PLAN</button>
            </div>
        `;
        selectPlan.innerHTML += `<option value="${plan.id}">${plan.nama}</option>`;
    });

    document.getElementById('areaNabungVault').style.display = vaultPlans.length > 0 ? 'block' : 'none';
    document.getElementById('saldoAktif').innerText = `Rp ${(cash + digital).toLocaleString()}`;
    document.getElementById('saldoCash').innerText = `Rp ${cash.toLocaleString()}`;
    document.getElementById('saldoDigital').innerText = `Rp ${digital.toLocaleString()}`;
    if(document.getElementById('saldoDigitalHalaman')) document.getElementById('saldoDigitalHalaman').innerText = `Rp ${digital.toLocaleString()}`;
}

function setChart(mode) { /* Chart logic tetap sama seperti v9 */ }
window.onload = () => updateUI();
