const { generativeModel, isGeminiActive, modelName } = require('../config/ai');

/**
 * Standard disaster categories supported by ResQ
 */
const DISASTER_CATEGORIES = [
  'Flood',
  'Earthquake',
  'Fire',
  'Cyclone',
  'Road Accident',
  'Medical Emergency',
  'Landslide',
  'Other'
];

/**
 * Standard priority levels
 */
const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

// ==========================================================
// 1. INTELLIGENT RULE-BASED FALLBACK ENGINE
// ==========================================================

const KEYWORD_RULES = {
  Flood: ['flood', 'water', 'submerged', 'river', 'drown', 'overflow', 'rain', 'inundat', 'stream', 'boat'],
  Fire: ['fire', 'flame', 'smoke', 'blaze', 'burn', 'short circuit', 'spark', 'explosion', 'cylinder'],
  Earthquake: ['earthquake', 'quake', 'tremor', 'shak', 'collapse', 'rubble', 'debris', 'crack in building'],
  Cyclone: ['cyclone', 'storm', 'hurricane', 'typhoon', 'gale', 'wind', 'squall', 'tempest'],
  Landslide: ['landslide', 'mudslide', 'rockfall', 'boulder', 'slope', 'mud', 'debris flow', 'hill collapse'],
  'Road Accident': ['accident', 'crash', 'collision', 'overturned', 'truck', 'car', 'bus', 'vehicle', 'highway', 'bike'],
  'Medical Emergency': ['medical', 'heart', 'cardiac', 'bleed', 'unconscious', 'breath', 'stroke', 'patient', 'ambulance', 'fracture', 'poison']
};

const CRITICAL_KEYWORDS = [
  'trapped', 'dying', 'unconscious', 'elderly', 'children', 'submerged', 'collapse',
  'terrace', 'stranding', 'drowning', 'suffocat', 'massive fire', 'heart attack',
  'severe bleeding', 'multiple casualty', 'no air', 'electric wire in water'
];

const HIGH_KEYWORDS = [
  'injured', 'bleeding', 'fracture', 'rising water', 'spreading', 'toxic smoke',
  'urgent', 'blocked road', 'evacuat', 'power outage', 'crying for help'
];

const LOW_KEYWORDS = [
  'minor', 'cleared', 'precaution', 'watch', 'slow', 'drizzle', 'safe', 'stable'
];

/**
 * Fallback classification using keyword matching
 */
function fallbackClassify(text, userSelectedType) {
  const lower = (text || '').toLowerCase();

  let detectedType = null;
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(KEYWORD_RULES)) {
    let count = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) count++;
    }
    if (count > maxMatches) {
      maxMatches = count;
      detectedType = category;
    }
  }

  // If user provided a specific valid type and keyword matches are low, respect user's selection
  if (userSelectedType && DISASTER_CATEGORIES.includes(userSelectedType)) {
    if (maxMatches < 2) {
      return {
        classification: userSelectedType,
        confidence: 'High (User Verified)'
      };
    }
  }

  return {
    classification: detectedType || userSelectedType || 'Other',
    confidence: maxMatches > 0 ? `High (${Math.min(95, 75 + maxMatches * 8)}%)` : 'Medium (Estimated)'
  };
}

/**
 * Fallback priority prediction using threat heuristics
 */
function fallbackPriority(text, classification) {
  const lower = (text || '').toLowerCase();

  let criticalScore = 0;
  let highScore = 0;

  for (const kw of CRITICAL_KEYWORDS) {
    if (lower.includes(kw)) criticalScore += 2;
  }
  for (const kw of HIGH_KEYWORDS) {
    if (lower.includes(kw)) highScore += 1;
  }

  if (criticalScore >= 2 || (criticalScore >= 1 && ['Earthquake', 'Flood', 'Fire', 'Medical Emergency'].includes(classification))) {
    return 'Critical';
  }
  if (highScore >= 2 || criticalScore >= 1) {
    return 'High';
  }
  for (const kw of LOW_KEYWORDS) {
    if (lower.includes(kw)) return 'Low';
  }

  return 'Medium';
}

/**
 * Fallback incident summarizer
 */
function fallbackSummarize(description, location, classification) {
  if (!description) return `Emergency reported at ${location || 'unspecified location'}.`;

  // Clean and condense
  const sentences = description.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length === 0) return description.slice(0, 160);

  const keySentence = sentences[0];
  const secondary = sentences.length > 1 ? ` ${sentences[1]}.` : '';
  let summary = `${classification} incident: ${keySentence}.${secondary}`;

  if (summary.length > 200) {
    summary = summary.substring(0, 197) + '...';
  }
  return summary;
}

/**
 * Safety guidance tips for specific disaster types
 */
function getSafetyTips(disasterType) {
  switch (disasterType) {
    case 'Flood':
      return '1. Move immediately to higher elevation.\n2. Do NOT walk, swim, or drive through flowing water.\n3. Turn off main electrical switches if safe.\n4. Boil drinking water before consumption.';
    case 'Fire':
      return '1. Evacuate immediately via designated stairs — NEVER use elevators.\n2. Crawl low under smoke to inhale cleaner air.\n3. Feel doors with back of hand before opening.\n4. Call emergency fire services (101).';
    case 'Earthquake':
      return '1. DROP, COVER, and HOLD ON under a sturdy table or desk.\n2. Stay clear of glass windows and heavy hanging furniture.\n3. If outdoors, move to an open clearing away from power lines.\n4. Do not ignite matches or lighters due to potential gas leaks.';
    case 'Cyclone':
      return '1. Stay indoors away from windows and glass panes.\n2. Keep mobile phones, power banks, and torches fully charged.\n3. Anchor or bring inside loose outdoor objects.\n4. Monitor official meteorological bulletins.';
    case 'Landslide':
      return '1. Stay alert for loud rumbling, cracking trees, or sudden changes in water flow.\n2. Evacuate away from the path of debris and steep slopes.\n3. Do not cross bridges over swollen streams carrying debris.';
    case 'Medical Emergency':
      return '1. Keep patient calm and resting in a comfortable position.\n2. Loosen tight collar or chest clothing.\n3. In case of bleeding, apply clean cloth with firm direct pressure.\n4. Call ambulance (108/112) immediately.';
    default:
      return '1. Keep emergency contacts accessible.\n2. Stay calm and follow official local emergency advisories.\n3. Keep a basic first aid and survival kit ready.';
  }
}

// ==========================================================
// 2. GEMINI AI ENGINE
// ==========================================================

/**
 * Full analysis of an emergency report:
 * 1. Disaster Classification
 * 2. Emergency Priority Prediction
 * 3. Incident Summarization
 */
async function analyzeEmergencyReport({ description, location, userDisasterType }) {
  // If Gemini is active, attempt AI processing
  if (isGeminiActive() && generativeModel) {
    try {
      const prompt = `You are ResQ AI, an emergency response intelligence coordinator.
Analyze the following emergency report submitted by a citizen and output valid JSON ONLY with no surrounding markdown ticks or commentary:

Report Description: "${description}"
Location: "${location || 'Not provided'}"
Citizen Tagged Disaster Type: "${userDisasterType || 'Not specified'}"

JSON Schema to return:
{
  "classification": "<One of: Flood, Earthquake, Fire, Cyclone, Road Accident, Medical Emergency, Landslide, Other>",
  "confidence": "<e.g. High (95%)>",
  "priority": "<One of: Low, Medium, High, Critical>",
  "priority_reason": "<1 concise sentence explaining the urgency>",
  "summary": "<1-2 concise operational sentences for first responders>",
  "safety_tips": "<3 concise safety bullet points for the victim/public>"
}

Strict Rules:
- Return ONLY valid JSON parseable by JSON.parse().
- Priority must evaluate life threat, trapped people, medical criticality, rising water, fire, or structural collapse.
- If lives are in immediate peril, set priority to 'Critical'.`;

      const result = await generativeModel.generateContent(prompt);
      const text = result.response.text().trim();

      // Clean markdown formatting if present
      const cleanedJson = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleanedJson);

      // Validate & normalize
      const classification = DISASTER_CATEGORIES.includes(parsed.classification)
        ? parsed.classification
        : (userDisasterType || 'Other');

      const priority = PRIORITY_LEVELS.includes(parsed.priority)
        ? parsed.priority
        : fallbackPriority(description, classification);

      return {
        classification,
        confidence: parsed.confidence || 'High (94%)',
        priority,
        summary: parsed.summary || fallbackSummarize(description, location, classification),
        safety_tips: parsed.safety_tips || getSafetyTips(classification),
        source: 'gemini',
        raw_response: text
      };
    } catch (aiError) {
      console.warn(`[AI Engine] Gemini API request failed (${aiError.message}). Switching gracefully to Intelligent Fallback Engine.`);
    }
  }

  // Graceful Fallback Mode Execution
  const fbClass = fallbackClassify(description, userDisasterType);
  const fbPriority = fallbackPriority(description, fbClass.classification);
  const fbSummary = fallbackSummarize(description, location, fbClass.classification);
  const fbSafety = getSafetyTips(fbClass.classification);

  return {
    classification: fbClass.classification,
    confidence: fbClass.confidence,
    priority: fbPriority,
    summary: fbSummary,
    safety_tips: fbSafety,
    source: 'fallback',
    raw_response: JSON.stringify({ mode: 'rule_based_fallback', timestamp: new Date().toISOString() })
  };
}

/**
 * 4. DISASTER SAFETY GUIDANCE CHATBOT
 */
async function answerSafetyChat(userMessage, conversationHistory = []) {
  const disclaimer = '⚠️ Note: ResQ AI provides automated advisory guidance. In life-threatening emergencies, dial 112 / 108 / 101 immediately.';

  // If Gemini is active, use generative AI for dynamic conversation
  if (isGeminiActive() && generativeModel) {
    try {
      const historyContext = conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');
      const prompt = `You are ResQ AI Safety Advisor, a calm, knowledgeable emergency and disaster response specialist.
Your role: Provide concise, lifesaving, step-by-step safety guidance to citizens during natural and man-made disasters (floods, earthquakes, fires, cyclones, landslides, accidents, emergency kit prep, first aid).
Important rules:
1. Always be calm, clear, and reassuring.
2. Provide actionable numbered bullet points.
3. NEVER claim to dispatch rescue forces yourself — remind users to call emergency hotlines (112 / 108 / 101) for live response.
4. Keep the response to 3-5 concise paragraphs or bullet points.

Recent conversation:
${historyContext}

User Query: "${userMessage}"

Respond with helpful disaster safety guidance:`;

      const result = await generativeModel.generateContent(prompt);
      const reply = result.response.text().trim();

      return {
        reply: `${reply}\n\n${disclaimer}`,
        source: 'gemini'
      };
    } catch (aiError) {
      console.warn(`[AI Engine] Gemini chat failed (${aiError.message}). Using Intelligent Knowledge Base.`);
    }
  }

  // Built-in Knowledge Base Fallback
  const q = (userMessage || '').toLowerCase();
  let answer = '';

  if (q.includes('flood') || q.includes('water') || q.includes('submerged') || q.includes('drown')) {
    answer = `🌊 **Flood Safety Protocol:**
1. **Move to High Ground:** Immediately move to the highest floor or elevated ground. Never enter basements or low-lying areas.
2. **Turn Off Utilities:** Switch off main electrical circuit breakers and gas valves if you can do so safely without standing in water.
3. **Never Walk or Drive in Floodwaters:** Just 6 inches of moving water can knock you down, and 12 inches can sweep away a car.
4. **Water Safety:** Avoid drinking tap water until authorized. Boil drinking water for at least 1 minute.
5. **Signal for Rescue:** If stranded on a terrace, wave a brightly colored cloth or use a torch flashlight at night.`;
  } else if (q.includes('earthquake') || q.includes('tremor') || q.includes('shake')) {
    answer = `🏢 **Earthquake Safety Protocol:**
1. **Drop, Cover, and Hold On:** Drop to hands and knees, take cover under a sturdy desk or table, and hold on until shaking stops.
2. **Stay Clear of Hazards:** Keep away from glass windows, exterior walls, mirrors, and tall unsecured furniture.
3. **If Outdoors:** Move to an open field away from buildings, street lights, overpasses, and power lines.
4. **If in a Moving Vehicle:** Pull over to a clear location, stop, and stay inside with seatbelt fastened.
5. **After the Quake:** Check yourself for injuries and prepare for aftershocks. Do not use open flames or matches.`;
  } else if (q.includes('fire') || q.includes('flame') || q.includes('smoke') || q.includes('burn')) {
    answer = `🔥 **Fire Safety Protocol:**
1. **Get Out and Stay Out:** Evacuate immediately. Never go back inside a burning building for belongings.
2. **Crawl Low Under Smoke:** Inhaling toxic smoke is the leading cause of casualties. Keep your nose close to the floor.
3. **Feel Before Opening Doors:** Touch doorknobs with the back of your hand. If hot, use an alternate escape route.
4. **Stop, Drop, and Roll:** If your clothes catch fire, do NOT run. Drop immediately to the ground and roll.
5. **Call Fire Brigade:** Dial 101 or 112 as soon as you reach a safe outdoor zone.`;
  } else if (q.includes('cyclone') || q.includes('storm') || q.includes('hurricane') || q.includes('wind')) {
    answer = `🌪️ **Cyclone & Storm Safety Protocol:**
1. **Stay Indoors:** Remain inside a securely boarded room, preferably an interior room without exterior windows.
2. **Secure Outdoor Items:** Bring inside lawn furniture, loose sheet roofs, or hazardous objects that can become airborne.
3. **Emergency Power & Lights:** Keep battery-powered torches, portable power banks, and radio ready. Disconnect non-vital electronics.
4. **Store Clean Water:** Fill clean containers with drinking water beforehand, as water supply lines may be disrupted.
5. **Beware the Eye of the Storm:** If winds suddenly calm, do not go outside. Destructive winds from the opposite direction will resume soon.`;
  } else if (q.includes('kit') || q.includes('supplies') || q.includes('bag') || q.includes('prepare')) {
    answer = `🎒 **Emergency Survival Kit (Go-Bag) Checklist:**
1. **Drinking Water:** 3 liters of water per person per day (minimum 3-day supply).
2. **Non-Perishable Food:** Ready-to-eat canned food, dry fruits, energy bars, and infant needs.
3. **First Aid Box:** Bandages, sterile gauze, antiseptic lotion, burn ointment, and 7-day supply of personal prescription medicines.
4. **Tools & Lighting:** High-beam LED flashlight, spare batteries, multi-tool knife, and loud whistle.
5. **Communication & Power:** Battery-operated radio, high-capacity power bank, and charging cables.
6. **Important Documents:** Waterproof sealed pouch containing ID cards, insurance policies, and cash.`;
  } else if (q.includes('landslide') || q.includes('mud') || q.includes('slope')) {
    answer = `⛰️ **Landslide Safety Protocol:**
1. **Recognize Warning Signs:** Cracking sounds from trees, sudden muddy stream discharge, or shifting ground.
2. **Evacuate the Path:** Move sideways away from the landslide or mudslide path rather than running downhill in its direction.
3. **Protect Your Head:** If escape is not possible, curl into a tight ball and protect your head with your arms.
4. **Stay Away After Event:** Secondary slides frequently occur. Keep clear of the slide zone and damaged roadways.`;
  } else if (q.includes('first aid') || q.includes('cpr') || q.includes('bleeding')) {
    answer = `🩹 **Emergency First Aid Guidelines:**
1. **Severe Bleeding:** Apply firm direct pressure with a clean cloth or sterile bandage. Elevate the injured limb if possible.
2. **Burns:** Flush immediately with cool, clean running water for 10-15 minutes. Never apply ice, butter, or oil to a burn.
3. **Choking:** Administer 5 back blows followed by 5 abdominal thrusts (Heimlich maneuver).
4. **Unconsciousness:** Place the individual in the side recovery position to maintain an open airway, unless spinal injury is suspected.
5. **Always Call Medical Response:** Dial 108 or 112 immediately for professional paramedic assistance.`;
  } else {
    answer = `🛡️ **General Disaster Preparedness Guidelines:**
1. **Safety First:** Assess your immediate environment for falling debris, electrical wires, fire hazards, or rising water.
2. **Emergency Numbers in India:**
   - National Emergency Helpline: **112**
   - Police: **100**
   - Fire Services: **101**
   - Ambulance / Medical: **108 / 102**
   - Disaster Management Helpline: **1078**
3. **Stay Connected:** Keep your phone battery conserved and listen to official disaster broadcast warnings.
4. **Assist Vulnerable Groups:** Check on elderly neighbors, children, and pets if it is safe to do so.`;
  }

  return {
    reply: `${answer}\n\n${disclaimer}`,
    source: 'fallback'
  };
}

module.exports = {
  DISASTER_CATEGORIES,
  PRIORITY_LEVELS,
  analyzeEmergencyReport,
  answerSafetyChat,
  fallbackClassify,
  fallbackPriority,
  fallbackSummarize,
  getSafetyTips
};
