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

// eslint-disable-next-line @typescript-eslint/ban-types
function check1(params: Object): void {
  for (const [attr, value] of Object.entries(params)) {
    if (
      Object.prototype.hasOwnProperty.call(params, attr) &&
      (value < 0 || value > 1)
    ) {
      throw new Error(
        `Incompatible value detected: ${attr} = ${value}. Must be between [0, 1]`
      );
    }
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
function check255(params: Object): void {
  for (const [attr, value] of Object.entries(params)) {
    if (
      Object.prototype.hasOwnProperty.call(params, attr) &&
      (value < 0 || value > 255)
    ) {
      throw new Error(
        `Incompatible value detected: ${attr} = ${value}. Must be between [0, 1]`
      );
    }
  }
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

  static getLightnessFromRGB({ red, green, blue }: RGBColor): number {
    check1({ red, green, blue });
    return (Math.max(red, green, blue) + Math.min(red, green, blue)) * 0.5;
  }

  static getSaturationFromRGB({ red, green, blue }: RGBColor): number {
    check1({ red, green, blue });
    let saturation: number;
    const lightness = Color.getLightnessFromRGB({ red, green, blue });
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    if (lightness <= 0.5) {
      saturation = (max - min) / (max + min);
    } else {
      saturation = (max - min) / (2 - max - min);
    }
    return saturation || 0;
  }

  static getHueFromRGB({ red, green, blue }: RGBColor): number {
    check1({ red, green, blue });
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let hue: number;
    switch (max) {
      case red:
        hue = (green - blue) / (max - min);
        break;
      case green:
        hue = 2.0 + (blue - red) / (max - min);
        break;
      case blue:
        hue = 4.0 + (red - green) / (max - min);
        break;
      default:
        throw new Error(`Calculation Error: ${{ red, green, blue, max }}`);
    }
    return hue / 6 || 0;
  }

  static getHSLfromRGB(color: RGBColor): HSLColor {
    check1(color);
    return {
      hue: Color.getHueFromRGB(color),
      saturation: Color.getSaturationFromRGB(color),
      lightness: Color.getLightnessFromRGB(color),
    };
  }

  static getRGBfromHSL({ hue, saturation, lightness }: HSLColor): RGBColor {
    check1({ hue, saturation, lightness });
    const temp1 =
      lightness < 0.5
        ? lightness * (1 + saturation)
        : lightness + saturation - saturation * lightness;
    const temp2 = 2 * lightness - temp1;

    let tempR = hue + 1 / 3;
    tempR -= Math.trunc(tempR);
    const tempG = hue;
    let tempB = hue - 1 / 3;
    tempB -= Math.trunc(tempB);

    const arr = [tempR, tempG, tempB];

    for (let i = 0; i < arr.length; i += 1) {
      if (6 * arr[i] < 1) {
        arr[i] = temp2 + (temp1 - temp2) * 6 * arr[i];
      } else if (2 * arr[i] < 1) {
        arr[i] = temp1;
      } else if (3 * arr[i] < 2) {
        arr[i] = temp2 + (temp1 - temp2) * (4 - 6 * arr[i]);
      } else {
        arr[i] = temp2;
      }
    }

    return { red: tempR, green: tempG, blue: tempB };
  }

  static fromRGB(
    red: number,
    green: number,
    blue: number,
    alpha?: number
  ): Color {
    const rgbColor = { red, green, blue, alpha };
    check255(rgbColor);
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
      rgbColor.alpha !== undefined ? rgbColor.alpha : 1
    );
    return color;
  }

  static fromRGBA(
    red: number,
    green: number,
    blue: number,
    alpha: number
  ): Color {
    return Color.fromRGB(red, green, blue, alpha);
  }

  static fromHSL(
    hue: number,
    saturation: number,
    lightness: number,
    alpha?: number
  ): Color {
    const hslColor = { hue, saturation, lightness, alpha };
    check255(hslColor);
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

  static fromHSLA(
    hue: number,
    saturation: number,
    lightness: number,
    alpha?: number
  ): Color {
    return Color.fromHSL(hue, saturation, lightness, alpha);
  }

  static fromHex(hexString: string): Color {
    const hex = hexString.slice(1);
    let color: RGBColor;
    if (hex.length >= 5) {
      color = {
        red: parseInt(hex.slice(0, 2), 16),
        green: parseInt(hex.slice(2, 4), 16),
        blue: parseInt(hex.slice(4, 6), 16),
        alpha: parseInt(hex.slice(6, 8) || 'FF', 16) / 255,
      };
    } else {
      color = {
        red: parseInt(hex[0] + hex[0], 16),
        green: parseInt(hex[1] + hex[1], 16),
        blue: parseInt(hex[2] + hex[2], 16),
        alpha: parseInt(hex[3] + hex[3] || 'FF', 16) / 255,
      };
    }
    return Color.fromRGB(color.red, color.green, color.blue, color.alpha);
  }

  static parseCSS(cssString: string): Color {
    const str = cssString.replaceAll(/\s+/g, '');
    const match = str.match(/^(rgb|hsl|#)(a?)(.+)/);
    if (match === null) {
      throw new Error(`Invalid CSS: ${cssString}`);
    }
    const data = match[3];
    let dataMatch: RegExpMatchArray | null;
    let rgbColor: RGBColor, hslColor: HSLColor;
    switch (match[1]) {
      case 'rgb':
        dataMatch = data.match(/\(([\d.]+),([\d.]+),([\d.]+),?([\d.]+)?\)/);
        if (dataMatch && dataMatch[1]) {
          rgbColor = {
            red: parseFloat(dataMatch[1]),
            green: parseFloat(dataMatch[2]),
            blue: parseFloat(dataMatch[3]),
            alpha: match[2] === 'a' ? parseFloat(dataMatch[4]) : 1,
          };
          return Color.fromRGB(
            rgbColor.red,
            rgbColor.green,
            rgbColor.blue,
            rgbColor.alpha
          );
        }
        dataMatch = data.match(/\(([\d.]+)%,([\d.]+)%,([\d.]+)%,?([\d.]+)?\)/);
        if (dataMatch && dataMatch[1]) {
          rgbColor = {
            red: parseFloat(dataMatch[1]) * 2.55,
            green: parseFloat(dataMatch[2]) * 2.55,
            blue: parseFloat(dataMatch[3]) * 2.55,
            alpha: match[2] === 'a' ? parseFloat(dataMatch[4]) : 1,
          };
          return Color.fromRGB(
            rgbColor.red,
            rgbColor.green,
            rgbColor.blue,
            rgbColor.alpha
          );
        }
        break;

      case 'hsl':
        dataMatch = data.match(/\(([\d.]+),([\d.]+)%,([\d.]+)%,?([\d.]+)?\)/);
        if (dataMatch && dataMatch[1]) {
          hslColor = {
            hue: parseFloat(dataMatch[1]),
            saturation: parseFloat(dataMatch[2]),
            lightness: parseFloat(dataMatch[3]),
            alpha: match[2] === 'a' ? parseFloat(dataMatch[4]) : 1,
          };
          return Color.fromHSL(
            hslColor.hue,
            hslColor.saturation,
            hslColor.lightness,
            hslColor.alpha
          );
        }
        break;

      case '#':
        return Color.fromHex(str);
      default:
        break;
    }
    throw new Error(`Invalid CSS: ${cssString}`);
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
    changes.red || this.red,
    changes.green || this.green,
    changes.blue || this.blue,
    changes.hue || this.hue,
    changes.saturation || this.saturation,
    changes.lightness || this.lightness,
    changes.alpha || this.alpha
  );
};

// const color1 = new Color()
const color = Color.fromHex('#E22A7F');
console.log(color);

export default Color;
