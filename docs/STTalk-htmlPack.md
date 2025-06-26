# 概要

🖼️ **STTalk-htmlPack** は、STTalkの録音履歴を「HTMLとCSS付きのGUI」で一覧表示・再生・削除できるビューワー機能を提供します。  
HTML/CSSを一切書かずに、JavaScriptだけでUIを生成・管理できます。

## ダウンロード

- [ソースコード](https://github.com/da-wa33/STTalk/Packs/js/STTalk-htmlPack.js)
- [ダウンロード](https://github.com/da-wa33/STTalk/releases/latest)

## ✅ 主な機能

- 履歴（日時・テキスト）のリスト表示
- 音声再生ボタン（▶）
- 履歴削除ボタン（🗑）
- `setVisible(true/false)` によるUI表示切替
- CSSも動的に注入されるため、完全にJSだけで完結！



## 🚀 使用方法

```html
<script src="STTalk.js"></script>
<script src="STTalk-htmlPack.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", () => {
    STTalkHTMLPack.setVisible(true); // 履歴表示
  });
</script>
```

---

## 🔧 関数一覧

| 関数名 | 説明 |
|--------|------|
| `initViewer()` | 最初のUI構築（自動で呼ばれるが手動でも可） |
| `refresh()` | 履歴データの再読み込み |
| `setVisible(true/false)` | 表示・非表示を切り替え（`display: none` 切り替え） |

---

## 🧩 表示切り替えの例

```html
<button onclick="STTalkHTMLPack.setVisible(true)">履歴を表示</button>
<button onclick="STTalkHTMLPack.setVisible(false)">履歴を隠す</button>
```

---

## 📁 備考

- 履歴データは STTalk API (`getSessions`) から取得します。
- 履歴1件ごとに、日時・文字起こし・再生・削除の機能があります。
