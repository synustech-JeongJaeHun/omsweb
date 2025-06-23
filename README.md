# OMSWeb

OMS Web UI Project

## 개발 환경

### BackEnd

- [ ] C# : DotNet Core SDK 3.1.426, https://dotnet.microsoft.com/ko-kr/download/dotnet/3.1

### Frontend

- [ ] Node.js : 16.18.1, https://nodejs.org/ko

- [ ] NPM : 8.19.2

- [ ] Angular : CLI 10.0.8

- [ ] Vue.js : 3.2.37

- [ ] React : 17.0.2


## 빌드 방법

먼저 위에 명시된 버전의 Node.js 가 설치되어 있어야 함.

> [!Caution]
> Yarn 이 설치되어 있지 않다면
> 1. 소스 코드를 처음 다운로드 후 OMSWeb 폴더 → frontend 폴더 진입한 경로로 명령 프롬프트 창 오픈
> 2. 프롬프트가 표시되면 아래 텍스트를 복사 후 입력하고 엔터
> ```console
> npm install -g yarn
> ```
> Yarn 설치 완료된 것을 확인

1. Visual Studio 2019 또는 2022 실행하여 OMSWeb.sln 파일을 연다.
2. 메뉴에서 [빌드] → [OMSWeb 게시] 를 클릭.
3. 게시 대상을 [폴더] 를 선택 후 [다음] 클릭.
4. 폴더 위치는 [bin\Release\netcoreapp3.1\publish\] 경로(자동 입력)를 확인 후 [마침] 클릭.
5. [모든 설정 표시] 를 클릭.
6. 게시 창이 뜨면 다음과 같이 선택 후 [저장] 클릭.
   1) 구성 : Release
   2) 대상 프레임워크 : netcoreapp3.1
   3) 배포 모드 : 프레임워크 종속
   4) 대상 런타임 : win-x64
   5) 파일 게시 옵션
      - [x] 단일 파일 생성
      - [ ] ReadyToRun 컴파일 사용
      - [x] 게시 전에 모든 기존 파일 삭제
7. [게시(Publish)] 버튼 클릭.
