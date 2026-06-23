interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const priceFaqDataMap: Record<string, FAQItem[]> = {
  zh: [
    {
      id: "item-1",
      question: "积分是如何工作的？",
      answer:
        "每次图片生成或重绘会消耗积分。新用户注册后可获得 1 个免费积分，用来体验图片生成工作流。",
    },
    {
      id: "item-2",
      question: "Starter 会员多少钱？",
      answer:
        "Starter 月付为 9 美元，每月包含 250 积分，适合轻度使用 and 首次体验。",
    },
    {
      id: "item-3",
      question: "Creator 会员包含什么？",
      answer:
        "Creator 月付为 19 美元，每月包含 600 积分，并提供优先支持，适合高频创作者。",
    },
    {
      id: "item-4",
      question: "可以一次性购买积分吗？",
      answer:
        "可以。当前一次性积分包为 100 Credits（5 美元）、350 Credits（15 美元）和 1000 Credits（39 美元），购买后积分有效期为 1 年。",
    },
    {
      id: "item-5",
      question: "订阅和一次性购买有什么区别？",
      answer:
        "订阅会按月自动补充积分，月付积分有效期为 30 天；一次性积分包只需支付一次，积分有效期为 1 年。",
    },
    {
      id: "item-6",
      question: "我可以随时取消订阅吗？",
      answer:
        "可以。取消后将在当前计费周期结束时停止续费，已经到账的积分不会立刻失效。",
    },
  ],
  en: [
    {
      id: "item-1",
      question: "How do credits work?",
      answer:
        "Each image generation or remix uses credits. New users receive 1 free credit to try the image generation workflow.",
    },
    {
      id: "item-2",
      question: "How much does the Starter plan cost?",
      answer:
        "The Starter plan is $9/month and includes 250 credits each month.",
    },
    {
      id: "item-3",
      question: "What's included in the Creator plan?",
      answer:
        "The Creator plan is $19/month with 600 credits and priority support, making it the best fit for active creators.",
    },
    {
      id: "item-4",
      question: "Can I purchase credits one-time?",
      answer:
        "Yes. We offer 100 Credits for $5, 350 Credits for $15, and 1000 Credits for $39. One-time credits stay valid for 1 year.",
    },
    {
      id: "item-5",
      question: "What's the difference between subscription and one-time purchase?",
      answer:
        "Subscriptions recharge your balance every month and monthly credits stay valid for 30 days. One-time packages are paid once and remain valid for 1 year.",
    },
    {
      id: "item-6",
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes. You can cancel anytime and your subscription will stop renewing at the end of the current billing cycle.",
    },
  ],
  ja: [
    {
      id: "item-1",
      question: "クレジットはどのように使われますか？",
      answer:
        "画像生成やリミックスごとにクレジットを消費します。新規ユーザーには画像生成ワークフローを試せる 1 クレジットが付与されます。",
    },
    {
      id: "item-2",
      question: "Starter プランの料金はいくらですか？",
      answer:
        "Starter プランは月額 9 ドルで、毎月 250 クレジットが含まれます。",
    },
    {
      id: "item-3",
      question: "Creator プランには何が含まれますか？",
      answer:
        "Creator プラン is 月額 19 ドルで、毎月 600 クレジットと優先サポートが含まれます。",
    },
    {
      id: "item-4",
      question: "クレジットを一回だけ購入できますか？",
      answer:
        "はい。100 Credits は 5 ドル、350 Credits は 15 ドル、1000 Credits は 39 ドルです。購入したクレジットは 1 年間有効です。",
    },
    {
      id: "item-5",
      question: "サブスクリプションと単发購入の違いは何ですか？",
      answer:
        "サブスクリプションは毎月自動でクレジットが追加され、月次クレジットは 30 日間有効です。単发購入は一度きりの支払いで、1 年間有効です。",
    },
    {
      id: "item-6",
      question: "サブスクリプションはいつでも解約できますか？",
      answer:
        "はい。いつでも解約でき、現在の請求期間終了後に自動更新が停止します。",
    },
  ],
  ko: [
    {
      id: "item-1",
      question: "크레딧은 어떻게 사용되나요?",
      answer:
        "이미지 생성이나 리믹스마다 크레딧이 차감됩니다. 신규 사용자는 이미지 생성 워크플로를 체험할 수 있도록 무료 1크레딧을 받습니다.",
    },
    {
      id: "item-2",
      question: "Starter 플랜은 얼마인가요?",
      answer:
        "Starter 플랜은 월 9달러이며 매월 250크레딧이 포함됩니다.",
    },
    {
      id: "item-3",
      question: "Creator 플랜에는 무엇이 포함되나요?",
      answer:
        "Creator 플랜은 월 19달러이며 매월 600크레딧과 우선 지원이 포함됩니다.",
    },
    {
      id: "item-4",
      question: "크레딧을 일회성으로 구매할 수 있나요?",
      answer:
        "네. 100 Credits는 5달러, 350 Credits는 15달러, 1000 Credits는 39달러입니다. 일회성 크레딧은 1년 동안 유효합니다.",
    },
    {
      id: "item-5",
      question: "구독과 일회성 구매의 차이는 무엇인가요?",
      answer:
        "구독은 매월 자동으로 크레딧이 충전되고 월간 크레딧은 30일간 유효합니다. 일회성 패키지는 한 번만 결제하면 되며 1년간 유효합니다.",
    },
    {
      id: "item-6",
      question: "구독은 언제든지 취소할 수 있나요?",
      answer:
        "네. 언제든지 취소할 수 있으며 현재 결제 주기가 끝나면 자동 갱신이 중지됩니다.",
    },
  ],
};
