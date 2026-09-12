# MEMORY REVEAL

4×5 카드 10쌍을 맞추며 카드판 뒤의 사진을 공개하는 모바일 우선 웹게임입니다.

## 로컬 실행

`게임실행.cmd` 또는 `index.html`을 더블클릭하면 기본 브라우저에서 바로 실행됩니다. Node, Python, 로컬 서버, 패키지 설치가 필요하지 않습니다.

## 현재 구현 범위

- 시작 화면 콜라주와 실제 HTML 버튼
- 4열×5행 카드판, 셔플, 비교 중 입력 잠금
- 매치 카드 완전 제거와 단일 보상 이미지 reveal
- `performance.now()` 기반 타이머와 서버 검증용 비교 단위 MOVES
- 클리어 후 사진 감상 지연, 결과 및 닉네임 입력
- Supabase 기반 닉네임별 최고 기록 공유 랭킹
- 모바일/키보드/마우스 조작과 320px 대응
- 보상 이미지 11장 랜덤 선택 및 직전 이미지 반복 방지

게임 시작 시 Supabase 서버가 세션을 발급하고, 클리어 기록은 서버가 계산한 경과 시간으로 저장합니다. 브라우저에는 공개 가능한 `anon` 키만 포함하며 서비스 역할 키나 DB 비밀 키는 넣지 않습니다.

## DB/API 권장 구조

`scores` 테이블: `id`, `nickname`, `clear_time_ms`, `moves`, `reward_image_id`, `game_version`, `created_at`.

정렬은 시간 → MOVES → 생성 시각 오름차순입니다. 제출 RPC는 서버에서 닉네임 2~12자, 시간 3초 이상, MOVES 10 이상, 필수 필드를 다시 검증합니다. 클라이언트의 DB 직접 INSERT는 허용하지 않습니다.

## 배포

전체 폴더를 GitHub Pages 같은 정적 호스팅에 배포할 수 있습니다. Supabase 쓰기는 권한을 제한한 RPC만 허용됩니다.

## 이미지 추가

원본 이미지를 `배경사진/`에 보존한 채 추가하고 `src/config/images.js`의 `REWARD_IMAGES` 배열에 `id`, `src`, `position`을 등록합니다. 인물 초점은 이미지별 `position` 값으로 조절할 수 있습니다.
