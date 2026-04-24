let dataFinance = JSON.parse(localStorage.getItem('hkr_data')) || [];

function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = document.getElementById('nominal').value;
    const tipe = document.getElementById('tipe').value;

    if (!ket || !nom) return alert("Mohon isi semua data!");

    const dataBaru = {
        id: Date.now(),
        keterangan: ket,
        nominal: parseInt(nom),
        tipe: tipe,
        tanggal: new Date().toLocaleDateString('id-ID')
    };

    dataFinance.push(dataBaru);
    saveAndRender();
    
    document.getElementById('keterangan').value = "";
    document.getElementById('nominal').value = "";
}

function hapusData(id) {
    if(confirm("Hapus catatan ini?")) {
        dataFinance = dataFinance.filter(item => item.id !== id);
        saveAndRender();
    }
}

function saveAndRender() {
    localStorage.setItem('hkr_data', JSON.stringify(dataFinance));
    updateUI();
}

function updateUI() {
    const daftar = document.getElementById('daftar');
    daftar.innerHTML = "";
    
    let inTotal = 0;
    let outTotal = 0;

    dataFinance.reverse().forEach(item => {
        if (item.tipe === 'masuk') inTotal += item.nominal;
        else outTotal += item.nominal;

        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
            <div>
                <p style="font-weight:600">${item.keterangan}</p>
                <small style="color:#94a3b8">${item.tanggal}</small>
            </div>
            <div style="text-align:right">
                <p style="color: ${item.tipe === 'masuk' ? '#10b981' : '#ef4444'}; font-weight:bold">
                    ${item.tipe === 'masuk' ? '+' : '-'} ${item.nominal.toLocaleString('id-ID')}
                </p>
                <button class="btn-del" onclick="hapusData(${item.id})">Hapus</button>
            </div>
        `;
        daftar.appendChild(li);
    });
    // Balikkan lagi agar urutan push data selanjutnya tetap benar
    dataFinance.reverse();

    document.getElementById('saldoTotal').innerText = `Rp ${(inTotal - outTotal).toLocaleString('id-ID')}`;
    document.getElementById('totalMasuk').innerText = `Rp ${inTotal.toLocaleString('id-ID')}`;
    document.getElementById('totalKeluar').innerText = `Rp ${outTotal.toLocaleString('id-ID')}`;
}

updateUI();
