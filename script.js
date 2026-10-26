/* =========================================================
   СКРИПТ САЙТА «ИНФОРМАТИКА»
   Здесь вся «оживающая» часть сайта:
     1. Частицы на фоне
     2. Меню (бургер, подсветка раздела, появление блоков)
     3. Калькулятор двоичных чисел (3 вкладки)
     4. Тест
   Код разделён на блоки — каждый можно объяснить отдельно.
   ========================================================= */

/* Вспомогательная функция: короткая запись вместо document.getElementById */
const $ = (id) => document.getElementById(id);


/* =========================================================
   1. ЧАСТИЦЫ НА ФОНЕ
   Рисуем маленькие точки на <canvas>. Они медленно плывут,
   а если две точки рядом — между ними появляется тонкая линия.
   ========================================================= */
(function particles() {
  const canvas = $("particles");
  const ctx = canvas.getContext("2d");

  let width, height, dots = [];

  // Настройки — тут можно менять вид частиц
  const SIZE_MIN = 0.6;        // минимальный радиус точки (px)
  const SIZE_MAX = 1.6;        // максимальный радиус точки (px) — маленькие!
  const SPEED = 0.25;          // скорость движения
  const LINK_DISTANCE = 110;   // на каком расстоянии рисуем линию между точками
  const COLOR = "148, 220, 255"; // цвет частиц в формате R, G, B

  // Подгоняем размер canvas под окно (и под «плотность» экрана для чёткости)
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Количество частиц зависит от размера экрана (но не больше 90)
    const count = Math.min(90, Math.floor((width * height) / 16000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
      r: SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN),
    }));
  }

  // Один кадр: очищаем, двигаем точки, рисуем точки и линии
  function frame() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];

      // Двигаем точку. Если вышла за край — появляется с другой стороны
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0) d.x = width;
      if (d.x > width) d.x = 0;
      if (d.y < 0) d.y = height;
      if (d.y > height) d.y = 0;

      // Рисуем саму точку
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${COLOR}, 0.7)`;
      ctx.fill();

      // Сравниваем с остальными точками: близкие соединяем линией
      for (let j = i + 1; j < dots.length; j++) {
        const o = dots[j];
        const dist = Math.hypot(d.x - o.x, d.y - o.y);
        if (dist < LINK_DISTANCE) {
          // Чем ближе точки, тем ярче линия
          const alpha = (1 - dist / LINK_DISTANCE) * 0.18;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(o.x, o.y);
          ctx.strokeStyle = `rgba(${COLOR}, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    // Просим браузер вызвать frame ещё раз на следующем кадре (~60 раз в секунду)
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);

  // Если у человека включено «уменьшить анимацию» — рисуем один неподвижный кадр
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    dots.forEach((d) => { d.vx = 0; d.vy = 0; });
    frame();
    return;
  }
  frame();
})();


/* =========================================================
   2. МЕНЮ И ПОЯВЛЕНИЕ БЛОКОВ
   ========================================================= */
(function navigation() {
  const burger = $("burger");
  const nav = $("nav");

  // Бургер: открыть / закрыть меню на телефоне
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open);
  });

  // После клика по пункту меню закрываем его
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", false);
    })
  );

  // IntersectionObserver — «следит», какие блоки попали на экран.
  // 1) Плавно показываем блоки с классом .reveal
  const reveals = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("visible"));
  } else {
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObs.unobserve(e.target); // показали один раз — больше не следим
          }
        });
      },
      { threshold: 0.08 }
    );
    reveals.forEach((el) => revealObs.observe(el));

    // 2) Подсвечиваем в меню раздел, который сейчас на экране
    const links = [...nav.querySelectorAll("a")];
    const spyObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) =>
              l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id)
            );
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((s) => spyObs.observe(s));
  }
})();


/* =========================================================
   3. КАЛЬКУЛЯТОР ДВОИЧНЫХ ЧИСЕЛ
   ========================================================= */
(function calculator() {

  /* ---------- Вкладки ---------- */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      // Снимаем выделение со всех и включаем нужную вкладку
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      $("panel-" + tab.dataset.tab).classList.add("active");
    })
  );

  /* ---------- Вкладка 1: ПЕРЕВОД ЧИСЕЛ ---------- */
  const inDec = $("inDec");
  const inBin = $("inBin");
  const MAX = 4294967295; // 2^32 − 1: максимум, с которым работаем (32 бита)

  // Показываем результат во всех системах счисления сразу
  function showConversion(n) {
    $("outBin").textContent = n.toString(2);                 // двоичная
    $("outDec").textContent = n.toString(10);                // десятичная
    $("outHex").textContent = n.toString(16).toUpperCase(); // шестнадцатеричная
    $("outOct").textContent = n.toString(8);                 // восьмеричная
  }

  function clearConversion() {
    ["outBin", "outDec", "outHex", "outOct"].forEach((id) => ($(id).textContent = "—"));
    $("steps").innerHTML = '<li class="muted">Введи число — здесь появится решение.</li>';
  }

  function addStep(text, className) {
    const li = document.createElement("li");
    li.textContent = text;
    if (className) li.className = className;
    $("steps").appendChild(li);
  }

  // Пошаговый перевод десятичного числа в двоичное (делим на 2)
  function stepsDecToBin(n) {
    $("steps").innerHTML = "";
    if (n === 0) {
      addStep("0 ÷ 2 = 0, остаток 0");
    }
    let x = n;
    while (x > 0) {
      const q = Math.floor(x / 2); // целая часть от деления
      const r = x % 2;             // остаток
      addStep(`${x} ÷ 2 = ${q}, остаток ${r}`);
      x = q;
    }
    addStep(`Читаем остатки снизу вверх → ${n.toString(2)}`, "final");
  }

  // Пошаговый перевод двоичного числа в десятичное (сумма степеней двойки)
  function stepsBinToDec(bin) {
    $("steps").innerHTML = "";
    const parts = [];
    for (let i = 0; i < bin.length; i++) {
      const power = bin.length - 1 - i;       // номер разряда справа
      parts.push(`${bin[i]}×${2 ** power}`);
    }
    addStep(`Разряды справа налево — степени двойки`);
    addStep(parts.join(" + "));
    addStep(`Сумма = ${parseInt(bin, 2)}`, "final");
  }

  // Ввод десятичного числа
  inDec.addEventListener("input", () => {
    const v = inDec.value.trim();
    $("convError").textContent = "";
    if (v === "") { inBin.value = ""; clearConversion(); return; }

    if (!/^\d+$/.test(v)) {
      $("convError").textContent = "В десятичном числе могут быть только цифры 0–9.";
      return;
    }
    const n = Number(v);
    if (n > MAX) {
      $("convError").textContent = "Слишком большое число. Максимум — 4 294 967 295 (32 бита).";
      return;
    }
    inBin.value = n.toString(2);   // сразу заполняем соседнее поле
    showConversion(n);
    stepsDecToBin(n);
  });

  // Ввод двоичного числа
  inBin.addEventListener("input", () => {
    const v = inBin.value.trim();
    $("convError").textContent = "";
    if (v === "") { inDec.value = ""; clearConversion(); return; }

    if (!/^[01]+$/.test(v)) {
      $("convError").textContent = "В двоичном числе могут быть только 0 и 1.";
      return;
    }
    if (v.length > 32) {
      $("convError").textContent = "Не больше 32 разрядов.";
      return;
    }
    const n = parseInt(v, 2);     // parseInt(строка, 2) читает строку как двоичное число
    inDec.value = String(n);
    showConversion(n);
    stepsBinToDec(v);
  });

  /* ---------- Вкладка 2: 8 БИТОВ ---------- */
  const bitsBox = $("bits");
  const bitState = new Array(8).fill(0);    // 8 нулей: состояние каждого бита

  // Создаём 8 кнопок. Вес бита: 128, 64, 32, 16, 8, 4, 2, 1
  for (let i = 0; i < 8; i++) {
    const weight = 2 ** (7 - i);
    const wrap = document.createElement("div");
    wrap.className = "bit";
    wrap.innerHTML = `<button type="button" aria-label="Бит с весом ${weight}">0</button><small>${weight}</small>`;
    const btn = wrap.querySelector("button");

    btn.addEventListener("click", () => {
      bitState[i] = bitState[i] ? 0 : 1; // переключаем 0 ↔ 1
      renderBits();
    });
    bitsBox.appendChild(wrap);
  }

  function renderBits() {
    const buttons = bitsBox.querySelectorAll("button");
    buttons.forEach((b, i) => {
      b.textContent = bitState[i];
      b.classList.toggle("on", bitState[i] === 1);
    });
    const bin = bitState.join("");
    const dec = parseInt(bin, 2);
    $("bitsBin").textContent = bin;
    $("bitsDec").textContent = dec;
    $("bitsHex").textContent = dec.toString(16).toUpperCase().padStart(2, "0");
  }

  $("bitsReset").addEventListener("click", () => {
    bitState.fill(0);
    renderBits();
  });

  $("bitsRandom").addEventListener("click", () => {
    const n = Math.floor(Math.random() * 256); // случайное число 0–255
    n.toString(2).padStart(8, "0").split("").forEach((ch, i) => (bitState[i] = Number(ch)));
    renderBits();
  });

  renderBits();

  /* ---------- Вкладка 3: ОПЕРАЦИИ ---------- */
  const opA = $("opA");
  const opB = $("opB");
  const opSign = $("opSign");

  function clearOps() {
    $("opBin").textContent = "—";
    $("opDec").textContent = "—";
    $("opCheck").textContent = "";
  }

  function calcOps() {
    const a = opA.value.trim();
    const b = opB.value.trim();
    $("opError").textContent = "";
    clearOps();
    if (a === "" || b === "") return;

    if (!/^[01]+$/.test(a) || !/^[01]+$/.test(b)) {
      $("opError").textContent = "В двоичных числах могут быть только 0 и 1.";
      return;
    }
    if (a.length > 32 || b.length > 32) {
      $("opError").textContent = "Не больше 32 разрядов в каждом числе.";
      return;
    }

    // BigInt — тип для больших целых чисел (чтобы умножение не «ломалось»)
    const x = BigInt("0b" + a);
    const y = BigInt("0b" + b);
    const sign = opSign.value;
    let result, note;

    if (sign === "+") {
      result = x + y;
      note = `${x} + ${y} = ${result}`;
    } else if (sign === "-") {
      result = x - y;                  // может получиться отрицательное
      note = `${x} − ${y} = ${result}`;
    } else if (sign === "*") {
      result = x * y;
      note = `${x} × ${y} = ${result}`;
    } else {
      if (y === 0n) {
        $("opError").textContent = "Делить на ноль нельзя.";
        return;
      }
      result = x / y;                  // целочисленное деление
      const rest = x % y;
      note = `${x} ÷ ${y} = ${result}` + (rest ? `, остаток ${rest}` : "");
    }

    // Для отрицательных чисел пишем минус перед двоичной записью модуля
    const abs = result < 0n ? -result : result;
    const bin = (result < 0n ? "-" : "") + abs.toString(2);

    $("opBin").textContent = bin;
    $("opDec").textContent = result.toString();
    $("opCheck").textContent = "Проверка в десятичной: " + note;
  }

  [opA, opB].forEach((el) => el.addEventListener("input", calcOps));
  opSign.addEventListener("change", calcOps);
})();


/* =========================================================
   4. ТЕСТ
   Вопросы лежат в массиве объектов. Каждый объект:
     q    — текст вопроса
     a    — варианты ответа
     right — номер правильного ответа (с нуля)
     why  — пояснение, которое показываем после ответа
   ========================================================= */
(function quiz() {
  const questions = [
    {
      q: "Сколько будет 1011 в двоичной системе, если перевести в десятичную?",
      a: ["9", "11", "13", "15"],
      right: 1,
      why: "1011 = 8 + 0 + 2 + 1 = 11.",
    },
    {
      q: "Сколько бит в одном байте?",
      a: ["4", "8", "16", "10"],
      right: 1,
      why: "1 байт = 8 бит. Поэтому один байт может хранить числа от 0 до 255.",
    },
    {
      q: "Какое устройство считается «мозгом» компьютера?",
      a: ["Видеокарта", "Оперативная память", "Процессор", "Блок питания"],
      right: 2,
      why: "Процессор выполняет команды программ и обрабатывает данные.",
    },
    {
      q: "Что из этого НЕ является свойством алгоритма?",
      a: ["Конечность", "Дискретность", "Непонятность", "Определённость"],
      right: 2,
      why: "Алгоритм должен быть понятным исполнителю, а не «непонятным».",
    },
    {
      q: "Что поможет защититься от взлома аккаунта?",
      a: [
        "Один и тот же пароль на всех сайтах",
        "Пароль 123456",
        "Длинный пароль и двухфакторная защита",
        "Отправить пароль другу на хранение",
      ],
      right: 2,
      why: "Длинный уникальный пароль плюс второй фактор — самая простая и надёжная защита.",
    },
  ];

  let current = 0;  // номер текущего вопроса
  let score = 0;    // количество правильных ответов

  const elCount = $("quizCount");
  const elBar = $("quizBar");
  const elQ = $("quizQuestion");
  const elAnswers = $("quizAnswers");
  const elExplain = $("quizExplain");
  const elNext = $("quizNext");

  // Показываем текущий вопрос
  function show() {
    const item = questions[current];
    elCount.textContent = `Вопрос ${current + 1} из ${questions.length}`;
    elBar.style.width = (current / questions.length) * 100 + "%";
    elQ.textContent = item.q;
    elExplain.textContent = "";
    elNext.hidden = true;
    elAnswers.innerHTML = "";

    // Для каждого варианта делаем кнопку
    item.a.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.className = "answer";
      btn.textContent = text;
      btn.addEventListener("click", () => choose(i));
      elAnswers.appendChild(btn);
    });
  }

  // Игрок выбрал вариант i
  function choose(i) {
    const item = questions[current];
    const buttons = elAnswers.querySelectorAll(".answer");

    buttons.forEach((b, idx) => {
      b.disabled = true;                                   // блокируем повторные клики
      if (idx === item.right) b.classList.add("correct");  // правильный — зелёный
    });

    if (i === item.right) {
      score++;
      elExplain.textContent = "Верно! " + item.why;
    } else {
      buttons[i].classList.add("wrong");                   // ошибочный — красный
      elExplain.textContent = "Не совсем. " + item.why;
    }

    elNext.textContent = current === questions.length - 1 ? "Результат →" : "Дальше →";
    elNext.hidden = false;
  }

  // Кнопка «Дальше»
  elNext.addEventListener("click", () => {
    current++;
    if (current < questions.length) show();
    else finish();
  });

  // Конец теста: показываем итог и кнопку «заново»
  function finish() {
    elBar.style.width = "100%";
    elCount.textContent = "Готово!";
    elAnswers.innerHTML = "";
    elNext.hidden = true;

    let verdict;
    if (score === questions.length) verdict = "Отлично, ты знаешь тему на максимум!";
    else if (score >= 3) verdict = "Хороший результат. Можно ещё раз пройти разделы выше.";
    else verdict = "Стоит перечитать разделы и попробовать снова.";

    elQ.innerHTML = `<span class="score grad">${score} / ${questions.length}</span>`;
    elExplain.textContent = verdict;

    const again = document.createElement("button");
    again.className = "btn primary";
    again.textContent = "Пройти заново";
    again.addEventListener("click", () => { current = 0; score = 0; show(); });
    elAnswers.appendChild(again);
  }

  show();
})();
