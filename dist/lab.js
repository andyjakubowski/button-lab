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
  let adjustmentOptionsContainerEl;
  let styleEl;

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

  function updateAdjustmentsView({
    activeAdjustment,
    hue,
    saturation,
    value,
    borderRadius,
    labelTransform,
  }) {
    const activeAdjustmentClassName = 'adjustments__list-item_active';
    adjustmentNameListEls.forEach((adjustmentNameListEl) => {
      if (adjustmentNameListEl.dataset.id == activeAdjustment) {
        adjustmentNameListEl.classList.add(activeAdjustmentClassName);
      } else {
        adjustmentNameListEl.classList.remove(activeAdjustmentClassName);
      }
    });

    const currentOptionEls = [...adjustmentOptionsContainerEl.children];
    currentOptionEls.forEach((currentOptionEl) => {
      currentOptionEl.remove();
    });

    const optionElList = adjustmentOptionsElLists[activeAdjustment];

    const valueMin = Data.getAdjustmentRange('value').min;
    let optionHue = hue;
    let optionSaturation = saturation;
    let optionValue = value;
    let optionBorderRadius = borderRadius;
    let optionLabelTransform = labelTransform;

    optionElList.forEach((optionEl, optionIndex) => {
      switch (activeAdjustment) {
        case 'hue':
          optionHue = optionIndex;
          break;
        case 'value':
          optionValue = valueMin + optionIndex;
          break;
        case 'borderRadius':
          optionBorderRadius = optionIndex;
          break;
        case 'labelTransform':
          optionLabelTransform = optionIndex;
          break;
        default:
          console.warn(
            `The adjustment “${activeAdjustment}” doesn't seem supported yet.`
          );
      }

      const backgroundColorValueIdle = getHslPropValue({
        hue: optionHue,
        saturation: optionSaturation,
        value: optionValue,
      });
      const borderRadiusValue = `${optionBorderRadius}px`;
      const textTransformValue = Data.getLabelTransformValue(
        optionLabelTransform
      );

      optionEl.style.backgroundColor = backgroundColorValueIdle;
      optionEl.style.borderRadius = borderRadiusValue;

      const labelEl = optionEl.children[0];
      labelEl.style.textTransform = textTransformValue;
    });

    adjustmentOptionsContainerEl.append(...optionElList);
  }

  function createAdjustmentOptionEls(adjustmentNames) {
    adjustmentNames.forEach((name) => {
      const elements = [];
      const { min, max } = Data.getAdjustmentRange(name);

      for (let i = min; i <= max; i += 1) {
        const buttonEl = document.createElement('div');
        const labelEl = document.createElement('span');
        buttonEl.classList.add('button', 'button_idle');
        buttonEl.dataset.value = i;
        labelEl.classList.add('button__label');
        labelEl.textContent = 'Send';
        buttonEl.append(labelEl);
        elements.push(buttonEl);
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
    const closestButtonEl = e.target.closest('.button');

    if (!closestButtonEl) {
      return;
    }

    const value = Number(closestButtonEl.dataset.value);
    const activeAdjustmentName = Data.getData().activeAdjustment;
    Data.setData({ [activeAdjustmentName]: value });
    render();
  }

  function handleDebugLinkClick() {
    debugPreEl.classList.toggle('debug-pre_off');
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
