let dataFinance = JSON.parse(localStorage.getItem('hkr_data')) || [];

function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = document.getElementById('nominal').value;
    const tipe = document.getElementById('tipe').value;

    if (!ket || !nom) return alert("Isi dulu keterangannya!");

    const dataBaru = {
        id: Date.now(),
        keterangan: ket,
        nominal: parseInt(nom),
        tipe: tipe,
        tanggal: new Date().toLocaleDateString()
    };

    dataFinance.push(dataBaru);
    updateUI();
    saveData();
    
    // Reset Input
    document.getElementById('keterangan').value = "";
    document.getElementById('nominal').value = "";
}

function hapusData(id) {
    dataFinance = dataFinance.filter(item => item.id !== id);
    updateUI();
    saveData();
}

function updateUI() {
    const daftar = document.getElementById('daftar');
    daftar.innerHTML = "";
    
    let totalMasuk = 0;
    let totalKeluar = 0;

    dataFinance.forEach(item => {
        if (item.tipe === 'masuk') totalMasuk += item.nominal;
        else totalKeluar += item.nominal;

        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
            <div>
                <p style="font-weight:bold">${item.keterangan}</p>
                <small style="color:#64748b">${item.tanggal}</small>
            </div>
            <div style="text-align:right">
                <p class="${item.tipe === 'masuk' ? 'txt-in' : 'txt-out'}">
                    ${item.tipe === 'masuk' ? '+' : '-'} Rp ${item.nominal.toLocaleString()}
                </p>
                <button class="btn-del" onclick="hapusData(${item.id})">Hapus</button>
            </div>
        `;
        daftar.appendChild(li);
    });

    const saldo = totalMasuk - totalKeluar;
    document.getElementById('saldoTotal').innerText = `Rp ${saldo.toLocaleString()}`;
    document.getElementById('totalMasuk').innerText = `Rp ${totalMasuk.toLocaleString()}`;
    document.getElementById('totalKeluar').innerText = `Rp ${totalKeluar.toLocaleString()}`;
}

function saveData() {
    localStorage.setItem('hkr_data', JSON.stringify(dataFinance));
}

// Jalankan UI saat pertama buka
updateUI();
