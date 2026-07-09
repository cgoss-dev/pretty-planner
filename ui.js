// NOTE: Shared Planner UI Modules
const paletteSelectionHandlers = new WeakMap();

function setPaletteSelectionHandler(target, handler) {
  if (target && typeof handler === "function") {
    paletteSelectionHandlers.set(target, handler);
  }
}

function getPaletteSelectionHandler(target) {
  return target ? paletteSelectionHandlers.get(target) || null : null;
}

function dispatchPaletteColorSelection(target, colorValue) {
  if (!target) {
    return;
  }

  target.dispatchEvent(
    new CustomEvent("palettecolorselect", {
      bubbles: true,
      detail: {
        color: colorValue,
      },
    }),
  );
}

function getPalette(paletteKey) {
  return colorPalettes[paletteKey] || colorPalettes.tertiary;
}

function getPaletteKeyForColor(colorValue) {
  return (
    colorPaletteOrder.find((paletteKey) =>
      getPalette(paletteKey).colors.some((color) => color.value === colorValue),
    ) || "tertiary"
  );
}

function getPaletteLabelForColor(colorValue) {
  const allColors = [
    ...getPaperPaletteColors(),
    ...getAccentPaletteColors(),
    ...getGrayPaletteColors(),
    ...colorPaletteOrder.flatMap((paletteKey) => getPalette(paletteKey).colors),
    getClearPaletteColor(),
  ];
  const match = allColors.find((color) => color.value === colorValue);

  return match?.label || "Color";
}

function populatePaletteSelect(select, selectedPalette = "tertiary") {
  if (!select) {
    return;
  }

  select.replaceChildren();
  colorPaletteOrder.forEach((paletteKey) => {
    const option = document.createElement("option");

    option.value = paletteKey;
    option.textContent = getPalette(paletteKey).label;
    select.append(option);
  });
  select.value = selectedPalette;
}

function getSwatchInk(color, allowWhite = true) {
  const ink = color.ink || getReadableSwatchInk(color.value);

  return allowWhite && ink === "var(--color-white)"
    ? "var(--color-white)"
    : "var(--color-gray1)";
}

function getPaperPaletteColors() {
  return paperColorPalette.map((paperColor) => ({
    key: paperColor.key,
    label: paperColor.display || paperColor.label,
    value: paperColor.color,
    ink: paperColor.ink || "var(--color-gray1)",
  }));
}

function getAccentPaletteColors() {
  return accentColorPalette.map((accentColor) => ({
    key: accentColor.key,
    label: accentColor.display || accentColor.label,
    value: accentColor.color,
    ink: accentColor.ink || "var(--color-gray1)",
  }));
}

function getClearPaletteColor() {
  return {
    label: "CLR",
    value: "transparent",
    isClear: true,
  };
}

function getGrayPaletteColors() {
  return getPalette("gray").colors;
}

function getColorPanelPopupColors() {
  return ["000", "222", "444", "666", "888", "aaa", "ccc", "eee", "fff"].map(
    (label) => ({
      label,
      value: `#${label}`,
      ink: ["000", "222", "444", "666"].includes(label)
        ? "var(--color-white)"
        : "var(--color-gray1)",
    }),
  );
}

function getColorPanelUtilityColors() {
  return [getClearPaletteColor()].filter(Boolean);
}

function resolveCssColorToken(colorValue) {
  const value = String(colorValue || "").trim();
  const variableMatch = value.match(/^var\((--[^),\s]+)\)$/);

  if (!variableMatch || typeof getComputedStyle !== "function") {
    return value;
  }

  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue(variableMatch[1])
      .trim() || value
  );
}

function getRgbFromColorValue(colorValue) {
  const value = resolveCssColorToken(colorValue);
  const shortHexMatch = value.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  const hexMatch = value.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
  const rgbMatch = value.match(
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i,
  );

  if (shortHexMatch) {
    return shortHexMatch.slice(1).map((channel) => {
      return Number.parseInt(`${channel}${channel}`, 16);
    });
  }

  if (hexMatch) {
    return hexMatch.slice(1).map((channel) => Number.parseInt(channel, 16));
  }

  if (rgbMatch) {
    return rgbMatch.slice(1, 4).map((channel) => clampHexChannel(channel));
  }

  return null;
}

function getRgbFromColorMix(colorValue) {
  const match = String(colorValue || "").match(
    /^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%\s*,\s*(.+?)\s*\)$/i,
  );

  if (!match) {
    return null;
  }

  const firstRgb = getRgbFromColorValue(match[1]);
  const secondRgb = getRgbFromColorValue(match[3]);
  const firstWeight = Math.max(0, Math.min(100, Number(match[2]))) / 100;

  if (!firstRgb || !secondRgb || !Number.isFinite(firstWeight)) {
    return null;
  }

  return firstRgb.map((channel, index) =>
    Math.round(channel * firstWeight + secondRgb[index] * (1 - firstWeight)),
  );
}

function getReadableSwatchInk(colorValue) {
  if (!colorValue || colorValue === "transparent") {
    return "var(--color-gray1)";
  }

  const rgb =
    getRgbFromColorMix(colorValue) || getRgbFromColorValue(colorValue);

  if (!rgb) {
    return "var(--color-gray1)";
  }

  const luminance = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;

  return luminance < 128 ? "var(--color-white)" : "var(--color-gray1)";
}

function hexToAlphaColor(hexValue, alphaValue) {
  const alpha = Math.max(0, Math.min(100, Number(alphaValue) || 0));

  if (alpha === 0) {
    return "transparent";
  }

  if (alpha >= 100) {
    return hexValue;
  }

  const alphaHex = Math.round((alpha / 100) * 255)
    .toString(16)
    .padStart(2, "0");

  return `${hexValue}${alphaHex}`;
}

function clampHexChannel(value, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, Math.min(255, Math.round(numberValue)));
}

function clampAlphaChannel(value, fallback = 100) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, Math.round(numberValue)));
}

function getRgbaColor(red, green, blue, alpha) {
  const alphaDecimal = clampAlphaChannel(alpha) / 100;

  if (alphaDecimal >= 1) {
    return `rgb(${clampHexChannel(red)} ${clampHexChannel(green)} ${clampHexChannel(blue)})`;
  }

  return `rgb(${clampHexChannel(red)} ${clampHexChannel(green)} ${clampHexChannel(blue)} / ${alphaDecimal})`;
}

function getHexColor(red, green, blue) {
  return `#${[red, green, blue]
    .map((value) => clampHexChannel(value).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function normalizeHexInput(value, fallback = "#FFFFFF") {
  const cleanValue = String(value || "")
    .replace(/[^0-9a-f]/gi, "")
    .slice(0, 6);

  if (cleanValue.length === 3) {
    return `#${cleanValue
      .split("")
      .map((character) => character + character)
      .join("")
      .toUpperCase()}`;
  }

  if (cleanValue.length === 6) {
    return `#${cleanValue.toUpperCase()}`;
  }

  return fallback;
}

function getThreeDigitHexSwatchLabel(color = {}) {
  const explicitLabel = String(color.display || color.label || "").trim();

  if (/^[0-9a-f]{3}$/i.test(explicitLabel)) {
    return explicitLabel.toUpperCase();
  }

  const cleanValue = String(color.value || "")
    .trim()
    .replace(/^#/, "");

  if (/^[0-9a-f]{3}$/i.test(cleanValue)) {
    return cleanValue.toUpperCase();
  }

  if (/^[0-9a-f]{6}$/i.test(cleanValue)) {
    const [r1, r2, g1, g2, b1, b2] = cleanValue;

    if (r1 === r2 && g1 === g2 && b1 === b2) {
      return `${r1}${g1}${b1}`.toUpperCase();
    }
  }

  return "";
}

function appendColorSwatches(
  swatches,
  colors,
  selectedColor = "",
  onSelect = null,
  swatchClass = "palette-swatch",
) {
  if (!swatches) {
    return;
  }

  colors.forEach((color) => {
    const swatch = document.createElement(onSelect ? "button" : "span");

    swatch.className = swatchClass;
    swatch.style.setProperty("--swatch", color.value);
    swatch.style.setProperty("--swatch-ink", getSwatchInk(color));
    swatch.textContent = getThreeDigitHexSwatchLabel(color);
    swatch.dataset.colorValue = color.value;
    swatch.classList.toggle("is-clear", Boolean(color.isClear));
    swatch.classList.toggle("is-selected", color.value === selectedColor);

    if (onSelect) {
      swatch.type = "button";
      swatch.setAttribute("aria-label", `${color.label} color`);
      swatch.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect(color.value);
        dispatchPaletteColorSelection(
          activeColorMatrixToggle?.closest(
            ".palette-swatches, .color-panel-swatches",
          ) || swatch.closest(".palette-swatches, .color-panel-swatches"),
          color.value,
        );
        closeControlSection(swatch.closest("[data-control-section]"));
      });
    }

    swatches.append(swatch);
  });
}

function createColorMatrixToggle() {
  const button = document.createElement("button");

  button.className = "color-panel-open-button color-panel-swatch";
  button.type = "button";
  button.dataset.colorPanelMatrixToggle = "";
  button.setAttribute("aria-label", "Open color panel");
  button.setAttribute("aria-expanded", "false");
  button.textContent = "Color";

  return button;
}

function createHexButton(onSelect, swatchClass = "palette-swatch") {
  const button = document.createElement("button");

  button.className = `palette-hex-button ${swatchClass}`;
  button.type = "button";
  button.textContent = "HEX";
  button.setAttribute("aria-label", "Pick custom hex color");
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openHexPopover(button, onSelect);
  });

  return button;
}

function appendColorMatrixToggle(swatches, onSelect = null) {
  if (!swatches) {
    return;
  }

  const button = createColorMatrixToggle();

  setPaletteSelectionHandler(button, onSelect);
  swatches.append(button);
}

function appendPaletteUtilityControls(
  swatches,
  onSelect = null,
  swatchClass = "palette-swatch",
) {
  if (!swatches) {
    return;
  }

  setPaletteSelectionHandler(swatches, onSelect);
  appendColorMatrixToggle(swatches, onSelect);
}

function renderColorPanelOpenControl(
  swatches,
  selectedColor = "",
  onSelect = null,
  paletteMode = "paper",
) {
  if (!swatches) {
    return;
  }

  swatches.replaceChildren();
  swatches.dataset.colorPanelPalette = paletteMode;
  setPaletteSelectionHandler(swatches, onSelect);

  const button = createColorMatrixToggle();

  setPaletteSelectionHandler(button, onSelect);
  button.dataset.colorPanelPalette = paletteMode;
  button.dataset.colorValue = selectedColor || "";
  button.style.setProperty("--swatch", selectedColor || "var(--color-white)");
  button.style.setProperty(
    "--swatch-ink",
    getSwatchInk({
      value: selectedColor || "var(--color-white)",
    }),
  );
  button.textContent = getThreeDigitHexSwatchLabel({
    label: getPaletteLabelForColor(selectedColor),
    value: selectedColor,
  });
  button.classList.toggle("is-clear", selectedColor === "transparent");
  swatches.append(button);
}

function renderPaletteControl(swatches, selectedColor = "", onSelect = null) {
  renderColorPanelOpenControl(swatches, selectedColor, onSelect, "paper");
}

function renderAccentPaletteControl(
  swatches,
  selectedColor = "",
  onSelect = null,
) {
  renderColorPanelOpenControl(swatches, selectedColor, onSelect, "accent");
}

function getHexPopover() {
  let popover = document.querySelector("[data-color-panel-hex]");

  if (popover) {
    return popover;
  }

  popover = document.createElement("div");
  popover.className = "color-panel-hex";
  popover.dataset.colorPanelHex = "";
  popover.hidden = true;
  popover.innerHTML = `
          <div class="color-panel-hex-swatch-cell">
               <span class="color-panel-hex-preview" data-color-panel-hex-preview aria-hidden="true"></span>
          </div>
          <label class="color-panel-hex-hex-cell" data-color-panel-hex-cell tabindex="0">
               <span>HEX</span>
               <input type="text" inputmode="text" maxlength="7" value="#FFFFFF" aria-label="Hex color" data-color-panel-hex-hex tabindex="-1" readonly>
          </label>
          <label data-color-panel-hex-cell tabindex="0">
               <span>R</span>
               <input type="text" inputmode="numeric" maxlength="3" value="255" aria-label="Red" data-color-panel-hex-channel="red" tabindex="-1" readonly>
          </label>
          <label data-color-panel-hex-cell tabindex="0">
               <span>G</span>
               <input type="text" inputmode="numeric" maxlength="3" value="255" aria-label="Green" data-color-panel-hex-channel="green" tabindex="-1" readonly>
          </label>
          <label data-color-panel-hex-cell tabindex="0">
               <span>B</span>
               <input type="text" inputmode="numeric" maxlength="3" value="238" aria-label="Blue" data-color-panel-hex-channel="blue" tabindex="-1" readonly>
          </label>
          <label data-color-panel-hex-cell tabindex="0">
               <span>A</span>
               <input type="text" inputmode="numeric" maxlength="3" value="100" aria-label="Alpha" data-color-panel-hex-channel="alpha" tabindex="-1" readonly>
          </label>
     `;
  document.body.append(popover);

  const cells = Array.from(
    popover.querySelectorAll("[data-color-panel-hex-cell]"),
  );
  const redInput = popover.querySelector(
    "[data-color-panel-hex-channel='red']",
  );
  const greenInput = popover.querySelector(
    "[data-color-panel-hex-channel='green']",
  );
  const blueInput = popover.querySelector(
    "[data-color-panel-hex-channel='blue']",
  );
  const alphaInput = popover.querySelector(
    "[data-color-panel-hex-channel='alpha']",
  );
  const hexInput = popover.querySelector("[data-color-panel-hex-hex]");
  const preview = popover.querySelector("[data-color-panel-hex-preview]");
  const inputs = [hexInput, redInput, greenInput, blueInput, alphaInput];
  const syncHexFromRgb = () => {
    hexInput.value = getHexColor(
      redInput.value,
      greenInput.value,
      blueInput.value,
    );
  };
  const syncRgbFromHex = () => {
    const fallback = getHexColor(
      redInput.value,
      greenInput.value,
      blueInput.value,
    );
    const normalizedHex = normalizeHexInput(hexInput.value, fallback);

    hexInput.value = normalizedHex;
    redInput.value = String(Number.parseInt(normalizedHex.slice(1, 3), 16));
    greenInput.value = String(Number.parseInt(normalizedHex.slice(3, 5), 16));
    blueInput.value = String(Number.parseInt(normalizedHex.slice(5, 7), 16));
  };
  const applyHex = (source = "rgb") => {
    if (source === "hex") {
      syncRgbFromHex();
    }
    redInput.value = String(clampHexChannel(redInput.value));
    greenInput.value = String(clampHexChannel(greenInput.value));
    blueInput.value = String(clampHexChannel(blueInput.value));
    alphaInput.value = String(clampAlphaChannel(alphaInput.value));
    if (source !== "hex") {
      syncHexFromRgb();
    }
    const nextColor = getRgbaColor(
      redInput.value,
      greenInput.value,
      blueInput.value,
      alphaInput.value,
    );

    if (preview) {
      preview.style.setProperty("--swatch", nextColor);
    }
    if (typeof activeHexTarget === "function") {
      activeHexTarget(nextColor);
    }
  };
  const setSelectedCell = (index, shouldFocus = true) => {
    const nextIndex = Math.max(0, Math.min(cells.length - 1, index));

    popover.dataset.activeHexCell = String(nextIndex);
    cells.forEach((cell, cellIndex) => {
      cell.classList.toggle("is-hex-cell-active", cellIndex === nextIndex);
      cell
        .querySelector("input")
        ?.classList.toggle("is-hex-cell-active", cellIndex === nextIndex);
    });
    if (shouldFocus) {
      cells[nextIndex].focus();
    }
  };
  const exitActiveInput = (input) => {
    const cell = input.closest("[data-color-panel-hex-cell]");

    input.readOnly = true;
    input.tabIndex = -1;
    applyHex(input === hexInput ? "hex" : "rgb");
    if (cell) {
      setSelectedCell(cells.indexOf(cell));
    }
  };
  const enterSelectedInput = () => {
    const activeCell = cells[Number(popover.dataset.activeHexCell) || 0];
    const input = activeCell?.querySelector("input");

    if (!input) {
      return false;
    }

    input.readOnly = false;
    input.tabIndex = 0;
    input.focus();
    input.select();
    return true;
  };
  const getActiveInput = () => {
    const activeCell = cells[Number(popover.dataset.activeHexCell) || 0];

    return activeCell?.querySelector("input") || null;
  };
  const stepInputValue = (input, direction) => {
    if (!input || input === hexInput) {
      return;
    }

    const maxValue = input === alphaInput ? 100 : 255;
    const currentValue =
      input === alphaInput
        ? clampAlphaChannel(input.value)
        : clampHexChannel(input.value);
    const snappedValue =
      direction > 0
        ? Math.ceil(currentValue / 5) * 5
        : Math.floor(currentValue / 5) * 5;
    const nextValue =
      snappedValue === currentValue
        ? currentValue + direction * 5
        : snappedValue;

    input.value = String(Math.max(0, Math.min(maxValue, nextValue)));
    applyHex();
  };

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      const cleanValue =
        input === hexInput
          ? `#${input.value
              .replace(/[^0-9a-f]/gi, "")
              .slice(0, 6)
              .toUpperCase()}`
          : input.value.replace(/\D/g, "").slice(0, 3);

      if (input.value !== cleanValue) {
        input.value = cleanValue;
      }
    });
    input.addEventListener("change", () =>
      applyHex(input === hexInput ? "hex" : "rgb"),
    );
    input.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" ||
        event.key.toLowerCase() === "e" ||
        event.key === "Escape" ||
        event.key === "Delete" ||
        event.key.toLowerCase() === "q"
      ) {
        event.preventDefault();
        event.stopPropagation();
        exitActiveInput(input);
      }
    });
  });
  cells.forEach((cell, index) => {
    cell.addEventListener("pointerdown", () => setSelectedCell(index, false));
    cell.addEventListener("focus", () => setSelectedCell(index, false));
  });
  popover.addEventListener("keydown", (event) => {
    const activeElement = document.activeElement;

    if (
      activeElement?.matches?.("[data-color-panel-hex-channel]") &&
      !activeElement.readOnly
    ) {
      return;
    }

    const activeIndex = Number(popover.dataset.activeHexCell) || 0;

    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
      event.preventDefault();
      event.stopPropagation();
      setSelectedCell(activeIndex - 1);
      return;
    }

    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
      event.preventDefault();
      event.stopPropagation();
      setSelectedCell(activeIndex + 1);
      return;
    }

    if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
      event.preventDefault();
      event.stopPropagation();
      stepInputValue(getActiveInput(), 1);
      return;
    }

    if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
      event.preventDefault();
      event.stopPropagation();
      stepInputValue(getActiveInput(), -1);
      return;
    }

    if (event.key === "Enter" || event.key.toLowerCase() === "e") {
      event.preventDefault();
      event.stopPropagation();
      enterSelectedInput();
      return;
    }

    if (
      event.key === "Escape" ||
      event.key === "Delete" ||
      event.key.toLowerCase() === "q"
    ) {
      event.preventDefault();
      event.stopPropagation();
      closeHexPopover();
    }
  });
  popover.setHexSelection = setSelectedCell;
  applyHex();

  return popover;
}

function openHexPopover(button, onSelect) {
  const popover = getHexPopover();
  const rect = button.getBoundingClientRect();

  activeHexTarget = onSelect;
  popover.hidden = false;
  popover.style.left = `${Math.min(rect.left, window.innerWidth - popover.offsetWidth - 8)}px`;
  popover.style.top = `${Math.max(8, rect.top - popover.offsetHeight - 4)}px`;
  popover.setHexSelection?.(0);
}

function closeHexPopover() {
  const popover = document.querySelector("[data-color-panel-hex]");

  if (popover) {
    popover
      .querySelectorAll("[data-color-panel-hex-channel]")
      .forEach((input) => {
        input.readOnly = true;
        input.tabIndex = -1;
      });
    popover.hidden = true;
  }
  activeHexTarget = null;
}

function closeHexPopoverFromOutsidePointer(event) {
  if (
    event.target.closest("[data-color-panel-hex]") ||
    event.target.closest(".palette-hex-button")
  ) {
    return;
  }

  closeHexPopover();
}

function getColorMatrixRows() {
  return [
    ...[90, 80, 70, 60, 50, 40, 30, 20, 10].map((step) => ({
      label: `Tint${step}`,
      mode: "tint",
      step,
    })),
    {
      label: "Tertiary",
      mode: "base",
      step: 0,
    },
    ...[10, 20, 30, 40, 50, 60, 70, 80, 90].map((step) => ({
      label: `Shade${step}`,
      mode: "shade",
      step,
    })),
  ];
}

function getColorMatrixSwatchValue(colorValue, mode, step) {
  if (mode === "tint") {
    return `color-mix(in srgb, ${colorValue} ${100 - step}%, var(--color-white))`;
  }

  if (mode === "shade") {
    return `color-mix(in srgb, ${colorValue} ${100 - step}%, var(--color-black))`;
  }

  return colorValue;
}

function renderColorMatrix() {
  if (!colorMatrixGrid) {
    return;
  }

  const colors = getPalette("tertiary").colors;
  const activeSwatches = activeColorMatrixToggle?.closest(
    ".palette-swatches, .color-panel-swatches",
  );
  const onSelect =
    getPaletteSelectionHandler(activeColorMatrixToggle) ||
    getPaletteSelectionHandler(activeSwatches);
  const selectColor = (nextColor) => {
    if (typeof onSelect === "function") {
      onSelect(nextColor);
    }
    dispatchPaletteColorSelection(activeSwatches, nextColor);
    setColorMatrixOpen(false);
  };

  colorMatrixGrid.replaceChildren();
  getColorMatrixRows().forEach((row) => {
    const label = document.createElement("div");

    label.className = "color-panel-matrix-label";
    label.textContent = row.label;
    colorMatrixGrid.append(label);

    colors.forEach((color) => {
      const swatch = document.createElement("button");
      const swatchValue = getColorMatrixSwatchValue(
        color.value,
        row.mode,
        row.step,
      );
      const swatchLabel =
        row.mode === "base"
          ? getThreeDigitHexSwatchLabel({
              ...color,
              value: swatchValue,
            })
          : "";

      swatch.className = `color-panel-matrix-swatch${row.mode === "base" ? " is-base" : ""}`;
      swatch.style.setProperty("--swatch", swatchValue);
      swatch.style.setProperty(
        "--swatch-ink",
        getSwatchInk(color, row.mode !== "tint"),
      );
      swatch.textContent = swatchLabel;
      swatch.dataset.colorValue = swatchValue;

      swatch.type = "button";
      swatch.setAttribute("aria-label", `${row.label} ${color.label} color`);
      swatch.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        selectColor(swatchValue);
      });

      colorMatrixGrid.append(swatch);
    });
  });
}

function renderColorPanelPopupRow() {
  const row = colorMatrixPopover?.querySelector("[data-color-panel-popup-row]");
  const activeSwatches = activeColorMatrixToggle?.closest(
    ".palette-swatches, .color-panel-swatches",
  );
  const onSelect =
    getPaletteSelectionHandler(activeColorMatrixToggle) ||
    getPaletteSelectionHandler(activeSwatches);
  const selectColor = (nextColor) => {
    if (typeof onSelect === "function") {
      onSelect(nextColor);
    }
    dispatchPaletteColorSelection(activeSwatches, nextColor);
    setColorMatrixOpen(false);
  };

  if (!row) {
    return;
  }

  row.replaceChildren();
  const label = document.createElement("div");

  label.className = "color-panel-matrix-label color-panel-popup-label";
  label.textContent = "Grayscale";
  row.append(label);
  appendColorSwatches(
    row,
    getColorPanelPopupColors(),
    activeColorMatrixToggle?.dataset.colorValue || "",
    selectColor,
    "color-panel-swatch",
  );
  const spacer = document.createElement("span");

  spacer.className = "color-panel-swatch color-panel-swatch-spacer";
  spacer.setAttribute("aria-hidden", "true");
  row.append(spacer);
  appendColorSwatches(
    row,
    getColorPanelUtilityColors(),
    activeColorMatrixToggle?.dataset.colorValue || "",
    selectColor,
    "color-panel-swatch",
  );
  row.append(
    createHexButton((nextColor) => {
      selectColor(nextColor);
    }, "color-panel-swatch"),
  );
}

function syncColorMatrixSwatchSize() {
  if (!colorMatrixPopover) {
    return 0;
  }

  const activeSwatches = activeColorMatrixToggle?.closest(
    ".palette-swatches, .color-panel-swatches",
  );
  const swatch =
    activeSwatches?.querySelector(".palette-swatch, .color-panel-swatch") ||
    palettePreviewSwatches?.querySelector(".palette-swatch");
  const swatchSize = swatch?.getBoundingClientRect().width;

  if (swatchSize) {
    const roundedSwatchSize = Math.round(swatchSize);

    colorMatrixPopover.style.setProperty(
      "--matrix-swatch-size",
      `${roundedSwatchSize}px`,
    );
    return roundedSwatchSize;
  }

  return 0;
}

function positionColorMatrix() {
  syncColorMatrixSwatchSize();
}

function setColorMatrixOpen(isOpen) {
  if (!colorMatrixPopover || !activeColorMatrixToggle) {
    return;
  }

  document
    .querySelectorAll("[data-color-panel-matrix-toggle]")
    .forEach((toggle) => {
      toggle.setAttribute(
        "aria-expanded",
        String(isOpen && toggle === activeColorMatrixToggle),
      );
    });

  if (isOpen) {
    if (colorMatrixPopover.parentElement !== document.body) {
      document.body.append(colorMatrixPopover);
    }
    colorMatrixPopover.hidden = false;
    renderColorPanelPopupRow();
    renderColorMatrix();
    requestAnimationFrame(() => {
      colorMatrixPopover.classList.add("is-open");
    });
  } else {
    colorMatrixPopover.classList.remove("is-open");
    colorMatrixPopover.hidden = true;
  }
}

function updatePalettePreview() {
  if (!palettePreviewSwatches) {
    return;
  }

  renderPaletteControl(
    palettePreviewSwatches,
    plannerConfig.paperColor.color,
    selectPaperPaletteColor,
  );
}

function updateAccentPalettePreview() {
  if (!accentPaletteSwatches) {
    return;
  }

  renderAccentPaletteControl(
    accentPaletteSwatches,
    plannerConfig.accentColor.color,
    selectAccentPaletteColor,
  );
}

function initializePalettePreview() {
  updatePalettePreview();
  updateAccentPalettePreview();
}

function selectPaperPaletteColor(nextColor) {
  const paperColor = paperColorPalette.find(
    (color) => color.color === nextColor,
  );

  if (paperColor && paperColorSelect) {
    paperColorSelect.value = paperColor.key;
    paperColorSelect.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  updateCustomPaperColor(nextColor);
}

function updateCustomPaperColor(nextColor) {
  if (!nextColor || !paperColors.Custom) {
    return;
  }

  paperColors.Custom.color = nextColor;

  if (paperColorSelect) {
    paperColorSelect.value = "Custom";
    paperColorSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }

  updatePalettePreview();
}

function selectAccentPaletteColor(nextColor) {
  const accentColor = accentColorPalette.find(
    (color) => color.color === nextColor,
  );

  if (accentColor && accentColorSelect) {
    accentColorSelect.value = accentColor.key;
    accentColorSelect.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  updateCustomAccentColor(nextColor);
}

function updateCustomAccentColor(nextColor) {
  if (!nextColor || !accentColors.Custom) {
    return;
  }

  accentColors.Custom.color = nextColor;

  if (accentColorSelect) {
    accentColorSelect.value = "Custom";
    accentColorSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }

  updateAccentPalettePreview();
}

function setPaletteControlValue(select, swatches, colorValue) {
  if (!select) {
    return;
  }

  select.dataset.currentColor = colorValue;
  select.value = getPaletteKeyForColor(colorValue);
  const onSelect = getPaletteSelectionHandler(select);

  renderPaletteControl(
    swatches,
    colorValue,
    (nextColor) => {
      if (typeof onSelect === "function") {
        onSelect(nextColor);
      }
    },
    "color-panel-swatch",
  );
}

function initializePaletteColorControl(
  select,
  swatches,
  defaultColor,
  onSelect,
) {
  if (!select || !swatches) {
    return;
  }

  populatePaletteSelect(select, getPaletteKeyForColor(defaultColor));
  select.dataset.currentColor = defaultColor;
  setPaletteSelectionHandler(select, (nextColor) => {
    select.dataset.currentColor = nextColor;
    onSelect(nextColor);
    setPaletteControlValue(select, swatches, nextColor);
  });
  select.addEventListener("change", () => {
    renderPaletteControl(
      swatches,
      select.dataset.currentColor,
      getPaletteSelectionHandler(select),
      "color-panel-swatch",
    );
  });
  renderPaletteControl(
    swatches,
    defaultColor,
    getPaletteSelectionHandler(select),
    "color-panel-swatch",
  );
}

function updateCustomSelectDisplay(select) {
  const dropdown = select.nextElementSibling;

  if (dropdown?.classList.contains("select-stepper")) {
    const selectedOption = select.options[select.selectedIndex];
    const valueDisplay = dropdown.querySelector(".select-stepper-value");
    const previousButton = dropdown.querySelector(
      ".select-stepper-button-prev",
    );
    const nextButton = dropdown.querySelector(".select-stepper-button-next");

    if (valueDisplay) {
      valueDisplay.textContent = selectedOption
        ? selectedOption.textContent
        : "";
    }
    if (previousButton) {
      previousButton.disabled = select.selectedIndex <= 0;
    }
    if (nextButton) {
      nextButton.disabled = select.selectedIndex >= select.options.length - 1;
    }
    return;
  }

  if (dropdown?.classList.contains("button-select")) {
    dropdown.querySelectorAll(".button-select-option").forEach((option) => {
      const isSelected = option.dataset.value === select.value;

      option.classList.toggle("is-selected", isSelected);
      option.setAttribute("aria-pressed", String(isSelected));
    });
    return;
  }

  if (!dropdown || !dropdown.classList.contains("custom-select")) {
    return;
  }

  const summary = dropdown.querySelector("summary");
  const selectedOption = select.options[select.selectedIndex];
  const selectedFontFamily = getCustomSelectOptionFont(select, select.value);

  summary.textContent = selectedOption ? selectedOption.textContent : "";
  summary.style.fontFamily = selectedFontFamily || "";
  dropdown.querySelectorAll(".custom-select-option").forEach((option) => {
    const isSelected = option.dataset.value === select.value;

    option.classList.toggle("is-selected", isSelected);
    option.setAttribute("aria-selected", String(isSelected));
  });
}

function buildButtonSelectOptions(select, buttonGroup) {
  buttonGroup.replaceChildren();
  buttonGroup.style.setProperty(
    "--button-select-count",
    String(Math.max(1, select.options.length)),
  );
  Array.from(select.options).forEach((selectOption) => {
    const option = document.createElement("button");

    option.className = "button-select-option";
    option.type = "button";
    option.dataset.value = selectOption.value;
    option.textContent = selectOption.textContent;
    option.style.fontFamily =
      getCustomSelectOptionFont(select, selectOption.value) || "";
    option.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      select.value = selectOption.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      updateCustomSelectDisplay(select);
    });
    buttonGroup.append(option);
  });
}

function buildCustomSelectOptions(select, dropdown) {
  const optionsBox = dropdown.querySelector(".custom-select-options");

  if (!optionsBox) {
    return;
  }

  optionsBox.replaceChildren();
  Array.from(select.options).forEach((selectOption) => {
    const option = document.createElement("button");

    option.className = "custom-select-option";
    option.type = "button";
    option.dataset.value = selectOption.value;
    option.setAttribute("role", "option");
    option.textContent = selectOption.textContent;
    option.style.fontFamily =
      getCustomSelectOptionFont(select, selectOption.value) || "";
    option.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      rememberSelectPanelScroll(dropdown);
      select.value = selectOption.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      updateCustomSelectDisplay(select);
      dropdown.removeAttribute("open");
      restoreSelectPanelScroll(dropdown);
    });
    optionsBox.append(option);
  });
}

function getCustomSelectOptionFont(select, value) {
  const normalizedValue = value === "noto" ? "noto-sans-mono" : value;

  if (
    select.dataset.textControl !== "font" &&
    !["text-font", "body-text-font", "title-text-font"].includes(
      select.dataset.defaultControl,
    )
  ) {
    return "";
  }

  if (normalizedValue === "dancing") {
    return "var(--font-dancing)";
  }

  if (normalizedValue === "caveat") {
    return "var(--font-caveat)";
  }

  if (normalizedValue === "annotation-mono") {
    return "var(--font-annotation-mono)";
  }

  if (normalizedValue === "noto-sans-mono") {
    return "var(--font-noto-sans-mono)";
  }

  if (normalizedValue === "bungee") {
    return "var(--font-bungee)";
  }

  if (normalizedValue === "bungee-outline") {
    return "var(--font-bungee-outline)";
  }

  if (normalizedValue === "bungee-shade") {
    return "var(--font-bungee-shade)";
  }

  if (normalizedValue === "sofia-sans-ec") {
    return "var(--font-sofia-sans-ec)";
  }

  const handwritingFonts = new Set([
    "miltonian",
    "permanent-marker",
    "rock-salt",
    "sedgwick-ave-display",
  ]);

  if (handwritingFonts.has(normalizedValue)) {
    return `var(--font-${normalizedValue})`;
  }

  if (normalizedValue === "sans") {
    return "Arial, Helvetica, sans-serif";
  }

  if (normalizedValue === "serif") {
    return "Georgia, 'Times New Roman', serif";
  }

  return "var(--font-annotation-mono)";
}

function shouldUseButtonSelect(select) {
  return select.options.length > 0 && select.options.length <= 5;
}

function makeButtonSelect(select) {
  const existingControl = select.nextElementSibling;

  if (existingControl?.classList.contains("button-select")) {
    buildButtonSelectOptions(select, existingControl);
    updateCustomSelectDisplay(select);
    return existingControl;
  }

  if (existingControl?.classList.contains("custom-select")) {
    customSelectDetails = customSelectDetails.filter(
      (details) => details !== existingControl,
    );
    existingControl.remove();
  }

  const buttonGroup = document.createElement("div");

  select.classList.add("native-select");
  buttonGroup.className = "button-select";
  buttonGroup.dataset.buttonSelect =
    select.dataset.setting ||
    select.dataset.styleControl ||
    select.dataset.textControl ||
    select.dataset.widgetControl ||
    select.dataset.defaultControl ||
    "";
  buttonGroup.setAttribute("role", "group");
  buttonGroup.setAttribute(
    "aria-label",
    select.getAttribute("aria-label") || "Select option",
  );
  select.after(buttonGroup);
  buildButtonSelectOptions(select, buttonGroup);
  updateCustomSelectDisplay(select);

  return buttonGroup;
}

function syncCustomSelect(select) {
  if (select.dataset.stepperSelect === "true") {
    updateCustomSelectDisplay(select);
    return;
  }

  const dropdown = select.nextElementSibling;

  if (shouldUseButtonSelect(select)) {
    makeButtonSelect(select);
    return;
  }

  if (dropdown?.classList.contains("button-select")) {
    dropdown.remove();
    makeCustomSelect(select);
    return;
  }

  if (!dropdown || !dropdown.classList.contains("custom-select")) {
    return;
  }

  buildCustomSelectOptions(select, dropdown);
  updateCustomSelectDisplay(select);
}

let controlSectionId = 0;

function getControlSectionButtonUnits(title) {
  const estimatedTextWidth = title.length * 9.6 + 12;

  return Math.max(1, Math.ceil(estimatedTextWidth / 36));
}
