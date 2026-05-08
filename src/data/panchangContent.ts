import type { PanchangContent, PanchangTerm } from '../types';

const term = (name: string, description: string, practicalMeaning: string): PanchangTerm => ({
  name,
  title: name,
  description,
  practicalMeaning,
  text: `${description} Practical use: ${practicalMeaning}`,
});

export const DEFAULT_PANCHANG_CONTENT: PanchangContent = {
  introTitle: 'Educational Panchang Guide',
  intro: 'This local-first guide explains common Panchang concepts for learning and daily devotional awareness. It does not calculate live timings. Exact values vary by location, time zone, sunrise, tradition, and calculation method.',
  terms: [
    term('Tithi', 'The lunar day, based on the angular relationship between the Sun and Moon.', 'Used to understand vrata, festival, fasting, and puja timing. Always check the local tithi for formal observance.'),
    term('Nakshatra', 'A lunar mansion or star grouping connected with the Moon position.', 'Often referenced for muhurta, naming, samskara, and traditional timing decisions.'),
    term('Yoga', 'A Panchang factor calculated from the combined positions of the Sun and Moon.', 'Used as one factor among several when judging the quality of time for an activity.'),
    term('Karana', 'Half of a tithi, used in traditional calendrical division.', 'Consulted for ritual planning and auspicious timing traditions.'),
    term('Rahu Kaal', 'A daytime period many families avoid for beginning important work.', 'Check local sunrise and weekday-based calculation before starting travel, business, or major new tasks.'),
    term('Paksha', 'The lunar fortnight: Shukla Paksha is the waxing half and Krishna Paksha is the waning half.', 'Helps users understand where the day sits in the lunar month and why some vrata or festivals occur in a specific fortnight.'),
    term('Masa', 'The lunar month used in Hindu calendar traditions, with naming varying by regional system.', 'Use it to identify festival seasons, vrata months, and month-specific observances.'),
    term('Muhurta', 'An auspicious time window selected using several Panchang factors and tradition-specific rules.', 'For weddings, griha pravesh, upanayana, or major rites, consult a trusted Panchang or priest.'),
    term('Sunrise / Sunset', 'Local sunrise and sunset anchor many daily Panchang calculations.', 'Use location-specific values; a timing for one city should not be assumed correct for another.'),
    term('Locality / Timezone', 'Panchang values depend on geographic location and time zone.', 'Set or check the correct city when using any formal Panchang source.'),
  ],
  dailyNotes: [
    term('Daily worship rhythm', 'Many families begin with bathing, lighting a diya, and reading a mantra or stotra.', 'Use a short daily practice consistently rather than trying to perform a complex ritual every day.'),
    term('Festival verification', 'Festival dates can differ by region because tithi at sunrise, moonrise, or specific time windows may matter.', 'Before public announcements or formal observance, verify with a trusted local calendar.'),
    term('Family tradition', 'Sampradaya and family customs may prioritize different rules for vrata, puja, or festival timing.', 'Follow the tradition you have received for formal worship.'),
    term('No live calculation', 'This page is educational content only and does not compute live Panchang values.', 'Use it to understand terms, then consult a reliable local Panchang for exact timings.'),
  ],
  disclaimer: 'Exact Panchang values vary by location, time zone, sunrise, calendar tradition, and calculation method. Verify formal timings with a trusted local Panchang, family tradition, or priest.',
};
