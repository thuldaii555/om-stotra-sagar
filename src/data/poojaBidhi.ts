import type { PoojaBidhi } from '../types';

const SOURCE = 'Original concise home worship guide based on general Hindu puja structure; verify details with family tradition, sampradaya, or a priest.';
const CAUTION = 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.';
const SOURCE_NE = 'सामान्य हिन्दू पूजा संरचनामा आधारित संक्षिप्त घरपूजा मार्गदर्शन; परिवार, सम्प्रदाय वा पुरोहितसँग विवरण पुष्टि गर्नुहोस्।';
const CAUTION_NE = 'परम्परा परिवार, क्षेत्र र सम्प्रदायअनुसार फरक हुन सक्छ। ठूलो विधिका लागि पुरोहित वा परिवारका ज्येष्ठसँग परामर्श गर्नुहोस्।';

const titleNeByTitle: Record<string, string> = {
  'Ganesh Puja': 'गणेश पूजा',
  'Shiva Puja': 'शिव पूजा',
  'Lakshmi Puja': 'लक्ष्मी पूजा',
  'Saraswati Puja': 'सरस्वती पूजा',
  'Hanuman Puja': 'हनुमान पूजा',
  'Satyanarayan Puja': 'सत्यनारायण पूजा',
  'Durga Puja': 'दुर्गा पूजा',
  'Surya Puja': 'सूर्य पूजा',
  'Krishna Puja': 'कृष्ण पूजा',
  'Rama Puja': 'राम पूजा',
  'Kali Puja': 'काली पूजा',
  'Navagraha Puja Basic Guide': 'नवग्रह पूजा आधारभूत विधि',
};

const deityNeByName: Record<string, string> = {
  Ganesh: 'गणेश',
  Shiva: 'शिव',
  Lakshmi: 'लक्ष्मी',
  Saraswati: 'सरस्वती',
  Hanuman: 'हनुमान',
  Narayana: 'नारायण',
  Durga: 'दुर्गा',
  Surya: 'सूर्य',
  Krishna: 'कृष्ण',
  Rama: 'राम',
  Kali: 'काली',
};

const guide = (
  id: string,
  title: string,
  deity: string,
  occasion: string,
  overview: string,
  materials: string[],
  steps: string[],
  benefits: string[],
  tags: string[]
): PoojaBidhi => ({
  id,
  title,
  titleNe: titleNeByTitle[title],
  deity,
  deityNe: deityNeByName[deity],
  occasion,
  overview,
  materials,
  steps,
  benefits,
  cautions: CAUTION,
  cautionsNe: CAUTION_NE,
  source: SOURCE,
  sourceNe: SOURCE_NE,
  tags: [...new Set([deity.toLowerCase(), 'puja', ...tags])],
});

const commonSteps = [
  'Clean the worship place and arrange the altar.',
  'Light diya and incense with a calm mind.',
  'Take a simple sankalpa for sincere worship.',
  'Invoke the deity and offer water, flowers, and akshata.',
  'Chant a mantra, stotra, or aarti with devotion.',
  'Offer naivedya and pray quietly.',
  'Perform aarti and distribute prasad respectfully.',
];

export const DEFAULT_POOJA_BIDHI: PoojaBidhi[] = [
  guide('pooja-ganesh', 'Ganesh Puja', 'Ganesh', 'Before new beginnings, study, travel, business, house rituals, or festivals.', 'A practical home worship flow for auspicious beginnings, clarity, and obstacle removal.', ['Diya', 'Incense', 'Flowers', 'Water', 'Durva grass', 'Modak or sweets', 'Rice / akshata', 'Sandalwood paste', 'Kumkum'], ['Clean the altar and place a Ganesh image or symbol.', 'Offer water, sandalwood paste, flowers, durva, and akshata.', 'Chant Om Gam Ganapataye Namah or a Ganesh stotra.', 'Offer modak, sweets, or fruit as naivedya.', 'Perform Ganesh Aarti and pray for wisdom and humility.', 'Distribute prasad and begin the work with steadiness.'], ['Supports a calm beginning', 'Encourages focus and humility', 'Traditionally invites auspiciousness'], ['beginnings', 'durva', 'modak']),
  guide('pooja-shiva', 'Shiva Puja', 'Shiva', 'Mondays, Mahashivaratri, Pradosh, or personal meditation practice.', 'A simple Shiva worship centered on water, bilva leaves, mantra, and inner stillness.', ['Diya', 'Incense', 'Water', 'Milk', 'Bilva leaves', 'Flowers', 'Rice / akshata', 'Sandalwood paste', 'Prayer beads'], ['Prepare a clean altar with a Shiva lingam or image.', 'Offer water or milk according to family practice.', 'Offer bilva leaves, flowers, sandalwood paste, and akshata.', 'Chant Om Namah Shivaya or Mahamrityunjaya Mantra.', 'Sit quietly for a few minutes in meditation.', 'Perform Shiva Aarti and close with gratitude.'], ['Encourages stillness', 'Supports reflective practice', 'Traditionally associated with inner strength'], ['bilva', 'monday', 'mahashivaratri']),
  guide('pooja-lakshmi', 'Lakshmi Puja', 'Lakshmi', 'Diwali, Fridays, full moon evenings, or household gratitude prayer.', 'A home worship flow for gratitude, cleanliness, generosity, and auspicious prosperity.', ['Diya', 'Incense', 'Flowers', 'Rice / akshata', 'Kumkum', 'Turmeric', 'Coin or kalash', 'Lotus if available', 'Fruit', 'Sweets'], ['Clean the home entrance and altar area.', 'Place Lakshmi image, coin, or kalash on a clean cloth.', 'Light diya and incense and offer flowers, kumkum, turmeric, and akshata.', 'Chant a Lakshmi mantra, Mahalakshmi Ashtakam, or Lakshmi Aarti.', 'Offer sweets or fruit as naivedya.', 'Pray for harmony and wise use of resources.', 'Share prasad with family.'], ['Encourages gratitude and order', 'Supports household harmony', 'Traditionally linked with prosperity'], ['diwali', 'friday', 'prosperity']),
  guide('pooja-saraswati', 'Saraswati Puja', 'Saraswati', 'Vasant Panchami, study beginnings, music practice, or creative work.', 'A respectful worship flow for learning, art, music, writing, and clear speech.', ['Books or writing tools', 'Musical instrument if used', 'Diya', 'Incense', 'White flowers', 'White cloth', 'Fruit', 'Clean water'], ['Place books or instruments respectfully near the altar.', 'Light diya and incense.', 'Offer white flowers, water, and akshata.', 'Chant Om Aim Saraswatyai Namah or Saraswati Vandana.', 'Pray for disciplined study and humble learning.', 'Avoid placing books directly on the floor after worship.', 'Close with a short reading or practice session.'], ['Encourages study discipline', 'Supports creative focus', 'Traditionally linked with clarity of speech'], ['learning', 'books', 'vasant-panchami']),
  guide('pooja-hanuman', 'Hanuman Puja', 'Hanuman', 'Tuesdays, Saturdays, before difficult work, or when seeking courage and discipline.', 'A devotional worship flow emphasizing strength, humility, service, and protection.', ['Diya', 'Incense', 'Flowers', 'Sindoor', 'Red cloth if available', 'Fruit', 'Sweets', 'Prayer beads'], ['Clean the prayer place and sit with attention.', 'Offer flowers, sindoor, and incense respectfully.', 'Chant Om Hanumate Namah or read Hanuman Chalisa.', 'Offer fruit or sweets as naivedya.', 'Pray for courage, discipline, and service-minded action.', 'Perform Hanuman Aarti and distribute prasad.'], ['Supports courage and discipline', 'Encourages selfless service', 'Traditionally associated with protection'], ['tuesday', 'saturday', 'sindoor']),
  guide('pooja-satyanarayan', 'Satyanarayan Puja', 'Narayana', 'Full moon, family milestones, gratitude rituals, and household gatherings.', 'A household puja centered on truthfulness, gratitude, family devotion, and shared katha.', ['Kalash', 'Diya', 'Incense', 'Flowers', 'Tulsi leaves', 'Fruit', 'Sweet offering', 'Rice / akshata', 'Panchamrit where used'], ['Prepare the altar and invite family members to sit together.', 'Place Narayana or Satyanarayan image and kalash if used.', 'Offer flowers, tulsi, fruit, and light the lamp.', 'Read Satyanarayan katha or a family-approved summary.', 'Chant Vishnu or Narayana mantra.', 'Offer prasad and share the story together.', 'Close with gratitude and blessings for truthful living.'], ['Supports family devotion', 'Encourages gratitude and truthfulness', 'Traditionally used for auspicious household events'], ['satyanarayan', 'family', 'truth', 'tulsi']),
  guide('pooja-durga', 'Durga Puja', 'Durga', 'Navaratri, Fridays, or whenever courage and protection are remembered.', 'A devotional practice for honoring the divine mother and her protective strength.', ['Diya', 'Incense', 'Red flowers', 'Water', 'Red cloth', 'Kumkum', 'Rice / akshata', 'Fruit', 'Sweets'], ['Place a Durga image or symbol on a clean altar.', 'Light diya and incense.', 'Offer water, red flowers, kumkum, and akshata.', 'Chant Om Dum Durgayai Namah, Durga Aarti, or a short stotra.', 'Offer fruit or sweets as naivedya.', 'Pray for courage, protection, and righteous action.', 'Perform aarti and share prasad.'], ['Supports courage and resilience', 'Encourages protective devotion', 'Traditionally used in Navaratri observance'], ['navaratri', 'mother', 'strength']),
  guide('pooja-surya', 'Surya Puja', 'Surya', 'Sunrise worship, Sundays, or gratitude for health, light, and energy.', 'A simple sunrise devotion for clarity, vitality, routine, and gratitude.', ['Clean water', 'Copper vessel if available', 'Diya', 'Red flower', 'Rice / akshata', 'Fruit'], ['Stand or sit respectfully near sunrise.', 'Offer water or arghya according to family practice.', 'Offer a red flower and akshata if using an altar.', 'Chant Gayatri Mantra, Surya mantra, or Surya Ashtakam.', 'Offer gratitude for light, health, and daily rhythm.', 'Begin the day with disciplined intention.'], ['Supports daily routine', 'Encourages gratitude', 'Traditionally linked with vitality and clarity'], ['sunrise', 'sunday', 'arghya']),
  guide('pooja-krishna', 'Krishna Puja', 'Krishna', 'Janmashtami, Ekadashi, evenings, or daily bhakti practice.', 'A loving worship flow for devotion, joy, music, and remembrance of Krishna.', ['Diya', 'Incense', 'Flowers', 'Tulsi leaves', 'Butter or sweets where used', 'Fruit', 'Water', 'Peacock feather decoration if available'], ['Arrange Krishna image or murti respectfully.', 'Light diya and incense.', 'Offer water, flowers, tulsi, and fruit.', 'Chant Om Krishnaya Namah, Krishna Ashtakam, or kirtan.', 'Offer makhan, sweets, or simple naivedya according to custom.', 'Pray for love, humility, and dharmic understanding.', 'Perform aarti or sing a short bhajan.'], ['Encourages loving devotion', 'Supports joy and humility', 'Connects family worship with kirtan and stories'], ['janmashtami', 'bhakti', 'tulsi']),
  guide('pooja-rama', 'Rama Puja', 'Rama', 'Ram Navami, Thursdays, family worship, or before duties requiring courage and integrity.', 'A worship flow centered on dharma, truthfulness, family devotion, and steady conduct.', ['Diya', 'Incense', 'Flowers', 'Tulsi leaves if used', 'Fruit', 'Sweets', 'Water', 'Rice / akshata'], ['Place Rama, Sita, Lakshmana, and Hanuman image if available.', 'Light diya and incense.', 'Offer water, flowers, tulsi, and akshata.', 'Chant Shri Ram Jai Ram or read from Ram Raksha / Ramayana.', 'Offer fruit or sweets as naivedya.', 'Pray for truthful speech, courage, and responsibility.', 'Perform aarti and share prasad.'], ['Encourages dharmic reflection', 'Supports family devotion', 'Traditionally associated with courage and truth'], ['ram-navami', 'dharma', 'family']),
  guide('pooja-kali', 'Kali Puja', 'Kali', 'Kali Puja, Amavasya, Navaratri, or prayers for courage and transformation.', 'A respectful home worship outline for Kali as the fierce compassionate mother.', ['Diya', 'Incense', 'Red flowers', 'Water', 'Kumkum', 'Rice / akshata', 'Fruit', 'Sweets', 'Red cloth if available'], ['Prepare the altar respectfully and keep the mood calm.', 'Light diya and incense.', 'Offer water, red flowers, kumkum, and akshata.', 'Chant Om Kreem Kalikayai Namah or a simple Kali stuti.', 'Offer fruit or sweets as naivedya.', 'Pray for courage, truthfulness, and removal of harmful tendencies.', 'Close with aarti or silent gratitude.'], ['Supports courage and self-reflection', 'Encourages release of fear', 'Honors protective motherly grace'], ['amavasya', 'shakti', 'courage']),
  guide('pooja-navagraha', 'Navagraha Puja Basic Guide', 'Surya', 'Before major beginnings, during family observances, or when guided by tradition.', 'A simple educational home guide for honoring the nine grahas with respect and humility.', ['Diya', 'Incense', 'Nine flowers or mixed flowers', 'Water', 'Rice / akshata', 'Sandalwood paste', 'Kumkum', 'Fruit', 'Simple naivedya'], ['Clean the altar and arrange a simple Navagraha symbol or nine small places.', 'Light diya and incense.', 'Take a sankalpa for balanced conduct and humility.', 'Offer water, flowers, and akshata to each graha respectfully.', 'Chant simple names: Surya, Chandra, Mangala, Budha, Guru, Shukra, Shani, Rahu, Ketu.', 'Offer fruit or simple naivedya.', 'Pray for wisdom, patience, and responsible action.', 'For formal remedies or dosha-related rituals, consult a qualified priest.'], ['Encourages humility and reflection', 'Supports respectful awareness of time cycles', 'Useful as a basic family education guide'], ['navagraha', 'graha', 'basic-guide']),
];
