import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabaseClient";

// ── DEFAULT LESSONS (fallback if sync fails) ──────────────────────────────────
const DEFAULT_LESSONS = {
  1: {
    title: "Lesson 1 – Introductions",
    grammar: [
      { jp: "わたしは {NAME} です", en: "I am {NAME}", roma: "Watashi wa {NAME} desu" },
      { jp: "なまえは なんですか？", en: "What is your name?", roma: "Namae wa nan desuka?" },
      { jp: "なにじんですか？", en: "What is your nationality?", roma: "Nani jin desuka?" },
      { jp: "わたしは {NAME} じゃありません", en: "I am not {NAME}", roma: "Watashi wa {NAME} jya arimasen" },
      { jp: "なんさいですか？", en: "How old are you?", roma: "Nan sai desuka?" },
    ],
    vocab: [
      { jp: "がくせい", roma: "gakusei", en: "student" },
      { jp: "かいしゃいん", roma: "kaishain", en: "company employee" },
      { jp: "せんせい", roma: "sensei", en: "teacher" },
      { jp: "にほんじん", roma: "nihonjin", en: "Japanese person" },
      { jp: "カナダじん", roma: "kanadajin", en: "Canadian" },
      { jp: "なまえ", roma: "namae", en: "name" },
      { jp: "なんさい", roma: "nansai", en: "how old" },
      { jp: "だれ", roma: "dare", en: "who" },
    ],
  },
  2: {
    title: "Lesson 2 – This / That / Whose",
    grammar: [
      { jp: "これは なんですか？", en: "What is this?", roma: "Kore wa nan desuka?" },
      { jp: "それは {NOUN} ですか？", en: "Is that {NOUN}?", roma: "Sore wa {NOUN} desuka?" },
      { jp: "これは だれの {NOUN} ですか？", en: "Whose {NOUN} is this?", roma: "Kore wa dare no {NOUN} desuka?" },
      { jp: "この {NOUN} は だれのですか？", en: "Whose {NOUN} is this?", roma: "Kono {NOUN} wa dare no desuka?" },
      { jp: "はい、そうです", en: "Yes, that's right", roma: "Hai, sou desu" },
      { jp: "いいえ、ちがいます", en: "No, that's wrong", roma: "Iie, chigaimasu" },
    ],
    vocab: [
      { jp: "これ", roma: "kore", en: "this" },
      { jp: "それ", roma: "sore", en: "that" },
      { jp: "あれ", roma: "are", en: "that over there" },
      { jp: "この", roma: "kono", en: "this (+ noun)" },
      { jp: "ほん", roma: "hon", en: "book" },
      { jp: "ざっし", roma: "zasshi", en: "magazine" },
      { jp: "くつ", roma: "kutsu", en: "shoes" },
      { jp: "さいふ", roma: "saifu", en: "wallet" },
    ],
  },
  3: {
    title: "Lesson 3 – Places & Floors",
    grammar: [
      { jp: "ここは どこですか？", en: "What place is this?", roma: "Koko wa doko desuka?" },
      { jp: "{NOUN} は どこですか？", en: "Where is {NOUN}?", roma: "{NOUN} wa doko desuka?" },
      { jp: "{NOUN} は なんがいですか？", en: "What floor is {NOUN}?", roma: "{NOUN} wa nan gai desuka?" },
      { jp: "トイレは どこですか？", en: "Where is the bathroom?", roma: "Toire wa doko desuka?" },
    ],
    vocab: [
      { jp: "ここ", roma: "koko", en: "here" },
      { jp: "そこ", roma: "soko", en: "there" },
      { jp: "あそこ", roma: "asoko", en: "over there" },
      { jp: "どこ", roma: "doko", en: "where" },
      { jp: "トイレ", roma: "toire", en: "bathroom/toilet" },
      { jp: "エレベーター", roma: "erebeetaa", en: "elevator" },
      { jp: "かいだん", roma: "kaidan", en: "stairs" },
      { jp: "レストラン", roma: "resutoran", en: "restaurant" },
    ],
  },
  4: {
    title: "Lesson 4 – Time & Days",
    grammar: [
      { jp: "いま なんじですか？", en: "What time is it now?", roma: "Ima nanji desuka?" },
      { jp: "{PLACE} は なんじから なんじまで ですか？", en: "What hours is {PLACE} open?", roma: "{PLACE} wa nanji kara nanji made desuka?" },
      { jp: "なんじに {VERB} ますか？", en: "What time do you {VERB}?", roma: "Nanji ni {VERB} masuka?" },
      { jp: "なんようびですか？", en: "What day of the week is it?", roma: "Nan youbi desuka?" },
    ],
    vocab: [
      { jp: "げつようび", roma: "getsuyoubi", en: "Monday" },
      { jp: "かようび", roma: "kayoubi", en: "Tuesday" },
      { jp: "すいようび", roma: "suiyoubi", en: "Wednesday" },
      { jp: "もくようび", roma: "mokuyoubi", en: "Thursday" },
      { jp: "きんようび", roma: "kinyoubi", en: "Friday" },
      { jp: "どようび", roma: "doyoubi", en: "Saturday" },
      { jp: "にちようび", roma: "nichiyoubi", en: "Sunday" },
      { jp: "ごぜん", roma: "gozen", en: "AM" },
      { jp: "ごご", roma: "gogo", en: "PM" },
    ],
  },
  5: {
    title: "Lesson 5 – Going Places",
    grammar: [
      { jp: "わたしは {PLACE} へ いきます", en: "I go to {PLACE}", roma: "Watashi wa {PLACE} e ikimasu" },
      { jp: "{VEHICLE} で {PLACE} へ いきます", en: "I go to {PLACE} by {VEHICLE}", roma: "{VEHICLE} de {PLACE} e ikimasu" },
      { jp: "{PERSON} と {PLACE} へ いきます", en: "I go to {PLACE} with {PERSON}", roma: "{PERSON} to {PLACE} e ikimasu" },
      { jp: "たんじょうびは いつですか？", en: "When is your birthday?", roma: "Tanjoubi wa itsu desuka?" },
    ],
    vocab: [
      { jp: "いきます", roma: "ikimasu", en: "go" },
      { jp: "きます", roma: "kimasu", en: "come" },
      { jp: "かえります", roma: "kaerimasu", en: "go home" },
      { jp: "タクシー", roma: "takushii", en: "taxi" },
      { jp: "バス", roma: "basu", en: "bus" },
      { jp: "でんしゃ", roma: "densha", en: "train" },
      { jp: "ひとりで", roma: "hitori de", en: "alone" },
      { jp: "たんじょうび", roma: "tanjoubi", en: "birthday" },
    ],
  },
  6: {
    title: "Lesson 6 – Verbs & Activities",
    grammar: [
      { jp: "{NOUN} を たべます", en: "I eat {NOUN}", roma: "{NOUN} o tabemasu" },
      { jp: "{NOUN} を のみます", en: "I drink {NOUN}", roma: "{NOUN} o nomimasu" },
      { jp: "いっしょに {VERB} ませんか？", en: "Shall we {VERB} together?", roma: "Issho ni {VERB} masen ka?" },
      { jp: "{PLACE} で {NOUN} を {VERB} ます", en: "I {VERB} {NOUN} at {PLACE}", roma: "{PLACE} de {NOUN} o {VERB} masu" },
    ],
    vocab: [
      { jp: "たべます", roma: "tabemasu", en: "eat" },
      { jp: "のみます", roma: "nomimasu", en: "drink" },
      { jp: "みます", roma: "mimasu", en: "watch/see" },
      { jp: "ききます", roma: "kikimasu", en: "listen/hear" },
      { jp: "よみます", roma: "yomimasu", en: "read" },
      { jp: "かきます", roma: "kakimasu", en: "write" },
      { jp: "かいます", roma: "kaimasu", en: "buy" },
      { jp: "あいます", roma: "aimasu", en: "meet" },
      { jp: "します", roma: "shimasu", en: "do" },
    ],
  },
};

const GREETINGS = [
  { jp: "おはようございます", roma: "Ohayou gozaimasu", en: "Good morning" },
  { jp: "こんにちは", roma: "Kon nichi wa", en: "Good afternoon" },
  { jp: "こんばんは", roma: "Kon ban wa", en: "Good evening" },
  { jp: "おやすみ", roma: "Oyasumi", en: "Good night" },
  { jp: "ありがとうございます", roma: "Arigatou gozaimasu", en: "Thank you very much" },
  { jp: "すみません", roma: "Sumimasen", en: "Excuse me / I'm sorry" },
  { jp: "げんきですか？", roma: "Genki desuka?", en: "How are you?" },
  { jp: "げんきです", roma: "Genki desu", en: "I'm fine" },
  { jp: "いただきます", roma: "Itadakimasu", en: "Said before eating" },
  { jp: "ごちそうさまでした", roma: "Gochisousama deshita", en: "Said after eating" },
];

// ── STORY SCENARIOS (pre-written, no API needed) ─────────────────────────────
const SCENARIOS = {
  1: [
    {
      id: "self-intro", title: "Self Introduction", emoji: "🙋", desc: "Meet a new Japanese colleague at work",
      steps: [
        { npc: "こんにちは！わたしは たなかです。(Konnichiwa! Watashi wa Tanaka desu.) — Hi! I'm Tanaka.", prompt: "Introduce yourself", choices: [
          { text: "わたしは ニコラスです。(Watashi wa Nicholas desu.)", correct: true, reply: "ニコラスさん、はじめまして！なにじんですか？(Nicholas-san, hajimemashite! Nani jin desuka?) — Nice to meet you! What nationality are you?" },
          { text: "げんきです。(Genki desu.)", correct: false, reply: "あ、げんきですか。でも… おなまえは？(A, genki desuka. Demo… onamae wa?) — Ah, you're well? But… your name?" },
          { text: "さようなら。(Sayounara.)", correct: false, reply: "え？もう？おなまえを おしえてください！(E? Mou? Onamae wo oshiete kudasai!) — Eh? Already? Tell me your name!" },
        ]},
        { npc: "ニコラスさんは なにじんですか？(Nicholas-san wa nani jin desuka?) — What nationality are you?", prompt: "Tell them your nationality", choices: [
          { text: "カナダじんです。(Kanada jin desu.)", correct: true, reply: "カナダじん！いいですね。おしごとは？がくせいですか？(Kanada jin! Ii desu ne. Oshigoto wa? Gakusei desuka?) — Canadian! Nice. What about work? Are you a student?" },
          { text: "にほんじんです。(Nihon jin desu.)", correct: false, reply: "ほんとうに？にほんごが... あまり？(Hontou ni? Nihongo ga... amari?) — Really? Your Japanese is... not quite?" },
          { text: "せんせいです。(Sensei desu.)", correct: false, reply: "あ、せんせい is your job, not nationality! なにじん？(A, sensei is your job, not nationality! Nani jin?)" },
        ]},
        { npc: "がくせいですか？かいしゃいんですか？(Gakusei desuka? Kaishain desuka?) — Are you a student or company employee?", prompt: "Tell them about yourself", choices: [
          { text: "かいしゃいんです。(Kaishain desu.)", correct: true, reply: "そうですか！わたしも かいしゃいんです。よろしくおねがいします！(Sou desuka! Watashi mo kaishain desu. Yoroshiku onegaishimasu!) — I see! I'm also an employee. Nice to meet you!" },
          { text: "がくせいです。(Gakusei desu.)", correct: true, reply: "がくせいですか！いいですね。よろしくおねがいします！(Gakusei desuka! Ii desu ne. Yoroshiku onegaishimasu!) — A student! Nice. Pleased to meet you!" },
          { text: "わかりません。(Wakarimasen.)", correct: false, reply: "はは、だいじょうぶ！ゆっくり かんがえてください。(Haha, daijoubu! Yukkuri kangaete kudasai.) — Haha, it's okay! Take your time to think." },
        ]},
      ],
    },
    {
      id: "party-intro", title: "Party Introduction", emoji: "🎉", desc: "Introduce yourself at a welcome party",
      steps: [
        { npc: "ようこそ！パーティーへ ようこそ！おなまえは？(Youkoso! Paatii e youkoso! Onamae wa?) — Welcome to the party! Your name?", prompt: "Introduce yourself", choices: [
          { text: "わたしは ニコラスです。はじめまして。(Watashi wa Nicholas desu. Hajimemashite.)", correct: true, reply: "ニコラスさん！はじめまして！わたしは きむらです。どこから きましたか？(Nicholas-san! Hajimemashite! Watashi wa Kimura desu. Doko kara kimashitaka?) — Nice to meet you! I'm Kimura. Where are you from?" },
          { text: "すみません。(Sumimasen.)", correct: false, reply: "あ、だいじょうぶですよ！おなまえは？(A, daijoubu desu yo! Onamae wa?) — Ah, it's fine! What's your name?" },
          { text: "おいしいです。(Oishii desu.)", correct: false, reply: "え？まだ なにも たべていませんよ！(E? Mada nanimo tabete imasen yo!) — Eh? You haven't eaten anything yet!" },
        ]},
        { npc: "ニコラスさんは なにを しますか？しごとですか？がくせいですか？(Nicholas-san wa nani wo shimasuka? Shigoto desuka? Gakusei desuka?)", prompt: "Tell them about yourself", choices: [
          { text: "かいしゃいんです。IT の しごとです。(Kaishain desu. IT no shigoto desu.)", correct: true, reply: "IT！すごいですね！にほんごも じょうずですよ！(IT! Sugoi desu ne! Nihongo mo jouzu desu yo!) — IT! That's great! Your Japanese is good too!" },
          { text: "がくせいです。にほんごを べんきょうしています。(Gakusei desu. Nihongo wo benkyou shite imasu.)", correct: true, reply: "べんきょう！がんばっていますね！(Benkyou! Ganbatte imasu ne!) — Studying! You're working hard!" },
          { text: "なんさいですか？(Nan sai desuka?)", correct: false, reply: "え？わたしの としですか？ちょっと... おしごとは？(E? Watashi no toshi desuka? Chotto... oshigoto wa?) — My age? Um... what about your job?" },
        ]},
      ],
    },
    {
      id: "age-job", title: "Getting to Know You", emoji: "💼", desc: "Ask about someone's age and job",
      steps: [
        { npc: "はじめまして！わたしは すずきです。25さいです。(Hajimemashite! Watashi wa Suzuki desu. 25 sai desu.) — Nice to meet you! I'm Suzuki. I'm 25.", prompt: "Ask them about their job", choices: [
          { text: "すずきさんは なんですか？がくせいですか？(Suzuki-san wa nan desuka? Gakusei desuka?)", correct: true, reply: "いいえ、がくせいじゃありません。せんせいです。(Iie, gakusei jya arimasen. Sensei desu.) — No, I'm not a student. I'm a teacher." },
          { text: "なんさいですか？(Nan sai desuka?)", correct: false, reply: "25さいです... もう いいましたよ！(25 sai desu... mou iimashita yo!) — I'm 25... I already said that!" },
          { text: "だれですか？(Dare desuka?)", correct: false, reply: "えっ？すずきです！もう いいましたよ！(E? Suzuki desu! Mou iimashita yo!) — Eh? I'm Suzuki! I already said!" },
        ]},
        { npc: "ニコラスさんは なんさいですか？(Nicholas-san wa nan sai desuka?) — How old are you, Nicholas?", prompt: "Answer the question", choices: [
          { text: "にじゅうごさいです。(Nijuugo sai desu.)", correct: true, reply: "おなじ！にじゅうごさい！うれしい！(Onaji! Nijuugo sai! Ureshii!) — Same! 25! I'm happy!" },
          { text: "カナダじんです。(Kanada jin desu.)", correct: false, reply: "あ、それは nationality ですよ。なんさい？(A, sore wa nationality desu yo. Nan sai?) — Ah, that's nationality. How OLD?" },
          { text: "げんきです。(Genki desu.)", correct: false, reply: "はは、げんき is 'fine'! なんさい = how old? (Haha, genki is 'fine'! Nan sai = how old?)" },
        ]},
      ],
    },
    {
      id: "new-neighbor", title: "New Neighbor", emoji: "🏠", desc: "Meet your new Japanese neighbor",
      steps: [
        { npc: "You move into a new apartment. A neighbor knocks on your door: こんにちは！となりの さとうです。(Konnichiwa! Tonari no Satou desu.) — Hello! I'm Satou from next door.", prompt: "Greet your new neighbor", choices: [
          { text: "はじめまして！わたしは ニコラスです。よろしくおねがいします。(Hajimemashite! Watashi wa Nicholas desu. Yoroshiku onegaishimasu.)", correct: true, reply: "よろしくおねがいします！ニコラスさんは がいこくじんですか？(Yoroshiku onegaishimasu! Nicholas-san wa gaikokujin desuka?) — Nice to meet you! Are you a foreigner?" },
          { text: "だれですか？(Dare desuka?)", correct: false, reply: "さとうです！となりですよ！(Satou desu! Tonari desu yo!) — I'm Satou! From next door!" },
          { text: "いいえ。(Iie.)", correct: false, reply: "え？あ... おなまえは？(E? A... onamae wa?) — Eh? Um... your name?" },
        ]},
        { npc: "どこから きましたか？(Doko kara kimashitaka?) — Where are you from?", prompt: "Tell them where you're from", choices: [
          { text: "カナダから きました。(Kanada kara kimashita.)", correct: true, reply: "カナダ！さむいですね！にほんは はじめてですか？(Kanada! Samui desu ne! Nihon wa hajimete desuka?) — Canada! It's cold there! Is this your first time in Japan?" },
          { text: "にほんじんです。(Nihonjin desu.)", correct: false, reply: "あ... そうですか？にほんごが... (A... sou desuka? Nihongo ga...) — Oh... is that so? Your Japanese is..." },
          { text: "せんせいです。(Sensei desu.)", correct: false, reply: "あ、おしごとではなくて、どこから？(A, oshigoto dewa nakute, doko kara?) — Not your job, where from?" },
        ]},
      ],
    },
  ],
  2: [
    {
      id: "lost-item", title: "Whose Is This?", emoji: "👜", desc: "Find who owns a lost item in class",
      steps: [
        { npc: "You see a wallet on the desk. Your classmate Yamada is nearby.", prompt: "Ask about the wallet", choices: [
          { text: "これは だれの さいふですか？(Kore wa dare no saifu desuka?)", correct: true, reply: "ん？それは わたしの さいふじゃありません。(N? Sore wa watashi no saifu jya arimasen.) — Hmm? That's not my wallet." },
          { text: "これは なんですか？(Kore wa nan desuka?)", correct: false, reply: "さいふですよ！It's a wallet! だれの？(Saifu desu yo! It's a wallet! Dare no?)" },
          { text: "あれは ほんですか？(Are wa hon desuka?)", correct: false, reply: "ほん？いいえ、あれは さいふですよ。(Hon? Iie, are wa saifu desu yo.) — Book? No, that's a wallet." },
        ]},
        { npc: "Tanaka walks in. たなかさんの かもしれません。(Tanaka-san no kamo shiremasen.) — It might be Tanaka's.", prompt: "Ask Tanaka about the wallet", choices: [
          { text: "たなかさん、この さいふは たなかさんのですか？(Tanaka-san, kono saifu wa Tanaka-san no desuka?)", correct: true, reply: "あ！はい、そうです！わたしの さいふです。ありがとうございます！(A! Hai, sou desu! Watashi no saifu desu. Arigatou gozaimasu!) — Ah! Yes! That's my wallet. Thank you!" },
          { text: "それは なんですか？(Sore wa nan desuka?)", correct: false, reply: "え？わたしに きいていますか？(E? Watashi ni kiite imasuka?) — Eh? Are you asking me?" },
          { text: "いいえ、ちがいます。(Iie, chigaimasu.)", correct: false, reply: "え？なにが ちがいますか？(E? Nani ga chigai masuka?) — Eh? What's wrong?" },
        ]},
      ],
    },
    {
      id: "shopping", title: "At the Store", emoji: "🛍️", desc: "Ask about items at a shop",
      steps: [
        { npc: "いらっしゃいませ！(Irasshaimase!) — Welcome! You see various items on display.", prompt: "Ask about an item", choices: [
          { text: "すみません、これは なんですか？(Sumimasen, kore wa nan desuka?)", correct: true, reply: "これは にほんの ざっしです。(Kore wa nihon no zasshi desu.) — This is a Japanese magazine." },
          { text: "それは だれのですか？(Sore wa dare no desuka?)", correct: false, reply: "え？おみせの ものですよ。(E? Omise no mono desu yo.) — Eh? It belongs to the store." },
          { text: "ここは どこですか？(Koko wa doko desuka?)", correct: false, reply: "おみせですよ！(Omise desu yo!) — It's a store!" },
        ]},
        { npc: "ほかに なにか？(Hoka ni nanika?) — Anything else? You see a nice book.", prompt: "Ask about the book", choices: [
          { text: "あの ほんは いくらですか？(Ano hon wa ikura desuka?)", correct: true, reply: "あの ほんは 500えんです。(Ano hon wa 500 en desu.) — That book is 500 yen." },
          { text: "あれは だれの ほんですか？(Are wa dare no hon desuka?)", correct: true, reply: "おみせの ほんですよ。500えんです。(Omise no hon desu yo. 500 en desu.) — It's the store's book. 500 yen." },
          { text: "さようなら。(Sayounara.)", correct: false, reply: "あ、もう かえりますか？(A, mou kaerimasu ka?) — Oh, leaving already?" },
        ]},
      ],
    },
    {
      id: "library-visit", title: "Library Visit", emoji: "📚", desc: "Ask about things at the library",
      steps: [
        { npc: "としょかんに はいります。You see many items on a table.", prompt: "Ask about something on the table", choices: [
          { text: "すみません、これは なんの ほんですか？(Sumimasen, kore wa nan no hon desuka?)", correct: true, reply: "それは にほんごの じしょです。(Sore wa nihongo no jisho desu.) — That's a Japanese dictionary." },
          { text: "あれは だれですか？(Are wa dare desuka?)", correct: false, reply: "あれは ほんですよ、ひとじゃないです！(Are wa hon desu yo, hito jya nai desu!) — That's a book, not a person!" },
          { text: "ここは どこですか？(Koko wa doko desuka?)", correct: false, reply: "としょかんですよ！(Toshokan desu yo!) — It's a library!" },
        ]},
        { npc: "Someone left a bag on the chair. だれかの かばんが あります。(Dareka no kaban ga arimasu.)", prompt: "Ask whose bag it is", choices: [
          { text: "この かばんは だれのですか？(Kono kaban wa dare no desuka?)", correct: true, reply: "あ、それは わたしのです！ありがとう！(A, sore wa watashi no desu! Arigatou!) — Ah, that's mine! Thank you!" },
          { text: "これは かばんですか？(Kore wa kaban desuka?)", correct: false, reply: "はい、かばんですよ。でも だれの？(Hai, kaban desu yo. Demo dare no?) — Yes, it's a bag. But whose?" },
          { text: "いいえ、ちがいます。(Iie, chigaimasu.)", correct: false, reply: "え？なにが ちがいますか？(E? Nani ga chigaimasuka?) — What's wrong?" },
        ]},
      ],
    },
    {
      id: "gift-exchange", title: "Gift Exchange", emoji: "🎁", desc: "Exchange gifts with a Japanese friend",
      steps: [
        { npc: "Your friend gives you a box: はい、これ！プレゼントです！(Hai, kore! Purezento desu!) — Here! It's a present!", prompt: "React to the gift", choices: [
          { text: "ありがとうございます！これは なんですか？(Arigatou gozaimasu! Kore wa nan desuka?)", correct: true, reply: "あけてください！にほんの おかしですよ。(Akete kudasai! Nihon no okashi desu yo.) — Please open it! It's Japanese sweets." },
          { text: "いりません。(Irimasen.)", correct: false, reply: "え？！そんな... (E?! Sonna...) — What?! That's..." },
          { text: "これは わたしのですか？(Kore wa watashi no desuka?)", correct: false, reply: "はい！プレゼントですよ！(Hai! Purezento desu yo!) — Yes! It's a present!" },
        ]},
        { npc: "きにいりましたか？(Ki ni irimashitaka?) — Do you like it?", prompt: "Express your thanks", choices: [
          { text: "はい！とても すてきです。ありがとうございます！(Hai! Totemo suteki desu. Arigatou gozaimasu!)", correct: true, reply: "よかった！ニコラスさんの プレゼントも ありますか？(Yokatta! Nicholas-san no purezento mo arimasuka?) — Great! Do you have a present too?" },
          { text: "はい、そうです。(Hai, sou desu.)", correct: false, reply: "えっと... すきですか？(Etto... suki desuka?) — Um... do you like it?" },
          { text: "いいえ、ちがいます。(Iie, chigaimasu.)", correct: false, reply: "え？すきじゃないですか？(E? Suki jya nai desuka?) — Eh? You don't like it?" },
        ]},
      ],
    },
  ],
  3: [
    {
      id: "directions", title: "Finding the Bathroom", emoji: "🚻", desc: "Ask for directions in a department store",
      steps: [
        { npc: "You're on the 1st floor of a department store and need the bathroom.", prompt: "Ask for directions", choices: [
          { text: "すみません、トイレは どこですか？(Sumimasen, toire wa doko desuka?)", correct: true, reply: "トイレは 2かいです。エレベーターは あそこです。(Toire wa 2 kai desu. Erebeetaa wa asoko desu.) — The bathroom is on the 2nd floor. The elevator is over there." },
          { text: "ここは どこですか？(Koko wa doko desuka?)", correct: false, reply: "ここは 1かいです。デパートですよ。(Koko wa 1 kai desu. Depaato desu yo.) — This is the 1st floor. It's a department store." },
          { text: "トイレは なんですか？(Toire wa nan desuka?)", correct: false, reply: "トイレ is the bathroom! どこ = where ですよ。(Toire is the bathroom! Doko = where desu yo.)" },
        ]},
        { npc: "You're near the elevator. Someone asks: すみません、レストランは どこですか？(Sumimasen, resutoran wa doko desuka?)", prompt: "Help them find the restaurant", choices: [
          { text: "レストランは 5かいです。(Resutoran wa 5 kai desu.)", correct: true, reply: "5かい！ありがとうございます！(5 kai! Arigatou gozaimasu!) — 5th floor! Thank you!" },
          { text: "あそこです。(Asoko desu.)", correct: true, reply: "あそこ？ありがとう！(Asoko? Arigatou!) — Over there? Thanks!" },
          { text: "わかりません。(Wakarimasen.)", correct: false, reply: "そうですか… ありがとう。(Sou desuka... arigatou.) — I see... thanks anyway." },
        ]},
      ],
    },
    {
      id: "new-building", title: "New Building", emoji: "🏢", desc: "Navigate a new office building",
      steps: [
        { npc: "You arrive at a new office. A receptionist greets you: いらっしゃいませ！(Irasshaimase!)", prompt: "Ask where the meeting room is", choices: [
          { text: "すみません、かいぎしつは どこですか？(Sumimasen, kaigishitsu wa doko desuka?)", correct: true, reply: "かいぎしつは 3かいです。エレベーターは そこです。(Kaigishitsu wa 3 kai desu. Erebeetaa wa soko desu.) — The meeting room is on the 3rd floor. The elevator is there." },
          { text: "ここは なんかいですか？(Koko wa nan kai desuka?)", correct: true, reply: "ここは 1かいです。なにを さがしていますか？(Koko wa 1 kai desu. Nani wo sagashite imasuka?) — This is the 1st floor. What are you looking for?" },
          { text: "こんばんは。(Konbanwa.)", correct: false, reply: "こんにちは！まだ ひるですよ。(Konnichiwa! Mada hiru desu yo.) — Hello! It's still daytime." },
        ]},
        { npc: "かいだんと エレベーター、どちらがいいですか？(Kaidan to erebeetaa, dochira ga ii desuka?) — Stairs or elevator?", prompt: "Choose how to get there", choices: [
          { text: "エレベーターで おねがいします。(Erebeetaa de onegaishimasu.)", correct: true, reply: "はい、エレベーターは そこです。3かいです！(Hai, erebeetaa wa soko desu. 3 kai desu!) — Yes, the elevator is there. 3rd floor!" },
          { text: "かいだんで いきます。(Kaidan de ikimasu.)", correct: true, reply: "かいだんは あそこです。がんばって！(Kaidan wa asoko desu. Ganbatte!) — The stairs are over there. Good luck!" },
          { text: "トイレは どこですか？(Toire wa doko desuka?)", correct: false, reply: "トイレは 1かいの おくです。でも かいぎは？(Toire wa 1 kai no oku desu. Demo kaigi wa?) — Bathroom is at the back of 1st floor. But the meeting?" },
        ]},
      ],
    },
    {
      id: "hospital-visit", title: "Hospital Visit", emoji: "🏥", desc: "Find your way around a hospital",
      steps: [
        { npc: "You arrive at a big hospital. びょういんの うけつけで。(Byouin no uketsuke de.) — At the hospital reception.", prompt: "Ask where to go", choices: [
          { text: "すみません、ないかは どこですか？(Sumimasen, naika wa doko desuka?)", correct: true, reply: "ないかは 3かいです。エレベーターは あそこです。(Naika wa 3 kai desu. Erebeetaa wa asoko desu.) — Internal medicine is on the 3rd floor. Elevator is over there." },
          { text: "びょういんは どこですか？(Byouin wa doko desuka?)", correct: false, reply: "ここが びょういんですよ！(Koko ga byouin desu yo!) — This IS the hospital!" },
          { text: "レストランは どこですか？(Resutoran wa doko desuka?)", correct: false, reply: "レストランは ちかいに あります。でも... だいじょうぶですか？(Resutoran wa chikai ni arimasu. Demo... daijoubu desuka?) — Restaurant is in the basement. But... are you okay?" },
        ]},
        { npc: "3かいに つきました。(3 kai ni tsukimashita.) — You arrived at the 3rd floor. くすりは どこで もらいますか？(Kusuri wa doko de moraimasuka?) — Where do you get medicine?", prompt: "Ask about the pharmacy", choices: [
          { text: "すみません、やっきょくは なんがいですか？(Sumimasen, yakkyoku wa nan gai desuka?)", correct: true, reply: "やっきょくは 1かいです。かいだんの そばです。(Yakkyoku wa 1 kai desu. Kaidan no soba desu.) — Pharmacy is on the 1st floor, near the stairs." },
          { text: "くすりを たべます。(Kusuri wo tabemasu.)", correct: false, reply: "くすりは のみます、not たべます！(Kusuri wa nomimasu, not tabemasu!) — You TAKE medicine, not eat it!" },
          { text: "ここは どこですか？(Koko wa doko desuka?)", correct: false, reply: "3かいですよ。ないかです。(3 kai desu yo. Naika desu.) — It's the 3rd floor. Internal medicine." },
        ]},
      ],
    },
    {
      id: "train-station", title: "Train Station", emoji: "🚉", desc: "Navigate a busy train station",
      steps: [
        { npc: "おおきい えきに います。(Ookii eki ni imasu.) — You're at a big station.", prompt: "Ask for directions", choices: [
          { text: "すみません、きっぷうりばは どこですか？(Sumimasen, kippu uriba wa doko desuka?)", correct: true, reply: "きっぷうりばは あそこです。2ばんの でぐちの そばです。(Kippu uriba wa asoko desu. 2 ban no deguchi no soba desu.) — Ticket counter is over there, near Exit 2." },
          { text: "でんしゃは なんですか？(Densha wa nan desuka?)", correct: false, reply: "でんしゃは train ですよ！どこへ いきますか？(Densha wa train desu yo! Doko e ikimasuka?) — Train is... a train! Where are you going?" },
          { text: "ここは がっこうですか？(Koko wa gakkou desuka?)", correct: false, reply: "いいえ！えきですよ！(Iie! Eki desu yo!) — No! It's a train station!" },
        ]},
        { npc: "きっぷを かいました。(Kippu wo kaimashita.) — You bought a ticket. ホームは？(Hoomu wa?) — Which platform?", prompt: "Ask about the platform", choices: [
          { text: "とうきょうゆきの ホームは どこですか？(Toukyou yuki no hoomu wa doko desuka?)", correct: true, reply: "とうきょうは 3ばんホームです。かいだんを おりてください。(Toukyou wa 3 ban hoomu desu. Kaidan wo orite kudasai.) — Tokyo is platform 3. Please go down the stairs." },
          { text: "ここは なんかいですか？(Koko wa nan kai desuka?)", correct: false, reply: "えきは かいじゃないですよ。ホームを さがしますか？(Eki wa kai jya nai desu yo. Hoomu wo sagashimasuka?) — Station doesn't have floors like that. Looking for the platform?" },
          { text: "エレベーターは どこですか？(Erebeetaa wa doko desuka?)", correct: true, reply: "エレベーターは そこです。3ばんホームへ いけますよ。(Erebeetaa wa soko desu. 3 ban hoomu e ikemasu yo.) — Elevator is there. You can get to platform 3." },
        ]},
      ],
    },
  ],
  4: [
    {
      id: "schedule", title: "Work Schedule", emoji: "📅", desc: "Ask about a coworker's schedule",
      steps: [
        { npc: "You need to schedule a meeting with Tanaka-san at work.", prompt: "Ask what time they start", choices: [
          { text: "たなかさん、なんじに しごとを しますか？(Tanaka-san, nanji ni shigoto wo shimasuka?)", correct: true, reply: "わたしは ごぜん 9じから ごご 5じまでです。(Watashi wa gozen 9 ji kara gogo 5 ji made desu.) — I work from 9 AM to 5 PM." },
          { text: "いま なんじですか？(Ima nanji desuka?)", correct: false, reply: "いま 10じです。でも スケジュールの ことですか？(Ima 10 ji desu. Demo sukejuuru no koto desuka?) — It's 10 o'clock now. But are you asking about schedules?" },
          { text: "なんようびですか？(Nan youbi desuka?)", correct: false, reply: "きょうは げつようびです。(Kyou wa getsuyoubi desu.) — Today is Monday." },
        ]},
        { npc: "かいぎは なんようびが いいですか？(Kaigi wa nan youbi ga ii desuka?) — What day is good for a meeting?", prompt: "Suggest a day", choices: [
          { text: "すいようびは どうですか？(Suiyoubi wa dou desuka?)", correct: true, reply: "すいようび！いいですね。ごご 2じは？(Suiyoubi! Ii desu ne. Gogo 2 ji wa?) — Wednesday! Sounds good. How about 2 PM?" },
          { text: "きんようびに おねがいします。(Kinyoubi ni onegaishimasu.)", correct: true, reply: "きんようび！わかりました。なんじが いいですか？(Kinyoubi! Wakarimashita. Nanji ga ii desuka?) — Friday! Got it. What time is good?" },
          { text: "にちようび。(Nichiyoubi.)", correct: false, reply: "にちようびは やすみですよ！(Nichiyoubi wa yasumi desu yo!) — Sunday is a day off!" },
        ]},
      ],
    },
    {
      id: "appointment", title: "Making Plans", emoji: "🕐", desc: "Set up a meeting time",
      steps: [
        { npc: "A friend calls you: もしもし！あした ひまですか？(Moshi moshi! Ashita hima desuka?) — Hello! Are you free tomorrow?", prompt: "Respond and ask about time", choices: [
          { text: "はい、ひまです。なんじに あいますか？(Hai, hima desu. Nanji ni aimasuka?)", correct: true, reply: "ごご 3じは どうですか？(Gogo 3 ji wa dou desuka?) — How about 3 PM?" },
          { text: "いいえ、いそがしいです。(Iie, isogashii desu.)", correct: true, reply: "じゃあ、あさっては？(Jaa, asatte wa?) — Then how about the day after tomorrow?" },
          { text: "なんようびですか？(Nan youbi desuka?)", correct: false, reply: "あしたは もくようびですよ。ひま？(Ashita wa mokuyoubi desu yo. Hima?) — Tomorrow is Thursday. Are you free?" },
        ]},
        { npc: "ごご 3じに えきで あいましょう！(Gogo 3 ji ni eki de aimashou!) — Let's meet at 3 PM at the station!", prompt: "Confirm the plan", choices: [
          { text: "はい！ごご 3じに えきで あいましょう。(Hai! Gogo 3 ji ni eki de aimashou.)", correct: true, reply: "やった！じゃあ、また あした！(Yatta! Jaa, mata ashita!) — Yay! See you tomorrow then!" },
          { text: "ごぜん 3じ？(Gozen 3 ji?)", correct: false, reply: "ごぜんじゃない！ごご！PM！(Gozen jya nai! Gogo! PM!) — Not AM! PM!" },
          { text: "えきは どこですか？(Eki wa doko desuka?)", correct: false, reply: "とうきょうえきですよ！しっていますよね？(Toukyou eki desu yo! Shitte imasu yo ne?) — Tokyo station! You know it, right?" },
        ]},
      ],
    },
    {
      id: "dentist", title: "Dentist Appointment", emoji: "🦷", desc: "Schedule a dentist appointment",
      steps: [
        { npc: "はいしゃに でんわします。(Haisha ni denwa shimasu.) — You call the dentist. もしもし、ABCクリニックです。(Moshi moshi, ABC kurinikku desu.)", prompt: "Ask about available times", choices: [
          { text: "すみません、よやくを おねがいします。なんようびが あいていますか？(Sumimasen, yoyaku wo onegaishimasu. Nan youbi ga aite imasuka?)", correct: true, reply: "かようびと もくようびが あいています。なんじが いいですか？(Kayoubi to mokuyoubi ga aite imasu. Nanji ga ii desuka?) — Tuesday and Thursday are open. What time is good?" },
          { text: "はが いたいです。(Ha ga itai desu.)", correct: false, reply: "だいじょうぶですか？よやくは いつが いいですか？(Daijoubu desuka? Yoyaku wa itsu ga ii desuka?) — Are you okay? When would you like an appointment?" },
          { text: "なんじですか？(Nanji desuka?)", correct: false, reply: "いま 3じです。でも... よやくの ことですか？(Ima 3 ji desu. Demo... yoyaku no koto desuka?) — It's 3 o'clock now. But... are you asking about an appointment?" },
        ]},
        { npc: "かようびの ごぜんと ごご、どちらが いいですか？(Kayoubi no gozen to gogo, dochira ga ii desuka?) — Morning or afternoon on Tuesday?", prompt: "Choose a time", choices: [
          { text: "ごぜん 10じは ありますか？(Gozen 10 ji wa arimasuka?)", correct: true, reply: "はい！かようびの ごぜん 10じですね。おなまえを おねがいします。(Hai! Kayoubi no gozen 10 ji desu ne. Onamae wo onegaishimasu.) — Yes! Tuesday 10 AM then. Your name please." },
          { text: "ごご 2じに おねがいします。(Gogo 2 ji ni onegaishimasu.)", correct: true, reply: "ごご 2じ、かしこまりました。おなまえは？(Gogo 2 ji, kashikomarimashita. Onamae wa?) — 2 PM, understood. Your name?" },
          { text: "にちようびが いいです。(Nichiyoubi ga ii desu.)", correct: false, reply: "すみません、にちようびは やすみです。(Sumimasen, nichiyoubi wa yasumi desu.) — Sorry, we're closed on Sunday." },
        ]},
      ],
    },
    {
      id: "weekly-planner", title: "Weekly Planner", emoji: "📋", desc: "Plan your weekly schedule with a friend",
      steps: [
        { npc: "こんしゅうの スケジュールは？(Konshuu no sukejuuru wa?) — What's your schedule this week?", prompt: "Talk about your week", choices: [
          { text: "げつようびから きんようびまで しごとです。(Getsuyoubi kara kinyoubi made shigoto desu.)", correct: true, reply: "まいにち しごと！たいへんですね。しゅうまつは？(Mainichi shigoto! Taihen desu ne. Shuumatsu wa?) — Work every day! That's tough. What about the weekend?" },
          { text: "まいにち ひまです。(Mainichi hima desu.)", correct: false, reply: "ほんとうに？しごとは？(Hontou ni? Shigoto wa?) — Really? What about work?" },
          { text: "ごぜんです。(Gozen desu.)", correct: false, reply: "え？ごぜん is AM... こんしゅうは なにを しますか？(E? Gozen is AM... konshuu wa nani wo shimasuka?) — Eh? That's AM... what are you doing this week?" },
        ]},
        { npc: "どようびに いっしょに テニスを しませんか？(Doyoubi ni issho ni tenisu wo shimasenka?) — Shall we play tennis on Saturday?", prompt: "Respond to the invitation", choices: [
          { text: "いいですね！なんじに あいましょうか？(Ii desu ne! Nanji ni aimashouka?)", correct: true, reply: "ごぜん 10じは どうですか？(Gozen 10 ji wa dou desuka?) — How about 10 AM?" },
          { text: "どようびは やすみです。だから いきます。(Doyoubi wa yasumi desu. Dakara ikimasu.)", correct: true, reply: "やった！じゃあ ごぜん 10じに！(Yatta! Jaa gozen 10 ji ni!) — Yay! Then at 10 AM!" },
          { text: "にちようびは なんじですか？(Nichiyoubi wa nanji desuka?)", correct: false, reply: "にちようびじゃなくて どようびですよ！(Nichiyoubi jya nakute doyoubi desu yo!) — Not Sunday, Saturday!" },
        ]},
      ],
    },
  ],
  5: [
    {
      id: "travel", title: "Trip to Tokyo", emoji: "🚅", desc: "Plan a trip with a friend",
      steps: [
        { npc: "Your friend suggests: とうきょうへ いきませんか？(Toukyou e ikimasenka?) — Shall we go to Tokyo?", prompt: "Respond and ask about transportation", choices: [
          { text: "いいですね！なんで いきますか？でんしゃで？(Ii desu ne! Nan de ikimasuka? Densha de?)", correct: true, reply: "でんしゃで いきましょう！しんかんせんで いきます。(Densha de ikimashou! Shinkansen de ikimasu.) — Let's go by train! We'll take the shinkansen." },
          { text: "いきません。(Ikimasen.)", correct: false, reply: "え〜！どうして？たのしいですよ！(E~! Doushite? Tanoshii desu yo!) — Eh! Why? It'll be fun!" },
          { text: "とうきょうは どこですか？(Toukyou wa doko desuka?)", correct: false, reply: "え？にほんの しゅとですよ！(E? Nihon no shuto desu yo!) — Eh? It's the capital of Japan!" },
        ]},
        { npc: "だれと いきますか？(Dare to ikimasuka?) — Who will you go with?", prompt: "Answer who you're going with", choices: [
          { text: "ふたりで いきましょう！(Futari de ikimashou!)", correct: true, reply: "いいですね！にちようびに いきましょう！(Ii desu ne! Nichiyoubi ni ikimashou!) — Sounds good! Let's go on Sunday!" },
          { text: "ひとりで いきます。(Hitori de ikimasu.)", correct: false, reply: "ひとりで？わたしも いきたい！(Hitori de? Watashi mo ikitai!) — Alone? I want to go too!" },
          { text: "バスで いきます。(Basu de ikimasu.)", correct: false, reply: "バスじゃなくて… だれと？(Basu jya nakute... dare to?) — Not bus... WITH WHOM?" },
        ]},
      ],
    },
    {
      id: "birthday", title: "Birthday Party", emoji: "🎂", desc: "Plan a birthday celebration",
      steps: [
        { npc: "すずきさんの たんじょうびは いつですか？(Suzuki-san no tanjoubi wa itsu desuka?) — When is Suzuki's birthday?", prompt: "Answer about the birthday", choices: [
          { text: "すずきさんの たんじょうびは 3がつ15にちです。(Suzuki-san no tanjoubi wa 3 gatsu 15 nichi desu.)", correct: true, reply: "3がつ15にち！パーティーを しましょう！(3 gatsu 15 nichi! Paatii wo shimashou!) — March 15th! Let's have a party!" },
          { text: "きんようびです。(Kinyoubi desu.)", correct: false, reply: "きんようびは day of the week! いつ = what date？(Kinyoubi is day of week! Itsu = what date?)" },
          { text: "わかりません。(Wakarimasen.)", correct: false, reply: "きいてください！(Kiite kudasai!) — Please ask them!" },
        ]},
        { npc: "パーティーに なにで きますか？(Paatii ni nani de kimasuka?) — How will you come to the party?", prompt: "Say how you'll get there", choices: [
          { text: "タクシーで いきます。(Takushii de ikimasu.)", correct: true, reply: "いいですね！じゃあ ごご 6じに きてください！(Ii desu ne! Jaa gogo 6 ji ni kite kudasai!) — Nice! Then please come at 6 PM!" },
          { text: "でんしゃで きます。(Densha de kimasu.)", correct: true, reply: "でんしゃ！えきまで むかえに いきます！(Densha! Eki made mukae ni ikimasu!) — Train! I'll come pick you up at the station!" },
          { text: "ひとりで きます。(Hitori de kimasu.)", correct: false, reply: "ひとりで is 'alone'! なにで = by what transportation? (Hitori de is 'alone'! Nani de = by what transport?)" },
        ]},
      ],
    },
    {
      id: "airport", title: "Airport Journey", emoji: "✈️", desc: "Navigate an airport to catch your flight",
      steps: [
        { npc: "くうこうに つきました。(Kuukou ni tsukimashita.) — You arrived at the airport.", prompt: "Ask about your flight", choices: [
          { text: "すみません、とうきょうゆきの ひこうきは なんじですか？(Sumimasen, toukyou yuki no hikouki wa nanji desuka?)", correct: true, reply: "とうきょうゆきは ごご 3じです。ゲート 5ばんです。(Toukyou yuki wa gogo 3 ji desu. Geeto 5 ban desu.) — The Tokyo flight is at 3 PM. Gate 5." },
          { text: "ひこうきは どこですか？(Hikouki wa doko desuka?)", correct: false, reply: "ひこうきは そとですよ！まず チェックインを してください。(Hikouki wa soto desu yo! Mazu chekkuin wo shite kudasai.) — The plane is outside! First, check in." },
          { text: "でんしゃで いきます。(Densha de ikimasu.)", correct: false, reply: "でんしゃ？ここは くうこうですよ！ひこうきです！(Densha? Koko wa kuukou desu yo! Hikouki desu!) — Train? This is an airport! Airplane!" },
        ]},
        { npc: "ともだちが みおくりに きました。(Tomodachi ga miokuri ni kimashita.) — Your friend came to see you off.", prompt: "Say goodbye", choices: [
          { text: "ありがとう！また にほんに きます！(Arigatou! Mata nihon ni kimasu!)", correct: true, reply: "きをつけて！またね！(Ki wo tsukete! Mata ne!) — Take care! See you!" },
          { text: "いっしょに いきましょう！(Issho ni ikimashou!)", correct: false, reply: "え？チケットが ないですよ！(E? Chiketto ga nai desu yo!) — Eh? I don't have a ticket!" },
          { text: "なんじに かえりますか？(Nanji ni kaerimasuka?)", correct: false, reply: "わたしは かえりますよ。ニコラスさんが いくんです！(Watashi wa kaerimasu yo. Nicholas-san ga ikun desu!) — I'M going home. YOU'RE the one going!" },
        ]},
      ],
    },
    {
      id: "school-commute", title: "School Commute", emoji: "🚌", desc: "Talk about your daily commute",
      steps: [
        { npc: "まいにち がっこうへ なんで いきますか？(Mainichi gakkou e nan de ikimasuka?) — How do you go to school every day?", prompt: "Describe your commute", choices: [
          { text: "バスで いきます。30ぷん かかります。(Basu de ikimasu. 30 pun kakarimasu.)", correct: true, reply: "30ぷん！ちょっと ながいですね。だれと いきますか？(30 pun! Chotto nagai desu ne. Dare to ikimasuka?) — 30 minutes! That's a bit long. Who do you go with?" },
          { text: "でんしゃと バスで いきます。(Densha to basu de ikimasu.)", correct: true, reply: "でんしゃと バス！たいへんですね。なんじに でますか？(Densha to basu! Taihen desu ne. Nanji ni demasuka?) — Train and bus! That's tough. What time do you leave?" },
          { text: "ひこうきで いきます。(Hikouki de ikimasu.)", correct: false, reply: "ひこうきで がっこう？！(Hikouki de gakkou?!) — By plane to school?!" },
        ]},
        { npc: "なんじに うちを でますか？(Nanji ni uchi wo demasuka?) — What time do you leave home?", prompt: "Tell them your departure time", choices: [
          { text: "ごぜん 7じに でます。(Gozen 7 ji ni demasu.)", correct: true, reply: "はやいですね！わたしは 8じに でます。(Hayai desu ne! Watashi wa 8 ji ni demasu.) — That's early! I leave at 8." },
          { text: "ごぜん 8じはんに でます。(Gozen 8 ji han ni demasu.)", correct: true, reply: "8じはん！がっこうは なんじからですか？(8 ji han! Gakkou wa nanji kara desuka?) — 8:30! What time does school start?" },
          { text: "ごぜんに かえります。(Gozen ni kaerimasu.)", correct: false, reply: "かえります is 'return'! でます = leave ですよ。なんじに でますか？(Kaerimasu is return! Demasu = leave desu yo. Nanji ni demasuka?)" },
        ]},
      ],
    },
  ],
  6: [
    {
      id: "restaurant", title: "Ordering Food", emoji: "🍜", desc: "Order at a Japanese restaurant",
      steps: [
        { npc: "いらっしゃいませ！なにを たべますか？(Irasshaimase! Nani wo tabemasuka?) — Welcome! What would you like to eat?", prompt: "Order some food", choices: [
          { text: "すしを たべます。(Sushi wo tabemasu.)", correct: true, reply: "すし、いいですね！なにを のみますか？(Sushi, ii desu ne! Nani wo nomimasuka?) — Sushi, nice! What would you like to drink?" },
          { text: "ラーメンを たべます。(Raamen wo tabemasu.)", correct: true, reply: "ラーメン！なにを のみますか？(Raamen! Nani wo nomimasuka?) — Ramen! What would you like to drink?" },
          { text: "ほんを よみます。(Hon wo yomimasu.)", correct: false, reply: "え？ここは レストランですよ！たべものは？(E? Koko wa resutoran desu yo! Tabemono wa?) — Eh? This is a restaurant! Food?" },
        ]},
        { npc: "おのみものは？(Onomimono wa?) — And to drink?", prompt: "Order a drink", choices: [
          { text: "おちゃを おねがいします。(Ocha wo onegaishimasu.)", correct: true, reply: "おちゃですね。しょうしょう おまちください！(Ocha desu ne. Shoushou omachi kudasai!) — Tea, right. Please wait a moment!" },
          { text: "みずを のみます。(Mizu wo nomimasu.)", correct: true, reply: "おみず、どうぞ！(Omizu, douzo!) — Here's water!" },
          { text: "テレビを みます。(Terebi wo mimasu.)", correct: false, reply: "テレビ？のみもの ですよ！なにを のみますか？(Terebi? Nomimono desu yo! Nani wo nomimasuka?) — TV? We're talking about drinks! What do you want to drink?" },
        ]},
        { npc: "おかいけい、1200えんです。(Okaikei, 1200 en desu.) — The bill is 1200 yen.", prompt: "Finish the meal", choices: [
          { text: "ごちそうさまでした！(Gochisousama deshita!)", correct: true, reply: "ありがとうございました！またどうぞ！(Arigatou gozaimashita! Mata douzo!) — Thank you! Please come again!" },
          { text: "いただきます！(Itadakimasu!)", correct: false, reply: "もう たべおわりましたよ！いただきます is BEFORE eating! (You already finished! Itadakimasu is BEFORE eating!)" },
          { text: "さようなら。(Sayounara.)", correct: false, reply: "あ、まだ おかねが…！(A, mada okane ga...!) — Ah, you haven't paid yet...!" },
        ]},
      ],
    },
    {
      id: "weekend", title: "Weekend Plans", emoji: "🎌", desc: "Discuss weekend activities",
      steps: [
        { npc: "しゅうまつに なにを しますか？(Shuumatsu ni nani wo shimasuka?) — What are you doing this weekend?", prompt: "Talk about your weekend plans", choices: [
          { text: "どようびに えいがを みます。(Doyoubi ni eiga wo mimasu.)", correct: true, reply: "いいですね！だれと みますか？(Ii desu ne! Dare to mimasuka?) — Nice! Who will you watch it with?" },
          { text: "にちようびに ほんを よみます。(Nichiyoubi ni hon wo yomimasu.)", correct: true, reply: "にほんごの ほんですか？すごい！(Nihongo no hon desuka? Sugoi!) — A Japanese book? Amazing!" },
          { text: "げつようびに しごとを します。(Getsuyoubi ni shigoto wo shimasu.)", correct: false, reply: "げつようびは しゅうまつじゃないですよ！どようび・にちようび！(Getsuyoubi wa shuumatsu jya nai desu yo! Doyoubi/Nichiyoubi!) — Monday isn't the weekend! Saturday/Sunday!" },
        ]},
        { npc: "いっしょに カフェで コーヒーを のみませんか？(Issho ni kafe de koohii wo nomimasenka?) — Shall we drink coffee together at a cafe?", prompt: "Respond to the invitation", choices: [
          { text: "はい、のみましょう！(Hai, nomimashou!)", correct: true, reply: "やった！どようびの ごご 2じは？(Yatta! Doyoubi no gogo 2 ji wa?) — Yay! How about Saturday at 2 PM?" },
          { text: "いいですね！いきましょう。(Ii desu ne! Ikimashou.)", correct: true, reply: "じゃあ、どようびに あいましょう！(Jaa, doyoubi ni aimashou!) — Then let's meet on Saturday!" },
          { text: "コーヒーを たべます。(Koohii wo tabemasu.)", correct: false, reply: "コーヒーは のみます、not たべます！drink, not eat! (Coffee is nomimasu, not tabemasu!)" },
        ]},
      ],
    },
    {
      id: "cooking", title: "Cooking Together", emoji: "🍳", desc: "Cook a meal with a Japanese friend",
      steps: [
        { npc: "きょう いっしょに りょうりを しませんか？(Kyou issho ni ryouri wo shimasenka?) — Shall we cook together today?", prompt: "Respond and ask what to make", choices: [
          { text: "いいですね！なにを つくりますか？(Ii desu ne! Nani wo tsukurimasuka?)", correct: true, reply: "カレーを つくりましょう！やさいと にくを かいます。(Karee wo tsukurimashou! Yasai to niku wo kaimasu.) — Let's make curry! We'll buy vegetables and meat." },
          { text: "りょうりを たべます。(Ryouri wo tabemasu.)", correct: false, reply: "たべます じゃなくて つくりましょう！(Tabemasu jya nakute tsukurimashou!) — Not eat, let's COOK!" },
          { text: "いいえ、のみます。(Iie, nomimasu.)", correct: false, reply: "え？のみものじゃなくて りょうりですよ！(E? Nomimono jya nakute ryouri desu yo!) — Eh? Not drinks, cooking!" },
        ]},
        { npc: "カレーが できました！(Karee ga dekimashita!) — The curry is ready! いただきましょう。", prompt: "Start eating", choices: [
          { text: "いただきます！おいしそう！(Itadakimasu! Oishisou!)", correct: true, reply: "どうぞ！たくさん たべてください！(Douzo! Takusan tabete kudasai!) — Please! Eat a lot!" },
          { text: "ごちそうさまでした！(Gochisousama deshita!)", correct: false, reply: "まだ たべていませんよ！ごちそうさま is AFTER eating！(Mada tabete imasen yo! Gochisousama is AFTER eating!)" },
          { text: "コーヒーを のみます。(Koohii wo nomimasu.)", correct: false, reply: "まず カレーを たべましょう！(Mazu karee wo tabemashou!) — First let's eat the curry!" },
        ]},
      ],
    },
    {
      id: "study-session", title: "Study Session", emoji: "📝", desc: "Study Japanese with a language partner",
      steps: [
        { npc: "きょうは なにを べんきょうしますか？(Kyou wa nani wo benkyou shimasuka?) — What shall we study today?", prompt: "Suggest what to study", choices: [
          { text: "かんじを べんきょうしましょう！(Kanji wo benkyou shimashou!)", correct: true, reply: "いいですね！この かんじを よめますか？「食」(Ii desu ne! Kono kanji wo yomemasuka? 'Shoku') — Nice! Can you read this kanji? '食'" },
          { text: "にほんごの ほんを よみましょう。(Nihongo no hon wo yomimashou.)", correct: true, reply: "いいですね！この ほんは やさしいですよ。いっしょに よみましょう。(Ii desu ne! Kono hon wa yasashii desu yo. Issho ni yomimashou.) — Nice! This book is easy. Let's read together." },
          { text: "テレビを みます。(Terebi wo mimasu.)", correct: false, reply: "テレビ？べんきょうしましょうよ！(Terebi? Benkyou shimashou yo!) — TV? Let's study!" },
        ]},
        { npc: "じゃあ、テストを しましょう。「おはようございます」は えいごで？(Jaa, tesuto wo shimashou. 'Ohayou gozaimasu' wa eigo de?)", prompt: "Answer the test question", choices: [
          { text: "Good morning です！(Good morning desu!)", correct: true, reply: "すごい！せいかいです！つぎは？「すみません」は？(Sugoi! Seikai desu! Tsugi wa? 'Sumimasen' wa?) — Amazing! Correct! Next? What about 'sumimasen'?" },
          { text: "Good evening です。(Good evening desu.)", correct: false, reply: "おしい！Good evening は 「こんばんは」ですよ。(Oshii! Good evening wa 'konbanwa' desu yo.) — Close! Good evening is 'konbanwa'." },
          { text: "Thank you です。(Thank you desu.)", correct: false, reply: "Thank you は 「ありがとう」ですよ！(Thank you wa 'arigatou' desu yo!) — Thank you is 'arigatou'!" },
        ]},
      ],
    },
    {
      id: "sports-day", title: "Sports Day", emoji: "⚽", desc: "Participate in a company sports day",
      steps: [
        { npc: "きょうは うんどうかいです！なにを しますか？(Kyou wa undoukai desu! Nani wo shimasuka?) — Today is sports day! What will you do?", prompt: "Choose an activity", choices: [
          { text: "サッカーを します！(Sakkaa wo shimasu!)", correct: true, reply: "サッカー！いいですね！いっしょに しましょう！(Sakkaa! Ii desu ne! Issho ni shimashou!) — Soccer! Nice! Let's play together!" },
          { text: "えいがを みます。(Eiga wo mimasu.)", correct: false, reply: "うんどうかいですよ！スポーツを しましょう！(Undoukai desu yo! Supootsu wo shimashou!) — It's sports day! Let's do sports!" },
          { text: "ほんを よみます。(Hon wo yomimasu.)", correct: false, reply: "きょうは よむ じゃなくて うごく ひですよ！(Kyou wa yomu jya nakute ugoku hi desu yo!) — Today is for moving, not reading!" },
        ]},
        { npc: "つかれましたか？なにか のみますか？(Tsukaremashitaka? Nanika nomimasuka?) — Are you tired? Want something to drink?", prompt: "Ask for a drink", choices: [
          { text: "はい、みずを おねがいします。(Hai, mizu wo onegaishimasu.)", correct: true, reply: "はい、どうぞ！たくさん のんでください！(Hai, douzo! Takusan nonde kudasai!) — Here! Drink a lot!" },
          { text: "おちゃを のみましょう！(Ocha wo nomimashou!)", correct: true, reply: "おちゃ！いいですね。つめたい おちゃが ありますよ。(Ocha! Ii desu ne. Tsumetai ocha ga arimasu yo.) — Tea! Nice. We have cold tea." },
          { text: "ケーキを たべます。(Keeki wo tabemasu.)", correct: false, reply: "ケーキは ないですよ。のみものは？(Keeki wa nai desu yo. Nomimono wa?) — No cake here. How about a drink?" },
        ]},
      ],
    },
  ],
};

// ── SCENARIO VARIANTS (for replayability) ─────────────────────────────────────
const SCENARIO_VARIANTS = {
  names: ["たなか", "すずき", "やまだ", "さとう", "きむら", "わたなべ", "いとう", "なかむら"],
  foods: ["すし", "ラーメン", "カレー", "うどん", "そば", "てんぷら", "おにぎり", "やきにく"],
  drinks: ["おちゃ", "コーヒー", "ジュース", "みず", "ビール", "こうちゃ"],
  places: ["とうきょう", "おおさか", "きょうと", "よこはま", "ふくおか", "さっぽろ"],
};

const applyVariants = (text) => {
  let result = text;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  result = result.replace(/\{RAND_NAME\}/g, pick(SCENARIO_VARIANTS.names));
  result = result.replace(/\{RAND_FOOD\}/g, pick(SCENARIO_VARIANTS.foods));
  result = result.replace(/\{RAND_DRINK\}/g, pick(SCENARIO_VARIANTS.drinks));
  result = result.replace(/\{RAND_PLACE\}/g, pick(SCENARIO_VARIANTS.places));
  return result;
};

// ── JLPT N5 DATA ─────────────────────────────────────────────────────────────
const JLPT_N5 = {
  vocab: [
    // People & Family
    { q: "がくせい", opts: ["student", "teacher", "doctor", "worker"], a: 0 },
    { q: "せんせい", opts: ["student", "teacher", "doctor", "friend"], a: 1 },
    { q: "おとこのこ", opts: ["girl", "boy", "baby", "adult"], a: 1 },
    { q: "おんなのこ", opts: ["boy", "man", "girl", "woman"], a: 2 },
    { q: "おかあさん", opts: ["father", "mother", "sister", "brother"], a: 1 },
    { q: "おとうさん", opts: ["father", "mother", "uncle", "grandfather"], a: 0 },
    { q: "おにいさん", opts: ["younger brother", "older brother", "father", "friend"], a: 1 },
    { q: "おねえさん", opts: ["younger sister", "mother", "older sister", "aunt"], a: 2 },
    { q: "ともだち", opts: ["family", "friend", "teacher", "student"], a: 1 },
    { q: "こども", opts: ["adult", "child", "parent", "elderly"], a: 1 },
    // Food & Drink
    { q: "おいしい", opts: ["expensive", "delicious", "beautiful", "difficult"], a: 1 },
    { q: "たまご", opts: ["rice", "egg", "fish", "meat"], a: 1 },
    { q: "さかな", opts: ["meat", "vegetable", "fish", "fruit"], a: 2 },
    { q: "にく", opts: ["fish", "rice", "meat", "bread"], a: 2 },
    { q: "くだもの", opts: ["vegetable", "fruit", "meat", "drink"], a: 1 },
    { q: "やさい", opts: ["fruit", "vegetable", "rice", "noodles"], a: 1 },
    { q: "みず", opts: ["tea", "juice", "water", "milk"], a: 2 },
    { q: "ぎゅうにゅう", opts: ["water", "juice", "coffee", "milk"], a: 3 },
    { q: "おちゃ", opts: ["coffee", "tea", "water", "juice"], a: 1 },
    // Places
    { q: "がっこう", opts: ["hospital", "school", "station", "park"], a: 1 },
    { q: "びょういん", opts: ["school", "hospital", "library", "station"], a: 1 },
    { q: "えき", opts: ["park", "school", "station", "hospital"], a: 2 },
    { q: "こうえん", opts: ["park", "school", "hospital", "store"], a: 0 },
    { q: "としょかん", opts: ["school", "post office", "library", "bank"], a: 2 },
    { q: "ゆうびんきょく", opts: ["bank", "library", "hospital", "post office"], a: 3 },
    { q: "ぎんこう", opts: ["post office", "bank", "store", "school"], a: 1 },
    // Things
    { q: "でんしゃ", opts: ["bus", "taxi", "train", "airplane"], a: 2 },
    { q: "じどうしゃ", opts: ["bicycle", "car", "train", "bus"], a: 1 },
    { q: "でんわ", opts: ["television", "telephone", "radio", "computer"], a: 1 },
    { q: "テレビ", opts: ["telephone", "television", "radio", "computer"], a: 1 },
    { q: "しんぶん", opts: ["magazine", "book", "newspaper", "letter"], a: 2 },
    { q: "かさ", opts: ["hat", "bag", "umbrella", "shoe"], a: 2 },
    { q: "とけい", opts: ["clock/watch", "calendar", "phone", "camera"], a: 0 },
    // Adjectives
    { q: "たかい", opts: ["cheap", "low", "expensive/tall", "small"], a: 2 },
    { q: "やすい", opts: ["expensive", "cheap", "difficult", "easy"], a: 1 },
    { q: "あたらしい", opts: ["old", "new", "big", "small"], a: 1 },
    { q: "ふるい", opts: ["new", "old", "big", "small"], a: 1 },
    { q: "おおきい", opts: ["small", "tall", "big", "wide"], a: 2 },
    { q: "ちいさい", opts: ["big", "small", "tall", "short"], a: 1 },
    { q: "はやい", opts: ["slow", "late", "fast/early", "quiet"], a: 2 },
    { q: "おそい", opts: ["fast", "early", "slow/late", "quiet"], a: 2 },
    { q: "つめたい", opts: ["hot", "warm", "cold (thing)", "cold (weather)"], a: 2 },
    { q: "あつい", opts: ["cold", "cool", "hot/warm", "humid"], a: 2 },
    { q: "むずかしい", opts: ["easy", "difficult", "fun", "boring"], a: 1 },
    { q: "やさしい", opts: ["difficult", "easy/kind", "strict", "scary"], a: 1 },
    // Verbs
    { q: "たべます", opts: ["drink", "eat", "cook", "buy"], a: 1 },
    { q: "のみます", opts: ["eat", "drink", "pour", "cook"], a: 1 },
    { q: "いきます", opts: ["come", "go", "return", "walk"], a: 1 },
    { q: "きます", opts: ["go", "come", "return", "send"], a: 1 },
    { q: "かえります", opts: ["go", "come", "return home", "leave"], a: 2 },
    { q: "みます", opts: ["hear", "see/watch", "read", "write"], a: 1 },
    { q: "ききます", opts: ["see", "listen/hear", "read", "speak"], a: 1 },
    { q: "よみます", opts: ["write", "listen", "read", "speak"], a: 2 },
    { q: "かきます", opts: ["read", "draw/write", "erase", "speak"], a: 1 },
    { q: "はなします", opts: ["listen", "write", "read", "speak/talk"], a: 3 },
    { q: "かいます", opts: ["sell", "buy", "make", "use"], a: 1 },
    { q: "まちます", opts: ["run", "walk", "wait", "stand"], a: 2 },
    // Time & Adverbs
    { q: "しごと", opts: ["school", "hobby", "work/job", "home"], a: 2 },
    { q: "きのう", opts: ["today", "tomorrow", "yesterday", "next week"], a: 2 },
    { q: "きょう", opts: ["yesterday", "today", "tomorrow", "now"], a: 1 },
    { q: "あした", opts: ["yesterday", "today", "tomorrow", "next week"], a: 2 },
    { q: "まいにち", opts: ["sometimes", "always", "every day", "never"], a: 2 },
  ],
  grammar: [
    // Particles
    { q: "わたし＿＿がくせいです。", opts: ["は", "を", "に", "で"], a: 0 },
    { q: "にほんご＿＿べんきょうします。", opts: ["は", "を", "に", "で"], a: 1 },
    { q: "がっこう＿＿いきます。", opts: ["を", "が", "へ", "で"], a: 2 },
    { q: "バス＿＿いきます。", opts: ["を", "へ", "に", "で"], a: 3 },
    { q: "ともだち＿＿えいがを みます。", opts: ["を", "で", "と", "に"], a: 2 },
    { q: "この ほん は ＿＿＿ですか。", opts: ["だれ", "だれの", "なに", "どこ"], a: 1 },
    { q: "レストラン＿＿ひるごはんを たべます。", opts: ["を", "へ", "に", "で"], a: 3 },
    { q: "にほんご＿＿すきです。", opts: ["を", "が", "は", "に"], a: 1 },
    { q: "ともだち＿＿でんわを かけます。", opts: ["を", "で", "と", "に"], a: 3 },
    { q: "えき＿＿バスに のります。", opts: ["で", "を", "に", "へ"], a: 0 },
    // Verb forms
    { q: "きのう えいが を ＿＿＿。", opts: ["みます", "みました", "みません", "みる"], a: 1 },
    { q: "あした がっこう へ ＿＿＿。", opts: ["いきました", "いきます", "いった", "いかない"], a: 1 },
    { q: "まいにち コーヒー を ＿＿＿。", opts: ["たべます", "のみます", "ききます", "みます"], a: 1 },
    { q: "きのう なにも ＿＿＿。", opts: ["たべます", "たべました", "たべません", "たべませんでした"], a: 3 },
    { q: "にほんへ いき＿＿＿。", opts: ["たい です", "ます です", "ました です", "ない です"], a: 0 },
    { q: "いっしょに ＿＿＿か。", opts: ["たべます", "たべました", "たべません", "たべる"], a: 2 },
    { q: "あした ＿＿＿ましょう。", opts: ["あい", "あう", "あった", "あわ"], a: 0 },
    // Adjective conjugation
    { q: "この ケーキは ＿＿＿です。", opts: ["おいしい", "おいしく", "おいしくない", "おいしかった"], a: 0 },
    { q: "きのうは ＿＿＿です。", opts: ["さむい", "さむかった", "さむくない", "さむく"], a: 1 },
    { q: "あの えいがは ＿＿＿です。", opts: ["おもしろい", "おもしろかった", "おもしろくなかった", "おもしろく"], a: 0 },
    // Question words
    { q: "＿＿＿から きましたか。", opts: ["だれ", "なに", "どこ", "いつ"], a: 2 },
    { q: "パーティーは ＿＿＿ですか。", opts: ["だれ", "どこ", "いつ", "なに"], a: 2 },
    { q: "＿＿＿が いちばん すきですか。", opts: ["どこ", "いつ", "なに", "だれ"], a: 2 },
    // Connecting patterns
    { q: "あめ＿＿＿、いきません。", opts: ["だから", "でも", "そして", "それから"], a: 0 },
    { q: "ひるごはんを たべました。＿＿＿コーヒーを のみました。", opts: ["だから", "でも", "それから", "しかし"], a: 2 },
    { q: "たかいです。＿＿＿おいしいです。", opts: ["だから", "でも", "そして", "から"], a: 1 },
    // Existence & counting
    { q: "つくえの うえに ほんが ＿＿＿。", opts: ["います", "あります", "します", "きます"], a: 1 },
    { q: "こうえんに こどもが ＿＿＿。", opts: ["あります", "います", "します", "なります"], a: 1 },
    { q: "りんごを ＿＿＿ ください。", opts: ["みっつ", "さんこ", "さんつ", "みつ"], a: 0 },
    // Location
    { q: "ほんは つくえの ＿＿＿に あります。", opts: ["うえ", "した", "なか", "よこ"], a: 0 },
    { q: "ねこは いすの ＿＿＿に います。", opts: ["うえ", "した", "まえ", "うしろ"], a: 1 },
    // Comparison
    { q: "りんごと みかん＿＿＿どちらが すきですか。", opts: ["は", "が", "と", "も"], a: 2 },
    { q: "にほんごは えいご＿＿＿むずかしいです。", opts: ["は", "と", "が", "より"], a: 3 },
    // Misc
    { q: "テレビを み＿＿＿でんわが きました。", opts: ["て いたら", "て から", "ないで", "ながら"], a: 3 },
    { q: "しずか＿＿＿してください。", opts: ["で", "な", "に", "く"], a: 2 },
  ],
  kanji: [
    // Numbers
    { q: "一", opts: ["one", "two", "three", "ten"], a: 0, reading: "いち" },
    { q: "二", opts: ["one", "two", "three", "four"], a: 1, reading: "に" },
    { q: "三", opts: ["two", "three", "four", "five"], a: 1, reading: "さん" },
    { q: "四", opts: ["three", "four", "five", "six"], a: 1, reading: "し・よん" },
    { q: "五", opts: ["four", "five", "six", "seven"], a: 1, reading: "ご" },
    { q: "六", opts: ["five", "six", "seven", "eight"], a: 1, reading: "ろく" },
    { q: "七", opts: ["six", "seven", "eight", "nine"], a: 1, reading: "しち・なな" },
    { q: "八", opts: ["seven", "eight", "nine", "ten"], a: 1, reading: "はち" },
    { q: "九", opts: ["eight", "nine", "ten", "hundred"], a: 1, reading: "きゅう・く" },
    { q: "十", opts: ["nine", "ten", "hundred", "thousand"], a: 1, reading: "じゅう" },
    // Nature
    { q: "日", opts: ["moon", "day/sun", "fire", "water"], a: 1, reading: "にち・ひ" },
    { q: "月", opts: ["day", "moon/month", "star", "sky"], a: 1, reading: "げつ・つき" },
    { q: "火", opts: ["water", "wood", "fire", "earth"], a: 2, reading: "か・ひ" },
    { q: "水", opts: ["fire", "earth", "wind", "water"], a: 3, reading: "すい・みず" },
    { q: "木", opts: ["fire", "water", "tree/wood", "gold"], a: 2, reading: "もく・き" },
    { q: "金", opts: ["tree", "earth", "gold/money", "water"], a: 2, reading: "きん・かね" },
    { q: "土", opts: ["gold", "fire", "water", "earth/soil"], a: 3, reading: "ど・つち" },
    { q: "山", opts: ["river", "mountain", "forest", "sea"], a: 1, reading: "さん・やま" },
    { q: "川", opts: ["mountain", "river", "lake", "sea"], a: 1, reading: "せん・かわ" },
    // People
    { q: "人", opts: ["person", "child", "woman", "man"], a: 0, reading: "じん・ひと" },
    { q: "男", opts: ["woman", "man", "child", "person"], a: 1, reading: "だん・おとこ" },
    { q: "女", opts: ["man", "child", "woman", "person"], a: 2, reading: "じょ・おんな" },
    { q: "子", opts: ["person", "adult", "child", "parent"], a: 2, reading: "し・こ" },
    // Actions
    { q: "食", opts: ["drink", "eat", "see", "hear"], a: 1, reading: "しょく・たべる" },
    { q: "飲", opts: ["eat", "drink", "pour", "flow"], a: 1, reading: "いん・のむ" },
    { q: "見", opts: ["hear", "see/look", "read", "write"], a: 1, reading: "けん・みる" },
    { q: "行", opts: ["come", "go", "return", "walk"], a: 1, reading: "こう・いく" },
    { q: "来", opts: ["go", "come", "return", "send"], a: 1, reading: "らい・くる" },
    // School
    { q: "学", opts: ["teach", "study/learn", "read", "write"], a: 1, reading: "がく・まなぶ" },
    { q: "校", opts: ["temple", "school", "office", "store"], a: 1, reading: "こう" },
    { q: "先", opts: ["after", "before/ahead", "middle", "end"], a: 1, reading: "せん・さき" },
    { q: "生", opts: ["death", "life/birth", "age", "time"], a: 1, reading: "せい・いきる" },
  ],
  reading: [
    {
      text: "わたしは ニコラスです。カナダじんです。まいにち にほんごを べんきょうします。にほんの アニメが すきです。",
      questions: [
        { q: "ニコラスさんは なにじんですか？", opts: ["にほんじん", "カナダじん", "アメリカじん", "イギリスじん"], a: 1 },
        { q: "まいにち なにを しますか？", opts: ["しごと", "べんきょう", "うんどう", "りょうり"], a: 1 },
      ],
    },
    {
      text: "きのう ともだちと レストランへ いきました。すしを たべました。とても おいしかったです。",
      questions: [
        { q: "だれと いきましたか？", opts: ["ひとりで", "かぞくと", "ともだちと", "せんせいと"], a: 2 },
        { q: "なにを たべましたか？", opts: ["ラーメン", "すし", "カレー", "パン"], a: 1 },
      ],
    },
    {
      text: "あしたは にちようびです。ごぜん 10じに こうえんへ いきます。ごご ともだちの いえで えいがを みます。",
      questions: [
        { q: "あしたは なんようびですか？", opts: ["どようび", "にちようび", "げつようび", "きんようび"], a: 1 },
        { q: "ごごは なにを しますか？", opts: ["こうえんへ いく", "えいがを みる", "べんきょうする", "かいものする"], a: 1 },
      ],
    },
    {
      text: "わたしは まいあさ 7じに おきます。パンと たまごを たべます。それから コーヒーを のみます。8じに うちを でます。",
      questions: [
        { q: "なんじに おきますか？", opts: ["6じ", "7じ", "8じ", "9じ"], a: 1 },
        { q: "あさごはんの あと なにを のみますか？", opts: ["おちゃ", "みず", "ジュース", "コーヒー"], a: 3 },
        { q: "なんじに うちを でますか？", opts: ["7じ", "7じはん", "8じ", "9じ"], a: 2 },
      ],
    },
    {
      text: "やまださんへ\nきょうは ありがとうございました。パーティーは とても たのしかったです。ケーキも おいしかったです。また あいましょう。\nニコラスより",
      questions: [
        { q: "これは なんですか？", opts: ["にっき", "てがみ", "レポート", "メニュー"], a: 1 },
        { q: "パーティーは どうでしたか？", opts: ["つまらなかった", "たのしかった", "たいへんだった", "ながかった"], a: 1 },
      ],
    },
    {
      text: "わたしの まちには おおきい こうえんが あります。こうえんに きれいな はなが たくさん あります。にちようびに かぞくと こうえんへ いきます。こどもは こうえんが だいすきです。",
      questions: [
        { q: "こうえんに なにが ありますか？", opts: ["おみせ", "はな", "レストラン", "としょかん"], a: 1 },
        { q: "だれと こうえんへ いきますか？", opts: ["ともだち", "ひとりで", "かぞく", "せんせい"], a: 2 },
      ],
    },
    {
      text: "きょうの スケジュール：\nごぜん 9じ ～ 12じ：にほんごの じゅぎょう\n12じ ～ 1じ：ひるごはん\nごご 1じ ～ 3じ：としょかんで べんきょう\nごご 5じ：ともだちと えいが",
      questions: [
        { q: "にほんごの じゅぎょうは なんじかんですか？", opts: ["1じかん", "2じかん", "3じかん", "4じかん"], a: 2 },
        { q: "ごご としょかんで なにを しますか？", opts: ["ほんを よむ", "べんきょうする", "ともだちに あう", "ひるごはんを たべる"], a: 1 },
      ],
    },
    {
      text: "わたしは でんしゃで かいしゃへ いきます。うちから えきまで あるいて 10ぷんです。でんしゃは 30ぷんです。かいしゃは えきから 5ふんです。ぜんぶで 45ふん かかります。",
      questions: [
        { q: "なんで かいしゃへ いきますか？", opts: ["バス", "じどうしゃ", "でんしゃ", "じてんしゃ"], a: 2 },
        { q: "ぜんぶで なんぷん かかりますか？", opts: ["30ぷん", "40ぷん", "45ふん", "50ぷん"], a: 2 },
      ],
    },
  ],
};

// ── CONVERSATION SCENARIOS (AI-powered) ──────────────────────────────────────
const CONVERSATION_SCENARIOS = [
  { id: "meeting", title: "Meeting Someone New", emoji: "🤝", desc: "Introduce yourself to a new colleague", setting: "You arrive at your new workplace in Japan and meet a colleague in the hallway.", goal: "Introduce yourself and exchange basic information", character: "A Japanese colleague named Tanaka at your workplace", minLesson: 1 },
  { id: "restaurant", title: "Restaurant Order", emoji: "🍜", desc: "Order food at a Japanese restaurant", setting: "You sit down at a small ramen restaurant in Tokyo. The waiter approaches your table.", goal: "Successfully order a bowl of ramen and a drink", character: "A waiter at a ramen restaurant", minLesson: 1 },
  { id: "directions", title: "Asking Directions", emoji: "🗺️", desc: "Find your way to the train station", setting: "You are lost in a Japanese neighborhood and need to find the nearest train station.", goal: "Get directions to the train station", character: "A friendly local walking down the street", minLesson: 3 },
  { id: "train-ticket", title: "Buying a Ticket", emoji: "🚃", desc: "Buy a train ticket at the station", setting: "You are at a train station ticket counter in Japan.", goal: "Buy a ticket to your destination", character: "A ticket counter attendant at the train station", minLesson: 4 },
  { id: "shopping", title: "Convenience Store", emoji: "🏪", desc: "Buy something at a konbini", setting: "You walk into a convenience store (konbini) in Japan to buy a snack and a drink.", goal: "Successfully buy items and pay", character: "A convenience store clerk", minLesson: 2 },
  { id: "cafe", title: "Coffee Shop", emoji: "☕", desc: "Order at a Japanese cafe", setting: "You walk into a cozy coffee shop in Osaka.", goal: "Order a drink and find a seat", character: "A friendly barista at the coffee shop", minLesson: 2 },
];

// ── UTILITIES ─────────────────────────────────────────────────────────────────
const speak = (text, lang = "ja-JP") => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
};

const callAnthropic = async (system, messages) => {
  const resp = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
  });
  const data = await resp.json();
  if (data.error) throw new Error(data.error);
  return data.content?.[0]?.text || "すみません、もう一度お願いします。";
};

const ApiKeyPrompt = ({ onSave, title }) => (
  <div className="flex flex-col items-center justify-center gap-4 p-6 h-full">
    <div className="text-lg font-bold text-gray-800">{title || "🤖 AI Setup"}</div>
    <p className="text-sm text-gray-500 text-center max-w-xs">
      Enter your Anthropic API key. Stored locally on your device only.
    </p>
    <input
      id="api-key-input"
      type="password"
      placeholder="sk-ant-..."
      className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-red-400"
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target.value.trim()) onSave(e.target.value.trim());
      }}
    />
    <button
      onClick={() => {
        const el = document.getElementById("api-key-input");
        if (el && el.value.trim()) onSave(el.value.trim());
      }}
      className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
    >
      Save Key
    </button>
  </div>
);

// ── PROGRESS TRACKER HOOK ────────────────────────────────────────────────────
const useProgress = () => {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem("study_progress");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { version: 1, lessons: {}, jlpt: {} };
  });

  useEffect(() => {
    localStorage.setItem("study_progress", JSON.stringify(progress));
  }, [progress]);

  const markFlashKnown = (lessonId, cardIdx) => {
    setProgress((p) => {
      const l = p.lessons[lessonId] || { flash: { known: [] }, quiz: {}, stories: {} };
      const known = new Set(l.flash.known);
      known.add(cardIdx);
      return { ...p, lessons: { ...p.lessons, [lessonId]: { ...l, flash: { known: [...known] } } } };
    });
  };

  const getFlashKnown = (lessonId) => new Set(progress.lessons?.[lessonId]?.flash?.known || []);

  const recordQuizScore = (lessonId, score, total) => {
    setProgress((p) => {
      const l = p.lessons[lessonId] || { flash: { known: [] }, quiz: {}, stories: {} };
      const best = Math.max(l.quiz.bestScore || 0, score);
      return { ...p, lessons: { ...p.lessons, [lessonId]: { ...l, quiz: { bestScore: best, total, attempts: (l.quiz.attempts || 0) + 1 } } } };
    });
  };

  const recordStoryComplete = (lessonId, scenarioId, score, total) => {
    setProgress((p) => {
      const l = p.lessons[lessonId] || { flash: { known: [] }, quiz: {}, stories: {} };
      const completed = new Set(l.stories.completed || []);
      completed.add(scenarioId);
      const perfect = new Set(l.stories.perfect || []);
      if (score === total) perfect.add(scenarioId);
      return { ...p, lessons: { ...p.lessons, [lessonId]: { ...l, stories: { completed: [...completed], perfect: [...perfect] } } } };
    });
  };

  const getStoryStatus = (lessonId, scenarioId) => {
    const l = progress.lessons?.[lessonId]?.stories || {};
    return {
      completed: (l.completed || []).includes(scenarioId),
      perfect: (l.perfect || []).includes(scenarioId),
    };
  };

  const recordJlptScore = (section, score, total) => {
    setProgress((p) => {
      const j = p.jlpt[section] || {};
      const best = Math.max(j.bestScore || 0, score);
      return { ...p, jlpt: { ...p.jlpt, [section]: { bestScore: best, total, attempts: (j.attempts || 0) + 1 } } };
    });
  };

  const getLessonPercent = (lessonId, totalCards) => {
    const l = progress.lessons?.[lessonId] || {};
    const flashPct = totalCards > 0 ? ((l.flash?.known?.length || 0) / totalCards) * 100 : 0;
    const quizPct = l.quiz?.total ? (l.quiz.bestScore / l.quiz.total) * 100 : 0;
    return Math.round((flashPct + quizPct) / 2);
  };

  const getJlptPercent = () => {
    const sections = ["vocab", "grammar", "kanji", "reading"];
    let total = 0, count = 0;
    sections.forEach((s) => {
      if (progress.jlpt[s]?.total) {
        total += (progress.jlpt[s].bestScore / progress.jlpt[s].total) * 100;
        count++;
      }
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  const recordListeningScore = (lessonId, score, total) => {
    setProgress((p) => {
      const l = p.lessons[lessonId] || { flash: { known: [] }, quiz: {}, stories: {}, listening: {} };
      const best = Math.max(l.listening?.bestScore || 0, score);
      return { ...p, lessons: { ...p.lessons, [lessonId]: { ...l, listening: { bestScore: best, total, attempts: (l.listening?.attempts || 0) + 1 } } } };
    });
  };

  const recordConversationComplete = (scenarioId) => {
    setProgress((p) => {
      const convos = p.conversations || {};
      const existing = convos[scenarioId] || { completed: false, attempts: 0 };
      return { ...p, conversations: { ...convos, [scenarioId]: { completed: true, attempts: existing.attempts + 1 } } };
    });
  };

  const resetProgress = () => {
    setProgress({ version: 1, lessons: {}, jlpt: {}, conversations: {} });
    localStorage.removeItem("study_progress");
  };

  return { progress, markFlashKnown, getFlashKnown, recordQuizScore, recordListeningScore, recordStoryComplete, getStoryStatus, recordJlptScore, recordConversationComplete, getLessonPercent, getJlptPercent, resetProgress };
};

// ── TIME TRACKER HOOK ────────────────────────────────────────────────────────
const useTimeTracker = () => {
  const [timeData, setTimeData] = useState(() => {
    try {
      const saved = localStorage.getItem("study_time");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { sessions: [], totalMinutes: 0 };
  });

  const save = useCallback((data) => {
    localStorage.setItem("study_time", JSON.stringify(data));
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const interval = setInterval(() => {
      setTimeData((prev) => {
        const sessions = [...prev.sessions];
        const todayIdx = sessions.findIndex((s) => s.date === today);
        if (todayIdx >= 0) {
          sessions[todayIdx] = { ...sessions[todayIdx], minutes: sessions[todayIdx].minutes + 1 };
        } else {
          sessions.push({ date: today, minutes: 1 });
        }
        // prune older than 90 days
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        const cutoffStr = cutoff.toISOString().slice(0, 10);
        const pruned = sessions.filter((s) => s.date >= cutoffStr);
        const totalMinutes = pruned.reduce((sum, s) => sum + s.minutes, 0);
        const next = { sessions: pruned, totalMinutes };
        save(next);
        return next;
      });
    }, 60000);

    // save on visibility change (critical for iOS Safari)
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        const current = JSON.parse(localStorage.getItem("study_time") || "{}");
        if (current.sessions) save(current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [save]);

  const today = new Date().toISOString().slice(0, 10);
  const todayMinutes = timeData.sessions.find((s) => s.date === today)?.minutes || 0;

  // calculate streak
  let streak = 0;
  const sortedDates = timeData.sessions.map((s) => s.date).sort().reverse();
  if (sortedDates.length > 0) {
    const d = new Date();
    const todayStr = d.toISOString().slice(0, 10);
    // check if studied today or yesterday to start streak
    if (sortedDates[0] === todayStr || sortedDates[0] === new Date(d.setDate(d.getDate() - 1)).toISOString().slice(0, 10)) {
      let checkDate = new Date(sortedDates[0]);
      const dateSet = new Set(sortedDates);
      while (dateSet.has(checkDate.toISOString().slice(0, 10))) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }
  }

  // last 7 days for chart
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const session = timeData.sessions.find((s) => s.date === dateStr);
    last7.push({ date: dateStr, day: d.toLocaleDateString("en", { weekday: "short" }), minutes: session?.minutes || 0 });
  }

  const thisWeekMinutes = last7.reduce((sum, d) => sum + d.minutes, 0);

  return { todayMinutes, streak, thisWeekMinutes, totalMinutes: timeData.totalMinutes, last7 };
};

// ── SYNC TO SERVER HOOK ──────────────────────────────────────────────────────
const useSyncToServer = (userId) => {
  useEffect(() => {
    if (!userId || userId === "local") return;
    const sync = () => {
      try {
        const progress = JSON.parse(localStorage.getItem("study_progress") || "{}");
        const timeData = JSON.parse(localStorage.getItem("study_time") || "{}");
        fetch("/api/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", userId, progress, timeData }),
        }).catch(() => {});
      } catch {}
    };
    const interval = setInterval(sync, 30000);
    const handleVisibility = () => { if (document.visibilityState === "hidden") sync(); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", handleVisibility); sync(); };
  }, [userId]);
};

// ── PROFILE SCREEN ───────────────────────────────────────────────────────────
const ProfileScreen = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const skipLogin = () => {
    localStorage.setItem("current_user", JSON.stringify({ id: "local", username: "Guest" }));
    onLogin({ id: "local", username: "Guest" });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans max-w-lg mx-auto">
      <div className="bg-red-600 text-white px-4 py-3 text-center">
        <div className="font-bold text-lg">日本語 Study</div>
        <div className="text-xs text-red-200">Japanese Study App</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="text-5xl mb-3">🇯🇵</div>
            <div className="text-lg font-bold text-gray-800">Welcome!</div>
            <div className="text-sm text-gray-500 mt-1">Sign in to sync your progress across devices</div>
          </div>
          <button onClick={handleGoogleLogin} disabled={loading}
            className="w-full bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-center gap-3 hover:border-red-300 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-semibold text-gray-700">{loading ? "Redirecting..." : "Sign in with Google"}</span>
          </button>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button onClick={skipLogin} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-2">Continue as Guest (no cloud sync)</button>
        </div>
      </div>
    </div>
  );
};

// ── MODE CONSTANTS ────────────────────────────────────────────────────────────
const MODE_TILES = [
  { id: "learn", name: "Learn", icon: "📚", color: "from-indigo-500 to-purple-600", desc: "Study words & grammar first",
    statFn: (p, l) => `${Object.keys(l).length} lessons available` },
  { id: "flash", name: "Flashcards", icon: "🃏", color: "from-rose-500 to-red-600", desc: "Learn vocab & grammar cards",
    statFn: (p, l) => { let k = 0, t = 0; Object.keys(l).forEach((id) => { t += l[id].vocab.length + l[id].grammar.length; k += p.lessons?.[id]?.flash?.known?.length || 0; }); return `${k}/${t} cards known`; } },
  { id: "quiz", name: "Quiz", icon: "❓", color: "from-amber-500 to-orange-600", desc: "Test your knowledge",
    statFn: (p, l) => { const a = Object.keys(l).filter((id) => p.lessons?.[id]?.quiz?.bestScore != null).length; return `${a}/${Object.keys(l).length} lessons attempted`; } },
  { id: "speak", name: "Speaking", icon: "🎤", color: "from-blue-500 to-indigo-600", desc: "Practice pronunciation",
    statFn: () => "Record & compare" },
  { id: "stories", name: "Stories", icon: "📖", color: "from-purple-500 to-violet-600", desc: "Choose-your-own-adventure",
    statFn: (p, l) => { let c = 0, t = 0; Object.keys(l).forEach((id) => { t += (SCENARIOS[id] || []).length; c += p.lessons?.[id]?.stories?.completed?.length || 0; }); return `${c}/${t} scenarios done`; } },
  { id: "listen", name: "Listening", icon: "👂", color: "from-cyan-500 to-sky-600", desc: "Hear & type what you hear",
    statFn: (p, l) => { const a = Object.keys(l).filter((id) => p.lessons?.[id]?.listening?.bestScore != null).length; return `${a}/${Object.keys(l).length} lessons attempted`; } },
  { id: "chat", name: "Sensei", icon: "🧑‍🏫", color: "from-emerald-500 to-teal-600", desc: "Your personal Japanese tutor",
    statFn: () => "Powered by Gemini" },
  { id: "convo", name: "Conversations", icon: "💬", color: "from-green-500 to-emerald-600", desc: "Real-life AI roleplay",
    statFn: (p) => { const c = Object.keys(p.conversations || {}).filter((id) => p.conversations[id]?.completed).length; return `${c}/${CONVERSATION_SCENARIOS.length} completed`; } },
];

const MODE_META = {
  learn: { name: "Learn", icon: "📚", color: "text-indigo-600", bg: "bg-indigo-50" },
  flash: { name: "Flashcards", icon: "🃏", color: "text-red-600", bg: "bg-red-50" },
  quiz: { name: "Quiz", icon: "❓", color: "text-orange-600", bg: "bg-orange-50" },
  speak: { name: "Speaking", icon: "🎤", color: "text-blue-600", bg: "bg-blue-50" },
  stories: { name: "Stories", icon: "📖", color: "text-purple-600", bg: "bg-purple-50" },
  listen: { name: "Listening", icon: "👂", color: "text-sky-600", bg: "bg-sky-50" },
  chat: { name: "Sensei", icon: "🧑‍🏫", color: "text-teal-600", bg: "bg-teal-50" },
  convo: { name: "Conversations", icon: "💬", color: "text-green-600", bg: "bg-green-50" },
};

// ── LEARN MODE (guided walkthrough) ──────────────────────────────────────────
const LEARN_EMOJIS = ["🎌", "✨", "🌸", "💡", "📝", "🗾", "🎯", "🧠", "🌟", "📖", "🔤", "🎓", "💬", "🗣️"];
const LearnMode = ({ lesson }) => {
  const allItems = [
    ...lesson.vocab.map((v) => ({ ...v, type: "vocab" })),
    ...lesson.grammar.map((g) => ({ ...g, type: "grammar" })),
  ];
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const item = allItems[idx];
  const progress = ((idx + 1) / allItems.length) * 100;
  const isVocab = item?.type === "vocab";
  const sectionLabel = isVocab ? "VOCABULARY" : "GRAMMAR PATTERN";

  const gradients = [
    "from-indigo-500 to-purple-600", "from-rose-500 to-pink-600", "from-cyan-500 to-blue-600",
    "from-amber-500 to-orange-600", "from-emerald-500 to-teal-600", "from-violet-500 to-fuchsia-600",
  ];
  const gradient = gradients[idx % gradients.length];
  const emoji = LEARN_EMOJIS[idx % LEARN_EMOJIS.length];

  if (done) return (
    <div className="p-4 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
      <div className="text-5xl mb-2">🎉</div>
      <div className="font-bold text-xl text-gray-800">Lesson Complete!</div>
      <div className="text-sm text-gray-500">You learned {lesson.vocab.length} words and {lesson.grammar.length} grammar patterns.</div>
      <div className="text-sm text-gray-400 mt-2">Now try Flashcards or Quiz to test yourself!</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{sectionLabel}</span>
          <span>{idx + 1} / {allItems.length}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Visual card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`w-full bg-gradient-to-br ${gradient} rounded-3xl p-6 text-white shadow-xl relative overflow-hidden`}>
          <div className="absolute top-4 right-4 text-4xl opacity-30">{emoji}</div>
          <div className="text-xs uppercase tracking-wider opacity-70 mb-4">{isVocab ? "Word" : "Pattern"}</div>
          <div className="text-4xl font-bold mb-3 leading-tight">{item.jp}</div>
          <div className="text-lg opacity-90 mb-1">{item.roma}</div>
          <div className="h-px bg-white/30 my-4" />
          <div className="text-xl font-semibold">{item.en}</div>
          {!isVocab && (
            <div className="mt-3 bg-white/15 rounded-xl p-3 text-sm opacity-90">
              <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Example</div>
              <div>{item.jp.replace(/\{[^}]+\}/g, "___")}</div>
            </div>
          )}
          <button onClick={() => speak(item.jp)} className="mt-4 flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2 text-sm transition-colors">
            <span>🔊</span> Listen
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 flex gap-2">
        {idx > 0 && (
          <button onClick={() => setIdx((i) => i - 1)} className="px-6 py-3 bg-gray-100 rounded-xl font-medium text-gray-600 hover:bg-gray-200">← Back</button>
        )}
        <button onClick={() => idx + 1 >= allItems.length ? setDone(true) : setIdx((i) => i + 1)}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
          {idx + 1 >= allItems.length ? "Finish! 🎉" : "Next →"}
        </button>
      </div>
    </div>
  );
};

// ── FLASHCARDS ────────────────────────────────────────────────────────────────
const Flashcards = ({ lesson, lessonId, markFlashKnown, getFlashKnown }) => {
  const allCards = [
    ...lesson.vocab.map((v) => ({ front: v.jp, back: v.en, roma: v.roma })),
    ...lesson.grammar.map((g) => ({ front: g.jp, back: g.en, roma: g.roma })),
  ];
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const known = getFlashKnown ? getFlashKnown(lessonId) : new Set();
  const card = allCards[idx];

  const next = (mark) => {
    if (mark && markFlashKnown) markFlashKnown(lessonId, idx);
    setFlipped(false);
    setTimeout(() => setIdx((i) => (i + 1) % allCards.length), 120);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="text-sm text-gray-500">
        {idx + 1} / {allCards.length} · {known.size} known
      </div>
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer w-full max-w-sm rounded-2xl shadow-lg border border-gray-200 bg-white min-h-44 flex flex-col items-center justify-center p-6 select-none transition-all active:scale-95"
      >
        {!flipped ? (
          <>
            <div className="text-3xl font-bold text-gray-800 mb-2">{card.front}</div>
            <div className="text-xs text-gray-400">{card.roma}</div>
            <div className="mt-4 text-xs text-gray-400">tap to reveal</div>
          </>
        ) : (
          <>
            <div className="text-2xl font-semibold text-red-600 mb-1">{card.back}</div>
            <div className="text-sm text-gray-500">{card.roma}</div>
            <button onClick={(e) => { e.stopPropagation(); speak(card.front); }} className="mt-3 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium hover:bg-red-100">
              🔊 Listen
            </button>
          </>
        )}
      </div>
      <div className="flex gap-3 w-full max-w-sm">
        <button onClick={() => next(false)} className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">🔁 Again</button>
        <button onClick={() => next(true)} className="flex-1 py-2 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600">✓ Got it</button>
      </div>
    </div>
  );
};

// ── QUIZ ──────────────────────────────────────────────────────────────────────
const Quiz = ({ lesson, lessonId, recordQuizScore }) => {
  const pool = lesson.vocab;
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [finished, setFinished] = useState(false);
  const [questions, setQuestions] = useState([]);

  const buildQuestions = useCallback(() => {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(8, pool.length));
    return shuffled.map((item) => {
      const wrongs = pool.filter((v) => v.en !== item.en).sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [...wrongs, item].sort(() => Math.random() - 0.5);
      return { question: item.jp, roma: item.roma, answer: item.en, options: options.map((o) => o.en) };
    });
  }, [pool]);

  useEffect(() => { setQuestions(buildQuestions()); }, [buildQuestions]);
  const q = questions[qIdx];
  const handleAnswer = (opt) => { if (chosen) return; setChosen(opt); if (opt === q.answer) { setScore((s) => s + 1); speak(q.question); } };
  const next = () => { if (qIdx + 1 >= questions.length) { setFinished(true); return; } setChosen(null); setQIdx((i) => i + 1); };
  useEffect(() => { if (finished && recordQuizScore) recordQuizScore(lessonId, score, questions.length); }, [finished]);
  const restart = () => { setQuestions(buildQuestions()); setQIdx(0); setScore(0); setChosen(null); setFinished(false); };

  if (!q) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (finished) return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="text-5xl">{score >= questions.length * 0.8 ? "🎉" : "📚"}</div>
      <div className="text-2xl font-bold text-gray-800">Quiz Complete!</div>
      <div className="text-lg text-gray-600">{score} / {questions.length} correct</div>
      <div className="text-sm text-gray-500">
        {score === questions.length ? "Perfect! すごい！" : score >= questions.length * 0.8 ? "Great job! がんばって！" : "Keep practicing! もう一度！"}
      </div>
      <button onClick={restart} className="px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">Try Again</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 max-w-sm mx-auto">
      <div className="flex justify-between text-sm text-gray-500"><span>Q {qIdx + 1} / {questions.length}</span><span>⭐ {score}</span></div>
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 text-center">
        <div className="text-3xl font-bold text-gray-800 mb-1">{q.question}</div>
        <div className="text-sm text-gray-400">{q.roma}</div>
        <button onClick={() => speak(q.question)} className="mt-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs hover:bg-red-100">🔊 Listen</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt) => {
          let cls = "p-3 rounded-xl border text-sm font-medium text-center transition-all ";
          if (!chosen) cls += "bg-white border-gray-200 hover:border-red-400 hover:bg-red-50 cursor-pointer";
          else if (opt === q.answer) cls += "bg-green-100 border-green-500 text-green-700";
          else if (opt === chosen) cls += "bg-red-100 border-red-400 text-red-700";
          else cls += "bg-gray-50 border-gray-200 text-gray-400";
          return <button key={opt} className={cls} onClick={() => handleAnswer(opt)}>{opt}</button>;
        })}
      </div>
      {chosen && <button onClick={next} className="py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700">Next →</button>}
    </div>
  );
};

// ── LISTENING COMPREHENSION ──────────────────────────────────────────────────
const Listening = ({ lesson, lessonId, recordListeningScore }) => {
  const [difficulty, setDifficulty] = useState(null);
  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const normalize = (s) => s.replace(/[\s\u3000、。！？・〜ー\-\.,:;'"!?(){}\[\]]/g, "").toLowerCase().trim();

  const startSession = (diff) => {
    let items = diff === "vocab" ? [...lesson.vocab] : diff === "phrases" ? [...lesson.grammar] : [...lesson.vocab, ...lesson.grammar];
    for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; }
    setPool(items.slice(0, Math.min(10, items.length)));
    setDifficulty(diff);
    setIdx(0); setScore(0); setInput(""); setSubmitted(false); setFinished(false);
  };

  const playAudio = (text, rate) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ja-JP";
    utt.rate = rate || (difficulty === "speed" ? 1.3 : 0.8);
    window.speechSynthesis.speak(utt);
  };

  useEffect(() => { if (pool.length > 0 && !finished && !submitted) playAudio(pool[idx]?.jp); }, [idx, pool]);

  const checkAnswer = () => {
    if (!input.trim()) return;
    const item = pool[idx];
    const ni = normalize(input);
    const correct = normalize(item.en) === ni;
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
    setSubmitted(true);
  };

  const next = () => {
    if (idx + 1 >= pool.length) {
      const finalScore = score + (isCorrect ? 0 : 0); // score already updated
      setFinished(true);
      if (recordListeningScore) recordListeningScore(lessonId, score, pool.length);
    } else {
      setIdx((i) => i + 1);
      setInput(""); setSubmitted(false); setIsCorrect(false);
    }
  };

  if (!difficulty) return (
    <div className="p-4 space-y-3">
      <div className="text-center py-6">
        <div className="text-4xl mb-2">👂</div>
        <div className="font-bold text-lg text-gray-800">Listening Practice</div>
        <div className="text-sm text-gray-500 mt-1">Listen and type the English meaning</div>
      </div>
      {[
        { id: "vocab", label: "Vocabulary", desc: "Single words", icon: "📝", count: lesson.vocab.length },
        { id: "phrases", label: "Grammar Phrases", desc: "Full sentences", icon: "💬", count: lesson.grammar.length },
        { id: "speed", label: "Speed Round", desc: "All items, faster audio", icon: "⚡", count: lesson.vocab.length + lesson.grammar.length },
      ].map((d) => (
        <button key={d.id} onClick={() => startSession(d.id)} className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-all border border-gray-100">
          <div className="text-2xl">{d.icon}</div>
          <div className="flex-1 text-left">
            <div className="font-semibold text-gray-800">{d.label}</div>
            <div className="text-xs text-gray-500">{d.desc} · {d.count} items</div>
          </div>
          <span className="text-gray-400">→</span>
        </button>
      ))}
    </div>
  );

  if (finished) return (
    <div className="p-4 text-center space-y-4">
      <div className="text-5xl mb-2">{score === pool.length ? "🎉" : score >= pool.length * 0.7 ? "👏" : "💪"}</div>
      <div className="font-bold text-2xl text-gray-800">{score}/{pool.length}</div>
      <div className="text-gray-500">{score === pool.length ? "Perfect hearing!" : score >= pool.length * 0.7 ? "Great listening!" : "Keep practicing!"}</div>
      <div className="flex gap-2">
        <button onClick={() => setDifficulty(null)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium text-gray-700 hover:bg-gray-200">Change Difficulty</button>
        <button onClick={() => startSession(difficulty)} className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700">Try Again</button>
      </div>
    </div>
  );

  const item = pool[idx];
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">{idx + 1} / {pool.length}</span>
        <span className="text-xs font-medium text-sky-600">{score} correct</span>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-4">
        <button onClick={() => playAudio(item.jp)} className="w-20 h-20 rounded-full bg-sky-100 text-sky-600 text-3xl flex items-center justify-center mx-auto hover:bg-sky-200 transition-colors active:scale-95">
          🔊
        </button>
        <div className="text-sm text-gray-500">{difficulty === "speed" ? "Listen carefully — fast mode!" : "Tap to replay"}</div>
        {submitted && (
          <div className={`rounded-xl p-4 ${isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
            <div className="font-bold text-lg">{item.jp}</div>
            <div className="text-sm text-gray-600">{item.roma}</div>
            <div className="text-sm text-gray-500 mt-1">{item.en}</div>
            <div className={`text-sm font-semibold mt-2 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
              {isCorrect ? "Correct! ✓" : `Not quite — you typed "${input}"`}
            </div>
          </div>
        )}
      </div>
      {!submitted ? (
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            placeholder="Type the English meaning..." autoFocus
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-sky-400" />
          <button onClick={checkAnswer} disabled={!input.trim()} className="px-5 py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700 disabled:opacity-40">Check</button>
        </div>
      ) : (
        <button onClick={next} className="w-full py-3 bg-sky-600 text-white rounded-xl font-medium hover:bg-sky-700">
          {idx + 1 >= pool.length ? "See Results" : "Next →"}
        </button>
      )}
    </div>
  );
};

// ── SPEAKING ──────────────────────────────────────────────────────────────────
const Speaking = ({ lesson }) => {
  const phrases = [...lesson.grammar.map((g) => ({ jp: g.jp, roma: g.roma, en: g.en })), ...lesson.vocab];
  const [idx, setIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [transcript, setTranscript] = useState("");
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);
  const phrase = phrases[idx];

  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Full cleanup helper
  const cleanup = () => {
    if (recorderRef.current?.state === "recording") { try { recorderRef.current.stop(); } catch {} }
    recorderRef.current = null;
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} recognitionRef.current = null; }
    setRecording(false);
  };

  // Cleanup on unmount
  useEffect(() => { return cleanup; }, []);

  const normalize = (s) => s.replace(/[\s\u3000、。！？・〜ー]/g, "").toLowerCase();
  const getMatch = () => {
    if (!transcript) return null;
    const target = normalize(phrase.jp);
    const said = normalize(transcript);
    if (!target || !said) return null;
    if (said === target) return { pct: 100, label: "Perfect!", color: "text-green-600", bg: "bg-green-50" };
    let hits = 0;
    const tChars = [...target];
    const sChars = [...said];
    const used = new Set();
    for (const c of sChars) {
      const i = tChars.findIndex((t, j) => t === c && !used.has(j));
      if (i !== -1) { hits++; used.add(i); }
    }
    const pct = Math.round((hits / Math.max(tChars.length, 1)) * 100);
    if (pct >= 80) return { pct, label: "Great!", color: "text-green-600", bg: "bg-green-50" };
    if (pct >= 50) return { pct, label: "Good try!", color: "text-amber-600", bg: "bg-amber-50" };
    return { pct, label: "Keep practicing!", color: "text-red-500", bg: "bg-red-50" };
  };

  const toggleRecording = async () => {
    if (recording) {
      // Stop recording
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch {} recognitionRef.current = null; }
      setRecording(false);
      return;
    }
    // Start fresh — clear everything from previous attempt
    cleanup();
    setAudioBlob(null); setTranscript(""); setPlaying(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          setAudioBlob(new Blob(chunksRef.current, { type: mimeType }));
        }
        if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
      };
      recorder.start();
      setRecording(true);

      // Speech recognition
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = "ja-JP";
          recognition.interimResults = true;
          recognition.continuous = true;
          recognition.onresult = (e) => {
            let text = "";
            for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
            setTranscript(text);
          };
          recognition.onerror = () => {};
          recognition.onend = () => {};
          recognition.start();
          recognitionRef.current = recognition;
        } catch {}
      }
    } catch { alert("Microphone access denied. Please allow mic access in your browser settings."); }
  };

  const playRecording = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = new Audio(url);
    setPlaying("mine");
    a.onended = () => { setPlaying(null); URL.revokeObjectURL(url); };
    a.onerror = () => { setPlaying(null); URL.revokeObjectURL(url); };
    a.play().catch(() => { setPlaying(null); URL.revokeObjectURL(url); });
  };

  const goTo = (dir) => {
    cleanup();
    setAudioBlob(null); setPlaying(null); setTranscript("");
    setIdx((i) => (i + dir + phrases.length) % phrases.length);
  };

  const match = getMatch();

  return (
    <div className="flex flex-col h-full max-w-sm mx-auto">
      {/* Top: phrase card + listen */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">{idx + 1} / {phrases.length}</div>
          <div className="flex gap-2">
            <button onClick={() => goTo(-1)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">←</button>
            <button onClick={() => goTo(1)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">→</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 w-full text-center">
          <div className="text-3xl font-bold text-gray-800 mb-1">{phrase.jp}</div>
          <div className="text-sm text-gray-400 mb-1">{phrase.roma}</div>
          <div className="text-sm text-red-600 font-medium">{phrase.en}</div>
        </div>
        <button onClick={() => { setPlaying("native"); speak(phrase.jp); setTimeout(() => setPlaying(null), 2000); }}
          className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${playing === "native" ? "bg-red-600 text-white" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
          🔊 Listen to pronunciation
        </button>
      </div>

      {/* Middle: results (flex-1 to push mic down) */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-3">
        {(transcript || recording) && (
          <div className={`w-full rounded-xl p-4 text-center ${match ? match.bg : "bg-gray-50"}`}>
            <div className="text-xs text-gray-400 mb-1">You said:</div>
            <div className={`text-xl font-bold ${match ? match.color : "text-gray-800"}`}>
              {transcript || (recording ? "..." : "")}
            </div>
            {match && !recording && (
              <div className={`mt-2 text-sm font-medium ${match.color}`}>
                {match.label} ({match.pct}% match)
              </div>
            )}
          </div>
        )}
        {audioBlob && !recording && (
          <button onClick={playRecording} className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${playing === "mine" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
            🎧 Play my recording
          </button>
        )}
      </div>

      {/* Bottom: big mic button pinned near bottom */}
      <div className="p-6 flex flex-col items-center gap-2 flex-shrink-0">
        <button onClick={toggleRecording}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg transition-all select-none ${recording ? "bg-red-600 scale-110 animate-pulse" : "bg-red-500 hover:bg-red-600"} text-white`}>
          {recording ? "🎙️" : "🎤"}
        </button>
        <div className="text-xs text-gray-400">{recording ? "Listening... tap to stop" : "Tap to speak"}</div>
        {!SpeechRecognition && (
          <div className="text-xs text-amber-600 text-center">Speech recognition not supported in this browser. Try Chrome or Safari.</div>
        )}
      </div>
    </div>
  );
};

// ── STORIES (pre-written choose-your-own-adventure, no API needed) ────────────
const Stories = ({ lessonId, recordStoryComplete, getStoryStatus }) => {
  const [active, setActive] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [messages, setMessages] = useState([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const bottomRef = useRef(null);
  const scenarios = SCENARIOS[lessonId] || [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startScenario = (scenario) => {
    setActive(scenario);
    setStepIdx(0);
    setScore(0);
    setFinished(false);
    const step = scenario.steps[0];
    setMessages([{ role: "npc", text: step.npc }]);
  };

  const choose = (choice) => {
    const newMsgs = [...messages, { role: "user", text: choice.text }];
    if (choice.correct) setScore((s) => s + 1);
    newMsgs.push({ role: "npc", text: choice.reply });
    const nextStep = stepIdx + 1;
    if (nextStep < active.steps.length) {
      setTimeout(() => {
        setMessages((p) => [...p, { role: "npc", text: active.steps[nextStep].npc }]);
      }, 800);
      setStepIdx(nextStep);
    } else {
      setFinished(true);
      const finalScore = (choice.correct ? score + 1 : score);
      if (recordStoryComplete) recordStoryComplete(lessonId, active.id, finalScore, active.steps.length);
    }
    setMessages(newMsgs);
  };

  const currentStep = active?.steps[stepIdx];
  const totalSteps = active?.steps.length || 0;

  const completedCount = scenarios.filter((s) => getStoryStatus?.(lessonId, s.id)?.completed).length;

  if (!active) return (
    <div className="p-4 space-y-3">
      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Choose a Scenario · {completedCount}/{scenarios.length} done</div>
      {scenarios.map((s) => {
        const status = getStoryStatus?.(lessonId, s.id) || {};
        return (
          <button key={s.id} onClick={() => startScenario(s)} className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 hover:border-purple-300 hover:bg-purple-50 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{s.emoji}</span>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{s.title}</div>
                <div className="text-xs text-gray-500">{s.desc}</div>
              </div>
              {status.perfect ? <span className="text-yellow-500">&#11088;</span> : status.completed ? <span className="text-green-500">&#10003;</span> : null}
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center justify-between flex-shrink-0">
        <span className="text-xs font-medium text-purple-700">{active.emoji} {active.title}</span>
        <button onClick={() => { setActive(null); setMessages([]); }} className="text-xs text-purple-600 hover:text-purple-800">Exit</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
              m.role === "user" ? "bg-purple-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
            }`}>
              {m.text}
              {m.role === "npc" && (
                <button onClick={() => { const jp = m.text.match(/[ぁ-んァ-ヶー一-龯]+[^()\n]*/); if (jp) speak(jp[0]); }}
                  className="ml-2 text-xs opacity-50 hover:opacity-100">🔊</button>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {finished ? (
        <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
          <div className="text-center mb-3">
            <div className="text-3xl mb-1">{score >= totalSteps ? "🎉" : score >= totalSteps * 0.5 ? "👍" : "📚"}</div>
            <div className="font-bold text-gray-800">Scenario Complete!</div>
            <div className="text-sm text-gray-600">{score} / {totalSteps} correct choices</div>
            <div className="text-xs text-gray-500 mt-1">
              {score >= totalSteps ? "Perfect! すごい！" : score >= totalSteps * 0.5 ? "Good job! いいですね！" : "Keep practicing! がんばって！"}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => startScenario(active)} className="flex-1 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium">Try Again</button>
            <button onClick={() => { setActive(null); setMessages([]); }} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">Pick Another</button>
          </div>
        </div>
      ) : currentStep && (
        <div className="p-3 border-t border-gray-100 bg-white flex-shrink-0 space-y-2">
          <div className="text-xs text-gray-500 font-medium">{currentStep.prompt}</div>
          {currentStep.choices.map((c, i) => (
            <button key={i} onClick={() => choose(c)}
              className="w-full text-left px-3 py-2 rounded-xl border border-gray-200 text-sm hover:border-purple-400 hover:bg-purple-50 transition-all">
              {c.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── CHAT TUTOR ────────────────────────────────────────────────────────────────
const ChatTutor = ({ lesson, lessonId, username = "Guest" }) => {
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Hey ${username}! 👋 What do you want to practice?\n\n• Type "drill me" — I'll quiz you on vocab & grammar\n• Type any English phrase — I'll teach you how to say it\n• Tap 🎤 and try speaking Japanese — I'll check it\n• Or just ask me anything about this lesson!` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(true);
  const bottomRef = useRef(null);
  const voiceRecRef = useRef(null);

  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { return () => { if (voiceRecRef.current) { try { voiceRecRef.current.abort(); } catch {} } }; }, []);

  const sendMsg = async (userMsg) => {
    if (!userMsg || loading) return;
    setInput("");
    setMessages((p) => [...p, { role: "user", text: userMsg }]);
    setLoading(true);
    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const system = `You are a friendly Japanese language tutor named Sensei for ${username}, a complete beginner.

He is studying Lesson ${lessonId}: "${lesson.title}".

ONLY USE THESE WORDS AND GRAMMAR. He does not know ANY Japanese outside of this list:

Vocabulary: ${lesson.vocab.map((v) => `${v.jp} (${v.roma}) = ${v.en}`).join(", ")}

Grammar: ${lesson.grammar.map((g) => `${g.jp} (${g.roma}) = ${g.en}`).join(", ")}

RESPOND BASED ON WHAT THE USER ASKS:
- If they say "drill me" or want to practice: Quiz them one word/phrase at a time. Give English, ask for Japanese. Praise if correct, gently correct if wrong, then give the next one.
- If they type an English phrase: Teach them how to say it in Japanese using the lesson vocab/grammar. Break it down step by step.
- If they speak/type Japanese: Check if it's correct, explain any mistakes, and encourage them.
- If they ask a question: Answer it simply and clearly, using examples from the lesson.

FORMAT RULES:
- NEVER use Japanese words outside his vocabulary list. Use English for anything else.
- ALWAYS show romaji next to Japanese: にほん (nihon)
- Keep responses to 1-3 short sentences. Be concise.
- End with a follow-up question or prompt to keep the conversation going
- When drilling, start simple (single words) then build up to grammar patterns
- When a phrase has a placeholder like "name", use real examples. The student's name is ${username}.
- Make exercises personal — "How do you say 'I am ${username}' in Japanese?" not "How do you say 'I am [name]'?"
- Don't lecture. Be interactive. Wait for them to respond before moving on.`;
      const text = await callAnthropic(system, [...history, { role: "user", content: userMsg }]);
      setMessages((p) => [...p, { role: "assistant", text }]);
      if (autoSpeak) {
        const jp = text.match(/[ぁ-んァ-ン一-龯]+[^\n]*/);
        if (jp) speak(jp[0]);
      }
    } catch { setMessages((p) => [...p, { role: "assistant", text: "接続エラーです。(Connection error.)" }]); }
    setLoading(false);
  };

  const send = () => sendMsg(input.trim());

  const voiceTimerRef = useRef(null);

  const startVoice = () => {
    if (!SpeechRecognition) { alert("Speech recognition not supported. Try Chrome or Safari."); return; }
    if (voiceListening) { stopVoice(); return; }
    try {
      const rec = new SpeechRecognition();
      rec.lang = "ja-JP";
      rec.interimResults = true;
      rec.continuous = false;
      let finalText = "";
      rec.onresult = (e) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
        setVoiceTranscript(text);
        finalText = text;
        // Auto-stop after 2s pause
        clearTimeout(voiceTimerRef.current);
        voiceTimerRef.current = setTimeout(() => stopVoice(), 2000);
      };
      rec.onerror = () => { clearTimeout(voiceTimerRef.current); setVoiceListening(false); };
      rec.onend = () => {
        clearTimeout(voiceTimerRef.current);
        setVoiceListening(false);
        if (finalText.trim()) sendMsg(finalText.trim());
        setVoiceTranscript("");
      };
      // Auto-stop after 6s if no speech at all
      voiceTimerRef.current = setTimeout(() => stopVoice(), 6000);
      rec.start();
      voiceRecRef.current = rec;
      setVoiceListening(true);
      setVoiceTranscript("");
    } catch { alert("Could not start speech recognition."); }
  };

  const stopVoice = () => {
    clearTimeout(voiceTimerRef.current);
    if (voiceRecRef.current) {
      try { voiceRecRef.current.stop(); } catch {}
      voiceRecRef.current = null;
    }
    setVoiceListening(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm leading-relaxed ${
              m.role === "user" ? "bg-red-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
            }`}>
              <span className="whitespace-pre-line">{m.text}</span>
              {m.role === "assistant" && <button onClick={() => speak(m.text.match(/[ぁ-んァ-ン一-龯]+[^\n]*/)?.[0] || m.text)} className="ml-2 text-xs opacity-50 hover:opacity-100">🔊</button>}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-400 animate-pulse">考えています… ✏️</div></div>}
        <div ref={bottomRef} />
      </div>

      {/* Voice transcript preview */}
      {voiceListening && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 text-center">
          <div className="text-xs text-red-400 mb-1">Listening...</div>
          <div className="text-sm text-red-600 font-medium">{voiceTranscript || "..."}</div>
        </div>
      )}

      <div className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center flex-shrink-0">
        <button onClick={startVoice}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${voiceListening ? "bg-red-600 text-white animate-pulse" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
          {voiceListening ? "🎙️" : "🎤"}
        </button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type or tap mic to talk..." className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-red-400" />
        <button onClick={send} disabled={loading || !input.trim()} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-40">送る</button>
      </div>
    </div>
  );
};

// ── AI CONVERSATION SCENARIOS ────────────────────────────────────────────────
const Conversations = ({ lessons, progress, username, recordConversationComplete }) => {
  const [activeScenario, setActiveScenario] = useState(null);
  const [showSceneCard, setShowSceneCard] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [goalMet, setGoalMet] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const bottomRef = useRef(null);
  const voiceRecRef = useRef(null);
  const voiceTimerRef = useRef(null);

  const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { return () => { if (voiceRecRef.current) { try { voiceRecRef.current.abort(); } catch {} } }; }, []);

  const studiedLessons = Object.keys(lessons).filter((id) => {
    const lp = progress.lessons?.[id];
    return lp && ((lp.flash?.known?.length || 0) > 0 || lp.quiz?.bestScore != null || lp.listening?.bestScore != null);
  }).map(Number);
  const maxStudied = Math.max(0, ...studiedLessons);

  const buildSystemPrompt = (scenario) => {
    const allVocab = [], allGrammar = [];
    Object.keys(lessons).forEach((id) => {
      if (Number(id) <= Math.max(maxStudied, scenario.minLesson)) {
        allVocab.push(...lessons[id].vocab);
        allGrammar.push(...lessons[id].grammar);
      }
    });
    return `You are playing the role of: ${scenario.character}
Setting: ${scenario.setting}
The student's name is ${username}.
The student's goal: ${scenario.goal}

RULES:
1. Stay in character as ${scenario.character}. Be natural and friendly.
2. Speak in Japanese with romaji in parentheses, then a brief English translation.
   Example: すみません、なにを のみますか？(Sumimasen, nani wo nomimasu ka?) — Excuse me, what would you like to drink?
3. The student is a beginner. They know this vocabulary and grammar:
   Vocab: ${allVocab.map((v) => `${v.jp} (${v.roma}) = ${v.en}`).join(", ")}
   Grammar: ${allGrammar.map((g) => `${g.jp} (${g.roma}) = ${g.en}`).join(", ")}
4. Keep responses to 1-2 sentences in Japanese. Be concise.
5. If the student makes a mistake, gently correct them while staying in character.
6. Guide the conversation toward the goal naturally.
7. When the student has successfully achieved the goal "${scenario.goal}", include [GOAL_COMPLETE] at the very end of your message.
8. Don't rush to complete the goal — let it feel like a real conversation (at least 3-4 exchanges).
9. Start by greeting the student in character.`;
  };

  const startScenario = async (scenario) => {
    setActiveScenario(scenario);
    setMessages([]);
    setGoalMet(false);
    setLoading(true);
    try {
      const system = buildSystemPrompt(scenario);
      let text = await callAnthropic(system, [{ role: "user", content: "Start the conversation. Greet me in character." }]);
      if (text.includes("[GOAL_COMPLETE]")) { text = text.replace("[GOAL_COMPLETE]", "").trim(); setGoalMet(true); }
      setMessages([{ role: "assistant", text }]);
    } catch { setMessages([{ role: "assistant", text: "すみません、接続エラーです。(Connection error.)" }]); }
    setLoading(false);
  };

  const sendMsg = async (userMsg) => {
    if (!userMsg || loading || goalMet) return;
    setInput("");
    const newMsgs = [...messages, { role: "user", text: userMsg }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const history = newMsgs.slice(-12).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const system = buildSystemPrompt(activeScenario);
      let text = await callAnthropic(system, history);
      if (text.includes("[GOAL_COMPLETE]")) {
        text = text.replace("[GOAL_COMPLETE]", "").trim();
        setGoalMet(true);
        if (recordConversationComplete) recordConversationComplete(activeScenario.id);
      }
      setMessages((p) => [...p, { role: "assistant", text }]);
      const jp = text.match(/[ぁ-んァ-ン一-龯]+[^\n]*/);
      if (jp) speak(jp[0]);
    } catch { setMessages((p) => [...p, { role: "assistant", text: "接続エラーです。(Connection error.)" }]); }
    setLoading(false);
  };

  const startVoice = () => {
    if (!SpeechRecognition) { alert("Speech recognition not supported. Try Chrome or Safari."); return; }
    if (voiceListening) { stopVoice(); return; }
    try {
      const rec = new SpeechRecognition();
      rec.lang = "ja-JP"; rec.interimResults = true; rec.continuous = false;
      let finalText = "";
      rec.onresult = (e) => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; setVoiceTranscript(t); finalText = t; clearTimeout(voiceTimerRef.current); voiceTimerRef.current = setTimeout(() => stopVoice(), 2000); };
      rec.onerror = () => { clearTimeout(voiceTimerRef.current); setVoiceListening(false); };
      rec.onend = () => { clearTimeout(voiceTimerRef.current); setVoiceListening(false); if (finalText.trim()) sendMsg(finalText.trim()); setVoiceTranscript(""); };
      voiceTimerRef.current = setTimeout(() => stopVoice(), 6000);
      rec.start(); voiceRecRef.current = rec; setVoiceListening(true); setVoiceTranscript("");
    } catch { alert("Could not start speech recognition."); }
  };

  const stopVoice = () => { clearTimeout(voiceTimerRef.current); if (voiceRecRef.current) { try { voiceRecRef.current.stop(); } catch {} voiceRecRef.current = null; } setVoiceListening(false); };

  // Scene card before starting conversation
  if (showSceneCard && activeScenario) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 max-w-sm w-full">
        <div className="text-6xl mb-4">{activeScenario.emoji}</div>
        <div className="font-bold text-xl text-gray-800 mb-2">{activeScenario.title}</div>
        <div className="text-sm text-gray-500 mb-4">{activeScenario.desc}</div>
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left space-y-2">
          <div className="text-xs text-gray-400 uppercase font-semibold">Setting</div>
          <div className="text-sm text-gray-700 leading-relaxed">{activeScenario.setting}</div>
          <div className="text-xs text-gray-400 uppercase font-semibold mt-3">Your Goal</div>
          <div className="text-sm text-green-700 font-medium">{activeScenario.goal}</div>
          <div className="text-xs text-gray-400 uppercase font-semibold mt-3">You'll meet</div>
          <div className="text-sm text-gray-700">{activeScenario.character}</div>
        </div>
        <button onClick={() => { setShowSceneCard(false); startScenario(activeScenario); }}
          className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm">
          Start Conversation
        </button>
        <button onClick={() => { setActiveScenario(null); setShowSceneCard(false); }}
          className="w-full mt-2 py-2 text-gray-400 text-xs hover:text-gray-600">Back to scenarios</button>
      </div>
    </div>
  );

  if (!activeScenario) return (
    <div className="p-4 space-y-3 overflow-y-auto">
      <div className="text-center py-4">
        <div className="text-4xl mb-2">💬</div>
        <div className="font-bold text-lg text-gray-800">Conversation Practice</div>
        <div className="text-sm text-gray-500 mt-1">Practice real-life situations with AI</div>
      </div>
      {CONVERSATION_SCENARIOS.map((s) => {
        const locked = maxStudied < s.minLesson;
        const completed = progress.conversations?.[s.id]?.completed;
        return (
          <button key={s.id} onClick={() => { if (!locked) { setActiveScenario(s); setShowSceneCard(true); } }} disabled={locked}
            className={`w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 transition-all ${locked ? "opacity-50" : "hover:shadow-md hover:border-green-200"}`}>
            <div className="text-3xl">{s.emoji}</div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                {s.title}
                {completed && <span className="text-green-500 text-xs">✓</span>}
              </div>
              <div className="text-xs text-gray-500">{s.desc}</div>
              {locked && <div className="text-xs text-orange-500 mt-0.5">Complete Lesson {s.minLesson} to unlock</div>}
            </div>
            <span className="text-gray-400">{locked ? "🔒" : "→"}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className={`px-4 py-2 text-center text-xs font-medium ${goalMet ? "bg-green-100 text-green-700" : "bg-green-50 text-green-600"}`}>
        {goalMet ? `✓ Goal complete: ${activeScenario.goal}` : `Goal: ${activeScenario.goal}`}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm leading-relaxed ${
              m.role === "user" ? "bg-green-600 text-white rounded-br-sm" : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
            }`}>
              <span className="whitespace-pre-line">{m.text}</span>
              {m.role === "assistant" && <button onClick={() => speak(m.text.match(/[ぁ-んァ-ン一-龯]+[^\n]*/)?.[0] || m.text)} className="ml-2 text-xs opacity-50 hover:opacity-100">🔊</button>}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start"><div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-400 animate-pulse">考えています… ✏️</div></div>}
        <div ref={bottomRef} />
      </div>
      {goalMet && (
        <div className="px-4 py-3 bg-green-50 border-t border-green-100 text-center">
          <div className="font-semibold text-green-700 mb-2">Great job! You completed the scenario! 🎉</div>
          <button onClick={() => { setActiveScenario(null); setMessages([]); setGoalMet(false); }} className="px-6 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">Back to Scenarios</button>
        </div>
      )}
      {voiceListening && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-100 text-center">
          <div className="text-xs text-green-400 mb-1">Listening...</div>
          <div className="text-sm text-green-600 font-medium">{voiceTranscript || "..."}</div>
        </div>
      )}
      {!goalMet && (
        <div className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center flex-shrink-0">
          <button onClick={startVoice}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all ${voiceListening ? "bg-green-600 text-white animate-pulse" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
            {voiceListening ? "🎙️" : "🎤"}
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMsg(input.trim())}
            placeholder="Type in Japanese or tap mic..." className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400" />
          <button onClick={() => sendMsg(input.trim())} disabled={loading || !input.trim()} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-40">送る</button>
        </div>
      )}
    </div>
  );
};

// ── JLPT N5 PRACTICE ──────────────────────────────────────────────────────────
const BATCH_SIZE = 10;
const JLPTPractice = ({ recordJlptScore }) => {
  const [section, setSection] = useState("vocab");
  const [batch, setBatch] = useState(0);
  const [shuffled, setShuffled] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [finished, setFinished] = useState(false);
  const [rPassage, setRPassage] = useState(0);
  const [rQuestion, setRQuestion] = useState(0);

  const sectionLabels = { vocab: "Vocabulary", grammar: "Grammar", kanji: "Kanji", reading: "Reading" };
  const allQuestions = section === "vocab" ? JLPT_N5.vocab : section === "grammar" ? JLPT_N5.grammar : section === "kanji" ? JLPT_N5.kanji : null;

  // Shuffle and batch for non-reading sections
  useEffect(() => {
    if (allQuestions) {
      const s = [...allQuestions].sort(() => Math.random() - 0.5);
      setShuffled(s);
    }
  }, [section]);

  const batchQuestions = allQuestions ? shuffled.slice(batch * BATCH_SIZE, (batch + 1) * BATCH_SIZE) : null;
  const totalBatches = allQuestions ? Math.ceil(shuffled.length / BATCH_SIZE) : 0;
  const questions = batchQuestions;

  const passage = JLPT_N5.reading[rPassage];
  const rq = passage?.questions[rQuestion];

  const restart = () => { setQIdx(0); setScore(0); setChosen(null); setFinished(false); setRPassage(0); setRQuestion(0); setBatch(0); };
  const switchSection = (s) => { setSection(s); restart(); };

  const nextBatch = () => {
    setBatch((b) => b + 1);
    setQIdx(0); setScore(0); setChosen(null); setFinished(false);
  };

  const handleAnswer = (idx) => {
    if (chosen !== null) return;
    setChosen(idx);
    const correct = section === "reading" ? rq.a : questions[qIdx].a;
    if (idx === correct) setScore((s) => s + 1);
  };

  const next = () => {
    setChosen(null);
    if (section === "reading") {
      if (rQuestion + 1 < passage.questions.length) { setRQuestion((i) => i + 1); }
      else if (rPassage + 1 < JLPT_N5.reading.length) { setRPassage((i) => i + 1); setRQuestion(0); }
      else setFinished(true);
    } else {
      if (qIdx + 1 >= questions.length) setFinished(true);
      else setQIdx((i) => i + 1);
    }
  };

  useEffect(() => {
    if (finished && recordJlptScore) {
      const totalQ2 = section === "reading"
        ? JLPT_N5.reading.reduce((sum, p) => sum + p.questions.length, 0)
        : questions?.length || 0;
      recordJlptScore(section, score, totalQ2);
    }
  }, [finished]);

  const totalQ = section === "reading"
    ? JLPT_N5.reading.reduce((sum, p) => sum + p.questions.length, 0)
    : questions?.length || 0;
  const currentQ = section === "reading"
    ? JLPT_N5.reading.slice(0, rPassage).reduce((sum, p) => sum + p.questions.length, 0) + rQuestion + 1
    : qIdx + 1;

  if (finished) return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="text-5xl">{score >= totalQ * 0.8 ? "🎉" : "📚"}</div>
      <div className="text-2xl font-bold text-gray-800">N5 {sectionLabels[section]} Complete!</div>
      <div className="text-lg text-gray-600">{score} / {totalQ} correct</div>
      {section !== "reading" && totalBatches > 1 && (
        <div className="text-xs text-gray-400">Batch {batch + 1} of {totalBatches}</div>
      )}
      <div className="text-sm text-gray-500">{score >= totalQ * 0.8 ? "Great job! You're ready!" : "Keep studying! がんばって！"}</div>
      <div className="flex gap-2">
        <button onClick={restart} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Try Again</button>
        {section !== "reading" && batch + 1 < totalBatches && (
          <button onClick={nextBatch} className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700">Next {BATCH_SIZE} →</button>
        )}
      </div>
    </div>
  );

  if (!questions?.length && section !== "reading") return <div className="p-8 text-center text-gray-400">Loading...</div>;

  const currentOpts = section === "reading" ? rq.opts : questions[qIdx].opts;
  const currentAnswer = section === "reading" ? rq.a : questions[qIdx].a;
  const currentItem = section !== "reading" ? questions[qIdx] : null;

  return (
    <div className="flex flex-col gap-4 p-4 max-w-sm mx-auto">
      <div className="flex gap-1">
        {[["vocab", "Vocab"], ["grammar", "Grammar"], ["kanji", "Kanji"], ["reading", "Reading"]].map(([key, label]) => (
          <button key={key} onClick={() => switchSection(key)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${section === key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-500">
        <span>Q {currentQ} / {totalQ}</span>
        {section !== "reading" && totalBatches > 1 && <span className="text-xs text-gray-400">Batch {batch + 1}/{totalBatches}</span>}
        <span>⭐ {score}</span>
      </div>

      {section === "reading" && (
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{passage.text}</div>
          <button onClick={() => speak(passage.text)} className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs hover:bg-yellow-200">🔊 Listen</button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6 text-center">
        <div className={`font-bold text-gray-800 mb-1 ${section === "kanji" ? "text-5xl" : "text-xl"}`}>
          {section === "reading" ? rq.q : currentItem.q}
        </div>
        {section === "kanji" && currentItem.reading && (
          <div className="text-sm text-gray-400 mt-2">{currentItem.reading}</div>
        )}
        {section !== "reading" && (
          <button onClick={() => speak(currentItem.q)} className="mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs hover:bg-indigo-100">🔊 Listen</button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {currentOpts.map((opt, i) => {
          let cls = "p-3 rounded-xl border text-sm font-medium text-center transition-all ";
          if (chosen === null) cls += "bg-white border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer";
          else if (i === currentAnswer) cls += "bg-green-100 border-green-500 text-green-700";
          else if (i === chosen) cls += "bg-red-100 border-red-400 text-red-700";
          else cls += "bg-gray-50 border-gray-200 text-gray-400";
          return <button key={i} className={cls} onClick={() => handleAnswer(i)}>{opt}</button>;
        })}
      </div>
      {chosen !== null && <button onClick={next} className="py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">Next →</button>}
    </div>
  );
};

// ── GREETINGS ─────────────────────────────────────────────────────────────────
const GreetingsPanel = () => (
  <div className="p-4 space-y-2">
    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Essential Greetings</div>
    {GREETINGS.map((g, i) => (
      <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
        <div>
          <div className="font-bold text-gray-800">{g.jp}</div>
          <div className="text-xs text-gray-400">{g.roma}</div>
          <div className="text-sm text-red-600">{g.en}</div>
        </div>
        <button onClick={() => speak(g.jp)} className="ml-2 w-9 h-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 text-lg flex-shrink-0">🔊</button>
      </div>
    ))}
  </div>
);

// ── PROGRESS DASHBOARD ───────────────────────────────────────────────────────
const ProgressBar = ({ percent, color = "bg-red-500" }) => (
  <div className="w-full bg-gray-200 rounded-full h-2.5">
    <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, percent)}%` }} />
  </div>
);

const ProgressDashboard = ({ progress, lessons, getLessonPercent, getJlptPercent, timeTracker, resetProgress }) => {
  const [showReset, setShowReset] = useState(false);
  const jlptPct = getJlptPercent();

  // calculate overall
  const lessonPcts = Object.keys(lessons).map((id) => {
    const l = lessons[id];
    const totalCards = l.vocab.length + l.grammar.length;
    return getLessonPercent(Number(id), totalCards);
  });
  const overallPct = lessonPcts.length > 0 ? Math.round((lessonPcts.reduce((a, b) => a + b, 0) + jlptPct) / (lessonPcts.length + 1)) : 0;

  return (
    <div className="p-4 space-y-5 max-w-sm mx-auto">
      {/* Overall */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-4">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Overall Mastery</div>
        <div className="text-3xl font-bold text-gray-800 mb-2">{overallPct}%</div>
        <ProgressBar percent={overallPct} color="bg-red-500" />
      </div>

      {/* Time Stats */}
      {timeTracker && (
        <div className="bg-white rounded-2xl shadow border border-gray-100 p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Study Time</div>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            <div><div className="text-xl font-bold text-gray-800">{timeTracker.todayMinutes}m</div><div className="text-xs text-gray-500">Today</div></div>
            <div><div className="text-xl font-bold text-gray-800">{timeTracker.streak}d</div><div className="text-xs text-gray-500">Streak</div></div>
            <div><div className="text-xl font-bold text-gray-800">{Math.round(timeTracker.totalMinutes / 60)}h</div><div className="text-xs text-gray-500">Total</div></div>
          </div>
          {/* 7-day chart */}
          <div className="flex items-end gap-1 h-16">
            {timeTracker.last7.map((d) => {
              const maxMin = Math.max(...timeTracker.last7.map((x) => x.minutes), 1);
              const h = Math.max(4, (d.minutes / maxMin) * 100);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-red-400 rounded-t" style={{ height: `${h}%` }} title={`${d.minutes}m`} />
                  <div className="text-[10px] text-gray-400">{d.day}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-lesson */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-4">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">Lessons</div>
        <div className="space-y-3">
          {Object.keys(lessons).map((id) => {
            const l = lessons[id];
            const totalCards = l.vocab.length + l.grammar.length;
            const pct = getLessonPercent(Number(id), totalCards);
            const knownCount = progress.lessons?.[id]?.flash?.known?.length || 0;
            const quizBest = progress.lessons?.[id]?.quiz?.bestScore;
            const quizTotal = progress.lessons?.[id]?.quiz?.total;
            const storiesDone = progress.lessons?.[id]?.stories?.completed?.length || 0;
            const scenarios = SCENARIOS[id]?.length || 0;
            return (
              <div key={id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">L{id}</span>
                  <span className="text-xs text-gray-500">{pct}%</span>
                </div>
                <ProgressBar percent={pct} color="bg-blue-500" />
                <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                  <span>Cards: {knownCount}/{totalCards}</span>
                  {quizBest != null && <span>Quiz: {quizBest}/{quizTotal}</span>}
                  <span>Stories: {storiesDone}/{scenarios}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* JLPT N5 */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-4">
        <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">JLPT N5</div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall</span>
          <span className="text-xs text-gray-500">{jlptPct}%</span>
        </div>
        <ProgressBar percent={jlptPct} color="bg-indigo-500" />
        <div className="space-y-2 mt-3">
          {["vocab", "grammar", "kanji", "reading"].map((s) => {
            const data = progress.jlpt?.[s];
            const pct = data?.total ? Math.round((data.bestScore / data.total) * 100) : 0;
            return (
              <div key={s} className="flex justify-between items-center text-xs">
                <span className="text-gray-600 capitalize">{s}</span>
                <span className="text-gray-500">{data ? `${data.bestScore}/${data.total} (${pct}%)` : "Not started"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <div className="text-center">
        {!showReset ? (
          <button onClick={() => setShowReset(true)} className="text-xs text-gray-400 hover:text-red-500">Reset All Progress</button>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-red-600 font-medium">Are you sure? This cannot be undone.</div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { resetProgress(); setShowReset(false); }} className="px-4 py-1.5 bg-red-600 text-white text-xs rounded-lg">Yes, Reset</button>
              <button onClick={() => setShowReset(false)} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── HOME SCREEN ──────────────────────────────────────────────────────────────
// ── ONBOARDING ───────────────────────────────────────────────────────────────
const ONBOARDING_SLIDES = [
  { emoji: "🇯🇵", title: "Welcome to Japanese Study!", desc: "Your all-in-one app for learning Japanese from scratch. Let's walk through how it works." },
  { emoji: "📚", title: "Pick a Lesson, Then Learn", desc: "Start by choosing a lesson. Inside each lesson, you'll find Learn mode — a guided walkthrough of all the vocab and grammar before you practice." },
  { emoji: "🃏", title: "Practice Your Way", desc: "After learning, practice with Flashcards, Quiz, Listening, Speaking, Stories, or chat with your AI Sensei — all within the same lesson." },
  { emoji: "💬", title: "Conversations", desc: "Once you've studied, test yourself in real-life AI roleplay scenarios like ordering food or asking for directions." },
  { emoji: "🚀", title: "You're all set!", desc: "Tap Lesson 1 to start learning your first Japanese words and grammar. がんばって！(Good luck!)" },
];

const Onboarding = ({ onComplete }) => {
  const [slide, setSlide] = useState(0);
  const s = ONBOARDING_SLIDES[slide];
  const isLast = slide === ONBOARDING_SLIDES.length - 1;
  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans max-w-lg mx-auto">
      <div className="bg-red-600 text-white px-4 py-3 text-center">
        <div className="font-bold text-lg">日本語 Study</div>
        <div className="text-xs text-red-200">Japanese Study App</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">{s.emoji}</div>
        <div className="font-bold text-xl text-gray-800 mb-2">{s.title}</div>
        <div className="text-sm text-gray-500 leading-relaxed max-w-xs">{s.desc}</div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-center gap-1.5">
          {ONBOARDING_SLIDES.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === slide ? "bg-red-500 w-4" : "bg-gray-300"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {slide > 0 && (
            <button onClick={() => setSlide((s) => s - 1)} className="px-6 py-3 bg-gray-100 rounded-xl font-medium text-gray-600 hover:bg-gray-200">Back</button>
          )}
          <button onClick={() => isLast ? onComplete() : setSlide((s) => s + 1)}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
            {isLast ? "Let's Go!" : "Next"}
          </button>
        </div>
        {!isLast && (
          <button onClick={onComplete} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-1">Skip intro</button>
        )}
      </div>
    </div>
  );
};

// ── LESSON MODES (features within each lesson) ──────────────────────────────
const LESSON_MODES = [
  { id: "learn", name: "Learn", icon: "📚", color: "from-indigo-500 to-purple-600", desc: "Study words & grammar first",
    statFn: (p, l, id) => `${l.vocab.length} vocab, ${l.grammar.length} grammar` },
  { id: "flash", name: "Flashcards", icon: "🃏", color: "from-rose-500 to-red-600", desc: "Practice with cards",
    statFn: (p, l, id) => { const k = p.lessons?.[id]?.flash?.known?.length || 0; return `${k}/${l.vocab.length + l.grammar.length} known`; } },
  { id: "quiz", name: "Quiz", icon: "❓", color: "from-amber-500 to-orange-600", desc: "Test your knowledge",
    statFn: (p, l, id) => { const q = p.lessons?.[id]?.quiz; return q?.bestScore != null ? `Best: ${q.bestScore}/${q.total}` : "Not attempted"; } },
  { id: "speak", name: "Speaking", icon: "🎤", color: "from-blue-500 to-indigo-600", desc: "Practice pronunciation",
    statFn: (p, l, id) => `${l.vocab.length + l.grammar.length} phrases` },
  { id: "listen", name: "Listening", icon: "👂", color: "from-cyan-500 to-sky-600", desc: "Hear & type what you hear",
    statFn: (p, l, id) => { const lb = p.lessons?.[id]?.listening; return lb?.bestScore != null ? `Best: ${lb.bestScore}/${lb.total}` : "Not attempted"; } },
  { id: "stories", name: "Stories", icon: "📖", color: "from-purple-500 to-violet-600", desc: "Choose-your-own-adventure",
    statFn: (p, l, id) => { const c = p.lessons?.[id]?.stories?.completed?.length || 0; const t = (SCENARIOS[id] || []).length; return `${c}/${t} scenarios`; } },
  { id: "chat", name: "Sensei", icon: "🧑‍🏫", color: "from-emerald-500 to-teal-600", desc: "Your personal AI tutor",
    statFn: () => "Powered by Gemini" },
];

const HomeScreen = ({ onPickLesson, onConversations, onGo, progress, lessons, timeTracker }) => {
  const lessonIds = Object.keys(lessons);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-4 flex items-center gap-4">
        <div className="text-3xl">🇯🇵</div>
        <div className="flex-1">
          <div className="font-bold text-gray-800 text-lg">Welcome back!</div>
          <div className="text-xs text-gray-500">
            Today: {timeTracker.todayMinutes}m studied
            {timeTracker.streak >= 1 ? ` | ${timeTracker.streak}-day streak` : ""}
            {timeTracker.streak >= 3 ? " 🔥" : ""}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Your Lessons</div>
      <div className="space-y-3">
        {lessonIds.map((id) => {
          const l = lessons[id];
          const totalCards = l.vocab.length + l.grammar.length;
          const knownCount = progress.lessons?.[id]?.flash?.known?.length || 0;
          const quizBest = progress.lessons?.[id]?.quiz?.bestScore;
          const storiesDone = progress.lessons?.[id]?.stories?.completed?.length || 0;
          const scenarioCount = (SCENARIOS[id] || []).length;
          const pct = totalCards > 0 ? Math.round((knownCount / totalCards) * 100) : 0;
          return (
            <button key={id} onClick={() => onPickLesson(Number(id))}
              className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 hover:border-red-300 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow">
                  {id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm truncate">{l.title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {l.vocab.length} vocab · {l.grammar.length} grammar
                    {quizBest != null ? ` · Quiz: ${quizBest}` : ""}
                    {storiesDone > 0 ? ` · ${storiesDone}/${scenarioCount} stories` : ""}
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                    <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-gray-300 text-xl">›</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-2">Practice & Testing</div>
      <button onClick={onConversations}
        className="w-full bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-4 text-left shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
        <div className="flex items-center gap-3">
          <div className="text-3xl">💬</div>
          <div className="flex-1">
            <div className="font-bold">Conversations</div>
            <div className="text-[11px] opacity-80">Real-life AI roleplay scenarios</div>
            <div className="text-[10px] opacity-70 mt-1 font-medium">
              {Object.keys(progress.conversations || {}).filter((id) => progress.conversations[id]?.completed).length}/{CONVERSATION_SCENARIOS.length} completed
            </div>
          </div>
          <span className="text-white/60 text-xl">›</span>
        </div>
      </button>

      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-2">Quick Access</div>
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onGo("greetings")} className="bg-white rounded-xl border border-gray-100 p-3 text-center hover:border-red-300 hover:bg-red-50 transition-all shadow-sm">
          <div className="text-2xl mb-1">👋</div>
          <div className="text-xs font-medium text-gray-700">Greetings</div>
        </button>
        <button onClick={() => onGo("jlpt")} className="bg-white rounded-xl border border-gray-100 p-3 text-center hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm">
          <div className="text-2xl mb-1">📝</div>
          <div className="text-xs font-medium text-gray-700">JLPT N5</div>
        </button>
        <button onClick={() => onGo("progress")} className="bg-white rounded-xl border border-gray-100 p-3 text-center hover:border-green-300 hover:bg-green-50 transition-all shadow-sm">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-xs font-medium text-gray-700">Progress</div>
        </button>
      </div>
    </div>
  );
};

// ── LESSON DETAIL (all modes for one lesson) ─────────────────────────────────
const LessonDetail = ({ lessonId, lesson, progress, onPickMode }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    <div className="bg-white rounded-2xl shadow border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow">
          {lessonId}
        </div>
        <div>
          <div className="font-bold text-gray-800">{lesson.title}</div>
          <div className="text-xs text-gray-400">{lesson.vocab.length} vocabulary · {lesson.grammar.length} grammar patterns</div>
        </div>
      </div>
    </div>

    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Start Learning</div>
    {LESSON_MODES.slice(0, 1).map((mode) => (
      <button key={mode.id} onClick={() => onPickMode(mode.id)}
        className={`w-full bg-gradient-to-br ${mode.color} text-white rounded-2xl p-5 text-left shadow-lg hover:scale-[1.02] active:scale-95 transition-all`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{mode.icon}</div>
          <div className="flex-1">
            <div className="font-bold text-lg">{mode.name}</div>
            <div className="text-sm opacity-80">{mode.desc}</div>
            <div className="text-xs opacity-70 mt-1 font-medium">{mode.statFn(progress, lesson, lessonId)}</div>
          </div>
          <span className="text-white/60 text-xl">›</span>
        </div>
      </button>
    ))}

    <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Practice & Review</div>
    <div className="grid grid-cols-2 gap-3">
      {LESSON_MODES.slice(1).map((mode) => (
        <button key={mode.id} onClick={() => onPickMode(mode.id)}
          className={`bg-gradient-to-br ${mode.color} text-white rounded-2xl p-4 text-left shadow-lg hover:scale-[1.02] active:scale-95 transition-all`}>
          <div className="text-3xl mb-2">{mode.icon}</div>
          <div className="font-bold text-sm">{mode.name}</div>
          <div className="text-[11px] opacity-80 mt-0.5">{mode.desc}</div>
          <div className="text-[10px] opacity-70 mt-2 font-medium">{mode.statFn(progress, lesson, lessonId)}</div>
        </button>
      ))}
    </div>
  </div>
);

// ── SYNC HELPER ───────────────────────────────────────────────────────────────
const useSyncLessons = () => {
  const [lessons, setLessons] = useState(() => {
    const cached = localStorage.getItem("synced_lessons");
    if (cached) {
      try {
        const { data } = JSON.parse(cached);
        return { ...DEFAULT_LESSONS, ...data };
      } catch { /* fall through */ }
    }
    return DEFAULT_LESSONS;
  });
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error

  useEffect(() => {
    const cached = localStorage.getItem("synced_lessons");
    if (cached) {
      try {
        const { timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 3600000) { setSyncStatus("synced"); return; }
      } catch { /* fall through */ }
    }
    setSyncStatus("syncing");
    fetch("/api/slides")
      .then((r) => r.json())
      .then((data) => {
        if (data.text) {
          localStorage.setItem("synced_lessons", JSON.stringify({ data: DEFAULT_LESSONS, timestamp: Date.now(), raw: data.text }));
          setSyncStatus("synced");
        } else {
          setSyncStatus("error");
        }
      })
      .catch(() => setSyncStatus("error"));
  }, []);

  return { lessons, syncStatus };
};

// ── APP MAIN (authenticated) ─────────────────────────────────────────────────
function AppMain({ currentUser, onLogout }) {
  const [screen, setScreen] = useState("home");
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem("onboarding_done"));
  const { lessons, syncStatus } = useSyncLessons();
  const progressHook = useProgress();
  const timeTracker = useTimeTracker();
  useSyncToServer(currentUser?.id);

  const lesson = selectedLesson ? lessons[selectedLesson] : null;

  if (showOnboarding) return <Onboarding onComplete={() => { localStorage.setItem("onboarding_done", "1"); setShowOnboarding(false); }} />;

  const goHome = () => { setScreen("home"); setSelectedMode(null); setSelectedLesson(null); };
  const pickLesson = (id) => { setSelectedLesson(id); setSelectedMode(null); setScreen("lesson-detail"); };
  const pickMode = (mode) => { setSelectedMode(mode); setScreen("activity"); };
  const openConversations = () => { setSelectedMode("convo"); setSelectedLesson(null); setScreen("activity"); };
  const handleBack = () => {
    if (screen === "activity" && selectedMode === "convo") goHome();
    else if (screen === "activity") { setSelectedMode(null); setScreen("lesson-detail"); }
    else if (screen === "lesson-detail") goHome();
    else goHome();
  };

  const showBack = screen !== "home";
  const headerTitle = screen === "home" ? `${currentUser.username} の 日本語`
    : screen === "lesson-detail" ? lesson?.title
    : screen === "activity" && selectedMode === "convo" ? "Conversations"
    : screen === "activity" ? `${lesson?.title} — ${MODE_META[selectedMode]?.name || ""}`
    : screen === "greetings" ? "Greetings"
    : screen === "jlpt" ? "JLPT N5 Practice"
    : screen === "progress" ? "Progress"
    : screen === "settings" ? "Settings" : "";

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2">
        {showBack && (
          <button onClick={handleBack} className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 text-white text-sm font-bold flex-shrink-0">
            ←
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg leading-tight truncate">{headerTitle}</div>
          {screen === "home" && <div className="text-xs text-red-200">Japanese Study App</div>}
        </div>
        <span title={syncStatus === "synced" ? "Content synced" : syncStatus === "syncing" ? "Syncing..." : "Using cached content"}
          className={`w-2 h-2 rounded-full flex-shrink-0 ${syncStatus === "synced" ? "bg-green-300" : syncStatus === "syncing" ? "bg-yellow-300 animate-pulse" : "bg-orange-300"}`} />
        <button onClick={() => setScreen("settings")} className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 text-[10px] font-bold flex-shrink-0" title="Settings">
          {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full" alt="" /> : currentUser.username[0]?.toUpperCase()}
        </button>
        {showBack && (
          <button onClick={goHome} className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 text-sm flex-shrink-0" title="Home">🏠</button>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-hidden ${screen === "activity" && (selectedMode === "chat" || selectedMode === "stories" || selectedMode === "convo") ? "flex flex-col" : "overflow-y-auto"}`}>
        {screen === "home" && (
          <HomeScreen onPickLesson={pickLesson} onConversations={openConversations} onGo={(t) => setScreen(t)} progress={progressHook.progress} lessons={lessons} timeTracker={timeTracker} />
        )}
        {screen === "lesson-detail" && lesson && (
          <LessonDetail lessonId={selectedLesson} lesson={lesson} progress={progressHook.progress} onPickMode={pickMode} />
        )}
        {screen === "activity" && lesson && selectedMode === "learn" && (
          <LearnMode lesson={lesson} />
        )}
        {screen === "activity" && lesson && selectedMode === "flash" && (
          <Flashcards lesson={lesson} lessonId={selectedLesson} markFlashKnown={progressHook.markFlashKnown} getFlashKnown={progressHook.getFlashKnown} />
        )}
        {screen === "activity" && lesson && selectedMode === "quiz" && (
          <Quiz lesson={lesson} lessonId={selectedLesson} recordQuizScore={progressHook.recordQuizScore} />
        )}
        {screen === "activity" && lesson && selectedMode === "speak" && (
          <Speaking lesson={lesson} />
        )}
        {screen === "activity" && lesson && selectedMode === "stories" && (
          <Stories lessonId={selectedLesson} recordStoryComplete={progressHook.recordStoryComplete} getStoryStatus={progressHook.getStoryStatus} />
        )}
        {screen === "activity" && lesson && selectedMode === "listen" && (
          <Listening lesson={lesson} lessonId={selectedLesson} recordListeningScore={progressHook.recordListeningScore} />
        )}
        {screen === "activity" && lesson && selectedMode === "chat" && (
          <ChatTutor lesson={lesson} lessonId={selectedLesson} username={currentUser.username} />
        )}
        {screen === "activity" && selectedMode === "convo" && (
          <Conversations lessons={lessons} progress={progressHook.progress} username={currentUser.username} recordConversationComplete={progressHook.recordConversationComplete} />
        )}
        {screen === "greetings" && <GreetingsPanel />}
        {screen === "jlpt" && <JLPTPractice recordJlptScore={progressHook.recordJlptScore} />}
        {screen === "progress" && (
          <ProgressDashboard progress={progressHook.progress} lessons={lessons} getLessonPercent={progressHook.getLessonPercent} getJlptPercent={progressHook.getJlptPercent} timeTracker={timeTracker} resetProgress={progressHook.resetProgress} />
        )}
        {screen === "settings" && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} className="w-20 h-20 rounded-full mx-auto mb-3" alt="" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-red-500 text-white text-3xl font-bold flex items-center justify-center mx-auto mb-3">
                  {currentUser.username[0]?.toUpperCase()}
                </div>
              )}
              <div className="font-bold text-lg text-gray-800">{currentUser.username}</div>
              {currentUser.email && <div className="text-sm text-gray-500">{currentUser.email}</div>}
              {currentUser.id === "local" && <div className="text-xs text-orange-500 mt-1">Guest mode — progress saved locally only</div>}
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button onClick={() => setScreen("progress")} className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
                <span className="text-lg">📊</span>
                <span className="text-gray-800 font-medium">Progress & Stats</span>
                <span className="ml-auto text-gray-400 text-sm">→</span>
              </button>
              <button onClick={() => { progressHook.resetProgress(); goHome(); }} className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <span className="text-lg">🔄</span>
                <span className="text-gray-800 font-medium">Reset All Progress</span>
                <span className="ml-auto text-gray-400 text-sm">→</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="text-xs text-gray-400 uppercase tracking-wide font-semibold">About</div>
              </div>
              <div className="px-5 py-3 text-sm text-gray-500">Japanese Study App v1.0</div>
              <div className="px-5 py-3 text-sm text-gray-500 border-t border-gray-100">Built with React + Supabase</div>
            </div>

            <button onClick={onLogout} className="w-full bg-white rounded-2xl p-4 text-red-500 font-semibold text-center shadow-sm hover:bg-red-50 transition-colors">
              {currentUser.id === "local" ? "Back to Sign In" : "Sign Out"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── APP WRAPPER (auth) ───────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("current_user")); } catch { return null; }
  });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const user = session.user;
        const userObj = {
          id: user.id,
          username: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email,
          avatarUrl: user.user_metadata?.avatar_url,
        };
        localStorage.setItem("current_user", JSON.stringify(userObj));
        setCurrentUser(userObj);
        loadProgressFromServer(user.id);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        const user = session.user;
        const userObj = {
          id: user.id,
          username: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
          email: user.email,
          avatarUrl: user.user_metadata?.avatar_url,
        };
        localStorage.setItem("current_user", JSON.stringify(userObj));
        setCurrentUser(userObj);
        loadProgressFromServer(user.id);
      }
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("current_user");
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProgressFromServer = async (userId) => {
    try {
      const resp = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "load", userId }),
      });
      const data = await resp.json();
      if (data.progress) localStorage.setItem("study_progress", JSON.stringify(data.progress));
      if (data.timeData) localStorage.setItem("study_time", JSON.stringify(data.timeData));
    } catch {}
  };

  const handleLogout = async () => {
    if (currentUser?.id && currentUser.id !== "local") {
      try {
        const progress = JSON.parse(localStorage.getItem("study_progress") || "{}");
        const timeData = JSON.parse(localStorage.getItem("study_time") || "{}");
        await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save", userId: currentUser.id, progress, timeData }),
        });
      } catch {}
    }
    await supabase.auth.signOut();
    localStorage.removeItem("current_user");
    setCurrentUser(null);
  };

  if (authLoading) return (
    <div className="flex flex-col h-screen bg-gray-50 items-center justify-center font-sans max-w-lg mx-auto">
      <div className="text-4xl animate-bounce">🇯🇵</div>
      <div className="text-gray-400 text-sm mt-2">Loading...</div>
    </div>
  );

  if (!currentUser) return <ProfileScreen onLogin={setCurrentUser} />;
  return <AppMain key={currentUser.id} currentUser={currentUser} onLogout={handleLogout} />;
}
