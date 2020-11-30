function handleDOMContentLoaded() {
  App.init();
}

const Data = (function makeData() {
  const CONFIG = {
    SATURATION_PERCENT: 75,
    LIGHTNESS_PERCENT_ARBITRARY_MIN: 40,
    LIGHTNESS_PERCENT_ARBITRARY_MAX: 60,
    LIGHTNESS_PERCENT_OVERALL_MIN: 0,
    LIGHTNESS_PERCENT_OVERALL_MAX: 100,
    BORDER_RADIUS_MAX: 22,
    TEXT_TRANSFORM_OPTIONS: ['capitalize', 'uppercase', 'lowercase'],
    ADJUSTMENT_NAMES: ['color', 'brightness', 'shape', 'label'],
  };

  let state = {
    hue: null,
    saturation: null,
    value: null,
    borderRadius: null,
    labelTransform: null,
    activeAdjustment: CONFIG.ADJUSTMENT_NAMES[0],
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
    state.hue = randomData.hue;
    state.saturation = randomData.saturation;
    state.value = randomData.value;
    state.borderRadius = randomData.borderRadius;
    state.labelTransform = randomData.labelTransform;
  };

  return {
    init() {
      resetData();
      console.log('Data object initialized.');
    },

    getData() {
      return {
        hue: state.hue,
        saturation: state.saturation,
        value: state.value,
        borderRadius: state.borderRadius,
        labelTransform: state.labelTransform,
        activeAdjustment: state.activeAdjustment,
      };
    },

    setData(newDataObj) {
      const propNames = Object.getOwnPropertyNames(newDataObj);
      propNames.forEach((name) => {
        state[name] = newDataObj[name];
      });
    },
  };
})();

const App = (function buildApp() {
  let buttonEls;
  let buttonLabelEls;
  let debugPreEl;
  let adjustmentListEls;

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

  function handleAdjustmentListElClick(e) {
    Data.setData({ activeAdjustment: e.currentTarget.dataset.id });
    updateAdjustmentsView(Data.getData());
  }

  function updateAdjustmentsView({ activeAdjustment }) {
    const activeAdjustmentClassName = 'adjustments__list-item_active';
    adjustmentListEls.forEach((adjustmentListEl) => {
      if (adjustmentListEl.dataset.id == activeAdjustment) {
        adjustmentListEl.classList.add(activeAdjustmentClassName);
      } else {
        adjustmentListEl.classList.remove(activeAdjustmentClassName);
      }
    });
  }

  function addEventListeners() {
    adjustmentListEls.forEach((adjustmentListEl) => {
      adjustmentListEl.addEventListener('click', handleAdjustmentListElClick);
    });
  }

  function setDomReferences() {
    const buttonElsHTMLCollection = document.getElementsByClassName('button');
    const buttonLabelElsHTMLCollection = document.getElementsByClassName(
      'button__label'
    );
    const adjustmentListElsHTMLCollection = document.getElementsByClassName(
      'adjustments__list-item'
    );
    buttonEls = [...buttonElsHTMLCollection];
    adjustmentListEls = [...adjustmentListElsHTMLCollection];
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
      updateAdjustmentsView(data);
    },
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
  handleDOMContentLoaded();
}
