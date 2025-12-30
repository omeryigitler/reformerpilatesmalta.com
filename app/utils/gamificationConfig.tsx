import React from 'react';

// --- 10 BADGE DEFINITIONS (UPDATED V2: Easier & Emojis) ---
// Note: We use simple emoji strings for icons to avoid dependency issues and ensure colorful display.
export const BADGE_DEFINITIONS = [
    {
        id: 'newbie',
        label: 'Başlangıç',
        description: 'İlk dersini tamamladın.',
        icon: <span className="text-base">🐣</span>,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        criteria: { type: 'count', value: 1 }
    },
    {
        id: 'regular',
        label: 'İstikrarlı',
        description: '5 ders tamamladın.',
        icon: <span className="text-base">🏃</span>,
        color: 'bg-green-50 text-green-700 border-green-200',
        criteria: { type: 'count', value: 5 }
    },
    {
        id: 'pro',
        label: 'Profesyonel',
        description: '10 ders tamamladın.',
        icon: <span className="text-base">🚀</span>,
        color: 'bg-purple-50 text-purple-700 border-purple-200',
        criteria: { type: 'count', value: 10 }
    },
    {
        id: 'legend',
        label: 'Efsane',
        description: '15 dersi devirdin!',
        icon: <span className="text-base">👑</span>,
        color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        criteria: { type: 'count', value: 15 }
    },
    {
        id: 'early_bird',
        label: 'Erkenci Kuş',
        description: 'Sabah (06:00-10:00) 3 ders.',
        icon: <span className="text-base">🌅</span>,
        color: 'bg-orange-50 text-orange-700 border-orange-200',
        criteria: { type: 'time', start: '06:00', end: '10:00', count: 3 }
    },
    {
        id: 'night_owl',
        label: 'Gece Kuşu',
        description: 'Akşam (18:00-22:00) 3 ders.',
        icon: <span className="text-base">🦉</span>,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        criteria: { type: 'time', start: '18:00', end: '22:00', count: 3 }
    },
    {
        id: 'weekend_warrior',
        label: 'Hafta Sonu',
        description: 'Hafta sonu 3 ders.',
        icon: <span className="text-base">🏖️</span>,
        color: 'bg-pink-50 text-pink-700 border-pink-200',
        criteria: { type: 'weekend', count: 3 }
    },
    {
        id: 'on_fire',
        label: 'Alev Aldı',
        description: 'Bu ay 8 ders!',
        icon: <span className="text-base">🔥</span>,
        color: 'bg-red-50 text-red-700 border-red-200',
        criteria: { type: 'monthly', value: 8 }
    },
    {
        id: 'social',
        label: 'Sosyal Üye',
        description: 'Profilin tamamen dolu.',
        icon: <span className="text-base">📸</span>,
        color: 'bg-teal-50 text-teal-700 border-teal-200',
        criteria: { type: 'profile' }
    },
    {
        id: 'loyal',
        label: 'Sadık Dost',
        description: '3 aydır bizimlesin.',
        icon: <span className="text-base">💎</span>,
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        criteria: { type: 'loyalty_days', value: 90 }
    }
];

// --- 100 WELLNESS TIPS / QUOTES ---
export const WELLNESS_QUOTES = [
    // 1. PILATES PRINCIPLES (1-10)
    "Pilates fizyolojik ve psikolojik bir gelişim yolculuğudur.",
    "Kontrol, Pilates'in kalbidir. Hareketlerini savurma, yönet.",
    "Nefes alarak hazırlan, nefes vererek hareketi uygula.",
    "Merkez (Core) bölgen, vücudunun güç santralidir.",
    "Nicelik değil, nitelik önemlidir. Az ama öz tekrar yap.",
    "Akıcılık, hareketlerin birbirine dans eder gibi geçmesidir.",
    "Hizalanma bozulursa, hareketin faydası azalır.",
    "Konsantrasyon olmadan yapılan hareket, sadece jimnastiktir.",
    "Her omurganın esnekliği, senin gerçek yaşını belirler.",
    "Pilates tüm vücut için tam bir koordinasyondur.",

    // 2. MOTIVATION (11-20)
    "Bugün kendine yapacağın en iyi yatırım, hareket etmektir.",
    "Bahane üretme, kas üret.",
    "Yorgun olduğunda değil, bittiğinde dur.",
    "Değişim, konfor alanının bittiği yerde başlar.",
    "Bir saatlik ders, günün sadece %4'üdür. Erteleme.",
    "Ter, yağların ağlamasıdır.",
    "Yarın, bugün başlamadığın için pişman olma.",
    "Güçlü olmak bir seçenek değil, bir zorunluluktur.",
    "Vücudun senin tek evin, ona iyi bak.",
    "İstikrar, mükemmellikten daha önemlidir.",

    // 3. MINDFULNESS (21-30)
    "Zihnini mata getir, dış dünyayı kapıda bırak.",
    "Bedenini dinle, o sana neye ihtiyacı olduğunu fısıldar.",
    "Anda kal. Geçmiş gitti, gelecek henüz gelmedi.",
    "Sakin bir zihin, güçlü bir bedenin temelidir.",
    "Nefesinle barış, o senin en sadık dostun.",
    "Esneklik sadece bedende değil, zihinde de başlar.",
    "Kendini yargılama, sadece gözlemle ve geliştir.",
    "Her nefes yeni bir başlangıçtır.",
    "Denge, durmak değil, kontrollü hareket etmektir.",
    "İçindeki gücü keşfet, o hep oradaydı.",

    // 4. ANATOMY & TECHNIQUE (31-40)
    "Omuzlarını kulaklarından uzaklaştır.",
    "Göbek deliğini omurgana doğru çek.",
    "Kaburgalarını nefes verirken kapat.",
    "Başının tepesinden yukarı doğru uzadığını hisset.",
    "Leğen kemiğini nötr pozisyonda tut.",
    "Kürek kemiklerini arka ceplerine yerleştir.",
    "Ayak parmaklarını serbest bırak, yere köklen.",
    "Dizlerini kilitleme, hafifçe yumuşat.",
    "Çeneni göğsünden uzak tut, boynunu uzat.",
    "Omurganı tek tek boncuk gibi işleyerek hareket et.",

    // 5. HEALTH & LIFESTYLE (41-50)
    "Su içmeyi unutma, kasların suya aç.",
    "Uyku en iyi toparlanma aracıdır.",
    "Beslenme, antrenmanın yakıtıdır.",
    "Duruşun, dünyaya verdiğin ilk mesajdır.",
    "Sırt ağrısı kaderin değil, zayıf kasların sonucudur.",
    "Hareketli bir yaşam, uzun ömürlülüğün sırrıdır.",
    "Günde 10 bin adım yetmez, kaslarını da güçlendir.",
    "Mobilite, yaşlılıkta bağımsızlığın anahtarıdır.",
    "Stres vücutta birikir, Pilates ile onu serbest bırak.",
    "Kendine şefkat göster, dinlenmeyi bil.",

    // 6. SHORT & PUNCHY (51-60)
    "Karnını sıkı tut.",
    "Nefes al, uza.",
    "Nefes ver, derinleş.",
    "Daha iyisini yapabilirsin.",
    "Odaklan.",
    "Bırakma.",
    "Güçleniyorsun.",
    "Sadece sen ve mat.",
    "Hissediyor musun?",
    "Harika gidiyorsun.",

    // 7. STUDIO VIBES (61-70)
    "Reformer seni zorlar ama değiştirir.",
    "Yaylar yalan söylemez, dirence güven.",
    "Stüdyo senin güvenli alanın.",
    "Burada rekabet yok, sadece gelişim var.",
    "Eğitmenine güven, o senin potansiyelini görüyor.",
    "Her ders, daha iyi bir versiyonuna adım.",
    "Griplli çoraplarını giy, gücünü topla.",
    "Ders bittiğinde hissettiğin o hafiflik paha biçilemez.",
    "Pilates bir hobi değil, bir yaşam tarzıdır.",
    "Biz bir aileyiz, birlikte güçleniyoruz.",

    // 8. JOSEPH PILATES QUOTES (71-80)
    "10 derste farkı hissedeceksiniz.",
    "20 derste farkı göreceksiniz.",
    "30 derste yepyeni bir vücudunuz olacak.",
    "Fiziksel zindelik, mutluluğun ilk şartıdır.",
    "Herkesin hakkı olan fiziksel mükemmellik.",
    "Zihin kasları inşa eder.",
    "Kontroloji, vücut, zihin ve ruhun tam koordinasyonudur.",
    "Normal kas gelişimi için acele etmeyin.",
    "Hareketsizlik en büyük düşmandır.",
    "Gerçek yaşınız omurganızın esnekliğidir.",

    // 9. CORE FOCUSED (81-90)
    "Her hareket merkezden başlar.",
    "Kor (Core) sadece karın değil, tüm gövdedir.",
    "Güçlü bir merkez, ağrısız bir sırt demektir.",
    "Dengen merkezinden gelir.",
    "İç kaslarını hisset, yüzeyde kalma.",
    "Derin karın kaslarını aktive et.",
    "Merkezini bul, oradan hareket et.",
    "Limiti koyan zihindir, merkez değil.",
    "Titremek iyidir, kasların uyanıyor.",
    "Yanma hissi, değişimin sesidir.",

    // 10. DAILY AFFIRMATIONS (91-100)
    "Bugün kendim için harika bir şey yapıyorum.",
    "Vücudumu seviyorum ve ona saygı duyuyorum.",
    "Her gün daha da güçleniyorum.",
    "Sağlıklı olmayı seçiyorum.",
    "Enerjim yüksek, zihnim açık.",
    "Bugün sınırlarımı zorlayacağım.",
    "Ben disiplinliyim ve kararlıyım.",
    "Nefesimle her zorluğun üstesinden gelirim.",
    "Dengede ve huzurluyum.",
    "Bugün Pilates günü, yani iyi bir gün."
];
