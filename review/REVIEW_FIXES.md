# 教材点検の修正結果（2026年11月11日）

前回の点検の55項目に対応しました。関連する会話表現の表記も統一し、今回変更した教材は70項目（訳・説明46項目、英語表記26項目、一部重複）です。元CSV・ID・レベル別件数・カテゴリー・保存キーを維持しました。

## 対応内容

- am/is/areに主語の代表例を追加。has/doesの「三単現」を具体的な説明へ変更。
- gift/present、TV/televisionは同じ訳に統一。
- class/lesson、picture/photo、home/house、small/little、hard/difficult、too/alsoは、今回学ぶ意味や対象を明記。
- pictureの写真、hardの難しい等の別義を否定する変更ではありません。今回は学ぶ意味を絞っています。
- hourを60分と明示。see/look/watch、draw/paint、on/above/overの説明を具体化。
- 小学生に硬い日本語を分かりやすく調整。
- do one's bestをdo my bestに変更し、自分が全力でがんばる表現と明示。
- 25の会話表現で文頭の大文字と句点・疑問符を統一。Typing/OCRは既存の正規化を維持し、Cardは記号のタイルも含めて検証。

## 手書きの同義語ヒント

同じレベル・カテゴリーで訳が完全一致する20項目に、英語の先頭部分を日本語欄へ付記します。例えばbikeは「bik…」、bicycleは「bic…」、storeは「st…」、shopは「sh…」。他の同訳語と区別できる最短の接頭部を使います。

元の日本語データを変更するのではなく、手書き開始時に表示用のコピーを渡します。認識・正規化・許容誤差・正誤・スコアを変更していません。handwriting.jsおよびhandwriting.cssは元アプリとバイト一致のままです。

## 変更一覧

| ID | 以前の英語 | 修正後の英語 | 以前の訳 | 修正後の訳 |
| --- | --- | --- | --- | --- |

| E5-0002 | am | am | 〜です | 〜です（Iと使う） |
| E5-0003 | is | is | 〜です | 〜です（he・she・itなどと使う） |
| E5-0004 | are | are | 〜です | 〜です（you・we・theyなどと使う） |
| E5-0006 | has | has | 持っている（三単現） | 持っている（he・she・itなどと使うhaveの形） |
| E5-0008 | does | does | する（三単現） | する（he・she・itなどと使うdoの形） |
| E5-0011 | get | get | 得る・着く | 手に入れる・着く |
| E5-0014 | give | give | 与える | あげる・渡す |
| E5-0025 | see | see | 見る・会う | 見える・会う |
| E5-0026 | look | look | 見る | 目を向けて見る |
| E5-0027 | watch | watch | 見る | じっと見る（テレビや動きなどを） |
| E5-0030 | speak | speak | 話す | 言葉を話す |
| E5-0031 | talk | talk | 話す | 人と話す |
| E5-0072 | us | us | 私たちを・に | 私たちを・私たちに |
| E5-0076 | them | them | 彼らを・に | 彼らを・彼らに・それらを・それらに |
| E5-0093 | will | will | 〜するつもりだ | 〜だろう・〜するつもりだ |
| E5-0098 | because | because | なぜなら | 〜なので・〜だから |
| E5-0103 | to | to | 〜へ・〜すること | 〜へ／（動詞の前で）〜すること・〜するために |
| E5-0176 | class | class | 授業・クラス | クラス（学級） |
| E5-0227 | noodle | noodle | 麺（1本） | めん（ふつうはnoodlesと複数形で使う） |
| E5-0260 | home | home | 家・自宅 | 自宅（生活する場所） |
| E5-0261 | house | house | 家 | 家（建物） |
| E5-0278 | small | small | 小さい | 小さい（大きさが小さい） |
| E5-0280 | little | little | 小さい・少しの | 少しの（a littleで使う） |
| E5-0301 | draw | draw | 描く | 絵をかく（えんぴつなどで） |
| E5-0302 | paint | paint | 絵を描く | 絵をかく（絵の具で） |
| E5-0338 | on | on | 〜の上に | 〜の上に（くっついている） |
| E5-0341 | over | over | 〜の上方に | 〜の上方に・〜をこえて |
| E5-0342 | above | above | 〜の上に | 〜より上に |
| E5-0379 | hour | hour | 時間 | 1時間（60分）・〜時間 |
| E5-0408 | picture | picture | 絵・写真 | 絵（イラスト） |
| E5-0409 | photo | photo | 写真 | 写真（カメラで撮ったもの） |
| E5-0411 | clock | clock | 時計 | 時計（かべ時計・置き時計など） |
| E5-0457 | television | television | テレビ番組・テレビ | テレビ |
| E5-0493 | ocean | ocean | 大洋 | 大きな海・大洋 |
| E5-0508 | department store | department store | 百貨店 | デパート・百貨店 |
| E5-0523 | front | front | 前面 | 前・正面 |
| E5-0542 | gift | gift | 贈り物 | プレゼント・贈り物 |
| E5-0543 | present | present | プレゼント | プレゼント・贈り物 |
| E5-0558 | friendly | friendly | 友好的な | 親しみやすい・人なつっこい |
| E5-0569 | hard | hard | 難しい・硬い | かたい |
| E5-0573 | important | important | 重要な | 大切な・重要な |
| E5-0597 | usually | usually | ふつう | ふだんは・たいてい |
| E5-0612 | too | too | 〜もまた・あまりに | あまりに〜（程度が強すぎる） |
| E5-0647 | do one's best | do my best | 最善を尽くす | 全力でがんばる（自分が） |
| E5-0662 | in the evening | in the evening | 夕方に | 夕方に・晩に |
| E5-0676 | nice to meet you | Nice to meet you. | はじめまして | はじめまして |
| E5-0677 | nice to see you | Nice to see you. | 会えてうれしい | 会えてうれしい |
| E5-0678 | how are you | How are you? | お元気ですか | お元気ですか |
| E5-0679 | I'm fine | I'm fine. | 元気です | 元気です |
| E5-0680 | thank you | Thank you. | ありがとう | ありがとう |
| E5-0681 | thanks a lot | Thanks a lot. | どうもありがとう | どうもありがとう |
| E5-0682 | you're welcome | You're welcome. | どういたしまして | どういたしまして |
| E5-0683 | excuse me | Excuse me. | すみません | すみません |
| E5-0684 | I'm sorry | I'm sorry. | ごめんなさい | ごめんなさい |
| E5-0685 | that's OK | That's OK. | 大丈夫です | 大丈夫です |
| E5-0686 | of course | Of course. | もちろん | もちろん |
| E5-0687 | here you are | Here you are. | はいどうぞ | はいどうぞ |
| E5-0688 | see you | See you. | またね | またね |
| E5-0689 | see you later | See you later. | またあとで | またあとで |
| E5-0690 | good morning | Good morning. | おはよう | おはよう |
| E5-0691 | good afternoon | Good afternoon. | こんにちは | こんにちは |
| E5-0692 | good evening | Good evening. | こんばんは | こんばんは |
| E5-0693 | good night | Good night. | おやすみ | おやすみ |
| E5-0694 | happy birthday | Happy birthday. | 誕生日おめでとう | 誕生日おめでとう |
| E5-0695 | good luck | Good luck. | 幸運を祈る | うまくいくといいね・がんばってね |
| E5-0696 | have a nice day | Have a nice day. | よい一日を | よい一日を |
| E5-0697 | let's go | Let's go. | 行きましょう | 行きましょう |
| E5-0698 | let's play | Let's play. | 遊びましょう | 遊びましょう |
| E5-0699 | come on | Come on. | さあ・頑張れ | さあ・頑張れ |
| E5-0700 | sit down | Sit down. | 座って | 座って |

## 検証・維持事項

全700項目、300／300／100、重複IDなし。元CSV・元アプリに変更なし。4モードと全件表示・手書きヒントの検証はverification/browser-results.json、公開配信の確認はverification/deployment-results.jsonを参照。学習記録の削除・保存キー変更は実施しません。

元の点検WORD_REVIEW.mdおよびword-audit-700.jsonは修正前の記録として保存します。今回の変更はこのファイルとverification/material-review-changes.jsonに記録しました。

筆跡による認識精度、長い熟語をスマートフォンで1行に書く負担、firstの未収録や曜日のレベル配分は今回の訳・出題修正と分け、既存仕様を維持しました。
