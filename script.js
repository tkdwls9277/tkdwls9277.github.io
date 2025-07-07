/* ---------- 설정: 문제집 목록 ---------- */
const tests = [
  { id: "test1", label: "첫소리" },
  { id: "test2", label: "속담" },
  { id: "test3", label: "순우리말" },
  { id: "test4", label: "사자성어" },
  { id: "test6", label: "최종" },
  // 새 문제집을 추가하려면 ↓ 이렇게
  // { id: "myWords", label: "내가 만든 단어장" }
];

/* ---------- 상태 ---------- */
let cards = []; // 현재 문제집 카드
let remaining = []; // 이번 라운드에 아직 안 나온 카드 인덱스
let history = []; // 사용자가 이미 본 카드 인덱스
let touchStartX = 0;

/* ---------- DOM ---------- */
const cardEl = document.getElementById("card");
const frontEl = document.getElementById("card-front");
const backEl = document.getElementById("card-back");
const progress = document.getElementById("progress-bar");
const selectEl = document.getElementById("test-select");

/* ---------- 문제집 드롭다운 만들기 ---------- */
tests.forEach((t) => {
  const opt = document.createElement("option");
  opt.value = t.id;
  opt.textContent = t.label;
  selectEl.appendChild(opt);
});

/* 첫 로드 시 첫 번째 문제집 선택 */
loadTest(tests[0].id);

/* 드롭다운 변경 시 새 문제집 로드 */
selectEl.addEventListener("change", (e) => loadTest(e.target.value));

/* ---------- 유틸 ---------- */
const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/* ---------- 문제집 로드 ---------- */
function loadTest(testId) {
  fetch(`./${testId}.json`)
    .then((res) => res.json())
    .then((data) => {
      cards = data;
      remaining = [...cards.keys()];
      history = [];
      nextCard(); // 첫 카드 바로 보여주기
    })
    .catch((err) => alert(`${testId}.json 로드 오류: ` + err));
}

/* ---------- 카드 표시 ---------- */
function showCard(index) {
  const { question, answer } = cards[index];
  frontEl.textContent = question;
  backEl.textContent = answer;
  cardEl.classList.remove("flip");
  updateProgress();
}
function updateProgress() {
  const percent = (history.length / cards.length) * 100;
  progress.style.width = percent + "%";
}

const FLIP_DURATION = 600; // ms, styles.css의 transition(.6s)과 일치

/* ---------- 네비게이션 ---------- */
function nextCard() {
  /* 뒤집혀 있으면 앞면으로 돌려놓고, 애니메이션 끝난 뒤 실행 */
  if (cardEl.classList.contains("flip")) {
    cardEl.classList.remove("flip");
    setTimeout(nextCard, FLIP_DURATION);
    return;
  }

  /* ↓↓↓ 평소 nextCard 본체 ↓↓↓ */
  if (remaining.length === 0) {
    // 새 라운드
    remaining = [...cards.keys()];
    history = [];
  }
  const rand = Math.floor(Math.random() * remaining.length);
  const idx = remaining.splice(rand, 1)[0];
  history.push(idx);
  showCard(idx);
}

function prevCard() {
  if (cardEl.classList.contains("flip")) {
    cardEl.classList.remove("flip");
    setTimeout(prevCard, FLIP_DURATION);
    return;
  }

  if (history.length > 1) {
    history.pop(); // 현재 카드 제거
    const idx = history[history.length - 1];
    remaining.push(idx); // 되돌린 카드는 다시 풀에 넣음
    showCard(idx);
  }
}

/* ---------- 이벤트 ---------- */
// 버튼
document.getElementById("flip-btn").addEventListener("click", () => cardEl.classList.toggle("flip"));
document.getElementById("next-btn").addEventListener("click", nextCard);

// 스와이프
cardEl.addEventListener("touchstart", (e) => (touchStartX = e.touches[0].clientX));
cardEl.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) < 30) return;
  dx < 0 ? nextCard() : prevCard();
});

// 키보드 ←/→
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") prevCard();
  if (e.key === "ArrowRight") nextCard();
});
