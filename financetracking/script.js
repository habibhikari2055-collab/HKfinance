let dataKeuangan = JSON.parse(localStorage.getItem('financeHKR_Final')) || [];

// HANDLE BACKGROUND
function handleImage(input) {
    const reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('appCard').style.backgroundImage = `url(${e.target.result})`;
        localStorage.setItem('hkrBg_Final', e.target.result);
    }
    reader.readAsDataURL(input.files[0]);
}

function resetBg() {
    if(confirm("Hapus foto latar belakang?")) {
        localStorage.removeItem('hkrBg_Final');
        document.getElementById('appCard').style.backgroundImage = 'none';
    }
}

if(localStorage.getItem('hkrBg_Final')) {
    document.getElementById('appCard').style.backgroundImage = `url(${localStorage.getItem('hkrBg_Final')})`;
}

// NAVIGATION
function switchView(view) {
    const harian = document.getElementById('view-harian');
    const ringkasan = document.getElementById('view-ringkasan');
    const btns = document.querySelectorAll('.tab-btn');

    if (view === 'harian') {
        harian.style.display = 'block';
        ringkasan.style.display = 'none';
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        harian.style.display = 'none';
        ringkasan.style.display = 'block';
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
        hitungLaporan();
    }
}

// LOGIKA DATA
function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = document.getElementById('nominal').value;
    const tipe = document.getElementById('tipe').value;

    if (!ket || !nom) return alert("Isi data transaksi!");

    const sekarang = new Date();
    const transaksi = {
        id: Date.now(),
        ts: sekarang.getTime(),
        ket,
        nom: parseInt(nom),
        tgl: sekarang.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        jam: sekarang.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        tipe
    };

    dataKeuangan.unshift(transaksi);
    save();
    document.getElementById('keterangan').value = '';
    document.getElementById('nominal').value = '';
}

function hapusData(id) {
    if(confirm("Hapus catatan ini?")) {
        dataKeuangan = dataKeuangan.filter(t => t.id !== id);
        save();
    }
}

function save() {
    localStorage.setItem('financeHKR_Final', JSON.stringify(dataKeuangan));
    render();
}

function render() {
    const list = document.getElementById('daftar');
    let masuk = 0, keluar = 0;

    list.innerHTML = '';
    dataKeuangan.forEach(t => {
        const isM = t.tipe === 'masuk';
        list.innerHTML += `
            <li class="item-list" style="border-left: 4px solid ${isM ? 'var(--in)' : 'var(--out)'}">
                <div class="item-info">
                    <strong>${t.ket}</strong>
                    <small>${t.tgl} • ${t.jam}</small>
                </div>
                <div style="display:flex; align-items:center; gap:12px">
                    <span class="${isM ? 'txt-in' : 'txt-out'}" style="font-weight:700">
                        ${isM ? '+' : '-'} ${t.nom.toLocaleString()}
                    </span>
                    <button class="btn-del" onclick="hapusData(${t.id})">×</button>
                </div>
            </li>`;
        if (isM) masuk += t.nom; else keluar += t.nom;
    });

    document.getElementById('totalMasuk').innerText = `Rp ${masuk.toLocaleString()}`;
    document.getElementById('totalKeluar').innerText = `Rp ${keluar.toLocaleString()}`;
    document.getElementById('saldoTotal').innerText = `Rp ${(masuk - keluar).toLocaleString()}`;
}

// LOGIKA LAPORAN
function hitungLaporan() {
    const now = new Date();
    let mBulan = 0, kBulan = 0, mTahun = 0, kTahun = 0;

    dataKeuangan.forEach(t => {
        const d = new Date(t.ts);
        if (d.getFullYear() === now.getFullYear()) {
            if (t.tipe === 'masuk') mTahun += t.nom; else kTahun += t.nom;
            if (d.getMonth() === now.getMonth()) {
                if (t.tipe === 'masuk') mBulan += t.nom; else kBulan += t.nom;
            }
        }
    });

    const box = (m, k) => `
        <div style="background:var(--glass); padding:15px; border-radius:18px; margin-top:10px">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:14px">
                <span style="opacity:0.6">Pemasukan</span><span class="txt-in">Rp ${m.toLocaleString()}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px">
                <span style="opacity:0.6">Pengeluaran</span><span class="txt-out">Rp ${k.toLocaleString()}</span>
            </div>
            <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:10px; display:flex; justify-content:space-between; font-weight:bold">
                <span>Tabungan</span><span>Rp ${(m-k).toLocaleString()}</span>
            </div>
        </div>`;

    document.getElementById('bulanIni').innerHTML = box(mBulan, kBulan);
    document.getElementById('tahunIni').innerHTML = box(mTahun, kTahun);
}

render();
// FUNGSI UNTUK MENGUNDUH BACKUP DATA
function exportData() {
    // Cek apakah ada data atau tidak
    if (dataKeuangan.length === 0) {
        alert("Belum ada data transaksi yang bisa di-backup.");
        return;
    }

    // Konfirmasi kepada pengguna
    if (confirm("Ingin mengunduh backup data keuangan Anda?")) {
        // Mengubah data (Array) menjadi teks format JSON
        const dataStr = JSON.stringify(dataKeuangan, null, 2);
        
        // Membuat objek file sementara di memori browser
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        // Membuat elemen link tersembunyi untuk memicu download
        const link = document.createElement("a");
        link.href = url;
        
        // Memberi nama file dengan tanggal saat ini agar rapi
        const tglSekarang = new Date().toISOString().split('T')[0];
        link.download = `HKR_Backup_${tglSekarang}.json`;
        
        // Jalankan perintah download
        document.body.appendChild(link);
        link.click();
        
        // Bersihkan kembali elemen setelah selesai
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert("Backup berhasil! Simpan file .json ini dengan baik.");
    }
}