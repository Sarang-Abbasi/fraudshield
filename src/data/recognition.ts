export interface Hotspot {
  id: string;
  label: string;
  description: string;
  x: number; // percentage
  y: number; // percentage
  isScam: boolean;
}

export interface RecognitionScenario {
  id: string;
  module: string;
  difficulty: number;
  tags: string[];
  title: string;
  type: "email" | "sms" | "webpage";
  description: string;
  hotspots: Hotspot[];
  feedback_correct: string;
  feedback_incorrect: string;
  summary: string;
}

export const recognitionScenarios: RecognitionScenario[] = [
  {
    id: "rec-001",
    module: "recognition",
    difficulty: 1,
    tags: ["urgency", "authority", "banking"],
    title: "Phishing Email — PayPal Account",
    type: "email",
    description: "Review this email carefully and tap the suspicious elements you can spot.",
    summary: "A convincing PayPal phishing email with multiple tell-tale signs.",
    hotspots: [
      {
        id: "h1",
        label: "Sender address",
        description: "The sender is 'service@paypal-secure-login.com' — not from paypal.com. Fake domain designed to look official.",
        x: 12,
        y: 8,
        isScam: true
      },
      {
        id: "h2",
        label: "Generic greeting",
        description: "Real PayPal emails always include your name. 'Dear Customer' is a scam sign — they don't know who you are.",
        x: 15,
        y: 28,
        isScam: true
      },
      {
        id: "h3",
        label: "Urgent deadline",
        description: "'Your account will be suspended in 24 hours' — urgency is a classic manipulation tactic to bypass rational thinking.",
        x: 50,
        y: 45,
        isScam: true
      },
      {
        id: "h4",
        label: "Suspicious link",
        description: "The button says 'Verify Account' but the actual URL would go to paypal-account-verify.net — not paypal.com.",
        x: 50,
        y: 65,
        isScam: true
      },
      {
        id: "h5",
        label: "PayPal logo",
        description: "This looks like the real PayPal logo but it's been copied. Logos can be easily copied — always verify other signs.",
        x: 50,
        y: 12,
        isScam: false
      }
    ],
    feedback_correct: "Well spotted! This email has 4 major red flags: fake sender domain, generic greeting, artificial urgency, and a deceptive link. Always verify emails by logging in directly — never through links in emails.",
    feedback_incorrect: "This email is a phishing attempt. Key red flags: sender domain is 'paypal-secure-login.com' (not paypal.com), greeting is generic, there's an artificial 24-hour deadline, and the link points to a fake website."
  },
  {
    id: "rec-002",
    module: "recognition",
    difficulty: 2,
    tags: ["delivery", "payment", "urgency"],
    title: "Fake Delivery SMS",
    type: "sms",
    description: "This SMS landed in someone's inbox. Tap all the suspicious elements.",
    summary: "A delivery scam SMS with subtle and obvious red flags.",
    hotspots: [
      {
        id: "h1",
        label: "Sender number",
        description: "The SMS comes from a mobile number (07712 445 823). Royal Mail and couriers use short codes or official names — not personal mobile numbers.",
        x: 20,
        y: 12,
        isScam: true
      },
      {
        id: "h2",
        label: "Suspicious URL",
        description: "'royalmail-redelivery.co.uk' is NOT the official Royal Mail website. The real site is royalmail.com. Always check the exact domain.",
        x: 50,
        y: 60,
        isScam: true
      },
      {
        id: "h3",
        label: "Small fee request",
        description: "A £1.45 fee seems harmless but it's designed to capture your card details. The amount is deliberately low to reduce suspicion.",
        x: 50,
        y: 42,
        isScam: true
      },
      {
        id: "h4",
        label: "Parcel number",
        description: "The parcel number looks legitimate but it means nothing — scammers generate these to add false credibility.",
        x: 50,
        y: 25,
        isScam: false
      }
    ],
    feedback_correct: "Great work! The mobile sender number, fake domain, and the card-capturing fee request are the three main red flags. Parcel numbers can look real but are easily faked.",
    feedback_incorrect: "This SMS is a scam. Red flags: personal mobile sender (not an official short code), fake domain (royalmail-redelivery.co.uk vs royalmail.com), and a fee designed to harvest your card details."
  },
  {
    id: "rec-003",
    module: "recognition",
    difficulty: 3,
    tags: ["authority", "impersonation", "urgency", "payment"],
    title: "Fake HMRC Tax Rebate Page",
    type: "webpage",
    description: "This webpage claims to be from HMRC. Find every suspicious element.",
    summary: "An advanced HMRC impersonation site with multiple deceptive elements.",
    hotspots: [
      {
        id: "h1",
        label: "Browser URL bar",
        description: "The URL is 'hmrc-tax-rebate.com' — government websites always end in .gov.uk. This is a critical sign of a fake page.",
        x: 50,
        y: 5,
        isScam: true
      },
      {
        id: "h2",
        label: "No secure padlock",
        description: "Legitimate HMRC pages always have HTTPS and a secure connection. An insecure page collecting personal data is a major red flag.",
        x: 8,
        y: 5,
        isScam: true
      },
      {
        id: "h3",
        label: "Request for National Insurance number",
        description: "HMRC doesn't need you to enter your NI number on a rebate page — they already have it. Any site asking for this is attempting identity theft.",
        x: 50,
        y: 58,
        isScam: true
      },
      {
        id: "h4",
        label: "Bank details form",
        description: "Legitimate government rebates are made to your existing bank details on file — they never ask you to re-enter banking information via a web form.",
        x: 50,
        y: 72,
        isScam: true
      },
      {
        id: "h5",
        label: "Crown logo and HMRC branding",
        description: "The logo looks official but logos are freely copyable. Always check the domain — not the visual branding.",
        x: 15,
        y: 18,
        isScam: false
      }
    ],
    feedback_correct: "Excellent awareness! Non-.gov.uk domain, missing HTTPS, and collecting NI + bank details via a form are the critical signs. Branding can be copied — always verify the URL.",
    feedback_incorrect: "This is a fake HMRC page. Key issues: wrong domain (not .gov.uk), potential missing HTTPS, and collecting NI + bank details which HMRC already holds and would never request this way."
  }
];
