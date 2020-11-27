function handleDOMContentLoaded() {
  App.init();
}

const App = (function buildApp() {
  let buttonEls;

  function getGoodHsl() {
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

  function setButtonToRandomValues() {
    const backgroundColorValue = getGoodHsl();

    buttonEls.forEach((buttonEl) => {
      buttonEl.style.backgroundColor = backgroundColorValue;
    });
  }

  function addEventListeners() {}

  function setDomReferences() {
    const buttonElsHTMLCollection = document.getElementsByClassName('button');
    buttonEls = [...buttonElsHTMLCollection];
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
