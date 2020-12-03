function handleDOMContentLoaded() {
  App.init();
}

const Data = (function makeData() {
  const CONFIG = {
    SATURATION_PERCENT: 75,
    TEXT_TRANSFORM_OPTIONS: ['capitalize', 'uppercase', 'lowercase'],
    ADJUSTMENTS_WITH_COUNT_FILTER: ['hue', 'value', 'borderRadius'],
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
    valueCount: 5,
    borderRadius: null,
    borderRadiusCount: 5,
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

    isAdjustmentCountFilterable(adjustmentName) {
      return CONFIG.ADJUSTMENTS_WITH_COUNT_FILTER.includes(adjustmentName);
    },
  };
})();

const App = (function buildApp() {
  const adjustmentOptionsElLists = {};
  let debugPreEl;
  let adjustmentNameListEls;
  let adjustmentOptionsContainerEl;
  let styleEl;
  let adjustmentCountContainerEl;
  let adjustmentCountSliderEl;
  let adjustmentCountLabelEl;
  let getJsonAnchorEl;

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
    updateAdjustmentsView(data);
    updateDebugView(data);
    updateDownloadLink(data);
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

  function getStyleExportObject(data) {
    const { hue, saturation, value, borderRadius, labelTransform } = data;
    const stylesObject = {
      button: {
        label: {
          text: {
            textColor: {
              value: 'white',
              type: 'keyword',
            },
            textTransform: {
              value: Data.getLabelTransformValue(labelTransform),
              type: 'keyword',
            },
          },
        },
        background: {
          backgroundColor: {
            value: {
              h: hue,
              s: saturation,
              l: value,
            },
            type: 'hsl',
          },
          borderRadius: {
            value: borderRadius,
            type: 'px',
          },
        },
      },
    };

    return stylesObject;
  }

  function getCountKey(adjustmentName) {
    return `${adjustmentName}Count`;
  }

  function filterOptionElList(optionElList, activeAdjustment) {
    if (!Data.isAdjustmentCountFilterable(activeAdjustment)) {
      return optionElList;
    }

    const countKey = getCountKey(activeAdjustment);
    const { [countKey]: desiredCount } = Data.getData();
    let { min, max } = Data.getAdjustmentRange(activeAdjustment);

    // Add one because we want min and max inclusive
    const totalCount = max - min + 1;
    const interval = totalCount / desiredCount;

    const filteredResult = [];

    for (let indexFloat = 0; indexFloat <= totalCount; indexFloat += interval) {
      const optionIndex = Math.floor(indexFloat);
      const optionEl = optionElList[optionIndex];

      if (filteredResult.length >= desiredCount) {
        break;
      }

      filteredResult.push(optionEl);
    }

    return filteredResult;
  }

  function updateAdjustmentsView(data) {
    const {
      activeAdjustment,
      hue,
      saturation,
      value,
      borderRadius,
      labelTransform,
    } = data;
    const activeAdjustmentClassName = 'adjustments__list-item_active';
    const activeOptionBoxClassName = 'adjustments__option-box_active';
    const activeAdjustmentCountContainerClassName =
      'adjustments__count-container_active';
    const activeAdjustmentValue = data[activeAdjustment];

    adjustmentNameListEls.forEach((adjustmentNameListEl) => {
      if (adjustmentNameListEl.dataset.id == activeAdjustment) {
        adjustmentNameListEl.classList.add(activeAdjustmentClassName);
      } else {
        adjustmentNameListEl.classList.remove(activeAdjustmentClassName);
      }
    });

    if (Data.isAdjustmentCountFilterable(activeAdjustment)) {
      const { min, max } = Data.getAdjustmentRange(activeAdjustment);
      const totalCount = max - min + 1;
      const sliderMin = 1;
      const sliderMax = totalCount;
      const countKey = getCountKey(activeAdjustment);
      const adjustmentCount = data[countKey];
      adjustmentCountContainerEl.classList.add(
        activeAdjustmentCountContainerClassName
      );
      adjustmentCountSliderEl.value = adjustmentCount;
      adjustmentCountSliderEl.min = sliderMin;
      adjustmentCountSliderEl.max = sliderMax;
      adjustmentCountLabelEl.textContent = String(adjustmentCount);
    } else {
      adjustmentCountContainerEl.classList.remove(
        activeAdjustmentCountContainerClassName
      );
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

  function updateDownloadLink(dataObj) {
    const stylesObject = getStyleExportObject(dataObj);
    const jsonObject = JSON.stringify(stylesObject);
    const blob = new Blob([jsonObject], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    getJsonAnchorEl.href = url;
    getJsonAnchorEl.download = `button-styles.json`;
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

  function handleAdjustmentCountSliderElInput(e) {
    const sliderValue = Number(e.target.value);
    const activeAdjustmentName = Data.getData().activeAdjustment;
    const countKey = getCountKey(activeAdjustmentName);
    Data.setData({ [countKey]: sliderValue });
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

    adjustmentCountSliderEl.addEventListener(
      'input',
      handleAdjustmentCountSliderElInput
    );
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
    adjustmentCountContainerEl = document
      .getElementsByClassName('adjustments__count-container')
      .item(0);
    adjustmentCountSliderEl = document
      .getElementsByClassName('adjustments__count-slider')
      .item(0);
    adjustmentCountLabelEl = document
      .getElementsByClassName('adjustments__count-label')
      .item(0);
    getJsonAnchorEl = document
      .getElementsByClassName('footer__link-get-json')
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
