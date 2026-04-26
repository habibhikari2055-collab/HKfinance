let dataFinance = JSON.parse(localStorage.getItem('hkr_v3_data')) || [];
let myChart = null;

// Fungsi Navigasi Tab
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
        sumber: sumber, // 'cash' atau 'digital'
        tanggal: new Date().toISOString()
    });

    saveAndUpdate();
    document.getElementById('keterangan').value = "";
    document.getElementById('nominal').value = "";
}

// FUNGSI TOP UP OTOMATIS
function prosesTopUp() {
    const nominal = parseInt(document.getElementById('nominalTopUp').value);
    if (!nominal || nominal <= 0) return alert("Masukkan nominal valid!");

    // 1. Kurangi Uang Cash
    dataFinance.push({
        id: Date.now(),
        keterangan: "Top Up Digital (Keluar dari Cash)",
        nominal: nominal,
        tipe: 'keluar',
        sumber: 'cash',
        tanggal: new Date().toISOString()
    });

    // 2. Tambah ke Digital
    dataFinance.push({
        id: Date.now() + 1,
        keterangan: "Top Up Masuk (Dari Cash)",
        nominal: nominal,
        tipe: 'masuk',
        sumber: 'digital',
        tanggal: new Date().toISOString()
    });

    saveAndUpdate();
    document.getElementById('nominalTopUp').value = "";
    alert("Top Up Berhasil! Saldo Cash dipindahkan ke Digital.");
    switchTab('transaksi');
}

function saveAndUpdate() {
    localStorage.setItem('hkr_v3_data', JSON.stringify(dataFinance));
    updateUI();
}

function updateUI() {
    const filter = document.getElementById('filterWaktu')?.value || 'bulan';
    const sekarang = new Date();
    
    let totalCash = 0, totalDigital = 0, inAll = 0, outAll = 0;
    const daftar = document.getElementById('daftar');
    const daftarTopUp = document.getElementById('daftarTopUp');
    if (daftar) daftar.innerHTML = "";
    if (daftarTopUp) daftarTopUp.innerHTML = "";

    dataFinance.slice().reverse().forEach(item => {
        const tgl = new Date(item.tanggal);
        const isCurrentMonth = tgl.getMonth() === sekarang.getMonth() && tgl.getFullYear() === sekarang.getFullYear();

        // Hitung Saldo Global (Tanpa Filter)
        if (item.sumber === 'cash') {
            totalCash += (item.tipe === 'masuk' ? item.nominal : -item.nominal);
        } else {
            totalDigital += (item.tipe === 'masuk' ? item.nominal : -item.nominal);
        }

        // Tampilkan ke List (Dengan Filter)
        if (filter === 'semua' || isCurrentMonth) {
            if (item.tipe === 'masuk') inAll += item.nominal; else outAll += item.nominal;
            
            const li = document.createElement('li');
            li.className = 'item';
            li.innerHTML = `
                <div>
                    <p style="font-weight:600; font-size:13px">${item.keterangan}</p>
                    <span class="tag ${item.sumber === 'cash' ? 'tag-cash' : 'tag-digital'}">${item.sumber}</span>
                </div>
                <div style="text-align:right">
                    <p class="${item.tipe === 'masuk' ? 'txt-in' : 'txt-out'}">
                        ${item.tipe === 'masuk' ? '+' : '-'} ${item.nominal.toLocaleString('id-ID')}
                    </p>
                    <button class="btn-del" onclick="hapusData(${item.id})">Hapus</button>
                </div>
            `;
            
            if (item.keterangan.includes("Top Up")) {
                if(daftarTopUp) daftarTopUp.appendChild(li.cloneNode(true));
            }
            if(daftar) daftar.appendChild(li);
        }
    });

    document.getElementById('saldoTotal').innerText = `Rp ${(totalCash + totalDigital).toLocaleString('id-ID')}`;
    document.getElementById('saldoCash').innerText = `Rp ${totalCash.toLocaleString('id-ID')}`;
    document.getElementById('saldoDigital').innerText = `Rp ${totalDigital.toLocaleString('id-ID')}`;
    document.getElementById('totalMasuk').innerText = `Rp ${inAll.toLocaleString('id-ID')}`;
    document.getElementById('totalKeluar').innerText = `Rp ${outAll.toLocaleString('id-ID')}`;

    updateChart(inAll, outAll);
}

function updateChart(inA, outA) {
    const ctx = document.getElementById('myChart')?.getContext('2d');
    if (!ctx) return;
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Masuk', 'Keluar'],
            datasets: [{
                data: [inA || 1, outA || 0],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0, cutout: '75%'
            }]
        },
        options: { plugins: { legend: { display: false } }, maintainAspectRatio: false }
    });
}

function hapusData(id) {
    dataFinance = dataFinance.filter(i => i.id !== id);
    saveAndUpdate();
}

window.onload = () => { setTimeout(updateUI, 300); };
