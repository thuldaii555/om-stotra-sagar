import type { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-stotra', name: 'Stotra', nameNe: 'स्तोत्र', description: 'Classical praise hymns addressed to a deity or divine principle.', descriptionNe: 'देवता वा दिव्य तत्त्वको स्तुतिका परम्परागत पाठहरू।' },
  { id: 'cat-kavacham', name: 'Kavacham', nameNe: 'कवच', description: 'Protective devotional compositions and prayers.', descriptionNe: 'रक्षा भावका भक्तिपाठ र प्रार्थनाहरू।' },
  { id: 'cat-aarti', name: 'Aarti', nameNe: 'आरती', description: 'Lamp-offering hymns sung during or at the close of worship.', descriptionNe: 'पूजाको अन्त्य वा क्रममा गाइने दीप अर्पण गीतहरू।' },
  { id: 'cat-ashtakam', name: 'Ashtakam', nameNe: 'अष्टकम्', description: 'Eight-verse devotional compositions.', descriptionNe: 'आठ श्लोक/पद भएका भक्तिपाठहरू।' },
  { id: 'cat-chalisa', name: 'Chalisa', nameNe: 'चालीसा', description: 'Forty-verse devotional hymns for focused prayer and remembrance.', descriptionNe: 'स्मरण र प्रार्थनाका लागि चालीस पदका भक्तिपाठहरू।' },
  { id: 'cat-mantra', name: 'Mantra', nameNe: 'मन्त्र', description: 'Sacred chants for repetition, meditation, or daily remembrance.', descriptionNe: 'जप, ध्यान वा दैनिक स्मरणका पवित्र मन्त्रहरू।' },
  { id: 'cat-pooja-bidhi', name: 'Pooja Bidhi', nameNe: 'पूजा विधि', description: 'Practical home worship guides and ritual outlines.', descriptionNe: 'घरमै गर्न मिल्ने पूजा विधि र पूजाको रूपरेखा।' },
  { id: 'cat-vrat-katha', name: 'Vrat Katha', nameNe: 'व्रत कथा', description: 'Stories connected with vows, observances, and festival traditions.', descriptionNe: 'व्रत, पर्व र परम्परासँग जोडिएका कथाहरू।' },
  { id: 'cat-story', name: 'Story', nameNe: 'कथा', description: 'Devotional stories and sacred narratives for family reading.', descriptionNe: 'परिवारसँग पढ्न मिल्ने भक्तिपूर्ण कथा र पौराणिक प्रसङ्गहरू।' },
  { id: 'cat-other', name: 'Other', nameNe: 'अन्य', description: 'Special devotional content that does not fit the standard categories.', descriptionNe: 'अन्य श्रेणीमा नअट्ने विशेष भक्तिपूर्ण सामग्री।' },
];
