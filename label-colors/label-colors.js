function handleDOMContentLoaded() {
  App.init();
}

const LocalStorageBuddy = {
  get(key) {
    return JSON.parse(localStorage.getItem(key));
  },

  set(key, value) {
    return localStorage.setItem(key, JSON.stringify(value));
  },
};

const Data = (function buildData() {
  const LABELED_COLORS_INDEX = 'buttonLabColorsIndex';
  const LABELED_COLORS_DATA = 'buttonLabColorsData';
  let index;
  let data;

  return {
    get() {
      return { index, data };
    },

    save({ colorHex, labelObject }) {
      console.log('saveData', colorHex, labelObject);
      index.push(colorHex);
      data.push(labelObject);
      LocalStorageBuddy.set(LABELED_COLORS_INDEX, index);
      LocalStorageBuddy.set(LABELED_COLORS_DATA, data);
    },

    init() {
      index = LocalStorageBuddy.get(LABELED_COLORS_INDEX) || [];
      data = LocalStorageBuddy.get(LABELED_COLORS_DATA) || [];
    },
  };
})();

const App = (function buildApp() {
  const colorBoxEl = document.getElementsByClassName('color-box').item(0);
  let buttonBadEl;
  let buttonGoodEl;
  let buttonEls;
  const countHeadingNumberlEl = document
    .getElementsByClassName('count-heading__number')
    .item(0);
  const jsonAnchorEl = document
    .getElementsByClassName('footer__link-json')
    .item(0);
  let currentColor;

  function updateDownloadLink() {
    const { data } = Data.get();
    const colorCount = data.length;
    const jsonObject = JSON.stringify(data);
    const blob = new Blob([jsonObject], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    jsonAnchorEl.href = url;
    jsonAnchorEl.download = `labeled-colors-${colorCount}.json`;
    jsonAnchorEl.textContent = 'Download JSON';
  }

  function updateCountLabel() {
    const { data } = Data.get();
    countHeadingNumberlEl.textContent = data.length;
  }

  function saveColorLabel(button) {
    const colorHex = ColorUtil.rgbToHex(currentColor);
    const { h: hue, s: saturation, l: value } = ColorUtil.rgbToHsl(
      currentColor
    );
    const rating = Number(button.textContent);
    const { red, green, blue } = currentColor;
    const labelObject = {
      colorHex,
      red,
      green,
      blue,
      hue,
      saturation,
      value,
      label: rating,
    };
    Data.save({ colorHex, labelObject });
  }

  function labelColor(button) {
    saveColorLabel(button);
    updateDownloadLink();
    updateCountLabel();
    setNewColor();
    displayNewColor();
  }

  function handleLabelButtonClick(e) {
    labelColor(e.target);
  }

  function handleSkipButtonClick(e) {
    e.preventDefault();
    setNewColor();
    displayNewColor();
  }

  function handleKeyUp(e) {
    const spaceKeyCode = 32;
    const enterKeyCode = 13;
    const keyCode = e.keyCode;

    if (keyCode == spaceKeyCode) {
      labelColor(buttonBadEl);
    } else if (keyCode == enterKeyCode) {
      labelColor(buttonGoodEl);
    }
  }

  function addEventListeners() {
    const buttons = [
      ...document.getElementsByClassName('buttons-list__button'),
    ];
    buttons.forEach((button) => {
      button.addEventListener('click', handleLabelButtonClick.bind());
    });

    const skipButton = document
      .getElementsByClassName('footer__link-skip')
      .item(0);
    skipButton.addEventListener('click', handleSkipButtonClick);

    document.addEventListener('keyup', handleKeyUp);
  }

  function setNewColor() {
    const labeledColors = Data.get().index;

    do {
      currentColor = ColorUtil.getRandomRGBColor();
      hexColor = ColorUtil.rgbToHex(currentColor);
    } while (labeledColors.includes(hexColor));
  }

  function displayNewColor() {
    buttonEls.forEach((buttonEl) => {
      buttonEl.style.backgroundColor = ColorUtil.rgbToHex(currentColor);
    });
    // colorBoxEl.style.backgroundColor = ColorUtil.rgbToHex(currentColor);
  }

  function setDomReferences() {
    const buttonElsHTMLCollection = document.getElementsByClassName('button');
    buttonEls = [...buttonElsHTMLCollection];

    buttonBadEl = document
      .getElementsByClassName('button-list__button_bad')
      .item(0);
    buttonGoodEl = document
      .getElementsByClassName('button-list__button_good')
      .item(0);
  }

  return {
    getIndex() {
      return Data.get().index;
    },

    getData() {
      return Data.get().data;
    },

    init() {
      Data.init();
      setDomReferences();
      updateDownloadLink();
      updateCountLabel();
      setNewColor();
      displayNewColor();
      addEventListeners();
    },
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
} else {
  handleDOMContentLoaded();
}
