/* 두번째 PC — 화면 동작 (메뉴, 슬라이드, 내용 채우기, 신청 폼 확인) */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; };

  /* ---------- 메인 페이지 ---------- */
  if ($("#slider")) {
    var S = window.SITE || {};

    // 모바일 메뉴 열고 닫기
    var burger = $("#burger"), menu = $("#menu");
    burger.addEventListener("click", function () { menu.classList.toggle("open"); });
    menu.addEventListener("click", function () { menu.classList.remove("open"); });

    // 슬라이드 (4초마다 자동 넘김, 점을 누르면 이동)
    var slides = document.querySelectorAll(".slide"), dots = $("#dots"), cur = 0, timer;
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", (i + 1) + "번 슬라이드");
      b.onclick = function () { go(i); start(); };
      dots.appendChild(b);
    });
    function go(i) {
      cur = i;
      slides.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      dots.querySelectorAll("button").forEach(function (b, k) { b.classList.toggle("on", k === i); });
    }
    function start() { clearInterval(timer); timer = setInterval(function () { go((cur + 1) % slides.length); }, 4000); }
    go(0); start();

    // 소식
    $("#newsList").innerHTML = (S.news || []).map(function (n) {
      return '<div class="card news-card"><div class="photo">사진 자리</div><span class="tag">' + esc(n.tag) + '</span><h3>' + esc(n.title) + '</h3></div>';
    }).join("");

    // 후기
    $("#reviewList").innerHTML = (S.reviews || []).map(function (r) {
      var body = r.text ? '<q>' + esc(r.text) + '</q>' : '<q class="empty">후기 준비 중입니다.</q>';
      return '<div class="card review">' + body + '<b>' + esc(r.who) + '</b></div>';
    }).join("");

    // 공지·언론보도
    $("#noticeList").innerHTML = (S.notices || []).map(function (n) {
      var list = n.items.length
        ? '<ul>' + n.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join("") + '</ul>'
        : '<p class="empty">등록된 글이 없습니다.</p>';
      return '<div class="card notice"><h3>' + esc(n.head) + '</h3>' + list + '</div>';
    }).join("");

    // 파트너 로고 칸
    $("#partnerList").innerHTML = (S.partners || []).map(function (p) {
      return '<div class="partner">' + (p ? esc(p) : "파트너 로고") + '</div>';
    }).join("");

    // 아직 없는 페이지 링크는 안내만
    document.querySelectorAll("[data-soon]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); alert(a.dataset.soon + "은(는) 준비 중입니다."); });
    });
    $("#newsletter").addEventListener("click", function (e) { e.preventDefault(); alert("뉴스레터 신청은 준비 중입니다."); });
  }

  /* ---------- 신청 페이지 ---------- */
  var form = $("#applyForm");
  if (form) {
    var type = "company";
    var LABELS = {
      company: { org: "기업명", msg: "나눌 PC 정보 (대수, 종류 등)" },
      npo: { org: "단체명", msg: "필요한 PC 정보 (대수, 용도 등)" }
    };
    function setType(t) {
      type = t;
      document.querySelectorAll(".tab").forEach(function (b) { b.classList.toggle("on", b.dataset.type === t); });
      $("#orgLabel").textContent = LABELS[t].org;
      $("#msgLabel").textContent = LABELS[t].msg;
      form.style.display = ""; $("#done").classList.remove("show");
    }
    document.querySelectorAll(".tab").forEach(function (b) {
      b.addEventListener("click", function () { setType(b.dataset.type); history.replaceState(null, "", "#" + b.dataset.type); });
    });
    setType(location.hash === "#npo" ? "npo" : "company");

    function mark(id, bad) { $(id).closest(".field").classList.toggle("bad", bad); return bad; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var digits = $("#phone").value.replace(/\D/g, "");
      var bad = [
        mark("#org", !$("#org").value.trim()),
        mark("#name", !$("#name").value.trim()),
        mark("#phone", digits.length < 9 || digits.length > 11),
        mark("#email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("#email").value.trim())),
        mark("#msg", !$("#msg").value.trim())
      ];
      var noConsent = !$("#consent").checked;
      $("#consentErr").classList.toggle("bad", noConsent);
      if (bad.indexOf(true) !== -1 || noConsent) return;
      // ※ 여기서는 저장하지 않습니다. 저장 방식이 정해지면 이 자리에 연결합니다.
      form.style.display = "none"; $("#done").classList.add("show");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
