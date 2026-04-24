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
        tanggal: new Date().toISOString()
    };

    dataFinance.push(dataBaru);
    saveData();
    
    document.getElementById('keterangan').value = "";
    document.getElementById('nominal').value = "";
    updateUI();
}

function saveData() {
    localStorage.setItem('hkr_data_v2', JSON.stringify(dataFinance));
}

function updateUI() {
    const filter = document.getElementById('filterWaktu').value;
    const sekarang = new Date();
    
    const dataFilter = dataFinance.filter(item => {
        const tgl = new Date(item.tanggal);
        if (filter === 'bulan') return tgl.getMonth() === sekarang.getMonth() && tgl.getFullYear() === sekarang.getFullYear();
        if (filter === 'tahun') return tgl.getFullYear() === sekarang.getFullYear();
        return true;
    });

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
                <p style="font-weight:600">${item.keterangan}</p>
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
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Masuk', 'Keluar'],
            datasets: [{
                data: [masuk, keluar],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0, cutout: '70%'
            }]
        },
        options: { plugins: { legend: { display: false } }, maintainAspectRatio: false }
    });
}

function hapusData(id) {
    if(confirm("Hapus data ini?")) {
        dataFinance = dataFinance.filter(i => i.id !== id);
        saveData();
        updateUI();
    }
}

// FUNGSI BACKUP (Export ke File JSON)
function exportData() {
    const dataStr = JSON.stringify(dataFinance);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'backup_keuangan_hkr.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// FUNGSI RESTORE (Muat dari File JSON)
function importData(event) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (Array.isArray(importedData)) {
                dataFinance = importedData;
                saveData();
                updateUI();
                alert("Data berhasil dipulihkan!");
            }
        } catch (err) {
            alert("File tidak valid!");
        }
    };
    reader.readAsText(event.target.files[0]);
}

window.onload = function() { setTimeout(updateUI, 500); };
