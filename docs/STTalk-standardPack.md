# STTalk-standardPack

🛠️ **STTalk-StandardPack** は、STTalkに +α のユーティリティ機能を追加する拡張モジュールです。

## ダウンロード

- [ソースコード](https://github.com/da-wa33/STTalk/Packs/js/STTalk-htmlPack.js)
- [ダウンロード](https://github.com/da-wa33/STTalk/releases/latest)

## ✅ 含まれる機能

| 関数名 | 内容 |
|--------|------|
| `autoRestartRecognition()` | 音声認識が自動停止しても再スタート（耐久性UP） |
| `exportAllSessionsAsZip()` | 音声＋テキストをZIPにまとめて一括保存 |
| `attachVolumeMeter(canvas)` | canvasタグに音量バーを描画（リアルタイム） |
| `searchTranscripts(keyword)` | 文字起こし履歴からキーワード検索 |


## 🚀 使用例

```html
<script src="STTalk.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jszip"></script>
<script src="STTalk-standardPack.js"></script>
<script>
  STTalkAddon.autoRestartRecognition(); // 音声認識自動復帰

  const canvas = document.getElementById("volumeCanvas");
  STTalkAddon.attachVolumeMeter(canvas); // 音量表示

  document.getElementById("downloadZip").onclick = () => {
    STTalkAddon.exportAllSessionsAsZip(); // ZIPで保存
  };
</script>
```

---

## 🔍 キーワード検索例

```js
const results = await STTalkAddon.searchTranscripts("こんにちは");
console.log("検索結果:", results);
```

---

## 📌 注意事項

- `exportAllSessionsAsZip()` を使うには [JSZip](https://stuk.github.io/jszip/) の読み込みが必要です。
- `attachVolumeMeter(canvas)` は STTalk の `getVolume()` を利用しています。
- `STTalk.js` 本体と併用する前提のアドオンです。

---

## 💡 拡張しやすい構成

- 追加関数はすべて `STTalkAddon` に集約されています。
- 他の拡張ファイル（例：`aiPack`, `visualPack`）と併用も可能です。
