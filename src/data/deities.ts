import type { Deity } from '../types';

const deity = (
  id: string,
  name: string,
  sanskritName: string,
  description: string,
  significance: string,
  mantra: string,
  tags: string[],
  theme: string
): Deity => ({
  id,
  name,
  sanskritName,
  description,
  significance,
  mantra,
  tags: [...new Set([name.toLowerCase(), ...tags])],
  theme,
});

export const DEFAULT_DEITIES: Deity[] = [
  deity('deity-ganesh', 'Ganesh', 'श्री गणेश', 'The deity of wisdom, auspicious beginnings, and obstacle removal.', 'Ganesh is traditionally invoked first before study, travel, worship, business, and important new work.', 'ॐ गं गणपतये नमः', ['beginnings', 'wisdom', 'obstacle-removal'], 'from-amber-100 to-orange-50'),
  deity('deity-shiva', 'Shiva', 'श्री शिव', 'The auspicious lord associated with stillness, transformation, meditation, and grace.', 'Shiva worship supports inner discipline, humility, peace, and the release of harmful tendencies.', 'ॐ नमः शिवाय', ['peace', 'meditation', 'transformation'], 'from-slate-100 to-blue-50'),
  deity('deity-vishnu', 'Vishnu', 'श्री विष्णु', 'The preserver and sustainer who protects dharma and cosmic balance.', 'Vishnu is remembered for refuge, steadiness, protection, and devotion rooted in dharma.', 'ॐ नमो नारायणाय', ['protection', 'dharma', 'preservation'], 'from-sky-100 to-cyan-50'),
  deity('deity-lakshmi', 'Lakshmi', 'श्री लक्ष्मी', 'The goddess of prosperity, grace, beauty, and auspicious abundance.', 'Lakshmi is honored for household harmony, gratitude, cleanliness, generosity, and responsible prosperity.', 'ॐ श्रीं महालक्ष्म्यै नमः', ['prosperity', 'grace', 'auspiciousness'], 'from-rose-100 to-yellow-50'),
  deity('deity-saraswati', 'Saraswati', 'श्री सरस्वती', 'The goddess of learning, music, speech, creativity, and refined knowledge.', 'Saraswati is invoked by students, teachers, artists, and seekers for clarity, humility, and disciplined study.', 'ॐ ऐं सरस्वत्यै नमः', ['knowledge', 'learning', 'music'], 'from-sky-100 to-white'),
  deity('deity-hanuman', 'Hanuman', 'श्री हनुमान', 'The devoted servant of Shri Rama, known for strength, courage, humility, and selfless service.', 'Hanuman is remembered for protection, disciplined mind, devotion to Rama, and fearless service.', 'ॐ हनुमते नमः', ['devotion', 'strength', 'protection'], 'from-orange-100 to-red-50'),
  deity('deity-durga', 'Durga', 'श्री दुर्गा', 'The divine mother who protects, strengthens, and restores balance.', 'Durga is honored for courage, protection, justice, and the victory of righteousness over harmful force.', 'ॐ दुं दुर्गायै नमः', ['strength', 'protection', 'navaratri'], 'from-rose-100 to-orange-50'),
  deity('deity-krishna', 'Krishna', 'श्री कृष्ण', 'The beloved teacher and divine guide associated with devotion, wisdom, compassion, and joy.', 'Krishna is remembered through bhakti, the Bhagavad Gita, kirtan, and stories that teach dharma with love.', 'ॐ कृष्णाय नमः', ['devotion', 'wisdom', 'joy'], 'from-indigo-100 to-sky-50'),
  deity('deity-rama', 'Rama', 'श्री राम', 'The ideal king and embodiment of dharma, truth, courage, and compassion.', 'Rama is remembered for righteous conduct, family devotion, duty, and steady moral clarity.', 'श्री राम जय राम जय जय राम', ['dharma', 'truth', 'courage'], 'from-amber-100 to-rose-50'),
  deity('deity-kali', 'Kali', 'श्री काली', 'The fierce divine mother associated with protection, time, courage, and transformation.', 'Kali is invoked for fearlessness, protection, and the removal of ignorance and falsehood.', 'ॐ क्रीं कालिकायै नमः', ['protection', 'transformation', 'strength'], 'from-zinc-900 to-slate-700'),
  deity('deity-surya', 'Surya', 'श्री सूर्य', 'The solar deity associated with light, vitality, clarity, discipline, and daily order.', 'Surya is remembered at sunrise for healthful routine, gratitude, energy, and clear awareness.', 'ॐ घृणिः सूर्याय नमः', ['vitality', 'clarity', 'discipline'], 'from-yellow-100 to-orange-50'),
  deity('deity-narayana', 'Narayana', 'श्री नारायण', 'The all-pervading sustaining presence, closely associated with Vishnu.', 'Narayana is invoked for refuge, preservation, truthfulness, and household devotion.', 'ॐ नमो नारायणाय', ['refuge', 'preservation', 'dharma'], 'from-cyan-100 to-sky-50'),
  deity('deity-parvati', 'Parvati', 'श्री पार्वती', 'The gentle and powerful divine mother, consort of Shiva, associated with love, strength, and family harmony.', 'Parvati is honored as motherly grace, disciplined devotion, and the source of Shakti in household and temple worship.', 'ॐ पार्वत्यै नमः', ['mother', 'shakti', 'family'], 'from-pink-100 to-rose-50'),
  deity('deity-kartikeya', 'Kartikeya', 'श्री कार्तिकेय', 'The youthful commander of the divine forces, associated with courage, discipline, and clarity.', 'Kartikeya is remembered for bravery, spiritual focus, and the ability to meet difficulty with wisdom and restraint.', 'ॐ स्कन्दाय नमः', ['courage', 'discipline', 'skanda'], 'from-orange-100 to-amber-50'),
  deity('deity-radha', 'Radha', 'श्री राधा', 'The supreme devotee of Krishna and a symbol of pure love, devotion, and longing for the divine.', 'Radha is honored in bhakti traditions as the heart of selfless devotion and loving remembrance of Krishna.', 'राधे कृष्ण राधे कृष्ण', ['bhakti', 'love', 'krishna'], 'from-fuchsia-100 to-rose-50'),
];
