# 플랜티 성장·정원 개선 검증

2026-10-13. 격리 브랜치 `codex/planty-growth-20261013`. 사용자 Mac에서 로컬 구현·검증만 진행했습니다.

## 현재 기준

실시간 `git ls-remote`와 격리 작업본 `git fetch`에서 main `5233e1d70b1dd04902e97f3f0cec8247eadcf819`를 확인했습니다. 원본 `/Users/june/Documents/03_Resources/repos/planty`는 `78d7e29`, clean이었습니다. 10/3·10/5 작업본의 생성 AIT dirty도 별도로 대조하고 보존했습니다.

10/5 광고 반려 대응은 최신 main에 포함되어 있습니다. 당시 테스트 업로드 영수증은 `20261005-26`, `CREATED`, 공개 출시·심사 제출 false입니다. 산출물 SHA256 `7d4460d8…`를 재확인했습니다. `aittools/stage/planty`의 8/26 산출물은 별개입니다. 현재 콘솔 심사·공개 버전은 확인하지 않았습니다.

## 바뀐 경험

- 돌봄 뒤 실제로 얻은 XP와 성장 전후 모습을 보여줍니다. 다음 모습과 남은 XP도 항상 확인할 수 있습니다. 물주기로 단계가 바뀌어도 성장 피드백을 보여줍니다.
- 정원에서 수집한 종류와 완성한 그루 수를 나눠 표시하고, 다음 식물을 실제 졸업 순환 순서로 안내합니다. 중복 수집 기록은 남깁니다. 누적 방문 일수를 합산해 돌봄 일수처럼 보여주던 표시는 뺐습니다.
- 홈에서 모아둔 정원을 보고, 정원에서 현재 식물 돌봄으로 돌아갈 수 있습니다. 황금 식물을 모으면 추가한 정원이 바로 보입니다.

재접속 때 해바라기·장미·대나무를 다른 종류로 바꾸던 기존 변환을 수정했습니다. retired cherry 변환은 유지합니다. 이미 이전 버전에서 합쳐진 종류는 원래 종류를 알 수 없어 복구하지 않습니다.

연타와 한 탭 안의 콤보 XP·건강 증가가 서로 덮어쓰지 않도록 최신 식물 ref를 동기 갱신합니다. 콤보 콜백은 React updater 밖에서 실행합니다. 미션의 중첩 버튼도 제거했습니다.

저장 필드·성장 threshold·보상·광고 정책은 변경하지 않았습니다. 기존 무료 복귀와 정원·이름·성장·최고 기록·쿨다운을 보존합니다. 새 광고·결제·계측·푸시·DB 변경은 없습니다.

## 검증 명령과 범위

`bun install --frozen-lockfile --ignore-scripts`로 기존 bun.lock의 공식 버전을 설치했습니다. package-lock 불일치로 `npm ci`는 기존 상태에서 실패합니다. 의존성 파일은 변경하지 않았습니다.

`npm test`: 137/137 통과. `npx tsc --noEmit`. `npm run build`: 공식 Next static export + AIT 로컬 생성. out 199개 파일과 AIT 내부 sources가 모두 일치하고 QA marker는 없습니다. 업로드·push·출시하지 않았습니다.

`node scripts/verify-growth-lint.mjs`: 변경한 source/test와 검사 스크립트에 Next native flat config 적용, 오류·경고 0개. 기존 `npm run lint`는 FlatCompat 설정의 circular JSON 오류로 검사 시작 전에 실패합니다. 해당 설정은 이번 성장 작업에서 바꾸지 않았습니다.

실제 공식 out을 전용 localhost 57733에서 실행하고 `scripts/verify-growth-mobile.cjs`로 Mac 로컬 Google Chrome 155.0.8059.40과 WebKit 27.2를 검사했습니다. 320/390px, 기본/200% computed font stress fixture, 신규 온보딩·첫 물주기·미션 성장, 중복 정원·졸업 연타·종류 재접속, 4일 뒤 무료 복귀, 저장 실패·재시도, 콤보 연타·오프라인·pagehide·재접속·deep link·뒤로가기·다크모드를 확인합니다. 40/40 시나리오가 통과했습니다. 외부 요청은 차단하고 합성 localStorage만 사용했습니다. 앱 예외·외부 요청 0건이며, 기존 native safe-area 경고 96건은 별도로 기록했습니다.

## 검증 한계

Mac 로컬 브라우저 에뮬레이션입니다. iOS/Android 실기기, 토스 native API·광고·native 큰 글자는 확인하지 않았습니다. 일반 Mac 브라우저에서 기존 AIT provider의 native safe-area 미지원 경고가 생기며 별도로 기록합니다. Next 개발 서버는 기존 TDS 모듈 컴파일 오류가 있었지만 공식 생산 빌드는 통과합니다. 실제 리텐션 효과는 측정하지 않았습니다.

로그·스크린샷·원본 보존 비교: 작업 루트의 `../evidence/`. 최종 모바일 결과는 `../evidence/mobile/results.json`입니다.
