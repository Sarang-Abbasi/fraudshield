export const realOrFraudScenarios = [
  {
    id: "rof-001",
    module: "real_or_fraud",
    difficulty: 1,
    tags: ["urgency", "authority", "banking"],
    category: "Bank Scam",
    title: "Suspicious Bank Alert",
    scenario: "Margaret receives a text from 'Barclays Bank': 'URGENT: Unusual activity detected on your account. £1,200 transferred to unknown account. To cancel and protect your funds, call 0800-123-456 immediately or click: barclays-secure-verify.co.uk'",
    sender: "Barclays Bank (07700900123)",
    options: [
      { id: "a", text: "Click the link to protect my account immediately", safe: false },
      { id: "b", text: "Call the number in the text to verify", safe: false },
      { id: "c", text: "Ignore the text and call Barclays using the number on my bank card", safe: true },
      { id: "d", text: "Reply to the text asking for more information", safe: false }
    ],
    correctAnswer: "c",
    feedback_correct: "Excellent! Real banks never ask you to click links or call numbers in texts. Always use the official number on your bank card or their website. The fake domain 'barclays-secure-verify.co.uk' is a major red flag.",
    feedback_incorrect: "This is a scam. The URL 'barclays-secure-verify.co.uk' is fake — real Barclays pages are at barclays.co.uk. Never call numbers from suspicious texts. The urgency is designed to panic you into acting fast.",
    redFlags: ["Fake domain (.co.uk not official)", "Urgency language", "Unsolicited contact", "Generic greeting"]
  },
  {
    id: "rof-002",
    module: "real_or_fraud",
    difficulty: 1,
    tags: ["authority", "impersonation", "payment"],
    category: "HMRC Scam",
    title: "Tax Rebate Offer",
    scenario: "You receive an email: 'From: hmrc-refunds@gov-uk-tax.com — Dear Taxpayer, You are eligible for a tax refund of £892.40. To claim, verify your identity and enter bank details within 48 hours or the refund will be cancelled.'",
    sender: "hmrc-refunds@gov-uk-tax.com",
    options: [
      { id: "a", text: "Click the link and enter my bank details to claim the refund", safe: false },
      { id: "b", text: "Forward to family to check if it's real", safe: false },
      { id: "c", text: "Delete it — HMRC never contacts by email asking for bank details", safe: true },
      { id: "d", text: "Reply asking for more proof before providing details", safe: false }
    ],
    correctAnswer: "c",
    feedback_correct: "Perfect. HMRC will never email or text you asking for bank details or requesting you click links to claim refunds. The email domain 'gov-uk-tax.com' is completely fake — real HMRC uses hmrc.gov.uk.",
    feedback_incorrect: "This is a scam. HMRC only contacts you by post or through your Government Gateway account — never by unsolicited email asking for bank details. The 48-hour deadline is a pressure tactic.",
    redFlags: ["Fake email domain", "Unsolicited refund claim", "Deadline pressure", "Requests bank details"]
  },
  {
    id: "rof-003",
    module: "real_or_fraud",
    difficulty: 2,
    tags: ["impersonation", "emotional", "family"],
    category: "Family Impersonation",
    title: "Mum, It's Me",
    scenario: "WhatsApp message from an unknown number: 'Mum it's Sarah! I dropped my phone and broke it, this is my friend's number. I'm stuck abroad and need £400 transferred urgently for a flight home. Please don't call Dad — I'll explain everything when I'm back. Bank: sort code 20-44-11, acc 73829104'",
    sender: "Unknown (+44 7821 334901)",
    options: [
      { id: "a", text: "Transfer the money immediately — Sarah might be in danger", safe: false },
      { id: "b", text: "Ask for more information via WhatsApp before deciding", safe: false },
      { id: "c", text: "Call Sarah on her original number or video call to verify identity", safe: true },
      { id: "d", text: "Ask your husband to transfer it since they said not to tell him", safe: false }
    ],
    correctAnswer: "c",
    feedback_correct: "Well done. Always verify through a trusted channel. Call the person's known number or video call to confirm it's really them. Scammers rely on emotional urgency to bypass rational thinking.",
    feedback_incorrect: "This is the 'Hi Mum' scam, very common on WhatsApp. The scammer creates emotional panic, isolation ('don't tell Dad'), and time pressure. Always verify by calling the person's real number before sending any money.",
    redFlags: ["Unknown number claiming to be family", "Urgency and isolation tactics", "Specific bank account", "Broken phone excuse"]
  },
  {
    id: "rof-004",
    module: "real_or_fraud",
    difficulty: 2,
    tags: ["urgency", "authority", "tech_support"],
    category: "Tech Support Scam",
    title: "Microsoft Security Alert",
    scenario: "A pop-up appears on your computer: 'MICROSOFT SECURITY ALERT — Your computer has been BLOCKED due to suspicious activity. DO NOT CLOSE THIS WINDOW. Call Microsoft Support immediately: 0800-048-1234. Your personal information is at risk.'",
    sender: "Browser Pop-up",
    options: [
      { id: "a", text: "Call the number straight away to protect my computer", safe: false },
      { id: "b", text: "Close the browser and run a real antivirus scan", safe: true },
      { id: "c", text: "Give them remote access so they can fix it", safe: false },
      { id: "d", text: "Pay the fee they mention to unlock my computer", safe: false }
    ],
    correctAnswer: "b",
    feedback_correct: "Correct! Microsoft never sends pop-up alerts asking you to call a number. These fake pop-ups are designed to look official. Close the browser (use Task Manager if needed), run a legitimate antivirus scan, and do not call any number shown.",
    feedback_incorrect: "This is a tech support scam. Microsoft never contacts you this way. These pop-ups use scare tactics — 'blocked', 'URGENT', 'DO NOT CLOSE' — to make you panic and call. If you give them access, they install malware or steal your data.",
    redFlags: ["Unsolicited security alert", "Urgent all-caps warnings", "Asks you to call a number", "Threatens data loss"]
  },
  {
    id: "rof-005",
    module: "real_or_fraud",
    difficulty: 2,
    tags: ["delivery", "urgency", "payment"],
    category: "Delivery Scam",
    title: "Royal Mail Parcel Fee",
    scenario: "SMS: 'Royal Mail: Your parcel (GB-1842-3921) could not be delivered. A customs fee of £1.49 is required to release it. Pay within 24 hours or it will be returned: royalmail-parcel-pay.com'",
    sender: "RoyalMail (07488123456)",
    options: [
      { id: "a", text: "Pay the £1.49 — it's only a small amount and sounds legitimate", safe: false },
      { id: "b", text: "Click the link to check what parcel it is", safe: false },
      { id: "c", text: "Check directly on the Royal Mail website using your own tracking number", safe: true },
      { id: "d", text: "Ignore for now and see if they chase it again", safe: false }
    ],
    correctAnswer: "c",
    feedback_correct: "Smart move. Royal Mail sometimes does charge customs fees but will only contact you via official channels. Never click links in texts — go directly to royalmail.com and enter your tracking number. The low fee amount is a deliberate tactic to make you comply.",
    feedback_incorrect: "This is a parcel delivery scam. The £1.49 is a trick — it's small enough to not question. But the real goal is to harvest your card details on the fake site. Always visit royalmail.com directly, never via a link in an SMS.",
    redFlags: ["Fake domain", "Sent from mobile number", "Urgent 24hr deadline", "Unexpected parcel"]
  },
  {
    id: "rof-006",
    module: "real_or_fraud",
    difficulty: 3,
    tags: ["urgency", "authority", "payment", "impersonation"],
    category: "Authorised Push Payment",
    title: "Safe Account Fraud",
    scenario: "You receive a call: 'Good afternoon, this is DS Mark Taylor from the Metropolitan Police Cyber Crime Unit. We've arrested a fraudster who has your bank account details and is planning to drain it tonight. You must transfer your savings to a designated safe account urgently to protect them. This is a live investigation so please do not contact your bank — it may compromise the operation.'",
    sender: "Phone Call (020-XXXX)",
    options: [
      { id: "a", text: "Follow the officer's instructions to protect my savings", safe: false },
      { id: "b", text: "Ask for his badge number then transfer to the safe account", safe: false },
      { id: "c", text: "Hang up and call 999 or your bank using the number on your card to verify", safe: true },
      { id: "d", text: "Tell them you'll need your family present before proceeding", safe: false }
    ],
    correctAnswer: "c",
    feedback_correct: "Outstanding! This is an Authorised Push Payment (APP) scam — the most costly type in the UK. The police, your bank, and HMRC will NEVER ask you to move money to a 'safe account'. If you get this call, hang up and call 999 using a different phone.",
    feedback_incorrect: "This is an APP scam — Authorised Push Payment fraud. The caller impersonates police to give authority and uses secrecy ('don't contact your bank') to isolate you. Real police and banks will NEVER ask you to transfer your own money for safety. Hang up and call 999.",
    redFlags: ["Police impersonation", "Safe account request", "Secrecy / isolation demand", "Urgency about saving tonight"]
  }
];
