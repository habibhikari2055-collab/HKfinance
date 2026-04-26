let dataFinance = JSON.parse(localStorage.getItem('hkr_v4_data')) || [];
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

// FUNGSI TRANSFER (Bisa buat Digital atau Tabungan)
function prosesTransfer(dari, ke, inputID, label) {
    const nominal = parseInt(document.getElementById(inputID).value);
    if (!nominal || nominal <= 0) return alert("Masukkan nominal!");

    // Catatan Pengurangan
    dataFinance.push({
        id: Date.now(),
        keterangan: `${label} (Keluar dari ${dari})`,
        nominal: nominal, tipe: 'keluar', sumber: dari,
        tanggal: new Date().toISOString()
    });

    // Catatan Penambahan
    dataFinance.push({
        id: Date.now() + 1,
        keterangan: `${label} (Masuk ke ${ke})`,
        nominal: nominal, tipe: 'masuk', sumber: ke,
        tanggal: new Date().toISOString()
    });

    saveAndUpdate();
    document.getElementById(inputID).value = "";
    alert(`${label} Berhasil!`);
    updateUI();
}

function saveAndUpdate() {
    localStorage.setItem('hkr_v4_data', JSON.stringify(dataFinance));
    updateUI();
}

function updateUI() {
    let cash = 0, digital = 0, tabungan = 0, inMon = 0, outMon = 0;
    const lists = {
        daftar: document.getElementById('daftar'),
        daftarTopUp: document.getElementById('daftarTopUp'),
        daftarNabung: document.getElementById('daftarNabung')
    };
    
    Object.values(lists).forEach(l => { if(l) l.innerHTML = ""; });

    dataFinance.slice().reverse().forEach(item => {
        // Hitung Saldo Real-Time
        let multiplier = (item.tipe === 'masuk' ? 1 : -1);
        if (item.sumber === 'cash') cash += (item.nominal * multiplier);
        else if (item.sumber === 'digital') digital += (item.nominal * multiplier);
        else if (item.sumber === 'tabungan') tabungan += (item.nominal * multiplier);

        // Statistik Bulanan
        if (new Date(item.tanggal).getMonth() === new Date().getMonth()) {
            if (item.tipe === 'masuk') inMon += item.nominal; else outMon += item.nominal;
        }

        // Render Item
        const li = document.createElement('li');
        li.className = 'item';
        li.style.borderLeftColor = item.sumber === 'cash' ? '#60a5fa' : (item.sumber === 'digital' ? '#c084fc' : '#facc15');
        li.innerHTML = `
            <div>
                <p style="font-weight:600; font-size:12px">${item.keterangan}</p>
                <span class="tag tag-${item.sumber}">${item.sumber}</span>
            </div>
            <div style="text-align:right">
                <p class="${item.tipe === 'masuk' ? 'txt-in' : 'txt-out'}">
                    ${item.tipe === 'masuk' ? '+' : '-'} ${item.nominal.toLocaleString('id-ID')}
                </p>
                <button class="btn-del" onclick="hapusData(${item.id})">Hapus</button>
            </div>
        `;
        
        if(lists.daftar) lists.daftar.appendChild(li);
        if(item.keterangan.includes("Top Up") && lists.daftarTopUp) lists.daftarTopUp.appendChild(li.cloneNode(true));
        if(item.keterangan.includes("Menabung") && lists.daftarNabung) lists.daftarNabung.appendChild(li.cloneNode(true));
    });

    document.getElementById('saldoTotal').innerText = `Rp ${(cash + digital + tabungan).toLocaleString('id-ID')}`;
    document.getElementById('saldoCash').innerText = cash.toLocaleString('id-ID');
    document.getElementById('saldoDigital').innerText = digital.toLocaleString('id-ID');
    document.getElementById('saldoTabungan').innerText = tabungan.toLocaleString('id-ID');

    updateChart(inMon, outMon);
}

function updateChart(i, o) {
    const ctx = document.getElementById('myChart')?.getContext('2d');
    if (!ctx) return;
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Masuk', 'Keluar'],
            datasets: [{ data: [i || 1, o || 0], backgroundColor: ['#10b981', '#ef4444'], borderWidth: 0, cutout: '75%' }]
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = "HKR_Backup_Ultra.json"; a.click();
}

function importData(e) {
    const reader = new FileReader();
    reader.onload = (ev) => { dataFinance = JSON.parse(ev.target.result); saveAndUpdate(); };
    reader.readAsText(e.target.files[0]);
}

window.onload = () => { setTimeout(updateUI, 300); };
