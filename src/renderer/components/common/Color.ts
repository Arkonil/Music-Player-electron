/* eslint-disable @typescript-eslint/naming-convention */
export interface HSLColor {
  hue: number;
  saturation: number;
  lightness: number;
  alpha?: number;
}

export interface RGBColor {
  red: number;
  green: number;
  blue: number;
  alpha?: number;
}

export interface ColorProperties extends HSLColor, RGBColor {}

function checkInRange(
  value: number,
  min: number,
  max: number,
  name = 'variable'
) {
  if (value < min || value > max) {
    throw new Error(
      `Incompatible value detected: ${name} = ${value}, must be between [${min}, ${max}]`
    );
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
function check1(params: Object): void {
  for (const [attr, value] of Object.entries(params)) {
    if (Object.prototype.hasOwnProperty.call(params, attr)) {
      checkInRange(value, 0, 1, attr);
    }
  }
}

function checkRGB({ red, green, blue, alpha }: RGBColor): void {
  checkInRange(red, 0, 255, 'red');
  checkInRange(green, 0, 255, 'green');
  checkInRange(blue, 0, 255, 'blue');
  if (alpha !== undefined) checkInRange(alpha, 0, 1, 'alpha');
}

function checkHSL({ hue, saturation, lightness, alpha }: HSLColor): void {
  checkInRange(hue, 0, 360, 'hue');
  checkInRange(saturation, 0, 100, 'saturation');
  checkInRange(lightness, 0, 100, 'lightness');
  if (alpha !== undefined) checkInRange(alpha, 0, 1, 'alpha');
}

class Color {
  toRGBString!: () => string;
  toRGBAString!: () => string;
  toHSLString!: () => string;
  toHSLAString!: () => string;
  toHexString!: () => string;
  toLighterShade!: (f?: number) => Color;
  toDarkerShade!: (f?: number) => Color;
  withChanges!: (changes: {
    red?: number;
    green?: number;
    blue?: number;
    hue?: number;
    saturation?: number;
    lightness?: number;
    alpha?: number;
  }) => Color;
  red: number;
  green: number;
  blue: number;
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;

  constructor(
    red: number,
    green: number,
    blue: number,
    hue: number,
    saturation: number,
    lightness: number,
    alpha: number
  ) {
    check1({ red, green, blue, hue, saturation, lightness, alpha });

    this.red = red;
    this.green = green;
    this.blue = blue;
    this.hue = hue;
    this.saturation = saturation;
    this.lightness = lightness;
    this.alpha = alpha;
  }

  /**
   * Converts an RGB color value to HSL. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes red, green, and blue are contained in the set [0, 1] and
   * returns hue, saturation, and lightness in the set [0, 1].
   *
   * @param {RGBColor}  color The RGB color values
   * @return {HSLColor} The HSL representation
   */
  static getHSLfromRGB(color: RGBColor): HSLColor {
    check1(color);
    const { red, green, blue } = color;
    const max = Math.max(red, green, blue),
      min = Math.min(red, green, blue);

    let hue: number, saturation: number;
    const lightness = (max + min) / 2;

    if (max === min) {
      hue = 0; // achromatic
      saturation = 0;
    } else {
      const diff = max - min;
      saturation =
        lightness > 0.5 ? diff / (2 - max - min) : diff / (max + min);
      switch (max) {
        case red:
          hue = (green - blue) / diff + (green < blue ? 6 : 0);
          break;
        case green:
          hue = (blue - red) / diff + 2;
          break;
        case blue:
          hue = (red - green) / diff + 4;
          break;
        default:
          hue = 0;
      }
      hue /= 6;
    }

    return {
      hue,
      saturation,
      lightness,
    };
  }

  static getRGBfromHSL({ hue, saturation, lightness }: HSLColor): RGBColor {
    check1({ hue, saturation, lightness });
    if (saturation === 0) {
      return { red: lightness, green: lightness, blue: lightness };
    }

    function hue2rgb(p: number, q: number, t: number) {
      // eslint-disable-next-line no-underscore-dangle
      let _t = t;
      if(_t < 0) _t += 1;
      if(_t > 1) _t -= 1;
      if(_t < 1/6) return p + (q - p) * 6 * _t;
      if(_t < 1/2) return q;
      if(_t < 2/3) return p + (q - p) * (2/3 - _t) * 6;
      return p;
    }

    const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
    const p = 2 * lightness - q;

    return {
      red: hue2rgb(p, q, hue + 1/3),
      green: hue2rgb(p, q, hue),
      blue: hue2rgb(p, q, hue - 1/3),
    }
  }

  /**
   *
   * @param red number in [0, 255]
   * @param green number in [0, 255]
   * @param blue number in [0, 255]
   * @returns Color
   */
  static fromRGB(
    red: number,
    green: number,
    blue: number,
    alpha?: number
  ): Color {
    // console.log({ red, green, blue, alpha })
    const rgbColor = { red, green, blue, alpha };
    checkRGB(rgbColor);
    const rgbColorDec = {
      red: rgbColor.red / 255,
      green: rgbColor.green / 255,
      blue: rgbColor.blue / 255,
    };
    const hslColorDec = Color.getHSLfromRGB(rgbColorDec);
    const color = new Color(
      rgbColorDec.red,
      rgbColorDec.green,
      rgbColorDec.blue,
      hslColorDec.hue,
      hslColorDec.saturation,
      hslColorDec.lightness,
      rgbColor.alpha ?? 1
    );
    return color;
  }

  /**
   *
   * @param red number in [0, 255]
   * @param green number in [0, 255]
   * @param blue number in [0, 255]
   * @returns Color
   */
  static fromRGBA(
    red: number,
    green: number,
    blue: number,
    alpha: number
  ): Color {
    return Color.fromRGB(red, green, blue, alpha);
  }

  /**
   * @param hue number in [0, 360]
   * @param saturation number in [0, 100]
   * @param lightness number in [0, 100]
   * @returns Color
   */
  static fromHSL(
    hue: number,
    saturation: number,
    lightness: number,
    alpha?: number
  ): Color {
    const hslColor = { hue, saturation, lightness, alpha };
    checkHSL(hslColor);
    const hslColorDec = {
      hue: hslColor.hue / 360,
      saturation: hslColor.saturation / 100,
      lightness: hslColor.lightness / 100,
    };
    const rgbColorDec = Color.getRGBfromHSL(hslColorDec);
    const color = new Color(
      rgbColorDec.red,
      rgbColorDec.green,
      rgbColorDec.blue,
      hslColorDec.hue,
      hslColorDec.saturation,
      hslColorDec.lightness,
      hslColor.alpha !== undefined ? hslColor.alpha : 1
    );
    return color;
  }

  /**
   * @param hue number in [0, 360]
   * @param saturation number in [0, 100]
   * @param lightness number in [0, 100]
   * @returns Color
   */
  static fromHSLA(
    hue: number,
    saturation: number,
    lightness: number,
    alpha?: number
  ): Color {
    return Color.fromHSL(hue, saturation, lightness, alpha);
  }

  /**
   * Parses hex color string
   * @param hexString string
   * @returns Color
   */
  static fromHex(hexString: string): Color {
    // console.log(hexString);
    return Color.parseCSS(hexString);
  }

  /**
   * Parses css color
   * @param cssString string
   * @returns Color
   */
  static parseCSS(cssString: string): Color {
    const color = window.electron.parseCSSColorString(cssString);

    if (color === null) {
      throw new Error(`Invalid CSS: ${cssString}`);
    }

    if (color.type === 'rgb') {
      const [red, green, blue] = color.values;
      return Color.fromRGBA(red, green, blue, color.alpha);
    }

    const [hue, saturation, lightness] = color.values;
    return Color.fromHSLA(
      ((hue % 360) + 360) % 360,
      saturation,
      lightness,
      color.alpha
    );
  }
}

// eslint-disable-next-line func-names
Color.prototype.toRGBString = function toRGBString(): string {
  return `rgb(${Math.round(this.red * 255)}, ${Math.round(
    this.green * 255
  )}, ${Math.round(this.blue * 255)})`;
};

Color.prototype.toRGBAString = function toRGBAString(): string {
  return `rgba(${Math.round(this.red * 255)}, ${Math.round(
    this.green * 255
  )}, ${Math.round(this.blue * 255)}, ${this.alpha.toFixed(2)})`;
};

Color.prototype.toHSLString = function toHSLString(): string {
  return `hsl(${Math.round(this.hue * 360)}, ${Math.round(
    this.saturation * 100
  )}%, ${Math.round(this.lightness * 100)}%)`;
};

Color.prototype.toHSLAString = function toHSLAString(): string {
  return `hsla(${Math.round(this.hue * 360)}, ${Math.round(
    this.saturation * 100
  )}%, ${Math.round(this.lightness * 100)}%, ${this.alpha.toFixed(2)})`;
};

Color.prototype.toHexString = function toHexString(): string {
  return `#${Math.round(255 * this.red)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()}${Math.round(255 * this.green)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()}${Math.round(255 * this.blue)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()}${Math.round(255 * this.alpha)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase()}`;
};

Color.prototype.toLighterShade = function toLighterShade(f = 0.5): Color {
  if (f > 1 || f < 0) {
    console.warn(`Invalid value of f=${f}, should be between 0 and 1.`);
    console.trace();
    // eslint-disable-next-line no-param-reassign
    f = Math.max(0, Math.min(1, f));
  }
  return new Color(
    this.red,
    this.green,
    this.blue,
    this.hue,
    this.saturation,
    this.lightness * (1 - f) + f,
    this.alpha
  );
};

Color.prototype.toDarkerShade = function toDarkerShade(f = 0.5): Color {
  if (f > 1 || f < 0) {
    console.warn(`Invalid value of f=${f}, should be between 0 and 1.`);
    console.trace();
    // eslint-disable-next-line no-param-reassign
    f = Math.max(0, Math.min(1, f));
  }
  return new Color(
    this.red,
    this.green,
    this.blue,
    this.hue,
    this.saturation,
    this.lightness * f,
    this.alpha
  );
};

Color.prototype.withChanges = function withChanges(changes: {
  red?: number;
  green?: number;
  blue?: number;
  hue?: number;
  saturation?: number;
  lightness?: number;
  alpha?: number;
}): Color {
  return new Color(
    changes.red ?? this.red,
    changes.green ?? this.green,
    changes.blue ?? this.blue,
    changes.hue ?? this.hue,
    changes.saturation ?? this.saturation,
    changes.lightness ?? this.lightness,
    changes.alpha ?? this.alpha
  );
};

export default Color;

export const toOpacityString = (
  color: string | Color,
  opacity: number
): string => {
  let derivedColor: Color;
  if (typeof color === 'string') {
    derivedColor = Color.parseCSS(color);
  } else {
    derivedColor = color;
  }

  derivedColor = derivedColor.withChanges({ alpha: opacity });
  return derivedColor.toHSLAString();
};

export const toSaturationString = (
  color: string | Color,
  saturation: number
): string => {
  let derivedColor: Color;
  if (typeof color === 'string') {
    derivedColor = Color.parseCSS(color);
  } else {
    derivedColor = color;
  }

  derivedColor = derivedColor.withChanges({ saturation });
  return derivedColor.toHSLAString();
};
