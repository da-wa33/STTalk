(function (global) {
  const htmlPack = {};
  let initialized = false;
  let container;
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #sttalk-history-container {
        font-family: sans-serif;
        padding: 1em;
        background: #f9f9f9;
      }
      .sttalk-session {
        background: #fff;
        border-radius: 8px;
        margin-bottom: 1em;
        padding: 1em;
        box-shadow: 0 0 6px rgba(0,0,0,0.1);
      }
      .sttalk-session-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .sttalk-date {
        font-weight: bold;
        color: #444;
      }
      .sttalk-btn {
        margin-left: 0.5em;
        background: #008cff;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 0.3em 0.6em;
        cursor: pointer;
      }
      .sttalk-btn:hover {
        background: #005fcc;
      }
      .sttalk-delete {
        background: #e74c3c;
      }
      .sttalk-delete:hover {
        background: #c0392b;
      }
      .sttalk-text {
        margin-top: 0.5em;
        white-space: pre-wrap;
      }
    `;
    document.head.appendChild(style);
  }

  htmlPack.initViewer = async () => {
    if (initialized) return;
    injectStyles();
    container = document.createElement("div");
    container.id = "sttalk-history-container";
    document.body.appendChild(container);
    initialized = true;
    await htmlPack.refresh();
 
  };

  htmlPack.refresh = async () => {

    if (!container) return;
    const sessions = await STTalk.getSessions();
    container.innerHTML = "";
    if (!sessions.length) {
      container.innerHTML = "<p>履歴はまだありません。</p>";
      return;
    
    }
    sessions.reverse().forEach(session => {
      const item = document.createElement("div");
      item.className = "sttalk-session";
      const date = new Date(session.date).toLocaleString();
      item.innerHTML = `
        <div class="sttalk-session-header">
          <span class="sttalk-date">${date}</span>
          <div>
            <button class="sttalk-btn sttalk-play" data-id="${session.id}">▶ 再生</button>
            <button class="sttalk-btn sttalk-delete" data-id="${session.id}">🗑 削除</button>
          </div>
        </div>
        <div class="sttalk-text">${session.text}</div>
      `;
      container.appendChild(item);
    });
    container.querySelectorAll(".sttalk-play").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = parseInt(e.target.dataset.id);
        await STTalk.playSessionAudio(id);
      });
    });
    container.querySelectorAll(".sttalk-delete").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = parseInt(e.target.dataset.id);
        if (confirm("この履歴を削除しますか？")) {
          await STTalk.deleteSession(id);
          await htmlPack.refresh();
        }
      });
    });
  };

  htmlPack.setVisible = async (visible) => {

    if (!initialized) await htmlPack.initViewer();
    container.style.display = visible ? "block" : "none";
  };
  global.STTalkHTMLPack = htmlPack;
})(window);

