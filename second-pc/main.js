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
    // 구글 폼이 연결되면 '시연 화면' 안내를 숨김
    if ((window.APPLY || {}).formUrl) $("#demoHint").classList.add("hidden");

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
      var cfg = window.APPLY || {};
      function finish(demo) {
        if (demo) {
          $("#doneTitle").textContent = "입력이 확인되었습니다";
          $("#doneText").innerHTML = "현재는 시연 화면이라 신청 내용이 저장되거나 전송되지 않았습니다.<br>저장 방식은 팀이 정한 뒤 연결합니다.";
        }
        form.style.display = "none"; $("#done").classList.add("show");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      // 구글 폼 주소가 비어 있으면 시연 모드 (config.js 참고)
      if (!cfg.formUrl) { finish(true); return; }

      var f = cfg.fields || {}, body = new URLSearchParams();
      body.append(f.type, type === "company" ? "기업 PC 나눔" : "비영리단체 대여");
      body.append(f.org, $("#org").value.trim());
      body.append(f.name, $("#name").value.trim());
      body.append(f.phone, $("#phone").value.trim());
      body.append(f.email, $("#email").value.trim());
      body.append(f.msg, $("#msg").value.trim());
      body.append(f.consent, "동의함");

      var btn = $("#submitBtn"), err = $("#submitErr");
      btn.disabled = true; btn.textContent = "보내는 중..."; err.classList.remove("show");
      // 구글 폼은 응답 내용을 돌려주지 않으므로(no-cors) 네트워크 오류만 실패로 처리합니다.
      fetch(cfg.formUrl, { method: "POST", mode: "no-cors", body: body })
        .then(function () { finish(false); })
        .catch(function () { err.classList.add("show"); })
        .then(function () { btn.disabled = false; btn.textContent = "신청서 보내기"; });
    });
  }
})();
