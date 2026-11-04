/* Ремонтус44 — калькулятор стоимости работ.
   Один файл без зависимостей: работает офлайн, данные в localStorage.
   Справочники машин и нормо-часов лежат в data/cars.js и data/labor.js. */

(function () {
  "use strict";

  /* ---------- данные ---------- */

  var CATS = [
    { id: "top", name: "Частое" },
    { id: "diag", name: "Диагностика" },
    { id: "ac", name: "Кондиционер" },
    { id: "engine", name: "Двигатель" },
    { id: "fuel", name: "Топливо" },
    { id: "visit", name: "Выезд" }
  ];

  var PINNED = ["diag-comp", "endo", "ac-freon", "timing-belt", "timing-chain", "oil", "plugs", "visit"];

  var SERVICES = [
    /* диагностика */
    { id: "diag-comp", cat: "diag", guide: "diag_comp", name: "Компьютерная диагностика", note: "Чтение ошибок, анализ параметров в динамике", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "сканер компьютерная ошибки чек лаунч launch" },
    { id: "diag-engine", cat: "diag", name: "Диагностика двигателя", note: "Параметры, компрессия, подсос воздуха, давление топлива", min: 1500, max: 3000, tmin: 30, tmax: 60, tags: "двигатель троит компрессия подсос топливо" },
    { id: "diag-full", cat: "diag", name: "Комплексная диагностика", note: "Все блоки плюс механические замеры", min: 3000, max: 3000, tmin: 60, tmax: 60, tags: "комплексная полная все блоки" },
    { id: "endo", cat: "diag", name: "Видеоэндоскопия, 4 цилиндра", note: "Задиры, нагар, хон, клапаны. Фото и видеоотчёт", min: 2000, max: 2500, tmin: 45, tmax: 45, tags: "эндоскоп эндоскопия задиры камера цилиндры хон нагар" },
    { id: "adapt", cat: "diag", name: "Адаптация дросселя, АКПП, робота", note: "Если адаптацию заказывают отдельно — диагностика бесплатно", min: 2000, max: 3000, tmin: 40, tmax: 60, tags: "адаптация дроссель акпп робот обучение" },
    { id: "diag-abs", cat: "diag", name: "Диагностика ABS и SRS", note: "По блокам, с расшифровкой ошибок", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "abs srs абс подушка тормоза" },
    { id: "diag-srs", cat: "diag", name: "Диагностика подушек и ремней", note: "SRS, датчики удара, преднатяжители", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "srs подушки ремни безопасность" },
    { id: "diag-akpp", cat: "diag", name: "Диагностика АКПП и РКПП", note: "Ошибки, параметры, проверка адаптаций", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "акпп ркпп коробка вариатор" },
    { id: "diag-el", cat: "diag", name: "Диагностика электрооборудования", note: "Проверка цепей, датчиков, потребителей", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "электрика электрооборудование проводка датчик" },
    { id: "diag-charge", cat: "diag", name: "Проверка зарядки и утечки тока", note: "Генератор, АКБ, поиск потребителя", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "зарядка генератор акб утечка ток" },
    { id: "diag-inj", cat: "diag", name: "Тест форсунок на стенде", note: "Производительность, распыл, баланс", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "форсунки тест стенд распыл" },
    { id: "diag-smoke", cat: "diag", name: "Дымогенератор, поиск подсоса", note: "Впуск, вакуумные линии, сальники", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "дымогенератор подсос вакуум впуск" },
    { id: "diag-compress", cat: "diag", name: "Замер компрессии", note: "По цилиндрам, с расшифровкой", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "компрессия замер цилиндры" },
    { id: "diag-oscillo", cat: "diag", name: "Осциллограф, мотортестер", note: "Сигналы датчиков, зажигание, форсунки", min: 2000, max: 2000, tmin: 45, tmax: 45, tags: "осциллограф мотортестер сигнал" },
    { id: "diag-dpf", cat: "diag", name: "Диагностика EGR, DPF, сажевого", note: "Засорение, ошибки, прожиг", min: 2000, max: 2000, tmin: 45, tmax: 45, tags: "egr dpf сажевый фильтр прожиг" },
    { id: "diag-4wd", cat: "diag", name: "Диагностика полного привода", note: "Раздатка, муфта, мосты", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "полный привод раздатка муфта мост 4wd" },
    { id: "diag-immobilizer", cat: "diag", name: "Иммобилайзер и ключи", note: "Прописка, привязка, восстановление", min: 2000, max: 2000, tmin: 45, tmax: 45, tags: "иммобилайзер ключ прописка привязка" },
    { id: "diag-noise", cat: "diag", name: "Поиск шумов и стуков", note: "Стетоскоп, прослушивание узлов", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "шум стук стетоскоп" },
    { id: "coding", cat: "diag", name: "Кодирование и активация функций", note: "Скрытые функции, замена блоков", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "кодирование активация функции блок" },
    { id: "prebuy", cat: "diag", name: "Проверка авто перед покупкой", note: "Электроника, ошибки, пробег, по запросу — эндоскопия", min: 4500, max: 4500, tmin: 90, tmax: 90, tags: "покупка осмотр подбор проверка" },
    { id: "service-reset", cat: "diag", name: "Сброс сервисного интервала", note: "После замены масла, напоминания", min: 800, max: 800, tmin: 15, tmax: 15, tags: "сервис сброс масло напоминание" },
    { id: "battery", cat: "diag", name: "Регистрация нового АКБ", note: "Прописка батареи в блоке управления", min: 800, max: 800, tmin: 15, tmax: 15, tags: "акб аккумулятор батарея прописка" },
    { id: "epb", cat: "diag", name: "Разведение колодок ручника", note: "Для замены тормозных колодок", min: 800, max: 800, tmin: 15, tmax: 15, tags: "ручник колодки тормоза электронный" },

    /* кондиционер */
    { id: "ac-freon", cat: "ac", guide: "ac_freon", name: "Заправка кондиционера R134a", note: "Работа + газ по факту, 3 ₽ за 1 г", base: 1500, perGram: 3, tmin: 40, tmax: 40, tags: "заправка фреон кондиционер r134a газ" },
    { id: "ac-clean", cat: "ac", name: "Заправка очищенным фреоном", note: "После откачки: фильтрация и возврат газа. Газ не оплачивается", min: 1800, max: 1800, tmin: 40, tmax: 40, tags: "очищенный фреон свой газ повторно вернуть" },
    { id: "ac-recover", cat: "ac", name: "Откачка фреона", note: "Слив в баллон перед ремонтом, с сохранением или утилизацией", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "откачка слить газ баллон утилизация" },
    { id: "ac-leak", cat: "ac", name: "Опрессовка и поиск утечек", note: "Проверка герметичности перед заправкой", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "утечка опрессовка герметичность" },
    { id: "ac-nitro", cat: "ac", name: "Опрессовка азотом", note: "Для систем, где фреон уже ушёл", min: 1500, max: 1500, tmin: 45, tmax: 45, tags: "азот опрессовка давление" },
    { id: "ac-uv", cat: "ac", name: "Поиск утечки УФ-красителем", note: "С последующей проверкой лампой", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "уф краска краситель утечка лампа" },
    { id: "ac-flush", cat: "ac", name: "Промывка системы", note: "Со снятием запаха", min: 2000, max: 2000, tmin: 60, tmax: 60, tags: "промывка" },
    { id: "ac-antibac", cat: "ac", name: "Обработка испарителя", note: "Антибактериальная, против запаха в салоне", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "запах антибактериальная испаритель" },
    { id: "ac-filter", cat: "ac", name: "Замена салонного фильтра", note: "Фильтр отдельно", min: 500, max: 500, tmin: 15, tmax: 15, tags: "салонный фильтр" },
    { id: "ac-compressor", cat: "ac", guide: "ac_compressor", name: "Замена компрессора", note: "Запчасть и фреон отдельно", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "компрессор" },
    { id: "ac-clutch", cat: "ac", name: "Замена муфты компрессора", note: "Без снятия компрессора, если позволяет доступ", min: 3000, max: 3000, tmin: 60, tmax: 60, tags: "муфта компрессор" },
    { id: "ac-radiator", cat: "ac", name: "Замена радиатора кондиционера", note: "Запчасть и фреон отдельно", min: 5000, max: 5000, tmin: 150, tmax: 150, tags: "радиатор конденсор" },
    { id: "ac-evaporator", cat: "ac", name: "Замена испарителя", note: "Со снятием панели, запчасть отдельно", min: 7000, max: 7000, tmin: 240, tmax: 240, tags: "испаритель панель" },
    { id: "ac-expansion", cat: "ac", name: "Замена расширительного клапана", note: "ТРВ, с откачкой и заправкой", min: 3000, max: 3000, tmin: 90, tmax: 90, tags: "трв расширительный клапан" },
    { id: "ac-drier", cat: "ac", name: "Замена осушителя", note: "С откачкой и заправкой системы", min: 2000, max: 2000, tmin: 60, tmax: 60, tags: "осушитель фильтр" },
    { id: "ac-pipes", cat: "ac", name: "Замена трубок и датчиков", note: "По объёму работ", min: 2000, max: 2000, tmin: 60, tmax: 60, tags: "трубки датчик" },
    { id: "ac-sensor", cat: "ac", name: "Замена датчика давления", note: "С откачкой и заправкой", min: 1500, max: 1500, tmin: 45, tmax: 45, tags: "датчик давления" },
    { id: "ac-fan", cat: "ac", name: "Замена вентилятора кондиционера", note: "Запчасть отдельно", min: 2500, max: 2500, tmin: 60, tmax: 60, tags: "вентилятор fan" },
    { id: "ac-belt", cat: "ac", name: "Замена ремня компрессора", note: "Если привод отдельный", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "ремень компрессор" },
    { id: "ac-valve", cat: "ac", name: "Замена клапанов и штуцеров", note: "С откачкой и заправкой", min: 1500, max: 1500, tmin: 45, tmax: 45, tags: "клапан штуцер" },
    { id: "ac-oil", cat: "ac", name: "Добавка масла в систему", note: "При замене узлов и после откачки", min: 800, max: 800, tmin: 15, tmax: 15, tags: "масло кондиционер" },
    { id: "ac-diag", cat: "ac", name: "Диагностика кондиционера", note: "Не холодит, не включается, шумит", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "не холодит диагностика кондиционера" },

    /* двигатель */
    { id: "timing-belt", cat: "engine", norm: "timing_belt", name: "Замена ремня ГРМ", note: "С роликами и натяжителями", min: 5000, max: 6000, tmin: 150, tmax: 180, tags: "грм ремень ролики натяжитель" },
    { id: "timing-chain", cat: "engine", norm: "timing_chain", name: "Замена цепи ГРМ", note: "Зависит от компоновки под капотом", min: 8000, max: 9000, tmin: 240, tmax: 270, tags: "грм цепь" },
    { id: "timing-tensioner", cat: "engine", norm: "timing_tensioner", name: "Замена натяжителя цепи", note: "Без снятия двигателя", min: 3000, max: 3000, tmin: 90, tmax: 90, tags: "натяжитель цепь грм" },
    { id: "vvt", cat: "engine", norm: "vvt", name: "Замена фазорегулятора", note: "VVT, муфта, соленоид", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "фазорегулятор vvt муфта соленоид" },
    { id: "head-gasket", cat: "engine", norm: "head_gasket", name: "Замена прокладки ГБЦ", note: "Со снятием головки", min: 8000, max: 8000, tmin: 300, tmax: 360, tags: "прокладка гбц головка" },
    { id: "head-remove", cat: "engine", norm: "head_remove", name: "Снятие и установка ГБЦ", note: "Без ремонта самой головки", min: 6000, max: 6000, tmin: 180, tmax: 240, tags: "гбц головка снятие установка" },
    { id: "valve-seals", cat: "engine", norm: "valve_seals", name: "Замена маслосъёмных колпачков", note: "Устранение масложора и дыма", min: 12000, max: 12000, tmin: 360, tmax: 480, tags: "колпачки масложор дым маслосъемные" },
    { id: "valve-adjust", cat: "engine", norm: "valve_adjust", name: "Регулировка клапанов", note: "По регламенту, с проверкой зазоров", min: 3000, max: 3000, tmin: 90, tmax: 90, tags: "клапаны зазор регулировка" },
    { id: "rings", cat: "engine", norm: "rings", guide: "shortblock", name: "Замена поршневых колец", note: "Без вкладышей; вместе с ними выходит как «кольца и вкладыши»", min: 12000, max: 18000, tmin: 600, tmax: 720, tags: "кольца поршень" },
    { id: "bearings", cat: "engine", norm: "bearings", guide: "shortblock", name: "Замена вкладышей", note: "Коренные и шатунные, с проверкой шеек", min: 8000, max: 14000, tmin: 660, tmax: 780, tags: "вкладыши коренные шатунные" },
    { id: "pistons", cat: "engine", norm: "pistons", guide: "shortblock", name: "Замена поршней", note: "Если не входит в переборку", min: 26000, max: 40000, tmin: 840, tmax: 960, tags: "поршни" },
    { id: "rebuild", cat: "engine", norm: "rebuild", guide: "shortblock", name: "Переборка двигателя", note: "Снятие, разборка, дефектовка, сборка, установка", min: 24000, max: 40000, tmin: 720, tmax: 1200, tags: "переборка капиталка капремонт" },
    { id: "crank-seal-front", cat: "engine", norm: "crank_seal_front", name: "Замена переднего сальника коленвала", note: "С демонтажом шкива и ремня", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "сальник коленвал передний течь" },
    { id: "crank-seal-rear", cat: "engine", norm: "crank_seal_rear", name: "Замена заднего сальника коленвала", note: "Со снятием коробки или двигателя", min: 8000, max: 8000, tmin: 240, tmax: 240, tags: "сальник коленвал задний течь" },
    { id: "oil-pan", cat: "engine", norm: "oil_pan", name: "Замена прокладки поддона", note: "С заменой масла", min: 3500, max: 3500, tmin: 90, tmax: 90, tags: "поддон прокладка течь масло" },
    { id: "valve-cover", cat: "engine", norm: "valve_cover", name: "Замена прокладки клапанной крышки", note: "Устранение течи по крышке", min: 2500, max: 2500, tmin: 60, tmax: 60, tags: "клапанная крышка прокладка течь" },
    { id: "intake-gasket", cat: "engine", norm: "intake_gasket", name: "Замена прокладки впускного коллектора", note: "С проверкой подсоса", min: 3500, max: 3500, tmin: 120, tmax: 120, tags: "впускной коллектор прокладка подсос" },
    { id: "exhaust-gasket", cat: "engine", norm: "exhaust_gasket", name: "Замена прокладки выпускного коллектора", note: "С заменой шпилек при необходимости", min: 4000, max: 4000, tmin: 150, tmax: 150, tags: "выпускной коллектор прокладка" },
    { id: "pump", cat: "engine", norm: "pump", name: "Замена помпы", note: "С заменой антифриза", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "помпа водяной насос антифриз" },
    { id: "thermostat", cat: "engine", norm: "thermostat", name: "Замена термостата", note: "С заменой антифриза", min: 2500, max: 2500, tmin: 60, tmax: 60, tags: "термостат антифриз" },
    { id: "radiator", cat: "engine", norm: "radiator", name: "Замена радиатора охлаждения", note: "С заменой антифриза", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "радиатор охлаждения антифриз" },
    { id: "oil-pump", cat: "engine", norm: "oil_pump", name: "Замена масляного насоса", note: "С проверкой давления масла", min: 6000, max: 6000, tmin: 180, tmax: 180, tags: "масляный насос давление" },
    { id: "mounts", cat: "engine", norm: "mounts", name: "Замена опор двигателя", note: "Подушки, гидроопоры", min: 3000, max: 3000, tmin: 90, tmax: 90, tags: "опоры подушки гидроопора" },
    { id: "aux-belt", cat: "engine", norm: "aux_belt", name: "Замена ремня навесного", note: "С роликами", min: 2000, max: 3000, tmin: 60, tmax: 90, tags: "ремень навесной генератор ролики" },
    { id: "decoke", cat: "engine", norm: "decoke", name: "Раскоксовка", note: "Если реально помогает без разборки", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "раскоксовка" },
    { id: "oil", cat: "engine", norm: "oil", name: "Замена масла и фильтра", note: "С вашими расходниками или подберу сам", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "масло фильтр то" },
    { id: "plugs", cat: "engine", norm: "plugs", name: "Замена свечей", note: "С проверкой колодцев", min: 1500, max: 1500, tmin: 60, tmax: 60, tags: "свечи" },
    { id: "glow-plugs", cat: "engine", norm: "glow_plugs", name: "Замена свечей накала", note: "Для дизеля, с проверкой реле", min: 3000, max: 3000, tmin: 120, tmax: 120, tags: "свечи накала дизель" },
    { id: "engine-wash", cat: "engine", norm: "engine_wash", name: "Мойка двигателя", note: "Обезжиривание и сушка", min: 2000, max: 2000, tmin: 60, tmax: 60, tags: "мойка двигатель" },
    { id: "crank-pulley", cat: "engine", norm: "crank_pulley", name: "Замена шкива коленвала", note: "Демпферный шкив", min: 3000, max: 3000, tmin: 90, tmax: 90, tags: "шкив коленвал демпфер" },
    { id: "oil-cooler", cat: "engine", norm: "oil_cooler", name: "Замена маслоохладителя", note: "С промывкой системы", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "маслоохладитель теплообменник" },
    { id: "vacuum-pump", cat: "engine", norm: "vacuum_pump", name: "Замена вакуумного насоса", note: "Для дизеля и систем с усилителем", min: 3000, max: 3000, tmin: 90, tmax: 90, tags: "вакуумный насос" },
    { id: "turbo", cat: "engine", norm: "turbo", name: "Снятие и установка турбины", note: "Без ремонта самой турбины", min: 8000, max: 15000, tmin: 300, tmax: 480, tags: "турбина турбо турбокомпрессор" },
    { id: "intercooler", cat: "engine", norm: "intercooler", name: "Замена интеркулера", note: "С проверкой герметичности", min: 4000, max: 4000, tmin: 120, tmax: 120, tags: "интеркулер охладитель наддув" },
    { id: "dpf", cat: "engine", norm: "dpf", name: "Снятие и промывка DPF", note: "Сажевый фильтр, по состоянию", min: 5000, max: 5000, tmin: 180, tmax: 180, tags: "dpf сажевый фильтр промывка" },

    /* топливо и зажигание */
    { id: "injector-clean", cat: "fuel", norm: "injector_clean", name: "Промывка форсунок", note: "Ультразвук или промывка на стенде", min: 2500, max: 2500, tmin: 60, tmax: 60, tags: "форсунки промывка ультразвук" },
    { id: "injector-replace", cat: "fuel", norm: "injector_replace", name: "Замена форсунок", note: "С пропиской и проверкой", min: 3000, max: 3000, tmin: 90, tmax: 90, tags: "форсунки замена" },
    { id: "injector-seals", cat: "fuel", norm: "injector_seals", name: "Замена уплотнений форсунок", note: "Кольца, шайбы, течь" , min: 2500, max: 2500, tmin: 90, tmax: 90, tags: "форсунки кольца уплотнения" },
    { id: "fuel-pump", cat: "fuel", norm: "fuel_pump", name: "Замена топливного насоса", note: "В баке или под капотом", min: 4000, max: 4000, tmin: 150, tmax: 150, tags: "бензонасос топливный насос" },
    { id: "fuel-filter", cat: "fuel", norm: "fuel_filter", name: "Замена топливного фильтра", note: "С прокачкой системы", min: 1500, max: 1500, tmin: 45, tmax: 45, tags: "топливный фильтр" },
    { id: "coils", cat: "fuel", norm: "coils", name: "Замена катушек зажигания", note: "С диагностикой пропусков", min: 1000, max: 1000, tmin: 30, tmax: 30, tags: "катушка зажигание пропуски" },
    { id: "maf", cat: "fuel", norm: "maf", name: "Замена датчика расхода воздуха", note: "ДМРВ, с адаптацией", min: 1500, max: 1500, tmin: 30, tmax: 30, tags: "дмрв maf расход воздуха датчик" },
    { id: "lambda", cat: "fuel", norm: "lambda", name: "Замена лямбда-зонда", note: "С проверкой топливной смеси", min: 2500, max: 2500, tmin: 60, tmax: 60, tags: "лямбда зонд кислородный датчик" },
    { id: "egr", cat: "fuel", norm: "egr", name: "Чистка и замена EGR", note: "С проверкой каналов", min: 3500, max: 3500, tmin: 90, tmax: 90, tags: "egr клапан рециркуляция" },
    { id: "throttle", cat: "fuel", norm: "throttle", name: "Чистка дросселя", note: "С адаптацией", min: 1500, max: 1500, tmin: 45, tmax: 45, tags: "дроссель чистка адаптация" },
    { id: "fuel-line", cat: "fuel", norm: "fuel_line", name: "Замена топливных трубок", note: "По объёму работ", min: 2000, max: 2000, tmin: 60, tmax: 60, tags: "топливные трубки магистраль" },

    /* выезд */
    { id: "visit", cat: "visit", name: "Выезд в пределах города", note: "Дом, офис, гараж, место поломки", min: 500, max: 500, tmin: 0, tmax: 0, tags: "выезд" },
    { id: "visit-outside", cat: "visit", name: "Выезд за город до 30 км", note: "Пригород, дачи, трасса", min: 1000, max: 1000, tmin: 0, tmax: 0, tags: "выезд пригород за город" }
  ];

  var STORE = "remontus44.calc.v1";
  var GRAM_STEP = 50;
  var GRAM_MIN = 200;
  var GRAM_MAX = 1200;
  var GRAM_DEFAULT = 600;

  var CARS = window.CARS && Array.isArray(window.CARS.makes) ? window.CARS : null;
  var LABOR = window.LABOR && window.LABOR.byEngine ? window.LABOR : null;
  var GUIDES = window.GUIDES && window.GUIDES.byOp ? window.GUIDES : null;

  /* ---------- утилиты ---------- */

  var $ = function (id) { return document.getElementById(id); };
  var nf = new Intl.NumberFormat("ru-RU");

  function nums(n) {
    return nf.format(Math.round(n)).replace(/\u00A0/g, " ");
  }

  function rub(n) {
    return nums(n) + " ₽";
  }

  function rubRange(a, b) {
    if (a === b) return rub(a);
    return nums(a) + "–" + nums(b) + " ₽";
  }

  function dur(m) {
    if (!m) return "—";
    if (m < 60) return m + " мин";
    var h = Math.floor(m / 60);
    var rest = m % 60;
    return rest ? h + " ч " + rest + " мин" : h + " ч";
  }

  function durRange(a, b) {
    if (!a && !b) return "—";
    if (a === b) return dur(a);
    return dur(a) + " – " + dur(b);
  }

  /* компактно для списка: «30–60 мин», «2,5–3 ч» */
  function hours(m) {
    return String(Math.round(m / 6) / 10).replace(".", ",");
  }

  function shortDur(m) {
    if (!m) return "—";
    if (m < 60) return m + " мин";
    if (m % 30 === 0) return hours(m) + " ч";
    return dur(m);
  }

  function shortRange(a, b) {
    if (!a && !b) return "—";
    if (a === b) return shortDur(a);
    if (b <= 60) return a + "–" + b + " мин";
    if (a >= 60) return hours(a) + "–" + hours(b) + " ч";
    return dur(a) + "–" + dur(b);
  }

  function fmtNorm(h) {
    return String(h).replace(".", ",") + " ч";
  }

  function plural(n, one, few, many) {
    var d = n % 10;
    var dd = n % 100;
    if (d === 1 && dd !== 11) return one;
    if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return few;
    return many;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function norm(s) {
    return String(s).toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  }

  function byId(id) {
    for (var i = 0; i < SERVICES.length; i++) if (SERVICES[i].id === id) return SERVICES[i];
    return null;
  }

  function def(item) {
    if (item.custom) return item;
    return byId(item.id);
  }

  function catName(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].name;
    return "";
  }

  /* ---------- справочник автомобилей ---------- */

  function findMake(id) {
    if (!CARS || !id) return null;
    for (var i = 0; i < CARS.makes.length; i++) if (CARS.makes[i].id === id) return CARS.makes[i];
    return null;
  }

  function findModel(make, id) {
    if (!make || !id) return null;
    for (var i = 0; i < make.models.length; i++) if (make.models[i].id === id) return make.models[i];
    return null;
  }

  function findEngine(model, id) {
    if (!model || !id) return null;
    for (var i = 0; i < model.engines.length; i++) if (model.engines[i].id === id) return model.engines[i];
    return null;
  }

  function yearsOf(model) {
    var out = [];
    for (var y = model.y1; y >= model.y0; y--) {
      if (enginesOf(model, y).length) out.push(y);
    }
    return out;
  }

  function enginesOf(model, year) {
    return model.engines.filter(function (e) {
      return e.y0 <= year && e.y1 >= year;
    });
  }

  function validVehicle(v) {
    if (!v || !v.make) return null;
    var make = findMake(v.make);
    if (!make) return null;
    if (!v.model) return { make: v.make };
    var model = findModel(make, v.model);
    if (!model) return { make: v.make };
    if (!v.year) return { make: v.make, model: v.model };
    var year = parseInt(v.year, 10);
    if (!year || year < model.y0 || year > model.y1) return { make: v.make, model: v.model };
    if (!enginesOf(model, year).length) return { make: v.make, model: v.model };
    var out = { make: v.make, model: v.model, year: year };
    var engine = findEngine(model, v.engine);
    if (engine && engine.y0 <= year && engine.y1 >= year) out.engine = engine.id;
    return out;
  }

  function selectedCar() {
    var v = state.vehicle;
    if (!v || !v.make || !v.model || !v.year) return null;
    var make = findMake(v.make);
    if (!make) return null;
    var model = findModel(make, v.model);
    if (!model) return null;
    var year = parseInt(v.year, 10);
    if (!year || year < model.y0 || year > model.y1) return null;
    var engine = findEngine(model, v.engine);
    if (!engine || engine.y0 > year || engine.y1 < year) return null;
    return { make: make, model: model, year: year, engine: engine };
  }

  function carShort(car) {
    return car.make.name + " " + car.model.name + " " + car.engine.name +
      " (" + car.engine.code + "), " + car.year;
  }

  function normFor(service, car) {
    if (!service || !service.norm || !car || !LABOR) return null;
    var row = LABOR.byEngine[car.engine.id];
    if (!row) return null;
    var h = row[service.norm];
    return typeof h === "number" ? h : null;
  }

  function guideFor(service, car) {
    if (!service || !car || !GUIDES) return null;
    var key = service.guide || service.norm;
    if (!key) return null;
    return GUIDES.byOp[key] || null;
  }

  /* ---------- цены и итоги ---------- */

  function unitPrice(item) {
    var d = def(item);
    if (d.perGram) {
      var p = d.base + (item.grams || GRAM_DEFAULT) * d.perGram;
      return { min: p, max: p };
    }
    return { min: d.min, max: d.max };
  }

  function itemMinutes(item, d) {
    if (item.nh) return Math.round(item.nh * 60);
    return d.tmin || 0;
  }

  function itemMinutesMax(item, d) {
    if (item.nh) return Math.round(item.nh * 60);
    return d.tmax || 0;
  }

  function totals() {
    var min = 0, max = 0, tmin = 0, tmax = 0;
    state.cart.forEach(function (item) {
      var d = def(item);
      if (!d) return;
      var u = unitPrice(item);
      min += u.min * item.qty;
      max += u.max * item.qty;
      tmin += itemMinutes(item, d) * item.qty;
      tmax += itemMinutesMax(item, d) * item.qty;
    });
    return { min: min, max: max, tmin: tmin, tmax: tmax };
  }

  /* ---------- состояние ---------- */

  var state = { cat: "all", cart: [], note: true, vehicle: null };

  function load() {
    try {
      var raw = localStorage.getItem(STORE);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (Array.isArray(data.cart)) {
        state.cart = data.cart.filter(function (it) {
          if (!it || !it.id) return false;
          it.qty = Math.min(Math.max(parseInt(it.qty, 10) || 1, 1), 99);
          if (it.custom) return !!it.name;
          return !!byId(it.id);
        }).map(function (it) {
          if (it.custom) return it;
          if (typeof it.nh === "number" && it.nh > 0) it.nh = Math.min(it.nh, 80);
          else delete it.nh;
          if (typeof it.car !== "string") delete it.car;
          return it;
        });
      }
      if (typeof data.note === "boolean") state.note = data.note;
      if (data.vehicle) state.vehicle = validVehicle(data.vehicle);
    } catch (e) { /* приватный режим или битые данные — не страшно */ }
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        cart: state.cart,
        note: state.note,
        vehicle: state.vehicle
      }));
    } catch (e) { /* переполнение или приватный режим */ }
  }

  /* ---------- список ---------- */

  function matches(s, words) {
    if (!words.length) return true;
    var hay = norm([s.name, s.note, s.tags, catName(s.cat)].join(" "));
    return words.every(function (w) { return hay.indexOf(w) !== -1; });
  }

  function rowHtml(s, car) {
    var inCart = null;
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].id === s.id) { inCart = state.cart[i]; break; }
    }
    var price = s.perGram ? "от " + nums(s.base) + " ₽ + газ" : rubRange(s.min, s.max);
    var nh = normFor(s, car);
    var na = !!(car && s.norm && LABOR && LABOR.byEngine[car.engine.id] && nh == null);
    var time;
    var timeClass = "svc__time";
    if (na) {
      time = "не подходит";
      timeClass += " svc__time--na";
    } else if (nh != null) {
      time = fmtNorm(nh);
      timeClass += " svc__time--norm";
    } else {
      time = shortRange(s.tmin, s.tmax);
    }
    var g = guideFor(s, car);
    var main = '<button class="svc' + (inCart ? " svc--on" : "") + (na ? " svc--na" : "") + '" type="button" data-add="' + s.id + '"' + (na ? " disabled" : "") + '>' +
      '<span class="svc__text">' +
        '<span class="svc__name">' + esc(s.name) + '</span>' +
        '<span class="svc__note">' + esc(s.note) + '</span>' +
      '</span>' +
      '<span class="svc__side">' +
        '<span class="svc__price">' + price + '</span>' +
        '<span class="' + timeClass + '"' + (nh != null ? ' title="Нормо-часы из базы"' : (na ? ' title="Нет в базе для этого двигателя"' : '')) + '>' + time + '</span>' +
      '</span>' +
    '</button>';

    if (!g || na) return '<div class="svc-row' + (inCart ? " svc-row--on" : "") + '">' + main + '</div>';

    return '<div class="svc-row' + (inCart ? " svc-row--on" : "") + '">' + main +
      '<button class="svc__how" type="button" data-guide="' + s.id + '" aria-label="Как выполнить: ' + esc(s.name) + '" title="Как выполнить">?</button>' +
    '</div>';
  }

  function fieldHtml(label, key, options, disabled) {
    return '<label class="gfield"><span>' + label + '</span>' +
      '<select data-v="' + key + '"' + (disabled ? " disabled" : "") + '>' + options + '</select></label>';
  }

  function garageHtml(car) {
    if (!CARS) return "";

    var v = state.vehicle || {};
    var make = findMake(v.make);
    var model = make ? findModel(make, v.model) : null;
    var year = parseInt(v.year, 10) || 0;
    var years = model ? yearsOf(model) : [];
    var engines = model && year ? enginesOf(model, year) : [];

    var makeOpts = '<option value="">Выберите марку</option>';
    CARS.makes.forEach(function (m) {
      makeOpts += '<option value="' + m.id + '"' + (v.make === m.id ? " selected" : "") + '>' + esc(m.name) + '</option>';
    });

    var modelOpts = '<option value="">' + (make ? "Выберите модель" : "Сначала марка") + '</option>';
    if (make) {
      make.models.forEach(function (m) {
        modelOpts += '<option value="' + m.id + '"' + (v.model === m.id ? " selected" : "") + '>' + esc(m.name) + '</option>';
      });
    }

    var yearOpts = '<option value="">' + (model ? "Выберите год" : "Сначала модель") + '</option>';
    years.forEach(function (y) {
      yearOpts += '<option value="' + y + '"' + (year === y ? " selected" : "") + '>' + y + '</option>';
    });

    var engineOpts = '<option value="">' + (year ? "Выберите двигатель" : "Сначала год") + '</option>';
    engines.forEach(function (e) {
      engineOpts += '<option value="' + esc(e.id) + '"' + (v.engine === e.id ? " selected" : "") + '>' +
        esc(e.name + " (" + e.code + "), " + e.hp + " л.с.") + '</option>';
    });

    var html = '<section class="garage" aria-label="Подбор автомобиля">' +
      '<div class="garage__head">' +
        '<div>' +
          '<div class="garage__title">Нормо-часы по автомобилю</div>' +
          '<div class="garage__sub">Марка, модель, год и двигатель</div>' +
        '</div>' +
        (v.make ? '<button class="garage__reset" type="button" data-vreset>Сбросить</button>' : '') +
      '</div>' +
      '<div class="garage__grid">' +
        fieldHtml("Марка", "make", makeOpts, false) +
        fieldHtml("Модель", "model", modelOpts, !make) +
        fieldHtml("Год", "year", yearOpts, !model) +
        fieldHtml("Двигатель", "engine", engineOpts, !year || !engines.length) +
      '</div>';

    if (car) {
      var count = SERVICES.filter(function (s) { return normFor(s, car) != null; }).length;
      html += '<div class="garage__car">' +
        '<div class="garage__car-text">' +
          '<b>' + esc(car.make.name + " " + car.model.name) + '</b>' +
          '<span>' + esc(car.year + " · " + car.engine.name + " (" + car.engine.code + ") · " + car.engine.hp + " л.с.") + '</span>' +
        '</div>' +
        '<div class="garage__count">' + count + " " + plural(count, "норматив", "норматива", "нормативов") + '</div>' +
      '</div>' +
      '<p class="garage__meta">Время в списке — из базы нормо-часов. Цена остаётся по прайсу, точную сумму называю после осмотра.<br>Кнопка «?» у работы — пошаговая инструкция, схема и моменты затяжки.</p>';
    } else {
      html += '<p class="garage__hint">Выберите авто — подставлю справочные нормо-часы для работ по двигателю.</p>';
    }

    html += '</section>';
    return html;
  }

  /* ---------- схемы и инструкции ---------- */

  function gsvg(inner, label) {
    return '<svg viewBox="0 0 640 300" role="img" aria-label="' + esc(label) + '" class="guide-art-svg">' +
      '<rect width="640" height="300" rx="16" fill="#f4f8f5"/>' + inner + '</svg>';
  }

  function gtext(x, y, text, size, anchor, fill, weight) {
    return '<text x="' + x + '" y="' + y + '" font-family="Arial, sans-serif" font-size="' + (size || 13) + '"' +
      ' text-anchor="' + (anchor || "middle") + '" fill="' + (fill || "#101820") + '"' +
      (weight ? ' font-weight="' + weight + '"' : '') + '>' + esc(text) + '</text>';
  }

  function boltSvg(kind, engine) {
    var cyl = engine.cyl || 4;
    var cols, rows, label;
    if (kind === "head") {
      cols = cyl <= 4 ? 5 : cyl <= 6 ? 6 : 8;
      rows = 2;
      label = "Порядок затяжки ГБЦ: от центра к краям, в 2–3 приёма";
    } else if (kind === "cover") {
      cols = cyl <= 4 ? 4 : cyl <= 6 ? 5 : 6;
      rows = 2;
      label = "Крышка: крест-накрест, от центра к краям";
    } else {
      cols = cyl <= 4 ? 6 : 8;
      rows = 1;
      label = "Коллектор: от центра к краям";
    }

    var center = (cols - 1) / 2;
    var colOrder = [];
    for (var c = 0; c < cols; c++) colOrder.push(c);
    colOrder.sort(function (a, b) {
      return Math.abs(a - center) - Math.abs(b - center) || a - b;
    });

    var order = [];
    colOrder.forEach(function (c) {
      order.push([c, 0]);
      if (rows === 2) order.push([c, 1]);
    });

    var pos = {};
    order.forEach(function (p, i) { pos[p[0] + "-" + p[1]] = i + 1; });

    var inner = "";
    var x0 = 95, x1 = 545;
    var step = cols > 1 ? (x1 - x0) / (cols - 1) : 0;
    var ys = rows === 2 ? [100, 185] : [140];

    for (var r = 0; r < rows; r++) {
      inner += '<line x1="70" y1="' + ys[r] + '" x2="570" y2="' + ys[r] + '" stroke="#cfe0d6" stroke-width="2" stroke-dasharray="6 7"/>';
    }

    for (var cx = 0; cx < cols; cx++) {
      for (var ry = 0; ry < rows; ry++) {
        var x = x0 + cx * step;
        var y = ys[ry];
        var n = pos[cx + "-" + ry] || (cx * rows + ry + 1);
        var hot = n <= 4;
        inner += '<circle cx="' + x + '" cy="' + y + '" r="20" fill="' + (hot ? "#e8f5ee" : "#ffffff") + '" stroke="' + (hot ? "#15803d" : "#9ab3a5") + '" stroke-width="2.5"/>';
        inner += gtext(x, y + 5, String(n), 14, "middle", hot ? "#15803d" : "#101820", "700");
      }
    }

    inner += gtext(320, 245, label, 14, "middle", "#101820", "700");
    inner += gtext(320, 270, "Цифры — порядок. Момент и доворот — по руководству для этого двигателя.", 12, "middle", "#6b7780");
    return gsvg(inner, label);
  }

  function artSvg(kind, engine) {
    var cyl = engine.cyl || 4;
    var inner = "";

    if (kind === "belt" || kind === "chain") {
      var isChain = kind === "chain";
      inner += '<path d="M200 41 H440 A44 44 0 0 1 484 85 L376 205 A56 56 0 0 1 264 205 L156 85 A44 44 0 0 1 200 41 Z" fill="none" stroke="' + (isChain ? "#6b7780" : "#15803d") + '" stroke-width="' + (isChain ? 7 : 10) + '"' + (isChain ? ' stroke-dasharray="3 5"' : '') + ' stroke-linejoin="round"/>';
      inner += '<circle cx="200" cy="85" r="40" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<circle cx="440" cy="85" r="40" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<circle cx="320" cy="205" r="50" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<line x1="200" y1="41" x2="200" y2="57" stroke="#b45309" stroke-width="4"/>';
      inner += '<line x1="440" y1="41" x2="440" y2="57" stroke="#b45309" stroke-width="4"/>';
      inner += '<line x1="320" y1="151" x2="320" y2="169" stroke="#b45309" stroke-width="4"/>';
      inner += gtext(200, 90, "распредвал", 11, "middle", "#3f5c4b");
      inner += gtext(440, 90, "распредвал", 11, "middle", "#3f5c4b");
      inner += gtext(320, 211, "коленвал", 11, "middle", "#3f5c4b");
      inner += gtext(520, 67, "метки", 12, "middle", "#b45309", "700");
      inner += gtext(320, 284, isChain ? "Цепь: метки на звеньях и звёздах должны совпасть" : "Ремень: метки на шкивах должны совпасть с корпусом", 13, "middle", "#101820", "700");
      return gsvg(inner, "Схема ГРМ");
    }

    if (kind === "engine") {
      inner += '<rect x="175" y="80" width="290" height="150" rx="16" fill="#e6f2ea" stroke="#15803d" stroke-width="3"/>';
      inner += '<rect x="205" y="55" width="230" height="35" rx="8" fill="#cfe6d8" stroke="#15803d" stroke-width="2"/>';
      inner += '<rect x="205" y="220" width="230" height="28" rx="7" fill="#cfe6d8" stroke="#15803d" stroke-width="2"/>';
      for (var i = 0; i < Math.min(cyl, 8); i++) {
        var cx = 215 + i * (205 / Math.max(1, Math.min(cyl, 8) - 1));
        inner += '<circle cx="' + cx + '" cy="145" r="18" fill="#ffffff" stroke="#15803d" stroke-width="2"/>';
      }
      inner += gtext(320, 48, "ГБЦ", 12, "middle", "#3f5c4b", "700");
      inner += gtext(320, 265, "блок цилиндров", 12, "middle", "#3f5c4b");
      inner += gtext(320, 290, "Снимайте узлы по порядку, крепёж раскладывайте по цилиндрам", 12, "middle", "#6b7780");
      return gsvg(inner, "Схема двигателя");
    }

    if (kind === "cover") {
      inner += '<rect x="170" y="70" width="300" height="150" rx="18" fill="#ffffff" stroke="#15803d" stroke-width="3"/>';
      inner += '<rect x="188" y="88" width="264" height="114" rx="12" fill="#e6f2ea" stroke="#9ab3a5" stroke-width="2"/>';
      inner += gtext(320, 150, "клапанная крышка", 15, "middle", "#101820", "700");
      inner += gtext(320, 172, "прокладка + герметик в углах", 12, "middle", "#6b7780");
      inner += gtext(320, 250, "Крест-накрест, без перетяжки", 14, "middle", "#101820", "700");
      return gsvg(inner, "Клапанная крышка");
    }

    if (kind === "oil") {
      inner += '<rect x="210" y="55" width="220" height="120" rx="12" fill="#e6f2ea" stroke="#15803d" stroke-width="3"/>';
      inner += '<path d="M220 175 H420 L405 225 H235 Z" fill="#cfe6d8" stroke="#15803d" stroke-width="3"/>';
      inner += '<circle cx="320" cy="225" r="12" fill="#b45309"/>';
      inner += '<path d="M320 238 V270" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>';
      inner += gtext(320, 289, "слив", 12, "middle", "#b45309", "700");
      inner += '<rect x="455" y="80" width="55" height="85" rx="10" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += gtext(482, 128, "фильтр", 11, "middle", "#3f5c4b");
      inner += '<circle cx="190" cy="85" r="16" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += gtext(190, 90, "↑", 16, "middle", "#15803d", "700");
      inner += gtext(190, 118, "заливка", 11, "middle", "#3f5c4b");
      inner += gtext(320, 35, "Масло: прогреть, слить, заменить фильтр, залить по уровню", 13, "middle", "#101820", "700");
      return gsvg(inner, "Замена масла");
    }

    if (kind === "plugs") {
      var n = Math.min(cyl, 8);
      for (var j = 0; j < n; j++) {
        var x = 110 + j * (420 / Math.max(1, n - 1));
        inner += '<rect x="' + (x - 22) + '" y="70" width="44" height="58" rx="8" fill="#cfe6d8" stroke="#15803d" stroke-width="2"/>';
        inner += '<circle cx="' + x + '" cy="160" r="18" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
        inner += '<line x1="' + x + '" y1="128" x2="' + x + '" y2="142" stroke="#15803d" stroke-width="3"/>';
        inner += gtext(x, 104, "катушка", 10, "middle", "#3f5c4b");
        inner += gtext(x, 165, "свеча", 10, "middle", "#3f5c4b");
      }
      inner += gtext(320, 235, "Продуть колодцы, свечи закручивать от руки, затем динамометрическим ключом", 12, "middle", "#101820", "700");
      return gsvg(inner, "Свечи зажигания");
    }

    if (kind === "pump") {
      inner += '<path d="M170 150 C170 80 250 60 320 60 C390 60 470 80 470 150 C470 220 390 240 320 240 C250 240 170 220 170 150 Z" fill="none" stroke="#15803d" stroke-width="10"/>';
      inner += '<circle cx="320" cy="150" r="46" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<circle cx="210" cy="120" r="30" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<circle cx="430" cy="120" r="30" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<circle cx="320" cy="150" r="14" fill="#e6f2ea" stroke="#15803d" stroke-width="2"/>';
      inner += gtext(320, 155, "помпа", 11, "middle", "#3f5c4b");
      inner += gtext(210, 125, "ролик", 10, "middle", "#3f5c4b");
      inner += gtext(430, 125, "натяжитель", 10, "middle", "#3f5c4b");
      inner += gtext(320, 285, "Проверьте люфт и шум, после сборки удалите воздух", 12, "middle", "#101820", "700");
      return gsvg(inner, "Помпа");
    }

    if (kind === "thermostat") {
      inner += '<rect x="210" y="95" width="220" height="110" rx="18" fill="#ffffff" stroke="#15803d" stroke-width="3"/>';
      inner += '<circle cx="320" cy="150" r="32" fill="#e6f2ea" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<path d="M210 130 H150" stroke="#15803d" stroke-width="9" stroke-linecap="round"/>';
      inner += '<path d="M430 170 H490" stroke="#15803d" stroke-width="9" stroke-linecap="round"/>';
      inner += gtext(320, 154, "клапан", 11, "middle", "#3f5c4b");
      inner += gtext(145, 118, "патрубок", 11, "middle", "#3f5c4b");
      inner += gtext(497, 190, "радиатор", 11, "middle", "#3f5c4b");
      inner += gtext(320, 250, "Клапан — в сторону радиатора, прокладка новая", 12, "middle", "#101820", "700");
      return gsvg(inner, "Термостат");
    }

    if (kind === "intake" || kind === "exhaust") {
      var isEx = kind === "exhaust";
      inner += '<rect x="120" y="95" width="400" height="55" rx="14" fill="' + (isEx ? "#f3e8e0" : "#e6f2ea") + '" stroke="' + (isEx ? "#b45309" : "#15803d") + '" stroke-width="3"/>';
      for (var k = 0; k < Math.min(cyl, 8); k++) {
        var rx = 145 + k * (350 / Math.max(1, Math.min(cyl, 8) - 1));
        inner += '<rect x="' + (rx - 12) + '" y="150" width="24" height="48" rx="7" fill="#ffffff" stroke="' + (isEx ? "#b45309" : "#15803d") + '" stroke-width="2"/>';
      }
      inner += gtext(320, 82, isEx ? "выпускной коллектор" : "впускной коллектор", 13, "middle", "#3f5c4b", "700");
      inner += gtext(320, 235, isEx ? "Гайки от центра к краям, не срывать шпильки" : "Болты от центра к краям, проверить подсос", 12, "middle", "#101820", "700");
      return gsvg(inner, isEx ? "Выпускной коллектор" : "Впускной коллектор");
    }

    if (kind === "turbo") {
      inner += '<circle cx="300" cy="140" r="58" fill="#e6f2ea" stroke="#15803d" stroke-width="3"/>';
      inner += '<path d="M270 140 C270 110 300 100 320 115 C340 130 330 160 305 158 C285 156 282 135 300 128" fill="none" stroke="#15803d" stroke-width="4"/>';
      inner += '<path d="M300 82 V40" stroke="#b45309" stroke-width="5"/>';
      inner += '<path d="M300 198 V250" stroke="#15803d" stroke-width="7"/>';
      inner += gtext(300, 30, "маслоподача", 12, "middle", "#b45309", "700");
      inner += gtext(300, 275, "слив в поддон", 12, "middle", "#15803d", "700");
      inner += gtext(380, 140, "турбина", 12, "middle", "#3f5c4b");
      inner += gtext(320, 205, "Прокачать масло до запуска!", 12, "middle", "#b45309", "700");
      return gsvg(inner, "Турбина");
    }

    if (kind === "dpf") {
      inner += '<rect x="100" y="120" width="440" height="70" rx="16" fill="#f3e8e0" stroke="#b45309" stroke-width="3"/>';
      inner += '<rect x="230" y="100" width="180" height="110" rx="14" fill="#ffffff" stroke="#b45309" stroke-width="3"/>';
      inner += '<path d="M255 120 V190 M275 120 V190 M295 120 V190 M315 120 V190 M335 120 V190 M355 120 V190 M375 120 V190" stroke="#d8c2b4" stroke-width="4"/>';
      inner += '<circle cx="230" cy="100" r="9" fill="#15803d"/>';
      inner += '<circle cx="410" cy="100" r="9" fill="#15803d"/>';
      inner += gtext(320, 85, "DPF", 13, "middle", "#b45309", "700");
      inner += gtext(320, 245, "Датчики давления и температуры, после установки — адаптация", 12, "middle", "#101820", "700");
      return gsvg(inner, "Сажевый фильтр");
    }

    if (kind === "injector") {
      inner += '<rect x="120" y="80" width="400" height="34" rx="12" fill="#cfe6d8" stroke="#15803d" stroke-width="2.5"/>';
      for (var q = 0; q < Math.min(cyl, 8); q++) {
        var ix = 150 + q * (340 / Math.max(1, Math.min(cyl, 8) - 1));
        inner += '<rect x="' + (ix - 10) + '" y="114" width="20" height="65" rx="7" fill="#ffffff" stroke="#15803d" stroke-width="2"/>';
        inner += '<circle cx="' + ix + '" cy="188" r="7" fill="#b45309"/>';
      }
      inner += gtext(320, 68, "топливная рампа", 13, "middle", "#3f5c4b", "700");
      inner += gtext(320, 235, "Новые кольца и шайбы, без перекоса, момент по руководству", 12, "middle", "#101820", "700");
      return gsvg(inner, "Форсунки");
    }

    if (kind === "fuel") {
      inner += '<rect x="150" y="110" width="340" height="100" rx="20" fill="#e6f2ea" stroke="#15803d" stroke-width="3"/>';
      inner += '<circle cx="250" cy="160" r="30" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<path d="M250 190 V235" stroke="#15803d" stroke-width="6"/>';
      inner += '<path d="M280 160 H440" stroke="#15803d" stroke-width="5" stroke-dasharray="8 6"/>';
      inner += gtext(250, 165, "насос", 11, "middle", "#3f5c4b");
      inner += gtext(360, 145, "топливная линия", 11, "middle", "#3f5c4b");
      inner += gtext(320, 255, "Сбросить давление, новые уплотнения, проверить течи", 12, "middle", "#101820", "700");
      return gsvg(inner, "Топливный насос");
    }

    if (kind === "ac") {
      inner += '<rect x="70" y="80" width="150" height="70" rx="12" fill="#e6f2ea" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<rect x="420" y="80" width="150" height="70" rx="12" fill="#e6f2ea" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<rect x="70" y="190" width="150" height="70" rx="12" fill="#e6f2ea" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<rect x="420" y="190" width="150" height="70" rx="12" fill="#e6f2ea" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<path d="M220 115 H420" stroke="#15803d" stroke-width="4" marker-end="url(#ar)"/>';
      inner += '<path d="M495 150 V190" stroke="#15803d" stroke-width="4"/>';
      inner += '<path d="M420 225 H220" stroke="#15803d" stroke-width="4"/>';
      inner += '<path d="M145 190 V150" stroke="#15803d" stroke-width="4"/>';
      inner += '<defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#15803d"/></marker></defs>';
      inner += gtext(145, 120, "компрессор", 11, "middle", "#3f5c4b");
      inner += gtext(495, 120, "конденсор", 11, "middle", "#3f5c4b");
      inner += gtext(145, 230, "испаритель", 11, "middle", "#3f5c4b");
      inner += gtext(495, 230, "ТРВ", 11, "middle", "#3f5c4b");
      inner += gtext(320, 275, "R134a: откачка → вакуум → заправка по весу", 13, "middle", "#101820", "700");
      return gsvg(inner, "Кондиционер");
    }

    if (kind === "diag") {
      inner += '<rect x="120" y="80" width="180" height="120" rx="14" fill="#ffffff" stroke="#15803d" stroke-width="3"/>';
      inner += '<rect x="145" y="105" width="130" height="70" rx="6" fill="#e6f2ea" stroke="#15803d" stroke-width="1.5"/>';
      inner += '<path d="M300 140 H380" stroke="#15803d" stroke-width="4"/>';
      inner += '<rect x="380" y="105" width="130" height="70" rx="12" fill="#e6f2ea" stroke="#15803d" stroke-width="2.5"/>';
      inner += gtext(210, 65, "OBD-II", 13, "middle", "#3f5c4b", "700");
      inner += gtext(445, 145, "сканер", 11, "middle", "#3f5c4b");
      inner += gtext(320, 230, "Считать ошибки и стоп-кадр до сброса", 13, "middle", "#101820", "700");
      return gsvg(inner, "Компьютерная диагностика");
    }

    if (kind === "radiator") {
      inner += '<rect x="130" y="90" width="380" height="120" rx="12" fill="#e6f2ea" stroke="#15803d" stroke-width="3"/>';
      for (var rr = 0; rr < 11; rr++) {
        inner += '<line x1="' + (155 + rr * 30) + '" y1="108" x2="' + (155 + rr * 30) + '" y2="192" stroke="#9ab3a5" stroke-width="3"/>';
      }
      inner += '<rect x="95" y="110" width="35" height="80" rx="8" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<rect x="510" y="110" width="35" height="80" rx="8" fill="#ffffff" stroke="#15803d" stroke-width="2.5"/>';
      inner += '<path d="M95 150 H60" stroke="#15803d" stroke-width="8" stroke-linecap="round"/>';
      inner += '<path d="M545 150 H580" stroke="#15803d" stroke-width="8" stroke-linecap="round"/>';
      inner += gtext(320, 235, "Патрубки — новые хомуты, после сборки удалить воздух", 12, "middle", "#101820", "700");
      return gsvg(inner, "Радиатор охлаждения");
    }

    inner += '<rect x="190" y="80" width="260" height="140" rx="18" fill="#e6f2ea" stroke="#15803d" stroke-width="3"/>';
    inner += gtext(320, 155, "двигатель", 15, "middle", "#3f5c4b", "700");
    inner += gtext(320, 245, "Действуйте по шагам, критичные моменты — по руководству", 12, "middle", "#101820", "700");
    return gsvg(inner, "Схема работы");
  }

  function guideHtml(s, car, g) {
    var engine = car.engine;
    var key = s.guide || s.norm;
    var byEngine = GUIDES.byEngine && GUIDES.byEngine[engine.id];
    var fuel = engine.fuel === "diesel" ? "дизель" : "бензин";
    var layout = fuel + ", " + engine.cyl + " цил., " + (engine.timing === "chain" ? "цепь ГРМ" : "ремень ГРМ") + (engine.turbo ? ", турбина" : ", без турбины");
    var note = byEngine && byEngine.note
      ? byEngine.note
      : "Этот двигатель: " + layout + ". Схема общая для своего типа, критические моменты — по заводскому руководству.";
    var nh = normFor(s, car);

    var steps = (g.steps || []).map(function (t) {
      return '<li>' + esc(t) + '</li>';
    }).join("");

    var tools = (g.tools || []).map(function (t) {
      return '<span class="guide__tool">' + esc(t) + '</span>';
    }).join("");

    var torques = (g.torques || []).map(function (t) {
      return '<tr>' +
        '<td>' + esc(t.part) + '</td>' +
        '<td class="' + (t.critical ? "guide__critical" : "") + '">' + esc(t.value) + '</td>' +
        '<td>' + esc(t.note || "") + '</td>' +
      '</tr>';
    }).join("");

    var seq = g.sequence ? boltSvg(g.sequence, engine) : "";
    var art = artSvg(g.art || "generic", engine);

    return '<div class="guide__hero">' +
        '<div class="guide__car">' + esc(car.make.name + " " + car.model.name + " " + car.engine.name + " (" + car.engine.code + "), " + car.year) + '</div>' +
        '<h3>' + esc(g.title || s.name) + '</h3>' +
        '<div class="guide__meta">' + (nh != null ? "Норматив: " + fmtNorm(nh) : "Норматив: —") +
          " · " + engine.cyl + " цил. · " + (engine.timing === "chain" ? "цепь" : "ремень") + (engine.turbo ? " · турбо" : "") + '</div>' +
      '</div>' +
      '<div class="guide__art">' + art + '</div>' +
      (note ? '<div class="guide__engine-note">' + esc(note) + '</div>' : '') +
      (tools ? '<h4>Инструмент</h4><div class="guide__tools">' + tools + '</div>' : '') +
      '<h4>Порядок работы</h4>' +
      '<ol class="guide__steps">' + steps + '</ol>' +
      (seq ? '<h4>Порядок затяжки</h4><div class="guide__art guide__art--seq">' + seq + '</div>' : '') +
      '<h4>Моменты затяжки</h4>' +
      (torques
        ? '<table class="guide__table"><thead><tr><th>Соединение</th><th>Момент</th><th>Примечание</th></tr></thead><tbody>' + torques + '</tbody></table>'
        : '<p class="guide__plain">Для этой работы моменты не требуются.</p>') +
      (g.warning ? '<div class="guide__warn">' + esc(g.warning) + '</div>' : '') +
      '<p class="guide__src">Моменты для некритичных креплений — ориентировочные. Для ГБЦ, шатунов, коренных, маховика, форсунок и турбины используйте заводское руководство для этого двигателя. Схема затяжки тиловая: количество болтов и порядок уточняйте по головке.</p>';
  }

  /* ---------- шторка инструкции ---------- */

  var guideOpen = false;

  function openGuide(id) {
    var s = byId(id);
    var car = selectedCar();
    if (!s) return;
    if (!car) { toast("Сначала выберите автомобиль"); return; }
    var g = guideFor(s, car);
    if (!g) { toast("Для этой работы инструкции пока нет"); return; }
    $("guideBody").innerHTML = guideHtml(s, car, g);
    $("guideBody").scrollTop = 0;
    $("guideSheet").hidden = false;
    guideOpen = true;
    requestAnimationFrame(function () {
      $("guideSheet").classList.add("is-open");
    });
    try { history.pushState({ guide: 1 }, ""); } catch (e) { /* file:// */ }
  }

  function closeGuide(fromPop) {
    if (!guideOpen) return;
    guideOpen = false;
    $("guideSheet").classList.remove("is-open");
    setTimeout(function () {
      if (!guideOpen) $("guideSheet").hidden = true;
    }, 240);
    if (!fromPop) {
      try { history.back(); } catch (e) { /* ignore */ }
    }
  }

  function renderChips() {
    var html = '<button class="chip' + (state.cat === "all" ? " chip--on" : "") + '" type="button" data-cat="all">Все</button>';
    CATS.forEach(function (c) {
      html += '<button class="chip' + (state.cat === c.id ? " chip--on" : "") + '" type="button" data-cat="' + c.id + '">' + c.name + '</button>';
    });
    $("chips").innerHTML = html;
  }

  function renderList() {
    var words = norm($("q").value).split(" ").filter(Boolean);
    var car = selectedCar();
    var html = "";
    var hasRows = false;
    var effCat = state.cat === "top" && words.length ? "all" : state.cat;

    if (state.cat === "engine") html += garageHtml(car);

    if (state.cat === "top" && !words.length) {
      var pinned = PINNED.map(byId).filter(Boolean);
      html += '<h2 class="group">Что спрашивают чаще всего</h2>';
      pinned.forEach(function (s) { html += rowHtml(s, car); });
      hasRows = pinned.length > 0;
    } else {
      CATS.forEach(function (c) {
        if (c.id === "top") return;
        if (effCat !== "all" && effCat !== c.id) return;
        var items = SERVICES.filter(function (s) {
          return s.cat === c.id && matches(s, words);
        });
        if (!items.length) return;
        html += '<h2 class="group">' + c.name + '</h2>';
        items.forEach(function (s) { html += rowHtml(s, car); });
        hasRows = true;
      });
    }

    $("list").innerHTML = html;
    $("empty").hidden = hasRows;
    $("clearQ").hidden = $("q").value === "";
  }

  /* ---------- нижняя панель ---------- */

  function renderBar() {
    var t = totals();
    var n = state.cart.length;
    var bar = $("bar");
    if (!n) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    $("barSum").textContent = rubRange(t.min, t.max);
    var parts = [n + " " + plural(n, "позиция", "позиции", "позиций")];
    if (t.tmax) parts.push(durRange(t.tmin, t.tmax));
    $("barMeta").textContent = parts.join(" · ");
  }

  /* ---------- смета ---------- */

  function renderSheet() {
    if (!state.cart.length) {
      closeSheet();
      return;
    }

    var html = "";
    state.cart.forEach(function (item, i) {
      var d = def(item);
      if (!d) return;
      var u = unitPrice(item);
      var lineMin = u.min * item.qty;
      var lineMax = u.max * item.qty;

      if (d.perGram) {
        html += '<div class="item" data-i="' + i + '">' +
          '<div class="item__text">' +
            '<div class="item__name">' + esc(d.name) + '</div>' +
            '<div class="item__sum">' + nums(d.base) + ' ₽ + ' + item.grams + ' г × ' + d.perGram + ' ₽ = ' + rubRange(lineMin, lineMax) + '</div>' +
            '<div class="grams">' +
              '<button type="button" data-g="-' + GRAM_STEP + '" aria-label="Меньше газа">−' + GRAM_STEP + '</button>' +
              '<b>' + item.grams + ' г</b>' +
              '<button type="button" data-g="' + GRAM_STEP + '" aria-label="Больше газа">+' + GRAM_STEP + '</button>' +
            '</div>' +
          '</div>' +
          '<button class="item__del" type="button" data-del aria-label="Удалить">×</button>' +
        '</div>';
        return;
      }

      var carLine = item.car
        ? '<div class="item__car">' + esc(item.car) + (item.nh ? " · " + fmtNorm(item.nh) : "") + '</div>'
        : "";

      html += '<div class="item" data-i="' + i + '">' +
        '<div class="item__text">' +
          '<div class="item__name">' + esc(d.name) + '</div>' +
          '<div class="item__sum">' + rubRange(lineMin, lineMax) + '</div>' +
          carLine +
        '</div>' +
        '<div class="step">' +
          '<button type="button" data-dec aria-label="Меньше">−</button>' +
          '<span>' + item.qty + '</span>' +
          '<button type="button" data-inc aria-label="Больше">+</button>' +
        '</div>' +
        '<button class="item__del" type="button" data-del aria-label="Удалить">×</button>' +
      '</div>';
    });

    html += '<button class="addown" type="button" id="addOwn">+ Своя строка</button>' +
      '<form class="ownform" id="ownForm" hidden>' +
        '<input id="ownName" placeholder="Название работы" maxlength="60" autocomplete="off">' +
        '<input id="ownPrice" type="number" inputmode="numeric" min="0" step="100" placeholder="₽">' +
        '<button type="submit">Добавить в смету</button>' +
      '</form>';

    $("sheetBody").innerHTML = html;

    var t = totals();
    $("sheetSum").textContent = rubRange(t.min, t.max);
    var n = state.cart.length;
    var info = [n + " " + plural(n, "позиция", "позиции", "позиций")];
    info.push(t.tmax ? "работы " + durRange(t.tmin, t.tmax) : "без работ в боксе");
    $("sheetTime").textContent = info.join(" · ");

    var own = $("addOwn");
    if (own) {
      own.addEventListener("click", function () {
        $("ownForm").hidden = false;
        own.hidden = true;
        $("ownName").focus();
      });
    }

    var form = $("ownForm");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = $("ownName").value.trim();
        var price = parseInt($("ownPrice").value, 10);
        if (!name || !(price >= 0)) {
          toast(name ? "Укажите сумму" : "Укажите название работы");
          return;
        }
        state.cart.push({
          id: "own-" + Date.now(),
          custom: true,
          name: name,
          min: price,
          max: price,
          tmin: 0,
          tmax: 0,
          qty: 1
        });
        save();
        renderSheet();
        renderBar();
        renderList();
      });
    }
  }

  /* ---------- шторка: открыть / закрыть ---------- */

  var sheetOpen = false;

  function openSheet() {
    if (!state.cart.length) return;
    if (sheetOpen) return;
    sheetOpen = true;
    $("sheet").hidden = false;
    renderSheet();
    requestAnimationFrame(function () {
      $("sheet").classList.add("is-open");
    });
    try { history.pushState({ sheet: 1 }, ""); } catch (e) { /* file:// */ }
  }

  function closeSheet(fromPop) {
    if (!sheetOpen) return;
    sheetOpen = false;
    $("sheet").classList.remove("is-open");
    setTimeout(function () {
      if (!sheetOpen) $("sheet").hidden = true;
    }, 240);
    if (!fromPop) {
      try { history.back(); } catch (e) { /* ignore */ }
    }
  }

  window.addEventListener("popstate", function () {
    if (guideOpen) closeGuide(true);
    else if (sheetOpen) closeSheet(true);
  });

  /* ---------- текст для чата ---------- */

  function buildText() {
    var lines = ["Ремонтус44, Кострома"];
    state.cart.forEach(function (item) {
      var d = def(item);
      if (!d) return;
      var u = unitPrice(item);
      var name = d.name;
      if (d.perGram) name += ", " + item.grams + " г";
      var qty = item.qty > 1 ? " × " + item.qty : "";
      lines.push("• " + name + qty + " — " + rubRange(u.min * item.qty, u.max * item.qty));
      if (item.car) {
        lines.push("   " + item.car + (item.nh ? ", норматив " + fmtNorm(item.nh) : ""));
      }
    });

    var t = totals();
    lines.push("");
    lines.push("Итого: " + rubRange(t.min, t.max));
    if (t.tmax) lines.push("Время работ: " + durRange(t.tmin, t.tmax));
    if (state.note) lines.push("Точную сумму скажу после осмотра.");

    return lines.join("\n");
  }

  function copy(text) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, fallback);
    }
    return Promise.resolve(fallback());
  }

  function copyEstimate() {
    if (!state.cart.length) return;
    copy(buildText()).then(function (ok) {
      toast(ok ? "Смета скопирована" : "Не получилось скопировать");
    });
  }

  function shareEstimate() {
    var text = buildText();
    if (navigator.share) {
      navigator.share({ text: text }).catch(function () { /* отменили — не ошибка */ });
    } else {
      copy(text).then(function (ok) { toast(ok ? "Смета скопирована" : "Не получилось"); });
    }
  }

  /* ---------- тост ---------- */

  var toastTimer = null;

  function toast(msg) {
    var el = $("toast");
    el.textContent = msg;
    el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-on"); }, 1900);
  }

  /* ---------- события ---------- */

  load();
  renderChips();
  renderList();
  renderBar();
  $("noteTgl").checked = state.note;

  $("q").addEventListener("input", renderList);

  $("q").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      this.blur();
    }
  });

  $("clearQ").addEventListener("click", function () {
    $("q").value = "";
    $("q").focus();
    renderList();
  });

  $("chips").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.cat = btn.getAttribute("data-cat");
    renderChips();
    renderList();
    $("list").scrollIntoView({ block: "start", behavior: "smooth" });
  });

  $("list").addEventListener("change", function (e) {
    var sel = e.target.closest("[data-v]");
    if (!sel) return;
    var key = sel.getAttribute("data-v");
    var val = sel.value;
    var v = state.vehicle || {};

    if (key === "make") {
      state.vehicle = val ? { make: val } : null;
    } else if (key === "model") {
      state.vehicle = val ? { make: v.make, model: val } : { make: v.make };
    } else if (key === "year") {
      var y = val ? parseInt(val, 10) : "";
      state.vehicle = { make: v.make, model: v.model };
      if (y) state.vehicle.year = y;
    } else if (key === "engine") {
      state.vehicle = { make: v.make, model: v.model, year: v.year };
      if (val) state.vehicle.engine = val;
    } else {
      return;
    }

    save();
    renderList();
  });

  $("list").addEventListener("click", function (e) {
    var gbtn = e.target.closest("[data-guide]");
    if (gbtn) {
      openGuide(gbtn.getAttribute("data-guide"));
      return;
    }

    if (e.target.closest("[data-vreset]")) {
      state.vehicle = null;
      save();
      renderList();
      toast("Подбор сброшен");
      return;
    }

    var btn = e.target.closest("[data-add]");
    if (!btn) return;
    var id = btn.getAttribute("data-add");
    var s = byId(id);
    if (!s) return;

    var added = null;
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].id === id) { added = state.cart[i]; break; }
    }

    if (added) {
      if (added.qty < 99) added.qty += 1;
    } else {
      var item = { id: id, qty: 1 };
      if (s.perGram) item.grams = GRAM_DEFAULT;
      var car = selectedCar();
      var nh = normFor(s, car);
      if (nh != null) {
        item.nh = nh;
        item.car = carShort(car);
      }
      state.cart.push(item);
    }

    if (navigator.vibrate) navigator.vibrate(8);
    save();
    renderList();
    renderBar();
    if (sheetOpen) renderSheet();
  });

  $("bar").addEventListener("click", function (e) {
    if (e.target.closest("#openSheet")) openSheet();
  });

  $("quickCopy").addEventListener("click", copyEstimate);

  $("sheet").addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) { closeSheet(); return; }

    var itemEl = e.target.closest(".item");
    if (!itemEl) return;
    var i = parseInt(itemEl.getAttribute("data-i"), 10);
    var item = state.cart[i];
    if (!item) return;

    if (e.target.closest("[data-del]")) {
      state.cart.splice(i, 1);
    } else if (e.target.closest("[data-inc]")) {
      if (item.qty < 99) item.qty += 1;
    } else if (e.target.closest("[data-dec]")) {
      if (item.qty > 1) item.qty -= 1;
      else state.cart.splice(i, 1);
    } else if (e.target.closest("[data-g]")) {
      var delta = parseInt(e.target.closest("[data-g]").getAttribute("data-g"), 10);
      item.grams = Math.min(Math.max((item.grams || GRAM_DEFAULT) + delta, GRAM_MIN), GRAM_MAX);
    } else {
      return;
    }

    save();
    renderSheet();
    renderBar();
    renderList();
  });

  $("guideSheet").addEventListener("click", function (e) {
    if (e.target.closest("[data-gclose]")) closeGuide();
  });

  $("copyBtn").addEventListener("click", copyEstimate);
  $("shareBtn").addEventListener("click", shareEstimate);

  $("clearBtn").addEventListener("click", function () {
    if (!state.cart.length) return;
    if (!window.confirm("Очистить смету?")) return;
    state.cart = [];
    save();
    closeSheet();
    renderBar();
    renderList();
    toast("Смета очищена");
  });

  $("noteTgl").addEventListener("change", function () {
    state.note = this.checked;
    save();
  });

  /* ---------- офлайн ---------- */

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () { /* не критично */ });
    });
  }
})();
