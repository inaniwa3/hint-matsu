let botui = new BotUI('hint-matsu');

// global game variables
let games = 0;
let ans = '';
let ans_stroke = 0;
let ans_roman = '';

// work-around as markdown is not always correctly parsed
function icon (iconName) {
  return '<i class="botui-icon botui-message-content-icon fa fa-' + iconName + '"></i>';
}

// initialize
function init () {
  while (true) {
    const idx = Math.floor(Math.random() * Object.keys(KANJI).length);
    const key = Object.keys(KANJI)[idx];
    if (ans_roman === '')
    {
      for (let i = 0; i < KANJI[key][1].length; i++)
      {
        const key_roman = KANJI[key][1][i][0];
        if (key_roman in ROMAN)
        {
          if (ans_roman === '')
          {
            ans = key;
            ans_roman = ROMAN[key_roman];
          }
          else if (ans_roman !== ROMAN[key_roman])
          {
            // 音読み頭文字が複数ある場合はやり直し
            ans_roman = '';
            break;
          }
        }
      }
    }
    else
    {
      if (ans !== key)  // 同じ文字の連続にはしない
      {
        ans += key;
        break;
      }
    }
  }
  // ans = '令和'; ans_roman = 'r';
  ans_stroke = KANJI[ans[0]][0] + KANJI[ans[1]][0];
  // console.log(ans + ' '  + ans_stroke + ' ' + ans_roman);
}

// hint
function hint (rep) {
  let h = [false, false, false];
  if (rep.length !== 2)
    return h;

  let rep0_val = [9999, ['']];
  if (rep[0] in KANJI)
    rep0_val = KANJI[rep[0]];
  let rep1_val = [9999, ['']];
  if (rep[1] in KANJI)
    rep1_val = KANJI[rep[1]];

  if (rep0_val[0] + rep1_val[0] === ans_stroke)
  {
    h[0] = true;
  }
  for (let i = 0; i < rep0_val[1].length; i++)
  {
    const key_roman = rep0_val[1][i].replace('（', '')[0];
    if (key_roman in ROMAN)
    {
      if (ROMAN[key_roman] === ans_roman)
      {
        h[1] = true;
      }
    }
  }
  if (rep.includes(ans[0]) || rep.includes(ans[1]))  // 位置は見ない
  {
    h[2] = true;
  }
  return h;
}

// entrypoint for the conversation
function hello () {
  botui.message.add({
    delay: 500,
    type: 'html',
    content: '漢字二文字の組み合わせを当ててください。使用するのは常用漢字2136字です。ギブアップする場合は「答え」と入力すると正解が表示されます。',
  });
  main();
};

// main game loop
function main () {
  botui.action.text({
    delay: 1000,
    action: {},
  }).then(function (res) {
    games += 1;
    const h = hint(res.value);
    if (res.value === '答え')
    {
      games -= 1;
      botui.message.add({
        delay: 500,
        type: 'html',
        content: ans,
      });
      main();
    }
    else if (res.value === ans)
    {
      goodbye();
    }
    else if (!h[0] && !h[1] && !h[2])
    {
      botui.message.add({
        delay: 500,
        type: 'html',
        content: '...',
      });
      main();
    }
    else
    {
      let result_msg = icon('lightbulb-o');
      for (let i = 0; i < h.length; i++)
      {
        if (h[i])
        {
          botui.message.add({
            delay: 250 * (i + 1),
            type: 'html',
            content: result_msg,
          });
        }
        result_msg += ' ' + icon('lightbulb-o');
      }
      main();
    }
  });
}

function goodbye () {
  botui.message.add({
    delay: 500,
    type: 'html',
    content: '正解です！<br/>総回答数 ' + games + '回',
  });
}

init();
hello();
