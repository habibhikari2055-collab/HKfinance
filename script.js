const DB_NAME = 'hkr_finance_final';
const PLAN_NAME = 'hkr_plans_final';

let dataFinance = JSON.parse(localStorage.getItem(DB_NAME)) || [];
let vaultPlans = JSON.parse(localStorage.getItem(PLAN_NAME)) || [];

function switchTab(tab) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    event.currentTarget.classList.add('active');
    updateUI();
}

function createVaultPlan() {
    const nama = document.getElementById('inputNamaGoal').value.trim();
    const target = parseInt(document.getElementById('inputTargetNominal').value);
    if (!nama || !target) return alert("Isi data dengan lengkap!");

    vaultPlans.push({ id: Date.now(), nama: nama, target: target });
    localStorage.setItem(PLAN_NAME, JSON.stringify(vaultPlans));
    updateUI();
}

function prosesTabungan(aksi) {
    const planId = parseInt(document.getElementById('pilihPlan').value);
    const nom = parseInt(document.getElementById('nominalNabung').value);
    if (!nom || !planId) return;

    if (aksi === 'masuk') {
        dataFinance.push({ id: Date.now(), keterangan: `Vault In`, nominal: nom, tipe: 'keluar', sumber: 'cash', planId: planId });
    } else {
        dataFinance.push({ id: Date.now(), keterangan: `Vault Out`, nominal: nom, tipe: 'masuk', sumber: 'cash', planId: planId, isWithdraw: true });
    }
    save();
}

function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = parseInt(document.getElementById('nominal').value);
    if (!ket || !nom) return;
    dataFinance.push({ id: Date.now(), keterangan: ket, nominal: nom, sumber: document.getElementById('sumber').value, tipe: document.getElementById('tipe').value });
    save();
}

function save() {
    localStorage.setItem(DB_NAME, JSON.stringify(dataFinance));
    updateUI();
}

function updateUI() {
    let cash = 0, digital = 0;
    const container = document.getElementById('vaultPlansContainer');
    const selectPlan = document.getElementById('pilihPlan');
    container.innerHTML = "";
    if(selectPlan) selectPlan.innerHTML = "<option value=''>Pilih Target...</option>";

    dataFinance.forEach(d => {
        let m = d.tipe === 'masuk' ? 1 : -1;
        if(d.sumber === 'cash') cash += (d.nominal * m);
        if(d.sumber === 'digital') digital += (d.nominal * m);
    });

    document.getElementById('saldoAktif').innerText = `Rp ${(cash+digital).toLocaleString()}`;
    document.getElementById('saldoCash').innerText = `Rp ${cash.toLocaleString()}`;
    document.getElementById('saldoDigital').innerText = `Rp ${digital.toLocaleString()}`;

    vaultPlans.forEach(plan => {
        let saldoPlan = 0;
        dataFinance.filter(d => d.planId === plan.id).forEach(d => {
            saldoPlan += d.isWithdraw ? -d.nominal : d.nominal;
        });
        let persen = Math.min((saldoPlan / plan.target) * 100, 100);
        container.innerHTML += `
            <div class="premium-card gold-variant" onclick="this.querySelector('.history-container').classList.toggle('active')">
                <p class="card-label">${plan.nama} (${Math.floor(persen)}%)</p>
                <h1>Rp ${saldoPlan.toLocaleString()}</h1>
                <div class="progress-track"><div class="progress-fill" style="width:${persen}%"></div></div>
                <div class="history-container">History akan muncul di sini</div>
            </div>`;
        selectPlan.innerHTML += `<option value="${plan.id}">${plan.nama}</option>`;
    });
}
window.onload = updateUI;
