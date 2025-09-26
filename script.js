let examRecords = [];
let selectedExam = 'tyt';

// Sayfa yüklendiğinde
window.addEventListener('load', function() {
    loadExamRecords();
    displayExamRecords();
    updateQuickStats();
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('exam-date').value = today;
    
    setSelected('tyt');
});

function calculateNet(examType, subject, maxQuestions) {
    const dogruId = `${examType}-${subject}-dogru`;
    const yanlisId = `${examType}-${subject}-yanlis`;
    const netId = `${examType}-${subject}-net`;
    
    let dogru = parseInt(document.getElementById(dogruId).value) || 0;
    let yanlis = parseInt(document.getElementById(yanlisId).value) || 0;

    // Doğru + yanlış max soruyu geçemez
    if (dogru + yanlis > maxQuestions) {
        yanlis = Math.max(0, maxQuestions - dogru);
        document.getElementById(yanlisId).value = yanlis;
    }

    // Net hesaplama
    const net = Math.max(0, dogru - (yanlis / 4));
    document.getElementById(netId).textContent = net.toFixed(2);

    // Toplam net güncelle
    updateTotalNet(examType);
}

// Toplam net hesaplama
function updateTotalNet(examType) {
    if (examType === 'tyt') {
        const turkceNet = parseFloat(document.getElementById('tyt-turkce-net').textContent) || 0;
        const sosyalNet = parseFloat(document.getElementById('tyt-sosyal-net').textContent) || 0;
        const matNet = parseFloat(document.getElementById('tyt-mat-net').textContent) || 0;
        const fenNet = parseFloat(document.getElementById('tyt-fen-net').textContent) || 0;
        
        const totalNet = turkceNet + sosyalNet + matNet + fenNet;
        document.getElementById('tyt-total-net').textContent = totalNet.toFixed(2);
    } else {
        const matNet = parseFloat(document.getElementById('ayt-mat-net').textContent) || 0;
        const fizikNet = parseFloat(document.getElementById('ayt-fizik-net').textContent) || 0;
        const kimyaNet = parseFloat(document.getElementById('ayt-kimya-net').textContent) || 0;
        const biyoNet = parseFloat(document.getElementById('ayt-biyoloji-net').textContent) || 0;
        
        const totalNet = matNet + fizikNet + kimyaNet + biyoNet;
        document.getElementById('ayt-total-net').textContent = totalNet.toFixed(2);
    }
}

// Seçim değiştirme
function setSelected(type) {
    selectedExam = type;
    const btnTyt = document.getElementById('btn-tyt');
    const btnAyt = document.getElementById('btn-ayt');
    const secTyt = document.getElementById('section-tyt');
    const secAyt = document.getElementById('section-ayt');
    const saveBtn = document.getElementById('save-btn');

    if (type === 'tyt') {
        btnTyt.classList.add('active');
        btnAyt.classList.remove('active');
        secTyt.classList.remove('hidden');
        secAyt.classList.add('hidden');
        saveBtn.innerHTML = '💾 TYT Kaydet';
    } else {
        btnAyt.classList.add('active');
        btnTyt.classList.remove('active');
        secAyt.classList.remove('hidden');
        secTyt.classList.add('hidden');
        saveBtn.innerHTML = '💾 AYT Kaydet';
    }

    document.getElementById('error-container').innerHTML = '';
}

// Deneme kaydı ekleme
function addExamRecord() {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = '';

    const examDate = document.getElementById('exam-date').value;
    let errors = [];

    if (!examDate) {
        errors.push('Sınav tarihi seçilmeli');
    }

    let recordData = {
        id: Date.now(),
        date: examDate,
        examType: selectedExam,
        tyt: {
            turkce: { dogru: 0, yanlis: 0, net: 0 },
            sosyal: { dogru: 0, yanlis: 0, net: 0 },
            matematik: { dogru: 0, yanlis: 0, net: 0 },
            fen: { dogru: 0, yanlis: 0, net: 0 },
            toplam: 0
        },
        ayt: {
            matematik: { dogru: 0, yanlis: 0, net: 0 },
            fizik: { dogru: 0, yanlis: 0, net: 0 },
            kimya: { dogru: 0, yanlis: 0, net: 0 },
            biyoloji: { dogru: 0, yanlis: 0, net: 0 },
            toplam: 0
        }
    };

    if (selectedExam === 'tyt') {
    const subjects = ['turkce', 'sosyal', 'mat', 'fen'];
    let totalNet = 0;
    let hasData = false;

    subjects.forEach(subject => {
        const dogru = parseInt(document.getElementById(`tyt-${subject}-dogru`).value) || 0;
        const yanlis = parseInt(document.getElementById(`tyt-${subject}-yanlis`).value) || 0;
        const maxQ = subject === 'turkce' ? 40 : subject === 'sosyal' ? 20 : subject === 'mat' ? 40 : 20; // örnek max soru
        const net = Math.max(0, dogru - (yanlis / 4));

        const key = subject === 'mat' ? 'matematik' : subject;
        recordData.tyt[key] = { dogru, yanlis, net };
        totalNet += net;

        if (dogru > 0 || yanlis > 0) hasData = true;
    });

    recordData.tyt.toplam = totalNet;

    if (!hasData) errors.push('TYT için en az bir alanda veri girmelisiniz');
} else {
    const subjects = ['mat', 'fizik', 'kimya', 'biyoloji'];
    let totalNet = 0;
    let hasData = false;

    subjects.forEach(subject => {
        const dogru = parseInt(document.getElementById(`ayt-${subject}-dogru`).value) || 0;
        const yanlis = parseInt(document.getElementById(`ayt-${subject}-yanlis`).value) || 0;
        const maxQ = subject === 'mat' ? 40 : 14; // örnek max soru
        const net = Math.max(0, dogru - (yanlis / 4));

        const key = subject === 'mat' ? 'matematik' : subject;
        recordData.ayt[key] = { dogru, yanlis, net };
        totalNet += net;

        if (dogru > 0 || yanlis > 0) hasData = true;
    });

    recordData.ayt.toplam = totalNet;

    if (!hasData) errors.push('AYT için en az bir alanda veri girmelisiniz');
}


    if (errors.length > 0) {
        errorContainer.innerHTML = '<div class="error-message">' + errors.join('<br>') + '</div>';
        return;
    }

    // Kayıt ekle
    examRecords.push(recordData);
    examRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

    saveExamRecords();
    displayExamRecords();
    updateQuickStats();
    clearForm(selectedExam);
    showSuccessMessage();
}

// Form temizleme
function clearForm(type) {
    if (type === 'tyt') {
        ['turkce', 'sosyal', 'mat', 'fen'].forEach(subject => {
            document.getElementById(`tyt-${subject}-dogru`).value = '';
            document.getElementById(`tyt-${subject}-yanlis`).value = '';
            document.getElementById(`tyt-${subject}-net`).textContent = '0';
        });
        document.getElementById('tyt-total-net').textContent = '0';
    } else {
        ['mat', 'fizik', 'kimya', 'biyoloji'].forEach(subject => {
            document.getElementById(`ayt-${subject}-dogru`).value = '';
            document.getElementById(`ayt-${subject}-yanlis`).value = '';
            document.getElementById(`ayt-${subject}-net`).textContent = '0';
        });
        document.getElementById('ayt-total-net').textContent = '0';
    }
}

// Başarı mesajı
function showSuccessMessage() {
    const errorContainer = document.getElementById('error-container');
    errorContainer.innerHTML = '<div class="success-message">✅ Deneme kaydı başarıyla eklendi!</div>';
    setTimeout(() => {
        errorContainer.innerHTML = '';
    }, 3000);
}

// Kayıtları görüntüleme
function displayExamRecords() {
    const container = document.getElementById('exam-results');
    if (examRecords.length === 0) {
        container.innerHTML = '<div class="empty-state">Kayıtlı deneme bulunamadı. Yukarıdaki formu kullanarak ilk deneme kaydınızı ekleyin.</div>';
        return;
    }

    let html = '';
    examRecords.forEach(record => {
        const formattedDate = new Date(record.date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const typeLabel = record.examType === 'tyt' ? 'TYT' : 'AYT';
        const typeColor = record.examType === 'tyt' ? '#5a67d8' : '#ed8936';

        html += `
        <div class="exam-record">
            <h3 style="color: ${typeColor};">📅 ${formattedDate} — ${typeLabel} Kaydı</h3>
            <div class="exam-details">`;

        if (record.examType === 'tyt') {
            // TYT kaydı ise sadece TYT bilgilerini göster
            html += `
                <div class="detail-item" style="background:#ebf8ff; padding:10px; border-radius:8px; margin:5px 0;">
                    <strong style="color:#2b6cb0;">📊 TYT Toplam:</strong> <span style="font-size:1.2em; color:#1a365d;">${record.tyt.toplam.toFixed(2)}/120 net</span>
                </div>
                <div class="detail-item">
                    <strong>📚 Türkçe:</strong> ${record.tyt.turkce.net.toFixed(2)} net (Doğru:${record.tyt.turkce.dogru} Yanlış:${record.tyt.turkce.yanlis})
                </div>
                <div class="detail-item">
                    <strong>🌍 Sosyal:</strong> ${record.tyt.sosyal.net.toFixed(2)} net (Doğru:${record.tyt.sosyal.dogru} Yanlış:${record.tyt.sosyal.yanlis})
                </div>
                <div class="detail-item">
                    <strong>🔢 Matematik:</strong> ${record.tyt.matematik.net.toFixed(2)} net (Doğru:${record.tyt.matematik.dogru} Yanlış:${record.tyt.matematik.yanlis})
                </div>
                <div class="detail-item">
                    <strong>🔬 Fen:</strong> ${record.tyt.fen.net.toFixed(2)} net (Doğru:${record.tyt.fen.dogru} Yanlış:${record.tyt.fen.yanlis})
                </div>`;
        } else {
            // AYT kaydı ise sadece AYT bilgilerini göster
            html += `
                <div class="detail-item" style="background:#fef5e7; padding:10px; border-radius:8px; margin:5px 0;">
                    <strong style="color:#c05621;">📊 AYT Toplam:</strong> <span style="font-size:1.2em; color:#7b341e;">${record.ayt.toplam.toFixed(2)}/80 net</span>
                </div>
                <div class="detail-item">
                    <strong>🔢 Matematik:</strong> ${record.ayt.matematik.net.toFixed(2)} net (Doğru:${record.ayt.matematik.dogru} Yanlış:${record.ayt.matematik.yanlis})
                </div>
                <div class="detail-item">
                    <strong>⚡ Fizik:</strong> ${record.ayt.fizik.net.toFixed(2)} net (Doğru:${record.ayt.fizik.dogru} Yanlış:${record.ayt.fizik.yanlis})
                </div>
                <div class="detail-item">
                    <strong>🧪 Kimya:</strong> ${record.ayt.kimya.net.toFixed(2)} net (Doğru:${record.ayt.kimya.dogru} Yanlış:${record.ayt.kimya.yanlis})
                </div>
                <div class="detail-item">
                    <strong>🧬 Biyoloji:</strong> ${record.ayt.biyoloji.net.toFixed(2)} net (Doğru:${record.ayt.biyoloji.dogru} Yanlış:${record.ayt.biyoloji.yanlis})
                </div>`;
        }

        html += `
            </div>
            <button onclick="deleteRecord(${record.id})" class="delete-btn">🗑️ Sil</button>
        </div>`;
    });
    container.innerHTML = html;
}

// Hızlı istatistikler
function updateQuickStats() {
    const container = document.getElementById('quick-stats');
    if (examRecords.length === 0) {
        container.innerHTML = '<div class="empty-state">Henüz deneme kaydı bulunmuyor. İlk deneme kaydınızı ekleyin!</div>';
        return;
    }

    const totalExams = examRecords.length;
    const tytRecords = examRecords.filter(r => r.examType === 'tyt');
    const aytRecords = examRecords.filter(r => r.examType === 'ayt');

    const avgTyt = tytRecords.length > 0 ? 
        (tytRecords.reduce((sum, record) => sum + record.tyt.toplam, 0) / tytRecords.length).toFixed(1) : '0.0';
    const avgAyt = aytRecords.length > 0 ? 
        (aytRecords.reduce((sum, record) => sum + record.ayt.toplam, 0) / aytRecords.length).toFixed(1) : '0.0';

    const bestTyt = tytRecords.length > 0 ? 
        tytRecords.reduce((best, current) => current.tyt.toplam > best.tyt.toplam ? current : best) : null;
    const bestAyt = aytRecords.length > 0 ? 
        aytRecords.reduce((best, current) => current.ayt.toplam > best.ayt.toplam ? current : best) : null;

    container.innerHTML = `
    <div style="display:grid; gap:15px;">
        <div style="background:#e6fffa; padding:15px; border-radius:12px; border-left:4px solid #38b2ac;">
            <div style="font-size:0.9rem; color:#2c7a7b; margin-bottom:5px;">Toplam Deneme Sayısı</div>
            <div style="font-size:1.6rem; font-weight:bold; color:#2d3748;">${totalExams}</div>
            <div style="font-size:0.8rem; color:#4a5568; margin-top:5px;">TYT: ${tytRecords.length} | AYT: ${aytRecords.length}</div>
        </div>
        <div style="background:#ebf8ff; padding:15px; border-radius:12px; border-left:4px solid #4299e1;">
            <div style="font-size:0.9rem; color:#2b6cb0; margin-bottom:5px;">TYT Ortalama</div>
            <div style="font-size:1.6rem; font-weight:bold; color:#2d3748;">${avgTyt}/120</div>
        </div>
        <div style="background:#fef5e7; padding:15px; border-radius:12px; border-left:4px solid #ed8936;">
            <div style="font-size:0.9rem; color:#c05621; margin-bottom:5px;">AYT Ortalama</div>
            <div style="font-size:1.6rem; font-weight:bold; color:#2d3748;">${avgAyt}/80</div>
        </div>
        ${bestTyt ? `
        <div style="background:#f0fff4; padding:15px; border-radius:12px; border-left:4px solid #48bb78;">
            <div style="font-size:0.9rem; color:#2f855a; margin-bottom:5px;">En İyi TYT</div>
            <div style="font-size:1.6rem; font-weight:bold; color:#2d3748;">${bestTyt.tyt.toplam.toFixed(2)}/120</div>
            <div style="font-size:0.8rem; color:#718096;">${new Date(bestTyt.date).toLocaleDateString('tr-TR')}</div>
        </div>` : ''}
        ${bestAyt ? `
        <div style="background:#faf5ff; padding:15px; border-radius:12px; border-left:4px solid #9f7aea;">
            <div style="font-size:0.9rem; color:#553c9a; margin-bottom:5px;">En İyi AYT</div>
            <div style="font-size:1.6rem; font-weight:bold; color:#2d3748;">${bestAyt.ayt.toplam.toFixed(2)}/80</div>
            <div style="font-size:0.8rem; color:#718096;">${new Date(bestAyt.date).toLocaleDateString('tr-TR')}</div>
        </div>` : ''}
    </div>`;
}

// Kayıt silme
function deleteRecord(id) {
    if (confirm('Bu deneme kaydını silmek istediğinizden emin misiniz?')) {
        examRecords = examRecords.filter(record => record.id !== id);
        saveExamRecords();
        displayExamRecords();
        updateQuickStats();
    }
}

// Geliştirilmiş kayıt saklama fonksiyonu
function saveExamRecords() {
    try {
        // localStorage kontrolü
        if (typeof Storage === "undefined") {
            console.warn('LocalStorage desteklenmiyor!');
            return false;
        }
        
        // Veriyi kaydet
        const dataString = JSON.stringify(examRecords);
        localStorage.setItem('examRecords', dataString);
        
        // Kayıt doğrulaması
        const saved = localStorage.getItem('examRecords');
        if (saved === dataString) {
            console.log('✅ Kayıtlar başarıyla güncellendi:', examRecords.length, 'kayıt');
            return true;
        } else {
            console.error('❌ Kayıt doğrulaması başarısız!');
            return false;
        }
        
    } catch (e) {
        console.error('❌ Kayıt hatası:', e.message);
        
        // Alternatif kayıt yöntemi - cookie kullan
        try {
            const dataString = JSON.stringify(examRecords);
            document.cookie = `examRecords=${encodeURIComponent(dataString)}; expires=${new Date(Date.now() + 365*24*60*60*1000).toUTCString()}; path=/`;
            console.log('📝 Cookie ile kayıt denendi');
            return true;
        } catch (cookieError) {
            console.error('❌ Cookie kayıt hatası:', cookieError.message);
            return false;
        }
    }
}

// Geliştirilmiş kayıt yükleme fonksiyonu
function loadExamRecords() {
    try {
        // localStorage kontrolü
        if (typeof Storage !== "undefined") {
            const storedRecords = localStorage.getItem('examRecords');
            if (storedRecords) {
                examRecords = JSON.parse(storedRecords);
                console.log('✅ LocalStorage\'dan kayıtlar yüklendi:', examRecords.length, 'kayıt');
                return;
            }
        }
        
        // Alternatif - cookie\'den yükle
        const cookies = document.cookie.split(';');
        const examRecordsCookie = cookies.find(cookie => 
            cookie.trim().startsWith('examRecords=')
        );
        
        if (examRecordsCookie) {
            const cookieValue = examRecordsCookie.split('=')[1];
            examRecords = JSON.parse(decodeURIComponent(cookieValue));
            console.log('📝 Cookie\'den kayıtlar yüklendi:', examRecords.length, 'kayıt');
            return;
        }
        
        // Hiç kayıt yok
        examRecords = [];
        console.log('ℹ️ Kayıt bulunamadı, boş başlatıldı');
        
    } catch (e) {
        console.error('❌ Yükleme hatası:', e.message);
        examRecords = [];
    }
}

// Sayfa kapanırken otomatik kayıt
window.addEventListener('beforeunload', function(e) {
    if (examRecords.length > 0) {
        saveExamRecords();
    }
});

// Düzenli otomatik kayıt (5 dakikada bir)
setInterval(() => {
    if (examRecords.length > 0) {
        saveExamRecords();
        console.log('🔄 Otomatik kayıt yapıldı');
    }
}, 5 * 60 * 1000); // 5 dakika
// Gemini Analiz Fonksiyonu

async function analyzeWithGemini() {
    const resultDiv = document.getElementById('gemini-analysis-result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = 'AI analiz yapılıyor... ⏳';

    if (examRecords.length === 0) {
        resultDiv.innerHTML = '❌ Önce bir deneme kaydı ekleyin.';
        return;
    }

    const lastRecord = examRecords[0];
    
    // BURAYA API KEY'İNİZİ KOYUN (tırnak işaretleri içinde)
    const API_KEY = 'AIzaSyAziUyjVrQJoW3rpcuwygnCKCRhS4irdaI';
    
    let prompt = '';
    if (lastRecord.examType === 'tyt') {
        prompt = `TYT Deneme Analizi:
Türkçe: ${lastRecord.tyt.turkce.net.toFixed(1)} net
Sosyal: ${lastRecord.tyt.sosyal.net.toFixed(1)} net  
Matematik: ${lastRecord.tyt.matematik.net.toFixed(1)} net
Fen: ${lastRecord.tyt.fen.net.toFixed(1)} net
Toplam: ${lastRecord.tyt.toplam.toFixed(1)}/120 net

Bu sonuçları analiz et ve kısa öneriler ver.`;
    } else {
        prompt = `AYT Deneme Analizi:
Matematik: ${lastRecord.ayt.matematik.net.toFixed(1)} net
Fizik: ${lastRecord.ayt.fizik.net.toFixed(1)} net
Kimya: ${lastRecord.ayt.kimya.net.toFixed(1)} net
Biyoloji: ${lastRecord.ayt.biyoloji.net.toFixed(1)} net
Toplam: ${lastRecord.ayt.toplam.toFixed(1)}/80 net

Bu sonuçları analiz et ve kısa öneriler ver.`;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]) {
            const analysis = data.candidates[0].content.parts[0].text;
            resultDiv.innerHTML = `
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #4299e1;">
                    <h4 style="color: #2b6cb0; margin-bottom: 10px;">🤖 Gemini AI Analizi</h4>
                    <div style="line-height: 1.6; color: #2d3748;">${analysis.replace(/\n/g, '<br>')}</div>
                </div>
            `;
        } else {
            throw new Error('API yanıt vermedi');
        }
    } catch (error) {
        console.error('Gemini hatası:', error);
        resultDiv.innerHTML = `
            <div style="background: #fed7d7; padding: 15px; border-radius: 8px; border-left: 4px solid #e53e3e;">
                <h4 style="color: #c53030;">❌ AI Analizi Yapılamadı</h4>
                <p>Muhtemelen internet bağlantısı veya API key sorunu. Yerel analiz kullanılıyor:</p>
                ${generateLocalAnalysis(lastRecord)}
            </div>
        `;
    }
}

function generateLocalAnalysis(record) {
    if (record.examType === 'tyt') {
        const total = record.tyt.toplam;
        let analysis = `<strong>TYT Toplam: ${total.toFixed(1)}/120 net</strong><br><br>`;
        
        if (total >= 100) analysis += "🎉 Mükemmel! Bu seviyeyi koru.<br>";
        else if (total >= 80) analysis += "👍 İyi seviye. Biraz daha yükseltilebilir.<br>";
        else if (total >= 60) analysis += "📈 Orta seviye. Çalışmaya devam.<br>";
        else analysis += "💪 Temel konulara odaklan.<br>";
        
        return analysis;
    } else {
        const total = record.ayt.toplam;
        let analysis = `<strong>AYT Toplam: ${total.toFixed(1)}/80 net</strong><br><br>`;
        
        if (total >= 70) analysis += "🎉 Mükemmel! Bu seviyeyi koru.<br>";
        else if (total >= 55) analysis += "👍 İyi seviye. Biraz daha yükseltilebilir.<br>";
        else if (total >= 40) analysis += "📈 Orta seviye. Çalışmaya devam.<br>";
        else analysis += "💪 Temel konulara odaklan.<br>";
        
        return analysis;
    }
}
