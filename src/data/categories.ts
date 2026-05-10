import type { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-stotra', name: 'Stotra', nameNe: 'स्तोत्र', description: 'Classical praise hymns addressed to a deity or divine principle.', descriptionNe: 'देवता वा दिव्य तत्त्वको स्तुति गर्ने परम्परागत भक्तिपाठ।' },
  { id: 'cat-stotram', name: 'Stotram', nameNe: 'स्तोत्रम्', description: 'Sanskrit devotional praise compositions.', descriptionNe: 'संस्कृत भक्तिपूर्ण स्तुतिपाठ।' },
  { id: 'cat-kavacham', name: 'Kavacham', nameNe: 'कवच', description: 'Protective devotional compositions and prayers.', descriptionNe: 'रक्षा भावका भक्तिपाठ र प्रार्थनाहरू।' },
  { id: 'cat-kawach', name: 'Kawach', nameNe: 'कवच', description: 'Protective devotional texts written in common transliteration.', descriptionNe: 'रक्षा र आत्मबलका लागि पाठ गरिने भक्तिपाठ।' },
  { id: 'cat-aarti', name: 'Aarti', nameNe: 'आरती', description: 'Lamp-offering hymns sung during or at the close of worship.', descriptionNe: 'पूजाको अन्त्यमा गाइने दीप-आराधना गीत।' },
  { id: 'cat-ashtakam', name: 'Ashtakam', nameNe: 'अष्टकम्', description: 'Eight-verse devotional compositions.', descriptionNe: 'आठ श्लोक वा पदमा आधारित भक्तिपाठ।' },
  { id: 'cat-chalisa', name: 'Chalisa', nameNe: 'चालीसा', description: 'Forty-verse devotional hymns for focused prayer and remembrance.', descriptionNe: 'स्मरण र प्रार्थनाका लागि चालीस पदमा आधारित भक्तिपाठ।' },
  { id: 'cat-mantra', name: 'Mantra', nameNe: 'मन्त्र', description: 'Sacred chants for repetition, meditation, or daily remembrance.', descriptionNe: 'जप, ध्यान वा दैनिक स्मरणका लागि पवित्र मन्त्र।' },
  { id: 'cat-pooja-bidhi', name: 'Pooja Bidhi', nameNe: 'पूजा विधि', description: 'Practical home worship guides and ritual outlines.', descriptionNe: 'घरमै गर्न मिल्ने पूजा विधि र पूजाको रूपरेखा।' },
  { id: 'cat-vrat-katha', name: 'Vrat Katha', nameNe: 'व्रत कथा', description: 'Stories connected with vows, observances, and festival traditions.', descriptionNe: 'व्रत, पर्व र परम्परासँग जोडिएका कथा।' },
  { id: 'cat-story', name: 'Story', nameNe: 'कथा', description: 'Devotional stories and sacred narratives for family reading.', descriptionNe: 'परिवारसँग पढ्न मिल्ने भक्तिपूर्ण कथा र पौराणिक प्रसङ्ग।' },
  { id: 'cat-sadastakam', name: 'Sadastakam', nameNe: 'सदाष्टकम्', description: 'Long-form eight-verse devotional compositions in traditional usage.', descriptionNe: 'परम्परागत प्रयोगमा आउने आठ-श्लोकी भक्तिपाठ।' },
  { id: 'cat-baan', name: 'Baan', nameNe: 'बाण', description: 'Devotional exclamations, arrows of prayer, or short vigorous praise texts.', descriptionNe: 'भक्तिभावका छोटा, तीव्र र ऊर्जायुक्त स्तुति-पाठ।' },
  { id: 'cat-other', name: 'Other', nameNe: 'अन्य', description: 'Special devotional content that does not fit the standard categories.', descriptionNe: 'मानक श्रेणीमा नपर्ने विशेष भक्तिपूर्ण सामग्री।' },
];
