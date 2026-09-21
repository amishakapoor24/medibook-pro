const NUMBERS = {
  emergency: { label: "Emergency: police, fire, ambulance", number: "112" },
  ambulance: { label: "Ambulance (most states)", number: "108" },
  mentalHealth: { label: "Tele-MANAS: talk to a counsellor", number: "14416" },
};

const categories = [
  {
    id: "self_harm",
    title: "You are not alone",
    patterns: [/suicid/i, /kill (myself|me)\b/i, /end (my|this) life/i, /want to die/i, /(hurt|harm) myself/i, /khudkushi/i, /jaan de/i, /आत्महत्या/, /मरना चाहता/],
    steps: [
      "If you might act on these thoughts right now, call 112 immediately.",
      "You can call Tele-MANAS on 14416 to talk to a trained counsellor.",
      "Please stay with someone you trust, and move away anything you could hurt yourself with.",
    ],
    numbers: [NUMBERS.mentalHealth, NUMBERS.emergency],
  },
  {
    id: "breathing",
    title: "Trouble breathing",
    patterns: [/(can'?t|cannot|unable to|not able to) breathe/i, /trouble breathing/i, /struggling to breathe/i, /difficulty (in )?breathing/i, /choking/i, /saans nahi/i, /सांस (नहीं|लेने में)/],
    steps: [
      "Call 112 (or 108 for an ambulance) right now.",
      "Help the person sit upright and stay calm. Loosen tight clothing.",
      "If someone is choking, follow the emergency operator's instructions.",
    ],
    numbers: [NUMBERS.emergency, NUMBERS.ambulance],
  },
  {
    id: "cardiac",
    title: "Possible heart emergency",
    patterns: [/chest pain/i, /pain in (my |the )?chest/i, /heart attack/i, /seene (me|mein) dard/i, /सीने में दर्द/],
    steps: [
      "Call 112 (or 108 for an ambulance) now. Do not drive yourself.",
      "Sit or lie down comfortably and keep still. Loosen tight clothing.",
      "Ask someone to unlock the door and wait outside for the ambulance. Follow the operator's instructions.",
    ],
    numbers: [NUMBERS.emergency, NUMBERS.ambulance],
  },
  {
    id: "stroke",
    title: "Possible stroke",
    patterns: [/stroke/i, /slurred speech/i, /face (is )?droop/i, /sudden (weakness|numbness)/i, /can'?t (move|feel) (my |his |her )?(arm|leg|face)/i, /lakwa/i, /लकवा/],
    steps: [
      "Call 112 (or 108 for an ambulance) now. Every minute matters.",
      "Note the time the symptoms started and tell the operator.",
      "Keep the person comfortable and still. Do not give food, water or medicine.",
    ],
    numbers: [NUMBERS.emergency, NUMBERS.ambulance],
  },
  {
    id: "bleeding",
    title: "Serious bleeding",
    patterns: [/heavy bleeding/i, /bleeding (a lot|heavily|badly)/i, /(won'?t|will not|does not|doesn'?t) stop bleeding/i, /(vomit|vomiting|cough|coughing)( up)? blood/i, /bahut (zyada )?khoon/i],
    steps: [
      "Call 112 (or 108 for an ambulance) now.",
      "Press firmly on the wound with a clean cloth and keep pressing.",
      "If the cloth soaks through, put another on top. Do not remove the first one.",
    ],
    numbers: [NUMBERS.emergency, NUMBERS.ambulance],
  },
  {
    id: "unconscious",
    title: "Person not responding",
    patterns: [/unconscious/i, /passed out/i, /not (responding|waking)/i, /(is|are|was|am) (having|had) a seizure/i, /convuls/i, /behosh/i, /बेहोश/],
    steps: [
      "Call 112 (or 108 for an ambulance) now.",
      "Do not put anything in their mouth.",
      "If it is a seizure: move hard objects away, cushion the head, do not hold them down, and note the time.",
      "Follow the operator's instructions. They can guide you through CPR if needed.",
    ],
    numbers: [NUMBERS.emergency, NUMBERS.ambulance],
  },
  {
    id: "poisoning",
    title: "Possible poisoning or overdose",
    patterns: [/overdose/i, /poisoned/i, /(swallowed|drank|ate|took|had) [^.]{0,40}(poison|bleach|acid|pesticide|kerosene|phenyl)/i, /too many (pills|tablets)/i, /zeher/i, /जहर/],
    steps: [
      "Call 112 (or 108 for an ambulance) now.",
      "Keep the packet, bottle or tablets to show the doctors.",
      "Do NOT make the person vomit unless a doctor tells you to. Do not give food, drink or home remedies.",
    ],
    numbers: [NUMBERS.emergency, NUMBERS.ambulance],
  },
];

const GENERAL_EMERGENCY = {
  id: "general",
  title: "This may be an emergency",
  steps: [
    "If the person is in serious danger, call 112 (or 108 for an ambulance) now.",
    "Do not wait for the symptoms to get worse. Go to the nearest hospital emergency department.",
  ],
  numbers: [NUMBERS.emergency, NUMBERS.ambulance],
};

const detectEmergency = (text) => {
  if (typeof text !== "string") return null;
  return categories.find((category) => category.patterns.some((pattern) => pattern.test(text))) || null;
};

const emergencyReply = (category = GENERAL_EMERGENCY) => ({
  type: "emergency",
  category: category.id,
  title: category.title,
  steps: category.steps,
  numbers: category.numbers,
});

module.exports = { detectEmergency, emergencyReply, GENERAL_EMERGENCY };