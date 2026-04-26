let dataFinance = JSON.parse(localStorage.getItem('hkr_v7_data')) || [];
let myChart = null;
let chartMode = 'line';

function switchTab(tab) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + tab).classList.add('active');
    event.currentTarget.classList.add('active');
    updateUI();
}

function setChart(mode) {
    chartMode = mode;
    document.querySelectorAll('.chart-controls span').forEach(s => s.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    updateUI();
}

function tambahData() {
    const ket = document.getElementById('keterangan').value;
    const nom = document.getElementById('nominal').value;
    if (!ket || !nom) return;
    dataFinance.push({
        id: Date.now(),
        keterangan: ket,
        nominal: parseInt(nom),
        tipe: document.getElementById('tipe').value,
        sumber: document.getElementById('sumber').value,
        tanggal: new Date().toISOString()
    });
    save();
    document.getElementById('keterangan').value = "";
    document.getElementById('nominal').value = "";
}

function prosesTopUp() {
    const nom = parseInt(document.getElementById('nominalTopUp').value);
    if (!nom) return;
    dataFinance.push({ id: Date.now(), keterangan: "Top Up (Out Cash)", nominal: nom, tipe: 'keluar', sumber: 'cash', tanggal: new Date().toISOString() });
    dataFinance.push({ id: Date.now()+1, keterangan: "Top Up (In Digital)", nominal: nom, tipe: 'masuk', sumber: 'digital', tanggal: new Date().toISOString() });
    save();
    document.getElementById('nominalTopUp').value = "";
    alert("Top Up Berhasil!");
    switchTab('harian');
}

function prosesTabungan(aksi) {
    const nom = parseInt(document.getElementById('nominalNabung').value);
    if (!nom) return;
    if (aksi === 'masuk') {
        dataFinance.push({ id: Date.now(), keterangan: "Menabung (Out Cash)", nominal: nom, tipe: 'keluar', sumber: 'cash', tanggal: new Date().toISOString() });
        dataFinance.push({ id: Date.now()+1, keterangan: "Simpanan Masuk", nominal: nom, tipe: 'masuk', sumber: 'tabungan', tanggal: new Date().toISOString() });
    } else {
        dataFinance.push({ id: Date.now(), keterangan: "Tarik Tabungan", nominal: nom, tipe: 'keluar', sumber: 'tabungan', tanggal: new Date().toISOString() });
        dataFinance.push({ id: Date.now()+1, keterangan: "Tarik (In Cash)", nominal: nom, tipe: 'masuk', sumber: 'cash', tanggal: new Date().toISOString() });
    }
    save();
    document.getElementById('nominalNabung').value = "";
    alert(aksi === 'masuk' ? "Berhasil Menabung!" : "Saldo Tabungan ditarik!");
}

function save() {
    localStorage.setItem('hkr_v7_data', JSON.stringify(dataFinance));
    updateUI();
}

function updateUI() {
    let cash = 0, digital = 0, savings = 0, inMon = 0, outMon = 0;
    const dMain = document.getElementById('daftar');
    const dSave = document.getElementById('daftarNabung');
    const dWallet = document.getElementById('daftarTopUp');

    [dMain, dSave, dWallet].forEach(d => { if(d) d.innerHTML = ""; });

    dataFinance.slice().reverse().forEach(item => {
        let m = (item.tipe === 'masuk' ? 1 : -1);
        if (item.sumber === 'cash') cash += (item.nominal * m);
        else if (item.sumber === 'digital') digital += (item.nominal * m);
        else if (item.sumber === 'tabungan') savings += (item.nominal * m);

        const li = document.createElement('li');
        li.className = 'item';
        li.innerHTML = `
            <div>
                <h4>${item.keterangan}</h4>
                <span class="badge ${item.sumber==='cash'?'bg-cash':(item.sumber==='digital'?'bg-digital':'bg-cash')}">${item.sumber}</span>
                <span class="badge ${item.tipe==='masuk'?'bg-in':'bg-out'}">${item.tipe}</span>
            </div>
            <div style="text-align:right">
                <p style="color:${item.tipe==='masuk'?'#10b981':'#ef4444'}">${item.tipe==='masuk'?'+':'-'} ${item.nominal.toLocaleString()}</p>
                <button class="btn-del" onclick="hapus(${item.id})">x</button>
            </div>`;

        if (item.sumber === 'tabungan') { if(dSave) dSave.appendChild(li); }
        else {
            if(dMain) dMain.appendChild(li);
            if(item.keterangan.includes("Top Up") && dWallet) dWallet.appendChild(li.cloneNode(true));
            if (new Date(item.tanggal).getMonth() === new Date().getMonth()) {
                if (item.tipe === 'masuk') inMon += item.nominal; else outMon += item.nominal;
            }
        }
    });

    document.getElementById('saldoAktif').innerText = `Rp ${(cash + digital).toLocaleString('id-ID')}`;
    document.getElementById('saldoCash').innerText = `Rp ${cash.toLocaleString()}`;
    document.getElementById('saldoDigital').innerText = `Rp ${digital.toLocaleString()}`;
    if(document.getElementById('saldoTabungan')) document.getElementById('saldoTabungan').innerText = `Rp ${savings.toLocaleString()}`;

    renderChart(inMon, outMon);
}

function renderChart(i, o) {
    const ctx = document.getElementById('myChart')?.getContext('2d');
    if (!ctx) return;
    if (myChart) myChart.destroy();
    let dataArr = chartMode === 'doughnut' ? [i || 1, o || 0] : [i*0.2, i*0.8, o*0.5, i-o];
    myChart = new Chart(ctx, {
        type: chartMode,
        data: {
            labels: chartMode === 'doughnut' ? ['In', 'Out'] : ['W1','W2','W3','W4'],
            datasets: [{
                data: dataArr,
                backgroundColor: chartMode === 'doughnut' ? ['#10b981', '#ef4444'] : 'rgba(139, 92, 246, 0.2)',
                borderColor: '#8b5cf6', borderWidth: 2, tension: 0.4, fill: true, cutout: '80%'
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { display: chartMode==='bar' } }, maintainAspectRatio: false }
    });
}

function hapus(id) { dataFinance = dataFinance.filter(x => x.id !== id); save(); }

window.onload = () => { setTimeout(updateUI, 300); };
