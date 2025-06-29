# STTalkの使い方

## 概要
`STTalk` はブラウザ上で音声録音・文字起こし・履歴管理ができるシンプルな音声ツールです

## STTalk.jsのダウンロード

### ネットから持ってくる(推奨)

やりかたは簡単!

`<script src="STTalk.js"></script>`

ここの部分を

`<script src="https://da-wa.com/st-talk/STTalk.js"></script>`

にするだけ!

### ダウンロード版

ファイルのダウンロードは[Releaseのところ](https://github.com/da-wa33/STTalk/releases/latest)か

[Githubのソースコード置き場のここ](https://github.com/da-wa33/STTalk/blob/main/code/STTalk.js)から`STTalk.js`をダウンロードしてください

(ソースコードからの場合は直接ダウンロードマークをおしてダウンロード!)

## HTML での利用例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>STTalk サンプル</title>
</head>
<body>
  <button onclick="STTalk.start()">録音開始</button>
  <button onclick="STTalk.stop()">録音停止</button>
  <button onclick="STTalk.saveAudio()">音声保存</button>
  <button onclick="STTalk.saveText()">テキスト保存</button>
  <button onclick="STTalk.playAudio()">再生</button>
  <div id="transcript"></div>
  <script src="STTalk.js"></script>
  <script>
    STTalk.onText(function(text) {
      document.getElementById('transcript').textContent = text;
    });
  </script>
</body>
</html>
```

## 主なAPI一覧

*(2025/06/25 現在) 一部の機能が使えません*
| 関数名 | 説明 |
| --- | --- |
| `start()` | 録音と音声認識を開始します。|
| `stop()` | 録音・認識を停止し、履歴に保存します。|
| `saveAudio(filename)` | 録音音声をファイルとして保存します。デフォルト名は「録音音声.webm」。|
| `saveText(filename)` | 文字起こしテキストをファイルとして保存します。デフォルト名は「文字起こし.txt」。|
| `playAudio()` | 録音した音声を再生します。|
| `onText(callback)` | 音声認識テキストをリアルタイムでコールバックに渡します。|
| `getFinalText()` | 最終的な文字起こしテキストを取得します。|
| `setFinalText(text)` | 最終的な文字起こしテキストをセットします。|
| `getRecordingTime()` | 録音開始からの経過秒数を取得します。|
| `getVolume()` | 現在の音量レベル（0〜1）を取得します。|
| `onVolume(callback)` | 音量レベルをリアルタイムでコールバックに渡します。|
| `addSession(audioBlob, text)` | 音声とテキストを履歴に追加します。|
| `getSessions()` | 履歴一覧（配列）を取得します。|
| `deleteSession(id)` | 指定IDの履歴を削除します。|
| `playSessionAudio(id)` | 指定IDの履歴の音声を再生します。|
| `getSessionText(id)` | 指定IDの履歴のテキストを取得します。|
| `setAlertEnabled(true/false)` | alertの表示ON/OFFを切り替えます。trueで表示、falseで非表示。|
| `getAlertEnabled()` | alertの表示状態（true/false）を取得します。|

## エラーレベル管理（ST_error_level）

`ST_error_level` はエラーや状態を他のJSからも参照できるようグローバル変数として管理しています。

| 値 | 意味・発生箇所 |
| --- | --- |
| -1 | 音声認識APIが未対応のブラウザで startRecognition() を呼び出した |
| 1 | 履歴の音声データが見つからなかった（playSessionAudio）|
| 2 | 録音セッションの履歴保存が正常に完了した（stopAll）|
| 3 | 録音セッションの履歴保存時にエラーが発生した（stopAll）|
| 4 | 保存できる録音データがない状態で saveAudio を呼び出した |
| 5 | 再生できる音声がない状態で playAudio を呼び出した |

この変数を他のJSから参照することで、状態やエラーを判定できます。

## alert表示切り替えについて

`setAlertEnabled(true)` で alert（エラーや注意メッセージ）が表示され、`setAlertEnabled(false)` で alert が非表示（無効）になります。

- デフォルトは true（alert表示）です。
- `getAlertEnabled()` で現在の状態（true/false）を取得できます。

## 注意事項
- 音声認識は Chrome など Web Speech API 対応ブラウザで動作します。
- 録音・再生にはユーザーのマイク利用許可が必要です。

## 拡張パック

STTalkに新しい機能を追加したりできるのが拡張パックです

[ここから詳細が確認できます](https://github.com/da-wa33/STTalk/blob/main/docs/welcome-Pack.md)

---

ご質問・不具合は issue へどうぞ。
