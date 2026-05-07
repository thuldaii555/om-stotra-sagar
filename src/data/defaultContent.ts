import type { Category, Deity, HinduStory, PanchangContent, PoojaBidhi, Stotra } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-chalisa', name: 'Chalisa', description: 'Devotional hymns and forty-verse prayers.' },
  { id: 'cat-stotram', name: 'Stotram', description: 'Classical Sanskrit praise hymns.' },
  { id: 'cat-ashtakam', name: 'Ashtakam', description: 'Eight-verse devotional compositions.' },
  { id: 'cat-vandana', name: 'Vandana', description: 'Short invocations and prayers.' },
  { id: 'cat-mantra', name: 'Mantra', description: 'Sacred chants and repeated invocations.' },
  { id: 'cat-aarti', name: 'Aarti', description: 'Lamp-offering hymns used in worship.' },
  { id: 'cat-kavach', name: 'Kavach', description: 'Protective devotional compositions.' },
  { id: 'cat-sahasranama', name: 'Sahasranama', description: 'Thousand-name devotional traditions.' },
  { id: 'cat-pooja-bidhi', name: 'Pooja Vidhi', description: 'Practical steps for home worship.' },
  { id: 'cat-katha', name: 'Katha', description: 'Devotional stories and sacred narratives.' },
  { id: 'cat-vrat-katha', name: 'Vrat Katha', description: 'Stories connected with sacred vows and observances.' },
];

export const DEFAULT_DEITIES: Deity[] = [
  {
    id: 'deity-ganesh',
    name: 'Ganesh',
    sanskritName: 'श्री गणेश',
    description: 'The remover of obstacles and the blessing of auspicious beginnings.',
    significance: 'Traditionally invoked first in worship, study, travel, and important new work for clarity and steadiness.',
    mantra: 'ॐ गं गणपतये नमः',
    tags: ['beginnings', 'wisdom', 'success'],
    theme: 'from-amber-100 to-orange-50',
  },
  {
    id: 'deity-shiva',
    name: 'Shiva',
    sanskritName: 'श्री शिव',
    description: 'The auspicious one associated with stillness, transformation, and meditation.',
    significance: 'Remembered for peace, discipline, inner strength, and the capacity to release obstacles with calm awareness.',
    mantra: 'ॐ नमः शिवाय',
    tags: ['peace', 'meditation', 'transformation'],
    theme: 'from-slate-100 to-blue-50',
  },
  {
    id: 'deity-vishnu',
    name: 'Vishnu',
    sanskritName: 'श्री विष्णु',
    description: 'The preserver who sustains dharma, balance, and devotional refuge.',
    significance: 'Invoked for protection, stability, and the sustaining grace that keeps life in balance.',
    mantra: 'ॐ नमो नारायणाय',
    tags: ['protection', 'dharma', 'preservation'],
    theme: 'from-sky-100 to-cyan-50',
  },
  {
    id: 'deity-lakshmi',
    name: 'Lakshmi',
    sanskritName: 'श्री लक्ष्मी',
    description: 'The goddess of prosperity, grace, beauty, and auspicious abundance.',
    significance: 'Honored in homes and festivals for harmony, gratitude, cleanliness, and responsible prosperity.',
    mantra: 'ॐ श्रीं महालक्ष्म्यै नमः',
    tags: ['prosperity', 'grace', 'auspiciousness'],
    theme: 'from-rose-100 to-yellow-50',
  },
  {
    id: 'deity-saraswati',
    name: 'Saraswati',
    sanskritName: 'श्री सरस्वती',
    description: 'The goddess of learning, music, eloquence, and clear knowledge.',
    significance: 'Invoked by students, teachers, artists, and seekers who value disciplined study and a pure mind.',
    mantra: 'ॐ ऐं सरस्वत्यै नमः',
    tags: ['knowledge', 'learning', 'music'],
    theme: 'from-sky-100 to-white',
  },
  {
    id: 'deity-hanuman',
    name: 'Hanuman',
    sanskritName: 'श्री हनुमान',
    description: 'The embodiment of strength, devotion, courage, and selfless service.',
    significance: 'Remembered for steady devotion to Shri Ram, mental discipline, protection, and unwavering resolve.',
    mantra: 'ॐ हनुमते नमः',
    tags: ['protection', 'devotion', 'strength'],
    theme: 'from-orange-100 to-red-50',
  },
  {
    id: 'deity-durga',
    name: 'Durga',
    sanskritName: 'श्री दुर्गा',
    description: 'The divine mother who protects the world and restores balance through courage.',
    significance: 'Honored for strength, protection, and the victory of righteousness over harmful forces.',
    mantra: 'ॐ दुं दुर्गायै नमः',
    tags: ['strength', 'protection', 'victory'],
    theme: 'from-rose-100 to-orange-50',
  },
  {
    id: 'deity-krishna',
    name: 'Krishna',
    sanskritName: 'श्री कृष्ण',
    description: 'The playful teacher of devotion, wisdom, compassion, and divine joy.',
    significance: 'Recited for devotion, understanding, love, and the gentle guidance of dharma.',
    mantra: 'ॐ कृष्णाय नमः',
    tags: ['devotion', 'wisdom', 'joy'],
    theme: 'from-indigo-100 to-sky-50',
  },
  {
    id: 'deity-rama',
    name: 'Rama',
    sanskritName: 'श्री राम',
    description: 'The ideal king, son, and devotee whose life teaches duty and compassion.',
    significance: 'Remembered for righteousness, truthfulness, courage, and family devotion.',
    mantra: 'श्री राम जय राम जय जय राम',
    tags: ['dharma', 'truth', 'courage'],
    theme: 'from-amber-100 to-rose-50',
  },
  {
    id: 'deity-kali',
    name: 'Kali',
    sanskritName: 'श्री काली',
    description: 'The fierce mother who destroys fear, ignorance, and inner bondage.',
    significance: 'Invoked for protection, courage, transformation, and the cutting away of falsehood.',
    mantra: 'ॐ क्रीं कालिकायै नमः',
    tags: ['protection', 'transformation', 'strength'],
    theme: 'from-zinc-900 to-slate-700',
  },
  {
    id: 'deity-surya',
    name: 'Surya',
    sanskritName: 'श्री सूर्य',
    description: 'The solar deity associated with vitality, clarity, discipline, and daily order.',
    significance: 'Remembered at sunrise for health, steady routine, and grateful awareness.',
    mantra: 'ॐ घृणिः सूर्याय नमः',
    tags: ['vitality', 'clarity', 'discipline'],
    theme: 'from-yellow-100 to-orange-50',
  },
  {
    id: 'deity-narayana',
    name: 'Narayana',
    sanskritName: 'श्री नारायण',
    description: 'The all-pervading divine presence who sustains, protects, and guides creation.',
    significance: 'Used in prayers that seek refuge, preservation, and deep devotional surrender.',
    mantra: 'ॐ नमो नारायणाय',
    tags: ['preservation', 'refuge', 'dharma'],
    theme: 'from-cyan-100 to-sky-50',
  },
];

export const DEFAULT_STOTRAS: Stotra[] = [
  {
    id: 'stotra-hanuman-chalisa',
    title: 'Hanuman Chalisa',
    alternateTitle: 'श्री हनुमान चालीसा',
    deity: 'Hanuman',
    category: 'Chalisa',
    content: `Starter sample excerpt only.

श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।
बरनऊँ रघुबर विमल जसु, जो दायकु फल चारी॥

Verify the full text before public release.`,
    nepaliMeaning: 'The Hanuman Chalisa reminds readers of devotion, courage, and steady faith in Shri Ram.',
    wordMeaning: 'Simple starter summary in English. Replace with a verified translation before public release.',
    benefits: 'Traditionally recited for courage, protection, steady mind, and devotional focus.',
    process: 'Recite with a clean mind, preferably in the morning or during Hanuman puja.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['hanuman', 'chalisa', 'protection', 'devotion'],
    language: 'Hindi / Awadhi',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-shiva-tandava',
    title: 'Shiva Tandava Stotram',
    alternateTitle: 'शिव ताण्डव स्तोत्रम्',
    deity: 'Shiva',
    category: 'Stotram',
    content: `Starter sample excerpt only.

जटाटवीगलज्जलप्रवाहपावितस्थले
गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्॥

Verify the full text before public release.`,
    nepaliMeaning: 'This stotra praises Shiva’s vast, powerful, and auspicious presence.',
    wordMeaning: 'Simple starter summary in English. Replace with a verified translation before public release.',
    benefits: 'Traditionally read for strength, focus, devotion, and deep spiritual reflection.',
    process: 'Chant slowly and clearly. The rhythm matters more than speed in devotional reading.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['shiva', 'stotram', 'tandava', 'sanskrit'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-mahalakshmi-ashtakam',
    title: 'Mahalakshmi Ashtakam',
    alternateTitle: 'महालक्ष्मी अष्टकम्',
    deity: 'Lakshmi',
    category: 'Ashtakam',
    content: `Starter sample excerpt only.

नमस्तेऽस्तु महामाये श्रीपीठे सुरपूजिते।
शङ्खचक्रगदाहस्ते महालक्ष्मि नमोऽस्तुते॥

Verify the full text before public release.`,
    nepaliMeaning: 'Mahalakshmi Ashtakam praises Lakshmi with reverence for grace, auspiciousness, and prosperity.',
    wordMeaning: 'Simple starter summary in English. Replace with a verified translation before public release.',
    benefits: 'Traditionally recited for grace, prosperity, harmony, and a positive household atmosphere.',
    process: 'Read on Fridays, during Lakshmi puja, or during a quiet evening prayer.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['lakshmi', 'ashtakam', 'prosperity', 'grace'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-saraswati-vandana',
    title: 'Saraswati Vandana',
    alternateTitle: 'सरस्वती वन्दना',
    deity: 'Saraswati',
    category: 'Vandana',
    content: `Starter sample excerpt only.

या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता।
या वीणावरदण्डमण्डितकरा या श्वेतपद्मासना॥

Verify the full text before public release.`,
    nepaliMeaning: 'Saraswati Vandana honors knowledge, speech, music, and pure wisdom.',
    wordMeaning: 'Simple starter summary in English. Replace with a verified translation before public release.',
    benefits: 'Traditionally used for studies, music, memory, concentration, and clarity of speech.',
    process: 'Recite before study, practice, or any learning-focused beginning.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['saraswati', 'vandana', 'knowledge', 'learning'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-ganesh-stotra',
    title: 'Ganesh Stotra',
    alternateTitle: 'गणेश स्तोत्र',
    deity: 'Ganesh',
    category: 'Stotram',
    content: `Starter sample excerpt only.

वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।
निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥

Verify the full text before public release.`,
    nepaliMeaning: 'This Ganesh stotra remembers the remover of obstacles and prays for auspicious beginnings and success.',
    wordMeaning: 'Simple starter summary in English. Replace with a verified translation before public release.',
    benefits: 'Traditionally recited before new work, study, travel, and puja to invite auspicious beginnings.',
    process: 'Recite first in the morning or before any important activity.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['ganesh', 'stotra', 'beginnings', 'wisdom'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-vishnu-sahasranama',
    title: 'Vishnu Sahasranama Intro',
    alternateTitle: 'विष्णु सहस्रनाम परिचय',
    deity: 'Vishnu',
    category: 'Sahasranama',
    content: `Starter sample excerpt only.

This starter entry introduces the tradition of chanting the thousand names of Vishnu.
Use a verified edition for public reading.

Verify full text before public release.`,
    nepaliMeaning: 'This starter entry introduces the devotional importance of the Vishnu Sahasranama tradition.',
    benefits: 'Traditionally recited for protection, steady mind, and remembrance of divine qualities.',
    process: 'Read as an introduction or use a verified traditional edition for full chanting.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['vishnu', 'sahasranama', 'protection', 'preservation'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-durga-kavach',
    title: 'Durga Kavach Intro',
    alternateTitle: 'दुर्गा कवच परिचय',
    deity: 'Durga',
    category: 'Kavach',
    content: `Starter sample excerpt only.

This starter entry introduces the protective devotional tradition associated with Durga Kavach.
Use a verified text for public reading.

Verify full text before public release.`,
    nepaliMeaning: 'This starter entry introduces the protective and empowering tradition of Durga Kavach.',
    benefits: 'Traditionally associated with courage, protection, and devotional confidence.',
    process: 'Read as an introduction or chant only from a verified traditional source.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['durga', 'kavach', 'protection', 'strength'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-aditya-hridayam',
    title: 'Aditya Hridayam Intro',
    alternateTitle: 'आदित्यहृदयम् परिचय',
    deity: 'Surya',
    category: 'Stotram',
    content: `Starter sample excerpt only.

This starter entry introduces the solar prayer tradition of Aditya Hridayam.
Use a verified edition for public reading.

Verify full text before public release.`,
    nepaliMeaning: 'Aditya Hridayam recalls Surya’s energy, clarity, and steady strength.',
    benefits: 'Traditionally recited for vitality, confidence, and focused action.',
    process: 'Best remembered near sunrise or as part of a morning prayer routine.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['surya', 'aditya', 'energy', 'clarity'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-krishna-ashtakam',
    title: 'Krishna Ashtakam Intro',
    alternateTitle: 'कृष्णाष्टकम् परिचय',
    deity: 'Krishna',
    category: 'Ashtakam',
    content: `Starter sample excerpt only.

This starter entry introduces a Krishna devotional eight-verse tradition.
Use a verified edition for public reading.

Verify full text before public release.`,
    nepaliMeaning: 'This starter entry presents Krishna’s gentle devotion, joy, and teaching spirit.',
    benefits: 'Traditionally recited for devotion, joy, and loving remembrance of dharma.',
    process: 'Read in the evening or during a personal devotional pause.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['krishna', 'ashtakam', 'devotion', 'joy'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-ram-raksha',
    title: 'Ram Raksha Stotra Intro',
    alternateTitle: 'रामरक्षास्तोत्रम् परिचय',
    deity: 'Rama',
    category: 'Kavach',
    content: `Starter sample excerpt only.

This starter entry introduces the protective Ram Raksha tradition.
Use a verified edition for public reading.

Verify full text before public release.`,
    nepaliMeaning: 'Ram Raksha Stotra remembers the name of Rama and protective devotion.',
    benefits: 'Traditionally recited for protection, courage, and alignment with dharma.',
    process: 'Read quietly before travel, study, or a day of responsibility.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['rama', 'kavach', 'protection', 'dharma'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-om-jai-jagdish-hare',
    title: 'Om Jai Jagdish Hare',
    alternateTitle: 'ॐ जय जगदीश हरे',
    deity: 'Vishnu',
    category: 'Aarti',
    content: `Starter sample excerpt only.

ॐ जय जगदीश हरे
स्वामी जय जगदीश हरे
भक्त जनों के संकट क्षण में दूर करे॥

Verify full text before public release.`,
    nepaliMeaning: 'This aarti expresses devotion, refuge, and blessing to Jagdish/Vishnu.',
    benefits: 'Traditionally sung at the close of worship to offer gratitude and collective devotion.',
    process: 'Sing during evening worship or after concluding a puja ceremony.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['aarti', 'vishnu', 'gratitude', 'closing'],
    language: 'Hindi',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-ganesh-aarti',
    title: 'Ganesh Aarti',
    alternateTitle: 'गणेश आरती',
    deity: 'Ganesh',
    category: 'Aarti',
    content: `Starter sample excerpt only.

जय गणेश, जय गणेश, जय गणेश देवा
माता जाकी पार्वती, पिता महादेवा॥

Verify full text before public release.`,
    nepaliMeaning: 'Ganesh Aarti celebrates auspicious beginnings, joy, and the remover of obstacles.',
    benefits: 'Traditionally sung at the beginning or end of Ganesh worship and family gatherings.',
    process: 'Sing after offering lamp and flowers.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['aarti', 'ganesh', 'beginnings', 'devotion'],
    language: 'Hindi',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-shiv-aarti',
    title: 'Shiv Aarti',
    alternateTitle: 'शिव आरती',
    deity: 'Shiva',
    category: 'Aarti',
    content: `Starter sample excerpt only.

ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा
ब्रह्मा विष्णु सदाशिव, अर्धांगी धारा॥

Verify full text before public release.`,
    nepaliMeaning: 'Shiva Aarti remembers Shiva’s peace, timeless presence, and auspicious nature.',
    benefits: 'Traditionally sung during Shiva worship for reverence and inward calm.',
    process: 'Sing after offering water, flowers, or bilva leaves in Shiva puja.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['aarti', 'shiva', 'peace', 'devotion'],
    language: 'Hindi',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-lakshmi-aarti',
    title: 'Lakshmi Aarti',
    alternateTitle: 'लक्ष्मी आरती',
    deity: 'Lakshmi',
    category: 'Aarti',
    content: `Starter sample excerpt only.

ॐ जय लक्ष्मी माता
मैया जय लक्ष्मी माता
तुमको निश्चय सेवत, हर विष्णु विधाता॥

Verify full text before public release.`,
    nepaliMeaning: 'Lakshmi Aarti praises prosperity, gratitude, and the auspiciousness of the home.',
    benefits: 'Traditionally sung on Fridays, Diwali, and after Lakshmi puja.',
    process: 'Sing after offering lamp, flowers, and prasad.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['aarti', 'lakshmi', 'prosperity', 'gratitude'],
    language: 'Hindi',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-hanuman-aarti',
    title: 'Hanuman Aarti',
    alternateTitle: 'हनुमान आरती',
    deity: 'Hanuman',
    category: 'Aarti',
    content: `Starter sample excerpt only.

आरती कीजै हनुमान लला की
दुष्ट दलन रघुनाथ कला की॥

Verify full text before public release.`,
    nepaliMeaning: 'Hanuman Aarti praises courage, protection, and the spirit of service to Shri Ram.',
    benefits: 'Traditionally sung on Tuesdays, Saturdays, and during Hanuman worship.',
    process: 'Sing after reciting Hanuman Chalisa or a Hanuman mantra.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['aarti', 'hanuman', 'protection', 'devotion'],
    language: 'Hindi',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-durga-aarti',
    title: 'Durga Aarti',
    alternateTitle: 'दुर्गा आरती',
    deity: 'Durga',
    category: 'Aarti',
    content: `Starter sample excerpt only.

जय अम्बे गौरी, मैया जय श्यामा गौरी
तुमको निशदिन ध्यावत, हर विष्णु-विधाता

Verify full text before public release.`,
    nepaliMeaning: 'Durga Aarti remembers the Divine Mother as protective and compassionate.',
    benefits: 'Traditionally sung to honor strength, protection, and the grace of the divine mother.',
    process: 'Sing during Navaratri, Durga puja, or a family evening worship.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['aarti', 'durga', 'protection', 'mother'],
    language: 'Hindi',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-saraswati-aarti',
    title: 'Saraswati Aarti',
    alternateTitle: 'सरस्वती आरती',
    deity: 'Saraswati',
    category: 'Aarti',
    content: `Starter sample excerpt only.

जय सरस्वती माता, मैया जय सरस्वती माता
सद्गुण और विद्या दो, करुणा बरसाता

Verify full text before public release.`,
    nepaliMeaning: 'Saraswati Aarti praises knowledge, art, and eloquent speech.',
    benefits: 'Traditionally sung during study, music, or Saraswati puja.',
    process: 'Sing after offering flowers and before beginning study or practice.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['aarti', 'saraswati', 'learning', 'music'],
    language: 'Hindi',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-gayatri-mantra',
    title: 'Gayatri Mantra',
    alternateTitle: 'गायत्री मन्त्र',
    deity: 'Surya',
    category: 'Mantra',
    content: `Starter sample excerpt only.

ॐ भूर्भुवः स्वः
तत्सवितुर्वरेण्यं
भर्गो देवस्य धीमहि
धियो यो नः प्रचोदयात्

Verify full text before public release.`,
    nepaliMeaning: 'The Gayatri Mantra prays for wisdom, clarity, and awakening toward truth.',
    benefits: 'Traditionally recited for focus, learning, and inner clarity.',
    process: 'Chant during dawn or before study with a calm, steady breath.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['mantra', 'surya', 'learning', 'clarity'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-mahamrityunjaya',
    title: 'Mahamrityunjaya Mantra',
    alternateTitle: 'महामृत्युंजय मन्त्र',
    deity: 'Shiva',
    category: 'Mantra',
    content: `Starter sample excerpt only.

ॐ त्र्यम्बकं यजामहे
सुगन्धिं पुष्टिवर्धनम्
उर्वारुकमिव बन्धनान्
मृत्योर्मुक्षीय मामृतात्

Verify full text before public release.`,
    nepaliMeaning: 'This mantra prays for Shiva’s grace, protection, and deep peace.',
    benefits: 'Traditionally recited for courage, healing prayers, and liberation from fear.',
    process: 'Chant slowly in a quiet place with devotion and clear intention.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['mantra', 'shiva', 'protection', 'peace'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
  {
    id: 'stotra-om-namah-shivaya',
    title: 'Om Namah Shivaya',
    alternateTitle: 'ॐ नमः शिवाय',
    deity: 'Shiva',
    category: 'Mantra',
    content: `Starter sample excerpt only.

ॐ नमः शिवाय
ॐ नमः शिवाय
ॐ नमः शिवाय

Verify full text before public release.`,
    nepaliMeaning: 'This Panchakshari mantra remembers Shiva’s peace and presence.',
    benefits: 'Traditionally used for meditation, steadiness, and devotional repetition.',
    process: 'Repeat gently during meditation, morning prayer, or quiet reflection.',
    source: 'Starter excerpt, verify full text before public release',
    tags: ['mantra', 'shiva', 'meditation', 'peace'],
    language: 'Sanskrit',
    script: 'Devanagari',
    status: 'published',
  },
];

export const DEFAULT_POOJA_BIDHI: PoojaBidhi[] = [
  {
    id: 'pooja-ganesh',
    title: 'Ganesh Puja',
    deity: 'Ganesh',
    occasion: 'Before new beginnings, studies, business, travel, or house rituals.',
    overview: 'A simple worship flow for inviting clear beginnings and obstacle removal.',
    materials: ['Diya', 'Incense', 'Flowers', 'Water', 'Durva grass', 'Modak or sweets', 'Rice / akshata'],
    steps: [
      'Clean the worship area and sit with a calm mind.',
      'Place a Ganesh image or symbol and offer water, flowers, and incense.',
      'Chant a Ganesh mantra or stotra with devotion.',
      'Offer modak or sweets as naivedya and pray for wisdom and success.',
      'End by thanking the deity and distributing prasad.',
    ],
    benefits: ['Helps begin work with clarity', 'Encourages calm and focus', 'Traditionally invites auspiciousness'],
    cautions: 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.',
    tags: ['ganesh', 'puja', 'beginnings', 'durva'],
    source: 'General puja guidance; traditions vary by family and region',
  },
  {
    id: 'pooja-shiva',
    title: 'Shiva Puja',
    deity: 'Shiva',
    occasion: 'Mondays, Mahashivaratri, or personal meditation practice.',
    overview: 'A devotional Shiva worship flow centered on simplicity, water, and mantra.',
    materials: ['Diya', 'Incense', 'Water', 'Milk', 'Bilva leaves', 'Flowers', 'Prayer beads'],
    steps: [
      'Wash hands and prepare a clean altar.',
      'Offer water or milk to the Shiva lingam or image.',
      'Offer bilva leaves, flowers, and light a lamp.',
      'Chant Om Namah Shivaya or a Shiva stotra.',
      'Sit quietly for a few minutes and close with gratitude.',
    ],
    benefits: ['Encourages stillness and devotion', 'Supports a meditative mood', 'Traditionally associated with inner strength'],
    cautions: 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.',
    tags: ['shiva', 'puja', 'bilva', 'meditation'],
    source: 'General puja guidance; traditions vary by family and region',
  },
  {
    id: 'pooja-lakshmi',
    title: 'Lakshmi Puja',
    deity: 'Lakshmi',
    occasion: 'Diwali, Fridays, or times of gratitude and household prayer.',
    overview: 'A prayer flow for inviting auspiciousness, cleanliness, and gratitude into the home.',
    materials: ['Diya', 'Incense', 'Flowers', 'Rice / akshata', 'Coin or kalash', 'Sweet offering', 'Clean cloth', 'Lotus symbol if available'],
    steps: [
      'Clean the altar and arrange the image or symbol of Lakshmi.',
      'Light a lamp and offer flowers, rice, and clean water.',
      'Recite a Lakshmi mantra or stotra with a grateful heart.',
      'Offer sweets or fruits as prasad.',
      'Pray for harmony, prosperity, and responsible use of blessings.',
    ],
    benefits: ['Supports gratitude and household focus', 'Encourages cleanliness and order', 'Traditionally linked with prosperity'],
    cautions: 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.',
    tags: ['lakshmi', 'puja', 'prosperity', 'lotus'],
    source: 'General puja guidance; traditions vary by family and region',
  },
  {
    id: 'pooja-saraswati',
    title: 'Saraswati Puja',
    deity: 'Saraswati',
    occasion: 'Vasant Panchami, study beginnings, or before creative work.',
    overview: 'A respectful worship flow for learning, music, and clear speech.',
    materials: ['Books or writing tools', 'Diya', 'Incense', 'Flowers', 'White cloth', 'Fruit', 'Clean water'],
    steps: [
      'Place books or instruments near the altar respectfully.',
      'Offer flowers and light a lamp.',
      'Chant a Saraswati mantra or vandana.',
      'Pray for knowledge, memory, and disciplined study.',
      'Read a few lines from a stotra as a closing act.',
    ],
    benefits: ['Encourages learning and concentration', 'Supports students and artists', 'Traditionally linked with purity of thought'],
    cautions: 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.',
    tags: ['saraswati', 'puja', 'learning', 'books'],
    source: 'General puja guidance; traditions vary by family and region',
  },
  {
    id: 'pooja-hanuman',
    title: 'Hanuman Puja',
    deity: 'Hanuman',
    occasion: 'Tuesdays, Saturdays, or when seeking courage and discipline.',
    overview: 'A simple worship flow emphasizing devotion, courage, and protection.',
    materials: ['Diya', 'Incense', 'Flowers', 'Sindoor', 'Fruit', 'Prayer beads', 'Red cloth if available'],
    steps: [
      'Clean the prayer place and sit with attention.',
      'Offer flowers, incense, and sindoor respectfully.',
      'Recite Hanuman Chalisa or a Hanuman mantra.',
      'Pray for courage, focus, and selfless service.',
      'Conclude with a quiet moment and prasad.',
    ],
    benefits: ['Traditionally supports courage and protection', 'Encourages discipline', 'Helps cultivate devotion and service'],
    cautions: 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.',
    tags: ['hanuman', 'puja', 'protection', 'sindoor'],
    source: 'General puja guidance; traditions vary by family and region',
  },
  {
    id: 'pooja-satyanarayan',
    title: 'Satyanarayan Puja',
    deity: 'Narayana',
    occasion: 'Family occasions, gratitude rituals, and household gatherings.',
    overview: 'A household puja centered on truth, gratitude, and shared devotion.',
    materials: ['Kalash', 'Diya', 'Incense', 'Flowers', 'Fruit', 'Sweet offering', 'Rice / akshata', 'Panchamrit where used'],
    steps: [
      'Prepare the altar and gather family members if possible.',
      'Offer flowers, fruit, and light the lamp.',
      'Read the Satyanarayan katha or a family-approved summary.',
      'Offer prasad and share the story together.',
      'Close with gratitude and blessings for the home.',
    ],
    benefits: ['Supports family devotion', 'Encourages gratitude and truthfulness', 'Traditionally used for auspicious household events'],
    cautions: 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.',
    tags: ['narayana', 'puja', 'family', 'truth'],
    source: 'General puja guidance; traditions vary by family and region',
  },
  {
    id: 'pooja-durga',
    title: 'Durga Puja',
    deity: 'Durga',
    occasion: 'Navaratri, Fridays, or whenever protection and courage are remembered.',
    overview: 'A devotional practice for honoring the divine mother and her protective strength.',
    materials: ['Diya', 'Incense', 'Flowers', 'Water', 'Red cloth', 'Fruit', 'Sweets', 'Rice / akshata'],
    steps: [
      'Clean the altar and place a Durga image or symbol.',
      'Offer flowers, water, and a lamp with attention.',
      'Chant a Durga mantra or read a short stotra.',
      'Offer fruits or sweets as prasad.',
      'Pray for strength, courage, and protection for the household.',
    ],
    benefits: ['Supports courage and resilience', 'Encourages protection and discipline', 'Traditionally used in Navaratri observance'],
    cautions: 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.',
    tags: ['durga', 'puja', 'strength', 'navaratri'],
    source: 'General puja guidance; traditions vary by family and region',
  },
  {
    id: 'pooja-surya',
    title: 'Surya Puja',
    deity: 'Surya',
    occasion: 'Sunrise worship, Sunday observance, or gratitude for health and energy.',
    overview: 'A simple sunrise devotion for clarity, vitality, and disciplined daily rhythm.',
    materials: ['Clean water', 'Diya', 'Flowers', 'Rice / akshata', 'Red flower if available', 'Copper vessel if used by family tradition'],
    steps: [
      'Stand at sunrise and offer a respectful prayer.',
      'Offer water or arghya according to family practice.',
      'Chant a Surya mantra or read a short hymn.',
      'Sit quietly and offer gratitude for light and life.',
      'Begin the day with a calm and disciplined mind.',
    ],
    benefits: ['Supports routine and clarity', 'Encourages gratitude for daily life', 'Traditionally linked with vitality and discipline'],
    cautions: 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.',
    tags: ['surya', 'puja', 'sunrise', 'vitality'],
    source: 'General puja guidance; traditions vary by family and region',
  },
];

export const DEFAULT_STORIES: HinduStory[] = [
  {
    id: 'story-ganesha-parents',
    title: 'Ganesha and the Wisdom of Parents',
    deity: 'Ganesh',
    summary: 'A gentle reminder that wisdom also includes listening to loving guidance.',
    story: 'In the familiar telling of Ganesha, the lesson is not only intelligence but also patience, humility, and the ability to understand a greater purpose. The story encourages families to value guidance and respect within the home.',
    lesson: 'Wisdom grows when intelligence is joined with humility and respect.',
    tags: ['ganesha', 'wisdom', 'family'],
  },
  {
    id: 'story-hanuman-ram',
    title: 'Hanuman\'s Devotion to Shri Ram',
    deity: 'Hanuman',
    summary: 'Hanuman shows that devotion becomes powerful when it is selfless and steady.',
    story: 'Hanuman is remembered as the perfect servant of Shri Ram. His strength, courage, and focus become meaningful because they are offered in service. The story helps readers understand devotion as action, not only feeling.',
    lesson: 'Great strength becomes sacred when it is used in service of dharma.',
    tags: ['hanuman', 'ram', 'devotion'],
  },
  {
    id: 'story-shiva-halahala',
    title: 'Shiva Drinking Halahala',
    deity: 'Shiva',
    summary: 'A story of sacrifice, responsibility, and protection of the world from harm.',
    story: 'During the churning of the ocean, a dangerous poison emerged. Shiva accepted the burden so the world could be protected. The tale is remembered as an image of calm power and deep sacrifice, not reckless force.',
    lesson: 'True greatness protects others, even when the cost is personal.',
    tags: ['shiva', 'sacrifice', 'protection'],
  },
  {
    id: 'story-lakshmi-humility',
    title: 'Lakshmi and Humility',
    deity: 'Lakshmi',
    summary: 'Prosperity becomes meaningful when it is paired with humility, cleanliness, and gratitude.',
    story: 'Stories of Lakshmi teach that a home becomes auspicious when it is kept clean, respectful, and generous. Wealth without discipline fades quickly, while prosperity with gratitude becomes a blessing for the whole family.',
    lesson: 'Humility helps prosperity stay meaningful and nourishing.',
    tags: ['lakshmi', 'prosperity', 'gratitude'],
  },
  {
    id: 'story-saraswati-knowledge',
    title: 'Saraswati and the Gift of Knowledge',
    deity: 'Saraswati',
    summary: 'Knowledge is a gift that becomes valuable when used with care and humility.',
    story: 'Saraswati stories remind us that learning is sacred. A book, a song, or a careful thought can become a form of worship when it is used to support clarity, kindness, and truth. The story invites students to respect study as a spiritual practice.',
    lesson: 'Knowledge is most beautiful when it serves wisdom and compassion.',
    tags: ['saraswati', 'knowledge', 'learning'],
  },
  {
    id: 'story-krishna-govardhan',
    title: 'Krishna Lifting Govardhan',
    deity: 'Krishna',
    summary: 'A story of protection, humility, and the reminder that divine help comes in many forms.',
    story: 'The Govardhan story is remembered as a lesson that pride gives way to care and protection. Krishna\'s action shows that true leadership shelters the community and teaches people to look beyond ego.',
    lesson: 'Protection and humility are stronger than pride.',
    tags: ['krishna', 'protection', 'govardhan'],
  },
  {
    id: 'story-prahlad-narasimha',
    title: 'Prahlad and Narasimha',
    deity: 'Narayana',
    summary: 'Faith remains steady even when circumstances are difficult or fearful.',
    story: 'Prahlad\'s devotion is remembered as a symbol of unwavering trust in the divine. Narasimha appears as protection when injustice becomes too great. The story teaches that truth and devotion can survive fear.',
    lesson: 'Steady faith can outlast fear and injustice.',
    tags: ['narasimha', 'faith', 'protection'],
  },
  {
    id: 'story-rama-bridge',
    title: 'Rama and the Bridge to Lanka',
    deity: 'Rama',
    summary: 'A story of shared effort, duty, and the power of righteous purpose.',
    story: 'The bridge to Lanka is remembered as a symbol of cooperation, trust, and the strength of dharmic action. Rama\'s journey is not only heroic, but also rooted in responsibility, loyalty, and moral clarity.',
    lesson: 'A righteous purpose becomes stronger when carried by many hands.',
    tags: ['rama', 'dharma', 'cooperation'],
  },
  {
    id: 'story-durga-mahishasura',
    title: 'Durga and Mahishasura',
    deity: 'Durga',
    summary: 'A story about courage, justice, and the protection of the world from destructive force.',
    story: 'Durga\'s victory over Mahishasura is remembered as the triumph of courage and divine protection over arrogance and violence. The tale inspires confidence in the power of righteous action.',
    lesson: 'Courage guided by righteousness can restore balance.',
    tags: ['durga', 'courage', 'victory'],
  },
  {
    id: 'story-surya-karna',
    title: 'Surya and Karna',
    deity: 'Surya',
    summary: 'A story that ties discipline, legacy, and the search for identity to the light of the sun.',
    story: 'Karna\'s connection with Surya is remembered in many ways across the tradition. The story highlights discipline, radiance, and the struggle to live honorably under difficult circumstances.',
    lesson: 'The light of duty shines even in difficult circumstances.',
    tags: ['surya', 'karna', 'discipline'],
  },
];

export const DEFAULT_PANCHANG_CONTENT: PanchangContent = {
  introTitle: 'Educational Panchang Guide',
  intro: 'This page offers a local-first learning guide for daily Hindu calendar concepts. Exact Panchang values vary by location, time zone, family tradition, and calculation method.',
  terms: [
    { title: 'Tithi', text: 'The lunar day used in Hindu calendrical tradition. It changes with the relationship between the Sun and Moon.' },
    { title: 'Nakshatra', text: 'A lunar mansion or star grouping associated with the Moon position in traditional calculations.' },
    { title: 'Yoga', text: 'A calculated combination of Sun and Moon positions used in Panchang interpretation.' },
    { title: 'Karana', text: 'Half of a tithi, used in traditional timing and ritual planning.' },
    { title: 'Rahu Kaal', text: 'A daytime period many families avoid for beginning important work.' },
  ],
  dailyNotes: [
    { title: 'Morning reflection', text: 'Many families begin with a short prayer, mantra, or stotra reading after bathing or preparing the home altar.' },
    { title: 'Evening prayer', text: 'Evening worship is often used for gratitude, quiet reading, and family devotional rhythm.' },
    { title: 'Location matters', text: 'Sunrise, sunset, tithi, and nakshatra should be checked with a trusted local Panchang for formal use.' },
    { title: 'Tradition matters', text: 'Ritual choices can vary by family, region, and sampradaya. Follow the tradition you have received.' },
  ],
  disclaimer: 'Panchang values vary by location, time zone, and calculation method. Verify formal timings with a trusted Panchang, family tradition, or priest.',
};

export const DEFAULT_CONTENT = {
  categories: DEFAULT_CATEGORIES,
  deities: DEFAULT_DEITIES,
  stotras: DEFAULT_STOTRAS,
  poojaBidhi: DEFAULT_POOJA_BIDHI,
  stories: DEFAULT_STORIES,
  panchang: DEFAULT_PANCHANG_CONTENT,
};
