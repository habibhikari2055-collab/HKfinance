let dataFinance = JSON.parse(localStorage.getItem('hkr_data_v2')) || [];
let myChart = null;

function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = document.getElementById('nominal').value;
    const tipe = document.getElementById('tipe').value;

    if (!ket || !nom) return alert("Isi data dulu!");

    const dataBaru = {
        id: Date.now(),
        keterangan: ket,
        nominal: parseInt(nom),
        tipe: tipe,
        tanggal: new Date().toISOString() // Simpan format standar agar mudah difilter
    };

    dataFinance.push(dataBaru);
    localStorage.setItem('hkr_data_v2', JSON.stringify(dataFinance));
    
    document.getElementById('keterangan').value = "";
    document.getElementById('nominal').value = "";
    updateUI();
}

function hapusData(id) {
    if(confirm("Hapus data ini?")) {
        dataFinance = dataFinance.filter(i => i.id !== id);
        localStorage.setItem('hkr_data_v2', JSON.stringify(dataFinance));
        updateUI();
    }
}

function updateUI() {
    const filter = document.getElementById('filterWaktu').value;
    const sekarang = new Date();
    
    // Logika Filter
    const dataFilter = dataFinance.filter(item => {
        const tgl = new Date(item.tanggal);
        if (filter === 'bulan') {
            return tgl.getMonth() === sekarang.getMonth() && tgl.getFullYear() === sekarang.getFullYear();
        } else if (filter === 'tahun') {
            return tgl.getFullYear() === sekarang.getFullYear();
        }
        return true; // Semua
    });

    // Hitung Total
    let masuk = 0, keluar = 0;
    const daftar = document.getElementById('daftar');
    daftar.innerHTML = "";

    dataFilter.slice().reverse().forEach(item => {
        if (item.tipe === 'masuk') masuk += item.nominal;
        else keluar += item.nominal;

        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
            <div>
                <p>${item.keterangan}</p>
                <small style="color:#94a3b8">${new Date(item.tanggal).toLocaleDateString('id-ID')}</small>
            </div>
            <div style="text-align:right">
                <p class="${item.tipe === 'masuk' ? 'txt-in' : 'txt-out'}">
                    ${item.tipe === 'masuk' ? '+' : '-'} ${item.nominal.toLocaleString('id-ID')}
                </p>
                <button class="btn-del" onclick="hapusData(${item.id})">Hapus</button>
            </div>
        `;
        daftar.appendChild(li);
    });

    document.getElementById('saldoTotal').innerText = `Rp ${(masuk - keluar).toLocaleString('id-ID')}`;
    document.getElementById('totalMasuk').innerText = `Rp ${masuk.toLocaleString('id-ID')}`;
    document.getElementById('totalKeluar').innerText = `Rp ${keluar.toLocaleString('id-ID')}`;

    updateChart(masuk, keluar);
}

function updateChart(masuk, keluar) {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    if (myChart) myChart.destroy(); // Hapus chart lama sebelum buat baru

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Masuk', 'Keluar'],
            datasets: [{
                data: [masuk, keluar],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            maintainAspectRatio: false
        }
    });
}

// Jalankan Pertama Kali
updateUI();
