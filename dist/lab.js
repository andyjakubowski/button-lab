function handleDOMContentLoaded() {
  App.init();
}

const Data = (function makeData() {
  let hue;
  let saturation;
  let value;
  let borderRadius;
  let labelTransform;

  const CONFIG = {
    SATURATION_PERCENT: 75,
    LIGHTNESS_PERCENT_ARBITRARY_MIN: 40,
    LIGHTNESS_PERCENT_ARBITRARY_MAX: 60,
    LIGHTNESS_PERCENT_OVERALL_MIN: 0,
    LIGHTNESS_PERCENT_OVERALL_MAX: 100,
    BORDER_RADIUS_MAX: 22,
    TEXT_TRANSFORM_OPTIONS: ['capitalize', 'uppercase', 'lowercase'],
  };

  const normalizeHsl = function normalizeHsl({ h, l }) {
    const lScaled = MathUtil.scale(
      l,
      CONFIG.LIGHTNESS_PERCENT_OVERALL_MIN,
      CONFIG.LIGHTNESS_PERCENT_OVERALL_MAX,
      CONFIG.LIGHTNESS_PERCENT_ARBITRARY_MIN,
      CONFIG.LIGHTNESS_PERCENT_ARBITRARY_MAX
    );

    return { h, s: CONFIG.SATURATION_PERCENT, l: lScaled };
  };

  const getRandomData = function getRandomData() {
    const hslColor = ColorUtil.getRandomHslColor();
    const { h, s, l } = normalizeHsl(hslColor);

    const randomIndex = MathUtil.getRandomInt(
      CONFIG.TEXT_TRANSFORM_OPTIONS.length
    );
    const transformValue = CONFIG.TEXT_TRANSFORM_OPTIONS[randomIndex];

    const borderRadius = MathUtil.getRandomInt(CONFIG.BORDER_RADIUS_MAX);

    return {
      hue: h,
      saturation: s,
      value: l,
      borderRadius,
      labelTransform: transformValue,
    };
  };

  const resetData = function resetData() {
    const randomData = getRandomData();
    hue = randomData.hue;
    saturation = randomData.saturation;
    value = randomData.value;
    borderRadius = randomData.borderRadius;
    labelTransform = randomData.labelTransform;
  };

  return {
    init() {
      resetData();
      console.log('Data object initialized.');
    },

    getData() {
      return {
        hue,
        saturation,
        value,
        borderRadius,
        labelTransform,
      };
    },
  };
})();

const App = (function buildApp() {
  let buttonEls;
  let buttonLabelEls;
  let debugPreEl;

  function getHslPropValue({ hue, saturation, value }) {
    return `hsl(${hue}, ${saturation}%, ${value}%)`;
  }

  function updateButtonView({
    hue,
    saturation,
    value,
    borderRadius,
    labelTransform,
  }) {
    hslPropValue = getHslPropValue({ hue, saturation, value });
    borderRadiusPropValue = `${borderRadius}px`;

    buttonEls.forEach((buttonEl) => {
      buttonEl.style.backgroundColor = hslPropValue;
      buttonEl.style.borderRadius = borderRadiusPropValue;
    });

    buttonLabelEls.forEach((labelEl) => {
      labelEl.style.textTransform = labelTransform;
    });
  }

  function updateDebugView(dataObj) {
    const propNames = Object.getOwnPropertyNames(dataObj);
    const strings = propNames.map((name) => `${name}\n${dataObj[name]}\n`);
    const contentStr = strings.join('\n');
    debugPreEl.textContent = contentStr;
  }

  function addEventListeners() {}

  function setDomReferences() {
    const buttonElsHTMLCollection = document.getElementsByClassName('button');
    buttonEls = [...buttonElsHTMLCollection];
    const buttonLabelElsHTMLCollection = document.getElementsByClassName(
      'button__label'
    );
    debugPreEl = document.getElementsByClassName('debug-pre').item(0);
    buttonLabelEls = [...buttonLabelElsHTMLCollection];
  }

  return {
    async init() {
      Data.init();
      setDomReferences();
      addEventListeners();

      const data = Data.getData();
      updateButtonView(data);
      updateDebugView(data);
    },
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
  handleDOMContentLoaded();
}
