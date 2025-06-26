const STTalk = (() => {
  let mediaRecorder;
  let audioChunks = [];
  let audioBlob = null;
  let recognition;
  let finalTranscript = "";
  let textCallback = () => {};
  let startTime = null;
  let timerId = null;
  let audioContext;
  let analyser;
  let sourceNode;
  let volumeCallback = () => {};
  let volumeLevel = 0;
  let volumeMeterId;
  var ST_error_level = 0;
  var ST_alert_enabled = true;
  const DB_NAME = "STTalkDB";
  const STORE_NAME = "sessions";
  let db;

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = e => reject(e.target.error);
      request.onsuccess = e => {
        db = e.target.result;
        resolve(db);
      };
      request.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        }
      };
    });
  }

  async function addSession(audioBlob, text) {
    if (!audioBlob) throw new Error("録音音声がありません");
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const data = {
        audio: audioBlob,
        text: text || "",
        date: new Date().toISOString()
      };
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = e => reject(e.target.error);
    });
  }

  async function getSessions() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = e => reject(e.target.error);
    });
  }

  async function deleteSession(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = e => reject(e.target.error);
    });
  }

  async function playSessionAudio(id) {
    const db = await openDB();
    const session = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = e => reject(e.target.error);
    });
    if (!session || !session.audio) {
      showAlert("音声が見つかりません");
      ST_error_level = 1;
      return;
    }
    const audio = new Audio(URL.createObjectURL(session.audio));
    audio.play();
  }

  async function getSessionText(id) {
    const db = await openDB();
    const session = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = e => reject(e.target.error);
    });
    return session ? session.text : null;
  }

  function startVolumeMeter(stream) {
    audioContext = new AudioContext();
    sourceNode = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    sourceNode.connect(analyser);
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    function update() {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      volumeLevel = avg / 255;
      volumeCallback(volumeLevel);
      volumeMeterId = requestAnimationFrame(update);
    }
    update();
  }

  function stopVolumeMeter() {
    if (volumeMeterId) cancelAnimationFrame(volumeMeterId);
    if (audioContext) audioContext.close();
  }

  function getRecordingTime() {
    if (!startTime) return 0;
    return Math.floor((Date.now() - startTime) / 1000);
  }

  function startRecording() {
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      audioBlob = null;
      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      mediaRecorder.onstop = () => {
        audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        stopVolumeMeter();
      };
      mediaRecorder.start();
      startTime = Date.now();
      startVolumeMeter(stream);
    });
  }

  function startRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showAlert("このブラウザは音声認識に対応していません");
      ST_error_level = -1;
      return;
    }
    recognition = new SR();
    recognition.lang = "ja-JP";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = event => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + "\n";
        } else {
          interim += transcript;
        }
      }
      textCallback(finalTranscript + interim);
    };
    recognition.start();
  }

  async function stopAll() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    if (recognition) recognition.stop();
    clearInterval(timerId);
    stopVolumeMeter();
    setTimeout(async () => {
      if (audioBlob) {
        try {
          await addSession(audioBlob, finalTranscript);
          ST_error_level = 2;
        } catch (e) {
          console.error("履歴保存エラー", e);
          ST_error_level = 3;
        }
      }
    }, 300);
  }

  function saveAudio(filename = "録音音声.webm") {
    if (!audioBlob) {
      showAlert("保存できる録音データがありません");
      ST_error_level = 4;
      return;
    }
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function saveText(filename = "文字起こし.txt") {
    const blob = new Blob([finalTranscript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function playAudio() {
    if (!audioBlob) {
      showAlert("再生できる音声がありません");
      ST_error_level = 5;
      return;
    }
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
  }

  function setAlertEnabled(enabled) {
    ST_alert_enabled = !!enabled;
  }
  function getAlertEnabled() {
    return ST_alert_enabled;
  }
  function showAlert(msg) {
    if (ST_alert_enabled) alert(msg);
  }

  async function stopAndSaveAudio() {
    await stopAll();
    saveAudio();
  }

  async function stopAndSaveText() {
    await stopAll();
    saveText();
  }

  return {
    start: () => {
      finalTranscript = "";
      return startRecording().then(() => startRecognition());
    },
    stop: stopAll,
    stopAndSaveAudio,
    stopAndSaveText,
    saveAudio,
    saveText,
    playAudio,
    onText: callback => (textCallback = callback),
    getFinalText: () => finalTranscript,
    setFinalText: text => (finalTranscript = text),
    getRecordingTime,
    getVolume: () => volumeLevel,
    onVolume: callback => (volumeCallback = callback),
    addSession,
    getSessions,
    deleteSession,
    playSessionAudio,
    getSessionText,
    setAlertEnabled,
    getAlertEnabled,
  };
})();

