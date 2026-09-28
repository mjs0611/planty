"use client";

const SECTIONS = [
  // 제1장 총칙
  {
    chapter: "제1장 총칙",
    title: "제1조 (목적)",
    content: [
      "이 약관은 디토엑시스(이하 '운영자')가 토스 앱인토스(Apps in Toss) 플랫폼을 통해 제공하는 플랜티(Planty) 서비스(이하 '서비스')의 이용에 관한 조건 및 절차, 운영자와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
    ],
  },
  {
    title: "제2조 (용어의 정의)",
    items: [
      "'서비스'란 운영자가 제공하는 가상 식물 육성 미니게임 플랜티(Planty) 및 이에 부속된 미션, 정원, 스트릭, 광고 리워드 등 관련 기능 전체를 의미합니다.",
      "'이용자'란 이 약관에 동의하고 서비스를 이용하는 자를 의미합니다.",
      "'식물 데이터'란 이용자가 서비스 이용 과정에서 기기 내 로컬 저장소에 생성·저장되는 성장 단계, XP, 미션 완료 기록, 연속 케어 스트릭(Streak), 스트릭 실드, 정원 수집 정보 등 게임 내 일체의 정보를 의미합니다.",
      "'광고 리워드'란 이용자가 제3자 광고(Google AdMob 등)를 시청함으로써 획득하는 게임 내 보상(성장 XP 등)을 의미합니다.",
      "'스트릭'이란 이용자가 연속으로 서비스를 이용한 일수를 누적 기록하는 기능을 의미합니다.",
      "'스트릭 실드'란 하루 서비스를 이용하지 못하더라도 스트릭이 유지되도록 보호하는 게임 내 아이템을 의미합니다.",
    ],
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    items: [
      "이 약관은 서비스 내 공지 또는 별도 화면을 통해 이용자에게 공시함으로써 효력이 발생합니다.",
      "운영자는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 시행일 7일 전(이용자에게 불리한 변경의 경우 30일 전)에 서비스 내 공지합니다.",
      "이용자가 변경된 약관의 시행일 이후에도 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.",
      "이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.",
    ],
  },
  {
    title: "제4조 (약관 외 준칙)",
    content: [
      "이 약관에서 정하지 않은 사항은 전기통신기본법, 전기통신사업법, 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보 보호법 등 관계 법령 및 운영자가 정한 세부 이용지침에 따릅니다.",
    ],
  },
  // 제2장 이용계약
  {
    chapter: "제2장 이용계약",
    title: "제5조 (이용계약의 성립)",
    items: [
      "서비스는 토스 앱인토스(Apps in Toss) 플랫폼 내에서 제공되며, 이용자가 서비스를 최초 실행하고 본 약관에 동의함으로써 이용계약이 성립합니다.",
      "서비스는 별도의 회원가입 절차 없이 이용 가능하며, 식물 데이터는 이용자 기기의 로컬 저장소에 저장됩니다.",
    ],
  },
  {
    title: "제6조 (이용 신청의 거절)",
    content: ["운영자는 다음 각 호에 해당하는 경우 서비스 이용을 제한하거나 거절할 수 있습니다."],
    items: [
      "비정상적인 방법으로 서비스를 이용하거나 게임 데이터를 변조하는 경우",
      "자동화 도구(봇, 스크립트 등)를 이용한 비정상적 서비스 이용",
      "서비스 운영을 고의로 방해하는 경우",
      "기타 관련 법령 위반 또는 이 약관에 위배되는 목적으로 이용하는 경우",
    ],
  },
  {
    title: "제7조 (서비스 이용 종료)",
    items: [
      "이용자는 언제든지 기기의 앱 데이터 삭제 또는 토스 앱에서 미니앱 연결 해제를 통해 서비스 이용을 종료할 수 있습니다.",
      "서비스 이용 종료 시 로컬 저장소에 저장된 식물 데이터는 삭제되며, 운영자는 이를 복구할 의무가 없습니다.",
    ],
  },
  // 제3장 서비스 이용
  {
    chapter: "제3장 서비스 이용",
    title: "제8조 (서비스 내용)",
    content: ["운영자는 이용자에게 다음의 서비스를 제공합니다."],
    items: [
      "가상 식물 육성 — 씨앗부터 황금 식물까지 8단계 성장 및 XP 시스템",
      "일일 미션 — 시간대(아침·낮·저녁·밤)별 미션 제공 및 완료 보상",
      "스트릭 및 실드 — 연속 케어 일수 기록, 스트릭 실드로 하루 보호",
      "정원 수집 — 졸업한 식물을 정원에 영구 보관",
      "광고 리워드 — 선택적 광고 시청을 통한 성장 XP 획득",
      "계절 이벤트 — 봄·여름·가을·겨울 시즌별 식물 유형 보너스",
      "기타 운영자가 정하는 부가 서비스",
    ],
  },
  {
    title: "제9조 (서비스의 변경 및 중단)",
    items: [
      "운영자는 서비스를 변경하거나 중단할 수 있으며, 이 경우 서비스 내 공지합니다.",
      "설비 보수, 천재지변, 국가 비상사태, 통신장애, 토스 플랫폼 정책 변경, 법령 개정 등 불가항력적 사유로 인한 서비스 중단에 대하여 운영자는 책임을 지지 않습니다.",
      "서비스를 종료하는 경우, 운영자는 30일 이상의 사전 공지 후 서비스를 종료합니다.",
    ],
  },
  {
    title: "제10조 (데이터 저장 및 관리)",
    items: [
      "식물 데이터는 이용자 기기의 로컬 저장소(localStorage)에 저장됩니다. 운영자 서버에는 어떠한 개인 식물 데이터도 전송·보관되지 않습니다.",
      "기기 초기화, 앱 데이터 삭제, 브라우저 캐시 삭제 등으로 로컬 저장소가 삭제된 경우 식물 데이터는 복구되지 않으며, 운영자는 이에 대한 책임을 지지 않습니다.",
      "이용자는 서비스 내 '새 씨앗 심기' 기능을 통해 직접 데이터를 초기화할 수 있습니다.",
    ],
  },
  {
    title: "제11조 (광고 및 리워드)",
    items: [
      "서비스 내 광고는 Google AdMob(앱인토스 광고 시스템)을 통해 제공됩니다. 광고 시청은 이용자의 자유로운 선택이며, 시청 시 게임 내 보상(XP)이 지급됩니다.",
      "광고 리워드는 게임 내 보상으로만 활용되며, 현금·포인트 등 경제적 가치로 전환되지 않습니다.",
      "운영자는 광고 콘텐츠의 내용 및 제3자 광고 제공자의 정책 변경에 대해 책임을 지지 않습니다.",
      "광고 이용 가능 여부는 운영자 또는 토스 플랫폼 정책에 따라 변경될 수 있습니다.",
    ],
  },
  // 제4장 이용자의 의무
  {
    chapter: "제4장 이용자의 의무",
    title: "제12조 (이용자의 의무)",
    content: ["이용자는 다음 각 호의 행위를 하여서는 안 됩니다."],
    items: [
      "로컬 저장소 데이터를 직접 조작하거나 비정상적인 방법으로 게임 데이터를 변조하는 행위",
      "자동화 도구(봇, 스크립트 등)를 이용한 비정상적 서비스 이용",
      "운영자 또는 제3자의 지식재산권을 침해하는 행위",
      "서비스의 정상적인 운영을 방해하는 해킹, 악성코드 배포 등의 행위",
      "서비스를 영리 목적으로 무단 활용하거나 제3자에게 제공하는 행위",
      "기타 관련 법령 및 이 약관에서 금지하는 행위",
    ],
  },
  // 제5장 지식재산권
  {
    chapter: "제5장 지식재산권",
    title: "제13조 (서비스의 지식재산권)",
    items: [
      "서비스 내 콘텐츠(디자인, 텍스트, 이미지, 캐릭터, 게임 로직 등)에 대한 지식재산권은 운영자에게 귀속됩니다.",
      "이용자는 서비스를 이용하여 얻은 콘텐츠를 운영자의 사전 서면 동의 없이 복제, 배포, 변경하거나 상업적으로 이용할 수 없습니다.",
    ],
  },
  // 제6장 책임 제한
  {
    chapter: "제6장 책임 제한",
    title: "제14조 (운영자의 책임 제한)",
    items: [
      "운영자는 천재지변, 불가항력적 사유, 토스 플랫폼 장애 등으로 인한 서비스 중단에 대해 책임을 지지 않습니다.",
      "운영자는 이용자의 기기 환경, 네트워크 상태, OS 업데이트 등 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.",
      "운영자는 이용자가 기기 초기화 등으로 로컬 저장 데이터를 손실한 경우 이를 복구할 의무가 없습니다.",
      "서비스는 무료로 제공되며, 운영자의 고의 또는 중대한 과실이 없는 한 서비스 이용으로 발생한 손해에 대해 책임을 지지 않습니다.",
    ],
  },
  {
    title: "제15조 (이용 제한)",
    items: [
      "운영자는 이용자가 이 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우 서비스 이용을 제한할 수 있습니다.",
      "이용 제한 시 운영자는 원칙적으로 사전 통지하며, 긴급한 경우 사후 통지할 수 있습니다.",
    ],
  },
  // 제7장 분쟁 해결
  {
    chapter: "제7장 분쟁 해결",
    title: "제16조 (분쟁 처리)",
    items: [
      "서비스 이용 관련 분쟁은 운영자와 이용자가 상호 협의하여 해결함을 원칙으로 합니다.",
      "분쟁 발생 시 이용자는 help.ditoaxis@gmail.com 으로 문의할 수 있으며, 운영자는 접수 후 성실히 처리합니다.",
      "협의가 이루어지지 않을 경우 소비자기본법에 따른 소비자분쟁조정위원회에 조정을 신청할 수 있습니다.",
    ],
  },
  {
    title: "제17조 (준거법 및 관할)",
    content: [
      "이 약관과 관련한 분쟁의 준거법은 대한민국 법령으로 하며, 소송이 제기될 경우 민사소송법에 따른 관할 법원에 제기합니다.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div
      className="min-h-screen px-5 py-10 max-w-lg mx-auto"
      style={{ backgroundColor: "var(--toss-surface, #fbf9f8)", color: "var(--toss-on-surface, #1b1c1c)" }}
    >
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-xs font-black uppercase tracking-widest mb-1"
          style={{ color: "var(--toss-primary, #004ecb)" }}
        >
          Planty
        </p>
        <h1
          className="text-2xl font-black"
          style={{ fontFamily: "var(--font-headline, sans-serif)" }}
        >
          서비스 이용약관
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
          시행일: 2026년 3월 21일
        </p>
      </div>

      {/* Notice */}
      <div
        className="rounded-2xl p-4 mb-8 text-sm leading-relaxed"
        style={{ backgroundColor: "rgba(0,78,203,0.06)", color: "var(--toss-on-surface, #1b1c1c)" }}
      >
        플랜티는 <strong>토스 앱인토스(Apps in Toss)</strong> 플랫폼에서 동작하는 무료 가상 식물 육성 미니게임입니다. 서비스 이용 시 본 약관에 동의한 것으로 간주합니다.
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {SECTIONS.map((sec, idx) => (
          <div key={idx}>
            {sec.chapter && (
              <p className="text-[11px] font-black uppercase tracking-widest mb-3 mt-6" style={{ color: "var(--toss-primary, #004ecb)" }}>
                {sec.chapter}
              </p>
            )}
            <section>
              <h2
                className="text-[15px] font-black mb-3"
                style={{ color: "var(--toss-on-surface, #1b1c1c)", fontFamily: "var(--font-headline, sans-serif)" }}
              >
                {sec.title}
              </h2>
              {sec.content && (
                <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                  {sec.content}
                </p>
              )}
              {sec.items && (
                <ul className="space-y-2">
                  {sec.items.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                      <span className="flex-shrink-0 font-bold" style={{ color: "var(--toss-primary, #004ecb)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="mt-10 pt-6 space-y-1"
        style={{ borderTop: "1px solid var(--toss-surface-high, #eae8e7)" }}
      >
        <p className="text-xs font-semibold" style={{ color: "var(--toss-on-surface, #1b1c1c)" }}>문의</p>
        <p className="text-xs" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>help.ditoaxis@gmail.com</p>
        <p className="text-xs mt-3" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
          Planty v0.1.0 · © 2026 디토엑시스
        </p>
      </div>
    </div>
  );
}
