import { computeRiskProfile, AttemptLog } from "./session";

// ─── Component pools ────────────────────────────────────────────────────────

export type ScamTactic = "urgency" | "refund_bait" | "security_alert" | "emotional" | "payment_pressure" | "authority" | "impersonation";
export type SenderType = "bank" | "hmrc" | "delivery" | "amazon" | "tech_support" | "family" | "police" | "broadband";
export type Channel = "sms" | "email" | "whatsapp" | "phone_call";
export type RequestedAction = "click_link" | "call_number" | "transfer_money" | "enter_details" | "reply" | "download_software";
export type PressureLevel = "normal" | "urgent" | "hard_deadline";
export type Difficulty = 1 | 2 | 3;

export interface ScenarioComponents {
  sender: SenderType;
  tactic: ScamTactic;
  channel: Channel;
  action: RequestedAction;
  pressure: PressureLevel;
  difficulty: Difficulty;
}

export interface GeneratedOption {
  id: string;
  text: string;
  safe: boolean;
}

export interface GeneratedScenario {
  id: string;
  module: "real_or_fraud";
  generated: true;
  components: ScenarioComponents;
  tags: string[];
  difficulty: Difficulty;
  category: string;
  title: string;
  scenario: string;
  sender: string;
  options: GeneratedOption[];
  correctAnswer: string;
  feedback_correct: string;
  feedback_incorrect: string;
  redFlags: string[];
}

// ─── Data pools ──────────────────────────────────────────────────────────────

const SENDER_DATA: Record<SenderType, {
  display: string[];
  fakeDisplay: string[];
  fakeDomain: string[];
  officialContact: string;
  category: string;
}> = {
  bank: {
    display: ["Barclays Bank", "HSBC UK", "Lloyds Bank", "NatWest", "Santander UK"],
    fakeDisplay: ["Barclays-Secure", "HSBC-Alerts", "LloydsTSB-Support"],
    fakeDomain: ["barclays-secure-alert.com", "hsbc-account-verify.co.uk", "lloyds-secure-login.net"],
    officialContact: "the number on the back of your bank card",
    category: "Bank Scam",
  },
  hmrc: {
    display: ["HM Revenue & Customs", "HMRC Tax Office", "Gov UK Tax"],
    fakeDisplay: ["HMRC-Refunds", "hmrc-gov-uk@tax-rebate.com"],
    fakeDomain: ["hmrc-refund-portal.co.uk", "gov-uk-tax-rebate.com"],
    officialContact: "0300 200 3300 or gov.uk/contact-hmrc",
    category: "HMRC Scam",
  },
  delivery: {
    display: ["Royal Mail", "DPD UK", "DHL Express", "Evri (Hermes)"],
    fakeDisplay: ["RoyalMail-Parcel", "DPD-Redelivery"],
    fakeDomain: ["royalmail-redelivery.co.uk", "dpd-parcel-fee.com"],
    officialContact: "the official courier website using your own tracking number",
    category: "Delivery Scam",
  },
  amazon: {
    display: ["Amazon", "Amazon UK", "Amazon Prime"],
    fakeDisplay: ["Amazon-Security", "AmazonPrime-Billing"],
    fakeDomain: ["amazon-account-alert.co.uk", "amazon-prime-verify.com"],
    officialContact: "amazon.co.uk directly — never via links",
    category: "Amazon Scam",
  },
  tech_support: {
    display: ["Microsoft Support", "Windows Security", "Apple Support", "BT Technical"],
    fakeDisplay: ["Microsoft-Alert", "Windows-Security-Center"],
    fakeDomain: ["microsoft-support-now.com", "windows-security-fix.co.uk"],
    officialContact: "the official support page — companies never cold-call about PC issues",
    category: "Tech Support Scam",
  },
  family: {
    display: ["Unknown Number", "New Number"],
    fakeDisplay: ["Sarah (new number)", "Mum it's Jack"],
    fakeDomain: [],
    officialContact: "your family member's known phone number or via video call",
    category: "Family Impersonation",
  },
  police: {
    display: ["Metropolitan Police", "Action Fraud", "National Crime Agency"],
    fakeDisplay: ["DS Taylor - Met Police", "Fraud Unit XXXX"],
    fakeDomain: [],
    officialContact: "999 or 101 using a different phone",
    category: "Police Impersonation",
  },
  broadband: {
    display: ["BT Broadband", "Sky Broadband", "Virgin Media"],
    fakeDisplay: ["BT-Technical", "Sky-Support-Team"],
    fakeDomain: ["bt-support-verify.co.uk", "sky-account-secure.com"],
    officialContact: "the number on your broadband bill",
    category: "Broadband Scam",
  },
};

const PROBLEM_BY_TACTIC: Record<ScamTactic, string[]> = {
  urgency: ["unusual activity on your account", "suspicious login from another country", "your account has been locked", "unauthorised access detected"],
  refund_bait: ["a tax rebate of £{amount} is waiting for you", "an unclaimed refund from overpayment", "a £{amount} credit due to billing error"],
  security_alert: ["your device has been compromised", "malware detected on your router", "your password was changed without your consent"],
  emotional: ["been in an accident and needs help urgently", "has been arrested and needs bail money", "has lost their phone and wallet abroad"],
  payment_pressure: ["a payment of £{amount} has been flagged", "an outstanding balance of £{amount} is overdue", "unpaid charges totalling £{amount}"],
  authority: ["a fraud investigation involving your account", "your NI number has been used in illegal activity", "a court order has been issued in your name"],
  impersonation: ["a message from someone claiming to know you", "a contact claiming to be from your trusted provider", "a call from someone quoting your personal details"],
};

const ACTION_TEXT: Record<RequestedAction, string[]> = {
  click_link: ["click the secure link below to verify", "tap here to confirm your identity", "visit the link to prevent suspension"],
  call_number: ["call our secure line immediately", "phone this number to speak to our fraud team", "ring back on this number right away"],
  transfer_money: ["transfer your funds to a safe holding account", "move your savings to a protected account", "send the amount to our secure account"],
  enter_details: ["enter your account details to verify ownership", "provide your banking information to claim your refund", "confirm your sort code and account number"],
  reply: ["reply CONFIRM to proceed", "text STOP to cancel the charge", "reply with your reference number"],
  download_software: ["download our remote diagnostic tool", "install the security patch from the link below", "run this scan tool to remove the threat"],
};

const CONSEQUENCE_BY_PRESSURE: Record<PressureLevel, string[]> = {
  normal: ["your account will be restricted", "we cannot process your request", "the matter will be escalated"],
  urgent: ["your account will be frozen within 24 hours", "your funds are at immediate risk", "legal action will be initiated"],
  hard_deadline: ["your account will be permanently closed in 2 hours", "a warrant will be issued within the hour", "the window to claim expires at midnight tonight"],
};

const CHANNEL_LABELS: Record<Channel, string> = {
  sms: "SMS Text Message",
  email: "Email",
  whatsapp: "WhatsApp Message",
  phone_call: "Phone Call",
};

// ─── Safe options by action ──────────────────────────────────────────────────

function getSafeOptions(components: ScenarioComponents, senderData: typeof SENDER_DATA[SenderType]): GeneratedOption[] {
  const { action } = components;

  const safeText = `Contact ${senderData.category.replace(" Scam", "")} directly using ${senderData.officialContact}`;

  let unsafeTexts: string[] = [];

  if (action === "click_link") {
    unsafeTexts = [
      "Click the link to resolve the issue quickly",
      "Call the number shown in the message",
      "Reply asking for more information",
    ];
  } else if (action === "call_number") {
    unsafeTexts = [
      "Call the number provided in the message",
      "Click the link they sent to verify first",
      "Give them your account number to verify identity",
    ];
  } else if (action === "transfer_money") {
    unsafeTexts = [
      "Transfer the money immediately to protect it",
      "Ask for more details before transferring",
      "Transfer half now and wait before sending the rest",
    ];
  } else if (action === "enter_details") {
    unsafeTexts = [
      "Enter your details on the page provided",
      "Call the number and give your details verbally instead",
      "Reply with your details to verify ownership",
    ];
  } else if (action === "download_software") {
    unsafeTexts = [
      "Download the tool — it sounds like a legitimate fix",
      "Allow them remote access to run the diagnostic",
      "Call the number provided to confirm before downloading",
    ];
  } else {
    unsafeTexts = [
      "Reply as requested",
      "Call back to discuss",
      "Forward the message to a family member to deal with",
    ];
  }

  // Shuffle the safe option into a random position (0–3)
  const ids = ["a", "b", "c", "d"];
  const allTexts = [...unsafeTexts, safeText]; // 4 items
  // Fisher-Yates shuffle
  for (let i = allTexts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allTexts[i], allTexts[j]] = [allTexts[j], allTexts[i]];
  }

  const safeIndex = allTexts.indexOf(safeText);

  return allTexts.map((text, i) => ({
    id: ids[i],
    text,
    safe: i === safeIndex,
  }));
}

// ─── Template filler ─────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(): string {
  const amounts = ["£349", "£892", "£1,200", "£2,450", "£67.99", "£149", "£4,000"];
  return pick(amounts);
}

function fillTemplate(template: string): string {
  return template.replace("{amount}", randomAmount());
}

function buildScenarioText(components: ScenarioComponents, senderData: typeof SENDER_DATA[SenderType]): string {
  const { sender, tactic, channel, action, pressure } = components;
  const fakeId = senderData.fakeDisplay.length > 0 ? pick(senderData.fakeDisplay) : pick(senderData.display);
  const problem = fillTemplate(pick(PROBLEM_BY_TACTIC[tactic]));
  const actionText = pick(ACTION_TEXT[action]);
  const consequence = pick(CONSEQUENCE_BY_PRESSURE[pressure]);

  const channelIntro: Record<Channel, string> = {
    sms: `You receive a text from '${fakeId}'`,
    email: `An email arrives from: ${senderData.fakeDomain.length > 0 ? `no-reply@${pick(senderData.fakeDomain)}` : fakeId}`,
    whatsapp: `A WhatsApp message from an unknown number claiming to be ${fakeId}`,
    phone_call: `You receive a phone call from someone claiming to be ${fakeId}`,
  };

  const intro = channelIntro[channel];
  const body = `"${pressure === "urgent" || pressure === "hard_deadline" ? "URGENT: " : ""}We have detected ${problem}. To resolve this, please ${actionText} or ${consequence}."`;

  return `${intro}: ${body}`;
}

function buildRedFlags(components: ScenarioComponents, senderData: typeof SENDER_DATA[SenderType]): string[] {
  const flags: string[] = [];

  if (senderData.fakeDomain.length > 0 && (components.channel === "sms" || components.channel === "email")) {
    flags.push(`Fake domain (not the official ${senderData.category.replace(" Scam", "")} website)`);
  }
  if (components.pressure !== "normal") flags.push("Artificial urgency / deadline pressure");
  if (components.action === "transfer_money") flags.push("Request to move money to a 'safe account' — banks never do this");
  if (components.action === "click_link") flags.push("Unsolicited link in message");
  if (components.action === "call_number") flags.push("Number provided by the caller/message — always use official number");
  if (components.action === "download_software") flags.push("Request to download software from unknown source");
  if (components.tactic === "authority") flags.push("Authority impersonation to create fear");
  if (components.tactic === "emotional") flags.push("Emotional manipulation — designed to bypass rational thinking");
  if (components.sender === "family") flags.push("Unknown number claiming to be someone you trust");
  if (components.channel === "phone_call" && components.sender === "police") flags.push("Real police never ask you to move money");

  return flags.slice(0, 4); // max 4 flags
}

function buildFeedback(components: ScenarioComponents, senderData: typeof SENDER_DATA[SenderType]): { correct: string; incorrect: string } {
  const officialContact = senderData.officialContact;
  const senderName = senderData.category.replace(" Scam", "");

  const tacticsExplained: Record<ScamTactic, string> = {
    urgency: "The urgency is designed to stop you thinking rationally — real organisations give you time.",
    refund_bait: "Legitimate refunds are processed automatically — you never need to 'claim' via a link.",
    security_alert: "Real security alerts never ask you to act immediately via an unsolicited contact.",
    emotional: "Emotional panic is a powerful tool scammers use — always verify before acting.",
    payment_pressure: "Unexpected payment demands are almost always fraudulent — verify first.",
    authority: "Authority figures are often impersonated — but real ones never ask you to move money.",
    impersonation: "Always verify identity through a channel you already trust, not the one they give you.",
  };

  const correct = `Well done. ${senderName} will never contact you out of the blue to take urgent action. The safe move is always to use ${officialContact}. ${tacticsExplained[components.tactic]}`;
  const incorrect = `This is a scam. The message uses ${components.tactic.replace("_", " ")} to make you act without thinking. ${senderName} would never send you this kind of message. Always verify by contacting ${officialContact} — never through the details provided to you.`;

  return { correct, incorrect };
}

// ─── Main generator ──────────────────────────────────────────────────────────

export function generateScenario(components: ScenarioComponents): GeneratedScenario {
  const senderData = SENDER_DATA[components.sender];
  const scenarioText = buildScenarioText(components, senderData);
  const options = getSafeOptions(components, senderData);
  const feedback = buildFeedback(components, senderData);
  const redFlags = buildRedFlags(components, senderData);

  const tacticToTag: Record<ScamTactic, string[]> = {
    urgency: ["urgency"],
    refund_bait: ["refund_bait", "payment"],
    security_alert: ["authority", "tech_support"],
    emotional: ["emotional", "impersonation"],
    payment_pressure: ["payment", "urgency"],
    authority: ["authority"],
    impersonation: ["impersonation"],
  };

  const senderToTag: Record<SenderType, string> = {
    bank: "banking", hmrc: "authority", delivery: "delivery",
    amazon: "authority", tech_support: "tech_support", family: "family",
    police: "authority", broadband: "tech_support",
  };

  const tags = [...new Set([...tacticToTag[components.tactic], senderToTag[components.sender]])];

  const titles: Record<ScamTactic, string[]> = {
    urgency: ["Urgent Account Alert", "Immediate Action Required", "Security Warning"],
    refund_bait: ["Unclaimed Refund Waiting", "Tax Rebate Available", "Overpayment Credit"],
    security_alert: ["Security Breach Detected", "Account Compromised", "Suspicious Activity"],
    emotional: ["Family Emergency", "Loved One Needs Help", "Urgent Family Message"],
    payment_pressure: ["Outstanding Payment Notice", "Final Demand", "Payment Failed"],
    authority: ["Official Investigation Notice", "Legal Action Pending", "Warrant Issued"],
    impersonation: ["Trusted Contact Message", "Urgent Message from Known Sender"],
  };

  // Derive the correct answer ID from whichever option is marked safe after shuffle
  const correctAnswer = options.find((o) => o.safe)?.id ?? "a";

  return {
    id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    module: "real_or_fraud",
    generated: true,
    components,
    tags,
    difficulty: components.difficulty,
    category: senderData.category,
    title: pick(titles[components.tactic]),
    scenario: scenarioText,
    sender: `${pick(senderData.fakeDisplay.length > 0 ? senderData.fakeDisplay : senderData.display)} (${CHANNEL_LABELS[components.channel]})`,
    options,
    correctAnswer,
    feedback_correct: feedback.correct,
    feedback_incorrect: feedback.incorrect,
    redFlags,
  };
}

// ─── Adaptive picker ─────────────────────────────────────────────────────────

export function pickAdaptiveComponents(attempts: AttemptLog[]): ScenarioComponents {
  const profile = computeRiskProfile(attempts);

  // Find highest-risk tactics from previous attempts
  const tacticRisk: Partial<Record<ScamTactic, number>> = {};
  const allTactics: ScamTactic[] = ["urgency", "refund_bait", "security_alert", "emotional", "payment_pressure", "authority", "impersonation"];

  for (const tactic of allTactics) {
    const tagKey = tactic === "refund_bait" ? "refund_bait" : tactic === "payment_pressure" ? "payment" : tactic;
    const stat = profile[tagKey];
    if (stat) {
      const accuracy = stat.correct / stat.total;
      tacticRisk[tactic] = 1 - accuracy; // higher = worse performance
    } else {
      tacticRisk[tactic] = 0.5; // default: untested
    }
  }

  // Weight random selection by risk score
  const sorted = allTactics.sort((a, b) => (tacticRisk[b] ?? 0.5) - (tacticRisk[a] ?? 0.5));

  // 60% chance to pick from the top 2 weak tactics, 40% random
  const tactic = Math.random() < 0.6 ? pick(sorted.slice(0, 2)) : pick(sorted);

  // Determine difficulty based on overall accuracy
  const totalCorrect = attempts.filter((a) => a.correct).length;
  const accuracy = attempts.length > 0 ? totalCorrect / attempts.length : 0;
  const difficulty: Difficulty = accuracy > 0.75 ? 3 : accuracy > 0.45 ? 2 : 1;

  // Pick senders appropriate for the tactic
  const tacticSenders: Record<ScamTactic, SenderType[]> = {
    urgency: ["bank", "hmrc", "delivery", "amazon"],
    refund_bait: ["hmrc", "amazon", "delivery"],
    security_alert: ["bank", "tech_support", "broadband", "amazon"],
    emotional: ["family"],
    payment_pressure: ["hmrc", "delivery", "amazon", "bank"],
    authority: ["police", "hmrc", "bank"],
    impersonation: ["bank", "police", "tech_support", "broadband"],
  };

  const sender = pick(tacticSenders[tactic]);

  // Pick channel appropriate for sender
  const senderChannels: Record<SenderType, Channel[]> = {
    bank: ["sms", "email", "phone_call"],
    hmrc: ["email", "sms", "phone_call"],
    delivery: ["sms", "email"],
    amazon: ["email", "sms"],
    tech_support: ["phone_call", "sms"],
    family: ["whatsapp", "sms"],
    police: ["phone_call"],
    broadband: ["phone_call", "sms"],
  };

  const channel = pick(senderChannels[sender]);

  // Pick action appropriate for tactic
  const tacticActions: Record<ScamTactic, RequestedAction[]> = {
    urgency: ["click_link", "call_number", "transfer_money"],
    refund_bait: ["enter_details", "click_link"],
    security_alert: ["call_number", "click_link", "download_software"],
    emotional: ["transfer_money", "reply"],
    payment_pressure: ["click_link", "call_number", "enter_details"],
    authority: ["transfer_money", "call_number"],
    impersonation: ["call_number", "enter_details", "download_software"],
  };

  const action = pick(tacticActions[tactic]);

  // Pressure level increases with difficulty
  const pressure: PressureLevel = difficulty === 3 ? "hard_deadline" : difficulty === 2 ? "urgent" : "normal";

  return { sender, tactic, channel, action, pressure, difficulty };
}
