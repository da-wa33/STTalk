
(function (global) {
  const STTalkAddon = {};

  STTalkAddon.autoRestartRecognition = () => {
    const origStart = STTalk.start;
    const origStop = STTalk.stop;
    STTalk.start = async () => {
      await origStart();
      if (STTalk._recognition) {
        STTalk._recognition.onend = () => {
          console.warn("認識が終了したので再開します");
          STTalk._recognition.start();
        };
      }
    };
    STTalk.stop = () => {
      if (STTalk._recognition) {
        STTalk._recognition.onend = null;
      }
      return origStop();
    };
  };

  STTalkAddon.exportAllSessionsAsZip = async () => {
    const zip = new JSZip(); // 要: jszip ライブラリ
    const sessions = await STTalk.getSessions();
    for (let session of sessions) {
      const folder = zip.folder(`Session_${session.id}`);
      if (session.audio) {
        folder.file("audio.webm", session.audio);
      }
      folder.file("transcript.txt", session.text || "");
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "STTalkSessions.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  STTalkAddon.attachVolumeMeter = (canvas) => {
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    function draw() {
      const vol = STTalk.getVolume();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "limegreen";
      ctx.fillRect(0, height * (1 - vol), width, height * vol);
      requestAnimationFrame(draw);
    }
    draw();
  };

  STTalkAddon.searchTranscripts = async (keyword) => {
    const sessions = await STTalk.getSessions();
    return sessions.filter(s => (s.text || "").includes(keyword));
  };

  global.STTalkAddon = STTalkAddon;
})(window);

