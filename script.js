// NOTE: One Place For The Main Planner Knobs
(function () {
     const initialNotebookPageCount = 10;
     const perpetualCalendarLeftColumnGridUnits = 2;
     const perpetualCalendarRightColumnMinGridUnits = 8;
     const rootControls = {
          app: {
               singlePageViewportMaxWidth: 1000,
               notebookViewportHeightReserve: 0,
               notebookViewportWidth: 132,
               notebookMaxWidth: 1220,
               resizeEdgeSize: 16,
               moveStartThreshold: 5,
               pageStickDepth: 2,
               inchToCentimeters: 2.54
          },
          storage: {
               templateSchemaVersion: 1,
               plannerStorageKey: "perfectPlanner:v1",
               plannerStateSchemaVersion: 1
          },
          notebook: {
               minPageCount: 10,
               maxPageCount: 1000,
               initialPageCount: initialNotebookPageCount,
               initialSpreadCount: Math.ceil(initialNotebookPageCount / 2)
          },
          screenReferencePaper: {
               unit: "in",
               width: 8.5,
               height: 11
          },
          items: {
               stickyGridUnits: 12,
               tocLeftColumnGridUnits: 2,
               tocRightColumnMinGridUnits: 8,
               perpetualCalendarMaxDayRows: 31,
               perpetualCalendarHeaderRows: 1,
               perpetualCalendarLeftColumnGridUnits,
               perpetualCalendarRightColumnMinGridUnits,
               itemGridUnits: {
                    sticky: {
                         width: 12,
                         height: 12
                    },
                    "page-title": {
                         width: 18,
                         height: 3
                    },
                    toc: {
                         width: 18,
                         height: 18
                    },
                    "mini-month": {
                         width: 8,
                         height: 8
                    },
                    "full-month": {
                         width: 14,
                         height: 10
                    },
                    "mini-year": {
                         width: 14,
                         height: 10
                    },
                    "perpetual-calendar": {
                         width: perpetualCalendarLeftColumnGridUnits + perpetualCalendarRightColumnMinGridUnits,
                         height: 32
                    },
                    "weekly-vertical": {
                         width: 14,
                         height: 14
                    }
               }
          },
          calendar: {
               monthNames: [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December"
               ],
               yearRange: {
                    start: 2025,
                    end: 2035
               }
          },
          view: {
               zoomLevels: [
                    {
                         label: "100%",
                         value: 1
                    },
                    {
                         label: "150%",
                         value: 1.5
                    },
                    {
                         label: "200%",
                         value: 2
                    }
               ],
               focusPoints: ["left", "right"],
               verticalFocusPoints: ["top", "mid", "bottom"]
          },
          paper: {
               sizes: {
                    "letter": {
                         label: "Letter",
                         unit: "in",
                         width: 8.5,
                         height: 11
                    },
                    "half-letter": {
                         label: "Half Letter",
                         unit: "in",
                         width: 5.5,
                         height: 8.5
                    },
                    "a4": {
                         label: "A4",
                         unit: "cm",
                         width: 21,
                         height: 29.7
                    },
                    "a5": {
                         label: "A5",
                         unit: "cm",
                         width: 14.8,
                         height: 21
                    }
               },
               viewScales: {
                    "letter": 1,
                    "half-letter": 1.28,
                    "a4": 0.92,
                    "a5": 1.28
               },
               gridSizes: {
                    "quarter-inch": {
                         label: "1/4 inch",
                         unit: "in",
                         size: 0.25
                    },
                    "half-centimeter": {
                         label: "1/2 cm",
                         unit: "cm",
                         size: 0.5
                    }
               },
               colorPalette: [
                    {
                         key: "Offwhite",
                         label: "Offwhite",
                         display: "FFE",
                         color: "var(--paper-offwhite)"
                    },
                    {
                         key: "Cream",
                         label: "Cream",
                         display: "EDB",
                         color: "var(--paper-cream)"
                    },
                    {
                         key: "Linen",
                         label: "Linen",
                         display: "DCA",
                         color: "var(--paper-linen)"
                    }
               ]
          },
          colors: {
               palettes: {
                    "gray": {
                         label: "Gray",
                         colors: [
                              { label: "FFF", value: "var(--color-white)" },
                              { label: "CCC", value: "var(--color-gray4)" },
                              { label: "999", value: "var(--color-gray3)" },
                              { label: "666", value: "var(--color-gray2)", ink: "var(--color-white)" },
                              { label: "333", value: "var(--color-gray1)", ink: "var(--color-white)" },
                              { label: "000", value: "var(--color-black)", ink: "var(--color-white)" }
                         ]
                    },
                    "tertiary": {
                         label: "Tertiary",
                         colors: [
                              { label: "F00", value: "var(--tertiary-01)", ink: "var(--color-white)" },
                              { label: "F40", value: "var(--tertiary-02)", ink: "var(--color-white)" },
                              { label: "F80", value: "var(--tertiary-03)" },
                              { label: "FC0", value: "var(--tertiary-04)" },
                              { label: "FF0", value: "var(--tertiary-05)" },
                              { label: "8F0", value: "var(--tertiary-06)" },
                              { label: "0F0", value: "var(--tertiary-07)" },
                              { label: "08F", value: "var(--tertiary-08)", ink: "var(--color-white)" },
                              { label: "00F", value: "var(--tertiary-09)", ink: "var(--color-white)" },
                              { label: "40F", value: "var(--tertiary-10)", ink: "var(--color-white)" },
                              { label: "80F", value: "var(--tertiary-11)", ink: "var(--color-white)" },
                              { label: "F0F", value: "var(--tertiary-12)" }
                         ]
                    }
               },
               paletteOrder: ["gray", "tertiary"],
               tertiaryMatrixSteps: [90, 70, 50, 30, 10],
               deskColors: {
                    "pink": {
                         label: "Pink",
                         color: "var(--tertiary-03)"
                    },
                    "gray": {
                         label: "Gray",
                         color: "var(--color-gray3)"
                    },
                    "black": {
                         label: "Black",
                         color: "var(--color-black)"
                    },
                    "white": {
                         label: "White",
                         color: "#f1ebef"
                    },
                    "wood-white": {
                         label: "White Wood",
                         color: "#edece8",
                         image: "url('images/desk/desk-wood-white.png')",
                         size: "cover"
                    },
                    "wood-brown": {
                         label: "Brown Wood",
                         color: "#8d6243",
                         image: "url('images/desk/desk-wood-brown.png')",
                         size: "cover"
                    }
               }
          },
          guides: {
               labels: {
                    halves: "1/2",
                    thirds: "1/3",
                    fourths: "1/4"
               },
               order: ["halves", "thirds", "fourths"]
          },
          text: {
               lineHeightCellOptions: ["1", "1.5", "2", "2.5", "3"]
          },
          pageNumbers: {
               badge: {
                    sizeMultiplier: 1.7,
                    minSize: "22px",
                    xOffsetMultiplier: 0.75,
                    xOffsetMin: "10px",
                    yOffsetMultiplier: 0.55,
                    yOffsetMin: "8px"
               },
               layering: {
                    "--page-number-z": "4",
                    "--page-behind-number-z": "4",
                    "--page-corner-fold-number-z": "3"
               }
          },
          pageCornerFlip: {
               hitAreaGridCells: 2,
               animation: {
                    classResetDelayMs: 760,
                    spreadSyncDelayMs: 380
               },
               layering: {
                    "--page-corner-fold-z": "4",
                    "--page-corner-fold-bottom-z": "0",
                    "--page-corner-fold-top-z": "1",
                    "--page-corner-fold-border-z": "2"
               },
               debugColors: {
                    "--page-corner-fold-bottom-fill": "rgba(65, 105, 225, 0.45)",
                    "--page-corner-fold-top-fill": "rgba(255, 99, 71, 0.62)",
                    "--page-corner-fold-border-color": "#00a86b",
                    "--page-corner-fold-number-fill": "#fff176",
                    "--page-corner-fold-bottom-number-fill": "#8fd3ff",
                    "--page-corner-fold-number-color": "#111"
               }
          }
     };

     function setRootProperties(properties, root = document.documentElement) {
          Object.entries(properties).forEach(([name, value]) => {
               root.style.setProperty(name, value);
          });
     }

     function getStaticRootProperties() {
          return {
               ...rootControls.pageNumbers.layering,
               ...rootControls.pageCornerFlip.layering,
               ...rootControls.pageCornerFlip.debugColors
          };
     }

     function getPageBadgeRootProperties({
          pageSpreadWidth,
          pageScreenHeightRatio,
          gridColumns,
          gridRows
     }) {
          const badge = rootControls.pageNumbers.badge;

          return {
               "--page-grid-cell-width": `calc(var(--notebook-width) * ${pageSpreadWidth / 100} / ${gridColumns})`,
               "--page-grid-cell-height": `calc(var(--notebook-height) * ${pageScreenHeightRatio} / ${gridRows})`,
               "--page-number-badge-width": `max(${badge.minSize}, calc(var(--page-grid-cell-width) * ${badge.sizeMultiplier}))`,
               "--page-number-badge-height": `max(${badge.minSize}, calc(var(--page-grid-cell-height) * ${badge.sizeMultiplier}))`,
               "--page-number-badge-x-offset": `max(${badge.xOffsetMin}, calc(var(--page-grid-cell-width) * ${badge.xOffsetMultiplier}))`,
               "--page-number-badge-y-offset": `max(${badge.yOffsetMin}, calc(var(--page-grid-cell-height) * ${badge.yOffsetMultiplier}))`
          };
     }

     function applyStaticRootControls(root = document.documentElement) {
          setRootProperties(getStaticRootProperties(), root);
     }

     applyStaticRootControls();

     window.PlannerRootControls = {
          applyStaticRootControls,
          controls: rootControls,
          getPageBadgeRootProperties,
          getStaticRootProperties,
          setRootProperties
     };
})();

// NOTE: Color Pickers, Swatches, And Drop-Down Menus
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
          <label>
               <span>HEX</span>
               <input type="color" value="#ffffee" data-hex-popover-color>
          </label>
          <label>
               <span>Alpha</span>
               <select data-hex-popover-alpha>
                    <option value="100" selected>100</option>
                    <option value="75">75</option>
                    <option value="50">50</option>
                    <option value="25">25</option>
                    <option value="0">0</option>
               </select>
          </label>
     `;
     document.body.append(popover);

     const colorInput = popover.querySelector("[data-hex-popover-color]");
     const alphaSelect = popover.querySelector("[data-hex-popover-alpha]");
     const applyHex = () => {
          if (typeof activeHexTarget === "function") {
               activeHexTarget(hexToAlphaColor(colorInput.value, alphaSelect.value));
          }
     };

     colorInput.addEventListener("input", applyHex);
     colorInput.addEventListener("change", applyHex);
     alphaSelect.addEventListener("change", applyHex);

     return popover;
}

function openHexPopover(button, onSelect) {
     const popover = getHexPopover();
     const rect = button.getBoundingClientRect();

     activeHexTarget = onSelect;
     popover.hidden = false;
     popover.style.left = `${Math.min(rect.left, window.innerWidth - popover.offsetWidth - 8)}px`;
     popover.style.top = `${Math.min(rect.bottom + 3, window.innerHeight - popover.offsetHeight - 8)}px`;
}

function closeHexPopover() {
     const popover = document.querySelector("[data-hex-popover]");

     if (popover) {
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
          ...tertiaryMatrixSteps.map((step) => ({
               label: `Tint${step}`,
               mode: "tint",
               step
          })),
          {
               label: "Tertiary",
               mode: "base",
               step: 0
          },
          ...tertiaryMatrixSteps.slice().reverse().map((step) => ({
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
     const anchorRight = anchorRect?.right || toggleRect.right;
     if (anchorRect) {
          tertiaryMatrixPopover.style.setProperty("--matrix-slide-distance", `${Math.round(anchorRect.width)}px`);
     }
     const left = anchorRight;
     const availableWidth = Math.max(180, window.innerWidth - left - 8);
     const top = Math.min(
          Math.max(0, anchorRect?.top || toggleRect.top),
          Math.max(0, window.innerHeight - popoverRect.height)
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

function initializePalettePreview() {
     if (!palettePreviewSwatches) {
          return;
     }

     updatePalettePreview();
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

     summary.textContent = selectedOption ? selectedOption.textContent : "";
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
     const availableHeight = Math.max(92, Math.floor(menuRect.bottom - summaryRect.bottom - 12));

     dropdown.style.setProperty("--select-focus-options-height", `${availableHeight}px`);
}

function setSelectFocus(dropdown) {
     const menu = getSelectFocusMenu(dropdown);
     const panel = getSelectFocusPanel(dropdown);
     const row = getSelectFocusRow(dropdown);
     const group = row ? row.closest(".item-widget-group, .item-calendar-attributes-grid") : null;

     if (!menu || !panel || !row) {
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
               setSelectFocus(dropdown);
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

// NOTE: Bottom Menu And Object Settings Panel
function selectSettingsTab(tabName) {
     closeCustomSelects(plannerSettings);
     clearSelectFocus(plannerSettings);

     settingsTabs.forEach((tab) => {
          const isActive = tab.dataset.settingsTab === tabName;

          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
     });

     settingsPanels.forEach((panel) => {
          panel.hidden = panel.dataset.settingsPanel !== tabName;
     });

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
          const isDisabled = activeIndex + step < 0 || activeIndex + step >= settingsTabs.length;

          if ("disabled" in button) {
               button.disabled = isDisabled;
          }
          button.setAttribute("aria-disabled", String(isDisabled));
     });
}

function stepSettingsTab(step) {
     const activeIndex = settingsTabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
     const nextTab = settingsTabs[clamp(activeIndex + step, 0, settingsTabs.length - 1)];

     if (!nextTab) {
          return;
     }

     selectSettingsTab(nextTab.dataset.settingsTab);
     openSidebar();
}

function updateObjectControlsState() {
     if (!objectControlsShell || !objectControlsEmpty) {
          return;
     }

     const hasControls = Boolean(objectControlsShell.querySelector(".item-controls"));

     objectControlsShell.classList.toggle("is-inactive", !hasControls);
     objectControlsEmpty.hidden = hasControls;
}

function updateClipboardControls() {
     if (pastePageButton) {
          pastePageButton.disabled = !plannerClipboard;
     }

     document.querySelectorAll("[data-clipboard-action='paste']").forEach((button) => {
          button.disabled = !plannerClipboard;
     });
}

function openSidebar() {
     plannerSettings.classList.add("is-open");
     plannerDesk.classList.add("has-open-main-menu");
}

function closeSidebar() {
     closeCustomSelects(plannerSettings);
     clearSelectFocus(plannerSettings);
     setTertiaryMatrixOpen(false);
     plannerSettings.classList.remove("is-open");
     plannerDesk.classList.remove("has-open-main-menu");
}

function isPointerInsideElementBox(event, element) {
     const rect = element.getBoundingClientRect();

     return event.clientX >= rect.left
          && event.clientX <= rect.right
          && event.clientY >= rect.top
          && event.clientY <= rect.bottom;
}

function collapseMenusFromOutsidePointer(event) {
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
     const pageItems = getPageTemplateItems();

     plannerConfig = buildPlannerConfig();
     applyPlannerConfig();

     requestAnimationFrame(() => {
          resizePageTemplateItems(pageItems);
          notifyTemplateChanged();
     });
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
