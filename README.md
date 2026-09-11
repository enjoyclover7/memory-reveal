# MEMORY REVEAL

4×5 카드 10쌍을 맞추며 카드판 뒤의 사진을 공개하는 모바일 우선 웹게임입니다.

## 로컬 실행

`게임실행.cmd` 또는 `index.html`을 더블클릭하면 기본 브라우저에서 바로 실행됩니다. Node, Python, 로컬 서버, 패키지 설치가 필요하지 않습니다.

## 현재 구현 범위

- 시작 화면 콜라주와 실제 HTML 버튼
- 4열×5행 카드판, 셔플, 비교 중 입력 잠금
- 매치 카드 완전 제거와 단일 보상 이미지 reveal
- `performance.now()` 기반 타이머와 비교 단위 MOVES
- 클리어 후 사진 감상 지연, 결과 및 닉네임 입력
- 닉네임별 최고 기록 랭킹 UI
- 모바일/키보드/마우스 조작과 320px 대응
- 보상 이미지 7장 랜덤 선택 및 직전 이미지 반복 방지

서버 링크 연결 전 단계이므로 랭킹은 현재 브라우저의 `localStorage`에 임시 저장됩니다.

## 서버 연결 시 환경변수

`.env.example`을 기준으로 배포 환경에 다음 값을 설정합니다.

- `RANKING_API_URL`: 랭킹 API 주소
- `RANKING_PUBLIC_KEY`: 공개 가능한 클라이언트 키가 필요한 경우에만 사용

서비스 역할 키나 DB 비밀 키는 브라우저 코드에 넣지 않습니다.

## DB/API 권장 구조

`scores` 테이블: `id`, `nickname`, `clear_time_ms`, `moves`, `reward_image_id`, `game_version`, `created_at`.

정렬은 시간 → MOVES → 생성 시각 오름차순입니다. 제출 API는 서버에서 닉네임 2~12자, 시간 3초 이상, MOVES 10 이상, 필수 필드를 다시 검증해야 합니다. 클라이언트의 DB 직접 INSERT는 허용하지 않습니다. `src/services/ranking.js`의 `RankingService` 내부 구현만 API 호출로 교체하면 UI와 게임 로직은 유지됩니다.

## 배포

전체 폴더를 정적 호스팅에 배포할 수 있습니다. 서버 연결 후 API 도메인, CORS, 환경변수, HTTPS를 설정하고 DB 쓰기 권한은 서버에만 부여합니다.

## 이미지 추가

원본 이미지를 `배경사진/`에 보존한 채 추가하고 `src/config/images.js`의 `REWARD_IMAGES` 배열에 `id`, `src`, `position`을 등록합니다. 인물 초점은 이미지별 `position` 값으로 조절할 수 있습니다.
