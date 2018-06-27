class Color {
  constructor(hex) {
    this.hex = hex;
    this.rgb = Color.hexToRgb(hex);

    let evaluation = Color.evaluateHex(hex);
    this.chroma = evaluation.chroma;
    this.hue = evaluation.hue;
    this.saturation = evaluation.saturation;
    this.value = evaluation.value;
    this.luma = evaluation.luma;
  }

  static hexToRgb(hex) {
    return {
      "r": parseInt(hex.substring(0, 2), 16),
      "g": parseInt(hex.substring(2, 4), 16),
      "b": parseInt(hex.substring(4, 6), 16)
    };
  }

  static evaluateHex(hex) {
    hex = hex.substring(1);
    let rgb = Color.hexToRgb(hex);
    rgb.r /= 255, rgb.g /= 255, rgb.b /= 255;

    /* Getting the Max and Min values for Chroma. */
    let max = Math.max.apply(Math, [rgb.r, rgb.g, rgb.b]);
    let min = Math.min.apply(Math, [rgb.r, rgb.g, rgb.b]);

    /* Variables for HSV value of hex color. */
    let chr = max - min;
    let val = max;
    let hue = 0;
    let sat = 0;

    if (val > 0) {
      sat = chr / val;
      if (sat > 0) {
        if (rgb.r == max) {
          hue = 60 * (((rgb.g - min) - (rgb.b - min)) / chr);
          if (hue < 0) hue += 360;
        } else if (rgb.g == max) hue = 120 + 60 * (((rgb.b - min) - (rgb.r - min)) / chr);
        else if (rgb.b == max) hue = 240 + 60 * (((rgb.r - min) - (rgb.g - min)) / chr);
      }
    }

    return {
      chroma: chr,
      hue: hue,
      saturation: sat,
      value: val,
      luma: 0.3 * rgb.r + 0.59 * rgb.g + 0.11 * rgb.b
    };
  }
}
