interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * 定价页面 FAQ 数据
 *
 * 基于 PRICING_REFERENCE.md 文档更新
 */
export const priceFaqDataMap: Record<string, FAQItem[]> = {
  zh: [
    {
      id: "item-1",
      question: "积分是如何工作的？",
      answer:
        "每次生成图片或图片合成时消耗 1 积分。新注册用户将免费获赠 1 积分，可直接体验 1 次 GPT-Image-2 核心大模型生成。您可以随时在账户中查看积分余额。",
    },
    {
      id: "item-2",
      question: "Basic 计划的费用是多少？",
      answer:
        "Basic 月付计划每月 5.00 美元，提供 70 积分。年付计划 50 美元，提供 840 积分，相当于省了 2 个月的费用。",
    },
    {
      id: "item-3",
      question: "Pro 计划包含哪些功能？",
      answer:
        "Pro 计划每月提供 220 积分，每月 15.00 美元。年付 150 美元，提供 2,640 积分。Pro 计划包含优先客服支持、商业使用权以及完整的 GPT-Image-2 模型接入，是我们最受欢迎的选择。",
    },
    {
      id: "item-4",
      question: "我可以一次性购买积分吗？",
      answer:
        "是的！我们提供一次性积分包：Starter Pack（50 积分，5.00 美元）、Standard Pack（130 积分，12.00 美元） and Pro Pack（350 积分，30.00 美元）。积分包有效期为 1 年。",
    },
    {
      id: "item-5",
      question: "订阅和一次性购买有什么区别？",
      answer:
        "订阅每月自动为您充值积分，月付积分有效期为 30 定。一次性购买积分包只需支付一次，积分有效期为 1 年。订阅用户享受更优惠的单价，年付订阅可省 17%。",
    },
    {
      id: "item-6",
      question: "我可以随时取消订阅吗？",
      answer:
        "是的，您可以随时取消订阅。取消后，您将在当前计费周期结束后停止续费，已经充值的积分不会受到影响。",
    },
  ],
  en: [
    {
      id: "item-1",
      question: "How do credits work?",
      answer:
        "Each image generation or remix consumes 1 credit. New users receive 1 free credit upon registration to experience our strongest GPT-Image-2 model. You can check your balance anytime.",
    },
    {
      id: "item-2",
      question: "How much does the Basic plan cost?",
      answer:
        "The Basic monthly plan is $5.00/month with 70 credits.",
    },
    {
      id: "item-3",
      question: "What's included in the Pro plan?",
      answer:
        "The Pro plan provides 220 credits per month at $15.00/month. The Pro plan includes priority support, commercial license, and full access to the GPT-Image-2 model. It's our most popular choice.",
    },
    {
      id: "item-4",
      question: "Can I purchase credits one-time?",
      answer:
        "Yes! We offer one-time credit packages: Starter Pack (50 credits, $5.00), Standard Pack (130 credits, $12.00), and Pro Pack (350 credits, $30.00). Credit packages are valid for 1 year.",
    },
    {
      id: "item-5",
      question: "What's the difference between subscription and one-time purchase?",
      answer:
        "Subscriptions automatically recharge your credits monthly. Monthly subscription credits are valid for 30 days. One-time credit packages require a single payment and credits are valid for 1 year. Subscribers enjoy better per-credit rates.",
    },
    {
      id: "item-6",
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription anytime. After cancellation, you'll stop being charged at the end of your current billing period, and your existing credits will not be affected.",
    },
  ],
  ja: [
    {
      id: "item-1",
      question: "クレジットはどのように機能しますか？",
      answer:
        "画像を生成または合成するたびに1クレジットが消費されます。新規登録のユーザーには、最強のモデルであるGPT-Image-2を1回お試しいただける1クレジットを無料でプレゼントします。クレジット残高はアカウントでいつでも確認できます。",
    },
    {
      id: "item-2",
      question: "Basic プランの費用はいくらですか？",
      answer:
        "Basic 月額プランは月額 5.00 ドルで 70 クレジット。年額プランは 50 ドルで 840 クレジットで、2 ヶ月分の支払いを節約できます。",
    },
    {
      id: "item-3",
      question: "Pro プランには何が含まれていますか？",
      answer:
        "Pro プランは月額 15.00 ドルで 220 クレジット。年額プランは 150 ドルで 2,640 クレジット。Pro プランには優先サポート、商用利用権、GPT-Image-2モデルへのフルアクセスが含まれ、最も人気のある選択肢です。",
    },
    {
      id: "item-4",
      question: "クレジットを一回限りの購入でできますか？",
      answer:
        "はい！Starter Pack（50 クレジット、5.00 ドル）、Standard Pack（130 クレジット、12.00 ドル）、Pro Pack（350 クレジット、30.00 ドル）の一回限りのクレジットパッケージをご用意しています。有効期間は 1 年です。",
    },
    {
      id: "item-5",
      question: "サブスクリプションと一回限りの購入の違いは何ですか？",
      answer:
        "サブスクリプションは毎月自動的にクレジットをチャージします。月額サブスクリプションのクレジットは 30 日間有効です。一回限りのクレジットパッケージは一度の支払いで、クレジットは 1 年間有効です。サブスクライバーはよりお得なレートを享受でき、年額プランは 17% 節約できます。",
    },
    {
      id: "item-6",
      question: "サブスクリプションをいつでもキャンセルできますか？",
      answer:
        "はい、いつでもサブスクリプションをキャンセルできます。キャンセル後、現在の請求期間の終了時に課金が停止され、既存のクレジットには影響しません。",
    },
  ],
  ko: [
    {
      id: "item-1",
      question: "크레딧은 어떻게 작동하나요?",
      answer:
        "이미지를 생성하거나 합성할 때마다 1크레딧이 소비됩니다. 신규 가입 사용자는 가장 강력한 GPT-Image-2 모델을 1회 체험할 수 있는 1크레딧을 무료로 받습니다. 언제든지 계정에서 크레딧 잔액을 확인할 수 있습니다.",
    },
    {
      id: "item-2",
      question: "Basic 플랜의 비용은 얼마인가요?",
      answer:
        "Basic 월간 플랜은 월 $5.00에 70 크레딧을 제공합니다. 연간 플랜은 $50에 840 크레딧을 제공하며 2개월치 요금을 절약할 수 있습니다.",
    },
    {
      id: "item-3",
      question: "Pro 플랜에는 무엇이 포함되어 있나요?",
      answer:
        "Pro 플랜은 월 $15.00에 월 220 크레딧을 제공합니다. 연간 플랜은 $150에 2,640 크레딧을 제공합니다. Pro 플랜에는 우선 지원, 상업용 라이선스 및 GPT-Image-2 모델 전체 액세스 권한이 포함되어 있으며 가장 인기 있는 선택입니다.",
    },
    {
      id: "item-4",
      question: "일회성 크레딧을 구매할 수 있나요?",
      answer:
        "네! Starter Pack(50 크레딧, $5.00), Standard Pack(130 크레딧, $12.00), Pro Pack(350 크레딧, $30.00)의 일회성 크레딧 패키지를 제공합니다. 크레딧 패키지는 1년 동안 유효합니다.",
    },
    {
      id: "item-5",
      question: "구독과 일회성 구매의 차이점은 무엇인가요?",
      answer:
        "구독은 매월 자동으로 크레딧을 충전합니다. 월간 구독 크레딧은 30일 동안 유효합니다. 일회성 크레딧 패키지는 한 번의 결제로 되며 크레딧은 1년 동안 유효합니다. 구독자는 더 저렴한 크레딧 단가를 누릴 수 있으며 연간 플랜은 17% 절약됩니다.",
    },
    {
      id: "item-6",
      question: "언제든지 구독을 취소할 수 있나요?",
      answer:
        "네, 언제든지 구독을 취소할 수 있습니다. 취소 후 현재 청구 기간이 끝날 때 요금 청구가 중지되며 기존 크레딧에는 영향을 받지 않습니다.",
    },
  ],
};
