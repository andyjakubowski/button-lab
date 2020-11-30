function handleDOMContentLoaded() {
  App.init();
}

const Data = (function makeData() {
  const CONFIG = {
    SATURATION_PERCENT: 75,
    TEXT_TRANSFORM_OPTIONS: ['capitalize', 'uppercase', 'lowercase'],
    ADJUSTMENTS: {
      color: {
        stateName: 'hue',
        min: 0,
        max: 359,
        overallMin: 0,
        overallMax: 359,
      },
      brightness: {
        stateName: 'value',
        min: 40,
        max: 60,
        overallMin: 0,
        overallMax: 100,
      },
      shape: {
        stateName: 'borderRadius',
        min: 0,
        max: 22,
      },
      label: {
        stateName: 'labelTransform',
        options: ['capitalize', 'uppercase', 'lowercase'],
        min: 0,
        max: 2,
      },
    },
  };

  let state = {
    hue: null,
    saturation: null,
    value: null,
    borderRadius: null,
    labelTransform: null,
    activeAdjustment: 'color',
  };

  const normalizeHsl = function normalizeHsl({ h, l }) {
    const lScaled = MathUtil.scale(
      l,
      CONFIG.ADJUSTMENTS.brightness.overallMin,
      CONFIG.ADJUSTMENTS.brightness.overallMax,
      CONFIG.ADJUSTMENTS.brightness.min,
      CONFIG.ADJUSTMENTS.brightness.max
    );

    return { h, s: CONFIG.SATURATION_PERCENT, l: lScaled };
  };

  const getAdjustmentValue = function getAdjustmentValue(adjustmentName) {
    const statePropName = CONFIG.ADJUSTMENTS[adjustmentName].stateName;
    return state[statePropName];
  };

  const getRandomData = function getRandomData() {
    const hslColor = ColorUtil.getRandomHslColor();
    const { h, s, l } = normalizeHsl(hslColor);

    const randomTransformIndex = MathUtil.getRandomInt(
      CONFIG.ADJUSTMENTS.label.options.length
    );
    // const transformValue = CONFIG.ADJUSTMENTS.label.options[randomIndex];

    const borderRadius = MathUtil.getRandomInt(CONFIG.ADJUSTMENTS.shape.max);

    return {
      hue: h,
      saturation: s,
      value: l,
      borderRadius,
      labelTransform: randomTransformIndex,
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

    getScaledAdjustmentValue(adjustmentName, outMin = 0, outMax = 100) {
      const val = getAdjustmentValue(adjustmentName);
      const inMin = CONFIG.ADJUSTMENTS[adjustmentName].min;
      const inMax = CONFIG.ADJUSTMENTS[adjustmentName].max;
      console.log(`val: ${val}, inMin: ${inMin}, inMax: ${inMax}`);
      const valScaled = MathUtil.scale(val, inMin, inMax, outMin, outMax);
      return valScaled;
    },

    getLabelTransformValue(index) {
      return CONFIG.ADJUSTMENTS['label'].options[index];
    },
  };
})();

const App = (function buildApp() {
  let buttonEls;
  let buttonLabelEls;
  let debugPreEl;
  let adjustmentListEls;
  let sliderEl;

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
      labelEl.style.textTransform = Data.getLabelTransformValue(labelTransform);
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

    const adjustmentValScaled = Data.getScaledAdjustmentValue(activeAdjustment);
    console.log(`adjustmentValScaled: ${adjustmentValScaled}`);
    // const adjustmentValScaled = MathUtil.scale(adjustmentVal);
    sliderEl.value = adjustmentValScaled;
    // scale(num, inMin, inMax, outMin, outMax)
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
    sliderEl = document.getElementsByClassName('adjustments__slider').item(0);
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

    getSliderEl() {
      return sliderEl;
    },
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
  handleDOMContentLoaded();
}
