/*
  ★ 신청서를 구글 폼에 저장하려면 이 파일만 채우면 됩니다. (따옴표 안 글자만 바꾸세요)

  formUrl 이 비어("") 있으면 '시연 모드'로 동작합니다. (입력 확인만 하고 저장하지 않음)

  채우는 방법은 README.md 의 "신청서 저장 연결하기"를 보세요.
  - formUrl : 구글 폼 주소의 맨 끝 /viewform 을 /formResponse 로 바꾼 주소
              예) https://docs.google.com/forms/d/e/폼아이디/formResponse
  - fields  : 구글 폼 각 질문의 항목 ID (entry.숫자)
*/
window.APPLY = {
  formUrl: "",
  fields: {
    type:    "",   // 신청 유형 (기업 / 비영리단체)
    org:     "",   // 기업명 또는 단체명
    name:    "",   // 담당자 이름
    phone:   "",   // 연락처
    email:   "",   // 이메일
    msg:     "",   // PC 정보
    consent: ""    // 개인정보 수집·이용 동의
  }
};
