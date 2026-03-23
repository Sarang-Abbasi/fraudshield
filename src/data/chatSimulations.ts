export interface ChatNode {
  id: string;
  speaker: "scammer" | "system";
  message: string;
  options?: ChatOption[];
  isEnd?: boolean;
  outcome?: "safe" | "unsafe" | "partial";
  outcomeMessage?: string;
  scoreChange?: number;
}

export interface ChatOption {
  id: string;
  text: string;
  nextNodeId: string;
  tags?: string[];
  safeAction?: boolean;
}

export interface ChatSimulation {
  id: string;
  module: string;
  difficulty: number;
  tags: string[];
  title: string;
  description: string;
  callerName: string;
  callerType: string;
  nodes: Record<string, ChatNode>;
  startNodeId: string;
}

export const chatSimulations: ChatSimulation[] = [
  {
    id: "chat-001",
    module: "chat",
    difficulty: 1,
    tags: ["tech_support", "authority", "urgency"],
    title: "BT Broadband Tech Support",
    description: "You receive a call from someone claiming to be from BT. Navigate the conversation safely.",
    callerName: "James from BT Technical Support",
    callerType: "Phone Call",
    startNodeId: "start",
    nodes: {
      start: {
        id: "start",
        speaker: "scammer",
        message: "Hello, am I speaking with the homeowner? This is James calling from BT Technical Support. Our systems have detected that your broadband router has been sending out unusual data and may have been compromised. I'm calling to help you secure it before any personal data is stolen.",
        options: [
          { id: "a", text: "How do I know you're really from BT?", nextNodeId: "verify_attempt", safeAction: true, tags: ["verification"] },
          { id: "b", text: "Oh no — what do I need to do?", nextNodeId: "comply_1", safeAction: false, tags: ["urgency"] },
          { id: "c", text: "I'm not interested, please don't call again.", nextNodeId: "hang_up_early", safeAction: true, tags: ["avoidance"] }
        ]
      },
      verify_attempt: {
        id: "verify_attempt",
        speaker: "scammer",
        message: "Of course! My employee ID is BT-48291 and you can verify this at bt-support-verify.co.uk. But I must stress — we're seeing your data being accessed right now. Every second counts. Can you open your computer so we can run a quick diagnostic?",
        options: [
          { id: "a", text: "That website doesn't look like a real BT website. I'm going to call BT directly.", nextNodeId: "call_bt_direct", safeAction: true, tags: ["verification"] },
          { id: "b", text: "Okay, let me open my laptop.", nextNodeId: "gave_access", safeAction: false, tags: ["urgency"] },
          { id: "c", text: "Hang up the call.", nextNodeId: "hang_up_good", safeAction: true, tags: ["avoidance"] }
        ]
      },
      comply_1: {
        id: "comply_1",
        speaker: "scammer",
        message: "I'm glad you're taking this seriously. I'll need you to open your laptop and download a small diagnostic tool so I can connect remotely and fix this. It's completely safe and we use it for all BT customers. Can you go to remotefix-bt.com and download the tool?",
        options: [
          { id: "a", text: "Wait — should I really download something from a stranger?", nextNodeId: "hesitate", safeAction: true, tags: ["verification"] },
          { id: "b", text: "Okay, I'll download it now.", nextNodeId: "gave_access", safeAction: false, tags: ["payment"] },
          { id: "c", text: "Hang up immediately.", nextNodeId: "hang_up_late", safeAction: true, tags: ["avoidance"] }
        ]
      },
      hesitate: {
        id: "hesitate",
        speaker: "scammer",
        message: "I understand your concern, but I assure you this is completely standard BT procedure. We do this for thousands of customers daily. If you don't act now, your banking details and personal files could already be compromised. We really need to act in the next few minutes.",
        options: [
          { id: "a", text: "I'm going to hang up and call BT myself using the number on my bill.", nextNodeId: "call_bt_direct", safeAction: true, tags: ["verification"] },
          { id: "b", text: "Alright, I believe you. What do I download?", nextNodeId: "gave_access", safeAction: false, tags: ["urgency"] }
        ]
      },
      call_bt_direct: {
        id: "call_bt_direct",
        speaker: "system",
        message: "You told the caller you'd verify by calling BT directly. The caller became flustered and said 'there isn't time for that.' You hung up and called 0800-800-150 (BT's real number). BT confirmed they had not called you and there was no issue with your router.",
        isEnd: true,
        outcome: "safe",
        outcomeMessage: "Excellent decision! Calling the official number is exactly the right move. Real companies will never object to you verifying their identity through official channels. This was a tech support scam.",
        scoreChange: 100
      },
      hang_up_early: {
        id: "hang_up_early",
        speaker: "system",
        message: "You immediately ended the call. A few seconds later, they tried to call back. You ignored it.",
        isEnd: true,
        outcome: "safe",
        outcomeMessage: "Good instinct! Hanging up on unsolicited tech support calls is always a safe choice. BT will never call you out of the blue like this. If you're worried about your broadband, call them on the official number.",
        scoreChange: 90
      },
      hang_up_good: {
        id: "hang_up_good",
        speaker: "system",
        message: "You ended the call after spotting the suspicious website. You then checked your broadband by calling BT directly — everything was fine.",
        isEnd: true,
        outcome: "safe",
        outcomeMessage: "Well done for spotting the fake domain and hanging up. Legitimate support staff will never be upset if you want to verify their identity.",
        scoreChange: 85
      },
      hang_up_late: {
        id: "hang_up_late",
        speaker: "system",
        message: "You hung up before downloading anything. Although you complied initially, you stopped before the most damaging step.",
        isEnd: true,
        outcome: "partial",
        outcomeMessage: "You eventually made the right call, but compliance earlier gave them time to gather information from the conversation. Next time, hang up sooner when a caller asks you to download software.",
        scoreChange: 50
      },
      gave_access: {
        id: "gave_access",
        speaker: "system",
        message: "You downloaded the remote access tool. The scammer connected to your computer, pretended to 'fix' the problem, then said they needed payment of £199 for the service. Meanwhile, they had access to your files and banking portal.",
        isEnd: true,
        outcome: "unsafe",
        outcomeMessage: "This was a scam. Never give remote access to someone who calls you unsolicited. They would now have access to your personal files and banking details. Call your bank immediately if this happens and report to Action Fraud (0300 123 2040).",
        scoreChange: 0
      }
    }
  },
  {
    id: "chat-002",
    module: "chat",
    difficulty: 2,
    tags: ["impersonation", "authority", "payment", "urgency"],
    title: "HSBC Fraud Team Call",
    description: "Someone calls claiming to be from your bank's fraud team. A sophisticated scam — stay sharp.",
    callerName: "Sarah from HSBC Fraud Prevention",
    callerType: "Phone Call",
    startNodeId: "start",
    nodes: {
      start: {
        id: "start",
        speaker: "scammer",
        message: "Good afternoon, I'm calling from HSBC's Fraud Prevention team. My name is Sarah, ID number 7481. We've identified two suspicious transactions on your account — £340 at a Manchester retailer and £675 online. Did you make these payments?",
        options: [
          { id: "a", text: "No I didn't — what do we need to do?", nextNodeId: "comply_1", safeAction: false, tags: ["urgency"] },
          { id: "b", text: "Can you confirm my account details first so I know you're legitimate?", nextNodeId: "test_them", safeAction: true, tags: ["verification"] },
          { id: "c", text: "I'm going to hang up and call HSBC directly.", nextNodeId: "hang_up_smart", safeAction: true, tags: ["verification"] }
        ]
      },
      test_them: {
        id: "test_them",
        speaker: "scammer",
        message: "I'm sorry, for data protection reasons we cannot share your account details over the phone — it's for your security. But I can confirm we're seeing transactions from a device in Manchester. To protect your funds, I need you to move them to our secure holding account until we've completed the investigation.",
        options: [
          { id: "a", text: "That makes sense. What account should I transfer to?", nextNodeId: "transfer_money", safeAction: false, tags: ["payment"] },
          { id: "b", text: "Banks don't have 'holding accounts' — this sounds like a scam.", nextNodeId: "call_bank_official", safeAction: true, tags: ["verification"] },
          { id: "c", text: "I want to call HSBC on 03457 404 404 to verify this.", nextNodeId: "call_bank_official", safeAction: true, tags: ["verification"] }
        ]
      },
      comply_1: {
        id: "comply_1",
        speaker: "scammer",
        message: "Don't worry, we're going to stop this right now. To protect your funds, our fraud team has set up a secure holding account. I'll need you to transfer your balance there temporarily while we investigate and freeze the fraudulent access. How much do you currently have in your main account?",
        options: [
          { id: "a", text: "I have about £4,000. How do I transfer it?", nextNodeId: "transfer_money", safeAction: false, tags: ["payment"] },
          { id: "b", text: "Why would I need to move my own money? My bank should freeze the account.", nextNodeId: "question_logic", safeAction: true, tags: ["verification"] },
          { id: "c", text: "I'm hanging up and calling the number on my bank card.", nextNodeId: "call_bank_official", safeAction: true, tags: ["verification"] }
        ]
      },
      question_logic: {
        id: "question_logic",
        speaker: "scammer",
        message: "I understand your concern, but our fraud team cannot freeze accounts on outgoing calls — only when you call in. The secure account transfer is the fastest way to protect your money. The fraudsters are attempting to access your funds right now. Please, we're running out of time.",
        options: [
          { id: "a", text: "I'm going to call HSBC myself to confirm all of this.", nextNodeId: "call_bank_official", safeAction: true, tags: ["verification"] },
          { id: "b", text: "Okay, I believe you. Tell me the account details.", nextNodeId: "transfer_money", safeAction: false, tags: ["urgency"] }
        ]
      },
      call_bank_official: {
        id: "call_bank_official",
        speaker: "system",
        message: "You hung up and called HSBC on their official number (03457 404 404). They confirmed no fraud alert was raised and no one from HSBC had called you. The previous caller was a scammer running an Authorised Push Payment (APP) fraud attempt.",
        isEnd: true,
        outcome: "safe",
        outcomeMessage: "Brilliant! This is a sophisticated APP scam — one of the UK's most costly fraud types. Banks will NEVER ask you to transfer money to a 'safe account'. Always call your bank using the number on the back of your card.",
        scoreChange: 100
      },
      hang_up_smart: {
        id: "hang_up_smart",
        speaker: "system",
        message: "You hung up immediately and called HSBC directly. No fraud alert existed. The caller was a criminal impersonating bank staff.",
        isEnd: true,
        outcome: "safe",
        outcomeMessage: "Perfect instinct. Hanging up and calling back on the official number is the gold standard response to any suspicious bank call. Well done.",
        scoreChange: 100
      },
      transfer_money: {
        id: "transfer_money",
        speaker: "system",
        message: "You transferred £4,000 to the 'secure holding account'. The caller thanked you and said the investigation would take 3-5 working days. HSBC's actual fraud team then called you — you'd been scammed and the money was gone.",
        isEnd: true,
        outcome: "unsafe",
        outcomeMessage: "This was an APP (Authorised Push Payment) scam — the UK's most financially damaging fraud. Banks will NEVER ask you to transfer money to keep it safe. Report to Action Fraud immediately (0300 123 2040) and call your bank on the official number to try to recall the payment.",
        scoreChange: 0
      }
    }
  }
];
