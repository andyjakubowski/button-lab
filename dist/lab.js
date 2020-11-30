function handleDOMContentLoaded() {
  App.init();
}

const Data = (function makeData() {
  const CONFIG = {
    SATURATION_PERCENT: 75,
    TEXT_TRANSFORM_OPTIONS: ['capitalize', 'uppercase', 'lowercase'],
    ADJUSTMENTS: {
      hue: {
        min: 0,
        max: 359,
        overallMin: 0,
        overallMax: 359,
      },
      value: {
        min: 40,
        max: 60,
        overallMin: 0,
        overallMax: 100,
      },
      borderRadius: {
        min: 0,
        max: 22,
      },
      labelTransform: {
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
    activeAdjustment: 'hue',
  };

  const normalizeHsl = function normalizeHsl({ h, l }) {
    const lScaled = MathUtil.scale(
      l,
      CONFIG.ADJUSTMENTS.value.overallMin,
      CONFIG.ADJUSTMENTS.value.overallMax,
      CONFIG.ADJUSTMENTS.value.min,
      CONFIG.ADJUSTMENTS.value.max
    );

    return { h, s: CONFIG.SATURATION_PERCENT, l: lScaled };
  };

  const getAdjustmentValue = function getAdjustmentValue(adjustmentName) {
    return state[adjustmentName];
  };

  const getRandomData = function getRandomData() {
    const hslColor = ColorUtil.getRandomHslColor();
    const { h, s, l } = normalizeHsl(hslColor);

    const randomTransformIndex = MathUtil.getRandomInt(
      CONFIG.ADJUSTMENTS.labelTransform.options.length
    );

    const borderRadius = MathUtil.getRandomInt(
      CONFIG.ADJUSTMENTS.borderRadius.max
    );

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

    scaleAdjustmentValueToSlider(adjustmentName, sliderEl) {
      const val = getAdjustmentValue(adjustmentName);
      const inMin = CONFIG.ADJUSTMENTS[adjustmentName].min;
      const inMax = CONFIG.ADJUSTMENTS[adjustmentName].max;
      const sliderMin = Number(sliderEl.min);
      const sliderMax = Number(sliderEl.max);
      console.log(`val: ${val}, inMin: ${inMin}, inMax: ${inMax}`);
      const valScaled = MathUtil.scale(val, inMin, inMax, sliderMin, sliderMax);
      return valScaled;
    },

    scaleAdjustmentValueFromSlider(adjustmentName, sliderEl) {
      const sliderVal = sliderEl.value;
      const sliderMin = Number(sliderEl.min);
      const sliderMax = Number(sliderEl.max);
      const adjustmentMin = CONFIG.ADJUSTMENTS[adjustmentName].min;
      const adjustmentMax = CONFIG.ADJUSTMENTS[adjustmentName].max;
      const newVal = MathUtil.scale(
        sliderVal,
        sliderMin,
        sliderMax,
        adjustmentMin,
        adjustmentMax
      );
      return newVal;
    },

    getAdjustmentRange(adjustmentName) {
      return {
        min: CONFIG.ADJUSTMENTS[adjustmentName].min,
        max: CONFIG.ADJUSTMENTS[adjustmentName].max,
      };
    },

    getLabelTransformValue(index) {
      return CONFIG.ADJUSTMENTS['labelTransform'].options[index];
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
    render();
  }

  function handleSliderElInput(e) {
    const activeAdjustmentName = Data.getData().activeAdjustment;
    const slider = e.currentTarget;
    const valScaled = Data.scaleAdjustmentValueFromSlider(
      activeAdjustmentName,
      slider
    );
    Data.setData({ [activeAdjustmentName]: valScaled });
    render();
  }

  function render() {
    const dataObject = Data.getData();
    updateButtonView(dataObject);
    updateDebugView(dataObject);
    updateAdjustmentsView(dataObject);
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

    const adjustmentValScaled = Data.scaleAdjustmentValueToSlider(
      activeAdjustment,
      sliderEl
    );

    sliderEl.value = adjustmentValScaled;
    sliderEl.min = Data.getAdjustmentRange(activeAdjustment).min;
    sliderEl.max = Data.getAdjustmentRange(activeAdjustment).max;
  }

  function addEventListeners() {
    adjustmentListEls.forEach((adjustmentListEl) => {
      adjustmentListEl.addEventListener('click', handleAdjustmentListElClick);
    });

    sliderEl.addEventListener('input', handleSliderElInput);
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
      render();
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
