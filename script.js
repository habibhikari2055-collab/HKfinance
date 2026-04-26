let dataFinance = JSON.parse(localStorage.getItem('hkr_v5_data')) || [];
let myChart = null;

function switchTab(tab) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    event.currentTarget.classList.add('active');
    updateUI();
}

function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = document.getElementById('nominal').value;
    const tipe = document.getElementById('tipe').value;
    const sumber = document.getElementById('sumber').value;

    if (!ket || !nom) return;

    dataFinance.push({
        id: Date.now(),
        keterangan: ket,
        nominal: parseInt(nom),
        tipe: tipe,
        sumber: sumber,
        tanggal: new Date().toISOString()
    });

    saveAndUpdate();
    document.getElementById('keterangan').value = "";
    document.getElementById('nominal').value = "";
}

function prosesTransfer(dari, ke, inputID, label) {
    const nominal = parseInt(document.getElementById(inputID).value);
    if (!nominal || nominal <= 0) return;

    dataFinance.push({ id: Date.now(), keterangan: `${label} (Out)`, nominal: nominal, tipe: 'keluar', sumber: dari, tanggal: new Date().toISOString() });
    dataFinance.push({ id: Date.now() + 1, keterangan: `${label} (In)`, nominal: nominal, tipe: 'masuk', sumber: ke, tanggal: new Date().toISOString() });

    saveAndUpdate();
    document.getElementById(inputID).value = "";
    alert("Berhasil dipindahkan!");
    switchTab('transaksi');
}

function saveAndUpdate() {
    localStorage.setItem('hkr_v5_data', JSON.stringify(dataFinance));
    updateUI();
}

function updateUI() {
    let cash = 0, digital = 0, savings = 0, inMon = 0, outMon = 0;
    const daftar = document.getElementById('daftar');
    const daftarTopUp = document.getElementById('daftarTopUp');
    const daftarNabung = document.getElementById('daftarNabung');

    [daftar, daftarTopUp, daftarNabung].forEach(l => { if(l) l.innerHTML = ""; });

    dataFinance.slice().reverse().forEach(item => {
        let multiplier = (item.tipe === 'masuk' ? 1 : -1);
        if (item.sumber === 'cash') cash += (item.nominal * multiplier);
        else if (item.sumber === 'digital') digital += (item.nominal * multiplier);
        else if (item.sumber === 'tabungan') savings += (item.nominal * multiplier);

        if (new Date(item.tanggal).getMonth() === new Date().getMonth()) {
            if (item.tipe === 'masuk') inMon += item.nominal; else outMon += item.nominal;
        }

        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
            <div>
                <p>${item.keterangan}</p>
                <small>${item.sumber.toUpperCase()} • ${new Date(item.tanggal).toLocaleDateString('id-ID')}</small>
            </div>
            <div style="text-align:right">
                <span class="${item.tipe === 'masuk' ? 'txt-in' : 'txt-out'}">
                    ${item.tipe === 'masuk' ? '+' : '-'} ${item.nominal.toLocaleString('id-ID')}
                </span>
                <button class="btn-del" onclick="hapusData(${item.id})">x</button>
            </div>
        `;
        
        if(daftar) daftar.appendChild(li);
        if(item.keterangan.includes("Digital") && daftarTopUp) daftarTopUp.appendChild(li.cloneNode(true));
        if(item.keterangan.includes("Menabung") && daftarNabung) daftarNabung.appendChild(li.cloneNode(true));
    });

    document.getElementById('saldoTotal').innerText = `Rp ${(cash + digital + savings).toLocaleString('id-ID')}`;
    document.getElementById('saldoCash').innerText = cash.toLocaleString('id-ID');
    document.getElementById('saldoDigital').innerText = digital.toLocaleString('id-ID');
    document.getElementById('saldoTabungan').innerText = savings.toLocaleString('id-ID');

    updateChart(inMon, outMon);
}

function updateChart(i, o) {
    const ctx = document.getElementById('myChart')?.getContext('2d');
    if (!ctx) return;
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{ data: [i || 1, o || 0], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0, cutout: '85%' }]
        },
        options: { plugins: { legend: { display: false } }, maintainAspectRatio: false }
    });
}

function hapusData(id) {
    dataFinance = dataFinance.filter(i => i.id !== id);
    saveAndUpdate();
}

function exportData() {
    const blob = new Blob([JSON.stringify(dataFinance)], {type: "application/json"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "HKR_Backup.json"; a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (ev) => { dataFinance = JSON.parse(ev.target.result); saveAndUpdate(); };
    reader.readAsText(e.target.files[0]);
}

window.onload = () => { setTimeout(updateUI, 300); };
