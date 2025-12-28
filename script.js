/***********************
 * Firebase 設定
 ***********************/
const FIREBASE_URL = "https://rlyeh-board-default-rtdb.asia-southeast1.firebasedatabase.app;"

/***********************
 * DOM
 ***********************/
const board = document.getElementById("board");
const form = document.getElementById("postForm");
const status = document.getElementById("status");

/***********************
 * 汚染度（ローカル）
 ***********************/
let pollution = Number(localStorage.getItem("pollution")) || 0;

/***********************
 * 表示更新
 ***********************/
function updateVisual() {
  document.body.className = "low";

  if (pollution >= 10) document.body.className = "mid";
  if (pollution >= 25) document.body.className = "high";
  if (pollution >= 40) document.body.className = "insane";

  if (pollution >= 50) {
    document.querySelectorAll("*").forEach(el => {
      el.style.letterSpacing = Math.random() * 4 + "px";
      el.style.transform = `rotate(${Math.random() * 2 - 1}deg)`;
    });
  }
}

/***********************
 * 投稿（Firebaseへ送信）
 ***********************/
function sendPost(name, text) {
  fetch(`${FIREBASE_URL}/posts.json`, {
    method: "POST",
    body: JSON.stringify({
      name,
      text,
      time: Date.now()
    })
  });
}

/***********************
 * 掲示板読み込み
 ***********************/
function loadPosts() {
  fetch(`${FIREBASE_URL}/posts.json`)
    .then(res => res.json())
    .then(data => {
      board.innerHTML = "";
      if (!data) return;

      Object.values(data)
        .sort((a, b) => a.time - b.time)
        .forEach(p => {
          const div = document.createElement("div");
          div.className = "post";
          div.innerHTML = `<span>${p.name}</span>：${p.text}`;
          board.appendChild(div);
        });

      board.scrollTop = board.scrollHeight;
    });
}

/***********************
 * 汚染度イベント
 ***********************/
function loreByPollution() {
  if (pollution === 15) {
    sendPost("名無し", "警察来たけど、このURLだけ記録から消えてた");
  }
  if (pollution === 25) {
    sendPost("名無し", "名前書いた人、全員溺死だった");
  }
  if (pollution === 40) {
    sendPost("？？？", "名前は、もう覚えた");
  }
}

/***********************
 * 送信処理
 ***********************/
form.addEventListener("submit", e => {
  e.preventDefault();

  const name = document.getElementById("name").value || "名無し";
  const text = document.getElementById("message").value;
  if (!text) return;

  pollution += 5;
  localStorage.setItem("pollution", pollution);

  sendPost(name, text);
  loreByPollution();
  updateVisual();

  status.innerText =
    pollution >= 40
      ? "……まだ、生きていますか？"
      : "送信されました。";

  form.reset();
});

/***********************
 * 時間依存投稿（深夜）
 ***********************/
(function timePost() {
  const h = new Date().getHours();
  if (h >= 2 && h <= 4) {
    sendPost("SYSTEM", "海が近い時間です");
  }
})();

/***********************
 * 定期自動投稿（都市伝説）
 ***********************/
setInterval(() => {
  const msgs = [
    "見つけた",
    "まだ沈んでいない",
    "次は誰だ",
    "名前を書いたな"
  ];
  const msg = msgs[Math.floor(Math.random() * msgs.length)];
  sendPost("？？？", msg);

  pollution += 1;
  localStorage.setItem("pollution", pollution);
  updateVisual();
}, 60000);

/***********************
 * 定期取得（オンライン同期）
 ***********************/
setInterval(loadPosts, 3000);
loadPosts();
updateVisual();
