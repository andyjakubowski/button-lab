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
        overallMin: 0,
        overallMax: 1000,
      },
      labelTransform: {
        options: ['capitalize', 'uppercase', 'lowercase'],
        min: 0,
        max: 2,
        overallMin: 0,
        overallMax: 2,
      },
    },
  };

  let state = {
    hue: null,
    hueCount: 10,
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
    const lScaledInt = Math.floor(lScaled);

    return { h, s: CONFIG.SATURATION_PERCENT, l: lScaledInt };
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
      return state;
    },

    setData(newDataObj) {
      const propNames = Object.getOwnPropertyNames(newDataObj);
      propNames.forEach((name) => {
        state[name] = newDataObj[name];
      });
    },

    getAdjustmentRange(adjustmentName) {
      const range = CONFIG.ADJUSTMENTS[adjustmentName];
      return {
        min: range.min,
        max: range.max,
        overallMin: range.overallMin,
        overallMax: range.overallMax,
      };
    },

    getAdjustmentNames() {
      return Object.getOwnPropertyNames(CONFIG.ADJUSTMENTS);
    },

    getLabelTransformValue(index) {
      return CONFIG.ADJUSTMENTS['labelTransform'].options[index];
    },
  };
})();

const App = (function buildApp() {
  const adjustmentOptionsElLists = {};
  let debugPreEl;
  let adjustmentNameListEls;
  let hueCountContainerEl;
  let adjustmentOptionsContainerEl;
  let styleEl;
  let hueCountSliderEl;
  let hueCountLabelEl;

  function setVh() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  function getHslPropValue({ hue, saturation, value }) {
    return `hsl(${hue}, ${saturation}%, ${value}%)`;
  }

  function render() {
    const data = Data.getData();
    const stylesObject = getButtonStyles(data);
    setButtonStyles(stylesObject);
    updateDebugView(data);
    updateAdjustmentsView(data);
  }

  function getButtonStyles({
    hue,
    saturation,
    value,
    borderRadius,
    labelTransform,
  }) {
    const backgroundColorValueIdle = getHslPropValue({
      hue,
      saturation,
      value,
    });
    const backgroundColorValueHover = getHslPropValue({
      hue,
      saturation,
      value: value + 10,
    });
    const backgroundColorValueDisabled = getHslPropValue({
      hue,
      saturation: 5,
      value,
    });
    const borderRadiusValue = `${borderRadius}px`;
    const textTransformValue = Data.getLabelTransformValue(labelTransform);

    return {
      shared: {
        'border-radius': borderRadiusValue,
        'text-transform': textTransformValue,
      },
      idle: {
        'background-color': backgroundColorValueIdle,
      },
      hover: {
        'background-color': backgroundColorValueHover,
      },
      disabled: {
        'background-color': backgroundColorValueDisabled,
      },
    };
  }

  function setButtonStyles(styles) {
    styleEl.innerHTML = `
      .button__label {
        text-transform: ${styles.shared['text-transform']};
      }

      .button {
        border-radius: ${styles.shared['border-radius']};
      }

      .button_idle {
        background-color: ${styles.idle['background-color']};
      }

      .button_hover,
      .button_idle:hover {
        background-color: ${styles.hover['background-color']};
      }

      .button_disabled {
        background-color: ${styles.disabled['background-color']};
      }
    `;
  }

  function filterOptionElList(optionElList, activeAdjustment) {
    if (activeAdjustment !== 'hue') {
      return optionElList;
    }

    const { hueCount } = Data.getData();
    let { min: hueMin, max: hueMax } = Data.getAdjustmentRange(
      activeAdjustment
    );
    hueMax += 1;
    const hueInterval = hueMax / hueCount;

    const filteredResult = [];

    for (let hueFloat = hueMin; hueFloat < hueMax; hueFloat += hueInterval) {
      const index = Math.floor(hueFloat);
      const optionEl = optionElList[index];
      filteredResult.push(optionEl);
    }

    console.log(
      `Okay let’s show ${hueCount} out of ${hueMax} colors with an interval of ${hueInterval}.`
    );

    return filteredResult;
  }

  function updateAdjustmentsView(data) {
    const {
      activeAdjustment,
      hue,
      hueCount,
      saturation,
      value,
      borderRadius,
      labelTransform,
    } = data;
    const activeAdjustmentClassName = 'adjustments__list-item_active';
    const activeOptionBoxClassName = 'adjustments__option-box_active';
    const activeHueCountContainerClassName =
      'adjustments__hue-count-container_active';
    const activeAdjustmentValue = data[activeAdjustment];

    adjustmentNameListEls.forEach((adjustmentNameListEl) => {
      if (adjustmentNameListEl.dataset.id == activeAdjustment) {
        adjustmentNameListEl.classList.add(activeAdjustmentClassName);
      } else {
        adjustmentNameListEl.classList.remove(activeAdjustmentClassName);
      }
    });

    if (activeAdjustment === 'hue') {
      hueCountContainerEl.classList.add(activeHueCountContainerClassName);
      hueCountSliderEl.value = hueCount;
      hueCountLabelEl.textContent = String(hueCount);
    } else {
      hueCountContainerEl.classList.remove(activeHueCountContainerClassName);
    }

    const currentOptionEls = [...adjustmentOptionsContainerEl.children];
    currentOptionEls.forEach((currentOptionEl) => {
      currentOptionEl.remove();
    });

    const optionElList = adjustmentOptionsElLists[activeAdjustment];

    let optionHue = hue;
    let optionSaturation = saturation;
    let optionColorValue = value;
    let optionBorderRadius = borderRadius;
    let optionLabelTransform = labelTransform;

    const filteredOptionElList = filterOptionElList(
      optionElList,
      activeAdjustment
    );

    filteredOptionElList.forEach((optionEl) => {
      const optionDataValue = Number(optionEl.dataset.value);
      if (optionDataValue === activeAdjustmentValue) {
        optionEl.classList.add(activeOptionBoxClassName);
      } else {
        optionEl.classList.remove(activeOptionBoxClassName);
      }

      switch (activeAdjustment) {
        case 'hue':
          optionHue = optionDataValue;
          break;
        case 'value':
          optionColorValue = optionDataValue;
          break;
        case 'borderRadius':
          optionBorderRadius = optionDataValue;
          break;
        case 'labelTransform':
          optionLabelTransform = optionDataValue;
          break;
        default:
          console.warn(
            `The adjustment “${activeAdjustment}” doesn't seem supported yet.`
          );
      }

      const backgroundColorValueIdle = getHslPropValue({
        hue: optionHue,
        saturation: optionSaturation,
        value: optionColorValue,
      });
      const borderRadiusValue = `${optionBorderRadius}px`;
      const textTransformValue = Data.getLabelTransformValue(
        optionLabelTransform
      );

      const buttonEl = optionEl.querySelector('.button');

      buttonEl.style.backgroundColor = backgroundColorValueIdle;
      buttonEl.style.borderRadius = borderRadiusValue;

      const labelEl = buttonEl.children[0];
      labelEl.style.textTransform = textTransformValue;
    });

    adjustmentOptionsContainerEl.append(...filteredOptionElList);
  }

  function createAdjustmentOptionEls(adjustmentNames) {
    adjustmentNames.forEach((name) => {
      const elements = [];
      const { min, max } = Data.getAdjustmentRange(name);

      for (let i = min; i <= max; i += 1) {
        const optionBoxEl = document.createElement('div');
        const buttonEl = document.createElement('div');
        const labelEl = document.createElement('span');
        optionBoxEl.classList.add('adjustments__option-box');
        optionBoxEl.dataset.value = i;
        buttonEl.classList.add('button', 'button_idle');
        labelEl.classList.add('button__label');
        labelEl.textContent = 'Send';
        optionBoxEl.append(buttonEl);
        buttonEl.append(labelEl);
        elements.push(optionBoxEl);
      }

      adjustmentOptionsElLists[name] = elements;
    });
  }

  function updateDebugView(dataObj) {
    const propNames = Object.getOwnPropertyNames(dataObj);
    const strings = propNames.map((name) => `${name}\n${dataObj[name]}\n`);
    const contentStr = strings.join('\n');
    debugPreEl.textContent = contentStr;
  }

  function handleAdjustmentNameListElClick(e) {
    Data.setData({ activeAdjustment: e.currentTarget.dataset.id });
    render();
  }

  function handleAdjustmentOptionsContainerElClick(e) {
    const closestOptionEl = e.target.closest('.adjustments__option-box');

    if (!closestOptionEl) {
      return;
    }

    const value = Number(closestOptionEl.dataset.value);
    const activeAdjustmentName = Data.getData().activeAdjustment;
    Data.setData({ [activeAdjustmentName]: value });
    render();
  }

  function handleDebugLinkClick() {
    debugPreEl.classList.toggle('debug-pre_off');
  }

  function handleHueCountSliderElChange(e) {
    const sliderValue = Number(e.target.value);
    Data.setData({ hueCount: sliderValue });
    render();
  }

  function handleHueCountSliderElInput(e) {
    const sliderValueString = e.target.value;
    const sliderValue = Number(e.target.value);
    Data.setData({ hueCount: sliderValue });
    render();
  }

  function addEventListeners() {
    adjustmentNameListEls.forEach((adjustmentNameListEl) => {
      adjustmentNameListEl.addEventListener(
        'click',
        handleAdjustmentNameListElClick
      );
    });

    const debugLink = document
      .getElementsByClassName('footer__link-debug')
      .item(0);
    debugLink.addEventListener('click', handleDebugLinkClick);

    window.addEventListener('load', setVh);
    window.addEventListener('resize', setVh);

    adjustmentOptionsContainerEl.addEventListener(
      'click',
      handleAdjustmentOptionsContainerElClick
    );

    hueCountSliderEl.addEventListener('change', handleHueCountSliderElChange);
    hueCountSliderEl.addEventListener('input', handleHueCountSliderElInput);
  }

  function setDomReferences() {
    const buttonElsHTMLCollection = document.getElementsByClassName('button');
    const buttonLabelElsHTMLCollection = document.getElementsByClassName(
      'button__label'
    );
    const adjustmentNameListElsHTMLCollection = document.getElementsByClassName(
      'adjustments__list-item'
    );
    buttonEls = [...buttonElsHTMLCollection];
    adjustmentNameListEls = [...adjustmentNameListElsHTMLCollection];
    debugPreEl = document.getElementsByClassName('debug-pre').item(0);
    buttonLabelEls = [...buttonLabelElsHTMLCollection];
    styleEl = document.getElementsByClassName('dynamic-styles').item(0);
    adjustmentOptionsContainerEl = document
      .getElementsByClassName('adjustments__options-container')
      .item(0);
    hueCountContainerEl = document
      .getElementsByClassName('adjustments__hue-count-container')
      .item(0);
    hueCountSliderEl = document
      .getElementsByClassName('adjustments__hue-count-slider')
      .item(0);
    hueCountLabelEl = document
      .getElementsByClassName('adjustments__hue-count-label')
      .item(0);
  }

  return {
    async init() {
      Data.init();
      setDomReferences();
      createAdjustmentOptionEls(Data.getAdjustmentNames());
      addEventListeners();
      render();
    },
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
  handleDOMContentLoaded();
}
