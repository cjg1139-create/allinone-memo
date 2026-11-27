/*
  ★ MVP 시연용 가상 데이터입니다. 아래 소식·후기·공지·파트너는 모두 실제와 관계없는 내용입니다.
  실제 내용이 생기면 따옴표 안 글자만 바꾸고 저장 후 새로고침(F5)하세요. "(가상)" 표시도 함께 지우세요.
  기관·사람 이름은 실제로 없는 이름("가상 A사" 등)만 사용했습니다.
*/
window.SITE = {
  // 소식 카드 4개 (분류 + 제목)
  news: [
    { tag: "결과보고", title: "(가상) 첫 나눔 결과를 정리했습니다", img: "images/news/news-1-report.svg", alt: "결과보고: 막대가 올라가는 그래프 일러스트(가상)" },
    { tag: "단체 이야기", title: "(가상) 가상 B복지센터가 새 PC로 시작한 이야기", img: "images/news/news-2-community.svg", alt: "단체 이야기: 새 PC 앞에서 일하는 사람 일러스트(가상)" },
    { tag: "정비 일지", title: "(가상) 수거한 PC, 이렇게 정비합니다", img: "images/news/news-3-repair.svg", alt: "정비 일지: 뚜껑을 열고 점검하는 PC 일러스트(가상)" },
    { tag: "기업 나눔", title: "(가상) 가상 A사 임직원이 함께한 PC 나눔", img: "images/news/news-4-corporate.svg", alt: "기업 나눔: PC가 담긴 상자와 새싹 일러스트(가상)" }
  ],

  // 함께한 사람들의 이야기 (가상 후기)
  reviews: [
    { who: "(가상) 가상 A사 ESG 담당자", text: "쓰지 않던 PC를 어떻게 처리할지 고민이었는데, 수거부터 데이터 삭제까지 맡겨 편했습니다. (가상 후기)" },
    { who: "(가상) 가상 C환경단체 활동가", text: "낮은 대여료로 업무용 PC를 쓰게 되어 활동 예산을 다른 곳에 쓸 수 있었습니다. (가상 후기)" },
    { who: "(가상) 가상 A사 임직원", text: "내가 쓰던 PC가 누군가의 첫 업무 PC가 된다니 뜻깊었습니다. (가상 후기)" }
  ],

  // 공지·언론보도 4칸
  notices: [
    { head: "공지사항", items: ["(가상) 서비스 시범 운영 안내", "(가상) 신청서 접수 방법 안내"] },
    { head: "언론보도", items: ["(가상) 폐PC로 잇는 나눔, 두번째 PC"] },
    { head: "기업 나눔", items: ["(가상) 가상 A사 첫 PC 나눔 참여"] },
    { head: "단체 소식", items: ["(가상) 가상 B복지센터 대여 시작", "(가상) 가상 C환경단체 대여 시작"] }
  ],

  // 파트너 로고 6칸 (가상 이름 + 가상 로고 그림). logo를 지우면 이름만 보입니다.
  partners: [
    { name: "가상 A사", logo: "images/partners/logo-a.svg" },
    { name: "가상 B복지센터", logo: "images/partners/logo-b.svg" },
    { name: "가상 C환경단체", logo: "images/partners/logo-c.svg" },
    { name: "가상 D재단", logo: "images/partners/logo-d.svg" },
    { name: "가상 E기업", logo: "images/partners/logo-e.svg" },
    { name: "가상 F학교", logo: "images/partners/logo-f.svg" }
  ]
};
