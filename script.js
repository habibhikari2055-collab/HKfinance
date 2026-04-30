// Gunakan nama storage yang berbeda agar benar-benar fresh
const DATA_KEY = 'hkr_v10_final_data';
const PLAN_KEY = 'hkr_v10_final_plans';

let dataFinance = JSON.parse(localStorage.getItem(DATA_KEY)) || [];
let vaultPlans = JSON.parse(localStorage.getItem(PLAN_KEY)) || [];

// Fungsi Create Plan - Tambahkan console.log untuk cek di inspect element
function createVaultPlan() {
    console.log("Tombol diklik!"); // Cek apakah ini muncul di console kanan saat diklik
    
    const namaInput = document.getElementById('inputNamaGoal');
    const targetInput = document.getElementById('inputTargetNominal');
    
    if (!namaInput || !targetInput) {
        console.error("Elemen input tidak ditemukan!");
        return;
    }

    const nama = namaInput.value.trim();
    const target = parseInt(targetInput.value);

    if (nama === "" || isNaN(target) || target <= 0) {
        alert("Harap isi Nama Target dan Nominal Target dengan benar!");
        return;
    }

    const newPlan = {
        id: Date.now(),
        nama: nama,
        target: target
    };

    vaultPlans.push(newPlan);
    localStorage.setItem(PLAN_KEY, JSON.stringify(vaultPlans));
    
    // Reset Input
    namaInput.value = "";
    targetInput.value = "";
    
    console.log("Plan baru berhasil disimpan:", newPlan);
    updateUI();
}

function updateUI() {
    console.log("Mengupdate tampilan...");
    const container = document.getElementById('vaultPlansContainer');
    const selectPlan = document.getElementById('pilihPlan');
    
    if(!container) return;
    
    container.innerHTML = "";
    if(selectPlan) selectPlan.innerHTML = "<option value=''>Pilih Target...</option>";

    // Render Kartu Plan
    vaultPlans.forEach(plan => {
        let saldoPlan = 0;
        let historyHTML = "";
        
        // Filter transaksi yang masuk ke plan ini
        dataFinance.filter(d => d.planId === plan.id).forEach(d => {
            let isOut = d.isWithdraw;
            saldoPlan += isOut ? -d.nominal : d.nominal;
            historyHTML += `
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1); padding:5px 0;">
                    <span>${isOut ? 'Keluar' : 'Masuk'}</span>
                    <span>Rp ${d.nominal.toLocaleString()}</span>
                </div>`;
        });

        let persen = Math.min((saldoPlan / plan.target) * 100, 100);
        
        // Membuat Card HTML
        const card = document.createElement('div');
        card.className = "premium-card gold-variant";
        card.style.marginBottom = "15px";
        card.style.cursor = "pointer";
        card.onclick = () => {
            const hist = document.getElementById(`history-${plan.id}`);
            hist.style.display = hist.style.display === 'none' ? 'block' : 'none';
        };

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center">
                <p class="card-label" style="margin:0">${plan.nama}</p>
                <span style="font-size:12px; font-weight:800">${Math.floor(persen)}%</span>
            </div>
            <h1 style="font-size:1.8rem; margin:10px 0">Rp ${saldoPlan.toLocaleString()}</h1>
            <div class="progress-track" style="background:rgba(0,0,0,0.2); height:8px; border-radius:10px; overflow:hidden">
                <div style="width:${persen}%; background:#fff; height:100%; transition:0.5s"></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px">
                <p style="font-size:10px; opacity:0.8">Target: Rp ${plan.target.toLocaleString()}</p>
                <button onclick="event.stopPropagation(); deletePlan(${plan.id})" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:5px; font-size:10px; font-weight:800; cursor:pointer">HAPUS</button>
            </div>
            <div id="history-${plan.id}" style="display:none; background:rgba(0,0,0,0.1); border-radius:10px; padding:10px; margin-top:10px; font-size:11px">
                ${historyHTML || 'Belum ada riwayat'}
            </div>
        `;
        container.appendChild(card);
        
        if(selectPlan) {
            const opt = document.createElement('option');
            opt.value = plan.id;
            opt.innerText = plan.nama;
            selectPlan.appendChild(opt);
        }
    });

    // Handle tampilan area nabung
    const areaNabung = document.getElementById('areaNabungVault');
    if(areaNabung) areaNabung.style.display = vaultPlans.length > 0 ? 'block' : 'none';

    // Update Saldo Lainnya (Cash & Digital)
    let cash = 0, digital = 0;
    dataFinance.forEach(d => {
        let m = d.tipe === 'masuk' ? 1 : -1;
        if(d.sumber === 'cash') cash += (d.nominal * m);
        if(d.sumber === 'digital') digital += (d.nominal * m);
    });

    if(document.getElementById('saldoAktif')) document.getElementById('saldoAktif').innerText = `Rp ${(cash + digital).toLocaleString()}`;
}

function deletePlan(id) {
    if(confirm("Hapus plan ini?")) {
        vaultPlans = vaultPlans.filter(p => p.id !== id);
        dataFinance = dataFinance.filter(d => d.planId !== id);
        localStorage.setItem(PLAN_KEY, JSON.stringify(vaultPlans));
        localStorage.setItem(DATA_KEY, JSON.stringify(dataFinance));
        updateUI();
    }
}

// Inisialisasi saat web dibuka
window.onload = updateUI;
