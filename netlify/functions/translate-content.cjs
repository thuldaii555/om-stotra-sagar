// Uses MyMemory API (completely free, no key needed) for Nepali<->English.
// Uses built-in Sanskrit romanization for Devanagari->Latin.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' });

  let text, from, to;
  try {
    ({ text, from, to } = JSON.parse(event.body || '{}'));
    if (!text || !from || !to) throw new Error('missing');
  } catch { return json(400, { error: 'Required: text, from, to' }); }

  // Sanskrit -> Latin romanization (no API needed)
  if (from === 'sa' && to === 'latn') {
    return json(200, { result: romanizeDevanagari(text) });
  }

  // Nepali <-> English via MyMemory (free, 10k words/day)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${from}|${to}&de=omstotrasagar@gmail.com`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 || data.responseStatus === '200') {
      return json(200, { result: data.responseData.translatedText });
    }
    return json(502, { error: `Translation API: ${data.responseDetails || 'failed'}` });
  } catch (e) {
    return json(502, { error: `Translation failed: ${e.message}` });
  }
};

// Devanagari consonants and vowels -> simplified phonetic Latin
function romanizeDevanagari(text) {
  const vowelMap = {
    'अ':'a','आ':'aa','इ':'i','ई':'ee','उ':'u','ऊ':'oo','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au',
    'ा':'aa','ि':'i','ी':'ee','ु':'u','ू':'oo','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au',
    'ं':'m','ः':'h','ँ':'n','्':'',
  };
  const consMap = {
    'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng',
    'च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'ny',
    'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n',
    'त':'t','थ':'th','द':'d','ध':'dh','न':'n',
    'प':'p','फ':'ph','ब':'b','भ':'bh','म':'m',
    'य':'y','र':'r','ल':'l','व':'v','श':'sh',
    'ष':'sh','स':'s','ह':'h','ळ':'l','क्ष':'ksh','ज्ञ':'gya',
  };
  let result = '';
  let i = 0;
  const chars = [...text];
  while (i < chars.length) {
    const ch = chars[i];
    if (ch === '\n') { result += '\n'; i++; continue; }
    if (ch === ' ' || ch === '।' || ch === '॥') {
      result += ch === ' ' ? ' ' : (ch === '।' ? ' | ' : ' || ');
      i++; continue;
    }
    if (consMap[ch]) {
      result += consMap[ch];
      // Check next char for vowel modifier or halant
      const next = chars[i + 1] || '';
      if (vowelMap[next] !== undefined) {
        result += vowelMap[next];
        i += 2;
      } else if (next !== '्') {
        result += 'a'; // inherent vowel
        i++;
      } else {
        i++;
      }
    } else if (vowelMap[ch] !== undefined) {
      result += vowelMap[ch];
      i++;
    } else {
      result += ch;
      i++;
    }
  }
  return result.replace(/ +/g, ' ').trim();
}

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) };
}
