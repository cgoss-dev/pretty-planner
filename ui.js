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
               });
          }

          swatches.append(swatch);
     });
}

function createTertiaryMatrixToggle() {
     const button = document.createElement("button");

     button.className = "palette-matrix-toggle";
     button.type = "button";
     button.dataset.tertiaryMatrixToggle = "";
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

function appendTertiaryMatrixToggle(swatches, onSelect = null) {
     if (!swatches) {
          return;
     }

     const button = createTertiaryMatrixToggle();

     button.onPaletteColorSelect = onSelect;
     swatches.append(button);
}

function appendPaletteUtilityControls(swatches, onSelect = null, swatchClass = "palette-swatch") {
     if (!swatches) {
          return;
     }

     swatches.onPaletteColorSelect = onSelect;
     swatches.append(createHexButton(onSelect, swatchClass));
     appendTertiaryMatrixToggle(swatches, onSelect);
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
     let popover = document.querySelector("[data-hex-popover]");

     if (popover) {
          return popover;
     }

     popover = document.createElement("div");
     popover.className = "hex-popover";
     popover.dataset.hexPopover = "";
     popover.hidden = true;
     popover.innerHTML = `
          <div class="hex-popover-swatch-cell">
               <span class="hex-popover-preview" data-hex-popover-preview aria-hidden="true"></span>
          </div>
          <label data-hex-popover-cell tabindex="0">
               <span>R</span>
               <input type="text" inputmode="numeric" maxlength="3" value="255" aria-label="Red" data-hex-popover-channel="red" tabindex="-1" readonly>
          </label>
          <label data-hex-popover-cell tabindex="0">
               <span>G</span>
               <input type="text" inputmode="numeric" maxlength="3" value="255" aria-label="Green" data-hex-popover-channel="green" tabindex="-1" readonly>
          </label>
          <label data-hex-popover-cell tabindex="0">
               <span>B</span>
               <input type="text" inputmode="numeric" maxlength="3" value="238" aria-label="Blue" data-hex-popover-channel="blue" tabindex="-1" readonly>
          </label>
          <label data-hex-popover-cell tabindex="0">
               <span>A</span>
               <input type="text" inputmode="numeric" maxlength="3" value="100" aria-label="Alpha" data-hex-popover-channel="alpha" tabindex="-1" readonly>
          </label>
     `;
     document.body.append(popover);

     const cells = Array.from(popover.querySelectorAll("[data-hex-popover-cell]"));
     const redInput = popover.querySelector("[data-hex-popover-channel='red']");
     const greenInput = popover.querySelector("[data-hex-popover-channel='green']");
     const blueInput = popover.querySelector("[data-hex-popover-channel='blue']");
     const alphaInput = popover.querySelector("[data-hex-popover-channel='alpha']");
     const preview = popover.querySelector("[data-hex-popover-preview]");
     const inputs = [redInput, greenInput, blueInput, alphaInput];
     const applyHex = () => {
          redInput.value = String(clampHexChannel(redInput.value));
          greenInput.value = String(clampHexChannel(greenInput.value));
          blueInput.value = String(clampHexChannel(blueInput.value));
          alphaInput.value = String(clampAlphaChannel(alphaInput.value));
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
          const cell = input.closest("[data-hex-popover-cell]");

          input.readOnly = true;
          input.tabIndex = -1;
          applyHex();
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
          if (!input) {
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
               const cleanValue = input.value.replace(/\D/g, "").slice(0, 3);

               if (input.value !== cleanValue) {
                    input.value = cleanValue;
               }
          });
          input.addEventListener("change", applyHex);
          input.addEventListener("keydown", (event) => {
               if (event.key === "Enter" || event.key.toLowerCase() === "e" || event.key === "Escape" || event.key.toLowerCase() === "q") {
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

          if (activeElement?.matches?.("[data-hex-popover-channel]") && !activeElement.readOnly) {
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

          if (event.key === "Escape" || event.key.toLowerCase() === "q") {
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
     const popover = document.querySelector("[data-hex-popover]");

     if (popover) {
          popover.querySelectorAll("[data-hex-popover-channel]").forEach((input) => {
               input.readOnly = true;
               input.tabIndex = -1;
          });
          popover.hidden = true;
     }
     activeHexTarget = null;
}

function closeHexPopoverFromOutsidePointer(event) {
     if (event.target.closest("[data-hex-popover]") || event.target.closest(".palette-hex-button")) {
          return;
     }

     closeHexPopover();
}

function getTertiaryMatrixRows() {
     return [
          ...[70, 30].map((step) => ({
               label: `Tint${step}`,
               mode: "tint",
               step
          })),
          {
               label: "Tertiary",
               mode: "base",
               step: 0
          },
          ...[30, 70].map((step) => ({
               label: `Shade${step}`,
               mode: "shade",
               step
          }))
     ];
}

function getMatrixSwatchValue(colorValue, mode, step) {
     if (mode === "tint") {
          return `color-mix(in srgb, ${colorValue} ${100 - step}%, var(--color-white))`;
     }

     if (mode === "shade") {
          return `color-mix(in srgb, ${colorValue} ${100 - step}%, var(--color-black))`;
     }

     return colorValue;
}

function renderTertiaryMatrix() {
     if (!tertiaryMatrixGrid) {
          return;
     }

     const colors = getPalette("tertiary").colors;
     const activeSwatches = activeTertiaryMatrixToggle?.closest(".palette-swatches, .item-color-swatches");
     const onSelect = activeTertiaryMatrixToggle?.onPaletteColorSelect || activeSwatches?.onPaletteColorSelect;

     tertiaryMatrixGrid.replaceChildren();
     getTertiaryMatrixRows().forEach((row) => {
          const label = document.createElement("div");

          label.className = "tertiary-matrix-label";
          label.textContent = row.label;
          tertiaryMatrixGrid.append(label);

          colors.forEach((color) => {
               const swatch = document.createElement(typeof onSelect === "function" ? "button" : "span");
               const swatchValue = getMatrixSwatchValue(color.value, row.mode, row.step);

               swatch.className = `tertiary-matrix-swatch${row.mode === "base" ? " is-base" : ""}`;
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
                         setTertiaryMatrixOpen(false);
                    });
               }

               tertiaryMatrixGrid.append(swatch);
          });
     });
}

function syncTertiaryMatrixSwatchSize() {
     if (!tertiaryMatrixPopover) {
          return 0;
     }

     const activeSwatches = activeTertiaryMatrixToggle?.closest(".palette-swatches, .item-color-swatches");
     const swatch = activeSwatches?.querySelector(".palette-swatch, .item-color-swatch")
          || palettePreviewSwatches?.querySelector(".palette-swatch");
     const swatchSize = swatch?.getBoundingClientRect().width;

     if (swatchSize) {
          const roundedSwatchSize = Math.round(swatchSize);

          tertiaryMatrixPopover.style.setProperty("--matrix-swatch-size", `${roundedSwatchSize}px`);
          return roundedSwatchSize;
     }

     return 0;
}

function positionTertiaryMatrix() {
     if (!tertiaryMatrixPopover || !activeTertiaryMatrixToggle || tertiaryMatrixPopover.hidden) {
          return;
     }

     syncTertiaryMatrixSwatchSize();

     const settingsRect = plannerSettings?.getBoundingClientRect();
     const popoverRect = tertiaryMatrixPopover.getBoundingClientRect();
     const toggleRect = activeTertiaryMatrixToggle.getBoundingClientRect();
     const controlsRect = activeTertiaryMatrixToggle.closest(".item-controls")?.getBoundingClientRect();
     const anchorRect = controlsRect || settingsRect;
     const panelLeft = Math.max(8, anchorRect?.left || settingsRect?.left || 8);
     const panelRight = Math.min(window.innerWidth - 8, anchorRect?.right || settingsRect?.right || window.innerWidth - 8);
     const panelTop = Math.max(8, anchorRect?.top || settingsRect?.top || 8);
     const panelBottom = Math.min(window.innerHeight - 8, anchorRect?.bottom || settingsRect?.bottom || window.innerHeight - 8);
     const availableWidth = Math.max(180, panelRight - panelLeft);
     const left = clamp(toggleRect.left, panelLeft, Math.max(panelLeft, panelRight - popoverRect.width));
     const top = Math.min(
          Math.max(panelTop, toggleRect.top - popoverRect.height - 8),
          Math.max(panelTop, panelBottom - popoverRect.height)
     );

     tertiaryMatrixPopover.style.left = `${left}px`;
     tertiaryMatrixPopover.style.top = `${top}px`;
     tertiaryMatrixPopover.style.maxWidth = `${Math.round(availableWidth)}px`;
}

function setTertiaryMatrixOpen(isOpen) {
     if (!tertiaryMatrixPopover || !activeTertiaryMatrixToggle) {
          return;
     }

     document.querySelectorAll("[data-tertiary-matrix-toggle]").forEach((toggle) => {
          toggle.setAttribute("aria-expanded", String(isOpen && toggle === activeTertiaryMatrixToggle));
          toggle.textContent = "⇧";
     });

     if (isOpen) {
          tertiaryMatrixPopover.hidden = false;
          renderTertiaryMatrix();
          positionTertiaryMatrix();
          requestAnimationFrame(() => tertiaryMatrixPopover.classList.add("is-open"));
     } else {
          tertiaryMatrixPopover.classList.remove("is-open");
          window.setTimeout(() => {
               if (!activeTertiaryMatrixToggle || activeTertiaryMatrixToggle.getAttribute("aria-expanded") !== "true") {
                    tertiaryMatrixPopover.hidden = true;
               }
          }, 150);
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
          "item-color-swatch"
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
               "item-color-swatch"
          );
     });
     renderPaletteControl(swatches, defaultColor, select.onPaletteColorSelect, "item-color-swatch");
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

function getSelectFocusMenu(dropdown) {
     return dropdown.closest(".planner-settings, .item-controls");
}

function getSelectFocusPanel(dropdown) {
     return dropdown.closest(".settings-panel, .item-control-panel");
}

function getSelectFocusRow(dropdown) {
     return dropdown.closest("label, .setting-field, .palette-preview, .item-control-row");
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
     const opensUp = Boolean(dropdown.closest(".item-widget-time-group"));
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
     const group = row ? row.closest(".item-text-control-row, .item-widget-group, .item-calendar-attributes-grid") : null;

     if (!menu || !panel || !row) {
          return;
     }

     if (menu.classList.contains("item-controls")) {
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

function syncObjectControlsSettingsTab(tabName) {
     if (!objectControlsShell) {
          return;
     }

     const controls = objectControlsShell.querySelector(".item-controls");
     const itemTabName = getObjectSettingsItemPanelName(tabName);

     if (controls && itemTabName && typeof setItemControlsTab === "function") {
          setItemControlsTab(controls, itemTabName);
     }
}

function getObjectSettingsItemPanelName(tabName) {
     return {
          "object-style": "style",
          "object-text": "text",
          "object-widget": "widget"
     }[tabName] || "";
}

function isObjectSettingsTab(tabName) {
     return tabName.startsWith("object-");
}

function selectSettingsTab(tabName) {
     closeCustomSelects(plannerSettings);
     clearSelectFocus(plannerSettings);

     settingsTabs.forEach((tab) => {
          const isActive = tab.dataset.settingsTab === tabName;

          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
     });

     settingsPanels.forEach((panel) => {
          const isObjectPanel = isObjectSettingsTab(tabName) && panel.dataset.settingsPanel === "object";

          panel.hidden = !isObjectPanel && panel.dataset.settingsPanel !== tabName;
     });
     updateSidebarPanelFocusState();

     syncObjectControlsSettingsTab(tabName);

     const activeTab = settingsTabs.find((tab) => tab.dataset.settingsTab === tabName);

     if (activeTab) {
          plannerSettings.style.setProperty("--active-settings-color", "var(--menu-fill)");
     }

     updateSettingsPanelSteps(tabName);
     updateObjectControlsState();
}

function getActiveSettingsTabName() {
     return settingsTabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.settingsTab || settingsTabs[0]?.dataset.settingsTab || "";
}

function updateSettingsPanelSteps(tabName = getActiveSettingsTabName()) {
     const activeIndex = settingsTabs.findIndex((tab) => tab.dataset.settingsTab === tabName);

     settingsStepButtons.forEach((button) => {
          const step = Number(button.dataset.settingsStep) || 0;
          const nextIndex = getNextEnabledSettingsTabIndex(activeIndex, step);
          const isDisabled = nextIndex === activeIndex;

          if ("disabled" in button) {
               button.disabled = isDisabled;
          }
          button.setAttribute("aria-disabled", String(isDisabled));
     });
}

function getNextEnabledSettingsTabIndex(activeIndex, step) {
     let nextIndex = activeIndex;

     while (true) {
          const candidateIndex = nextIndex + step;

          if (candidateIndex < 0 || candidateIndex >= settingsTabs.length) {
               return activeIndex;
          }

          nextIndex = candidateIndex;
          if (!settingsTabs[nextIndex].disabled) {
               return nextIndex;
          }
     }
}

function stepSettingsTab(step) {
     const activeIndex = settingsTabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
     const nextIndex = getNextEnabledSettingsTabIndex(activeIndex, step);
     const nextTab = settingsTabs[nextIndex];

     if (nextIndex === activeIndex || !nextTab || nextTab.disabled) {
          return;
     }

     selectSettingsTab(nextTab.dataset.settingsTab);
     openSidebar();
}

function updateObjectControlsState() {
     if (!objectControlsShell || !objectControlsEmpty) {
          return;
     }

     const hasSelection = typeof selectedItems !== "undefined" && selectedItems.size > 0 && selectedItem;
     const controls = objectControlsShell.querySelector(".item-controls");
     const hasControls = Boolean(hasSelection && controls);

     objectControlsShell.classList.toggle("is-inactive", !hasControls);
     objectControlsEmpty.hidden = hasControls;
     settingsTabs
          .filter((tab) => isObjectSettingsTab(tab.dataset.settingsTab || ""))
          .forEach((tab) => {
               const itemPanelName = getObjectSettingsItemPanelName(tab.dataset.settingsTab || "");
               const hasItemPanel = Boolean(controls?.querySelector(`[data-item-control-panel="${itemPanelName}"]`));
               const isDisabled = !hasControls || !hasItemPanel;

               tab.disabled = isDisabled;
               tab.setAttribute("aria-disabled", String(isDisabled));
          });

     const activeTab = settingsTabs.find((tab) => tab.getAttribute("aria-selected") === "true");

     if (activeTab && isObjectSettingsTab(activeTab.dataset.settingsTab || "") && activeTab.disabled) {
          const fallbackObjectTab = settingsTabs.find((tab) => isObjectSettingsTab(tab.dataset.settingsTab || "") && !tab.disabled);
          const fallbackTab = fallbackObjectTab || settingsTabs.find((tab) => tab.dataset.settingsTab === "controls");

          if (fallbackTab) {
               selectSettingsTab(fallbackTab.dataset.settingsTab);
          }
     }
}

function updateClipboardControls() {
     document.querySelectorAll("[data-clipboard-action='paste']").forEach((button) => {
          button.disabled = !plannerClipboard;
     });
}

function updateSidebarPanelFocusState() {
     const isOpen = plannerSettings.classList.contains("is-open");

     settingsPanels.forEach((panel) => {
          panel.inert = !isOpen;
          panel.setAttribute("aria-hidden", String(!isOpen || panel.hidden));
     });
}

function openSidebar() {
     plannerSettings.classList.add("is-open");
     plannerDesk.classList.add("has-open-main-menu");
     updateSidebarPanelFocusState();
     renderKeyHints();
}

function closeSidebar() {
     closeCustomSelects(plannerSettings);
     clearSelectFocus(plannerSettings);
     setTertiaryMatrixOpen(false);
     plannerSettings.classList.remove("is-open");
     plannerDesk.classList.remove("has-open-main-menu");
     updateSidebarPanelFocusState();
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

     if (plannerSettings.classList.contains("is-open") && !isPointerInsideElementBox(event, plannerSettings)) {
          closeSidebar();
     }
}

function syncSidebarSnap() {
     delete plannerSettings.dataset.width;
     plannerSettings.style.width = "";

     const box = getSidebarBox();
     const bounds = getSidebarHeightBounds();
     const nextHeight = clamp(box.height, bounds.min, bounds.max);

     setSidebarBox({
          ...box,
          y: plannerDesk.getBoundingClientRect().height - nextHeight,
          centerX: getSidebarCenter(box.width),
          height: nextHeight
     });
}

function getSidebarCenter(width) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const minCenter = width / 2 + 12;
     const maxCenter = deskRect.width - width / 2 - 12;
     const preferredCenter = deskRect.width / 2;

     return clamp(preferredCenter, minCenter, maxCenter);
}

// NOTE: What Happens When Page Settings Change
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

     settingChoiceInputs
          .filter((input) => input.dataset.settingChoice === settingName)
          .forEach((input) => {
               input.checked = input.value === select.value;
          });
}

function syncAllSettingChoiceInputs() {
     ["paper", "desk-color"].forEach(syncSettingChoiceInputs);
}

function changeSettingChoice(input) {
     const settingName = input.dataset.settingChoice;
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
     createTertiaryMatrixToggle,
     getClearColor: getClearPaletteColor,
     getColorKey: getPaletteKeyForColor,
     getGrayColors: getGrayPaletteColors,
     getMatrixRows: getTertiaryMatrixRows,
     getMatrixSwatchValue,
     getPalette,
     getPaperColors: getPaperPaletteColors,
     hexToAlphaColor,
     initializeColorControl: initializePaletteColorControl,
     initializePreview: initializePalettePreview,
     openHexPopover,
     positionMatrix: positionTertiaryMatrix,
     renderControl: renderPaletteControl,
     renderMatrix: renderTertiaryMatrix,
     setControlValue: setPaletteControlValue,
     setMatrixOpen: setTertiaryMatrixOpen,
     syncMatrixSwatchSize: syncTertiaryMatrixSwatchSize,
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

const Settings = {
     changeChoice: changeSettingChoice,
     changePlannerSetting,
     getActiveTabName: getActiveSettingsTabName,
     selectTab: selectSettingsTab,
     stepTab: stepSettingsTab,
     syncAllChoiceInputs: syncAllSettingChoiceInputs,
     syncChoiceInputs: syncSettingChoiceInputs,
     syncObjectControlsTab: syncObjectControlsSettingsTab,
     updatePanelSteps: updateSettingsPanelSteps
};

const Sidebar = {
     close: closeSidebar,
     collapseFromOutsidePointer: collapseMenusFromOutsidePointer,
     getCenter: getSidebarCenter,
     isPointerInsideElementBox,
     open: openSidebar,
     syncSnap: syncSidebarSnap,
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
     Settings,
     Sidebar,
     TextInput,
     WidgetStyle
};
