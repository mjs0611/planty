export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09100D] text-gray-800 dark:text-gray-200 px-5 py-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">서비스 이용약관</h1>
      <p className="text-xs text-gray-400 mb-8">시행일: 2025년 3월 15일</p>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제1조 목적</h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          이 약관은 모준승(이하 "운영자")이 제공하는 플랜티(Planty) 서비스(이하 "서비스")의 이용에 관한 조건 및 절차, 운영자와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제2조 정의</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① "서비스"란 운영자가 제공하는 가상 식물 육성 미니게임 플랜티(Planty) 및 관련 부가 서비스를 의미합니다.</p>
          <p>② "이용자"란 이 약관에 동의하고 서비스를 이용하는 자를 의미합니다.</p>
          <p>③ "식물 데이터"란 이용자가 서비스를 이용하는 과정에서 생성되는 성장 단계, 미션 기록, 연속 케어 일수 등의 게임 내 정보를 의미합니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제3조 약관의 효력 및 변경</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① 이 약관은 서비스 내 공지 또는 별도 화면을 통해 이용자에게 공시함으로써 효력이 발생합니다.</p>
          <p>② 운영자는 관련 법령을 위배하지 않는 범위 내에서 약관을 변경할 수 있으며, 변경 시 시행일 7일 전에 공지합니다.</p>
          <p>③ 이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제4조 서비스 제공</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① 운영자는 이용자에게 다음의 서비스를 제공합니다.</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>가상 식물 육성 및 성장 단계 관리</li>
            <li>일일 미션 제공 및 달성 기록</li>
            <li>연속 케어 스트릭 및 정원 수집 기능</li>
            <li>기타 운영자가 정하는 부가 서비스</li>
          </ul>
          <p>② 서비스는 연중무휴 24시간 제공을 원칙으로 하나, 시스템 점검·장애 등의 사유로 일시 중단될 수 있습니다.</p>
          <p>③ 식물 데이터는 이용자 기기의 로컬 저장소(localStorage)에 저장되며, 기기 초기화 또는 앱 데이터 삭제 시 복구가 불가능합니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제5조 이용자 의무</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>서비스의 비정상적 이용 또는 게임 데이터 위·변조</li>
            <li>운영자 또는 제3자의 지식재산권 침해</li>
            <li>서비스 운영을 고의로 방해하는 행위</li>
            <li>관련 법령 또는 이 약관을 위반하는 행위</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제6조 지식재산권</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① 서비스 내 콘텐츠(디자인, 텍스트, 이미지, 로직 등)에 대한 지식재산권은 운영자에게 귀속됩니다.</p>
          <p>② 이용자는 서비스를 이용하여 얻은 정보를 운영자의 사전 동의 없이 복제, 배포, 상업적으로 이용할 수 없습니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제7조 책임 제한</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① 운영자는 천재지변, 불가항력적 사유로 인한 서비스 중단에 대해 책임을 지지 않습니다.</p>
          <p>② 이용자의 기기 환경, 네트워크 상태로 인한 서비스 이용 장애에 대해 운영자는 책임을 지지 않습니다.</p>
          <p>③ 이용자가 기기 초기화 등으로 로컬 저장 데이터를 손실한 경우, 운영자는 이를 복구할 의무가 없습니다.</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-base font-bold mb-3">제8조 분쟁 해결</h2>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          <p>① 서비스 이용과 관련한 분쟁은 운영자와 이용자 간의 합의로 해결함을 원칙으로 합니다.</p>
          <p>② 합의가 이루어지지 않는 경우, 관련 법령에 따른 관할 법원에서 해결합니다.</p>
          <p>③ 이 약관은 대한민국 법령에 따라 규율됩니다.</p>
        </div>
      </section>

      <p className="text-xs text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6">
        문의: mojuns@gmail.com
      </p>
    </div>
  );
}
