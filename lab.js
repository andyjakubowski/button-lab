function handleDOMContentLoaded() {
  App.init();
}

const App = (function buildApp() {
  let buttonEls;
  let buttonLabelEls;

  const setRandomBackground = (function makeSetRandomBackground() {
    function getRandomHsl() {
      const SATURATION_PERCENT = 75;
      const LIGHTNESS_PERCENT_ARBITRARY_MIN = 40;
      const LIGHTNESS_PERCENT_ARBITRARY_MAX = 60;
      const LIGHTNESS_PERCENT_OVERALL_MIN = 0;
      const LIGHTNESS_PERCENT_OVERALL_MAX = 100;
      const hexColor = ColorUtil.getRandomHexColor();
      const { h, l } = ColorUtil.hexToHsl(hexColor);
      const lScaled = MathUtil.scale(
        l,
        LIGHTNESS_PERCENT_OVERALL_MIN,
        LIGHTNESS_PERCENT_OVERALL_MAX,
        LIGHTNESS_PERCENT_ARBITRARY_MIN,
        LIGHTNESS_PERCENT_ARBITRARY_MAX
      );
      const propValue = `hsl(${h}, ${SATURATION_PERCENT}%, ${lScaled}%)`;

      return propValue;
    }

    return function setRandomBackground() {
      const backgroundColorValue = getRandomHsl();

      buttonEls.forEach((buttonEl) => {
        buttonEl.style.backgroundColor = backgroundColorValue;
      });
    };
  })();

  const setRandomShape = (function makeSetRandomShape() {
    const BORDER_RADIUS_MIN = 0;
    const BORDER_RADIUS_MAX = 22; // Half of hardcoded CSS height
    const getRandomRadius = function getRandomRadius() {
      return MathUtil.getRandomInt(BORDER_RADIUS_MAX);
    };

    return function setRandomShape() {
      const randomBorderRadius = getRandomRadius();

      buttonEls.forEach((buttonEl) => {
        buttonEl.style.borderRadius = `${randomBorderRadius}px`;
      });
    };
  })();

  const setRandomLabelTextTransform = (function makeSetRandomLabelTextTransform() {
    const TEXT_TRANSFORM_OPTIONS = ['capitalize', 'uppercase', 'lowercase'];
    const randomIndex = MathUtil.getRandomInt(TEXT_TRANSFORM_OPTIONS.length);
    const transformValue = TEXT_TRANSFORM_OPTIONS[randomIndex];

    return function setRandomLabelTextTransform() {
      buttonLabelEls.forEach((labelEl) => {
        labelEl.style.textTransform = transformValue;
      });
    };
  })();

  function setButtonToRandomValues() {
    setRandomBackground();
    setRandomShape();
    setRandomLabelTextTransform();
  }

  function addEventListeners() {}

  function setDomReferences() {
    const buttonElsHTMLCollection = document.getElementsByClassName('button');
    buttonEls = [...buttonElsHTMLCollection];
    const buttonLabelElsHTMLCollection = document.getElementsByClassName(
      'button__label'
    );
    buttonLabelEls = [...buttonLabelElsHTMLCollection];
  }

  return {
    async init() {
      setDomReferences();
      addEventListeners();
      setButtonToRandomValues();
    },
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
  handleDOMContentLoaded();
}
