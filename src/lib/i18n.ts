export type Language = 'en' | 'tr' | 'bg';

export const translations = {
  en: {
    // Onboarding
    welcomeTitle: 'Welcome to LoveLevel! 💕',
    welcomeSubtitle: "Let's set up your relationship companion",
    partner1Label: 'Partner 1 Name',
    partner1Placeholder: 'Your name',
    partner2Label: 'Partner 2 Name',
    partner2Placeholder: "Partner's name",
    startDateLabel: 'Relationship Start Date',
    petTitle: 'Meet Your Pet!',
    petSubtitle: 'Your relationship companion that grows with you',
    petNameLabel: 'Pet Name',
    petNamePlaceholder: 'Choose a name',
    petTip: '💡 Your pet will level up as you complete challenges and celebrate milestones together!',
    notificationsTitle: 'Stay Connected',
    notificationsSubtitle: 'Get notified on your special monthly anniversaries',
    notificationsBenefit1: "🎉 We'll send you a gentle reminder on your monthiversaries",
    notificationsBenefit2: '✨ Never miss a celebration milestone',
    notificationsBenefit3: '🔕 You can disable this anytime in settings',
    enableNotifications: 'Enable Notifications',
    skipNotifications: 'Skip for Now',
    notificationsEnabled: '✅ Notifications Enabled!',
    notificationsEnabledDesc: "We'll remind you of your special days",
    notificationsLater: 'You can enable notifications later in settings',
    back: 'Back',
    next: 'Next',
    getStarted: 'Get Started',
    fillAllFields: 'Please fill in all fields',
    namePet: 'Please name your pet',
    
    // Home
    daysTogether: 'Days Together',
    months: 'Months',
    years: 'Years',
    nextMilestone: 'Next Milestone',
    nextMonthiversary: 'Next Monthiversary',
    yearAnniversary: 'Year Anniversary',
    monthsTogether: 'Months Together',
    today: 'Today! 🎉',
    tomorrow: 'Tomorrow',
    daysAway: 'days',
    monthiversary: 'Monthiversary',
    editDate: 'Edit Date',
    
    // Challenges
    challenges: 'Challenges',
    allChallenges: 'All Challenges',
    completedChallenges: 'Completed',
    addCustomChallenge: 'Add Custom Challenge',
    challengeTitle: 'Challenge Title',
    challengeDescription: 'Description (optional)',
    addChallenge: 'Add Challenge',
    cancel: 'Cancel',
    completeChallenge: 'Complete Challenge',
    addNote: 'Notes (optional)',
    notesPlaceholder: 'How was it? Any memorable moments?',
    markComplete: 'Mark Complete 🎉',
    completedOn: 'Completed on',
    free: 'Free',
    complete: 'Complete',
    activeChallenges: 'Active',
    
    // Pet
    petLevel: 'Level',
    rename: 'Rename',
    items: 'Items',
    unlocked: 'Unlocked',
    locked: 'Locked',
    xpProgress: 'XP Progress',
    xpUntilLevel: 'XP until level',
    happiness: 'Happiness',
    energy: 'Energy',
    
    // History
    history: 'History',
    noHistory: 'No completed challenges yet',
    noHistoryDesc: 'Start completing challenges to see your journey!',
    
    // Settings
    settings: 'Settings',
    yourJourney: 'Your Journey',
    partners: 'Partners',
    relationshipDetails: 'Relationship Details',
    partnerName: 'Partner Name',
    messageTemplate: 'Message Template',
    notifications: 'Notifications',
    anniversaryReminders: 'Anniversary Reminders',
    enabled: 'Enabled',
    denied: 'Denied',
    petProgression: 'Pet Progression',
    xpPerChallenge: 'XP per Challenge',
    xpPerMonthiversary: 'XP per Monthiversary',
    dataManagement: 'Data Management',
    appearance: 'Appearance',
    theme: 'Theme',
    language: 'Language',
    data: 'Data',
    exportData: 'Export Data',
    importData: 'Import Data',
    clearAllData: 'Clear All Data',
    dangerZone: 'Danger Zone',
    about: 'About',
    version: 'Version',
    
    // Common
    home: 'Home',
    pet: 'Pet',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    
    // Pet interactions
    feed: 'Feed',
    play: 'Play',
    petNewName: 'New pet name',
    petRename: 'Rename Pet',
    
    // Challenge categories
    atHome: 'At Home',
    outdoors: 'Outdoors',
    creative: 'Creative',
    budgetFriendly: 'Budget Friendly',
    custom: 'Custom',
    
    // Bottom navigation
    navHome: 'Home',
    navChallenges: 'Challenges',
    navPet: 'Pet',
    navHistory: 'History',
    navSettings: 'Settings',
    
    // Miscellaneous
    shareJourney: 'Share Your Journey 💫',
    levelUpTips: '💡 Level Up Tips:',
    levelUpTip1: 'Complete challenges to earn +20 XP',
    levelUpTip2: 'Celebrate monthiversaries for +100 XP',
    levelUpTip3: 'Year anniversaries give +500 XP!',
    dataManagementDesc: 'Export your data as JSON to backup or transfer to another device. Import will overwrite all current data.',
    appTagline: 'Your relationship journey companion',
    madeWithLove: 'Made with love · Offline-first PWA',
    exportModalDesc: 'Copy this data and save it somewhere safe. You can import it later to restore your progress.',
    copyToClipboard: 'Copy to Clipboard',
    close: 'Close',
    importModalDesc: 'Paste your exported JSON data below. This will overwrite all current data.',
    pasteJsonPlaceholder: 'Paste JSON data here...',
    import: 'Import',
    
    // Challenge Content
    challengeContent: {
      'cook-recipe': {
        title: 'Cook a New Recipe Together',
        description: 'Pick a cuisine you\'ve never tried before and cook it from scratch. Take turns being the head chef!',
      },
      'blanket-fort': {
        title: 'Build a Blanket Fort',
        description: 'Channel your inner kids! Build an epic blanket fort and watch a movie inside it with snacks.',
      },
      'spa-night': {
        title: 'Spa Night at Home',
        description: 'Give each other massages, do face masks, light candles, and play relaxing music.',
      },
      'game-tournament': {
        title: 'Game Tournament',
        description: 'Have a best-of-7 tournament with board games, card games, or video games. Winner picks dinner!',
      },
      'karaoke-night': {
        title: 'Karaoke Night',
        description: 'Belt out your favorite songs together! Use YouTube karaoke tracks or a karaoke app.',
      },
      'sunrise-hike': {
        title: 'Sunrise or Sunset Hike',
        description: 'Wake up early or stay out late to catch a beautiful sunrise or sunset from a scenic spot.',
      },
      'picnic-park': {
        title: 'Picnic in the Park',
        description: 'Pack your favorite snacks, bring a blanket, and enjoy an outdoor meal together.',
      },
      'bike-adventure': {
        title: 'Bike Ride Adventure',
        description: 'Explore a new trail or neighborhood on bikes. Stop for ice cream along the way!',
      },
      'stargazing': {
        title: 'Stargazing Session',
        description: 'Find a dark spot away from city lights, bring a blanket, and identify constellations together.',
      },
      'farmers-market': {
        title: 'Farmers Market Morning',
        description: 'Visit your local farmers market, try new fruits or treats, and support local vendors.',
      },
      'paint-together': {
        title: 'Paint Together',
        description: 'Get canvas and paints and create artwork side-by-side. No art experience needed!',
      },
      'love-letters': {
        title: 'Write Love Letters',
        description: 'Each write a heartfelt letter to the other, then exchange and read them aloud.',
      },
      'couples-playlist': {
        title: 'Create a Couples Playlist',
        description: 'Take turns adding songs that remind you of each other or your journey together.',
      },
      'scrapbook': {
        title: 'Make a Scrapbook',
        description: 'Collect photos, ticket stubs, and mementos to create a physical scrapbook of your memories.',
      },
      'learn-dance': {
        title: 'Learn a Dance Together',
        description: 'Pick a dance style (salsa, swing, hip-hop) and learn it together via YouTube tutorials.',
      },
      'museum-day': {
        title: 'Free Museum or Gallery Day',
        description: 'Many museums offer free admission days. Explore art, history, or science together!',
      },
      'walking-tour': {
        title: 'Walking Tour of Your City',
        description: 'Be tourists in your own city! Walk through neighborhoods you\'ve never explored before.',
      },
      'photo-hunt': {
        title: 'Photo Scavenger Hunt',
        description: 'Create a list of things to find and photograph around your area. Make it silly or romantic!',
      },
      'volunteer': {
        title: 'Volunteer Together',
        description: 'Give back to your community by volunteering at a local charity, shelter, or food bank.',
      },
      'window-shopping': {
        title: 'Window Shopping & Dreaming',
        description: 'Browse shops or online stores and show each other things you\'d love to have "someday."',
      },
    },
  },
  tr: {
    // Onboarding
    welcomeTitle: 'LoveLevel\'e Hoş Geldiniz! 💕',
    welcomeSubtitle: 'İlişki yardımcınızı kuralım',
    partner1Label: 'Partner 1 İsmi',
    partner1Placeholder: 'İsminiz',
    partner2Label: 'Partner 2 İsmi',
    partner2Placeholder: 'Partnerinizin ismi',
    startDateLabel: 'İlişki Başlangıç Tarihi',
    petTitle: 'Evcil Hayvanınızla Tanışın!',
    petSubtitle: 'Sizinle birlikte büyüyen ilişki arkadaşınız',
    petNameLabel: 'Evcil Hayvan İsmi',
    petNamePlaceholder: 'Bir isim seçin',
    petTip: '💡 Evcil hayvanınız, zorlukları tamamladıkça ve birlikte dönüm noktalarını kutladıkça seviye atlayacak!',
    notificationsTitle: 'Bağlantıda Kalın',
    notificationsSubtitle: 'Özel aylık yıldönümlerinizde bildirim alın',
    notificationsBenefit1: '🎉 Aylık yıldönümlerinizde size nazik bir hatırlatma göndereceğiz',
    notificationsBenefit2: '✨ Kutlama dönüm noktalarını asla kaçırmayın',
    notificationsBenefit3: '🔕 Bunu istediğiniz zaman ayarlardan devre dışı bırakabilirsiniz',
    enableNotifications: 'Bildirimleri Etkinleştir',
    skipNotifications: 'Şimdilik Atla',
    notificationsEnabled: '✅ Bildirimler Etkinleştirildi!',
    notificationsEnabledDesc: 'Özel günlerinizi size hatırlatacağız',
    notificationsLater: 'Bildirimleri daha sonra ayarlardan etkinleştirebilirsiniz',
    back: 'Geri',
    next: 'İleri',
    getStarted: 'Başla',
    fillAllFields: 'Lütfen tüm alanları doldurun',
    namePet: 'Lütfen evcil hayvanınıza isim verin',
    
    // Home
    daysTogether: 'Birlikte Gün',
    months: 'Ay',
    years: 'Yıl',
    nextMilestone: 'Sonraki Dönüm Noktası',
    nextMonthiversary: 'Sonraki Aylık Yıldönümü',
    yearAnniversary: 'Yıl Dönümü',
    monthsTogether: 'Birlikte Ay',
    today: 'Bugün! 🎉',
    tomorrow: 'Yarın',
    daysAway: 'gün',
    monthiversary: 'Aylık Yıldönümü',
    editDate: 'Tarihi Düzenle',
    
    // Challenges
    challenges: 'Zorluklar',
    allChallenges: 'Tüm Zorluklar',
    completedChallenges: 'Tamamlanan',
    addCustomChallenge: 'Özel Zorluk Ekle',
    challengeTitle: 'Zorluk Başlığı',
    challengeDescription: 'Açıklama (isteğe bağlı)',
    addChallenge: 'Zorluk Ekle',
    cancel: 'İptal',
    completeChallenge: 'Zorluğu Tamamla',
    addNote: 'Notlar (isteğe bağlı)',
    notesPlaceholder: 'Nasıldı? Unutulmaz anlar var mı?',
    markComplete: 'Tamamlandı İşaretle 🎉',
    completedOn: 'Tamamlanma tarihi',
    free: 'Ücretsiz',
    complete: 'Tamamla',
    activeChallenges: 'Aktif',
    
    // Pet
    petLevel: 'Seviye',
    rename: 'Yeniden Adlandır',
    items: 'Eşyalar',
    unlocked: 'Açıldı',
    locked: 'Kilitli',
    xpProgress: 'XP İlerleme',
    xpUntilLevel: 'seviyeye kadar XP',
    happiness: 'Mutluluk',
    energy: 'Enerji',
    
    // History
    history: 'Geçmiş',
    noHistory: 'Henüz tamamlanmış zorluk yok',
    noHistoryDesc: 'Yolculuğunuzu görmek için zorlukları tamamlamaya başlayın!',
    
    // Settings
    settings: 'Ayarlar',
    yourJourney: 'Yolculuğunuz',
    partners: 'Partnerler',
    relationshipDetails: 'İlişki Detayları',
    partnerName: 'Partner İsmi',
    messageTemplate: 'Mesaj Şablonu',
    notifications: 'Bildirimler',
    anniversaryReminders: 'Yıldönümü Hatırlatıcıları',
    enabled: 'Etkin',
    denied: 'Reddedildi',
    petProgression: 'Evcil Hayvan İlerlemesi',
    xpPerChallenge: 'Zorluk Başına XP',
    xpPerMonthiversary: 'Aylık Yıldönümü Başına XP',
    dataManagement: 'Veri Yönetimi',
    appearance: 'Görünüm',
    theme: 'Tema',
    language: 'Dil',
    data: 'Veri',
    exportData: 'Veriyi Dışa Aktar',
    importData: 'Veriyi İçe Aktar',
    clearAllData: 'Tüm Veriyi Temizle',
    dangerZone: 'Tehlike Bölgesi',
    about: 'Hakkında',
    version: 'Sürüm',
    
    // Common
    home: 'Ana Sayfa',
    pet: 'Evcil Hayvan',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    confirm: 'Onayla',
    
    // Pet interactions
    feed: 'Besle',
    play: 'Oyna',
    petNewName: 'Yeni evcil hayvan ismi',
    petRename: 'Evcil Hayvanı Yeniden Adlandır',
    
    // Challenge categories
    atHome: 'Evde',
    outdoors: 'Açık Hava',
    creative: 'Yaratıcı',
    budgetFriendly: 'Bütçe Dostu',
    custom: 'Özel',
    
    // Bottom navigation
    navHome: 'Ana Sayfa',
    navChallenges: 'Zorluklar',
    navPet: 'Evcil Hayvan',
    navHistory: 'Geçmiş',
    navSettings: 'Ayarlar',
    
    // Miscellaneous
    shareJourney: 'Yolculuğunuzu Paylaşın 💫',
    levelUpTips: '💡 Seviye Atlama İpuçları:',
    levelUpTip1: 'Görevleri tamamlayarak +20 XP kazanın',
    levelUpTip2: 'Aylık yıldönümlerini kutlayarak +100 XP kazanın',
    levelUpTip3: 'Yıllık yıldönümleri +500 XP verir!',
    dataManagementDesc: 'Verilerinizi yedeklemek veya başka bir cihaza aktarmak için JSON olarak dışa aktarın. İçe aktarma mevcut tüm verilerin üzerine yazacaktır.',
    appTagline: 'İlişki yolculuğunuz için yardımcınız',
    madeWithLove: 'Sevgiyle yapılmıştır · Çevrimdışı PWA',
    exportModalDesc: 'Bu verileri kopyalayın ve güvenli bir yere kaydedin. Daha sonra ilerlemenizi geri yüklemek için içe aktarabilirsiniz.',
    copyToClipboard: 'Panoya Kopyala',
    close: 'Kapat',
    importModalDesc: 'Dışa aktarılan JSON verilerinizi aşağıya yapıştırın. Bu, mevcut tüm verilerin üzerine yazacaktır.',
    pasteJsonPlaceholder: 'JSON verilerini buraya yapıştırın...',
    import: 'İçe Aktar',
    
    // Challenge Content
    challengeContent: {
      'cook-recipe': {
        title: 'Birlikte Yeni Bir Tarif Pişirin',
        description: 'Daha önce hiç denemediğiniz bir mutfak seçin ve sıfırdan pişirin. Sırayla baş şef olun!',
      },
      'blanket-fort': {
        title: 'Battaniye Kalesi Yapın',
        description: 'İçinizdeki çocuğu ortaya çıkarın! Muhteşem bir battaniye kalesi yapın ve içinde atıştırmalıklarla film izleyin.',
      },
      'spa-night': {
        title: 'Evde Spa Gecesi',
        description: 'Birbirinize masaj yapın, yüz maskesi uygulayın, mum yakın ve rahatlatıcı müzik çalın.',
      },
      'game-tournament': {
        title: 'Oyun Turnuvası',
        description: 'Masa oyunları, kart oyunları veya video oyunları ile 7\'den iyi turnuva yapın. Kazanan akşam yemeğini seçer!',
      },
      'karaoke-night': {
        title: 'Karaoke Gecesi',
        description: 'En sevdiğiniz şarkıları birlikte söyleyin! YouTube karaoke parçalarını veya bir karaoke uygulamasını kullanın.',
      },
      'sunrise-hike': {
        title: 'Gün Doğumu veya Gün Batımı Yürüyüşü',
        description: 'Manzaralı bir noktadan güzel bir gün doğumu veya gün batımını yakalamak için erken kalkın veya geç dışarıda kalın.',
      },
      'picnic-park': {
        title: 'Parkta Piknik',
        description: 'En sevdiğiniz atıştırmalıkları paketleyin, bir battaniye getirin ve açık havada birlikte yemek yiyin.',
      },
      'bike-adventure': {
        title: 'Bisiklet Macerası',
        description: 'Bisikletlerle yeni bir parkur veya mahalle keşfedin. Yol boyunca dondurma için durun!',
      },
      'stargazing': {
        title: 'Yıldız Gözlem Oturumu',
        description: 'Şehir ışıklarından uzakta karanlık bir nokta bulun, bir battaniye getirin ve birlikte takımyıldızları belirleyin.',
      },
      'farmers-market': {
        title: 'Çiftçi Pazarı Sabahı',
        description: 'Yerel çiftçi pazarınızı ziyaret edin, yeni meyveler veya ikramlar deneyin ve yerel satıcıları destekleyin.',
      },
      'paint-together': {
        title: 'Birlikte Resim Yapın',
        description: 'Tuval ve boyalar alın ve yan yana sanat eseri yaratın. Sanat deneyimi gerekmez!',
      },
      'love-letters': {
        title: 'Aşk Mektupları Yazın',
        description: 'Her biriniz diğerine içten bir mektup yazın, sonra değiş tokuş edin ve sesli okuyun.',
      },
      'couples-playlist': {
        title: 'Çiftler Çalma Listesi Oluşturun',
        description: 'Birbirinizi veya birlikte geçirdiğiniz yolculuğu hatırlatan şarkılar ekleyin.',
      },
      'scrapbook': {
        title: 'Anı Defteri Yapın',
        description: 'Fotoğraflar, bilet koçanları ve hatıra eşyaları toplayarak anılarınızın fiziksel bir defterini oluşturun.',
      },
      'learn-dance': {
        title: 'Birlikte Dans Öğrenin',
        description: 'Bir dans stili seçin (salsa, swing, hip-hop) ve YouTube eğitimleri ile birlikte öğrenin.',
      },
      'museum-day': {
        title: 'Ücretsiz Müze veya Galeri Günü',
        description: 'Birçok müze ücretsiz giriş günleri sunar. Birlikte sanat, tarih veya bilim keşfedin!',
      },
      'walking-tour': {
        title: 'Şehrinizde Yürüyüş Turu',
        description: 'Kendi şehrinizde turist olun! Daha önce keşfetmediğiniz mahallelerden geçin.',
      },
      'photo-hunt': {
        title: 'Fotoğraf Hazine Avı',
        description: 'Bölgenizde bulup fotoğraflamanız gereken şeylerin bir listesini oluşturun. Komik veya romantik yapın!',
      },
      'volunteer': {
        title: 'Birlikte Gönüllü Olun',
        description: 'Yerel bir hayır kurumu, barınak veya gıda bankasında gönüllü olarak topluluğunuza katkıda bulunun.',
      },
      'window-shopping': {
        title: 'Vitrin Alışverişi ve Hayal Kurma',
        description: 'Mağazalara veya online mağazalara göz atın ve birbirinize "bir gün" sahip olmak istediğiniz şeyleri gösterin.',
      },
    },
  },
  bg: {
    // Onboarding
    welcomeTitle: 'Добре дошли в LoveLevel! 💕',
    welcomeSubtitle: 'Нека настроим вашия компаньон за връзката',
    partner1Label: 'Име на партньор 1',
    partner1Placeholder: 'Вашето име',
    partner2Label: 'Име на партньор 2',
    partner2Placeholder: 'Име на партньора',
    startDateLabel: 'Начална дата на връзката',
    petTitle: 'Запознайте се с вашия домашен любимец!',
    petSubtitle: 'Вашият компаньон за връзката, който расте с вас',
    petNameLabel: 'Име на домашен любимец',
    petNamePlaceholder: 'Изберете име',
    petTip: '💡 Вашият домашен любимец ще повишава ниво, докато изпълнявате предизвикателства и празнувате важни моменти заедно!',
    notificationsTitle: 'Останете свързани',
    notificationsSubtitle: 'Получавайте известия за специалните си месечни годишнини',
    notificationsBenefit1: '🎉 Ще ви изпратим нежно напомняне за вашите месечни годишнини',
    notificationsBenefit2: '✨ Никога не пропускайте празнична годишнина',
    notificationsBenefit3: '🔕 Можете да деактивирате това по всяко време в настройките',
    enableNotifications: 'Активирай известия',
    skipNotifications: 'Пропусни засега',
    notificationsEnabled: '✅ Известията са активирани!',
    notificationsEnabledDesc: 'Ще ви напомним за вашите специални дни',
    notificationsLater: 'Можете да активирате известията по-късно в настройките',
    back: 'Назад',
    next: 'Напред',
    getStarted: 'Започнете',
    fillAllFields: 'Моля, попълнете всички полета',
    namePet: 'Моля, дайте име на вашия домашен любимец',
    
    // Home
    daysTogether: 'Дни заедно',
    months: 'Месеци',
    years: 'Години',
    nextMilestone: 'Следваща важна дата',
    nextMonthiversary: 'Следваща месечна годишнина',
    yearAnniversary: 'Годишнина',
    monthsTogether: 'Месеци заедно',
    today: 'Днес! 🎉',
    tomorrow: 'Утре',
    daysAway: 'дни',
    monthiversary: 'Месечна годишнина',
    editDate: 'Редактирай дата',
    
    // Challenges
    challenges: 'Предизвикателства',
    allChallenges: 'Всички предизвикателства',
    completedChallenges: 'Завършени',
    addCustomChallenge: 'Добави персонализирано предизвикателство',
    challengeTitle: 'Заглавие на предизвикателство',
    challengeDescription: 'Описание (по избор)',
    addChallenge: 'Добави предизвикателство',
    cancel: 'Отказ',
    completeChallenge: 'Завърши предизвикателството',
    addNote: 'Бележки (по избор)',
    notesPlaceholder: 'Как беше? Има ли незабравими моменти?',
    markComplete: 'Маркирай като завършено 🎉',
    completedOn: 'Завършено на',
    free: 'Безплатно',
    complete: 'Завърши',
    activeChallenges: 'Активни',
    
    // Pet
    petLevel: 'Ниво',
    rename: 'Преименувай',
    items: 'Предмети',
    unlocked: 'Отключени',
    locked: 'Заключени',
    xpProgress: 'XP Прогрес',
    xpUntilLevel: 'XP до ниво',
    happiness: 'Щастие',
    energy: 'Енергия',
    
    // History
    history: 'История',
    noHistory: 'Все още няма завършени предизвикателства',
    noHistoryDesc: 'Започнете да изпълнявате предизвикателства, за да видите пътуването си!',
    
    // Settings
    settings: 'Настройки',
    yourJourney: 'Вашето пътуване',
    partners: 'Партньори',
    relationshipDetails: 'Детайли за връзката',
    partnerName: 'Име на партньор',
    messageTemplate: 'Шаблон на съобщение',
    notifications: 'Известия',
    anniversaryReminders: 'Напомняния за годишнини',
    enabled: 'Активирани',
    denied: 'Отказани',
    petProgression: 'Прогресия на домашния любимец',
    xpPerChallenge: 'XP на предизвикателство',
    xpPerMonthiversary: 'XP на месечна годишнина',
    dataManagement: 'Управление на данни',
    appearance: 'Външен вид',
    theme: 'Тема',
    language: 'Език',
    data: 'Данни',
    exportData: 'Експортиране на данни',
    importData: 'Импортиране на данни',
    clearAllData: 'Изтриване на всички данни',
    dangerZone: 'Опасна зона',
    about: 'За приложението',
    version: 'Версия',
    
    // Common
    home: 'Начало',
    pet: 'Домашен любимец',
    save: 'Запази',
    delete: 'Изтрий',
    edit: 'Редактирай',
    confirm: 'Потвърди',
    
    // Pet interactions
    feed: 'Нахрани',
    play: 'Играй',
    petNewName: 'Ново име на домашен любимец',
    petRename: 'Преименувай домашен любимец',
    
    // Challenge categories
    atHome: 'У дома',
    outdoors: 'На открито',
    creative: 'Креативно',
    budgetFriendly: 'Икономично',
    custom: 'Персонализирано',
    
    // Bottom navigation
    navHome: 'Начало',
    navChallenges: 'Предизвикателства',
    navPet: 'Домашен любимец',
    navHistory: 'История',
    navSettings: 'Настройки',
    
    // Miscellaneous
    shareJourney: 'Споделете пътуването си 💫',
    levelUpTips: '💡 Съвети за повишаване на ниво:',
    levelUpTip1: 'Изпълнявайте предизвикателства, за да спечелите +20 XP',
    levelUpTip2: 'Празнувайте месечни годишнини за +100 XP',
    levelUpTip3: 'Годишните годишнини дават +500 XP!',
    dataManagementDesc: 'Експортирайте данните си като JSON за архивиране или прехвърляне на друго устройство. Импортирането ще презапише всички текущи данни.',
    appTagline: 'Вашият спътник в пътуването на връзката',
    madeWithLove: 'Направено с любов · Офлайн PWA',
    exportModalDesc: 'Копирайте тези данни и ги запазете на сигурно място. Можете да ги импортирате по-късно, за да възстановите прогреса си.',
    copyToClipboard: 'Копирай в клипборда',
    close: 'Затвори',
    importModalDesc: 'Поставете експортираните си JSON данни по-долу. Това ще презапише всички текущи данни.',
    pasteJsonPlaceholder: 'Поставете JSON данни тук...',
    import: 'Импортирай',
    
    // Challenge Content
    challengeContent: {
      'cook-recipe': {
        title: 'Гответе заедно нова рецепта',
        description: 'Изберете кухня, която никога не сте пробвали преди, и я гответе от нулата. Редувайте се като главен готвач!',
      },
      'blanket-fort': {
        title: 'Постройте крепост от одеяла',
        description: 'Разбудете вътрешното си дете! Постройте епична крепост от одеяла и гледайте филм вътре със закуски.',
      },
      'spa-night': {
        title: 'Спа вечер у дома',
        description: 'Правете си масажи, поставете маски за лице, запалете свещи и пуснете релаксираща музика.',
      },
      'game-tournament': {
        title: 'Турнир по игри',
        description: 'Направете турнир от 7 игри с настолни игри, карти или видео игри. Победителят избира вечерята!',
      },
      'karaoke-night': {
        title: 'Караоке вечер',
        description: 'Изпейте любимите си песни заедно! Използвайте YouTube караоке записи или караоке приложение.',
      },
      'sunrise-hike': {
        title: 'Поход за изгрев или залез',
        description: 'Станете рано или останете навън до късно, за да уловите красив изгрев или залез от живописно място.',
      },
      'picnic-park': {
        title: 'Пикник в парка',
        description: 'Опаковайте любимите си закуски, вземете одеяло и се насладете на храна на открито заедно.',
      },
      'bike-adventure': {
        title: 'Приключение с колело',
        description: 'Изследвайте нова пътека или квартал с колела. Спрете за сладолед по пътя!',
      },
      'stargazing': {
        title: 'Сесия за наблюдение на звезди',
        description: 'Намерете тъмно място далеч от градските светлини, вземете одеяло и идентифицирайте съзвездия заедно.',
      },
      'farmers-market': {
        title: 'Сутрин на фермерския пазар',
        description: 'Посетете местния фермерски пазар, опитайте нови плодове или лакомства и подкрепете местните търговци.',
      },
      'paint-together': {
        title: 'Рисувайте заедно',
        description: 'Вземете платна и бои и създайте произведения на изкуството един до друг. Не е нужен опит в изкуството!',
      },
      'love-letters': {
        title: 'Напишете любовни писма',
        description: 'Всеки напишете искрено писмо на другия, след което ги разменете и ги прочетете на глас.',
      },
      'couples-playlist': {
        title: 'Създайте плейлист за двойки',
        description: 'Редувайте се да добавяте песни, които ви напомнят един за друг или за вашето пътуване заедно.',
      },
      'scrapbook': {
        title: 'Направете албум със спомени',
        description: 'Съберете снимки, билети и спомени, за да създадете физически албум с вашите спомени.',
      },
      'learn-dance': {
        title: 'Научете танц заедно',
        description: 'Изберете танцов стил (салса, суинг, хип-хоп) и го научете заедно чрез YouTube уроци.',
      },
      'museum-day': {
        title: 'Безплатен ден в музей или галерия',
        description: 'Много музеи предлагат дни с безплатен вход. Изследвайте изкуство, история или наука заедно!',
      },
      'walking-tour': {
        title: 'Пешеходна обиколка на вашия град',
        description: 'Бъдете туристи в собствения си град! Разходете се из квартали, които никога не сте изследвали преди.',
      },
      'photo-hunt': {
        title: 'Фото ловна игра',
        description: 'Създайте списък с неща, които да намерите и снимате в района си. Направете го смешно или романтично!',
      },
      'volunteer': {
        title: 'Доброволчете заедно',
        description: 'Върнете на общността си, като станете доброволци в местна благотворителност, приют или банка за храна.',
      },
      'window-shopping': {
        title: 'Разглеждане на витрини и мечтаене',
        description: 'Разглеждайте магазини или онлайн магазини и покажете си неща, които бихте искали да имате "един ден".',
      },
    },
  },
} as const;

export function getTranslation(lang: Language) {
  return translations[lang];
}

export const languageNames: Record<Language, string> = {
  en: 'English',
  tr: 'Türkçe',
  bg: 'Български',
};

// Hook for components to use translations
import { useSettingsStore } from '../store';

export function useTranslation() {
  const language = useSettingsStore((state) => state.settings.language);
  return getTranslation(language);
}
