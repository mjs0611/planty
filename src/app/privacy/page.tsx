export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09100D] text-gray-800 dark:text-gray-200 px-5 py-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">개인정보처리방침</h1>
      <p className="text-xs text-gray-400 mb-8">시행일: 2025년 3월 15일</p>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제1조 개요</h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          플랜티(Planty)는 이용자의 개인정보를 소중히 여깁니다. 본 방침은 「개인정보 보호법」에 따라 이용자의 개인정보가 어떻게 수집·이용·보호되는지 안내합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제2조 수집하는 개인정보</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① 플랜티는 서버를 통한 개인정보를 수집하지 않습니다. 모든 게임 데이터(식물 성장 기록, 미션 달성 내역, 스트릭 등)는 이용자 기기의 로컬 저장소에만 저장됩니다.</p>
          <p>② 서비스는 토스(Toss) 앱 내에서 동작하며, 토스 앱의 기본 운영에 필요한 정보(접속 환경, 이벤트 로그 등)는 토스의 개인정보처리방침에 따릅니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제3조 개인정보의 이용 목적</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>수집된 게임 데이터는 다음 목적으로만 이용됩니다.</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>식물 성장 상태 유지 및 미션 진행 관리</li>
            <li>서비스 품질 개선을 위한 익명 통계 분석</li>
          </ul>
          <p>위 목적 외의 용도로는 이용하지 않으며, 이용 목적이 변경될 경우 사전에 동의를 받겠습니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제4조 개인정보의 보유 및 파기</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① 게임 데이터는 이용자 기기에만 저장되며, 이용자가 직접 삭제하거나 기기를 초기화하면 즉시 파기됩니다.</p>
          <p>② 운영자가 별도로 수집·보관하는 개인정보는 없습니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제5조 제3자 제공 및 위탁</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① 플랜티는 이용자의 개인정보를 제3자에게 제공하지 않습니다.</p>
          <p>② 서비스 내 광고는 토스 앱 플랫폼을 통해 제공되며, 해당 광고 관련 데이터 처리는 토스의 정책에 따릅니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제6조 이용자의 권리</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① 이용자는 언제든지 기기 내 게임 데이터를 직접 삭제할 수 있습니다. (앱 설정 → 데이터 초기화)</p>
          <p>② 개인정보 처리와 관련한 문의 및 불만은 아래 연락처로 접수할 수 있습니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제7조 개인정보 보호책임자</h2>
        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-1">
          <p>성명: 모준승</p>
          <p>이메일: mojuns@gmail.com</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제8조 방침 변경</h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          본 방침이 변경되는 경우 시행일 7일 전 서비스 내 공지를 통해 안내합니다. 변경된 방침은 공지한 시행일부터 효력이 발생합니다.
        </p>
      </section>

      <p className="text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
        문의: mojuns@gmail.com
      </p>
    </div>
  );
}
