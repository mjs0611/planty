export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen px-5 py-10 max-w-lg mx-auto"
      style={{ backgroundColor: "var(--toss-surface, #fbf9f8)", color: "var(--toss-on-surface, #1b1c1c)" }}
    >
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "var(--toss-primary, #004ecb)" }}>
          Planty
        </p>
        <h1 className="text-2xl font-black" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>
          개인정보처리방침
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
        플랜티(Planty)는 이용자의 개인정보를 소중히 여깁니다. 본 방침은 「개인정보 보호법」에 따라 이용자의 개인정보가 어떻게 수집·이용·보호되는지 안내합니다.
      </div>

      <div className="space-y-10">

        {/* 제1장 */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--toss-primary, #004ecb)" }}>제1장 총칙</p>
          <div className="space-y-6">
            <section>
              <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제1조 (목적)</h2>
              <p className="text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                본 개인정보처리방침은 디토엑시스(이하 &quot;운영자&quot;)가 토스 앱인토스(Apps in Toss) 플랫폼을 통해 제공하는 플랜티(Planty) 서비스(이하 &quot;서비스&quot;) 이용 과정에서 이용자의 개인정보를 어떻게 수집·이용·보관·파기하는지 안내하기 위해 작성되었습니다.
              </p>
            </section>
            <section>
              <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제2조 (개인정보 보호책임자)</h2>
              <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                운영자는 개인정보 처리에 관한 업무를 총괄하는 개인정보 보호책임자를 지정합니다.
              </p>
              <ul className="space-y-1 text-sm" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                <li>성명: 모준승</li>
                <li>이메일: help.ditoaxis@gmail.com</li>
              </ul>
            </section>
          </div>
        </div>

        {/* 제2장 */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--toss-primary, #004ecb)" }}>제2장 개인정보 수집 및 이용</p>
          <div className="space-y-6">
            <section>
              <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제3조 (수집하는 개인정보)</h2>
              <ul className="space-y-2">
                {[
                  "플랜티는 서버를 통한 개인정보를 수집하지 않습니다. 모든 게임 데이터(식물 성장 기록, XP, 미션 달성 내역, 스트릭, 스트릭 실드, 정원 수집 정보 등)는 이용자 기기의 로컬 저장소(localStorage)에만 저장됩니다.",
                  "서비스는 토스(Toss) 앱 내에서 동작하며, 토스 앱의 기본 운영에 필요한 정보(접속 환경, 이벤트 로그 등)는 토스의 개인정보처리방침에 따릅니다.",
                  "서비스 내 광고(Google AdMob)를 통해 수집되는 데이터는 각 광고 제공자의 개인정보처리방침에 따르며, 운영자는 해당 데이터에 접근하거나 보관하지 않습니다.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "var(--toss-primary, #004ecb)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제4조 (개인정보의 이용 목적)</h2>
              <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>수집된 게임 데이터는 다음 목적으로만 이용됩니다.</p>
              <ul className="space-y-2">
                {[
                  "식물 성장 상태 유지 및 미션 진행 관리",
                  "스트릭·정원 등 게임 내 기록 보존",
                  "서비스 품질 개선을 위한 익명 통계 분석",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "var(--toss-primary, #004ecb)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-relaxed mt-2" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                위 목적 외의 용도로는 이용하지 않으며, 이용 목적이 변경될 경우 사전에 동의를 받겠습니다.
              </p>
            </section>
            <section>
              <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제5조 (개인정보의 보유 및 파기)</h2>
              <ul className="space-y-2">
                {[
                  "게임 데이터는 이용자 기기에만 저장되며, 이용자가 직접 삭제하거나 기기를 초기화하면 즉시 파기됩니다.",
                  "운영자가 별도로 수집·보관하는 개인정보는 없습니다.",
                  "서비스 내 '새 씨앗 심기' 기능을 통해 이용자가 직접 데이터를 초기화할 수 있습니다.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "var(--toss-primary, #004ecb)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* 제3장 */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--toss-primary, #004ecb)" }}>제3장 개인정보의 제공 및 위탁</p>
          <div className="space-y-6">
            <section>
              <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제6조 (제3자 제공)</h2>
              <ul className="space-y-2">
                {[
                  "플랜티는 이용자의 개인정보를 제3자에게 제공하지 않습니다.",
                  "단, 법령의 규정에 의거하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우는 예외로 합니다.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "var(--toss-primary, #004ecb)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제7조 (개인정보 처리 위탁)</h2>
              <ul className="space-y-2">
                {[
                  "서비스 내 광고는 토스 앱인토스 광고 시스템(Google AdMob)을 통해 제공됩니다. 광고 관련 데이터 처리는 각 플랫폼의 정책에 따릅니다.",
                  "운영자는 위탁 업무의 내용이 변경될 경우 본 방침을 통해 공지합니다.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                    <span className="flex-shrink-0 font-bold" style={{ color: "var(--toss-primary, #004ecb)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* 제4장 */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--toss-primary, #004ecb)" }}>제4장 이용자의 권리</p>
          <section>
            <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제8조 (이용자의 권리 및 행사 방법)</h2>
            <ul className="space-y-2">
              {[
                "이용자는 언제든지 기기 내 게임 데이터를 직접 삭제할 수 있습니다. (서비스 내: 프로필 탭 → '새 씨앗 심기' / 기기 설정: 앱 데이터 삭제 또는 브라우저 캐시 삭제)",
                "개인정보 처리와 관련한 문의, 열람, 정정·삭제 요청 및 불만은 아래 연락처로 접수할 수 있으며, 운영자는 지체 없이 처리합니다. (이메일: help.ditoaxis@gmail.com)",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                  <span className="flex-shrink-0 font-bold" style={{ color: "var(--toss-primary, #004ecb)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 제5장 */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--toss-primary, #004ecb)" }}>제5장 개인정보 보호 조치</p>
          <section>
            <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제9조 (개인정보의 안전성 확보 조치)</h2>
            <p className="text-sm leading-relaxed mb-2" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
              운영자는 개인정보의 안전성 확보를 위해 다음 조치를 취하고 있습니다.
            </p>
            <ul className="space-y-2">
              {[
                "모든 게임 데이터는 서버에 전송되지 않고 이용자 기기에서만 처리됩니다.",
                "서비스는 외부 서버 또는 클라우드 데이터베이스를 운영하지 않습니다.",
                "광고 리워드 처리 시 이용자 식별 정보는 운영자에게 전달되지 않습니다.",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                  <span className="flex-shrink-0 font-bold" style={{ color: "var(--toss-primary, #004ecb)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 제6장 */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest mb-4" style={{ color: "var(--toss-primary, #004ecb)" }}>제6장 방침의 변경</p>
          <section>
            <h2 className="text-[15px] font-black mb-2" style={{ fontFamily: "var(--font-headline, sans-serif)" }}>제10조 (개인정보처리방침의 변경)</h2>
            <ul className="space-y-2">
              {[
                "본 방침이 변경되는 경우 시행일 7일 전(이용자에게 불리한 변경의 경우 30일 전) 서비스 내 공지를 통해 안내합니다.",
                "변경된 방침은 공지한 시행일부터 효력이 발생합니다.",
              ].map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed" style={{ color: "var(--toss-on-surface-variant, #424656)" }}>
                  <span className="flex-shrink-0 font-bold" style={{ color: "var(--toss-primary, #004ecb)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

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
