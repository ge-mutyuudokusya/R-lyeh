window.addEventListener('DOMContentLoaded', () => {

  /* ===== Firebase設定 ===== */
  const firebaseConfig = {
    apiKey: "AIzaSyC1IK8k7yfu7rEzGBsQHl9CLHLy1aCwYTE",
    authDomain: "rlyeh-board.firebaseapp.com",
    databaseURL: "https://rlyeh-board-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "rlyeh-board",
    storageBucket: "rlyeh-board.firebasestorage.app",
    messagingSenderId: "107455035572",
    appId: "1:107455035572:web:2128ec27aefe2afe6f3fe1"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const postsRef = db.ref('posts');

  const board = document.getElementById('board');
  const crt = document.getElementById('crt');
  const scanlines = document.getElementById('scanlines');

  /* ===== 掲示板 ===== */
  window.sendPost = function () {
    const input = document.getElementById('input');
    if (!input.value.trim()) return;

    postsRef.push({
      text: input.value,
      time: Date.now()
    });

    input.value = '';
  };

  postsRef.limitToLast(30).on('child_added', snap => {
    const data = snap.val();
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
      <div>${data.text}</div>
      <div class="time">${new Date(data.time).toLocaleString()}</div>
    `;
    board.prepend(div);
  });

  /* ===== 深海音 ===== */
  let audioCtx;

  function playDeepSound(freq = 40, duration = 4000) {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    setTimeout(() => osc.stop(), duration);
  }

  /* ===== 異常イベント ===== */
  const anomalySounds = [
    '恐怖.mp3','うなり.mp3','クトゥルフ・フタグン.mp3',
    'ゴゴゴゴ.mp3','恐怖(10)万能.mp3','地震魔法1.mp3','深海.mp3'
  ];

  function anomalyEvent() {
    if (Math.random() > 0.6) return;

    const effects = ['anomaly-red','anomaly-shake','anomaly-crt','anomaly-full'];
    const effect = effects[Math.floor(Math.random() * effects.length)];
    document.body.classList.add(effect);

    const sound = new Audio(anomalySounds[Math.floor(Math.random()*anomalySounds.length)]);
    sound.volume = 0.4;
    sound.play();

    playDeepSound();

    setTimeout(() => {
      document.body.classList.remove(effect);
      sound.pause();
      sound.currentTime = 0;
    }, 5000 + Math.random()*5000);
  }

  function scheduleAnomaly() {
    setTimeout(() => {
      anomalyEvent();
      scheduleAnomaly();
    }, 600000 + Math.random()*600000);
  }

  scheduleAnomaly();
});
