# Molip Timer

공부 자세를 판독해 몰입 시간을 따로 집계하는 AI 기반 집중 타이머입니다. React, TypeScript, Vite로 구성되어 있습니다.

## 주요 기능
- 몰입 시간과 총 경과 시간 분리 집계
- 웹캠 포즈 판독 및 스켈레톤 오버레이
- 미집중 시 자동 정지 카운트다운
- 시스템/자동정지 알림 닫기 버튼 지원
- 닉네임, 자동 정지 시간, 동기부여 문구 설정

## 기술 스택
- React + TypeScript + Vite
- Teachable Machine Pose (`@teachablemachine/pose`)
- TensorFlow.js
- React Bootstrap

## 요구 사항
- Node.js 18+ 권장
- 웹캠 접근 권한 필요

## 시작하기
```bash
npm install
npm run dev
```

실행 후 개발 서버 URL에 접속하고 카메라 접근을 허용하세요.

## 스크립트
```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## 설정값 저장
설정은 `localStorage`에 저장됩니다:
- `nickname`: 타이머에 표시될 닉네임
- `pauseSeconds`: 자동 정지 카운트다운(초 단위, 권장)
- `pauseMinutes`: 자동 정지 레거시 키(대체 매핑)
- `motivationText`: 타이머 하단에 표시되는 문구

## AI 모델 파일
Teachable Machine 포즈 모델 파일이 아래 경로에 있어야 합니다:
```
public/molip-ai/v1/model.json
public/molip-ai/v1/metadata.json
```

## 참고
- 스켈레톤 및 몰입 상태 표시는 타이머 실행 중에만 렌더링됩니다.
- 자동 정지 카운트다운은 미집중 상태에서만 표시됩니다.
