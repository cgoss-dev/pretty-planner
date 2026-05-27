// NOTE: Shared Planner UI Modules
function getPalette(paletteKey) {
     return colorPalettes[paletteKey] || colorPalettes.tertiary;
}

function getPaletteKeyForColor(colorValue) {
     return colorPaletteOrder.find((paletteKey) => getPalette(paletteKey).colors.some((color) => color.value === colorValue)) || "tertiary";
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
     return allowWhite && color.ink === "var(--color-white)" ? "var(--color-white)" : "var(--color-gray1)";
}

function getPaperPaletteColors() {
     return paperColorPalette.map((paperColor) => ({
          key: paperColor.key,
          label: paperColor.display || paperColor.label,
          value: paperColor.color,
          ink: paperColor.ink || "var(--color-gray1)"
     }));
}

function getAccentPaletteColors() {
     return accentColorPalette.map((accentColor) => ({
          key: accentColor.key,
          label: accentColor.display || accentColor.label,
          value: accentColor.color,
          ink: accentColor.ink || "var(--color-gray1)"
     }));
}

function getClearPaletteColor() {
     return {
          label: "CLR",
          value: "transparent",
          isClear: true
     };
}

function getGrayPaletteColors() {
     return getPalette("gray").colors;
}

function hexToAlphaColor(hexValue, alphaValue) {
     const alpha = Math.max(0, Math.min(100, Number(alphaValue) || 0));

     if (alpha === 0) {
          return "transparent";
     }

     if (alpha >= 100) {
          return hexValue;
     }

     const alphaHex = Math.round(alpha / 100 * 255).toString(16).padStart(2, "0");

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
     return `#${[red, green, blue].map((value) => clampHexChannel(value).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function normalizeHexInput(value, fallback = "#FFFFFF") {
     const cleanValue = String(value || "").replace(/[^0-9a-f]/gi, "").slice(0, 6);

     if (cleanValue.length === 3) {
          return `#${cleanValue.split("").map((character) => character + character).join("").toUpperCase()}`;
     }

     if (cleanValue.length === 6) {
          return `#${cleanValue.toUpperCase()}`;
     }

     return fallback;
}

function appendColorSwatches(swatches, colors, selectedColor = "", onSelect = null, swatchClass = "palette-swatch") {
     if (!swatches) {
          return;
     }

     colors.forEach((color) => {
          const swatch = document.createElement(onSelect ? "button" : "span");

          swatch.className = swatchClass;
          swatch.style.setProperty("--swatch", color.value);
          swatch.style.setProperty("--swatch-ink", getSwatchInk(color));
          swatch.textContent = color.label;
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
                    closeControlSection(swatch.closest("[data-control-section]"));
               });
          }

          swatches.append(swatch);
     });
}

function createColorMatrixToggle() {
     const button = document.createElement("button");

     button.className = "palette-matrix-toggle";
     button.type = "button";
     button.dataset.colorMatrixToggle = "";
     button.setAttribute("aria-label", "Show Tertiary matrix");
     button.setAttribute("aria-expanded", "false");
     button.textContent = "⇧";

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

     button.onPaletteColorSelect = onSelect;
     swatches.append(button);
}

function appendPaletteUtilityControls(swatches, onSelect = null, swatchClass = "palette-swatch") {
     if (!swatches) {
          return;
     }

     swatches.onPaletteColorSelect = onSelect;
     swatches.append(createHexButton(onSelect, swatchClass));
     appendColorMatrixToggle(swatches, onSelect);
}

function renderPaletteControl(swatches, selectedColor = "", onSelect = null, swatchClass = "palette-swatch") {
     if (!swatches) {
          return;
     }

     swatches.replaceChildren();
     appendColorSwatches(
          swatches,
          getPaperPaletteColors(),
          selectedColor,
          onSelect,
          swatchClass
     );
     appendColorSwatches(swatches, getGrayPaletteColors(), selectedColor, onSelect, swatchClass);
     appendColorSwatches(swatches, [getClearPaletteColor()], selectedColor, onSelect, swatchClass);
     appendPaletteUtilityControls(swatches, onSelect, swatchClass);
}

function renderAccentPaletteControl(swatches, selectedColor = "", onSelect = null, swatchClass = "palette-swatch") {
     if (!swatches) {
          return;
     }

     swatches.replaceChildren();
     appendColorSwatches(swatches, getAccentPaletteColors(), selectedColor, onSelect, swatchClass);
     appendColorSwatches(swatches, getGrayPaletteColors(), selectedColor, onSelect, swatchClass);
     appendPaletteUtilityControls(swatches, onSelect, swatchClass);
}


function getHexPopover() {
     let popover = document.querySelector("[data-color-panel-hex]");

     if (popover) {
          return popover;
     }

     popover = document.createElement("div");
     popover.className = "color-panel-hex";
     popover.dataset.hexPopover = "";
     popover.hidden = true;
     popover.innerHTML = `
          <div class="color-panel-hex-swatch-cell">
               <span class="color-panel-hex-preview" data-color-panel-hex-preview aria-hidden="true"></span>
          </div>
          <label class="color-panel-hex-hex-cell" data-color-panel-hex-cell tabindex="0">
               <span>HEX</span>
               <input type="text" inputmode="text" maxlength="7" value="#FFFFEE" aria-label="Hex color" data-color-panel-hex-hex tabindex="-1" readonly>
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

     const cells = Array.from(popover.querySelectorAll("[data-color-panel-hex-cell]"));
     const redInput = popover.querySelector("[data-color-panel-hex-channel='red']");
     const greenInput = popover.querySelector("[data-color-panel-hex-channel='green']");
     const blueInput = popover.querySelector("[data-color-panel-hex-channel='blue']");
     const alphaInput = popover.querySelector("[data-color-panel-hex-channel='alpha']");
     const hexInput = popover.querySelector("[data-color-panel-hex-hex]");
     const preview = popover.querySelector("[data-color-panel-hex-preview]");
     const inputs = [hexInput, redInput, greenInput, blueInput, alphaInput];
     const syncHexFromRgb = () => {
          hexInput.value = getHexColor(redInput.value, greenInput.value, blueInput.value);
     };
     const syncRgbFromHex = () => {
          const fallback = getHexColor(redInput.value, greenInput.value, blueInput.value);
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
          const nextColor = getRgbaColor(redInput.value, greenInput.value, blueInput.value, alphaInput.value);

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
               cell.querySelector("input")?.classList.toggle("is-hex-cell-active", cellIndex === nextIndex);
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
          const currentValue = input === alphaInput ? clampAlphaChannel(input.value) : clampHexChannel(input.value);
          const snappedValue = direction > 0
               ? Math.ceil(currentValue / 5) * 5
               : Math.floor(currentValue / 5) * 5;
          const nextValue = snappedValue === currentValue ? currentValue + (direction * 5) : snappedValue;

          input.value = String(Math.max(0, Math.min(maxValue, nextValue)));
          applyHex();
     };

     inputs.forEach((input) => {
          input.addEventListener("input", () => {
               const cleanValue = input === hexInput
                    ? `#${input.value.replace(/[^0-9a-f]/gi, "").slice(0, 6).toUpperCase()}`
                    : input.value.replace(/\D/g, "").slice(0, 3);

               if (input.value !== cleanValue) {
                    input.value = cleanValue;
               }
          });
          input.addEventListener("change", () => applyHex(input === hexInput ? "hex" : "rgb"));
          input.addEventListener("keydown", (event) => {
               if (event.key === "Enter" || event.key.toLowerCase() === "e" || event.key === "Escape" || event.key === "Delete" || event.key.toLowerCase() === "q") {
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

          if (activeElement?.matches?.("[data-color-panel-hex-channel]") && !activeElement.readOnly) {
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

          if (event.key === "Escape" || event.key === "Delete" || event.key.toLowerCase() === "q") {
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
          popover.querySelectorAll("[data-color-panel-hex-channel]").forEach((input) => {
               input.readOnly = true;
               input.tabIndex = -1;
          });
          popover.hidden = true;
     }
     activeHexTarget = null;
}

function closeHexPopoverFromOutsidePointer(event) {
     if (event.target.closest("[data-color-panel-hex]") || event.target.closest(".palette-hex-button")) {
          return;
     }

     closeHexPopover();
}

function getColorMatrixRows() {
     return [
          ...[80, 60, 40, 20].map((step) => ({
               label: `Tint${step}`,
               mode: "tint",
               step
          })),
          {
               label: "Tertiary",
               mode: "base",
               step: 0
          },
          ...[20, 40, 60, 80].map((step) => ({
               label: `Shade${step}`,
               mode: "shade",
               step
          }))
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
     const activeSwatches = activeColorMatrixToggle?.closest(".palette-swatches, .color-panel-swatches");
     const onSelect = activeColorMatrixToggle?.onPaletteColorSelect || activeSwatches?.onPaletteColorSelect;
     const activeSection = activeColorMatrixToggle?.closest("[data-control-section]");

     colorMatrixGrid.replaceChildren();
     getColorMatrixRows().forEach((row) => {
          const label = document.createElement("div");

          label.className = "color-panel-matrix-label";
          label.textContent = row.label;
          colorMatrixGrid.append(label);

          colors.forEach((color) => {
               const swatch = document.createElement(typeof onSelect === "function" ? "button" : "span");
               const swatchValue = getColorMatrixSwatchValue(color.value, row.mode, row.step);

               swatch.className = `color-panel-matrix-swatch${row.mode === "base" ? " is-base" : ""}`;
               swatch.style.setProperty("--swatch", swatchValue);
               swatch.style.setProperty("--swatch-ink", getSwatchInk(color, row.mode !== "tint"));
               swatch.textContent = row.mode === "base" ? color.label : "";
               swatch.dataset.colorValue = swatchValue;

               if (typeof onSelect === "function") {
                    swatch.type = "button";
                    swatch.setAttribute("aria-label", `${row.label} ${color.label} color`);
                    swatch.addEventListener("click", (event) => {
                         event.preventDefault();
                         event.stopPropagation();
                         onSelect(swatchValue);
                         setColorMatrixOpen(false);
                         closeControlSection(activeSection);
                    });
               }

               colorMatrixGrid.append(swatch);
          });
     });
}

function syncColorMatrixSwatchSize() {
     if (!colorMatrixPopover) {
          return 0;
     }

     const activeSwatches = activeColorMatrixToggle?.closest(".palette-swatches, .color-panel-swatches");
     const swatch = activeSwatches?.querySelector(".palette-swatch, .color-panel-swatch")
          || palettePreviewSwatches?.querySelector(".palette-swatch");
     const swatchSize = swatch?.getBoundingClientRect().width;

     if (swatchSize) {
          const roundedSwatchSize = Math.round(swatchSize);

          colorMatrixPopover.style.setProperty("--matrix-swatch-size", `${roundedSwatchSize}px`);
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

     document.querySelectorAll("[data-color-panel-matrix-toggle]").forEach((toggle) => {
          toggle.setAttribute("aria-expanded", String(isOpen && toggle === activeColorMatrixToggle));
          toggle.textContent = "⇧";
     });

     if (isOpen) {
          const body = activeColorMatrixToggle.closest("[data-control-section]")?.querySelector(":scope > [data-control-section-body]");

          if (body && colorMatrixPopover.parentElement !== body) {
               body.append(colorMatrixPopover);
          }
          colorMatrixPopover.hidden = false;
          renderColorMatrix();
          requestAnimationFrame(() => colorMatrixPopover.classList.add("is-open"));
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
          selectPaperPaletteColor
     );
}

function updateAccentPalettePreview() {
     if (!accentPaletteSwatches) {
          return;
     }

     renderAccentPaletteControl(
          accentPaletteSwatches,
          plannerConfig.accentColor.color,
          selectAccentPaletteColor
     );
}

function initializePalettePreview() {
     updatePalettePreview();
     updateAccentPalettePreview();
}

function selectPaperPaletteColor(nextColor) {
     const paperColor = paperColorPalette.find((color) => color.color === nextColor);

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
     const accentColor = accentColorPalette.find((color) => color.color === nextColor);

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
     renderPaletteControl(
          swatches,
          colorValue,
          (nextColor) => {
               if (typeof select.onPaletteColorSelect === "function") {
                    select.onPaletteColorSelect(nextColor);
               }
          },
          "color-panel-swatch"
     );
}

function initializePaletteColorControl(select, swatches, defaultColor, onSelect) {
     if (!select || !swatches) {
          return;
     }

     populatePaletteSelect(select, getPaletteKeyForColor(defaultColor));
     select.dataset.currentColor = defaultColor;
     select.onPaletteColorSelect = (nextColor) => {
          select.dataset.currentColor = nextColor;
          onSelect(nextColor);
          setPaletteControlValue(select, swatches, nextColor);
     };
     select.addEventListener("change", () => {
          renderPaletteControl(
               swatches,
               select.dataset.currentColor,
               select.onPaletteColorSelect,
               "color-panel-swatch"
          );
     });
     renderPaletteControl(swatches, defaultColor, select.onPaletteColorSelect, "color-panel-swatch");
}

function updateCustomSelectDisplay(select) {
     const dropdown = select.nextElementSibling;

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
          option.style.fontFamily = getCustomSelectOptionFont(select, selectOption.value) || "";
          option.addEventListener("click", (event) => {
               event.preventDefault();
               event.stopPropagation();
               select.value = selectOption.value;
               select.dispatchEvent(new Event("change", { bubbles: true }));
               updateCustomSelectDisplay(select);
               dropdown.removeAttribute("open");
          });
          optionsBox.append(option);
     });
}

function getCustomSelectOptionFont(select, value) {
     if (select.dataset.textControl !== "font") {
          return "";
     }

     if (value === "dancing") {
          return "var(--font-dancing)";
     }

     if (value === "caveat") {
          return "var(--font-caveat)";
     }

     if (value === "playwrite") {
          return "var(--font-playwrite)";
     }

     const handwritingFonts = new Set([
          "homemade-apple",
          "miltonian",
          "mr-bedfort",
          "mr-dafoe",
          "mr-de-haviland",
          "mrs-saint-delafield",
          "mrs-sheppards",
          "permanent-marker",
          "reenie-beanie",
          "rock-salt",
          "sedgwick-ave-display"
     ]);

     if (handwritingFonts.has(value)) {
          return `var(--font-${value})`;
     }

     if (value === "sans") {
          return "Arial, Helvetica, sans-serif";
     }

     if (value === "serif") {
          return "Georgia, 'Times New Roman', serif";
     }

     return "var(--font-noto)";
}

function syncCustomSelect(select) {
     const dropdown = select.nextElementSibling;

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

// NOTE: Creates a collapsible control section button and places the provided controls under it.
function createControlSection(title, elements = [], isOpen = false) {
     const section = document.createElement("section");
     const toggle = document.createElement("button");
     const body = document.createElement("div");
     const bodyId = `control-section-${controlSectionId}`;

     controlSectionId += 1;
     section.className = "control-section";
     section.dataset.controlSection = "true";
     section.dataset.controlSectionTitle = title;
     section.classList.toggle("is-open", isOpen);
     toggle.className = "control-section-button";
     toggle.type = "button";
     toggle.dataset.controlSectionToggle = "true";
     toggle.textContent = title;
     toggle.setAttribute("aria-expanded", String(isOpen));
     toggle.setAttribute("aria-controls", bodyId);
     toggle.style.setProperty("--section-button-units", String(getControlSectionButtonUnits(title)));
     body.className = "control-section-body";
     body.dataset.controlSectionBody = "true";
     body.id = bodyId;
     body.hidden = !isOpen;
     elements.forEach((element) => {
          if (element) {
               body.append(element);
          }
     });
     section.append(toggle, body);

     return section;
}

function setControlSectionOpen(section, isOpen) {
     const toggle = section?.querySelector(":scope > [data-control-section-button]");
     const body = section?.querySelector(":scope > [data-control-section-body]");

     if (!section || !toggle || !body) {
          return;
     }

     section.classList.toggle("is-open", isOpen);
     toggle.setAttribute("aria-expanded", String(isOpen));
     body.hidden = !isOpen;
}

// NOTE: Closes a control section and any inline color matrix it contains.
function closeControlSection(section) {
     if (!section) {
          return;
     }

     if (section.contains(colorMatrixPopover)) {
          setColorMatrixOpen(false);
     }
     setControlSectionOpen(section, false);
}

function closeControlSections(root = document) {
     root.querySelectorAll("[data-control-section].is-open").forEach(closeControlSection);
}

// NOTE: Opens one control section and closes its sibling sections in the same panel.
function openControlSection(section) {
     const panel = section?.closest(".control-panel-page, .widget-panel-page");

     if (!section || !panel) {
          return;
     }

     panel.querySelectorAll(":scope > .control-section").forEach((sibling) => {
          setControlSectionOpen(sibling, sibling === section);
     });
}

function toggleControlSection(section) {
     if (section?.classList.contains("is-open")) {
          closeControlSection(section);
          return;
     }

     openControlSection(section);
}

// NOTE: Attaches click behavior to control section buttons and keeps all sections closed by default.
function initializeControlSections(root = document) {
     root.querySelectorAll("[data-control-section]").forEach((section) => {
          const toggle = section.querySelector(":scope > [data-control-section-button]");
          const body = section.querySelector(":scope > [data-control-section-body]");
          const isOpen = section.classList.contains("is-open");

          if (!toggle || !body) {
               return;
          }

          toggle.setAttribute("aria-expanded", String(isOpen));
          body.hidden = !isOpen;
          if (section.dataset.controlSectionReady === "true") {
               return;
          }

          section.dataset.controlSectionReady = "true";
          toggle.addEventListener("click", () => toggleControlSection(section));
     });

     const panels = [];

     if (root.matches?.(".control-panel-page, .widget-panel-page")) {
          panels.push(root);
     }
     panels.push(...root.querySelectorAll(".control-panel-page, .widget-panel-page"));
     panels.forEach((panel) => {
          const sections = Array.from(panel.querySelectorAll(":scope > [data-control-section]"));

          panel.classList.toggle("is-sectioned-panel", sections.length > 0);
          if (sections.length) {
               panel.style.setProperty("--control-section-count", String(sections.length));
          }
     });
}

// NOTE: Converts the Notebook tab's current controls into one-open-at-a-time section buttons.
function initializeNotebookControlSections() {
     const pagePanel = document.querySelector("[data-control-panel-page='page']");

     if (!pagePanel || pagePanel.dataset.controlSectionsWrapped === "true") {
          return;
     }

     const children = Array.from(pagePanel.children);
     const guideField = children.find((child) => child.querySelector?.("[data-guide]"));
     const paperField = children.find((child) => child.querySelector?.("[data-setting='paper']"));
     const deskField = children.find((child) => child.querySelector?.("[data-setting='desk-color']"));
     const paperColorField = children.find((child) => child.querySelector?.("[data-palette-preview-swatches]"));
     const accentColorField = children.find((child) => child.querySelector?.("[data-accent-palette-swatches]"));
     const sections = [
          ["Guides", guideField],
          ["Desk", deskField],
          ["Notebook", paperField],
          ["Paper", paperColorField],
          ["Accent", accentColorField]
     ];
     const anchor = children.find((child) => child.classList?.contains("page-panel-actions")) || null;

     sections.forEach(([title, element]) => {
          if (!element) {
               return;
          }

          pagePanel.insertBefore(createControlSection(title, [element], false), anchor);
     });

     pagePanel.dataset.controlSectionsWrapped = "true";
     initializeControlSections(pagePanel);
}

function getWidgetPanelSectionTitle(element) {
     const directTitle = element.querySelector?.(":scope > .widget-panel-title, :scope > .widget-option-group-title");

     if (directTitle?.textContent.trim()) {
          return directTitle.textContent.trim();
     }

     const nestedTitle = element.querySelector?.(".widget-panel-title, .widget-option-group-title");

     if (nestedTitle?.textContent.trim()) {
          return nestedTitle.textContent.trim();
     }

     const text = Array.from(element.childNodes)
          .filter((node) => node.nodeType === Node.TEXT_NODE)
          .map((node) => node.textContent.trim())
          .find(Boolean);

     return text || "Options";
}

// NOTE: Converts object Appearance/Text/Options panels into section buttons that reveal their controls.
function initializeWidgetPanelPageSections(panel) {
     if (!panel || panel.dataset.controlSectionsWrapped === "true" || panel.dataset.widgetPanelPage === "actions") {
          return;
     }

     const controls = Array.from(panel.children).filter((child) => !child.matches("[data-control-section]"));

     controls.forEach((control) => {
          panel.append(createControlSection(getWidgetPanelSectionTitle(control), [control], false));
     });

     panel.dataset.controlSectionsWrapped = "true";
     initializeControlSections(panel);
}

function getSelectFocusMenu(dropdown) {
     return dropdown.closest(".control-panel, .widget-panel");
}

function getSelectFocusPanel(dropdown) {
     return dropdown.closest(".control-panel-page, .widget-panel-page");
}

function getSelectFocusRow(dropdown) {
     return dropdown.closest(".control-section") || dropdown.closest("label, .control-field, .palette-preview, .widget-panel-row");
}

function animateSelectFocusRow(row, fromRect) {
     if (!row || !fromRect || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          return;
     }

     const toRect = row.getBoundingClientRect();
     const deltaX = fromRect.left - toRect.left;
     const deltaY = fromRect.top - toRect.top;

     if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
          return;
     }

     row.animate(
          [
               {
                    opacity: 0.86,
                    transform: `translate(${deltaX}px, ${deltaY}px)`
               },
               {
                    opacity: 1,
                    transform: "translate(0, 0)"
               }
          ],
          {
               duration: 200,
               easing: "cubic-bezier(0.2, 0.85, 0.25, 1)"
          }
     );
}

function clearSelectFocus(scope = document, shouldAnimate = true) {
     const focusRows = shouldAnimate
          ? Array.from(scope.querySelectorAll(".is-select-focus")).map((row) => ({
               row,
               rect: row.getBoundingClientRect()
          }))
          : [];

     scope.querySelectorAll(".is-select-focused").forEach((element) => element.classList.remove("is-select-focused"));
     scope.querySelectorAll(".is-select-focus").forEach((element) => element.classList.remove("is-select-focus"));
     scope.querySelectorAll(".is-select-focus-group").forEach((element) => element.classList.remove("is-select-focus-group"));
     scope.querySelectorAll(".custom-select").forEach((dropdown) => dropdown.style.removeProperty("--select-focus-options-height"));
     focusRows.forEach(({ row, rect }) => animateSelectFocusRow(row, rect));
}

function closeCustomSelects(scope = document) {
     scope.querySelectorAll(".custom-select[open]").forEach((dropdown) => dropdown.removeAttribute("open"));
}

function updateSelectFocusSpace(dropdown) {
     const menu = getSelectFocusMenu(dropdown);
     const summary = dropdown.querySelector("summary");

     if (!menu || !summary || !dropdown.open) {
          return;
     }

     const menuRect = menu.getBoundingClientRect();
     const summaryRect = summary.getBoundingClientRect();
     const opensUp = Boolean(dropdown.closest(".widget-option-time-group"));
     const availableSpace = opensUp
          ? summaryRect.top - menuRect.top - 12
          : menuRect.bottom - summaryRect.bottom - 12;
     const availableHeight = Math.max(92, Math.floor(availableSpace));

     dropdown.style.setProperty("--select-focus-options-height", `${availableHeight}px`);
}

function setSelectFocus(dropdown) {
     const menu = getSelectFocusMenu(dropdown);
     const panel = getSelectFocusPanel(dropdown);
     const row = getSelectFocusRow(dropdown);
     const group = row ? row.closest(".text-panel-control-row, .widget-option-group, .item-calendar-attributes-grid") : null;

     if (!menu || !panel || !row) {
          return;
     }

     if (menu.classList.contains("widget-panel")) {
          updateSelectFocusSpace(dropdown);
          return;
     }

     const startRect = row.getBoundingClientRect();

     clearSelectFocus(menu, false);
     menu.classList.add("is-select-focused");
     panel.classList.add("is-select-focused");
     row.classList.add("is-select-focus");

     if (group) {
          group.classList.add("is-select-focus-group");
     }

     requestAnimationFrame(() => {
          updateSelectFocusSpace(dropdown);
          animateSelectFocusRow(row, startRect);
     });
}

function makeCustomSelect(select) {
     const dropdown = document.createElement("details");
     const summary = document.createElement("summary");
     const optionsBox = document.createElement("div");

     if (select.nextElementSibling && select.nextElementSibling.classList.contains("custom-select")) {
          return select.nextElementSibling;
     }

     select.classList.add("native-select");
     dropdown.className = "custom-select";
     dropdown.dataset.customSelect = select.dataset.setting || select.dataset.styleControl || select.dataset.textControl || select.dataset.widgetControl || "";
     summary.setAttribute("role", "button");
     optionsBox.className = "custom-select-options";

     dropdown.append(summary, optionsBox);
     select.after(dropdown);
     buildCustomSelectOptions(select, dropdown);
     updateCustomSelectDisplay(select);
     dropdown.addEventListener("toggle", () => {
          if (dropdown.open) {
               customSelectDetails.forEach((details) => {
                    if (details !== dropdown) {
                         details.removeAttribute("open");
                    }
               });
               updateSelectFocusSpace(dropdown);
          } else {
               const menu = getSelectFocusMenu(dropdown);

               if (!menu || !menu.querySelector(".custom-select[open]")) {
                    clearSelectFocus(menu || document);
               }
          }
     });

     if (!customSelectDetails.includes(dropdown)) {
          customSelectDetails.push(dropdown);
     }

     return dropdown;
}

function initializeCustomSelects() {
     settingSelects.forEach(makeCustomSelect);
}

function syncObjectControlsTab(tabName) {
     if (!objectControlsShell) {
          return;
     }

     const controls = objectControlsShell.querySelector(".widget-panel");
     const itemPanelNames = getObjectControlWidgetPanelPageNames(tabName);

     if (controls && itemPanelNames.length) {
          setWidgetPanelVisiblePanels(controls, itemPanelNames);
     }
}

function getObjectControlWidgetPanelPageNames(tabName) {
     return [];
}

function setWidgetPanelVisiblePanels(controls, panelNames) {
     closeCustomSelects(controls);
     clearSelectFocus(controls);
     controls.dataset.activeWidgetPanelTab = panelNames.join("-");

     controls.querySelectorAll("[data-widget-panel-tab]").forEach((tab) => {
          const isActive = panelNames.includes(tab.dataset.widgetPanelTab);

          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
     });
     controls.querySelectorAll("[data-widget-panel-page]").forEach((panel) => {
          panel.hidden = !panelNames.includes(panel.dataset.widgetPanelPage);
     });
}

function isObjectControlTab(tabName) {
     return tabName.startsWith("object-");
}

function selectControlPanelTab(tabName) {
     closeCustomSelects(controlPanel);
     clearSelectFocus(controlPanel);
     closeControlSections(controlPanel);

     controlPanelTabs.forEach((tab) => {
          const isActive = tab.dataset.controlPanelTab === tabName;

          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
     });

     controlPanelPages.forEach((panel) => {
          const isObjectPanel = isObjectControlTab(tabName) && panel.dataset.controlPanelPage === "object";

          panel.hidden = !isObjectPanel && panel.dataset.controlPanelPage !== tabName;
     });
     updateControlPanelFocusState();

     syncObjectControlsTab(tabName);

     const activeTab = controlPanelTabs.find((tab) => tab.dataset.controlPanelTab === tabName);

     if (activeTab) {
          controlPanel.style.setProperty("--active-controls-color", "var(--menu-fill)");
     }

     updateControlPanelSteps(tabName);
     updateObjectControlsState();
}

function getActiveControlPanelTabName() {
     return controlPanelTabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.controlPanelTab || controlPanelTabs[0]?.dataset.controlPanelTab || "";
}

function updateControlPanelSteps(tabName = getActiveControlPanelTabName()) {
     const activeIndex = controlPanelTabs.findIndex((tab) => tab.dataset.controlPanelTab === tabName);

     controlPanelStepButtons.forEach((button) => {
          const step = Number(button.dataset.controlPanelStep) || 0;
          const nextIndex = getNextEnabledControlPanelTabIndex(activeIndex, step);
          const isDisabled = nextIndex === activeIndex;

          if ("disabled" in button) {
               button.disabled = isDisabled;
          }
          button.setAttribute("aria-disabled", String(isDisabled));
     });
}

function getNextEnabledControlPanelTabIndex(activeIndex, step) {
     let nextIndex = activeIndex;

     while (true) {
          const candidateIndex = nextIndex + step;

          if (candidateIndex < 0 || candidateIndex >= controlPanelTabs.length) {
               return activeIndex;
          }

          nextIndex = candidateIndex;
          if (!controlPanelTabs[nextIndex].disabled) {
               return nextIndex;
          }
     }
}

function stepControlPanelTab(step) {
     const activeIndex = controlPanelTabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
     const nextIndex = getNextEnabledControlPanelTabIndex(activeIndex, step);
     const nextTab = controlPanelTabs[nextIndex];

     if (nextIndex === activeIndex || !nextTab || nextTab.disabled) {
          return;
     }

     selectControlPanelTab(nextTab.dataset.controlPanelTab);
     openControlPanel();
}

function updateObjectControlsState() {
     if (!objectControlsShell || !objectControlsEmpty) {
          return;
     }

     const hasSelection = typeof selectedItems !== "undefined" && selectedItems.size > 0 && selectedItem;
     const controls = objectControlsShell.querySelector(".widget-panel");
     const hasControls = Boolean(hasSelection && controls);

     objectControlsShell.classList.toggle("is-inactive", !hasControls);
     objectControlsEmpty.hidden = hasControls;
     controlPanelTabs
          .filter((tab) => isObjectControlTab(tab.dataset.controlPanelTab || ""))
          .forEach((tab) => {
               const itemPanelNames = getObjectControlWidgetPanelPageNames(tab.dataset.controlPanelTab || "");
               const hasItemPanel = itemPanelNames.some((panelName) => Boolean(controls?.querySelector(`[data-widget-panel-page="${panelName}"]`)));
               const isDisabled = !hasControls || !hasItemPanel;

               tab.disabled = isDisabled;
               tab.setAttribute("aria-disabled", String(isDisabled));
          });

     const activeTab = controlPanelTabs.find((tab) => tab.getAttribute("aria-selected") === "true");

     if (activeTab && isObjectControlTab(activeTab.dataset.controlPanelTab || "") && activeTab.disabled) {
          const fallbackObjectTab = controlPanelTabs.find((tab) => isObjectControlTab(tab.dataset.controlPanelTab || "") && !tab.disabled);
          const fallbackTab = fallbackObjectTab || controlPanelTabs.find((tab) => tab.dataset.controlPanelTab === "controls");

          if (fallbackTab) {
               selectControlPanelTab(fallbackTab.dataset.controlPanelTab);
          }
     } else if (activeTab && hasControls && isObjectControlTab(activeTab.dataset.controlPanelTab || "")) {
          syncObjectControlsTab(activeTab.dataset.controlPanelTab);
     }
}

function updateClipboardControls() {
     document.querySelectorAll("[data-clipboard-action='paste']").forEach((button) => {
          button.disabled = !plannerClipboard;
     });
}

function updateControlPanelFocusState() {
     const isOpen = controlPanel.classList.contains("is-open");

     controlPanelPages.forEach((panel) => {
          panel.inert = !isOpen;
          panel.setAttribute("aria-hidden", String(!isOpen || panel.hidden));
     });
}

function openControlPanel() {
     controlPanel.classList.add("is-open");
     plannerDesk.classList.add("has-open-control-panel");
     updateControlPanelFocusState();
     renderKeyHints();
}

function closeControlPanel() {
     closeCustomSelects(controlPanel);
     clearSelectFocus(controlPanel);
     setColorMatrixOpen(false);
     controlPanel.classList.remove("is-open");
     plannerDesk.classList.remove("has-open-control-panel");
     updateControlPanelFocusState();
     renderKeyHints();
}

function isPointerInsideElementBox(event, element) {
     const rect = element.getBoundingClientRect();

     return event.clientX >= rect.left
          && event.clientX <= rect.right
          && event.clientY >= rect.top
          && event.clientY <= rect.bottom;
}

function collapseMenusFromOutsidePointer(event) {
     if (event.target.closest("[data-create-item]")) {
          return;
     }

     if (event.target.closest("[data-color-panel-matrix], [data-color-panel-hex]")) {
          return;
     }

     if (controlPanel.classList.contains("is-open") && !isPointerInsideElementBox(event, controlPanel)) {
          closeControlPanel();
     }
}

function syncControlPanelSnap() {
     delete controlPanel.dataset.width;
     controlPanel.style.width = "";

     const box = getControlPanelBox();
     const bounds = getControlPanelHeightBounds();
     const nextHeight = clamp(box.height, bounds.min, bounds.max);

     setControlPanelBox({
          ...box,
          y: plannerDesk.getBoundingClientRect().height - nextHeight,
          centerX: getControlPanelCenter(box.width),
          height: nextHeight
     });
}

function getControlPanelCenter(width) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const minCenter = width / 2 + 12;
     const maxCenter = deskRect.width - width / 2 - 12;
     const preferredCenter = deskRect.width / 2;

     return clamp(preferredCenter, minCenter, maxCenter);
}

// NOTE: What Happens When Notebook Controls Change
function changePlannerSetting() {
     plannerConfig = buildPlannerConfig();
     applyPlannerConfig();
     notifyTemplateChanged();
}

function syncSettingChoiceInputs(settingName) {
     const select = document.querySelector(`[data-setting='${settingName}']`);

     if (!select) {
          return;
     }

     controlChoiceInputs
          .filter((input) => input.dataset.controlChoice === settingName)
          .forEach((input) => {
               input.checked = input.value === select.value;
          });
}

function syncAllSettingChoiceInputs() {
     ["paper", "desk-color"].forEach(syncSettingChoiceInputs);
}

function changeSettingChoice(input) {
     const settingName = input.dataset.controlChoice;
     const select = document.querySelector(`[data-setting='${settingName}']`);

     if (!select) {
          return;
     }

     if (input.type === "checkbox" && !input.checked) {
          input.checked = true;
          return;
     }

     select.value = input.value;
     syncSettingChoiceInputs(settingName);
     select.dispatchEvent(new Event("change", { bubbles: true }));
}

const Palette = {
     appendColorSwatches,
     closeHexPopover,
     closeHexPopoverFromOutsidePointer,
     createHexButton,
     createColorMatrixToggle,
     getClearColor: getClearPaletteColor,
     getColorKey: getPaletteKeyForColor,
     getGrayColors: getGrayPaletteColors,
     getMatrixRows: getColorMatrixRows,
     getColorMatrixSwatchValue,
     getPalette,
     getPaperColors: getPaperPaletteColors,
     hexToAlphaColor,
     initializeColorControl: initializePaletteColorControl,
     initializePreview: initializePalettePreview,
     openHexPopover,
     positionMatrix: positionColorMatrix,
     renderControl: renderPaletteControl,
     renderMatrix: renderColorMatrix,
     setControlValue: setPaletteControlValue,
     setMatrixOpen: setColorMatrixOpen,
     syncMatrixSwatchSize: syncColorMatrixSwatchSize,
     updateCustomPaperColor,
     updatePreview: updatePalettePreview
};

const Select = {
     buildOptions: buildCustomSelectOptions,
     clearFocus: clearSelectFocus,
     closeAll: closeCustomSelects,
     getFocusMenu: getSelectFocusMenu,
     getFocusPanel: getSelectFocusPanel,
     getFocusRow: getSelectFocusRow,
     initialize: initializeCustomSelects,
     make: makeCustomSelect,
     setFocus: setSelectFocus,
     sync: syncCustomSelect,
     updateDisplay: updateCustomSelectDisplay,
     updateFocusSpace: updateSelectFocusSpace
};

const ControlPanel = {
     changeChoice: changeSettingChoice,
     changePlannerSetting,
     getActiveTabName: getActiveControlPanelTabName,
     selectTab: selectControlPanelTab,
     stepTab: stepControlPanelTab,
     syncAllChoiceInputs: syncAllSettingChoiceInputs,
     syncChoiceInputs: syncSettingChoiceInputs,
     syncObjectControlsTab: syncObjectControlsTab,
     updatePanelSteps: updateControlPanelSteps
};

const ControlPanelSurface = {
     close: closeControlPanel,
     collapseFromOutsidePointer: collapseMenusFromOutsidePointer,
     getCenter: getControlPanelCenter,
     isPointerInsideElementBox,
     open: openControlPanel,
     syncSnap: syncControlPanelSnap,
     updateObjectControlsState
};

const Clipboard = {
     updateControls: updateClipboardControls
};

// These module slots are intentionally small for now. As widget creation moves out
// of widgets.js, these become the shared homes for text, widget, and pressed-state UI.
const TextInput = {};
const WidgetStyle = {};
const Selection = {};

window.PlannerUI = {
     Clipboard,
     Palette,
     Select,
     Selection,
     ControlPanel,
     ControlPanelSurface,
     TextInput,
     WidgetStyle
};
