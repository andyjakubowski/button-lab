const ColorPalettes = (function makeColorPalettes() {
  const appleSystem = {
    default: {
      light: [
        {
          name: 'blue',
          r: 0,
          g: 122,
          b: 255,
        },
        {
          name: 'green',
          r: 52,
          g: 199,
          b: 89,
        },
        {
          name: 'indigo',
          r: 88,
          g: 86,
          b: 214,
        },
        {
          name: 'orange',
          r: 255,
          g: 149,
          b: 0,
        },
        {
          name: 'pink',
          r: 255,
          g: 45,
          b: 85,
        },
        {
          name: 'purple',
          r: 175,
          g: 82,
          b: 222,
        },
        {
          name: 'red',
          r: 255,
          g: 59,
          b: 48,
        },
        {
          name: 'teal',
          r: 90,
          g: 200,
          b: 250,
        },
        {
          name: 'yellow',
          r: 255,
          g: 204,
          b: 0,
        },
      ],
    },
  };

  return {
    apple: appleSystem.default.light,
  };
})();
