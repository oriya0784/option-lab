(() => {
  'use strict';
  const $=id=>document.getElementById(id),L=window.Lab;
  const intro=(target,title,copy,extra={})=>({kind:'intro',target,title,copy,...extra});
  const op=(target,title,copy,event,test=()=>true,extra={})=>({kind:'op',target,title,copy,event,test,...extra});
  const quiz=(target,title,copy,answers,correct,explanation,hint='先分清楚權利、義務、成本，以及這一步是否已成交。')=>({kind:'quiz',target,title,copy,answers,correct,explanation,hint});
  const courses={intro:[
    intro('#welcome','歡迎來到星辰練習室 ✦','這裡用虛擬資金練習期權概念。導覽會暫存原帳戶，退出後還原。先認識畫面，再親手下單。介紹步驟點畫面任意處就能繼續；右上角 × 可隨時離開。'),
    intro('#stats','帳戶權益、現金與可用資金有什麼差別？','帳戶權益是現金加上持倉的平倉價值：買入的期權可以賣出換回現金；賣出的期權則要花錢買回。可用資金還要扣掉保證金與掛單保留的金額。賣出期權收到的權利金，不能直接當成獲利。'),
    intro('#spot-area','先看指數目前的價格','這些期權以 NOVA 指數為標的，價值會受到指數價格影響。NOVA 起始是 1,000，但這是模擬市場。行情只在你按「下一輪」或「推進時間」時改變，沒有真正的即時股價。'),
    intro('#trade-grid','買 Call、賣 Call、買 Put、賣 Put 有什麼不同？','買 Call 是付權利金，取得依履約價買入標的的權利；買 Put 則取得賣出標的的權利。賣 Call、賣 Put 是收權利金，承擔相對的履約義務。這裡模擬歐式指數期權，到期用現金差額結算。'),
    quiz('#trade-grid','哪些交易方向適合預期市場上漲的情況？','先不比較風險大小，只判斷方向。如果其他條件不變，以下哪些交易會受益於指數上漲？',['只有買 Call','只有賣 Put','買 Call 和賣 Put 都會受益'],2,'答對了！指數上漲通常有利於買 Call 和賣 Put，但不保證一定獲利。買 Call 要付權利金，最大損失有限；賣 Put 會收權利金，但指數大跌時可能虧損很多。兩者對上漲的期待相同，風險卻不同。'),
    intro('#trade-grid','買入和賣出期權，承擔的風險不同','買 Call、買 Put 的到期最大損失是付出的權利金加費用。沒有其他部位保護的「裸賣 Call」，理論損失無上限；賣 Put 在指數跌到零時也可能有巨額損失。收到權利金的同時，也承擔了履約義務。'),
    quiz('#trade-grid','如果希望限制最大損失，該選哪個？','你預期指數上漲，而且希望到期最大損失不超過付出的權利金與開倉費用。以下哪個單一合約符合這個條件？',['買 Call','賣 Put','裸賣 Call'],0,'買 Call 符合。賣 Put 雖然也會受益於上漲，但下跌時的損失可能超過收到的權利金；裸賣 Call 反而會因上漲而虧損，理論損失無上限。'),
    intro('#strike-controls','履約價是合約約定的價位','現價與履約價決定價內／價外。Call 現價高於履約價是價內；Put 則相反。你可以直接輸入小數、帶入現價、按 ±1，或長按；超過 5 秒後每次 ±10。真實交易須選已掛牌履約價。'),
    intro('#expiry-controls','不必等到期才離場','這裡可選 1～365 個交易日，每筆持倉各自到期。歐式是「履約」只能在到期做，不代表到期前不能平倉。時間流逝通常會消耗買方時間價值，近到期的敏感度可能變得很大。'),
    intro('#chain-panel','Bid／Ask 與口數深度','買入通常付 Ask，賣出通常收 Bid。兩者差距是價差；下方口數表示這輪該價位能成交多少。這裡模擬最佳一檔，買賣會消耗深度，下一輪才補充。'),
    intro('#execution-fields','選擇你對價格的要求','市價 IOC 現在能成交多少就成交多少，剩餘取消。限價買單不高於限價、賣單不低於限價；可能一直沒成交。DAY 日末取消，GTC 保留至撤單或到期。持倉也可設定停損平倉。'),
    intro('#payoff-chart','方向對，仍可能沒賺錢','到期損益除了內含價值，還要扣權利金與費用。買 Call 不是只要上漲就一定賺；要越過損益兩平點。這張圖是假設持有至到期，提前平倉的結果還受到隱含波動率（IV）、剩餘時間與成交價差的影響。'),
    intro('#risk-panel','這四個指標告訴你，期權價格會受到什麼影響','Delta 看指數價格變動的影響；Gamma 看 Delta 會怎麼變；Theta 看時間流逝的影響；Vega 看隱含波動率（IV）改變的影響。IV 是期權報價反映的預期波動程度。這些是小幅變動的模型估計，不能直接套用到大幅跳動的行情。'),
    quiz('#risk-panel','指數價格不變，期權的價值也會變嗎？','假設買入 Call 時，履約價等於目前的指數價格。之後指數價格、IV 等其他條件都不變，只是越來越接近到期日。這筆 Call 的時間價值通常會怎麼變？',['隨時間增加','隨時間減少','保證完全不變'],1,'時間價值通常會隨著到期日接近而減少。所以買入期權時，除了預期價格會往哪個方向走，也要考慮變動幅度和需要多少時間。'),
    intro('#position-panel','開反方向單，並不是平倉','持倉區的「賣出平倉」處理買方，「買回平倉」處理賣方。可調口數部分平倉，或按「委託」設限價／停損。交易區直接選反方向開倉，會建立新的部位。'),
    intro('#time-controls','讓市場動起來','每個模擬交易日有 6 輪撮合。推進一輪適合看掛單；推進多日會依序檢查成交、到期與保證金。不是直接跳到最後，途中可能先被強制平倉。'),
    intro('#strategy-mode','組合策略是把多張期權一起看','除了單一合約，這裡有六種組合。四種垂直價差用一買一賣限制到期風險；跨式期待大幅移動；鐵兀鷹期待區間盤整。教學選單的 03 有六堂獨立實作，帶你看每一腿。'),
    intro('#stress-panel','情境試算可以試價格、IV 和時間','展開這一區，可以改三個假設，看現有持倉的理論價值變化。它不會送出交易，也不會推進行情；不含成交價差、後續費用與途中強制平倉，不能當作預測或最大損失。'),
    intro('.chart-switch','切換指數與帳戶權益走勢','指數上漲，不代表帳戶一定獲利。切換帳戶權益，可以看持倉價值與交易成本如何影響帳戶。04 會帶你實際比較價格、IV 與時間的影響。'),
    intro('#settings','設定、保存與新回合','這個按鈕可開關動畫、匯出或匯入存檔，以及選新回合情境。06 會直接帶你看設定畫面。存檔保存在目前瀏覽器，不會跨裝置自動同步。'),
    intro('#missions','認識完成，來親手練一遍吧','你已認識方向、時間、報價與風險。下一堂會用獨立練習帳戶帶你開倉、平倉、掛單、撤單與做價差。任何損益都只是一個學習結果。',{finish:true})
  ],practice:[
    intro('#ticket','現在進入獨立練習帳戶','練習帳戶有 100,000 虛擬元。你的原本帳戶已暫存，退出或完成就會還原。介紹可以點任意處；實作時，只有亮起的指定控制能使用。'),
    op('#pick-buy-call','第一步：選買 Call','我們先練習「看漲且損失有限」的買方。點亮起的「買 Call」，記住它是支付權利金、買入權利。','direction',d=>d.side==='buy'&&d.type==='call'),
    op('#use-spot','把履約價帶入現價','點「帶入現價」。我們從接近價平的合約開始；你平常也能自行輸入數字，或長按加減。','spot'),
    op('#term-30','選 30 日的到期時間','點「30 日」。這是模擬交易日，不是日曆日期；這筆合約會獨立記住到期日。','term',d=>d.days===30),
    intro('#ticket-details','送出前先看成本與風險','這裡列出權利金、費用、深度、保證金、兩平點與最大到期損失。買 Call 不用賣方保證金，但仍要付足現金。損益曲線包含開倉費用。',{target:'#ticket .ticket-details'}),
    op('#buy','送出你的第一張買 Call 委託','目前是 1 口市價 IOC。點亮起的送出按鈕，按當輪 Ask 成交；每口收 15 虛擬元開倉費。','submit',d=>d.result.filled===1),
    intro('#position-panel','這裡顯示你剛買入的 Call','持倉記住方向、履約價、到期日與成本。未實現損益以當前平倉價估算，還沒扣未來平倉費。這時看到小額負值很正常。',{enter:()=>L.selectTab('holdings')}),
    quiz('#position-panel','為什麼剛買就看到負損益？','假設行情還沒移動，下單剛成交。最合理的原因是？',['系統保證買方會虧','Call 不能到期前賣掉','買入 Ask、平倉估 Bid，加上已付開倉費'],2,'買入付 Ask，若立即賣出只能收 Bid；再加上開倉費，所以一開始可能為負。這不是系統預測未來，而是交易成本。'),
    op('#tick','讓市場前進一輪','點「下一輪」。指數、IV、剩餘時間與報價都可能變動。先看變化，不用追求這一輪獲利。','advance'),
    intro('#risk-panel','看同一筆交易如何改變','Delta、Theta、Vega 都會跟著報價改變。指數走對方向，不一定足以抵消時間流逝、IV 下跌與交易成本。交易是在管理多個變數。'),
    op('#holdings-view .close-now','到期前賣出平倉','點亮起的「賣出平倉」。你正在結束這筆買方持倉，不是賣出新 Call 承擔新義務。','close',d=>d.result.filled===1,{enter:()=>L.selectTab('holdings')}),
    intro('#execution-fields','接著練習掛單','這次買 Call 用限價，不急著吃 Ask。委託可以等待，沒成交就還不是持倉。接下來會把買單掛在中價，再撤銷。',{enter:()=>L.prepareLimitPractice()}),
    op('#order-type','把委託方式改成限價','點這個選單，選「限價」。限價買單只接受不高於指定價格的成交。','order-type',d=>d.value==='limit'),
    op('#price-mid','帶入 Bid／Ask 的中間價格','點「帶入中價」。中價通常低於 Ask，因此這張買單此刻不會立即成交；掛在中價也不保證能買到。','mid'),
    op('#buy','送出限價買單','點送出。這次應該進到委託簿等待，而不是立刻出現持倉。資金也會為未成交買單保留。','submit',d=>['working','partial'].includes(d.result.status)),
    intro('#orders-view','找到等待中的委託','未成交部分會顯示「等待成交」與口數。若推進行情且 Ask 下降到限價內，它才可能成交；深度不足則可部分成交。',{enter:()=>L.selectTab('orders')}),
    op('#orders-view .cancel-order','把未成交委託撤掉','點這張單的「撤單」。它會釋放未成交部分保留的資金；已成交部分不會因為撤單而消失。','cancel'),
    quiz('#orders-view','撤單能反悔已成交部位嗎？','一張 3 口限價單先成交 1 口，另外 2 口等待。此時撤單會怎樣？',['三口都消失，好像沒下過單','剩下兩口取消，已成交一口仍是持倉','已成交的一口自動平倉'],1,'撤單只取消等待的兩口。已成交的一口要另外平倉，平倉仍有價格風險與費用。'),
    op('#strategy-mode','試試組合策略','點「組合策略」。這裡用同到期日的多腿合約，將一個想法變成可管理的損益形狀。','mode',d=>d.mode==='strategy',{enter:()=>L.selectTab('holdings')}),
    intro('#strategy-legs','一買一賣，做出牛市 Call 價差','我們買較低履約價 Call，同時賣較高履約價 Call，減少淨成本。最大損失有限，上方獲利也有限。兩腿要一起看，不能只看到賣腿收了多少權利金。'),
    op('#buy','整組送出，不分開裸露風險','點送出牛市 Call 價差。此練習室以兩腿相同口數整組撮合，深度取最薄一腿，未成交組數取消。','strategy',d=>d.result.filled===1),
    intro('#position-panel','兩腿一起管理','持倉會用同一個策略名稱分組，保證金也考慮同到期、同類型的垂直價差。若單獨賣掉保護腿，風險可能突然變成裸賣，所以會再次檢查資金。'),
    op('#holdings-view .close-group','把這組策略一起平倉','點「整組平倉」。這會維持各腿相同的處理口數，避免平倉過程先拆掉避險。','close-group',d=>d.result.qty===1),
    quiz('#risk-panel','最後一題：保證金是不是損失上限？','裸賣 Call 已經繳了保證金。如果指數持續大漲，損失最多只會到保證金嗎？',['是，保證金就是最多能輸的錢','不是，保證金會變，損失理論上無上限'],1,'保證金只是履約能力要求，不是損失上限。裸賣 Call 的理論損失無上限，跳空時即使有強制平倉，也可能超過原始資金。'),
    intro('#missions','你已經親手練完一輪！','開倉、提前平倉、限價掛單、撤單和價差策略，都完成了。接下來回到你的原本帳戶；繼續試不同到期日、方向與市場情境。需要時可重開教學。',{finish:true})
  ]};
  const titles={intro:'01 · 認識畫面',practice:'02 · 親手操作',risk:'04 · 情境與風險',orders:'05 · 部位、停損與到期',storage:'06 · 設定與存檔'};
  const S=window.OptionStrategies;
  for(const [id,s] of Object.entries(S)){
    const name='strategy-'+id;titles[name]='03 · '+s.name;
    courses[name]=[
      intro('#ticket',s.name+'：'+s.outlook,'本堂使用獨立練習帳戶，退出就會還原原本帳戶。'+s.structure),
      op('#strategy-mode','切換到組合策略','點「組合策略」。以下所有腿使用同到期日與相同組數。','mode',d=>d.mode==='strategy'),
      op('#strategy-select','選擇「'+s.name+'」','打開選單，選這個策略。下方會顯示每一腿的買賣方向與履約價。','strategy-select',d=>d.value===id),
      op('#use-spot','用現價作為起點','點「帶入現價」。這個策略的輸入數字代表「'+s.anchor+'」，其他腿會由距離推算；不是把每腿都設成同一數字。','spot'),
      ...(id==='straddle'?[
        intro('#strategy-legs','跨式不需要履約價距離','Call 和 Put 都用同一個履約價，所以距離欄會隱藏。兩腿都買入，沒有賣腿幫你分攤成本。')
      ]:[
        op('#strategy-width','把每段距離設為 40','直接輸入 40。'+(id==='condor'?'中心為 K 時，賣 Put 在 K−40、賣 Call 在 K＋40；保護腿在 K−80、K＋80。':'兩腿履約價相差 40 點。距離越寬，成本與風險形狀也可能改變。'),'strategy-width',d=>Number(d.value)===40),
        intro('#strategy-legs','看清楚每一腿做什麼',s.structure+' '+(id==='condor'?'本版兩翼等寬；一次只會在一側產生到期翼部損失。':'買腿與賣腿要一起算，不能只看到賣腿收到的權利金。'))
      ]),
      op('#term-30','選同一個 30 日到期','點「30 日」。同到期、同口數以及保護腿仍存在，是這個策略的風險條件。','term',d=>d.days===30),
      intro('#ticket .ticket-details','用這次報價檢查收付與最大損益','看淨權利金是收或付，再看費用、兩平點與最大損益。通常收權利金的策略，距離很窄時也可能被 Bid／Ask 價差吃掉，變成淨支出。數字以這次實際報價為準。'),
      intro('#payoff-chart','這張圖是假設保留所有腿到期',s.risk+' 圖與最大損益已計開倉費，未計提前平倉費。'+s.time),
      quiz('#strategy-legs',s.question,s.example,s.answers,s.correct,s.answer,'依題目先計算每腿的到期內含價值，再加上淨收款或扣掉淨支出。保護腿仍須保留。'),
      op('#buy','整組送出策略','點送出。此模擬器採整組市價 IOC，受最薄一腿深度限制；各腿成交組數一致，餘量取消。它沒有模擬多腿限價委託。','strategy',d=>d.result.filled===1),
      intro('#position-panel','現在持有整組策略','每腿分別列出報價、成本和到期日。拆掉保護腿會改變風險；原本的到期損失上限可能不再成立，資金不足時也會拒絕拆腿平倉。',{enter:()=>L.selectTab('holdings')}),
      op('#holdings-view .close-group','把整組一起平倉','點「整組平倉」。這裡保持各腿相同平倉組數；仍受本輪報價深度限制，沒有保證能一次全數成交。','close-group',d=>d.result.qty===1),
      intro('#history-view','查看這次的開倉與平倉紀錄','淨現金流不是每筆獲利。開倉收付、平倉收付與兩次費用合起來，才是這組已實現結果。完成後可以回選單學另一種策略。',{enter:()=>L.selectTab('history'),finish:true})
    ];
  }
  courses.risk=[
    intro('#ticket','把價格、IV、時間分開觀察','本堂使用獨立練習帳戶。先買一口 Call，再用不改動市場的情境試算逐一比較。'),
    op('#pick-buy-call','選買 Call','這筆買方部位通常受益於上漲，但還有時間和 IV 的影響。','direction',d=>d.side==='buy'&&d.type==='call'),
    op('#buy','買入一口 30 日 Call','點送出，建立要觀察的持倉。','submit',d=>d.result.filled===1),
    intro('#portfolio-greeks','先讀目前整個帳戶的敏感度','單位是「元」：Delta 是指數加 1 點；Theta 是經過 1 日；Vega 是 IV 加 1 個百分點。Gamma 是 Delta 的變化。它們是目前的小幅估計，不能直接乘上很大的行情幅度。'),
    op('#stress-panel summary','展開情境試算','點這一列，顯示價格、IV 與時間的假設。','stress-open',d=>d.value),
    op('[data-stress="up"]','只試指數上漲 10%','點「指數 +10%」。這個快捷鍵把 IV 和時間歸零，只改價格，方便公平比較。','stress-preset',d=>d.value==='up'),
    intro('.stress-result','結果是模型估值，不是成交收入','留意理論持倉變化。現實平倉還要看 Bid／Ask、深度與費用；不一定能拿到這個金額。即使全部假設為零，理論中價與目前平倉價也可能有差距。'),
    op('[data-stress="iv"]','只試 IV 增加 5 個百分點','點「IV +5」。這是例如 24% 變 29%，不是 24% 乘 1.05。此快捷鍵把指數與時間變化歸零。','stress-preset',d=>d.value==='iv'),
    intro('#stress-iv','IV 是另一個變數','IV 上升通常提高買入期權的到期前估值。組合策略的買賣腿會部分抵銷；不能把這筆買 Call 的結果套用到所有策略。'),
    op('[data-stress="time"]','只試經過 7 個交易日','點「經過 7 日」。價格與 IV 的變化歸零，觀察時間流逝的影響。','stress-preset',d=>d.value==='time'),
    quiz('#stress-panel','試算負值就是最多會虧的錢嗎？','這裡只試一組假設，也沒有模擬途中撮合與強制平倉。能把它當作最大損失嗎？',['可以，所有風險都已計入','不可以，只是這組假設的模型結果'],1,'不能。不同價格路徑、成交價差、後續費用和途中保證金變化，都可能改變實際結果。'),
    intro('.margin-meter','保證金占用不是虧損上限','有賣方部位時，行情可能提高保證金。可用資金不足會先撤掛單，再強制平倉；本版沒有補繳寬限期。跳空仍可能造成負債，不能把強平當作保證止損。'),
    op('[data-chart="equity"]','切換看帳戶權益','點「帳戶權益」。它包含持倉目前的平倉價值，與現金或指數價格是不同的線。','chart',d=>d.value==='equity'),
    op('#tick','真正讓市場前進一輪','點「下一輪」。這次會實際改動練習帳戶的行情、IV、時間與報價；情境試算快捷鍵不會。','advance'),
    intro('#market-chart','用權益走勢觀察持倉變化','你已比較三種影響。下一次可換跨式或價差，再看同樣的情境對不同組合會怎麼變。完成後還原原本帳戶與畫面設定。',{finish:true})
  ];
  courses.orders=[
    intro('#ticket','練習部分平倉、停損與到期','這次使用兩口、1 日到期的買 Call。所有操作都在獨立帳戶，原本部位與掛單會保留。'),
    op('#pick-buy-call','選買 Call','先用兩口買方部位觀察部分平倉。履約價已帶入現價，到期為 1 日。','direction',d=>d.side==='buy'&&d.type==='call'),
    op('#buy','買入兩口','看口數為 2，再送出市價 IOC。真實深度可能不足；本堂起始報價可以成交兩口。','submit',d=>d.result.filled===2),
    op('#holdings-view .close-qty','只平掉其中一口','把平倉口數從 2 改成 1；這個數字只影響這筆持倉。','close-quantity',d=>d.value===1,{enter:()=>L.selectTab('holdings')}),
    op('#holdings-view .close-now','送出一口賣出平倉','點「賣出平倉」。剩下一口仍持有，風險不會因部分平倉全部消失。','close',d=>d.result.filled===1),
    op('#holdings-view .close-edit','為剩下一口設定委託','點「委託」。交易區會變成管理這筆持倉，履約價與到期日鎖定，因為不能把原合約改成另一張。','edit-position'),
    op('#order-type','選停損市價','把方式改成「停損市價」。本版只能為既有持倉設定平倉停損，不能用它直接開倉。','order-type',d=>d.value==='stop'),
    intro('#limit-fields','觸發價不是保證成交價','買入 Call 的停損看可賣出的 Bid 下跌至觸發價，再轉市價 IOC。賣方買回則看 Ask。跳空時可能成交得更差，深度不足也可能只平掉部分。'),
    op('#time-in-force','把停損委託設為 GTC','選 GTC：保留到撤單、成交或合約到期。DAY 則在當日交易日邊界取消。兩者都不會把合約本身的到期日延後。','time-in-force',d=>d.value==='GTC',{enter:()=>{$('time-in-force').value='DAY';}}),
    op('#buy','送出平倉停損委託','目前觸發價低於 Bid，這張委託會先等待，不會立刻結束持倉。','close',d=>['working','partial'].includes(d.result.status)),
    intro('#orders-view','委託不等於已完成平倉','確認平倉、停損價格、GTC 與成交口數。只有實際成交才會減少部位；等待中的停損不代表已排除風險。',{enter:()=>L.selectTab('orders')}),
    op('#orders-view .cancel-order','先撤銷這張停損','點撤單。本堂接著保留剩下一口到期，觀察自動現金結算。','cancel'),
    quiz('#orders-view','停損價格可以保證守住嗎？','假設 Bid 跳過觸發價，而且只有部分深度，接下來會怎樣？',['保證全數按觸發價成交','轉市價 IOC，可能更差或未全數平倉','系統會撤回之前的開倉'],1,'停損只規定觸發條件。觸發後仍依當輪可成交報價與深度執行；剩餘部位需要繼續管理。'),
    intro('#next-expiry','剩下一口仍在 D1 到期','這是歐式現金結算，不能提前履約，但可以提前平倉。現在我們刻意不平剩餘一口，看看合約到期時的處理。'),
    op('#advance','推進一個交易日，到 D1','點「推進時間」。會依序走完六輪，日末檢查結算與委託；不是只看最後一個價格。','advance',()=>true,{enter:()=>{$('advance-days').value=1;}}),
    intro('#history-view','到期結算也會留下紀錄','找「到期結算」。Call 內含價值為 max(指數−履約價,0)，再乘 50 與剩餘口數入帳；價外是零。沒有交付股票，本版到期不另收費，但仍計入原本開倉成本。',{enter:()=>L.selectTab('history')}),
    quiz('#history-view','到期 Call 的收入等於獲利嗎？','假設一口 Call 履約價 1000、開倉付 12 點，到期指數 1010。只看點數，不計費用，損益為何？',['賺 10 點','虧 2 點','賺 22 點'],1,'到期只收到 10 點內含價值，減開倉支付 12 點，虧 2 點。看到現金收入，仍要扣掉先前成本。'),
    intro('#position-panel','練習完成','已練習部分平倉、既有持倉停損、GTC、撤單與到期結算。回到原本帳戶後，可用成交紀錄確認每筆交易如何影響現金與已實現損益。',{enter:()=>L.selectTab('holdings'),finish:true})
  ];
  courses.storage=[
    intro('#settings-dialog','直接認識設定畫面','這堂也會暫存原帳戶與設定。可退出還原；不會在教學中匯入檔案或開啟新回合。',{enter:()=>{const dialog=$('settings-dialog');dialog.showModal();dialog.append($('tour-root'));}}),
    op('#animation-setting','試著關閉畫面動畫','點右側開關，關閉星星、背景與互動特效。這不會改變模擬報價，也不會讓市場自動前進。','animations',d=>d.value===false,{enter:()=>{if(!$('animations').checked){$('animations').checked=true;$('animations').dispatchEvent(new Event('change'));}}}),
    intro('#save-state','自動存檔保存在這個瀏覽器','正常交易會自動保存；本堂練習不會覆寫原存檔。不同瀏覽器或裝置不會自動同步，清除網站資料也會移除本機進度。'),
    intro('#export-save','匯出是保留一份 JSON 存檔','正常使用時，按這裡下載目前帳戶、完整成交紀錄、學習進度與動畫設定。可用來備份或搬到其他裝置。本步只介紹，點畫面繼續。'),
    intro('.file-label','匯入會先檢查，再由你確認','選擇匯出的 JSON 後，畫面會列出日期、權益與持倉數。確認載入才會替換目前帳戶；請先匯出要保留的進度。'),
    intro('#scenario-select','選新回合的市場情境','可以選有漲有跌、上漲趨勢、下跌趨勢或高波動。趨勢不是單向保證：上漲市場仍會跌，高波動時價差也較寬。這個選單不會立刻改動現有市場。'),
    intro('#restart','新回合會重新開始帳戶','按這裡還有確認畫面，確認後才替換目前帳戶。先備份想保留的回合。完成本堂後會還原剛才的動畫設定與原帳戶。',{finish:true})
  ];
  let active=false,course='',steps=[],index=0,current=null,target=null,answered=false,waiting=false,priorFocus=null,priorScroll=0,advanceTimer=null,run=0;
  function box(id,x,y,w,h){const el=$(id);el.style.left=x+'px';el.style.top=y+'px';el.style.width=Math.max(0,w)+'px';el.style.height=Math.max(0,h)+'px';}
  function layout(){if(!active)return;target=document.querySelector(current.target);const W=document.documentElement.clientWidth,H=innerHeight,card=$('tour-card');let r=target?.getBoundingClientRect();if(!r||r.height===0)r={left:W/2-40,top:60,right:W/2+40,bottom:110,width:80,height:50};const pad=6,l=Math.max(3,Math.min(W-3,r.left-pad)),top=Math.max(3,Math.min(H-3,r.top-pad)),right=Math.max(l,Math.min(W-3,r.right+pad)),bottom=Math.max(top,Math.min(H-3,r.bottom+pad)),width=Math.max(0,right-l),height=Math.max(0,bottom-top);
    box('tour-top',0,0,W,top);box('tour-left',0,top,l,height);box('tour-right',right,top,W-right,height);box('tour-bottom',0,bottom,W,H-bottom);box('tour-outline',l,top,width,height);
    card.style.width=(W<=760?Math.max(0,W-24):340)+'px';const cw=card.offsetWidth,ch=card.offsetHeight;let x,y;
    if(W>760&&W-right>cw+24){x=right+16;y=Math.min(H-ch-14,Math.max(14,top));}
    else if(W>760&&l>cw+24){x=l-cw-16;y=Math.min(H-ch-14,Math.max(14,top));}
    else {x=Math.max(12,Math.min(W-cw-12,l));if(H-bottom>ch+22)y=bottom+16;else if(top>ch+22)y=top-ch-16;else y=H-ch-12;}
    card.style.left=Math.max(12,Math.min(W-cw-12,x))+'px';card.style.top=Math.max(12,Math.min(H-ch-12,y))+'px';
  }
  function scrollToTarget(){if(!target)return;if(target.closest('dialog[open]')){target.scrollIntoView({block:'center',behavior:'instant'});return;}const r=target.getBoundingClientRect(),desired=innerWidth<=760?Math.min(100,innerHeight*.18):Math.max(55,(innerHeight-Math.min(r.height,innerHeight*.62))/2);scrollTo({top:Math.max(0,scrollY+r.top-desired),behavior:'instant'});}
  let resizeFrame;
  function resizeTour(){if(!active)return;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{resizeFrame=requestAnimationFrame(()=>{if(!active)return;target=document.querySelector(current.target);scrollToTarget();layout();});});}
  function show(){if(!active)return;clearTimeout(advanceTimer);document.querySelectorAll('.tour-target').forEach(e=>e.classList.remove('tour-target'));current=steps[index];answered=false;waiting=false;current.enter?.();target=document.querySelector(current.target);if(!target||!target.getClientRects().length){finish();L.toast('這一步的控制目前無法使用，請重新開始教學。');return;}target.classList.add('tour-target');$('tour-kind').textContent=titles[course];$('tour-title').textContent=current.title;$('tour-copy').textContent=current.copy;$('tour-counter').textContent=`${index+1} / ${steps.length}`;$('tour-progress-fill').style.width=((index+1)/steps.length*100)+'%';$('tour-feedback').textContent='';$('tour-next').hidden=current.kind==='op';$('tour-next').disabled=current.kind==='quiz';$('tour-next').textContent=current.finish?'完成教學 ✦':'繼續 →';$('tour-hint').textContent=current.kind==='intro'?'點畫面任意處繼續 · Enter／Space 也可以':current.kind==='op'?'只操作亮起的控制；完成後會自動繼續':'選一個答案，答對後再繼續';$('tour-answers').replaceChildren();
    if(current.kind==='quiz')current.answers.forEach((answer,i)=>{const b=document.createElement('button');b.textContent=answer;b.addEventListener('click',()=>{if(i===current.correct){answered=true;b.classList.add('correct');$('tour-feedback').textContent=current.explanation;$('tour-next').disabled=false;[...$('tour-answers').children].forEach(x=>x.disabled=true);}else{b.classList.add('wrong');$('tour-feedback').textContent='再想一下：'+(current.title.includes('市場上漲')?'這題只問上漲是否有利，不是問哪個風險較小。分別想想買 Call 與賣 Put 的情況。':current.title.includes('反悔')?'委託和已成交持倉是兩件事。':current.hint);$('tour-feedback').className='negative';}if(answered)$('tour-feedback').className='positive';layout();});$('tour-answers').append(b);});
    scrollToTarget();layout();$('tour-card').focus({preventScroll:true});
  }
  function next(){if(!active||current.kind==='quiz'&&!answered)return;if(index===steps.length-1){finish(true);return;}index++;show();}
  function start(name){if(active||!courses[name])return;course=name;steps=courses[name];index=0;run++;priorFocus=document.activeElement;priorScroll=scrollY;$('tutorial-dialog').close();L.beginPractice();L.prepareLesson(name.replace('strategy-',''));active=true;$('tour-root').hidden=false;document.body.classList.add('tour-active');show();}
  function finish(completed=false){if(!active)return;const name=course;active=false;run++;clearTimeout(advanceTimer);cancelAnimationFrame(resizeFrame);$('tour-root').hidden=true;document.body.append($('tour-root'));if(name==='storage'&&$('settings-dialog').open)$('settings-dialog').close();document.querySelectorAll('.tour-target').forEach(e=>e.classList.remove('tour-target'));document.body.classList.remove('tour-active');L.finishPractice();if(completed)L.completedTutorial(name);L.toast(completed?'這堂已完成'+(name==='intro'?'，可以從選單接著練習。':'，已還原原本帳戶與設定 ✦'):'教學已退出，原本帳戶已保留。');if(priorFocus?.isConnected&&!priorFocus.closest('dialog:not([open])'))priorFocus.focus({preventScroll:true});else $('tutorial-open').focus({preventScroll:true});}
  function allowed(e){if(!active)return true;if($('tour-card').contains(e.target)){if(e.target.closest('button'))return true;if(current.kind==='intro'&&e.type==='click'){e.preventDefault();next();return false;}return true;}if(current.kind==='op'&&target?.contains(e.target)&&!waiting)return true;e.preventDefault();e.stopImmediatePropagation();if(e.type==='click'){if(current.kind==='intro')next();else if(current.kind==='op')$('tour-hint').textContent='先完成亮起的指定操作，才能往下一步。';}return false;}
  // Capture both press and click so hidden background controls, including hold-repeat, cannot mutate the account.
  for(const event of ['pointerdown','click','dblclick'])document.addEventListener(event,allowed,true);
  document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish();return;}if(current.kind==='intro'&&['Enter',' '].includes(e.key)&&!e.target.closest('#tour-card button')){e.preventDefault();e.stopImmediatePropagation();next();return;}
    if(e.key==='Tab'){const focusables=[...$('tour-card').querySelectorAll('button:not(:disabled):not([hidden])')];if(current.kind==='op'&&target){if(target.matches('button,input,select,summary'))focusables.unshift(target);else focusables.unshift(...target.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled)'));}if(focusables.length){e.preventDefault();const at=focusables.indexOf(document.activeElement),i=(at+(e.shiftKey?-1:1)+focusables.length)%focusables.length;focusables[i].focus({preventScroll:true});}return;}
    if(!$('tour-card').contains(e.target)&&!(current.kind==='op'&&target?.contains(e.target))){e.preventDefault();e.stopImmediatePropagation();}
  },true);
  document.addEventListener('lab:action',e=>{if(!active||current.kind!=='op'||waiting||e.detail.name!==current.event||!current.test(e.detail))return;waiting=true;const token=run,at=index;advanceTimer=setTimeout(()=>{if(active&&run===token&&index===at)next();},240);});
  document.addEventListener('lab:render',()=>{if(active)layout();});addEventListener('resize',resizeTour);addEventListener('scroll',layout,{passive:true});
  function menu(){
    const all=Object.keys(courses),done=all.filter(name=>L.lessonDone(name)).length;
    $('lesson-progress').textContent=`已完成 ${done} / ${all.length} 堂 · 可以依需求選課，也可以重練`;
    document.querySelectorAll('[data-course]').forEach(b=>{const name=b.dataset.course,completed=L.lessonDone(name);b.classList.toggle('lesson-done',completed);b.querySelector('b').textContent=completed?'已完成 · 再練一次 →':name==='intro'?'開始導覽 →':'進入練習 →';});
  }
  function courseButton(name,heading,title,copy){const b=document.createElement('button');b.dataset.course=name;const span=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small'),status=document.createElement('b');span.textContent=heading;strong.textContent=title;small.textContent=copy;b.append(span,strong,small,status);return b;}
  for(const [id,s] of Object.entries(S))$('strategy-courses').append(courseButton('strategy-'+id,s.outlook,s.name,id==='straddle'?'2 腿 · 同履約價 · 大幅移動':id==='condor'?'4 腿 · 兩側保護 · 區間盤整':'2 腿 · 同到期價差 · 有限到期風險'));
  for(const [id,title,copy] of [['risk','比較價格、IV 與時間','Greeks、三組試算、保證金與權益圖'],['orders','管理部位到到期','部分平倉、停損、GTC、撤單與現金結算'],['storage','設定與保留進度','動畫、備份、匯入與新回合']])$('more-courses').append(courseButton(id,titles[id],title,copy));
  $('tour-exit').addEventListener('click',()=>finish());$('tour-next').addEventListener('click',next);
  for(const id of ['tutorial-open','welcome-tutorial'])$(id).addEventListener('click',()=>{menu();$('tutorial-dialog').showModal();});
  document.querySelectorAll('[data-course]').forEach(b=>b.addEventListener('click',()=>start(b.dataset.course)));
  $('strategy-guide').addEventListener('click',()=>start('strategy-'+$('strategy-select').value));
})();
