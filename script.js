const pages = Array.from(document.querySelectorAll("[data-page]"));
const plannerDesk = document.querySelector(".planner-desk");
const plannerSettings = document.querySelector(".planner-settings");
const notebook = document.querySelector(".notebook");
const sourceItems = Array.from(document.querySelectorAll("[data-create-item]"));
const insertPageButton = document.querySelector("[data-insert-page]");
const deletePageButton = document.querySelector("[data-delete-page]");
const pageCountStatus = document.querySelector("[data-page-count-status]");
const clearPageButton = document.querySelector("[data-clear-page]");
const clearBookButton = document.querySelector("[data-clear-book]");
const paperSelect = document.querySelector("[data-setting='paper']");
const paperColorSelect = document.querySelector("[data-setting='paper-color']");
const deskColorSelect = document.querySelector("[data-setting='desk-color']");
const palettePreviewSwatches = document.querySelector("[data-palette-preview-swatches]");
const tertiaryMatrixPopover = document.querySelector("[data-tertiary-matrix]");
const tertiaryMatrixGrid = document.querySelector("[data-tertiary-matrix-grid]");
const settingSelects = Array.from(document.querySelectorAll("[data-setting]")).filter((select) => !["paper", "grid", "paper-color", "desk-color"].includes(select.dataset.setting));
const guideInputs = Array.from(document.querySelectorAll("[data-guide]"));
const settingsTabs = Array.from(document.querySelectorAll("[data-settings-tab]"));
const settingsPanels = Array.from(document.querySelectorAll("[data-settings-panel]"));
const settingsStepButtons = Array.from(document.querySelectorAll("[data-settings-step]"));
const objectControlsShell = document.querySelector("[data-object-controls-shell]");
const objectControlsEmpty = document.querySelector("[data-object-controls-empty]");
const pageSnapButtons = Array.from(document.querySelectorAll("[data-page-snap]"));
const zoomToast = document.querySelector("[data-zoom-toast]");
const settingChoiceInputs = Array.from(document.querySelectorAll("[data-setting-choice]"));
let customSelectDetails = [];
const singlePageViewportMaxWidth = 1000;
const singlePageViewportQuery = window.matchMedia(`(max-width: ${singlePageViewportMaxWidth}px)`);
const notebookViewportHeightReserve = 0;
const notebookViewportWidth = 132;
const notebookMaxWidth = 1220;
const screenReferencePaper = {
     unit: "in",
     width: 8.5,
     height: 11
};

const resizeEdgeSize = 16;
const moveStartThreshold = 5;
const pageStickDepth = 2;
const stickyGridUnits = 12;
const itemGridUnits = {
     sticky: {
          width: 12,
          height: 12
     },
     "mini-cal": {
          width: 8,
          height: 8
     },
     "full-cal": {
          width: 14,
          height: 10
     },
     "weekly-vertical": {
          width: 14,
          height: 14
     }
};
const templateSchemaVersion = 1;
const plannerStorageKey = "perfectPlanner:v1";
const plannerStateSchemaVersion = 1;
const minNotebookPageCount = 10;
const maxNotebookPageCount = 1000;
const inchToCentimeters = 2.54;
const calendarMonthNames = [
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
];
const calendarYearRange = {
     start: 2025,
     end: 2035
};
const viewZoomLevels = [
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
];
const viewFocusPoints = ["left", "right"];
const viewVerticalFocusPoints = ["top", "mid", "bottom"];
const initialNotebookPageCount = 10;
const initialNotebookSpreadCount = Math.ceil(initialNotebookPageCount / 2);
let viewZoomIndex = 0;
let viewFocusIndex = 0;
let viewVerticalFocusIndex = 1;
let notebookPageCount = initialNotebookPageCount;
let currentSpreadIndex = 0;
let notebookSpreadCount = initialNotebookSpreadCount;
let pageTurnTimer = 0;
let pendingSpreadTurn = null;
let isSinglePageViewport = singlePageViewportQuery.matches;
let responsiveViewFrame = 0;
let wheelZoomDelta = 0;
let zoomToastTimer = 0;
let viewPanOffsetX = 0;
let viewPanOffsetY = 0;
const paperSizes = {
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
};
const paperViewScales = {
     "letter": 1,
     "half-letter": 1.28,
     "a4": 0.92,
     "a5": 1.28
};
const gridSizes = {
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
};
const colorPalettes = {
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
};
const colorPaletteOrder = ["gray", "tertiary"];
const tertiaryMatrixSteps = [90, 70, 50, 30, 10];
const paperColorPalette = [
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
];
const paperColors = {
     ...Object.fromEntries(paperColorPalette.map((color) => [color.key, color])),
     Custom: {
          key: "Custom",
          label: "Custom",
          display: "Hex",
          color: "#ffffee"
     }
};
const deskColors = {
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
};
const guideLabels = {
     halves: "1/2",
     thirds: "1/3",
     fourths: "1/4"
};
const guideOrder = ["halves", "thirds", "fourths"];
const textLineHeightCellOptions = ["1", "1.5", "2", "2.5", "3"];

let activeAction = null;
let selectedItem = null;
let selectedItems = new Set();
let nextTemplateItemId = 1;
let nextGroupId = 1;
let shouldSkipNextClear = false;
let shouldSkipNextItemClick = false;
let shouldSkipNextTabClick = false;
let activeTertiaryMatrixToggle = document.querySelector("[data-tertiary-matrix-toggle]");
let activeHexTarget = null;
let isRestoringPlannerState = false;

restoreSavedSettings();
let plannerConfig = buildPlannerConfig();

function convertLength(value, fromUnit, toUnit) {
     if (fromUnit === toUnit) {
          return value;
     }

     return fromUnit === "in" ? value * inchToCentimeters : value / inchToCentimeters;
}

function buildPlannerConfig() {
     const paperKey = paperSelect ? paperSelect.value : "letter";
     const gridKey = getGridKeyForPaper(paperKey);
     const paperColorKey = paperColorSelect ? paperColorSelect.value : "Offwhite";
     const deskColorKey = deskColorSelect ? deskColorSelect.value : "pink";
     const guides = {
          halves: true,
          thirds: false,
          fourths: false
     };
     const paper = paperSizes[paperKey];
     const grid = gridSizes[gridKey];
     const pageWidth = convertLength(paper.width, paper.unit, grid.unit);
     const pageHeight = convertLength(paper.height, paper.unit, grid.unit);
     const gridColumns = pageWidth / grid.size;
     const gridRows = pageHeight / grid.size;
     const guideColumns = Math.round(gridColumns);
     const guideRows = Math.round(gridRows);
     const outerEdgeLeewayColumns = 1;
     const centerColumn = gridColumns / 2;
     const halfColumn = Math.round(guideColumns / 2);
     const halfLeftColumn = getNearestSnapUnit(centerColumn, getGridSnapOriginUnitsForPaper(paperKey, "left").x);
     const halfRightColumn = getNearestSnapUnit(centerColumn, getGridSnapOriginUnitsForPaper(paperKey, "right").x);
     const halfRow = gridRows / 2;
     const outerFourthColumns = Math.floor((halfColumn - outerEdgeLeewayColumns) / 2);
     const thirdColumnOffset = Math.floor(guideColumns / 6);
     const thirdRowOffset = Math.floor(guideRows / 6);
     const fourthRowOffset = Math.floor(guideRows / 4);

     guideInputs.forEach((input) => {
          guides[input.dataset.guide] = input.checked;
     });

     return {
          paperKey,
          gridKey,
          paperColorKey,
          deskColorKey,
          guides,
          paper,
          paperColor: paperColors[paperColorKey] || paperColors.Offwhite,
          deskColor: deskColors[deskColorKey],
          grid,
          pageWidth,
          pageHeight,
          gridColumns,
          gridRows,
          halfColumn,
          halfLeftColumn,
          halfRightColumn,
          halfRow,
          thirdColumnOne: halfColumn - thirdColumnOffset,
          thirdColumnTwo: halfColumn + thirdColumnOffset,
          thirdLeftColumnOne: halfLeftColumn - thirdColumnOffset,
          thirdLeftColumnTwo: halfLeftColumn + thirdColumnOffset,
          thirdRightColumnOne: halfRightColumn - thirdColumnOffset,
          thirdRightColumnTwo: halfRightColumn + thirdColumnOffset,
          thirdRowOne: halfRow - thirdRowOffset,
          thirdRowTwo: halfRow + thirdRowOffset,
          fourthColumnOne: Math.round(guideColumns / 4),
          fourthColumnTwo: Math.round(guideColumns / 2),
          fourthColumnThree: Math.round(guideColumns * 3 / 4),
          fourthRowOne: halfRow - fourthRowOffset,
          fourthRowTwo: halfRow,
          fourthRowThree: halfRow + fourthRowOffset,
          fourthLeftColumnOne: guideColumns - (halfColumn + outerFourthColumns),
          fourthLeftColumnTwo: halfLeftColumn,
          fourthLeftColumnThree: guideColumns - (halfColumn - outerFourthColumns),
          fourthRightColumnOne: halfColumn - outerFourthColumns,
          fourthRightColumnTwo: halfRightColumn,
          fourthRightColumnThree: halfColumn + outerFourthColumns
     };
}

function getGridKeyForPaper(paperKey) {
     return paperSizes[paperKey]?.unit === "cm" ? "half-centimeter" : "quarter-inch";
}

function getGridSize(page) {
     const rect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();

     return {
          x: rect.width / viewZoom / plannerConfig.gridColumns,
          y: rect.height / viewZoom / plannerConfig.gridRows
     };
}

function getNearestSnapUnit(targetUnit, originUnit) {
     return originUnit + Math.round(targetUnit - originUnit);
}

function getGridSnapOriginUnitsForPaper(paperKey, pageId) {
     const isShiftedA5RightPage = paperKey === "a5" && pageId === "right";
     const isA4Page = paperKey === "a4";

     return {
          x: isShiftedA5RightPage ? -0.4 : 0,
          y: isA4Page ? -0.3 : 0
     };
}

function getGridSnapOriginUnitsForPageId(pageId) {
     return getGridSnapOriginUnitsForPaper(plannerConfig.paperKey, pageId);
}

function getGridSnapOriginUnits(page) {
     const fallback = page ? getGridSnapOriginUnitsForPageId(getPageId(page)) : { x: 0, y: 0 };
     const x = Number(page?.dataset.gridSnapOriginX);
     const y = Number(page?.dataset.gridSnapOriginY);

     return {
          x: Number.isFinite(x) ? x : fallback.x,
          y: Number.isFinite(y) ? y : fallback.y
     };
}

function getGridSnapOrigin(page) {
     const grid = getGridSize(page);
     const origin = getGridSnapOriginUnits(page);

     return {
          x: origin.x * grid.x,
          y: origin.y * grid.y
     };
}

function formatGridUnit(value) {
     return String(Number(value.toFixed(4)));
}

function getFirstVisibleDotOffsetFromStart(origin, edgeMaskUnits) {
     const dotIndex = Math.max(1, Math.ceil(edgeMaskUnits - origin - 0.000001));

     return origin + dotIndex;
}

function getLastVisibleDotOffsetFromEnd(totalUnits, origin, edgeMaskUnits) {
     const dotIndex = Math.max(1, Math.floor(totalUnits - edgeMaskUnits - origin + 0.000001));

     return totalUnits - (origin + dotIndex);
}

function getOutsideCornerMaskOffsetUnits(pageId, origin) {
     return {
          x: pageId === "left"
               ? getFirstVisibleDotOffsetFromStart(origin.x, 1)
               : getLastVisibleDotOffsetFromEnd(plannerConfig.gridColumns, origin.x, 1),
          y: getLastVisibleDotOffsetFromEnd(plannerConfig.gridRows, origin.y, 0.5)
     };
}

function syncGridSnapOrigins() {
     pages.forEach((page) => {
          const pageId = getPageId(page);
          const origin = getGridSnapOriginUnitsForPageId(pageId);
          const cornerMaskOffset = getOutsideCornerMaskOffsetUnits(pageId, origin);

          page.dataset.gridSnapOriginX = String(origin.x);
          page.dataset.gridSnapOriginY = String(origin.y);
          page.style.setProperty("--grid-snap-origin-x", String(origin.x));
          page.style.setProperty("--grid-snap-origin-y", String(origin.y));
          page.style.setProperty("--outside-corner-dot-mask-offset-x", `calc(var(--dot-grid-size-x) * ${formatGridUnit(cornerMaskOffset.x)})`);
          page.style.setProperty("--outside-corner-dot-mask-offset-y", `calc(var(--dot-grid-size-y) * ${formatGridUnit(cornerMaskOffset.y)})`);
     });
}

function setRootNumber(name, value) {
     document.documentElement.style.setProperty(name, String(value));
}

function setRootLength(name, value) {
     document.documentElement.style.setProperty(name, `${value}%`);
}

function getMiniCalGridUnits(item) {
     return {
          width: 8,
          height: item?.dataset?.monthRows === "2" ? 9 : 8
     };
}

function getRootPixelValue(name) {
     const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));

     return Number.isFinite(value) ? value : 0;
}

function getTextLineHeightCellSize(item) {
     if (!item) {
          return 0;
     }

     if (item.dataset.itemType === "sticky") {
          return item.offsetHeight / stickyGridUnits;
     }

     if (item.dataset.itemType === "mini-cal") {
          return item.offsetHeight / getMiniCalGridUnits(item).height;
     }

     if (item.dataset.itemType === "full-cal" || item.dataset.itemType === "weekly-vertical") {
          const rowCellHeight = Number.parseFloat(item.style.getPropertyValue("--weekly-row-cell-height"));

          if (Number.isFinite(rowCellHeight) && rowCellHeight > 0) {
               return rowCellHeight;
          }

          return item.offsetHeight / itemGridUnits[item.dataset.itemType].height;
     }

     return 0;
}

function getTextLineHeightPixels(item, cellCount) {
     const count = Math.max(1, Number(cellCount) || 1);
     const cellSize = getTextLineHeightCellSize(item);

     return cellSize > 0 ? `${cellSize * count}px` : String(count);
}

function applyViewControls(zoomAnchor = null) {
     const zoom = viewZoomLevels[viewZoomIndex];

     document.documentElement.dataset.viewFocus = viewFocusPoints[viewFocusIndex];
     setRootNumber("--view-zoom", zoom.value);
     setRootNumber("--view-pan-x", "0px");
     setRootNumber("--view-pan-y", "0px");

     syncViewTargetCenter(zoomAnchor);
     updatePageSnapButtons();
     requestAnimationFrame(refreshPageItemViews);
}

function syncViewTargetCenter(zoomAnchor = null) {
     window.cancelAnimationFrame(responsiveViewFrame);

     responsiveViewFrame = window.requestAnimationFrame(() => {
          const notebookRect = notebook.getBoundingClientRect();
          const leftPageRect = pages[0] ? pages[0].getBoundingClientRect() : null;
          const rightPageRect = pages[1] ? pages[1].getBoundingClientRect() : null;
          const deskRect = plannerDesk.getBoundingClientRect();
          const horizontalTargets = {
               left: leftPageRect ? leftPageRect.left + leftPageRect.width / 2 : notebookRect.left + notebookRect.width / 4,
               right: rightPageRect ? rightPageRect.left + rightPageRect.width / 2 : notebookRect.left + (notebookRect.width * 0.75)
          };
          const verticalTargets = {
               top: notebookRect.top + notebookRect.height / 4,
               mid: notebookRect.top + notebookRect.height / 2,
               bottom: notebookRect.top + (notebookRect.height * 0.75)
          };
          const targetX = horizontalTargets[viewFocusPoints[viewFocusIndex]];
          const targetY = verticalTargets[viewVerticalFocusPoints[viewVerticalFocusIndex]];
          const currentPanX = getRootPixelValue("--view-pan-x");
          const currentPanY = getRootPixelValue("--view-pan-y");
          const notebookStageY = getRootPixelValue("--notebook-stage-y");

          if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
               return;
          }

          const deskCenter = deskRect.left + deskRect.width / 2;
          const deskMiddle = deskRect.top + deskRect.height / 2 + notebookStageY;
          const basePanX = deskCenter - (targetX - currentPanX);
          const basePanY = deskMiddle - (targetY - currentPanY);

          setRootNumber("--view-pan-x", `${basePanX + viewPanOffsetX}px`);
          setRootNumber("--view-pan-y", `${basePanY + viewPanOffsetY}px`);

          if (zoomAnchor) {
               const zoomedRect = notebook.getBoundingClientRect();
               const zoomedAnchorX = zoomedRect.left + (zoomedRect.width * zoomAnchor.ratioX);
               const zoomedAnchorY = zoomedRect.top + (zoomedRect.height * zoomAnchor.ratioY);

               viewPanOffsetX += zoomAnchor.clientX - zoomedAnchorX;
               viewPanOffsetY += zoomAnchor.clientY - zoomedAnchorY;
               setRootNumber("--view-pan-x", `${basePanX + viewPanOffsetX}px`);
               setRootNumber("--view-pan-y", `${basePanY + viewPanOffsetY}px`);
          }

          requestAnimationFrame(refreshPageItemViews);
     });
}

function getReferencePaperSizeInches() {
     return {
          width: convertLength(screenReferencePaper.width, screenReferencePaper.unit, "in"),
          height: convertLength(screenReferencePaper.height, screenReferencePaper.unit, "in")
     };
}

function getNotebookWidthFormula() {
     const referencePaper = getReferencePaperSizeInches();
     const spreadRatio = referencePaper.width * 2 / referencePaper.height;

     return `min(${notebookViewportWidth}vw, ${notebookMaxWidth}px, calc((100vh - ${notebookViewportHeightReserve}px) * (${spreadRatio})))`;
}

function syncResponsiveViewportClass() {
     document.body.classList.toggle("is-single-page-viewport", isSinglePageViewport);
}

function applyResponsiveViewMode() {
     const nextIsSinglePageViewport = singlePageViewportQuery.matches;

     if (nextIsSinglePageViewport === isSinglePageViewport) {
          syncResponsiveViewportClass();
          if (isSinglePageViewport) {
               applyViewControls();
          }
          return false;
     }

     isSinglePageViewport = nextIsSinglePageViewport;
     syncResponsiveViewportClass();
     resetViewPanOffset();
     if (isSinglePageViewport) {
          viewFocusIndex = 0;
     } else {
          viewFocusIndex = clamp(viewFocusIndex, 0, viewFocusPoints.length - 1);
     }

     applyPlannerConfig();
     applyViewControls();
     return true;
}

function handleWindowResize() {
     applyResponsiveViewMode();
     syncSidebarSnap();
     customSelectDetails.forEach((dropdown) => updateSelectFocusSpace(dropdown));
     positionTertiaryMatrix();
}

function cycleViewZoom() {
     viewZoomIndex = (viewZoomIndex + 1) % viewZoomLevels.length;
     applyViewControls();
     showZoomToast();
}

function getZoomAnchor(clientX, clientY) {
     const rect = notebook.getBoundingClientRect();

     if (!rect.width || !rect.height) {
          return null;
     }

     return {
          clientX,
          clientY,
          ratioX: (clientX - rect.left) / rect.width,
          ratioY: (clientY - rect.top) / rect.height
     };
}

function changeViewZoom(direction, zoomAnchor = null) {
     const step = direction === "in" ? 1 : -1;
     const nextZoomIndex = clamp(viewZoomIndex + step, 0, viewZoomLevels.length - 1);

     if (nextZoomIndex === viewZoomIndex) {
          return;
     }

     viewZoomIndex = nextZoomIndex;
     applyViewControls(zoomAnchor);
     showZoomToast();
}

function showZoomToast() {
     if (!zoomToast) {
          return;
     }

     zoomToast.textContent = viewZoomLevels[viewZoomIndex].label;
     zoomToast.classList.add("is-visible");
     window.clearTimeout(zoomToastTimer);
     zoomToastTimer = window.setTimeout(() => {
          zoomToast.classList.remove("is-visible");
     }, 760);
}

function zoomViewFromWheel(event) {
     if (event.target.closest(".sticky-text[contenteditable='true'], .calendar-day-text[contenteditable='true']")) {
          return;
     }

     if (event.target.closest(".planner-settings, .item-controls")) {
          return;
     }

     event.preventDefault();
     wheelZoomDelta += event.deltaY;

     const isWheelNotch = event.deltaMode !== 0 || Math.abs(event.deltaY) >= 32;
     const threshold = event.ctrlKey ? 8 : 32;
     if (Math.abs(wheelZoomDelta) < threshold) {
          return;
     }

     changeViewZoom(wheelZoomDelta < 0 ? "in" : "out", getZoomAnchor(event.clientX, event.clientY));
     wheelZoomDelta = isWheelNotch ? 0 : wheelZoomDelta % threshold;
}

function resetViewPanOffset() {
     viewPanOffsetX = 0;
     viewPanOffsetY = 0;
}

function moveViewFocus(direction) {
     const step = direction === "next" ? 1 : -1;
     const nextFocusIndex = clamp(viewFocusIndex + step, 0, viewFocusPoints.length - 1);

     if (nextFocusIndex === viewFocusIndex || !isPageSideAvailable(viewFocusPoints[nextFocusIndex])) {
          return;
     }

     resetViewPanOffset();
     viewFocusIndex = nextFocusIndex;
     applyViewControls();
}

function moveViewVerticalFocus(direction) {
     const step = direction === "next" ? 1 : -1;

     resetViewPanOffset();
     viewVerticalFocusIndex = clamp(viewVerticalFocusIndex + step, 0, viewVerticalFocusPoints.length - 1);
     applyViewControls();
}

function snapViewToPage(pageSide) {
     const nextFocusIndex = viewFocusPoints.indexOf(pageSide);

     if (nextFocusIndex === -1 || !isPageSideAvailable(pageSide)) {
          return;
     }

     resetViewPanOffset();
     viewFocusIndex = nextFocusIndex;
     applyViewControls();
}

function updatePageSnapButtons() {
     const canUsePageSnapControls = isSinglePageViewport || viewZoomIndex > 0;

     pageSnapButtons.forEach((button) => {
          const direction = button.dataset.pageSnap;

          if (!canUsePageSnapControls) {
               button.hidden = true;
               return;
          }

          if (direction === "previous") {
               button.hidden = viewFocusIndex <= 0;
          } else if (direction === "next") {
               const nextFocusIndex = viewFocusIndex + 1;

               button.hidden = viewFocusIndex >= viewFocusPoints.length - 1 || !isPageSideAvailable(viewFocusPoints[nextFocusIndex]);
          } else if (direction === "up") {
               button.hidden = viewVerticalFocusIndex <= 0;
          } else {
               button.hidden = viewVerticalFocusIndex >= viewVerticalFocusPoints.length - 1;
          }
     });
     updatePageActionButtons();
}

function movePageSnap(direction) {
     if (direction === "previous" || direction === "next") {
          moveViewFocus(direction);
          return;
     }

     moveViewVerticalFocus(direction === "up" ? "previous" : "next");
}

function getCurrentSpreadPageNumber(side = "left") {
     return (currentSpreadIndex * 2) + (side === "right" ? 1 : 0);
}

function getSpreadCountForPageCount(pageCount) {
     return Math.max(1, Math.ceil(pageCount / 2));
}

function normalizeNotebookPageCount(pageCount) {
     const roundedPageCount = Math.round(Number(pageCount)) || initialNotebookPageCount;

     return clamp(roundedPageCount, minNotebookPageCount, maxNotebookPageCount);
}

function getPageSideForPageNumber(pageNumber) {
     return pageNumber % 2 === 0 ? "left" : "right";
}

function isPageNumberAvailable(pageNumber) {
     return pageNumber >= 0 && pageNumber < notebookPageCount;
}

function isFinalRightPlaceholderPage(pageNumber) {
     return pageNumber === notebookPageCount && pageNumber % 2 === 1;
}

function isPageSideAvailable(side, spreadIndex = currentSpreadIndex) {
     return isPageNumberAvailable((spreadIndex * 2) + (side === "right" ? 1 : 0));
}

function formatPageNumber(pageNumber) {
     return isPageNumberAvailable(pageNumber) ? String(pageNumber) : "";
}

function getFocusedPageSide() {
     return viewFocusPoints[viewFocusIndex] || "left";
}

function getFocusedPageNumber() {
     return getCurrentSpreadPageNumber(getFocusedPageSide());
}

function setNotebookPageCount(pageCount) {
     notebookPageCount = normalizeNotebookPageCount(pageCount);
     notebookSpreadCount = getSpreadCountForPageCount(notebookPageCount);
     currentSpreadIndex = clamp(currentSpreadIndex, 0, notebookSpreadCount - 1);
     if (!isPageSideAvailable(getFocusedPageSide())) {
          viewFocusIndex = 0;
     }
}

function setFocusedPageNumber(pageNumber) {
     const nextPageNumber = clamp(Math.round(Number(pageNumber)) || 0, 0, notebookPageCount - 1);
     const nextSide = getPageSideForPageNumber(nextPageNumber);
     const nextFocusIndex = viewFocusPoints.indexOf(nextSide);

     currentSpreadIndex = clamp(Math.floor(nextPageNumber / 2), 0, notebookSpreadCount - 1);
     viewFocusIndex = nextFocusIndex === -1 ? 0 : nextFocusIndex;
}

function getItemSpreadIndex(item) {
     return Number(item.dataset.spreadIndex || 0);
}

function setItemSpreadIndex(item, spreadIndex = currentSpreadIndex) {
     item.dataset.spreadIndex = String(clamp(Number(spreadIndex) || 0, 0, notebookSpreadCount - 1));
}

function getItemPageNumber(item) {
     return (getItemSpreadIndex(item) * 2) + (item.dataset.pageId === "right" ? 1 : 0);
}

function getStoredItemPageNumber(itemData) {
     const spreadIndex = Number(itemData.spreadIndex) || 0;
     const pageId = itemData.page || itemData.pageId || "left";

     return (spreadIndex * 2) + (pageId === "right" ? 1 : 0);
}

function setItemPageNumber(item, pageNumber) {
     item.dataset.spreadIndex = String(Math.floor(pageNumber / 2));
     item.dataset.pageId = getPageSideForPageNumber(pageNumber);
}

function updatePageActionButtons() {
     const focusedPageNumber = getFocusedPageNumber();
     const focusedPageExists = isPageNumberAvailable(focusedPageNumber);

     if (insertPageButton) {
          insertPageButton.disabled = notebookPageCount >= maxNotebookPageCount;
     }

     if (deletePageButton) {
          deletePageButton.disabled = notebookPageCount <= minNotebookPageCount || !focusedPageExists;
     }

     if (pageCountStatus) {
          pageCountStatus.textContent = `${notebookPageCount} pages`;
     }
}

function updatePageLabels() {
     pages.forEach((page) => {
          const side = getPageId(page);
          const pageNumberValue = getCurrentSpreadPageNumber(side);
          const pageNumber = String(pageNumberValue);
          const pageExists = isPageNumberAvailable(pageNumberValue);
          const isFinalRightPlaceholder = isFinalRightPlaceholderPage(pageNumberValue);
          const isLeft = side === "left";
          const canTurn = pageExists && (isLeft ? currentSpreadIndex > 0 : currentSpreadIndex < notebookSpreadCount - 1);
          const foldNumber = isLeft ? pageNumberValue - 1 : pageNumberValue + 1;
          const behindNumber = isLeft ? pageNumberValue - 2 : pageNumberValue + 2;

          page.dataset.pageNumber = pageNumber;
          page.classList.toggle("is-missing-page", !pageExists && !isFinalRightPlaceholder);
          page.classList.toggle("is-placeholder-page", isFinalRightPlaceholder);
          page.classList.toggle("can-turn-page", canTurn);
          page.querySelector("[data-page-number]")?.replaceChildren(pageExists ? pageNumber : "");
          const foldElement = page.querySelector("[data-page-fold-number]");

          if (foldElement) {
               foldElement.textContent = canTurn ? formatPageNumber(foldNumber) : "";
          }
          page.querySelector("[data-page-behind-number]")?.replaceChildren(canTurn ? formatPageNumber(behindNumber) : "");
     });
     notebook.dataset.spreadIndex = String(currentSpreadIndex);
     notebook.dataset.spreadCount = String(notebookSpreadCount);
     notebook.dataset.pageCount = String(notebookPageCount);
}

function updateSpreadItemVisibility() {
     getAllPlannerItems().forEach((item) => {
          const isPageItem = Boolean(item.dataset.pageId);
          const isVisible = !isPageItem || (getItemSpreadIndex(item) === currentSpreadIndex && isPageNumberAvailable(getItemPageNumber(item)));

          item.classList.toggle("is-spread-hidden", !isVisible);
          if (!isVisible) {
               closeItemMenu(item);
               selectedItems.delete(item);
               item.classList.remove("is-selected");
          }
     });
     selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     updateObjectControlsState();
}

function syncNotebookSpread() {
     updatePageLabels();
     updateSpreadItemVisibility();
     updatePageSnapButtons();
     requestAnimationFrame(refreshPageItemViews);
}

function animateNotebookSpreadTurn(direction) {
     window.clearTimeout(pageTurnTimer);
     notebook.classList.remove("is-turning-next", "is-turning-previous", "is-turning");
     notebook.dataset.turnDirection = direction > 0 ? "next" : "previous";
     notebook.classList.add("is-turning");
     if (direction > 0) {
          notebook.classList.add("is-turning-next");
     } else if (direction < 0) {
          notebook.classList.add("is-turning-previous");
     }
     pageTurnTimer = window.setTimeout(() => {
          notebook.classList.remove("is-turning-next", "is-turning-previous", "is-turning");
          delete notebook.dataset.turnDirection;
          pendingSpreadTurn = null;
     }, 760);
}

function turnNotebookSpread(step) {
     const nextSpreadIndex = clamp(currentSpreadIndex + step, 0, notebookSpreadCount - 1);

     if (nextSpreadIndex === currentSpreadIndex || pendingSpreadTurn) {
          return;
     }

     clearSelection();
     pendingSpreadTurn = {
          from: currentSpreadIndex,
          to: nextSpreadIndex,
          direction: step
     };
     animateNotebookSpreadTurn(step);
     currentSpreadIndex = nextSpreadIndex;
     resetViewPanOffset();
     window.setTimeout(() => {
          syncNotebookSpread();
          applyViewControls();
          notifyTemplateChanged();
     }, 380);
}

function isPageTurnCornerPointer(page, event) {
     if (!page.classList.contains("can-turn-page")) {
          return false;
     }

     const rect = page.getBoundingClientRect();
     const cellWidth = rect.width / plannerConfig.gridColumns;
     const cellHeight = rect.height / plannerConfig.gridRows;
     const localX = event.clientX - rect.left;
     const localY = event.clientY - rect.top;
     const isBottomCornerArea = localY >= rect.height - (cellHeight * 2);

     if (page.dataset.turnPage === "next") {
          return isBottomCornerArea && localX >= rect.width - (cellWidth * 2);
     }

     return isBottomCornerArea && localX <= cellWidth * 2;
}

function getViewZoom() {
     return viewZoomLevels[viewZoomIndex].value;
}

function applyPlannerConfig() {
     const pageWidthInches = convertLength(plannerConfig.pageWidth, plannerConfig.grid.unit, "in");
     const pageHeightInches = convertLength(plannerConfig.pageHeight, plannerConfig.grid.unit, "in");
     const referencePaper = getReferencePaperSizeInches();
     const referenceSpreadRatio = referencePaper.width * 2 / referencePaper.height;
     const notebookHeightRatio = Math.min(50.47, 78 / referenceSpreadRatio);
     const sourceStickyRatio = 50 / plannerConfig.gridColumns * stickyGridUnits;
     const pageViewScale = paperViewScales[plannerConfig.paperKey] || 1;
     const screenPageWidthInches = pageWidthInches * pageViewScale;
     const screenPageHeightInches = pageHeightInches * pageViewScale;
     const pageSpreadWidth = screenPageWidthInches / (referencePaper.width * 2) * 100;
     const pageSpineGapWidth = Math.max(0, 50 - pageSpreadWidth);
     const pageLeftInset = (50 - pageSpreadWidth) / 2;

     setRootNumber("--page-aspect", `${pageWidthInches} / ${pageHeightInches}`);
     setRootNumber("--spread-aspect", `${pageWidthInches * 2} / ${pageHeightInches}`);
     setRootNumber("--notebook-screen-aspect", `${referencePaper.width * 2} / ${referencePaper.height}`);
     setRootNumber("--page-screen-width", `${screenPageWidthInches / referencePaper.width * 100}%`);
     setRootNumber("--page-screen-height", `${screenPageHeightInches / referencePaper.height * 100}%`);
     setRootNumber("--page-spread-width", `${pageSpreadWidth}%`);
     setRootNumber("--page-spine-gap-ratio", pageSpineGapWidth / 100);
     setRootNumber("--page-spine-x-left-focus", `${50 - pageLeftInset}%`);
     setRootNumber("--page-spine-x-right-focus", `${50 + pageLeftInset}%`);
     setRootNumber("--page-turn-left", `${pageLeftInset}%`);
     setRootNumber("--page-turn-right", `${50 + pageLeftInset}%`);
     setRootNumber("--page-spread-left-left", `${pageSpineGapWidth}%`);
     setRootNumber("--page-joined-left-left", `${pageLeftInset + pageSpineGapWidth}%`);
     setRootNumber("--page-joined-right-left", `${50 - pageLeftInset}%`);
     setRootNumber("--dot-grid-size-x", `calc(100% / ${plannerConfig.gridColumns})`);
     setRootNumber("--dot-grid-size-y", `calc(100% / ${plannerConfig.gridRows})`);
     setRootNumber("--dot-grid-half-size-x", `calc(50% / ${plannerConfig.gridColumns})`);
     setRootNumber("--dot-grid-half-size-y", `calc(50% / ${plannerConfig.gridRows})`);
     setRootNumber("--notebook-dot-grid-size-x", `calc(50% / ${plannerConfig.gridColumns})`);
     setRootNumber("--notebook-grid-cell-width", `calc(var(--notebook-width) / ${plannerConfig.gridColumns * 2})`);
     syncGridSnapOrigins();
     setRootNumber("--notebook-width", getNotebookWidthFormula());
     setRootNumber("--notebook-height", `min(${notebookHeightRatio}vw, 724px, calc(100vh - ${notebookViewportHeightReserve}px))`);
     setRootNumber("--source-sticky-size", `calc(var(--notebook-width) * ${sourceStickyRatio / 100})`);
     setRootNumber("--print-page-width", `${pageWidthInches}in`);
     setRootNumber("--print-page-height", `${pageHeightInches}in`);
     setRootNumber("--print-spread-width", `${pageWidthInches * 2}in`);
     setRootNumber("--paper", plannerConfig.paperColor.color);
     setRootNumber("--desk", plannerConfig.deskColor.color);
     setRootNumber("--desk-image", plannerConfig.deskColor.image || "none");
     setRootNumber("--desk-size", plannerConfig.deskColor.size || "auto");
     setRootLength("--half-x", plannerConfig.halfColumn / plannerConfig.gridColumns * 100);
     setRootLength("--half-left-x", plannerConfig.halfLeftColumn / plannerConfig.gridColumns * 100);
     setRootLength("--half-right-x", plannerConfig.halfRightColumn / plannerConfig.gridColumns * 100);
     setRootLength("--half-y", plannerConfig.halfRow / plannerConfig.gridRows * 100);
     setRootLength("--third-x-1", plannerConfig.thirdColumnOne / plannerConfig.gridColumns * 100);
     setRootLength("--third-x-2", plannerConfig.thirdColumnTwo / plannerConfig.gridColumns * 100);
     setRootLength("--third-left-x-1", plannerConfig.thirdLeftColumnOne / plannerConfig.gridColumns * 100);
     setRootLength("--third-left-x-2", plannerConfig.thirdLeftColumnTwo / plannerConfig.gridColumns * 100);
     setRootLength("--third-right-x-1", plannerConfig.thirdRightColumnOne / plannerConfig.gridColumns * 100);
     setRootLength("--third-right-x-2", plannerConfig.thirdRightColumnTwo / plannerConfig.gridColumns * 100);
     setRootLength("--third-y-1", plannerConfig.thirdRowOne / plannerConfig.gridRows * 100);
     setRootLength("--third-y-2", plannerConfig.thirdRowTwo / plannerConfig.gridRows * 100);
     setRootLength("--fourth-x-1", plannerConfig.fourthColumnOne / plannerConfig.gridColumns * 100);
     setRootLength("--fourth-x-2", plannerConfig.fourthColumnTwo / plannerConfig.gridColumns * 100);
     setRootLength("--fourth-x-3", plannerConfig.fourthColumnThree / plannerConfig.gridColumns * 100);
     setRootLength("--fourth-left-x-1", plannerConfig.fourthLeftColumnOne / plannerConfig.gridColumns * 100);
     setRootLength("--fourth-left-x-2", plannerConfig.fourthLeftColumnTwo / plannerConfig.gridColumns * 100);
     setRootLength("--fourth-left-x-3", plannerConfig.fourthLeftColumnThree / plannerConfig.gridColumns * 100);
     setRootLength("--fourth-right-x-1", plannerConfig.fourthRightColumnOne / plannerConfig.gridColumns * 100);
     setRootLength("--fourth-right-x-2", plannerConfig.fourthRightColumnTwo / plannerConfig.gridColumns * 100);
     setRootLength("--fourth-right-x-3", plannerConfig.fourthRightColumnThree / plannerConfig.gridColumns * 100);
     setRootLength("--fourth-y-1", plannerConfig.fourthRowOne / plannerConfig.gridRows * 100);
     setRootLength("--fourth-y-2", plannerConfig.fourthRowTwo / plannerConfig.gridRows * 100);
     setRootLength("--fourth-y-3", plannerConfig.fourthRowThree / plannerConfig.gridRows * 100);
     setRootNumber("--half-guide-opacity", plannerConfig.guides.halves ? "0.25" : "0");
     setRootNumber("--third-guide-opacity", plannerConfig.guides.thirds ? "0.25" : "0");
     setRootNumber("--fourth-guide-opacity", plannerConfig.guides.fourths ? "0.25" : "0");

     delete plannerSettings.dataset.width;
     plannerSettings.style.width = "";

     delete plannerSettings.dataset.height;
     plannerSettings.style.height = "";

     delete plannerSettings.dataset.centerX;
     plannerSettings.style.left = "";

     document.documentElement.dataset.paper = plannerConfig.paperKey;
     document.documentElement.dataset.paperColor = plannerConfig.paperColorKey;
     document.documentElement.dataset.deskColor = plannerConfig.deskColorKey;
     document.documentElement.dataset.grid = plannerConfig.gridKey;
     document.documentElement.dataset.guideHalves = String(plannerConfig.guides.halves);
     document.documentElement.dataset.guideThirds = String(plannerConfig.guides.thirds);
     document.documentElement.dataset.guideFourths = String(plannerConfig.guides.fourths);
}

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

function renderPaletteSwatches(swatches, paletteKey, selectedColor = "", onSelect = null, swatchClass = "palette-swatch") {
     const palette = getPalette(paletteKey);

     if (!swatches) {
          return;
     }

     swatches.replaceChildren();
     palette.colors.forEach((color) => {
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

function renderColorSwatches(swatches, colors, selectedColor = "", onSelect = null, swatchClass = "palette-swatch") {
     if (!swatches) {
          return;
     }

     swatches.replaceChildren();
     appendColorSwatches(swatches, colors, selectedColor, onSelect, swatchClass);
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

function selectSettingsTab(tabName) {
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

function getPageId(page) {
     return page === pages[0] ? "left" : "right";
}

function getGridTemplateBox(item, page) {
     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const box = getItemBox(item);

     return {
          x: Math.round((box.x - origin.x) / grid.x),
          y: Math.round((box.y - origin.y) / grid.y),
          width: Math.round(box.width / grid.x),
          height: Math.round(box.height / grid.y)
     };
}

function getDeskTemplateBox(item) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const box = getItemBox(item);

     return {
          x: Number((box.x / deskRect.width).toFixed(4)),
          y: Number((box.y / deskRect.height).toFixed(4)),
          width: Number((box.width / deskRect.width).toFixed(4)),
          height: Number((box.height / deskRect.height).toFixed(4))
     };
}

function getPageTemplateItems() {
     return getAllPlannerItems().flatMap((item) => {
          const page = item.dataset.pageId
               ? pages.find((plannerPage) => getPageId(plannerPage) === item.dataset.pageId) || null
               : null;

          if (!page) {
               return [];
          }

          return {
               item,
               page,
               grid: getGridTemplateBox(item, page)
          };
     });
}

function resizePageTemplateItems(items) {
     items.forEach(({ item, page, grid }) => {
          const nextGrid = getGridSize(page);
          const origin = getGridSnapOrigin(page);
          const maxX = plannerConfig.gridColumns - Math.max(1, grid.width);
          const maxY = plannerConfig.gridRows - Math.max(1, grid.height);
          const nextBox = {
               x: origin.x + clamp(grid.x, 0, maxX) * nextGrid.x,
               y: origin.y + clamp(grid.y, 0, maxY) * nextGrid.y,
               width: Math.max(1, grid.width) * nextGrid.x,
               height: Math.max(1, grid.height) * nextGrid.y
          };

          setItemBox(item, nextBox);
     });
}

function serializePlannerItem(item) {
     const pageId = item.dataset.pageId || "";
     const page = pageId ? pages.find((plannerPage) => getPageId(plannerPage) === pageId) || null : null;
     const textElement = getStickyTextElement(item);
     const baseItem = {
          id: item.dataset.templateId,
          type: item.dataset.itemType || "sticky",
          groupId: item.dataset.groupId || null,
          style: {
               fillColor: item.dataset.fillColor,
               borderColor: item.dataset.borderColor,
               borderWidth: Number(item.dataset.borderWidth),
               dotGrid: item.dataset.dotGrid === "true"
          },
          widget: isCalendarItem(item)
               ? {
                    weekNumbers: item.dataset.weekNumbers !== "false",
                    weekStart: item.dataset.weekStart || "monday",
                    monthRows: item.dataset.monthRows || "1",
                    monthDisplay: item.dataset.monthDisplay || "full",
                    monthVisible: item.dataset.monthDisplay !== "none",
                    month: Number(item.dataset.month) || 0,
                    monthLabel: calendarMonthNames[Number(item.dataset.month) || 0],
                    yearDisplay: item.dataset.yearDisplay || "full",
                    yearVisible: item.dataset.yearDisplay !== "none",
                    year: Number(item.dataset.year) || new Date().getFullYear(),
                    startDay: Number(item.dataset.startDay) || 1,
                    visibleDays: Number(item.dataset.visibleDays) || 7,
                    timeIncrement: Number(item.dataset.timeIncrement) || 30,
                    startTime: item.dataset.startTime || "00:00",
                    timeFormat: item.dataset.timeFormat || "24",
                    timeVisible: item.dataset.timeVisible !== "false",
                    shareWeekends: item.dataset.shareWeekends === "true",
                    dayNotes: isCalendarTextItem(item) ? getCalendarDayNotes(item) : null,
                    dayText: isCalendarTextItem(item)
                         ? {
                              size: Number(item.dataset.dayTextSize) || 10,
                              font: item.dataset.dayTextFont || "noto",
                              color: item.dataset.dayTextColor || "var(--color-gray1)",
                              bold: item.dataset.dayTextBold === "true",
                              italic: item.dataset.dayTextItalic === "true",
                              underline: item.dataset.dayTextUnderline === "true",
                              align: item.dataset.dayTextAlign || "left",
                              lineHeight: Number(item.dataset.dayTextLineHeight) || 1
                         }
                         : null
               }
               : null,
          text: item.dataset.itemType === "sticky"
               ? {
                    enabled: item.dataset.textEnabled === "true",
                    content: textElement ? textElement.textContent : "",
                   size: Number(item.dataset.textSize) || 10,
                   font: item.dataset.textFont || "noto",
                   color: item.dataset.textColor || "var(--color-gray1)",
                   bold: item.dataset.textBold === "true",
                    italic: item.dataset.textItalic === "true",
                    underline: item.dataset.textUnderline === "true",
                    align: item.dataset.textAlign || "left",
                    lineHeight: Number(item.dataset.textLineHeight) || 1
               }
               : null
     };

     if (page) {
          return {
               ...baseItem,
               placement: "page",
               spreadIndex: getItemSpreadIndex(item),
               page: pageId,
               pageNumber: getItemPageNumber(item),
               grid: getGridTemplateBox(item, page)
          };
     }

     return {
          ...baseItem,
          placement: "desk",
          frame: getDeskTemplateBox(item)
     };
}

function serializePlannerTemplate() {
     return {
          schemaVersion: templateSchemaVersion,
          type: "planner-layout-template",
          page: {
               size: plannerConfig.paperKey,
               label: plannerConfig.paper.label,
               width: Number(plannerConfig.pageWidth.toFixed(4)),
               height: Number(plannerConfig.pageHeight.toFixed(4)),
               unit: plannerConfig.grid.unit,
               color: plannerConfig.paperColorKey,
               colorLabel: plannerConfig.paperColor.label,
               colorValue: plannerConfig.paperColor.color,
               deskColor: plannerConfig.deskColorKey,
               deskColorLabel: plannerConfig.deskColor.label,
               deskColorValue: plannerConfig.deskColor.color,
               deskImageValue: plannerConfig.deskColor.image || null,
               widthInches: Number(convertLength(plannerConfig.pageWidth, plannerConfig.grid.unit, "in").toFixed(4)),
               heightInches: Number(convertLength(plannerConfig.pageHeight, plannerConfig.grid.unit, "in").toFixed(4)),
               grid: plannerConfig.gridKey,
               gridLabel: plannerConfig.grid.label,
               gridInterval: plannerConfig.grid.size,
               gridUnit: plannerConfig.grid.unit,
               gridIntervalInches: Number(convertLength(plannerConfig.grid.size, plannerConfig.grid.unit, "in").toFixed(4)),
               gridColumns: plannerConfig.gridColumns,
               gridRows: plannerConfig.gridRows
          },
          spread: {
               pages: ["left", "right"],
               currentIndex: currentSpreadIndex,
               count: notebookSpreadCount,
               pageCount: notebookPageCount,
               visiblePages: [getCurrentSpreadPageNumber("left"), getCurrentSpreadPageNumber("right")].filter(isPageNumberAvailable),
               spineLeewayGridColumns: 1
          },
          guides: {
               halves: plannerConfig.guides.halves,
               thirds: plannerConfig.guides.thirds,
               fourths: plannerConfig.guides.fourths
          },
          items: getAllPlannerItems().map(serializePlannerItem)
     };
}

function getEmptyPlannerState() {
     return {
          schemaVersion: plannerStateSchemaVersion,
          settings: null,
          books: {}
     };
}

function readPlannerState() {
     try {
          const storedState = window.localStorage.getItem(plannerStorageKey);
          const state = storedState ? JSON.parse(storedState) : null;

          if (!state || typeof state !== "object") {
               return getEmptyPlannerState();
          }

          return {
               schemaVersion: plannerStateSchemaVersion,
               settings: state.settings || null,
               books: state.books && typeof state.books === "object" ? state.books : {}
          };
     } catch {
          return getEmptyPlannerState();
     }
}

function writePlannerState(state) {
     try {
          window.localStorage.setItem(plannerStorageKey, JSON.stringify({
               schemaVersion: plannerStateSchemaVersion,
               settings: state.settings || null,
               books: state.books || {}
          }));
     } catch {
     }
}

function setSelectValue(select, value) {
     if (!select || value === undefined || value === null) {
          return;
     }

     const nextValue = String(value);

     if (Array.from(select.options).some((option) => option.value === nextValue)) {
          select.value = nextValue;
     }
}

function normalizeStoredViewFocusIndex(value) {
     if (value === "right") {
          return 1;
     }

     if (value === "left") {
          return 0;
     }

     const storedIndex = Number(value);

     if (!Number.isFinite(storedIndex)) {
          return 0;
     }

     // Previous saves used 0 = left, 1 = center, 2 = right.
     return storedIndex >= 2 ? 1 : 0;
}

function serializePlannerSettings() {
     return {
          paper: paperSelect?.value || "letter",
          paperColor: paperColorSelect?.value || "Offwhite",
          customPaperColor: paperColors.Custom?.color || "#ffffee",
          deskColor: deskColorSelect?.value || "wood-brown",
          guides: Object.fromEntries(guideInputs.map((input) => [input.dataset.guide, input.checked])),
          view: {
               zoomIndex: viewZoomIndex,
               focusIndex: viewFocusIndex,
               focusSide: viewFocusPoints[viewFocusIndex],
               verticalFocusIndex: viewVerticalFocusIndex
          }
     };
}

function restoreSavedSettings() {
     const settings = readPlannerState().settings;

     if (!settings) {
          return;
     }

     setSelectValue(paperSelect, settings.paper);
     if (settings.customPaperColor && paperColors.Custom) {
          paperColors.Custom.color = settings.customPaperColor;
     }
     setSelectValue(paperColorSelect, settings.paperColor);
     setSelectValue(deskColorSelect, settings.deskColor);
     if (settings.guides && typeof settings.guides === "object") {
          guideInputs.forEach((input) => {
               if (settings.guides[input.dataset.guide] !== undefined) {
                    input.checked = Boolean(settings.guides[input.dataset.guide]);
               }
          });
     }
     if (settings.view && typeof settings.view === "object") {
          viewZoomIndex = clamp(Number(settings.view.zoomIndex) || 0, 0, viewZoomLevels.length - 1);
          viewFocusIndex = normalizeStoredViewFocusIndex(settings.view.focusSide ?? settings.view.focusIndex);
          viewVerticalFocusIndex = clamp(Number(settings.view.verticalFocusIndex) || 1, 0, viewVerticalFocusPoints.length - 1);
     }
}

function serializePlannerBook() {
     return {
          schemaVersion: plannerStateSchemaVersion,
          pageCount: notebookPageCount,
          spread: {
               currentIndex: currentSpreadIndex,
               count: notebookSpreadCount,
               pageCount: notebookPageCount
          },
          items: getAllPlannerItems().map(serializePlannerItem)
     };
}

function savePlannerBook(paperKey = plannerConfig.paperKey) {
     if (isRestoringPlannerState) {
          return;
     }

     const state = readPlannerState();

     state.books[paperKey] = serializePlannerBook();
     writePlannerState(state);
}

function savePlannerState() {
     if (isRestoringPlannerState) {
          return;
     }

     const state = readPlannerState();

     state.settings = serializePlannerSettings();
     state.books[plannerConfig.paperKey] = serializePlannerBook();
     writePlannerState(state);
}

function getStoredBook(paperKey) {
     return readPlannerState().books?.[paperKey] || null;
}

function normalizeStoredBoolean(value, fallback = "false") {
     if (value === undefined || value === null) {
          return fallback;
     }

     return value === true || value === "true" ? "true" : "false";
}

function normalizePlannerItemType(type = "sticky") {
     return type === "mini-cal2" ? "mini-cal" : type;
}

function getStoredItemGrid(itemData) {
     const type = normalizePlannerItemType(itemData.type || "sticky");
     const isLegacyMiniCal2 = itemData.type === "mini-cal2";
     const fallback = isLegacyMiniCal2 ? getMiniCalGridUnits({
          dataset: {
               monthRows: "2"
          }
     }) : itemGridUnits[type] || itemGridUnits.sticky;
     const grid = itemData.grid || {};
     const storedWidth = Number(grid.width);
     const storedHeight = Number(grid.height);
     const shouldUseMiniCal2DefaultSize = isLegacyMiniCal2 && storedWidth === 16 && storedHeight === 15;

     return {
          x: Number.isFinite(Number(grid.x)) ? Number(grid.x) : 0,
          y: Number.isFinite(Number(grid.y)) ? Number(grid.y) : 0,
          width: shouldUseMiniCal2DefaultSize ? fallback.width : Math.max(1, Number.isFinite(storedWidth) ? storedWidth : fallback.width),
          height: shouldUseMiniCal2DefaultSize ? fallback.height : Math.max(1, Number.isFinite(storedHeight) ? storedHeight : fallback.height)
     };
}

function restorePlannerItemSettings(item, itemData) {
     const style = itemData.style || {};
     const text = itemData.text || {};
     const widget = itemData.widget || {};

     setItemStyle(item, {
          fillColor: style.fillColor,
          borderColor: style.borderColor,
          borderWidth: style.borderWidth,
          dotGrid: normalizeStoredBoolean(style.dotGrid)
     });
     if (item.dataset.itemType === "sticky") {
          setStickyTextSettings(item, {
               enabled: normalizeStoredBoolean(text.enabled),
               content: text.content || "",
               size: text.size,
               font: text.font,
               color: text.color,
               bold: normalizeStoredBoolean(text.bold),
               italic: normalizeStoredBoolean(text.italic),
               underline: normalizeStoredBoolean(text.underline),
               align: text.align,
               lineHeight: text.lineHeight
          });
     }
     if (isCalendarItem(item)) {
          if (isCalendarTextItem(item)) {
               item.dataset.dayNotes = JSON.stringify(widget.dayNotes || {});
               setCalendarDayTextSettings(item, {
                    size: widget.dayText?.size,
                    font: widget.dayText?.font,
                    color: widget.dayText?.color,
                    bold: normalizeStoredBoolean(widget.dayText?.bold),
                    italic: normalizeStoredBoolean(widget.dayText?.italic),
                    underline: normalizeStoredBoolean(widget.dayText?.underline),
                    align: widget.dayText?.align,
                    lineHeight: widget.dayText?.lineHeight
               });
          }
          setMiniCalSettings(item, {
               weekNumbers: normalizeStoredBoolean(widget.weekNumbers, "true"),
               weekStart: widget.weekStart,
               monthRows: widget.monthRows || (itemData.type === "mini-cal2" ? "2" : undefined),
               monthDisplay: widget.monthDisplay || "full",
               monthVisible: normalizeStoredBoolean(widget.monthVisible, "true"),
               month: widget.month !== undefined && widget.month !== null ? String(widget.month) : undefined,
               yearDisplay: widget.yearDisplay || (widget.yearVisible === false || widget.yearVisible === "false" ? "none" : undefined),
               yearVisible: normalizeStoredBoolean(widget.yearVisible, "true"),
               year: widget.year !== undefined && widget.year !== null ? String(widget.year) : undefined,
               startDay: widget.startDay !== undefined && widget.startDay !== null ? String(widget.startDay) : undefined,
               visibleDays: widget.visibleDays !== undefined && widget.visibleDays !== null ? String(widget.visibleDays) : undefined,
               timeIncrement: widget.timeIncrement !== undefined && widget.timeIncrement !== null ? String(widget.timeIncrement) : undefined,
               startTime: widget.startTime,
               timeFormat: widget.timeFormat,
               timeVisible: normalizeStoredBoolean(widget.timeVisible, "true"),
               shareWeekends: normalizeStoredBoolean(widget.shareWeekends)
          });
     }
     if (itemData.groupId) {
          item.dataset.groupId = itemData.groupId;
     }
}

function restorePlannerItem(itemData) {
     const type = normalizePlannerItemType(itemData.type || "sticky");
     const isPagePlacement = itemData.placement === "page" || itemData.page;

     if (!itemGridUnits[type]) {
          return null;
     }

     if (isPagePlacement && !isPageNumberAvailable(getStoredItemPageNumber(itemData))) {
          return null;
     }

     const item = makePlannerItem(type);

     plannerDesk.append(item);
     restorePlannerItemSettings(item, itemData);

     if (isPagePlacement) {
          const page = pages.find((plannerPage) => getPageId(plannerPage) === (itemData.page || "left")) || pages[0];
          const grid = getGridSize(page);
          const origin = getGridSnapOrigin(page);
          const storedGrid = getStoredItemGrid(itemData);
          const box = {
               x: origin.x + (storedGrid.x * grid.x),
               y: origin.y + (storedGrid.y * grid.y),
               width: storedGrid.width * grid.x,
               height: storedGrid.height * grid.y
          };

          markGridState(item, true, page);
          setItemBox(item, box);
          setItemSpreadIndex(item, Number(itemData.spreadIndex) || 0);
     } else {
          const deskRect = plannerDesk.getBoundingClientRect();
          const frame = itemData.frame || {};
          const fallback = itemData.type === "mini-cal2" ? getMiniCalGridUnits(item) : itemGridUnits[type] || itemGridUnits.sticky;
          const frameX = Number(frame.x);
          const frameY = Number(frame.y);
          const frameWidth = Number(frame.width);
          const frameHeight = Number(frame.height);
          const box = {
               x: (Number.isFinite(frameX) ? frameX : 0) * deskRect.width,
               y: (Number.isFinite(frameY) ? frameY : 0) * deskRect.height,
               width: Number.isFinite(frameWidth) && frameWidth > 0 ? frameWidth * deskRect.width : fallback.width * 12,
               height: Number.isFinite(frameHeight) && frameHeight > 0 ? frameHeight * deskRect.height : fallback.height * 12
          };

          markGridState(item, false);
          setItemBox(item, box);
     }

     return item;
}

function clearCurrentBookItems() {
     clearSelection();
     getAllPlannerItems().forEach((item) => {
          closeItemMenu(item);
          item.remove();
     });
     updateObjectControlsState();
}

function getStoredPageCount(book) {
     const items = Array.isArray(book?.items) ? book.items : [];
     const highestPageNumber = items.reduce((highest, item) => {
          if (item.placement !== "page" && !item.page) {
               return highest;
          }

          return Math.max(highest, getStoredItemPageNumber(item));
     }, -1);
     const storedPageCount = Number(book?.pageCount ?? book?.spread?.pageCount);
     const storedSpreadCount = Number(book?.spread?.count);
     const fallbackPageCount = Number.isFinite(storedPageCount) && storedPageCount > 0
          ? storedPageCount
          : (Number.isFinite(storedSpreadCount) && storedSpreadCount > 0 ? storedSpreadCount * 2 : initialNotebookPageCount);

     return normalizeNotebookPageCount(Math.max(fallbackPageCount, highestPageNumber + 1, minNotebookPageCount));
}

function restorePlannerBook(paperKey = plannerConfig.paperKey) {
     const book = getStoredBook(paperKey);

     isRestoringPlannerState = true;
     clearCurrentBookItems();
     setNotebookPageCount(getStoredPageCount(book));
     currentSpreadIndex = clamp(Number(book?.spread?.currentIndex) || 0, 0, notebookSpreadCount - 1);
     if (!isPageSideAvailable(getFocusedPageSide())) {
          viewFocusIndex = 0;
     }
     if (book && Array.isArray(book.items)) {
          book.items.forEach(restorePlannerItem);
     }
     isRestoringPlannerState = false;
     syncNextGroupId();
}

function syncNextGroupId() {
     const highestGroupId = getAllPlannerItems().reduce((highest, item) => {
          const match = item.dataset.groupId?.match(/^group-(\d+)$/);

          return match ? Math.max(highest, Number(match[1]) || 0) : highest;
     }, 0);

     nextGroupId = Math.max(nextGroupId, highestGroupId + 1);
}

function getClearPageSides() {
     const focus = viewFocusPoints[viewFocusIndex];

     if (focus === "left" || focus === "right") {
          return [focus];
     }

     return ["left", "right"];
}

function clearItems(items) {
     items.forEach((item) => {
          selectedItems.delete(item);
          closeItemMenu(item);
          item.remove();
     });
     selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     updateObjectControlsState();
}

function shiftPageItemsFromPage(startPageNumber, offset) {
     getAllPlannerItems().forEach((item) => {
          if (!item.dataset.pageId) {
               return;
          }

          const pageNumber = getItemPageNumber(item);

          if (pageNumber >= startPageNumber) {
               setItemPageNumber(item, pageNumber + offset);
          }
     });
}

function insertFocusedPage() {
     if (notebookPageCount >= maxNotebookPageCount) {
          return;
     }

     const insertPageNumber = clamp(getFocusedPageNumber(), 0, notebookPageCount);

     clearSelection();
     closeItemMenus();
     shiftPageItemsFromPage(insertPageNumber, 1);
     setNotebookPageCount(notebookPageCount + 1);
     setFocusedPageNumber(insertPageNumber);
     syncNotebookSpread();
     applyViewControls();
     notifyTemplateChanged();
}

function deleteFocusedPage() {
     const deletePageNumber = getFocusedPageNumber();

     if (notebookPageCount <= minNotebookPageCount || !isPageNumberAvailable(deletePageNumber)) {
          return;
     }

     const removedItems = [];

     clearSelection();
     closeItemMenus();
     getAllPlannerItems().forEach((item) => {
          if (!item.dataset.pageId) {
               return;
          }

          const pageNumber = getItemPageNumber(item);

          if (pageNumber === deletePageNumber) {
               removedItems.push(item);
          } else if (pageNumber > deletePageNumber) {
               setItemPageNumber(item, pageNumber - 1);
          }
     });
     clearItems(removedItems);
     setNotebookPageCount(notebookPageCount - 1);
     setFocusedPageNumber(Math.min(deletePageNumber, notebookPageCount - 1));
     syncNotebookSpread();
     applyViewControls();
     notifyTemplateChanged();
}

function clearFocusedPage() {
     const pageSides = new Set(getClearPageSides());
     const items = getAllPlannerItems().filter((item) => (
          item.dataset.pageId &&
          getItemSpreadIndex(item) === currentSpreadIndex &&
          pageSides.has(item.dataset.pageId)
     ));

     clearItems(items);
     notifyTemplateChanged();
}

function clearCurrentBook() {
     clearCurrentBookItems();
     notifyTemplateChanged();
}

function changePaperSetting() {
     const previousPaperKey = plannerConfig.paperKey;

     savePlannerBook(previousPaperKey);
     clearCurrentBookItems();
     plannerConfig = buildPlannerConfig();
     applyPlannerConfig();
     restorePlannerBook(plannerConfig.paperKey);
     syncNotebookSpread();
     applyViewControls();
     notifyTemplateChanged();
}

function notifyTemplateChanged() {
     savePlannerState();
     window.dispatchEvent(new CustomEvent("perfectplanner:templatechange", {
          detail: serializePlannerTemplate()
     }));
}

function getPageFromPoint(clientX, clientY) {
     return pages.find((page) => {
          const rect = page.getBoundingClientRect();

          return (
               clientX >= rect.left &&
               clientX <= rect.right &&
               clientY >= rect.top &&
               clientY <= rect.bottom
          );
     });
}

function getPageFromDraggedBox(item, clientX, clientY, offsetX, offsetY) {
     return pages.find((page) => {
          const box = getMovedBox(item, page, clientX, clientY, offsetX, offsetY, false);

          return hasRequiredGridOverlap(box, page);
     });
}

function snap(value, gridSize) {
     return Math.round(value / gridSize) * gridSize;
}

function clamp(value, min, max) {
     return Math.min(max, Math.max(min, value));
}

function boxesIntersect(first, second) {
     return !(
          first.x + first.width < second.x ||
          second.x + second.width < first.x ||
          first.y + first.height < second.y ||
          second.y + second.height < first.y
     );
}

function getDeskRelativeRect(element) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const rect = element.getBoundingClientRect();

     return {
          x: rect.left - deskRect.left,
          y: rect.top - deskRect.top,
          width: rect.width,
          height: rect.height
     };
}

function getDeskGrid() {
     const page = pages[0];
     const deskRect = plannerDesk.getBoundingClientRect();
     const pageRect = page.getBoundingClientRect();
     const grid = getGridSize(page);
     const squareGridSize = grid.x;

     return {
          x: squareGridSize,
          y: squareGridSize,
          originX: pageRect.left - deskRect.left,
          originY: pageRect.top - deskRect.top
     };
}

function getItemPage(item) {
     if (item.dataset.pageId) {
          if (getItemSpreadIndex(item) !== currentSpreadIndex) {
               return null;
          }
          return pages.find((page) => getPageId(page) === item.dataset.pageId) || null;
     }

     return item.closest("[data-page]");
}

function snapToGridOrigin(value, origin, gridSize) {
     return origin + snap(value - origin, gridSize);
}

function getItemBox(item) {
     return {
          x: Number(item.dataset.x) || 0,
          y: Number(item.dataset.y) || 0,
          width: Number(item.dataset.width) || item.offsetWidth,
          height: Number(item.dataset.height) || item.offsetHeight
     };
}

function refreshPageItemViews() {
     getPlannerItems().forEach((item) => {
          if (getItemPage(item)) {
               setItemBox(item, getItemBox(item));
               positionItemControls(item);
          }
     });
}

function setItemBox(item, box) {
     const page = getItemPage(item);
     const shouldScaleWithPage = page && item.parentElement === plannerDesk;
     const viewZoom = shouldScaleWithPage ? getViewZoom() : 1;

     item.dataset.x = String(box.x);
     item.dataset.y = String(box.y);
     item.dataset.width = String(box.width);
     item.dataset.height = String(box.height);
     item.style.transformOrigin = "top left";
     item.style.transform = shouldScaleWithPage ? `scale(${viewZoom})` : "";
     if (shouldScaleWithPage) {
          const deskRect = plannerDesk.getBoundingClientRect();
          const pageRect = page.getBoundingClientRect();

          item.style.left = `${pageRect.left - deskRect.left + (box.x * viewZoom)}px`;
          item.style.top = `${pageRect.top - deskRect.top + (box.y * viewZoom)}px`;
     } else {
          item.style.left = `${box.x}px`;
          item.style.top = `${box.y}px`;
     }
     item.style.width = `${box.width}px`;
     item.style.height = `${box.height}px`;
     updateStickyDotGrid(item, page, box);
     updateItemSizeLabel(item);
     if (item.dataset.itemType === "full-cal" || item.dataset.itemType === "weekly-vertical") {
          updateCalendarGridMetrics(item, page, box);
     }
     updateItemTextLineHeight(item);
     updateStickyTextOverflow(item);
     if (item.dataset.itemType === "weekly-vertical") {
          renderWeeklyVertical(item);
     }
     updateCalendarTextOverflow(item);
}

function updateStickyDotGrid(item, page, box) {
     if (item.dataset.itemType !== "sticky") {
          return;
     }

     if (!page) {
          item.style.setProperty("--sticky-dot-grid-size-x", `${box.width / stickyGridUnits}px`);
          item.style.setProperty("--sticky-dot-grid-size-y", `${box.height / stickyGridUnits}px`);
          item.style.setProperty("--sticky-dot-grid-offset-x", "0px");
          item.style.setProperty("--sticky-dot-grid-offset-y", "0px");
          return;
     }

     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const offsetX = (((box.x - origin.x) % grid.x) + grid.x) % grid.x;
     const offsetY = (((box.y - origin.y) % grid.y) + grid.y) % grid.y;

     item.style.setProperty("--sticky-dot-grid-size-x", `${grid.x}px`);
     item.style.setProperty("--sticky-dot-grid-size-y", `${grid.y}px`);
     item.style.setProperty("--sticky-dot-grid-offset-x", `${-offsetX}px`);
     item.style.setProperty("--sticky-dot-grid-offset-y", `${-offsetY}px`);
}

function updateCalendarGridMetrics(item, page, box) {
     if (item.dataset.itemType !== "full-cal" && item.dataset.itemType !== "weekly-vertical") {
          return;
     }

     const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
     const timeColumnUnits = item.dataset.itemType === "weekly-vertical" && item.dataset.timeVisible !== "false" ? 2 : 0;
     const columnUnits = item.dataset.itemType === "full-cal" ? 16 : (visibleDays * 2) + timeColumnUnits + 2;
     const rowUnits = item.dataset.itemType === "full-cal"
          ? 14
          : Math.max(1, Number(item.style.getPropertyValue("--weekly-row-count")) || 14);
     const fallbackCellWidth = box.width / columnUnits;
     const fallbackCellHeight = box.height / rowUnits;
     const grid = page ? getGridSize(page) : null;
     const cellWidth = grid ? grid.x : fallbackCellWidth;
     const cellHeight = grid ? grid.y : fallbackCellHeight;

     item.style.setProperty("--weekly-column-cell-width", `${cellWidth}px`);
     item.style.setProperty("--weekly-row-cell-height", `${cellHeight}px`);
}

function setItemStyle(item, style) {
     item.dataset.fillColor = style.fillColor || item.dataset.fillColor || "var(--paper-offwhite)";
     item.dataset.borderColor = style.borderColor || item.dataset.borderColor || "var(--color-gray4)";
     item.dataset.borderWidth = style.borderWidth || item.dataset.borderWidth || "1";
     item.dataset.dotGrid = style.dotGrid || item.dataset.dotGrid || "false";
     delete item.dataset.fillAlpha;
     delete item.dataset.borderAlpha;
     item.style.setProperty("--sticky-fill", item.dataset.fillColor);
     item.style.setProperty("--sticky-fill-opaque", item.dataset.fillColor === "transparent" ? "var(--paper-offwhite)" : item.dataset.fillColor);
     item.style.setProperty("--sticky-border-color", item.dataset.borderColor);
     item.style.setProperty("--sticky-border-size", `${item.dataset.borderWidth}px`);

     const controls = getItemControls(item) || item;
     const fillInput = controls.querySelector("[data-style-control='fill']");
     const fillSwatches = controls.querySelector("[data-style-swatches='fill']");
     const borderColorInput = controls.querySelector("[data-style-control='border-color']");
     const borderColorSwatches = controls.querySelector("[data-style-swatches='border-color']");
     const borderWidthSelect = controls.querySelector("[data-style-control='border-width']");
     const dotGridInput = controls.querySelector("[data-style-control='dot-grid']");

     if (fillInput) {
          setPaletteControlValue(fillInput, fillSwatches, item.dataset.fillColor);
     }

     if (borderColorInput) {
          setPaletteControlValue(borderColorInput, borderColorSwatches, item.dataset.borderColor);
     }

     if (borderWidthSelect) {
          borderWidthSelect.value = item.dataset.borderWidth;
     }

     if (dotGridInput) {
          dotGridInput.checked = item.dataset.dotGrid === "true";
     }

     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
}

function getStickyTextElement(item) {
     return item.querySelector(".sticky-text");
}

function updateItemTextLineHeight(item) {
     if (!item) {
          return;
     }

     if (item.dataset.itemType === "sticky") {
          const textElement = getStickyTextElement(item);

          if (textElement) {
               textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.textLineHeight);
          }
     }

     if (isCalendarTextItem(item)) {
          item.querySelectorAll(".calendar-day-text").forEach((textElement) => {
               textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.dayTextLineHeight);
          });
     }
}

function setStickyTextSettings(item, settings = {}) {
     if (item.dataset.itemType !== "sticky") {
          return;
     }

     const textElement = getStickyTextElement(item);
     const controls = getItemControls(item) || item;
     const isEnabled = settings.enabled ?? item.dataset.textEnabled ?? "false";

     item.dataset.textEnabled = String(isEnabled);
     item.dataset.textSize = settings.size || item.dataset.textSize || "10";
     item.dataset.textFont = settings.font || item.dataset.textFont || "noto";
     item.dataset.textColor = settings.color || item.dataset.textColor || "var(--color-gray1)";
     delete item.dataset.textAlpha;
     item.dataset.textBold = settings.bold ?? item.dataset.textBold ?? "false";
     item.dataset.textItalic = settings.italic ?? item.dataset.textItalic ?? "false";
     item.dataset.textUnderline = settings.underline ?? item.dataset.textUnderline ?? "false";
     item.dataset.textAlign = settings.align || item.dataset.textAlign || "left";
     item.dataset.textLineHeight = settings.lineHeight || item.dataset.textLineHeight || "1";

     if (textElement) {
          if (settings.content !== undefined) {
               textElement.textContent = settings.content;
          }

          textElement.hidden = item.dataset.textEnabled !== "true";
          textElement.style.fontSize = `${item.dataset.textSize}px`;
          textElement.style.color = item.dataset.textColor;
          textElement.style.fontFamily = getStickyTextFont(item.dataset.textFont);
          textElement.style.fontWeight = item.dataset.textBold === "true" ? "700" : "400";
          textElement.style.fontStyle = item.dataset.textItalic === "true" ? "italic" : "normal";
          textElement.style.textDecoration = item.dataset.textUnderline === "true" ? "underline" : "none";
          textElement.style.textAlign = item.dataset.textAlign;
          textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.textLineHeight);
     }

     const enabledInput = controls.querySelector("[data-text-control='enabled']");
     const sizeInput = controls.querySelector("[data-text-control='size']");
     const fontSelect = controls.querySelector("[data-text-control='font']");
     const colorInput = controls.querySelector("[data-text-control='color']");
     const colorSwatches = controls.querySelector("[data-text-swatches='color']");
     const boldInput = controls.querySelector("[data-text-control='bold']");
     const italicInput = controls.querySelector("[data-text-control='italic']");
     const underlineInput = controls.querySelector("[data-text-control='underline']");
     const alignSelect = controls.querySelector("[data-text-control='align']");
     const lineHeightSelect = controls.querySelector("[data-text-control='line-height']");

     if (enabledInput) {
          enabledInput.checked = item.dataset.textEnabled === "true";
     }

     if (sizeInput) {
          sizeInput.value = item.dataset.textSize;
     }

     if (fontSelect) {
          fontSelect.value = item.dataset.textFont;
     }

     if (colorInput) {
          setPaletteControlValue(colorInput, colorSwatches, item.dataset.textColor);
     }

     if (boldInput) {
          boldInput.checked = item.dataset.textBold === "true";
     }

     if (italicInput) {
          italicInput.checked = item.dataset.textItalic === "true";
     }

     if (underlineInput) {
          underlineInput.checked = item.dataset.textUnderline === "true";
     }

     if (alignSelect) {
          alignSelect.value = item.dataset.textAlign;
     }

     if (lineHeightSelect) {
          lineHeightSelect.value = item.dataset.textLineHeight;
     }

     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
     updateStickyTextOverflow(item);
}

function getStickyTextFont(fontKey) {
     const fonts = {
          noto: "var(--font-noto)",
          dancing: "var(--font-dancing)",
          sans: "Arial, Verdana, sans-serif",
          serif: "Georgia, serif"
     };

     return fonts[fontKey] || fonts.noto;
}

function updateStickyTextOverflow(item) {
     if (!item || item.dataset.itemType !== "sticky") {
          return;
     }

     const textElement = getStickyTextElement(item);

     if (!textElement || item.dataset.textEnabled !== "true") {
          item.dataset.textOverflow = "false";
          return;
     }

     requestAnimationFrame(() => {
          item.dataset.textOverflow = String(textElement.scrollHeight > textElement.clientHeight + 1);
     });
}

function updateTextEditingState() {
     plannerDesk.classList.toggle("is-editing-text", Boolean(document.querySelector(".planner-item.is-editing-text, .planner-item.is-editing-day-text")));
}

function stopStickyTextEditing(item) {
     const textElement = getStickyTextElement(item);

     if (!textElement) {
          return;
     }

     textElement.setAttribute("contenteditable", "false");
     item.classList.remove("is-editing-text");
     updateTextEditingState();
     updateStickyTextOverflow(item);
     notifyTemplateChanged();
}

function startStickyTextEditing(item) {
     if (item.dataset.itemType !== "sticky") {
          return;
     }

     const textElement = getStickyTextElement(item);

     if (!textElement) {
          return;
     }

     if (item.dataset.textEnabled !== "true") {
          setStickyTextSettings(item, {
               enabled: "true"
          });
     }

     item.classList.add("is-editing-text");
     textElement.hidden = false;
     textElement.setAttribute("contenteditable", "true");
     updateTextEditingState();

     requestAnimationFrame(() => {
          textElement.focus();

          const selection = window.getSelection();
          const range = document.createRange();

          range.selectNodeContents(textElement);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
     });
}

function getDeskBox(item, clientX, clientY, offsetX, offsetY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = getItemBox(item);

     return {
          ...current,
          x: clientX - deskRect.left - offsetX,
          y: clientY - deskRect.top - offsetY
     };
}

function getPageOverlap(box, page) {
     const overlapWidth = Math.max(0, Math.min(box.x + box.width, page.clientWidth) - Math.max(box.x, 0));
     const overlapHeight = Math.max(0, Math.min(box.y + box.height, page.clientHeight) - Math.max(box.y, 0));

     return {
          width: overlapWidth,
          height: overlapHeight
     };
}

function hasRequiredGridOverlap(box, page) {
     const grid = getGridSize(page);
     const overlap = getPageOverlap(box, page);
     const isOffLeft = box.x < 0;
     const isOffRight = box.x + box.width > page.clientWidth;
     const isOffTop = box.y < 0;
     const isOffBottom = box.y + box.height > page.clientHeight;
     const hasHorizontalDepth = isOffLeft || isOffRight ? overlap.width >= grid.x * pageStickDepth : true;
     const hasVerticalDepth = isOffTop || isOffBottom ? overlap.height >= grid.y * pageStickDepth : true;

     return overlap.width > 0 && overlap.height > 0 && hasHorizontalDepth && hasVerticalDepth;
}

function getGridSnappedSize(item, page) {
     const grid = getGridSize(page);
     const current = getItemBox(item);
     const units = getItemGridUnits(item);
     const fallbackSize = {
          width: grid.x * units.width,
          height: grid.y * units.height
     };

     if (item.classList.contains("is-floating-source")) {
          return fallbackSize;
     }

     return {
          width: current.width ? Math.round(current.width / grid.x) * grid.x : fallbackSize.width,
          height: current.height ? Math.round(current.height / grid.y) * grid.y : fallbackSize.height
     };
}

function getItemGridUnits(item) {
     if (item.dataset.itemType === "mini-cal") {
          return getMiniCalGridUnits(item);
     }

     if (item.dataset.itemType === "full-cal" || item.dataset.itemType === "weekly-vertical") {
          return {
               width: plannerConfig.gridColumns,
               height: plannerConfig.gridRows
          };
     }

     return itemGridUnits[item.dataset.itemType] || itemGridUnits.sticky;
}

function clearDragOver() {
     pages.forEach((page) => page.classList.remove("is-drag-over"));
}

function getItemControls(item) {
     return document.querySelector(`.item-controls[data-owner-id="${item.dataset.templateId}"]`);
}

function isCalendarItemType(type) {
     return type === "mini-cal" || type === "full-cal" || type === "weekly-vertical";
}

function isCalendarItem(item) {
     return isCalendarItemType(item.dataset.itemType);
}

function isCalendarTextItemType(type) {
     return type === "full-cal" || type === "weekly-vertical";
}

function isCalendarTextItem(item) {
     return isCalendarTextItemType(item.dataset.itemType);
}

function positionItemControls(item) {
     const controls = getItemControls(item);

     if (!controls || !controls.classList.contains("is-floating")) {
          return;
     }

     if (controls.classList.contains("is-actions-popup")) {
          return;
     }

     const itemRect = item.getBoundingClientRect();
     const deskRect = plannerDesk.getBoundingClientRect();
     const menuWidth = controls.offsetWidth || 148;
     const menuHeight = controls.offsetHeight || 0;
     const gap = 8;
     const preferRight = itemRect.right + gap + menuWidth <= deskRect.right;
     const left = preferRight
          ? itemRect.right - deskRect.left + gap
          : itemRect.left - deskRect.left - menuWidth - gap;
     const top = clamp(itemRect.top - deskRect.top, gap, Math.max(gap, deskRect.height - menuHeight - gap));

     controls.style.left = `${Math.max(gap, left)}px`;
     controls.style.top = `${top}px`;
}

function positionItemActionsPopup(controls, event) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const gap = 8;
     const menuWidth = controls.offsetWidth || 156;
     const menuHeight = controls.offsetHeight || 0;
     const x = clamp(event.clientX - deskRect.left, gap, Math.max(gap, deskRect.width - menuWidth - gap));
     const y = clamp(event.clientY - deskRect.top, gap, Math.max(gap, deskRect.height - menuHeight - gap));

     controls.style.left = `${x}px`;
     controls.style.top = `${y}px`;
}

function getSelectedOrGroupedActionItems(item) {
     if (selectedItems.has(item)) {
          return Array.from(selectedItems);
     }

     if (item.dataset.groupId) {
          return getPlannerItems().filter((plannerItem) => plannerItem.dataset.groupId === item.dataset.groupId);
     }

     return [item];
}

function itemsShareWidgetType(items) {
     if (items.length < 2) {
          return true;
     }

     const type = items[0]?.dataset.itemType;

     return Boolean(type) && items.every((item) => item.dataset.itemType === type);
}

function setControlsActionItems(controls, items) {
     controls.dataset.actionItemIds = items.map((item) => item.dataset.templateId).filter(Boolean).join(" ");
}

function clearControlsActionItems(controls) {
     delete controls.dataset.actionItemIds;
}

function getControlsActionItems(controls) {
     const ids = controls?.dataset.actionItemIds?.split(" ").filter(Boolean) || [];

     if (!ids.length) {
          return [];
     }

     const idSet = new Set(ids);

     return getPlannerItems().filter((item) => idSet.has(item.dataset.templateId));
}

function openItemMenu(item) {
     const controls = getItemControls(item);
     const actionItems = getSelectedOrGroupedActionItems(item);

     if (!controls || !objectControlsShell) {
          return;
     }

     if (!itemsShareWidgetType(actionItems)) {
          return;
     }

     closeItemMenu(item);
     closeItemMenus();
     objectControlsShell.append(controls);
     setControlsActionItems(controls, actionItems);
     controls.classList.remove("is-floating", "is-actions-popup");
     controls.classList.add("is-docked");
     setItemControlsTab(controls, "style");
     item.classList.add("is-menu-open");
     updateObjectControlsState();
     selectSettingsTab("style");
     openSidebar();
}

function openItemActionsPopup(item, event, actionItems = getSelectedOrGroupedActionItems(item)) {
     const controls = getItemControls(item);

     if (!controls) {
          return;
     }

     closeSidebar();
     closeItemMenus();
     plannerDesk.append(controls);
     setControlsActionItems(controls, actionItems);
     controls.classList.remove("is-docked");
     controls.classList.add("is-floating", "is-actions-popup");
     item.classList.add("is-menu-open");
     setItemControlsTab(controls, "actions");
     positionItemActionsPopup(controls, event);
     updateObjectControlsState();
}

function closeItemMenu(item) {
     const controls = getItemControls(item);

     item.classList.remove("is-menu-open");
     if (!controls) {
          return;
     }

     closeCustomSelects(controls);
     clearSelectFocus(controls);
     controls.classList.remove("is-floating", "is-docked", "is-actions-popup");
     controls.removeAttribute("style");
     clearControlsActionItems(controls);
     item.append(controls);
     updateObjectControlsState();
}

function getAllPlannerItems() {
     return Array.from(document.querySelectorAll(".planner-item:not(.is-floating-source)"));
}

function getPlannerItems() {
     return getAllPlannerItems().filter((item) => !item.classList.contains("is-spread-hidden"));
}

function clearItemSelectionClasses(item) {
     closeItemMenu(item);
     item.classList.remove("is-selected", "is-resizing", "is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");
}

function setItemSelected(item, isSelected) {
     item.classList.toggle("is-selected", isSelected);

     if (isSelected) {
          selectedItems.add(item);
          selectedItem = item;
          return;
     }

     selectedItems.delete(item);
     clearItemSelectionClasses(item);

     if (selectedItem === item) {
          selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     }
}

function selectItems(items) {
     clearSelection();
     items.forEach((item) => setItemSelected(item, true));
}

function selectItem(item, shouldAdd = false) {
     if (shouldAdd) {
          setItemSelected(item, !selectedItems.has(item));
          return;
     }

     if (item.dataset.groupId) {
          selectItems(getPlannerItems().filter((plannerItem) => plannerItem.dataset.groupId === item.dataset.groupId));
          selectedItem = item;
          return;
     }

     selectItems([item]);
}

function clearSelection() {
     selectedItems.forEach((item) => clearItemSelectionClasses(item));
     selectedItems = new Set();
     selectedItem = null;
}

function closeItemMenus(exceptItem = null) {
     document.querySelectorAll(".planner-item.is-menu-open").forEach((item) => {
          if (item !== exceptItem) {
               closeItemMenu(item);
          }
     });
}

function syncSelectionToActionItems(items, preferredItem = null) {
     const nextSelection = new Set(items);

     selectedItems.forEach((item) => {
          if (!nextSelection.has(item)) {
               item.classList.remove("is-selected", "is-resizing", "is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");
          }
     });
     items.forEach((item) => item.classList.add("is-selected"));
     selectedItems = nextSelection;
     selectedItem = preferredItem && nextSelection.has(preferredItem) ? preferredItem : items.at(-1) || null;
}

function groupItems(items, preferredItem = null) {
     if (items.length < 2) {
          return false;
     }

     const groupId = `group-${nextGroupId}`;
     nextGroupId += 1;
     items.forEach((item) => {
          item.dataset.groupId = groupId;
          setResizeCursor(item, "");
     });
     syncSelectionToActionItems(items, preferredItem);
     notifyTemplateChanged();
     return true;
}

function groupSelectedItems() {
     return groupItems(Array.from(selectedItems), selectedItem);
}

function ungroupItems(items) {
     const groupIds = new Set(items.map((item) => item.dataset.groupId).filter(Boolean));

     if (!groupIds.size) {
          return false;
     }

     getPlannerItems().forEach((item) => {
          if (groupIds.has(item.dataset.groupId)) {
               delete item.dataset.groupId;
          }
     });
     syncSelectionToActionItems(items.filter((item) => getPlannerItems().includes(item)), selectedItem);
     notifyTemplateChanged();
     return true;
}

function ungroupSelectedItems() {
     return ungroupItems(Array.from(selectedItems));
}

function itemsHaveGroup(items) {
     return items.some((item) => item.dataset.groupId);
}

function selectedItemsHaveGroup() {
     return itemsHaveGroup(Array.from(selectedItems));
}

function updateGroupButton(button, items = Array.from(selectedItems)) {
     const isGrouped = itemsHaveGroup(items);

     button.classList.toggle("is-grouped", isGrouped);
     button.textContent = isGrouped ? "Ungroup" : "Group";
     button.setAttribute("aria-label", isGrouped ? "Ungroup selected sticky notes" : "Group selected sticky notes");
}

function getActionItems(item) {
     const controlsActionItems = getControlsActionItems(getItemControls(item));

     if (controlsActionItems.length) {
          return controlsActionItems;
     }

     return getSelectedOrGroupedActionItems(item);
}

function moveActionItemsLayer(item, direction) {
     const actionItems = getActionItems(item);
     const actionSet = new Set(actionItems);
     const plannerItems = getPlannerItems();
     const orderedActionItems = plannerItems.filter((plannerItem) => actionSet.has(plannerItem));

     if (!orderedActionItems.length) {
          return;
     }

     const firstIndex = plannerItems.indexOf(orderedActionItems[0]);
     const lastIndex = plannerItems.indexOf(orderedActionItems.at(-1));

     if (direction === "forward") {
          const nextItem = plannerItems.slice(lastIndex + 1).find((plannerItem) => !actionSet.has(plannerItem));

          if (!nextItem) {
               return;
          }

          nextItem.after(...orderedActionItems);
     } else {
          const previousItem = plannerItems.slice(0, firstIndex).reverse().find((plannerItem) => !actionSet.has(plannerItem));

          if (!previousItem) {
               return;
          }

          previousItem.before(...orderedActionItems);
     }

     notifyTemplateChanged();
}

function applyStyleToActionItems(item, style) {
     getActionItems(item).forEach((targetItem) => setItemStyle(targetItem, style));
     notifyTemplateChanged();
}

function applyTextSettingsToActionItems(item, settings) {
     getActionItems(item).forEach((targetItem) => {
          if (isCalendarTextItem(targetItem)) {
               setCalendarDayTextSettings(targetItem, settings);
          } else {
               setStickyTextSettings(targetItem, settings);
          }
     });
     notifyTemplateChanged();
}

function applyMiniCalSettingsToActionItems(item, settings) {
     getActionItems(item).forEach((targetItem) => {
          if (isCalendarItem(targetItem)) {
               setMiniCalSettings(targetItem, settings);
          }
     });
     notifyTemplateChanged();
}

function setItemControlsTab(controls, tabName) {
     controls.querySelectorAll("[data-item-control-tab]").forEach((tab) => {
          const isActive = tab.dataset.itemControlTab === tabName;

          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
     });
     controls.querySelectorAll("[data-item-control-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.itemControlPanel !== tabName;
     });
}

function markGridState(item, isOnGrid, page = null) {
     item.classList.toggle("is-on-grid", isOnGrid);
     if (isOnGrid && page) {
          item.dataset.pageId = getPageId(page);
          setItemSpreadIndex(item);
          item.classList.remove("is-spread-hidden");
     } else if (!isOnGrid) {
          delete item.dataset.pageId;
          delete item.dataset.spreadIndex;
          item.classList.remove("is-spread-hidden");
     }
}

function markSnapReady(item, isSnapReady) {
     item.classList.toggle("is-snap-ready", isSnapReady);
}

function getResizeMode(item, event) {
     if (item !== selectedItem) {
          return "";
     }

     if (item.dataset.groupId) {
          return "";
     }

     const rect = item.getBoundingClientRect();
     const isLeftEdge = event.clientX >= rect.left - resizeEdgeSize && event.clientX <= rect.left + resizeEdgeSize;
     const isRightEdge = event.clientX >= rect.right - resizeEdgeSize && event.clientX <= rect.right + resizeEdgeSize;
     const isTopEdge = event.clientY >= rect.top - resizeEdgeSize && event.clientY <= rect.top + resizeEdgeSize;
     const isBottomEdge = event.clientY >= rect.bottom - resizeEdgeSize && event.clientY <= rect.bottom + resizeEdgeSize;

     if (isLeftEdge && isTopEdge) {
          return "top-left";
     }

     if (isRightEdge && isTopEdge) {
          return "top-right";
     }

     if (isLeftEdge && isBottomEdge) {
          return "bottom-left";
     }

     if (isRightEdge && isBottomEdge) {
          return "bottom-right";
     }

     if (isLeftEdge) {
          return "left";
     }

     if (isRightEdge) {
          return "right";
     }

     if (isTopEdge) {
          return "top";
     }

     if (isBottomEdge) {
          return "bottom";
     }

     return "";
}

function getMovedBox(item, page, clientX, clientY, offsetX, offsetY, shouldClamp = true) {
     const pageRect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();
     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const current = getItemBox(item);
     const rawX = (clientX - pageRect.left - offsetX) / viewZoom;
     const rawY = (clientY - pageRect.top - offsetY) / viewZoom;
     const nextX = shouldClamp ? snapToGridOrigin(rawX, origin.x, grid.x) : rawX;
     const nextY = shouldClamp ? snapToGridOrigin(rawY, origin.y, grid.y) : rawY;
     const minX = grid.x * pageStickDepth - current.width;
     const minY = grid.y * pageStickDepth - current.height;
     const maxX = (pageRect.width / viewZoom) - grid.x * pageStickDepth;
     const maxY = (pageRect.height / viewZoom) - grid.y * pageStickDepth;

     return {
          ...current,
          x: shouldClamp ? clamp(nextX, minX, maxX) : nextX,
          y: shouldClamp ? clamp(nextY, minY, maxY) : nextY
     };
}

function getResizedBox(item, page, clientX, clientY, mode) {
     const current = getItemBox(item);
     const resizeLeft = mode.includes("left");
     const resizeRight = mode.includes("right");
     const resizeTop = mode.includes("top");
     const resizeBottom = mode.includes("bottom");

     if (!page) {
          const parentRect = item.parentElement.getBoundingClientRect();
          const minSize = 24;
          const right = current.x + current.width;
          const bottom = current.y + current.height;
          const pointerX = clientX - parentRect.left;
          const pointerY = clientY - parentRect.top;
          const nextLeft = resizeLeft ? Math.min(pointerX, right - minSize) : current.x;
          const nextTop = resizeTop ? Math.min(pointerY, bottom - minSize) : current.y;
          const nextRight = resizeRight ? Math.max(pointerX, current.x + minSize) : right;
          const nextBottom = resizeBottom ? Math.max(pointerY, current.y + minSize) : bottom;

          return {
               ...current,
               x: nextLeft,
               y: nextTop,
               width: nextRight - nextLeft,
               height: nextBottom - nextTop
          };
     }

     const pageRect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();
     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const minGridWidth = item.dataset.itemType === "full-cal" || item.dataset.itemType === "weekly-vertical" ? 16 : 2;
     const minGridHeight = item.dataset.itemType === "full-cal" || item.dataset.itemType === "weekly-vertical" ? 14 : 2;
     const minWidth = grid.x * minGridWidth;
     const minHeight = grid.y * minGridHeight;
     const right = current.x + current.width;
     const bottom = current.y + current.height;
     const pointerX = snapToGridOrigin((clientX - pageRect.left) / viewZoom, origin.x, grid.x);
     const pointerY = snapToGridOrigin((clientY - pageRect.top) / viewZoom, origin.y, grid.y);
     const nextLeft = resizeLeft ? clamp(pointerX, grid.x * pageStickDepth - current.width, right - minWidth) : current.x;
     const nextTop = resizeTop ? clamp(pointerY, grid.y * pageStickDepth - current.height, bottom - minHeight) : current.y;
     const nextRight = resizeRight ? clamp(pointerX, current.x + minWidth, (pageRect.width / viewZoom) - grid.x * pageStickDepth + current.width) : right;
     const nextBottom = resizeBottom ? clamp(pointerY, current.y + minHeight, (pageRect.height / viewZoom) - grid.y * pageStickDepth + current.height) : bottom;

     return {
          ...current,
          x: nextLeft,
          y: nextTop,
          width: nextRight - nextLeft,
          height: nextBottom - nextTop
     };
}

function getResizeClass(resizeMode) {
     if (resizeMode === "left" || resizeMode === "right") {
          return "is-resize-ew";
     }

     if (resizeMode === "top" || resizeMode === "bottom") {
          return "is-resize-ns";
     }

     if (resizeMode === "top-left" || resizeMode === "bottom-right") {
          return "is-resize-nwse";
     }

     if (resizeMode === "top-right" || resizeMode === "bottom-left") {
          return "is-resize-nesw";
     }

     return "";
}

function getResizeCursorValue(resizeMode) {
     if (resizeMode === "left" || resizeMode === "right") {
          return "ew-resize";
     }

     if (resizeMode === "top" || resizeMode === "bottom") {
          return "ns-resize";
     }

     if (resizeMode === "top-left" || resizeMode === "bottom-right") {
          return "nwse-resize";
     }

     if (resizeMode === "top-right" || resizeMode === "bottom-left") {
          return "nesw-resize";
     }

     return "";
}

function setResizeCursor(item, resizeMode) {
     item.classList.remove("is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");

     const resizeClass = getResizeClass(resizeMode);

     if (resizeClass) {
          item.classList.add(resizeClass);
     }
}

function updateDeskResizeCursor(event) {
     if (activeAction || !selectedItem || event.target.closest(".planner-settings, .item-controls, .page-snap-controls")) {
          plannerDesk.style.cursor = "";
          if (selectedItem) {
               setResizeCursor(selectedItem, "");
          }
          return;
     }

     const resizeMode = getResizeMode(selectedItem, event);

     setResizeCursor(selectedItem, resizeMode);
     plannerDesk.style.cursor = getResizeCursorValue(resizeMode);
}

function getSidebarBox() {
     const deskRect = plannerDesk.getBoundingClientRect();
     const rect = plannerSettings.getBoundingClientRect();
     const width = rect.width;
     const height = Number(plannerSettings.dataset.height) || rect.height;
     const centerX = Number(plannerSettings.dataset.centerX) || getSidebarCenter(width);

     return {
          x: centerX - width / 2,
          y: deskRect.height - height,
          centerX,
          width,
          height
     };
}

function setSidebarBox(box) {
     plannerSettings.dataset.height = String(box.height);
     plannerSettings.dataset.centerX = String(box.centerX);
     plannerSettings.style.left = `${box.centerX}px`;
     plannerSettings.style.height = `${box.height}px`;
}

function getMovedSidebarBox(clientX, clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const rawX = clientX - deskRect.left - activeAction.offsetX;
     const minX = 12;
     const maxX = deskRect.width - current.width - 12;
     const x = clamp(rawX, minX, maxX);

     return {
          ...current,
          x,
          centerX: x + current.width / 2
     };
}

function getSidebarVerticalResizeMode(event) {
     const rect = plannerSettings.getBoundingClientRect();
     const isTopEdge = event.clientY >= rect.top - resizeEdgeSize && event.clientY <= rect.top + resizeEdgeSize;

     if (isTopEdge) {
          return "top";
     }

     return "";
}

function getSidebarHeightBounds() {
     const pageRect = pages[0].getBoundingClientRect();
     const notebookRect = notebook.getBoundingClientRect();
     const deskRect = plannerDesk.getBoundingClientRect();
     const measuredHeight = Math.max(pageRect.height, notebookRect.height);
     const fullHeight = measuredHeight > 220 ? measuredHeight : deskRect.height * 0.68;
     const gridRowHeight = Math.max(fullHeight / plannerConfig.gridRows, 8);
     const maxHeight = Math.max(300, Math.min(fullHeight, deskRect.height * 0.78));

     return {
          min: Math.min(300, maxHeight),
          max: maxHeight,
          grid: gridRowHeight
     };
}

function getResizedSidebarBox(clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const bounds = getSidebarHeightBounds();
     const bottom = deskRect.height;
     const pointerY = snap(clientY - deskRect.top, bounds.grid);

     const nextTop = clamp(pointerY, bottom - bounds.max, bottom - bounds.min);

     return {
          ...current,
          y: nextTop,
          height: bottom - nextTop
     };
}

function startSidebarMove(event) {
     const tab = event.target.closest("[data-settings-tab]");

     if (event.button !== 0 || !tab || tab.getAttribute("aria-selected") !== "true") {
          return;
     }

     const box = getSidebarBox();
     const rect = plannerSettings.getBoundingClientRect();

     setSidebarBox(box);
     activeAction = {
          type: "sidebar-move",
          box,
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top,
          hasMoved: false
     };
     plannerSettings.classList.add("is-dragging");

     try {
          plannerSettings.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startSidebarResize(event, mode) {
     const box = getSidebarBox();

     event.preventDefault();
     setSidebarBox(box);
     activeAction = {
          type: "sidebar-resize",
          box,
          mode
     };
     plannerSettings.classList.add("is-resizing");

     try {
          plannerSettings.setPointerCapture(event.pointerId);
     } catch {
     }
}

function updateItemSizeLabel(item) {
     const label = item.querySelector(".item-size-label");

     if (!label) {
          return;
     }

     const page = getItemPage(item);
     const box = getItemBox(item);
     const width = page ? Math.round(box.width / getGridSize(page).x) : Math.round(box.width);
     const height = page ? Math.round(box.height / getGridSize(page).y) : Math.round(box.height);

     label.textContent = `${width} x ${height}`;
}

function getWeekStartDate(date, weekStart) {
     const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
     const offset = weekStart === "monday"
          ? (nextDate.getDay() + 6) % 7
          : nextDate.getDay();

     nextDate.setDate(nextDate.getDate() - offset);
     return nextDate;
}

function getCalendarWeekNumber(date, weekStart) {
     if (weekStart === "monday") {
          const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const day = nextDate.getDay() || 7;

          nextDate.setDate(nextDate.getDate() + 4 - day);

          const yearStart = new Date(nextDate.getFullYear(), 0, 1);

          return Math.ceil((((nextDate - yearStart) / 86400000) + 1) / 7);
     }

     const weekStartDate = getWeekStartDate(date, weekStart);
     const yearStart = getWeekStartDate(new Date(weekStartDate.getFullYear(), 0, 1), weekStart);

     return Math.floor((weekStartDate - yearStart) / 604800000) + 1;
}

function getCalendarDayNotes(item) {
     try {
          return JSON.parse(item.dataset.dayNotes || "{}");
     } catch {
          return {};
     }
}

function setCalendarDayNote(item, dayKey, value) {
     const notes = getCalendarDayNotes(item);
     const nextValue = value.trim();

     if (nextValue) {
          notes[dayKey] = nextValue;
     } else {
          delete notes[dayKey];
     }

     item.dataset.dayNotes = JSON.stringify(notes);
}

function setCalendarDayTextSettings(item, settings = {}) {
     if (!isCalendarTextItem(item)) {
          return;
     }

     const controls = getItemControls(item) || item;

     item.dataset.dayTextSize = settings.size || item.dataset.dayTextSize || "10";
     item.dataset.dayTextFont = settings.font || item.dataset.dayTextFont || "noto";
     item.dataset.dayTextColor = settings.color || item.dataset.dayTextColor || "var(--color-gray1)";
     delete item.dataset.dayTextAlpha;
     item.dataset.dayTextBold = settings.bold ?? item.dataset.dayTextBold ?? "false";
     item.dataset.dayTextItalic = settings.italic ?? item.dataset.dayTextItalic ?? "false";
     item.dataset.dayTextUnderline = settings.underline ?? item.dataset.dayTextUnderline ?? "false";
     item.dataset.dayTextAlign = settings.align || item.dataset.dayTextAlign || "left";
     item.dataset.dayTextLineHeight = settings.lineHeight || item.dataset.dayTextLineHeight || "1";

     item.querySelectorAll(".calendar-day-text").forEach((textElement) => {
          applyCalendarDayTextStyle(item, textElement);
          updateCalendarDayTextOverflow(textElement);
     });

     const sizeInput = controls.querySelector("[data-text-control='size']");
     const fontSelect = controls.querySelector("[data-text-control='font']");
     const colorInput = controls.querySelector("[data-text-control='color']");
     const colorSwatches = controls.querySelector("[data-text-swatches='color']");
     const boldInput = controls.querySelector("[data-text-control='bold']");
     const italicInput = controls.querySelector("[data-text-control='italic']");
     const underlineInput = controls.querySelector("[data-text-control='underline']");
     const alignSelect = controls.querySelector("[data-text-control='align']");
     const lineHeightSelect = controls.querySelector("[data-text-control='line-height']");

     if (sizeInput) {
          sizeInput.value = item.dataset.dayTextSize;
     }

     if (fontSelect) {
          fontSelect.value = item.dataset.dayTextFont;
     }

     if (colorInput) {
          setPaletteControlValue(colorInput, colorSwatches, item.dataset.dayTextColor);
     }

     if (boldInput) {
          boldInput.checked = item.dataset.dayTextBold === "true";
     }

     if (italicInput) {
          italicInput.checked = item.dataset.dayTextItalic === "true";
     }

     if (underlineInput) {
          underlineInput.checked = item.dataset.dayTextUnderline === "true";
     }

     if (alignSelect) {
          alignSelect.value = item.dataset.dayTextAlign;
     }

     if (lineHeightSelect) {
          lineHeightSelect.value = item.dataset.dayTextLineHeight;
     }

     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
}

function applyCalendarDayTextStyle(item, textElement) {
     textElement.style.fontSize = `${item.dataset.dayTextSize || "10"}px`;
     textElement.style.color = item.dataset.dayTextColor || "var(--color-gray1)";
     textElement.style.fontFamily = getStickyTextFont(item.dataset.dayTextFont || "noto");
     textElement.style.fontWeight = item.dataset.dayTextBold === "true" ? "700" : "400";
     textElement.style.fontStyle = item.dataset.dayTextItalic === "true" ? "italic" : "normal";
     textElement.style.textDecoration = item.dataset.dayTextUnderline === "true" ? "underline" : "none";
     textElement.style.textAlign = item.dataset.dayTextAlign || "left";
     textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.dayTextLineHeight);
}

function updateCalendarDayTextOverflow(textElement) {
     const cell = textElement.closest(".dayCell");
     const item = textElement.closest(".planner-item-full-cal, .planner-item-weekly-vertical");

     if (!cell || !item) {
          return;
     }

     requestAnimationFrame(() => {
          cell.dataset.textOverflow = String(textElement.scrollHeight > textElement.clientHeight + 1);
     });
}

function updateCalendarTextOverflow(item) {
     if (!item || !isCalendarTextItem(item)) {
          return;
     }

     item.querySelectorAll(".calendar-day-text").forEach((textElement) => updateCalendarDayTextOverflow(textElement));
}

function getCalendarDayKey(year, month, dayNumber) {
     return `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
}

function getTodayCalendarDayKey() {
     const today = new Date();

     return getCalendarDayKey(today.getFullYear(), today.getMonth(), today.getDate());
}

function hasCalendarDayKey(dayKeys, targetDayKey) {
     const keys = Array.isArray(dayKeys) ? dayKeys : String(dayKeys).split(/[,+]/);

     return keys.some((key) => key.split("T")[0] === targetDayKey);
}

function markCurrentCalendarDay(cell, dayKeys, todayKey = getTodayCalendarDayKey()) {
     const isCurrentDay = hasCalendarDayKey(dayKeys, todayKey);

     cell.classList.toggle("calendar-current-day", isCurrentDay);
     if (isCurrentDay) {
          cell.dataset.currentDay = "true";
     } else {
          delete cell.dataset.currentDay;
     }
}

function markCurrentCalendarDayNumber(element, dayKey, todayKey = getTodayCalendarDayKey()) {
     element.classList.toggle("calendar-current-day-number", dayKey === todayKey);
}

function getCalendarDaysInMonth(year, month) {
     return new Date(year, month + 1, 0).getDate();
}

function getWeeklySlotKey(date, totalMinutes) {
     return `${getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())}T${formatMinutesAsTime(totalMinutes)}`;
}

function getWeeklyViewStartDate(item) {
     const month = Number(item.dataset.month) || 0;
     const year = Number(item.dataset.year) || new Date().getFullYear();
     const startDay = clamp(Number(item.dataset.startDay) || 1, 1, getCalendarDaysInMonth(year, month));

     return new Date(year, month, startDay);
}

function parseTimeValue(value) {
     const [hour = "0", minute = "0"] = String(value || "00:00").split(":");

     return (Number(hour) * 60) + Number(minute);
}

function formatMinutesAsTime(totalMinutes) {
     const dayMinutes = 24 * 60;
     const normalizedMinutes = ((totalMinutes % dayMinutes) + dayMinutes) % dayMinutes;
     const hour = Math.floor(normalizedMinutes / 60);
     const minute = normalizedMinutes % 60;

     return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatWeeklyTimeLabel(totalMinutes, format = "24") {
     const dayMinutes = 24 * 60;
     const normalizedMinutes = ((totalMinutes % dayMinutes) + dayMinutes) % dayMinutes;
     const hour = Math.floor(normalizedMinutes / 60);
     const minute = normalizedMinutes % 60;
     const period = hour < 12 ? "a" : "p";
     const hour12 = hour % 12 || 12;

     if (format === "compact") {
          return minute === 0 ? `${hour12}${period}` : `${hour12}:${String(minute).padStart(2, "0")}${period}`;
     }

     if (format === "ampm") {
          return `${hour12}:${String(minute).padStart(2, "0")} ${period}m`;
     }

     return `${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}`;
}

function getWeeklyVisibleSlotCount(item) {
     const page = getItemPage(item);
     const timeIncrement = Number(item.dataset.timeIncrement) || 30;
     const startMinutes = parseTimeValue(item.dataset.startTime || "00:00");
     const maxSlotCount = Math.max(1, Math.ceil(((24 * 60) - startMinutes) / timeIncrement));

     if (!page) {
          return maxSlotCount;
     }

     const grid = getGridSize(page);
     const box = getItemBox(item);
     const rowCount = Math.max(1, Math.floor(box.height / grid.y));

     return clamp(rowCount - 2, 1, maxSlotCount);
}

function shouldShowWeeklyTimeLabel(totalMinutes, timeIncrement) {
     const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);

     if (timeIncrement === 15) {
          return normalizedMinutes % 30 === 0;
     }

     if (timeIncrement === 30) {
          return normalizedMinutes % 60 === 0;
     }

     return true;
}

function getWeeklyDisplayColumns(startDate, visibleDays, shouldShareWeekends) {
     const dates = Array.from({
          length: visibleDays
     }, (_, index) => {
          const date = new Date(startDate);

          date.setDate(startDate.getDate() + index);
          return date;
     });
     const columns = [];

     for (let index = 0; index < dates.length; index += 1) {
          const date = dates[index];
          const nextDate = dates[index + 1];

          if (shouldShareWeekends && date.getDay() === 6 && nextDate && nextDate.getDay() === 0) {
               columns.push({
                    type: "shared-weekend",
                    dates: [date, nextDate]
               });
               index += 1;
          } else {
               columns.push({
                    type: "day",
                    dates: [date]
               });
          }
     }

     return columns;
}

function getCalendarWeekName(weekIndex, month, year) {
     const ordinals = ["First", "Second", "Third", "Fourth", "Fifth", "Last"];
     const weekLabel = ordinals[Math.min(weekIndex - 1, ordinals.length - 1)];

     return `${weekLabel} week of ${calendarMonthNames[month]} ${year}`;
}

function startCalendarDayTextEditing(textElement, item) {
     textElement.setAttribute("contenteditable", "true");
     item.classList.add("is-editing-day-text");
     updateTextEditingState();

     requestAnimationFrame(() => {
          textElement.focus();

          const selection = window.getSelection();
          const range = document.createRange();

          range.selectNodeContents(textElement);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
     });

     textElement.addEventListener("blur", () => {
          textElement.setAttribute("contenteditable", "false");
          item.classList.remove("is-editing-day-text");
          updateTextEditingState();
          setCalendarDayNote(item, textElement.dataset.dayKey, textElement.textContent || "");
          updateCalendarDayTextOverflow(textElement);
          notifyTemplateChanged();
     }, {
          once: true
     });
}

function getCalendarMonthTitle(month, display = "full") {
     if (display === "number") {
          return String(month + 1);
     }

     if (display === "short") {
          return calendarMonthNames[month].slice(0, 3);
     }

     return calendarMonthNames[month];
}

function getCalendarYearTitle(year, display = "full") {
     if (display === "none") {
          return "";
     }

     if (display === "short") {
          return String(year).slice(-2);
     }

     return String(year);
}

function renderMiniCal(item) {
     if (item.dataset.itemType === "weekly-vertical") {
          renderWeeklyVertical(item);
          return;
     }

     let calendar = item.querySelector(".mini-cal");
     const weekNumbersEnabled = item.dataset.weekNumbers !== "false";
     const weekStart = item.dataset.weekStart || "monday";
     const monthDisplay = item.dataset.monthDisplay || "full";
     const yearDisplay = item.dataset.yearDisplay || (item.dataset.yearVisible === "false" ? "none" : "full");
     const month = Number(item.dataset.month) || 0;
     const year = Number(item.dataset.year) || new Date().getFullYear();
     const titleMonthText = getCalendarMonthTitle(month, monthDisplay);
     const titleYearText = getCalendarYearTitle(year, yearDisplay);
     const monthVisible = titleMonthText !== "";
     const yearVisible = titleYearText !== "";
     const titleVisible = monthVisible || yearVisible;
     const firstDay = new Date(year, month, 1);
     const daysInMonth = new Date(year, month + 1, 0).getDate();
     const firstDayOffset = weekStart === "monday"
          ? (firstDay.getDay() + 6) % 7
          : firstDay.getDay();
     const dayLabels = weekStart === "monday"
          ? ["M", "T", "W", "T", "F", "S", "S"]
          : ["S", "M", "T", "W", "T", "F", "S"];
     const weekendIndexes = weekStart === "monday" ? [5, 6] : [0, 6];
     const hasDayText = isCalendarTextItem(item);
     const dayNotes = hasDayText ? getCalendarDayNotes(item) : {};
     const todayKey = getTodayCalendarDayKey();
     const weekRows = Array.from({
          length: 6
     }, (_, weekIndex) => weekIndex).filter((weekIndex) => {
          const weekStartDayNumber = (weekIndex * 7) + 1 - firstDayOffset;

          return weekStartDayNumber <= daysInMonth && weekStartDayNumber + 6 >= 1;
     });
     const calendarRows = [
          ...(titleVisible ? [0] : []),
          1,
          ...weekRows.map((weekIndex) => weekIndex + 2)
     ];
     const hasTallMonthRow = item.dataset.itemType === "mini-cal" && item.dataset.monthRows === "2" && titleVisible;
     const usesExpandedCalendarUnits = item.dataset.itemType === "full-cal";
     const titleRowUnits = hasTallMonthRow ? 2 : 1;
     const weekRowUnits = usesExpandedCalendarUnits ? 2 : 1;
     const visibleColumnCount = 8;
     const visibleRowCount = calendarRows.length;
     const visibleColumnUnits = usesExpandedCalendarUnits ? 16 : 8;
     const visibleRowUnits = (titleVisible ? titleRowUnits : 0) + 1 + (weekRows.length * weekRowUnits);

     if (!calendar) {
          calendar = document.createElement("div");
          calendar.className = "mini-cal";
          item.append(calendar);
     }

     calendar.replaceChildren();
     calendar.classList.toggle("has-week-numbers", weekNumbersEnabled);
     calendar.classList.toggle("has-title-row", titleVisible);
     calendar.classList.toggle("no-title-row", !titleVisible);
     calendar.classList.toggle("has-tall-month-row", hasTallMonthRow);
     calendar.style.setProperty("--mini-cal-visible-columns", String(visibleColumnCount));
     calendar.style.setProperty("--mini-cal-visible-rows", String(visibleRowCount));
     calendar.style.setProperty("--mini-cal-visible-column-units", String(visibleColumnUnits));
     calendar.style.setProperty("--mini-cal-visible-row-units", String(visibleRowUnits));
     for (let row = 0; row < calendarRows.length; row += 1) {
          const calendarRow = calendarRows[row];
          const displayRow = row + 1;

          for (let column = 0; column < 8; column += 1) {
               if (!weekNumbersEnabled && column === 0) {
                    continue;
               }

               const cell = document.createElement("span");
               const dayIndex = column - 1;
               const isTitleCell = calendarRow === 0 && column === 1;
               const displayColumn = column + 1;

               cell.className = "mini-cal-cell";
               cell.style.gridRow = String(displayRow);
               cell.style.gridColumn = isTitleCell
                    ? "2 / span 7"
                    : String(displayColumn);

               if (calendarRow === 0) {
                    if (isTitleCell) {
                         const titleYear = document.createElement("span");
                         const titleMonth = document.createElement("span");

                         cell.classList.add("mini-cal-month", (month + 1) % 2 === 1 ? "monthOdd" : "monthEven");
                         titleYear.textContent = titleYearText;
                         titleMonth.textContent = titleMonthText;
                         titleYear.hidden = !yearVisible;
                         titleMonth.hidden = !monthVisible;
                         cell.classList.toggle("has-title-pair", monthVisible && yearVisible);
                         cell.append(titleMonth, titleYear);
                    } else {
                         continue;
                    }
               } else if (column === 0) {
                    cell.classList.add("mini-cal-week");
                    if (calendarRow === 1) {
                         continue;
                    } else {
                         const weekDate = new Date(year, month, 1 - firstDayOffset + ((calendarRow - 2) * 7));
                         const weekNumberLabel = document.createElement("span");

                         cell.classList.add("weekName", "weekNumberCell");
                         cell.dataset.weekName = getCalendarWeekName(calendarRow - 1, month, year);
                         cell.title = cell.dataset.weekName;
                         weekNumberLabel.className = "weekNumber";
                         weekNumberLabel.textContent = String(getCalendarWeekNumber(weekDate, weekStart));
                         cell.append(weekNumberLabel);
                    }
               } else if (calendarRow === 1) {
                    cell.classList.add("mini-cal-day-name", "dayName");
                    cell.textContent = dayLabels[dayIndex];
                    if (weekendIndexes.includes(dayIndex)) {
                         cell.classList.add("mini-cal-weekend");
                    }
               } else {
                    const dayNumber = ((calendarRow - 2) * 7) + column - firstDayOffset;

                    if (weekendIndexes.includes(dayIndex)) {
                         cell.classList.add("mini-cal-weekend");
                    }
                    if (dayNumber >= 1 && dayNumber <= daysInMonth) {
                         const dayNumberLabel = document.createElement("span");
                         const dayKey = getCalendarDayKey(year, month, dayNumber);

                         cell.classList.add("dayCell");
                         cell.dataset.dayKey = dayKey;
                         markCurrentCalendarDay(cell, dayKey, todayKey);
                         dayNumberLabel.className = "mini-cal-day-number dayNumber";
                         markCurrentCalendarDayNumber(dayNumberLabel, dayKey, todayKey);
                         dayNumberLabel.textContent = String(dayNumber);
                         cell.addEventListener("pointerdown", (event) => {
                              if (getResizeMode(item, event)) {
                                   return;
                              }

                              event.stopPropagation();
                              selectItem(item);
                         });
                         cell.append(dayNumberLabel);
                         if (hasDayText) {
                              const dayText = document.createElement("div");

                              dayText.className = "calendar-day-text";
                              dayText.dataset.dayKey = dayKey;
                              dayText.setAttribute("contenteditable", "false");
                              dayText.textContent = dayNotes[dayKey] || "";
                              applyCalendarDayTextStyle(item, dayText);
                              dayText.addEventListener("input", () => updateCalendarDayTextOverflow(dayText));
                              dayText.addEventListener("dblclick", (event) => {
                                   event.preventDefault();
                                   event.stopPropagation();
                                   startCalendarDayTextEditing(dayText, item);
                              });
                              dayText.addEventListener("pointerdown", (event) => {
                                   if (dayText.isContentEditable) {
                                        event.stopPropagation();
                                   }
                              });
                              dayText.addEventListener("wheel", (event) => {
                                   if (dayText.isContentEditable) {
                                        event.stopPropagation();
                                   }
                              });
                              cell.addEventListener("dblclick", (event) => {
                                   event.preventDefault();
                                   event.stopPropagation();
                                   startCalendarDayTextEditing(dayText, item);
                              });
                              cell.append(dayText);
                              updateCalendarDayTextOverflow(dayText);
                         }
                    }
               }
               if (column === 7) {
                    cell.classList.add("mini-cal-edge-right");
               }
               if (row === calendarRows.length - 1) {
                    cell.classList.add("mini-cal-edge-bottom");
               }

               calendar.append(cell);
          }
     }
}

function renderWeeklyVertical(item) {
     let calendar = item.querySelector(".weekly-vertical");
     const weekNumbersEnabled = item.dataset.weekNumbers !== "false";
     const weekStart = item.dataset.weekStart || "monday";
     const monthDisplay = item.dataset.monthDisplay || "full";
     const yearDisplay = item.dataset.yearDisplay || (item.dataset.yearVisible === "false" ? "none" : "full");
     const month = Number(item.dataset.month) || 0;
     const year = Number(item.dataset.year) || new Date().getFullYear();
     const titleMonthText = getCalendarMonthTitle(month, monthDisplay);
     const titleYearText = getCalendarYearTitle(year, yearDisplay);
     const monthVisible = titleMonthText !== "";
     const yearVisible = titleYearText !== "";
     const visibleDays = clamp(Number(item.dataset.visibleDays) || 7, 1, 7);
     const timeIncrement = Number(item.dataset.timeIncrement) || 30;
     const startTime = item.dataset.startTime || "00:00";
     const timeFormat = item.dataset.timeFormat || "24";
     const timeVisible = item.dataset.timeVisible !== "false";
     const shareWeekends = item.dataset.shareWeekends === "true";
     const startMinutes = parseTimeValue(startTime);
     const slotCount = getWeeklyVisibleSlotCount(item);
     const weekStartDate = getWeeklyViewStartDate(item);
     const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
     const dayNotes = getCalendarDayNotes(item);
     const titleParts = [];
     const displayColumns = getWeeklyDisplayColumns(weekStartDate, visibleDays, shareWeekends);
     const weekNumberColumn = 0;
     const timeColumn = timeVisible ? 1 : -1;
     const dayColumnStart = 1 + (timeVisible ? 1 : 0);
     const columnCount = displayColumns.length + dayColumnStart;
     const renderedColumnCount = columnCount;
     const titleVisible = monthVisible || yearVisible;
     const todayKey = getTodayCalendarDayKey();

     if (!calendar) {
          calendar = document.createElement("div");
          calendar.className = "weekly-vertical";
          item.append(calendar);
     }

     calendar.replaceChildren();
     calendar.style.setProperty("--weekly-slot-count", String(slotCount));
     calendar.style.setProperty("--weekly-row-count", String(slotCount + (titleVisible ? 2 : 1)));
     calendar.style.setProperty("--weekly-day-count", String(displayColumns.length));
     calendar.style.setProperty("--weekly-visible-column-units", String(renderedColumnCount * 2));
     calendar.style.gridTemplateColumns = `${Array(dayColumnStart).fill("calc(var(--weekly-column-cell-width, 12px) * 2)").join(" ")} repeat(${displayColumns.length}, minmax(calc(var(--weekly-column-cell-width, 12px) * 2), 1fr))`.trim();
     calendar.classList.toggle("has-week-numbers", weekNumbersEnabled);
     calendar.classList.toggle("has-time-column", timeVisible);
     calendar.classList.toggle("has-title-row", titleVisible);
     calendar.classList.toggle("no-title-row", !titleVisible);

     if (monthVisible) {
          titleParts.push(titleMonthText);
     }

     if (yearVisible) {
          titleParts.push(titleYearText);
     }

     for (let row = 0; row < slotCount + (titleVisible ? 2 : 1); row += 1) {
          const calendarRow = titleVisible ? row : row + 1;

          for (let column = 0; column < columnCount; column += 1) {
               if (calendarRow !== 0 && !weekNumbersEnabled && column === weekNumberColumn) {
                    continue;
               }

               const cell = document.createElement("span");
               const dayIndex = column - dayColumnStart;
               const displayColumn = column + 1;

               cell.className = "weekly-vertical-cell";
               cell.style.gridRow = String(row + 1);
               if (!(calendarRow === 0 && column === 0)) {
                    cell.style.gridColumn = String(displayColumn);
               }

               if (calendarRow === 0 && column === 0) {
                    cell.classList.add("weekly-vertical-title", (month + 1) % 2 === 1 ? "monthOdd" : "monthEven");
                    cell.style.gridColumn = `2 / span ${renderedColumnCount - 1}`;
                    cell.textContent = titleParts.join(" ");
               } else if (calendarRow === 0) {
                    continue;
               } else if (calendarRow === 1 && column === weekNumberColumn) {
                    continue;
               } else if (column === weekNumberColumn) {
                    cell.classList.add("weekly-vertical-week", "weekNumberCell");
                    if (calendarRow === 2) {
                         const weekNumberLabel = document.createElement("span");

                         weekNumberLabel.className = "weekNumber";
                         weekNumberLabel.textContent = String(getCalendarWeekNumber(weekStartDate, weekStart));
                         cell.append(weekNumberLabel);
                    }
               } else if (calendarRow === 1 && column === timeColumn) {
                    cell.classList.add("weekly-vertical-time-heading");
                    cell.textContent = "Time";
               } else if (calendarRow === 1) {
                    const displayColumn = displayColumns[dayIndex];

                    cell.classList.add("weekly-vertical-date", "dayCell", "dayName");
                    if (displayColumn.type === "shared-weekend") {
                         cell.classList.add("weekly-vertical-shared-weekend");
                    }
                    if (displayColumn.dates.some((date) => date.getDay() === 0 || date.getDay() === 6)) {
                         cell.classList.add("weekly-vertical-weekend");
                    }
                    cell.dataset.dayKey = displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())).join(",");
                    markCurrentCalendarDay(cell, displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())), todayKey);
                    displayColumn.dates.slice(0, 1).forEach((date) => {
                         const dateLabel = document.createElement("span");
                         const dayName = document.createElement("span");
                         const dayNumber = document.createElement("span");

                         dateLabel.className = "weekly-vertical-date-label";
                         dayName.className = "weekly-vertical-day-name";
                         dayName.textContent = dayLabels[date.getDay()];
                         dayNumber.className = "dayNumber";
                         markCurrentCalendarDayNumber(dayNumber, getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate()), todayKey);
                         dayNumber.textContent = String(date.getDate()).padStart(2, "0");
                         dateLabel.append(dayName, dayNumber);
                         cell.append(dateLabel);
                    });
               } else if (column === timeColumn) {
                    const timeMinutes = startMinutes + ((calendarRow - 2) * timeIncrement);

                    cell.classList.add("weekly-vertical-time");
                    cell.textContent = shouldShowWeeklyTimeLabel(timeMinutes, timeIncrement) ? formatWeeklyTimeLabel(timeMinutes, timeFormat) : "";
               } else {
                    const displayColumn = displayColumns[dayIndex];
                    const slotMinutes = startMinutes + ((calendarRow - 2) * timeIncrement);
                    const primaryDate = displayColumn.dates[0];
                    const slotKey = displayColumn.type === "shared-weekend"
                         ? `${displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())).join("+")}T${formatMinutesAsTime(slotMinutes)}`
                         : getWeeklySlotKey(primaryDate, slotMinutes);
                    const slotText = document.createElement("div");
                    const isSharedWeekendLabelRow = displayColumn.type === "shared-weekend" && calendarRow === 2 + Math.floor(slotCount / 2);

                    cell.classList.add("weekly-vertical-slot");
                    if (displayColumn.type === "shared-weekend") {
                         cell.classList.add("weekly-vertical-shared-weekend");
                    }
                    if (displayColumn.dates.some((date) => date.getDay() === 0 || date.getDay() === 6)) {
                         cell.classList.add("weekly-vertical-weekend");
                    }
                    cell.classList.add("dayCell");
                    cell.dataset.dayKey = slotKey;
                    markCurrentCalendarDay(cell, displayColumn.dates.map((date) => getCalendarDayKey(date.getFullYear(), date.getMonth(), date.getDate())), todayKey);
                    if (isSharedWeekendLabelRow) {
                         const sundayDate = displayColumn.dates[1];
                         const sundayMarker = document.createElement("span");
                         const sundayName = document.createElement("span");
                         const sundayNumber = document.createElement("span");

                         sundayMarker.className = "weekly-vertical-date-label weekly-vertical-sunday-mid-marker";
                         sundayName.className = "weekly-vertical-day-name";
                         sundayName.textContent = dayLabels[sundayDate.getDay()];
                         sundayNumber.className = "dayNumber";
                         markCurrentCalendarDayNumber(sundayNumber, getCalendarDayKey(sundayDate.getFullYear(), sundayDate.getMonth(), sundayDate.getDate()), todayKey);
                         sundayNumber.textContent = String(sundayDate.getDate()).padStart(2, "0");
                         sundayMarker.append(sundayName, sundayNumber);
                         cell.append(sundayMarker);
                    } else {
                         slotText.className = "calendar-day-text weekly-vertical-slot-text";
                         slotText.dataset.dayKey = slotKey;
                         slotText.setAttribute("contenteditable", "false");
                         slotText.textContent = dayNotes[slotKey] || dayNotes[getWeeklySlotKey(primaryDate, slotMinutes)] || "";
                         applyCalendarDayTextStyle(item, slotText);
                         slotText.addEventListener("input", () => updateCalendarDayTextOverflow(slotText));
                         slotText.addEventListener("dblclick", (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              startCalendarDayTextEditing(slotText, item);
                         });
                         slotText.addEventListener("pointerdown", (event) => {
                              if (slotText.isContentEditable) {
                                   event.stopPropagation();
                              }
                         });
                         slotText.addEventListener("wheel", (event) => {
                              if (slotText.isContentEditable) {
                                   event.stopPropagation();
                              }
                         });
                         cell.append(slotText);
                         updateCalendarDayTextOverflow(slotText);
                    }
               }

               if (column === columnCount - 1 || (calendarRow === 0 && column === dayColumnStart)) {
                    cell.classList.add("weekly-vertical-edge-right");
               }
               if (calendarRow === slotCount + 1) {
                    cell.classList.add("weekly-vertical-edge-bottom");
               }

               calendar.append(cell);
          }
     }
}

function syncStartDayOptions(select, year, month, selectedDay) {
     if (!select) {
          return;
     }

     const daysInMonth = getCalendarDaysInMonth(year, month);
     const nextDay = clamp(Number(selectedDay) || 1, 1, daysInMonth);

     select.replaceChildren();
     for (let day = 1; day <= daysInMonth; day += 1) {
          const option = document.createElement("option");
          const date = new Date(year, month, day);
          const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

          option.value = String(day);
          option.textContent = `${String(day).padStart(2, "0")} ${dayName}`;
          select.append(option);
     }
     select.value = String(nextDay);
}

function syncMiniCalMonthRowsSize(item, previousMonthRows) {
     if (item.dataset.itemType !== "mini-cal" || previousMonthRows === item.dataset.monthRows) {
          return;
     }

     const page = getItemPage(item);

     if (!page) {
          return;
     }

     const grid = getGridSize(page);
     const box = getItemBox(item);
     const previousHeight = previousMonthRows === "2" ? 9 : 8;
     const nextHeight = getMiniCalGridUnits(item).height;
     const currentHeight = Math.round(box.height / grid.y);

     if (currentHeight !== previousHeight) {
          return;
     }

     setItemBox(item, {
          ...box,
          height: grid.y * nextHeight
     });
     positionItemControls(item);
}

function setMiniCalSettings(item, settings = {}) {
     const today = new Date();
     const previousMonthRows = item.dataset.monthRows || "1";

     item.dataset.weekNumbers = settings.weekNumbers || item.dataset.weekNumbers || "true";
     item.dataset.weekStart = settings.weekStart || item.dataset.weekStart || "monday";
     item.dataset.monthRows = settings.monthRows || item.dataset.monthRows || "1";
     item.dataset.monthDisplay = settings.monthDisplay || item.dataset.monthDisplay || "full";
     item.dataset.monthVisible = item.dataset.monthDisplay === "none" ? "false" : "true";
     item.dataset.month = settings.month || item.dataset.month || String(today.getMonth());
     item.dataset.yearDisplay = settings.yearDisplay || item.dataset.yearDisplay || (settings.yearVisible === "false" || item.dataset.yearVisible === "false" ? "none" : "full");
     item.dataset.yearVisible = item.dataset.yearDisplay === "none" ? "false" : "true";
     item.dataset.year = settings.year || item.dataset.year || String(today.getFullYear());
     item.dataset.startDay = settings.startDay || item.dataset.startDay || "1";
     item.dataset.visibleDays = settings.visibleDays || item.dataset.visibleDays || "7";
     item.dataset.startDay = String(clamp(Number(item.dataset.startDay) || 1, 1, getCalendarDaysInMonth(Number(item.dataset.year), Number(item.dataset.month))));
     item.dataset.timeIncrement = settings.timeIncrement || item.dataset.timeIncrement || "30";
     item.dataset.startTime = settings.startTime || item.dataset.startTime || "00:00";
     item.dataset.timeFormat = settings.timeFormat || item.dataset.timeFormat || "24";
     item.dataset.timeVisible = settings.timeVisible ?? item.dataset.timeVisible ?? "true";
     item.dataset.shareWeekends = settings.shareWeekends ?? item.dataset.shareWeekends ?? "false";
     renderMiniCal(item);
     syncMiniCalMonthRowsSize(item, previousMonthRows);
     updateCalendarGridMetrics(item, getItemPage(item), getItemBox(item));

     const controls = getItemControls(item) || item;
     const weekNumberInput = controls.querySelector("[data-widget-control='week-numbers']");
     const weekStartSelect = controls.querySelector("[data-widget-control='week-start']");
     const monthRowsInput = controls.querySelector("[data-widget-control='month-rows']");
     const monthSelect = controls.querySelector("[data-widget-control='month']");
     const monthDisplaySelect = controls.querySelector("[data-widget-control='month-display']");
     const yearSelect = controls.querySelector("[data-widget-control='year']");
     const yearDisplaySelect = controls.querySelector("[data-widget-control='year-display']");
     const startDaySelect = controls.querySelector("[data-widget-control='start-day']");
     const visibleDaysSelect = controls.querySelector("[data-widget-control='visible-days']");
     const timeIncrementSelect = controls.querySelector("[data-widget-control='time-increment']");
     const startTimeSelect = controls.querySelector("[data-widget-control='start-time']");
     const timeFormatSelect = controls.querySelector("[data-widget-control='time-format']");
     const timeVisibleInput = controls.querySelector("[data-widget-control='time-visible']");
     const shareWeekendsInput = controls.querySelector("[data-widget-control='share-weekends']");

     if (weekNumberInput) {
          weekNumberInput.checked = item.dataset.weekNumbers !== "false";
     }

     if (weekStartSelect) {
          weekStartSelect.value = item.dataset.weekStart;
     }

     if (monthRowsInput) {
          monthRowsInput.checked = item.dataset.monthRows === "2";
     }

     if (monthSelect) {
          monthSelect.value = item.dataset.month;
     }

     if (monthDisplaySelect) {
          monthDisplaySelect.value = item.dataset.monthDisplay;
     }

     if (yearSelect) {
          yearSelect.value = item.dataset.year;
     }

     if (yearDisplaySelect) {
          yearDisplaySelect.value = item.dataset.yearDisplay;
     }

     syncStartDayOptions(startDaySelect, Number(item.dataset.year), Number(item.dataset.month), item.dataset.startDay);

     if (visibleDaysSelect) {
          visibleDaysSelect.value = item.dataset.visibleDays;
     }

     if (timeIncrementSelect) {
          timeIncrementSelect.value = item.dataset.timeIncrement;
     }

     if (startTimeSelect) {
          startTimeSelect.value = item.dataset.startTime;
     }

     if (timeFormatSelect) {
          timeFormatSelect.value = item.dataset.timeFormat;
     }

     if (timeVisibleInput) {
          timeVisibleInput.checked = item.dataset.timeVisible !== "false";
     }

     if (shareWeekendsInput) {
          shareWeekendsInput.checked = item.dataset.shareWeekends === "true";
     }

     controls.querySelectorAll("select").forEach(syncCustomSelect);
}

function makePlannerItem(type = "sticky") {
     const item = document.createElement("div");
     const sizeLabel = document.createElement("span");
     const controls = document.createElement("div");
     const controlTabs = document.createElement("div");
     const actionsTab = document.createElement("button");
     const styleTab = document.createElement("button");
     const textTab = document.createElement("button");
     const widgetTab = document.createElement("button");
     const actionsPanel = document.createElement("div");
     const stylePanel = document.createElement("div");
     const textPanel = document.createElement("div");
     const widgetPanel = document.createElement("div");
     const dateWidgetGroup = document.createElement("div");
     const dateWidgetTitle = document.createElement("div");
     const calendarAttributesGrid = document.createElement("div");
     const timeWidgetGroup = document.createElement("div");
     const timeWidgetTitle = document.createElement("div");
     const duplicateButton = document.createElement("button");
     const groupButton = document.createElement("button");
     const bringForwardButton = document.createElement("button");
     const sendBackwardButton = document.createElement("button");
     const fillLabel = document.createElement("label");
     const fillTitle = document.createElement("span");
     const fillInput = document.createElement("select");
     const fillSwatches = document.createElement("div");
     const borderColorLabel = document.createElement("label");
     const borderTitle = document.createElement("span");
     const borderSizeField = document.createElement("span");
     const borderColorInput = document.createElement("select");
     const borderColorSwatches = document.createElement("div");
     const borderWidthSelect = document.createElement("select");
     const dotGridLabel = document.createElement("label");
     const dotGridInput = document.createElement("input");
     const textElement = document.createElement("div");
     const textToggleLabel = document.createElement("label");
     const textTitle = document.createElement("span");
     const textToggleInput = document.createElement("input");
     const textSizeInput = document.createElement("input");
     const textFontSelect = document.createElement("select");
     const textColorLabel = document.createElement("label");
     const textColorTitle = document.createElement("span");
     const textColorInput = document.createElement("select");
     const textColorSwatches = document.createElement("div");
     const textFormatGroup = document.createElement("div");
     const textBoldLabel = document.createElement("label");
     const textBoldInput = document.createElement("input");
     const textItalicLabel = document.createElement("label");
     const textItalicInput = document.createElement("input");
     const textUnderlineLabel = document.createElement("label");
     const textUnderlineInput = document.createElement("input");
     const textAlignLabel = document.createElement("label");
     const textAlignSelect = document.createElement("select");
     const textLineHeightLabel = document.createElement("label");
     const textLineHeightSelect = document.createElement("select");
     const weekNumberLabel = document.createElement("label");
     const weekNumberInput = document.createElement("input");
     const weekStartLabel = document.createElement("label");
     const weekStartSelect = document.createElement("select");
     const monthRowsLabel = document.createElement("label");
     const monthRowsInput = document.createElement("input");
     const monthLabel = document.createElement("label");
     const monthSelect = document.createElement("select");
     const monthDisplayLabel = document.createElement("label");
     const monthDisplaySelect = document.createElement("select");
     const yearLabel = document.createElement("label");
     const yearSelect = document.createElement("select");
     const yearDisplayLabel = document.createElement("label");
     const yearDisplaySelect = document.createElement("select");
     const startDayLabel = document.createElement("label");
     const startDaySelect = document.createElement("select");
     const visibleDaysLabel = document.createElement("label");
     const visibleDaysSelect = document.createElement("select");
     const timeIncrementLabel = document.createElement("label");
     const timeIncrementSelect = document.createElement("select");
     const startTimeLabel = document.createElement("label");
     const startTimeSelect = document.createElement("select");
     const timeVisibleInput = document.createElement("input");
     const timeFormatLabel = document.createElement("label");
     const timeFormatSelect = document.createElement("select");
     const shareWeekendsLabel = document.createElement("label");
     const shareWeekendsInput = document.createElement("input");
     const deleteButton = document.createElement("button");

     item.className = `planner-item planner-item-${type}`;
     item.dataset.itemType = type;
     item.dataset.templateId = `${type}-${nextTemplateItemId}`;
     nextTemplateItemId += 1;
     item.tabIndex = 0;
     item.setAttribute("role", "button");
     item.setAttribute("aria-label", isCalendarItemType(type) ? "Calendar widget" : "Sticky note");

     sizeLabel.className = "item-size-label";
     sizeLabel.setAttribute("aria-hidden", "true");
     controls.className = `item-controls item-controls-${type}`;
     controls.dataset.ownerId = item.dataset.templateId;
     controls.setAttribute("role", "menu");
     controlTabs.className = "item-control-tabs";
     controlTabs.setAttribute("role", "tablist");
     actionsTab.className = "item-control-tab";
     actionsTab.type = "button";
     actionsTab.textContent = "Actions";
     actionsTab.dataset.itemControlTab = "actions";
     actionsTab.setAttribute("role", "tab");
     styleTab.className = "item-control-tab";
     styleTab.type = "button";
     styleTab.textContent = "Appearance";
     styleTab.dataset.itemControlTab = "style";
     styleTab.setAttribute("role", "tab");
     textTab.className = "item-control-tab";
     textTab.type = "button";
     textTab.textContent = "Text";
     textTab.dataset.itemControlTab = "text";
     textTab.setAttribute("role", "tab");
     widgetTab.className = "item-control-tab";
     widgetTab.type = "button";
     widgetTab.textContent = "Attributes";
     widgetTab.dataset.itemControlTab = "widget";
     widgetTab.setAttribute("role", "tab");
     actionsPanel.className = "item-control-panel";
     actionsPanel.dataset.itemControlPanel = "actions";
     actionsPanel.setAttribute("role", "tabpanel");
     stylePanel.className = "item-control-panel";
     stylePanel.dataset.itemControlPanel = "style";
     stylePanel.setAttribute("role", "tabpanel");
     textPanel.className = "item-control-panel";
     textPanel.dataset.itemControlPanel = "text";
     textPanel.setAttribute("role", "tabpanel");
     widgetPanel.className = "item-control-panel item-widget-panel";
     widgetPanel.dataset.itemControlPanel = "widget";
     widgetPanel.setAttribute("role", "tabpanel");
     dateWidgetGroup.className = "item-widget-group item-widget-date-group";
     dateWidgetTitle.className = "item-widget-group-title";
     dateWidgetTitle.textContent = "Day";
     calendarAttributesGrid.className = "item-calendar-attributes-grid";
     timeWidgetGroup.className = "item-widget-group item-widget-time-group";
     timeWidgetTitle.className = "item-widget-group-title";
     timeWidgetTitle.textContent = "Time";
     duplicateButton.className = "item-control";
     duplicateButton.type = "button";
     duplicateButton.textContent = "Duplicate";
     duplicateButton.setAttribute("aria-label", "Duplicate sticky note");
     groupButton.className = "item-control";
     groupButton.type = "button";
     groupButton.textContent = "Group";
     groupButton.setAttribute("aria-label", "Group selected sticky notes");
     bringForwardButton.className = "item-control";
     bringForwardButton.type = "button";
     bringForwardButton.textContent = "Bring Fwd";
     bringForwardButton.setAttribute("aria-label", "Bring selected item forward");
     sendBackwardButton.className = "item-control";
     sendBackwardButton.type = "button";
     sendBackwardButton.textContent = "Send Bwd";
     sendBackwardButton.setAttribute("aria-label", "Send selected item backward");
     fillLabel.className = "item-control-row item-color-control";
     fillTitle.className = "item-control-title";
     fillTitle.textContent = "Fill";
     fillInput.className = "native-select";
     fillInput.dataset.styleControl = "fill";
     fillInput.setAttribute("aria-label", "Sticky note fill palette");
     fillSwatches.className = "item-color-swatches";
     fillSwatches.dataset.styleSwatches = "fill";
     borderColorLabel.className = "item-control-row item-color-control";
     borderTitle.className = "item-control-title";
     borderTitle.textContent = "Border";
     borderSizeField.className = "item-control-row";
     borderSizeField.textContent = "Size";
     borderColorInput.className = "native-select";
     borderColorInput.dataset.styleControl = "border-color";
     borderColorInput.setAttribute("aria-label", "Sticky note border palette");
     borderColorSwatches.className = "item-color-swatches";
     borderColorSwatches.dataset.styleSwatches = "border-color";
     borderWidthSelect.setAttribute("aria-label", "Sticky note border thickness");
     borderWidthSelect.dataset.styleControl = "border-width";
     ["1", "2", "3", "4", "5"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = `${value}px`;
          borderWidthSelect.append(option);
     });
     dotGridLabel.className = "item-control-row";
     dotGridLabel.textContent = "Dot grid";
     dotGridInput.type = "checkbox";
     dotGridInput.dataset.styleControl = "dot-grid";
     dotGridInput.setAttribute("aria-label", "Show sticky note dot grid");
     textElement.className = "sticky-text";
     textElement.hidden = true;
     textElement.spellcheck = true;
     textElement.setAttribute("contenteditable", "false");
     textElement.setAttribute("aria-label", "Sticky note text");
     textToggleLabel.className = "item-control-row item-text-control item-text-settings-control";
     textTitle.className = "item-control-title";
     textTitle.textContent = "Text";
     textToggleInput.type = "checkbox";
     textToggleInput.dataset.textControl = "enabled";
     textToggleInput.setAttribute("aria-label", "Show sticky note text");
     textSizeInput.type = "number";
     textSizeInput.min = "8";
     textSizeInput.max = "48";
     textSizeInput.step = "1";
     textSizeInput.value = "10";
     textSizeInput.dataset.textControl = "size";
     textSizeInput.setAttribute("aria-label", "Sticky note text size");
     textFontSelect.dataset.textControl = "font";
     textFontSelect.setAttribute("aria-label", "Sticky note text font");
     [
          ["noto", "Noto"],
          ["dancing", "Script"],
          ["sans", "Sans"],
          ["serif", "Serif"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          textFontSelect.append(option);
     });
     textColorLabel.className = "item-control-row item-text-control item-color-control";
     textColorTitle.className = "item-control-title";
     textColorTitle.textContent = "Font Palette";
     textColorInput.className = "native-select";
     textColorInput.dataset.textControl = "color";
     textColorInput.setAttribute("aria-label", "Sticky note text palette");
     textColorSwatches.className = "item-color-swatches";
     textColorSwatches.dataset.textSwatches = "color";
     textFormatGroup.className = "item-text-format item-text-control";
     textBoldLabel.className = "item-text-toggle";
     textBoldLabel.textContent = "B";
     textBoldInput.type = "checkbox";
     textBoldInput.dataset.textControl = "bold";
     textBoldInput.setAttribute("aria-label", "Bold sticky note text");
     textItalicLabel.className = "item-text-toggle";
     textItalicLabel.textContent = "I";
     textItalicInput.type = "checkbox";
     textItalicInput.dataset.textControl = "italic";
     textItalicInput.setAttribute("aria-label", "Italic sticky note text");
     textUnderlineLabel.className = "item-text-toggle";
     textUnderlineLabel.textContent = "U";
     textUnderlineInput.type = "checkbox";
     textUnderlineInput.dataset.textControl = "underline";
     textUnderlineInput.setAttribute("aria-label", "Underline sticky note text");
     textAlignLabel.className = "item-control-row item-text-control";
     textAlignLabel.textContent = "Alignment";
     textAlignSelect.dataset.textControl = "align";
     textAlignSelect.setAttribute("aria-label", "Sticky note text alignment");
     ["left", "center", "right"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value[0].toUpperCase() + value.slice(1);
          textAlignSelect.append(option);
     });
     textLineHeightLabel.className = "item-control-row item-text-control";
     textLineHeightLabel.textContent = "Line Height";
     textLineHeightSelect.dataset.textControl = "line-height";
     textLineHeightSelect.setAttribute("aria-label", "Text line height in grid cells");
     textLineHeightCellOptions.forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value;
          textLineHeightSelect.append(option);
     });
     deleteButton.className = "item-control";
     deleteButton.type = "button";
     deleteButton.textContent = "Delete";
     deleteButton.setAttribute("aria-label", "Delete planner item");
     weekNumberLabel.className = "item-control-row item-widget-control";
     weekNumberLabel.textContent = "Week #";
     weekNumberInput.type = "checkbox";
     weekNumberInput.checked = true;
     weekNumberInput.dataset.widgetControl = "week-numbers";
     weekNumberInput.setAttribute("aria-label", "Show week numbers");
     weekNumberInput.title = "Show week numbers";
     weekStartLabel.className = "item-control-row item-widget-control";
     weekStartLabel.textContent = "Week Start";
     weekStartSelect.dataset.widgetControl = "week-start";
     weekStartSelect.setAttribute("aria-label", "Calendar week start");
     ["monday", "sunday"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value[0].toUpperCase() + value.slice(1);
          weekStartSelect.append(option);
     });
     monthRowsLabel.className = "item-control-row item-widget-control item-widget-control-month-rows";
     monthRowsLabel.textContent = "Month 2x";
     monthRowsInput.type = "checkbox";
     monthRowsInput.dataset.widgetControl = "month-rows";
     monthRowsInput.setAttribute("aria-label", "Use two-row calendar month heading");
     monthRowsInput.title = "Use two-row month heading";
     monthLabel.className = "item-control-row item-widget-control";
     monthLabel.textContent = "Month";
     monthSelect.dataset.widgetControl = "month";
     monthSelect.setAttribute("aria-label", "Calendar month");
     calendarMonthNames.forEach((monthName, index) => {
          const option = document.createElement("option");

          option.value = String(index);
          option.textContent = monthName;
          monthSelect.append(option);
     });
     monthDisplayLabel.className = "item-control-row item-widget-control";
     monthDisplayLabel.textContent = "Month Display";
     monthDisplaySelect.dataset.widgetControl = "month-display";
     monthDisplaySelect.setAttribute("aria-label", "Calendar month display");
     [
          ["number", "#"],
          ["short", "MMM"],
          ["full", "Full"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          monthDisplaySelect.append(option);
     });
     yearLabel.className = "item-control-row item-widget-control";
     yearLabel.textContent = "Year";
     yearSelect.dataset.widgetControl = "year";
     yearSelect.setAttribute("aria-label", "Calendar year");
     for (let year = calendarYearRange.start; year <= calendarYearRange.end; year += 1) {
          const option = document.createElement("option");

          option.value = String(year);
          option.textContent = String(year);
          yearSelect.append(option);
     }
     yearDisplayLabel.className = "item-control-row item-widget-control";
     yearDisplayLabel.textContent = "Year Display";
     yearDisplaySelect.dataset.widgetControl = "year-display";
     yearDisplaySelect.setAttribute("aria-label", "Calendar year display");
     [
          ["none", "Off"],
          ["short", "YY"],
          ["full", "YYYY"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          yearDisplaySelect.append(option);
     });
     startDayLabel.className = "item-control-row item-widget-control";
     startDayLabel.textContent = "Day";
     startDaySelect.dataset.widgetControl = "start-day";
     startDaySelect.setAttribute("aria-label", "Weekly planner start day");
     visibleDaysLabel.className = "item-control-row item-widget-control";
     visibleDaysLabel.textContent = "Duration";
     visibleDaysSelect.dataset.widgetControl = "visible-days";
     visibleDaysSelect.setAttribute("aria-label", "Weekly planner visible days");
     for (let dayCount = 1; dayCount <= 7; dayCount += 1) {
          const option = document.createElement("option");

          option.value = String(dayCount);
          option.textContent = `${dayCount} ${dayCount === 1 ? "day" : "days"}`;
          visibleDaysSelect.append(option);
     }
     timeIncrementLabel.className = "item-control-row item-widget-control";
     timeIncrementLabel.textContent = "Increments";
     timeIncrementSelect.dataset.widgetControl = "time-increment";
     timeIncrementSelect.setAttribute("aria-label", "Weekly planner time increment");
     [
          ["15", "15m"],
          ["30", "30m"],
          ["60", "1h"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          timeIncrementSelect.append(option);
     });
     startTimeLabel.className = "item-control-row item-widget-control";
     startTimeLabel.textContent = "Start";
     startTimeSelect.dataset.widgetControl = "start-time";
     startTimeSelect.setAttribute("aria-label", "Weekly planner start time");
     timeVisibleInput.type = "checkbox";
     timeVisibleInput.checked = true;
     timeVisibleInput.dataset.widgetControl = "time-visible";
     timeVisibleInput.setAttribute("aria-label", "Show weekly planner time column");
     timeFormatLabel.className = "item-control-row item-widget-control";
     timeFormatLabel.textContent = "Format";
     timeFormatSelect.dataset.widgetControl = "time-format";
     timeFormatSelect.setAttribute("aria-label", "Weekly planner time format");
     [
          ["24", "24hr"],
          ["compact", "8a"],
          ["ampm", "8:30 am"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          timeFormatSelect.append(option);
     });
     shareWeekendsLabel.className = "item-control-row item-widget-control";
     shareWeekendsLabel.textContent = "Share Weekends";
     shareWeekendsInput.type = "checkbox";
     shareWeekendsInput.dataset.widgetControl = "share-weekends";
     shareWeekendsInput.setAttribute("aria-label", "Share Saturday and Sunday in one column");
     for (let minute = 0; minute < 24 * 60; minute += 30) {
          const option = document.createElement("option");
          const time = formatMinutesAsTime(minute);

          option.value = time;
          option.textContent = time;
          startTimeSelect.append(option);
     }

     borderSizeField.append(borderWidthSelect);
     fillLabel.append(fillTitle, fillInput, fillSwatches);
     borderColorLabel.append(borderTitle, borderColorInput, borderColorSwatches);
     dotGridLabel.append(dotGridInput);
     if (type === "sticky") {
          textToggleLabel.append(textTitle, textToggleInput, textSizeInput, textFontSelect);
     } else {
          textToggleLabel.classList.add("item-text-settings-control-no-toggle");
          textToggleLabel.append(textTitle, textSizeInput, textFontSelect);
     }
     textColorLabel.append(textColorTitle, textColorInput, textColorSwatches);
     textBoldLabel.append(textBoldInput);
     textItalicLabel.append(textItalicInput);
     textUnderlineLabel.append(textUnderlineInput);
     textFormatGroup.append(textBoldLabel, textItalicLabel, textUnderlineLabel);
     textAlignLabel.append(textAlignSelect);
     textLineHeightLabel.append(textLineHeightSelect);
     monthLabel.append(monthSelect);
     monthDisplayLabel.append(monthDisplaySelect);
     yearLabel.append(yearSelect);
     yearDisplayLabel.append(yearDisplaySelect);
     weekStartLabel.append(weekStartSelect);
     weekNumberLabel.append(weekNumberInput);
     monthRowsLabel.append(monthRowsInput);
     calendarAttributesGrid.append(weekStartLabel, monthLabel, yearLabel, weekNumberLabel, monthDisplayLabel, yearDisplayLabel);
     if (type === "mini-cal") {
          calendarAttributesGrid.append(monthRowsLabel);
     }
     startDayLabel.append(startDaySelect);
     visibleDaysLabel.append(visibleDaysSelect);
     timeIncrementLabel.append(timeIncrementSelect);
     startTimeLabel.append(timeVisibleInput, startTimeSelect);
     timeFormatLabel.append(timeFormatSelect);
     shareWeekendsLabel.append(shareWeekendsInput);
     controlTabs.append(styleTab);
     actionsPanel.append(duplicateButton, groupButton, bringForwardButton, sendBackwardButton, deleteButton);
     stylePanel.append(fillLabel, borderColorLabel, borderSizeField);
     if (type === "sticky") {
          textPanel.append(
               textToggleLabel,
               textColorLabel,
               textFormatGroup,
               textAlignLabel,
               textLineHeightLabel
          );
     }
     if (isCalendarTextItemType(type)) {
          textPanel.append(
               textToggleLabel,
               textColorLabel,
               textFormatGroup,
               textAlignLabel,
               textLineHeightLabel
          );
     }
     if (type === "sticky" || isCalendarTextItemType(type)) {
          controlTabs.append(textTab);
     }
     if (type === "sticky") {
          widgetPanel.append(dotGridLabel);
     }
     if (isCalendarItemType(type) && type !== "weekly-vertical") {
          widgetPanel.append(calendarAttributesGrid);
     }
     if (type === "weekly-vertical") {
          dateWidgetGroup.append(dateWidgetTitle, calendarAttributesGrid, startDayLabel);
          timeWidgetGroup.append(timeWidgetTitle, startTimeLabel, timeFormatLabel, timeIncrementLabel, visibleDaysLabel, shareWeekendsLabel);
          widgetPanel.append(dateWidgetGroup, timeWidgetGroup);
     }
     controlTabs.append(widgetTab);
     controls.append(controlTabs, actionsPanel, stylePanel);
     if (type === "sticky" || isCalendarTextItemType(type)) {
          controls.append(textPanel);
     }
     controls.append(widgetPanel);
     initializePaletteColorControl(fillInput, fillSwatches, "var(--paper-offwhite)", (nextColor) => {
          applyStyleToActionItems(item, {
               fillColor: nextColor
          });
     });
     initializePaletteColorControl(borderColorInput, borderColorSwatches, "var(--color-gray4)", (nextColor) => {
          applyStyleToActionItems(item, {
               borderColor: nextColor
          });
     });
     initializePaletteColorControl(textColorInput, textColorSwatches, "var(--color-gray1)", (nextColor) => {
          applyTextSettingsToActionItems(item, {
               color: nextColor
          });
     });
     controls.querySelectorAll("select:not([data-style-control='fill']):not([data-style-control='border-color']):not([data-text-control='color'])").forEach((select) => {
          makeCustomSelect(select);
          select.addEventListener("change", () => updateCustomSelectDisplay(select));
     });
     setItemControlsTab(controls, "style");
     item.append(sizeLabel);
     if (type === "sticky") {
          item.append(textElement);
     }
     item.append(controls);
     setItemStyle(item, {
          fillColor: "var(--paper-offwhite)",
          borderColor: "var(--color-gray4)",
          borderWidth: borderWidthSelect.value,
          dotGrid: "false"
     });
     setStickyTextSettings(item);
     setCalendarDayTextSettings(item);
     if (isCalendarItemType(type)) {
          setMiniCalSettings(item);
     }

     item.addEventListener("pointerdown", (event) => {
          if (event.target.closest(".item-controls")) {
               return;
          }

          if (event.button !== 0) {
               return;
          }

          if (item.dataset.itemType === "sticky" && event.detail > 1) {
               event.preventDefault();
               selectItem(item);
               return;
          }

          if (event.metaKey || event.ctrlKey) {
               event.preventDefault();
               selectItem(item, true);
               shouldSkipNextItemClick = true;
               return;
          }

          const resizeMode = getResizeMode(item, event);

          if (resizeMode) {
               startResize(item, event, resizeMode);
               return;
          }

          startMove(item, event);
     });
     item.addEventListener("pointermove", (event) => {
          const resizeMode = getResizeMode(item, event);

          setResizeCursor(item, resizeMode);
     });
     item.addEventListener("pointerleave", () => {
          setResizeCursor(item, "");
     });
     item.addEventListener("click", (event) => {
          if (shouldSkipNextItemClick) {
               shouldSkipNextItemClick = false;
               return;
          }

          if (event.metaKey || event.ctrlKey) {
               selectItem(item, true);
          } else if (!activeAction) {
               selectItem(item);
               openItemMenu(item);
          }
     });
     item.addEventListener("dblclick", (event) => {
          if (event.target.closest(".item-controls")) {
               return;
          }

          event.preventDefault();
          startStickyTextEditing(item);
     });
     item.addEventListener("focus", () => {
          if (!item.classList.contains("is-menu-open") && !selectedItems.has(item)) {
               selectItem(item);
          }
     });
     item.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!selectedItems.has(item)) {
               selectItem(item);
          }
          const actionItems = getSelectedOrGroupedActionItems(item);

          closeItemMenus(item);
          updateGroupButton(groupButton, actionItems);
          openItemActionsPopup(item, event, actionItems);
     });
     controls.addEventListener("pointerdown", (event) => event.stopPropagation());
     controls.addEventListener("click", (event) => event.stopPropagation());
     controls.querySelectorAll("[data-item-control-tab]").forEach((tab) => {
          tab.addEventListener("click", () => setItemControlsTab(controls, tab.dataset.itemControlTab));
     });
     duplicateButton.addEventListener("click", (event) => {
          event.stopPropagation();
          duplicateItem(item);
     });
     groupButton.addEventListener("click", (event) => {
          event.stopPropagation();
          const actionItems = getActionItems(item);

          if (itemsHaveGroup(actionItems)) {
               ungroupItems(actionItems);
          } else {
               groupItems(actionItems, item);
          }
          updateGroupButton(groupButton, getActionItems(item));
     });
     bringForwardButton.addEventListener("click", (event) => {
          event.stopPropagation();
          moveActionItemsLayer(item, "forward");
     });
     sendBackwardButton.addEventListener("click", (event) => {
          event.stopPropagation();
          moveActionItemsLayer(item, "backward");
     });
     borderWidthSelect.addEventListener("change", () => {
          applyStyleToActionItems(item, {
               borderWidth: borderWidthSelect.value
          });
     });
     dotGridInput.addEventListener("change", () => {
          applyStyleToActionItems(item, {
               dotGrid: dotGridInput.checked ? "true" : "false"
          });
     });
     textToggleInput.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               enabled: textToggleInput.checked ? "true" : "false"
          });
     });
     textSizeInput.addEventListener("input", () => {
          applyTextSettingsToActionItems(item, {
               size: textSizeInput.value
          });
     });
     textFontSelect.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               font: textFontSelect.value
          });
     });
     textBoldInput.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               bold: textBoldInput.checked ? "true" : "false"
          });
     });
     textItalicInput.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               italic: textItalicInput.checked ? "true" : "false"
          });
     });
     textUnderlineInput.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               underline: textUnderlineInput.checked ? "true" : "false"
          });
     });
     textAlignSelect.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               align: textAlignSelect.value
          });
     });
     textLineHeightSelect.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               lineHeight: textLineHeightSelect.value
          });
     });
     textElement.addEventListener("input", () => updateStickyTextOverflow(item));
     textElement.addEventListener("blur", () => stopStickyTextEditing(item));
     textElement.addEventListener("pointerdown", (event) => {
          if (textElement.isContentEditable) {
               event.stopPropagation();
          }
     });
     textElement.addEventListener("wheel", (event) => {
          if (textElement.isContentEditable) {
               event.stopPropagation();
          }
     });
     weekNumberInput.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               weekNumbers: weekNumberInput.checked ? "true" : "false"
          });
     });
     weekStartSelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               weekStart: weekStartSelect.value
          });
     });
     monthRowsInput.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               monthRows: monthRowsInput.checked ? "2" : "1"
          });
     });
     monthSelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               month: monthSelect.value
          });
     });
     monthDisplaySelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               monthDisplay: monthDisplaySelect.value
          });
     });
     yearSelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               year: yearSelect.value
          });
     });
     yearDisplaySelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               yearDisplay: yearDisplaySelect.value
          });
     });
     startDaySelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               startDay: startDaySelect.value
          });
     });
     visibleDaysSelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               visibleDays: visibleDaysSelect.value
          });
     });
     timeIncrementSelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               timeIncrement: timeIncrementSelect.value
          });
     });
     startTimeSelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               startTime: startTimeSelect.value
          });
     });
     timeFormatSelect.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               timeFormat: timeFormatSelect.value
          });
     });
     timeVisibleInput.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               timeVisible: timeVisibleInput.checked ? "true" : "false"
          });
     });
     shareWeekendsInput.addEventListener("change", () => {
          applyMiniCalSettingsToActionItems(item, {
               shareWeekends: shareWeekendsInput.checked ? "true" : "false"
          });
     });
     deleteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteItem(item);
     });

     return item;
}

function addItemToPage(page, x = 4, y = 4) {
     const item = makePlannerItem();
     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const box = {
          x: origin.x + x * grid.x,
          y: origin.y + y * grid.y,
          width: grid.x * stickyGridUnits,
          height: grid.y * stickyGridUnits
     };

     markGridState(item, true, page);
     plannerDesk.append(item);
     setItemBox(item, box);
     selectItem(item);

     return item;
}

function copyItemConfiguration(source, target) {
     setItemStyle(target, {
          fillColor: source.dataset.fillColor,
          borderColor: source.dataset.borderColor,
          borderWidth: source.dataset.borderWidth,
          dotGrid: source.dataset.dotGrid
     });
     setStickyTextSettings(target, {
          enabled: source.dataset.textEnabled,
          content: getStickyTextElement(source) ? getStickyTextElement(source).textContent : "",
          size: source.dataset.textSize,
          font: source.dataset.textFont,
          color: source.dataset.textColor,
          bold: source.dataset.textBold,
          italic: source.dataset.textItalic,
          underline: source.dataset.textUnderline,
          align: source.dataset.textAlign,
          lineHeight: source.dataset.textLineHeight
     });
     if (isCalendarItem(source)) {
          setMiniCalSettings(target, {
               weekNumbers: source.dataset.weekNumbers,
               weekStart: source.dataset.weekStart,
               monthRows: source.dataset.monthRows,
               monthDisplay: source.dataset.monthDisplay,
               monthVisible: source.dataset.monthVisible,
               month: source.dataset.month,
               yearDisplay: source.dataset.yearDisplay,
               yearVisible: source.dataset.yearVisible,
               year: source.dataset.year,
               startDay: source.dataset.startDay,
               visibleDays: source.dataset.visibleDays,
               timeIncrement: source.dataset.timeIncrement,
               startTime: source.dataset.startTime,
               timeFormat: source.dataset.timeFormat,
               timeVisible: source.dataset.timeVisible,
               shareWeekends: source.dataset.shareWeekends
          });
          if (isCalendarTextItem(source)) {
               target.dataset.dayNotes = source.dataset.dayNotes || "{}";
               setCalendarDayTextSettings(target, {
                    size: source.dataset.dayTextSize,
                    font: source.dataset.dayTextFont,
                    color: source.dataset.dayTextColor,
                    bold: source.dataset.dayTextBold,
                    italic: source.dataset.dayTextItalic,
                    underline: source.dataset.dayTextUnderline,
                    align: source.dataset.dayTextAlign,
                    lineHeight: source.dataset.dayTextLineHeight
               });
          }
          renderMiniCal(target);
     }
}

function advanceDuplicatedCalendarView(source, target) {
     if (!isCalendarItem(source) || !isCalendarItem(target)) {
          return;
     }

     if (source.dataset.itemType === "weekly-vertical") {
          const visibleDays = clamp(Number(source.dataset.visibleDays) || 7, 1, 7);
          const nextStartDate = getWeeklyViewStartDate(source);

          nextStartDate.setDate(nextStartDate.getDate() + visibleDays);
          setMiniCalSettings(target, {
               month: String(nextStartDate.getMonth()),
               year: String(nextStartDate.getFullYear()),
               startDay: String(nextStartDate.getDate())
          });
          return;
     }

     const month = Number(source.dataset.month) || 0;
     const year = Number(source.dataset.year) || new Date().getFullYear();
     const nextMonthDate = new Date(year, month + 1, 1);

     setMiniCalSettings(target, {
          month: String(nextMonthDate.getMonth()),
          year: String(nextMonthDate.getFullYear())
     });
}

function duplicateItem(item) {
     const actionItems = getActionItems(item);

     if (actionItems.length > 1) {
          selectItems(actionItems);
          duplicateSelectedItems();
          return;
     }

     const page = getItemPage(item);
     const box = getItemBox(item);
     const duplicate = makePlannerItem(item.dataset.itemType || "sticky");
     const parent = plannerDesk;
     const nextBox = page
          ? {
               ...box,
               x: clamp(box.x + getGridSize(page).x, 0, page.clientWidth - box.width),
               y: clamp(box.y + getGridSize(page).y, 0, page.clientHeight - box.height)
          }
          : {
               ...box,
               x: box.x + 16,
               y: box.y + 16
          };

     parent.append(duplicate);
     copyItemConfiguration(item, duplicate);
     advanceDuplicatedCalendarView(item, duplicate);
     markGridState(duplicate, Boolean(page), page);
     setItemBox(duplicate, nextBox);
     selectItem(duplicate);
     notifyTemplateChanged();
}

function duplicateSelectedItems() {
     const copies = [];
     const copiedGroupIds = new Map();

     selectedItems.forEach((item) => {
          const page = getItemPage(item);
          const box = getItemBox(item);
          const duplicate = makePlannerItem(item.dataset.itemType || "sticky");
          const parent = plannerDesk;
          const offset = page ? getGridSize(page).x : 16;
          const nextBox = page
               ? {
                    ...box,
                    x: clamp(box.x + offset, 0, page.clientWidth - box.width),
                    y: clamp(box.y + offset, 0, page.clientHeight - box.height)
               }
               : {
                    ...box,
                    x: box.x + offset,
                    y: box.y + offset
               };

          parent.append(duplicate);
          copyItemConfiguration(item, duplicate);
          markGridState(duplicate, Boolean(page), page);
          setItemBox(duplicate, nextBox);

          if (item.dataset.groupId) {
               if (!copiedGroupIds.has(item.dataset.groupId)) {
                    copiedGroupIds.set(item.dataset.groupId, `group-${nextGroupId}`);
                    nextGroupId += 1;
               }

               duplicate.dataset.groupId = copiedGroupIds.get(item.dataset.groupId);
          }

          copies.push(duplicate);
     });

     selectItems(copies);
     notifyTemplateChanged();
}

function deleteItem(item) {
     const actionItems = getActionItems(item);

     actionItems.forEach((targetItem) => {
          selectedItems.delete(targetItem);
          closeItemMenu(targetItem);
          targetItem.remove();
     });
     selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     notifyTemplateChanged();
}

function placeItemOnDesk(item, event) {
     const itemRect = item.getBoundingClientRect();
     const deskRect = plannerDesk.getBoundingClientRect();

     plannerDesk.append(item);
     item.classList.remove("is-floating-source");
     markGridState(item, false);
     setItemBox(item, {
          ...getItemBox(item),
          x: itemRect.left - deskRect.left,
          y: itemRect.top - deskRect.top
     });

     if (event) {
          setItemBox(item, getDeskBox(item, event.clientX, event.clientY, activeAction.offsetX, activeAction.offsetY));
     }
}

function snapItemToPage(item, page, event) {
     const snappedSize = getGridSnappedSize(item, page);
     const isNewPageCalendar = activeAction.type === "source" && (item.dataset.itemType === "full-cal" || item.dataset.itemType === "weekly-vertical");

     plannerDesk.append(item);
     item.classList.remove("is-floating-source");
     markGridState(item, true, page);
     setItemBox(item, {
          ...getItemBox(item),
          width: snappedSize.width,
          height: snappedSize.height
     });

     if (isNewPageCalendar) {
          const grid = getGridSize(page);
          const origin = getGridSnapOrigin(page);

          setItemBox(item, {
               ...getItemBox(item),
               x: origin.x + grid.x,
               y: origin.y + grid.y,
               width: Math.max(grid.x, snappedSize.width - (grid.x * 2)),
               height: Math.max(grid.y, snappedSize.height - (grid.y * 2))
          });
          return;
     }

     setItemBox(
          item,
          getMovedBox(
               item,
               page,
               event.clientX,
               event.clientY,
               activeAction.offsetX,
               activeAction.offsetY
          )
     );
}

function moveGroupItemsToDestination(destinationPage, activeStart, activeFinalRect) {
     const deltaLeft = activeFinalRect.left - activeStart.rect.left;
     const deltaTop = activeFinalRect.top - activeStart.rect.top;
     const destinationRect = destinationPage ? destinationPage.getBoundingClientRect() : plannerDesk.getBoundingClientRect();
     const viewZoom = destinationPage ? getViewZoom() : 1;

     activeAction.items.forEach(({ item, rect }) => {
          if (item === activeAction.item) {
               return;
          }

          const nextLeft = rect.left + deltaLeft;
          const nextTop = rect.top + deltaTop;
          const current = getItemBox(item);
          const nextBox = {
               ...current,
               x: (nextLeft - destinationRect.left) / viewZoom,
               y: (nextTop - destinationRect.top) / viewZoom
          };

          if (destinationPage) {
               const grid = getGridSize(destinationPage);
               const origin = getGridSnapOrigin(destinationPage);

               plannerDesk.append(item);
               markGridState(item, true, destinationPage);
               setItemBox(item, {
                    ...nextBox,
                    x: snapToGridOrigin(nextBox.x, origin.x, grid.x),
                    y: snapToGridOrigin(nextBox.y, origin.y, grid.y),
                    width: current.width,
                    height: current.height
               });
          } else {
               plannerDesk.append(item);
               setItemBox(item, nextBox);
               markGridState(item, false);
          }
     });
}

function setFloatingBox(item, clientX, clientY, offsetX, offsetY) {
     item.style.left = `${clientX - offsetX}px`;
     item.style.top = `${clientY - offsetY}px`;
}

function setMarqueeBox(marquee, startX, startY, currentX, currentY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const left = Math.min(startX, currentX) - deskRect.left;
     const top = Math.min(startY, currentY) - deskRect.top;
     const width = Math.abs(currentX - startX);
     const height = Math.abs(currentY - startY);

     marquee.style.left = `${left}px`;
     marquee.style.top = `${top}px`;
     marquee.style.width = `${width}px`;
     marquee.style.height = `${height}px`;

     return {
          x: left,
          y: top,
          width,
          height
     };
}

function updateMarqueeSelection(selectionBox) {
     const selectedFromMarquee = getPlannerItems().filter((item) => boxesIntersect(getDeskRelativeRect(item), selectionBox));
     const nextSelection = new Set(activeAction.baseSelection);

     selectedFromMarquee.forEach((item) => nextSelection.add(item));
     selectItems(Array.from(nextSelection));
}

function startMarquee(event) {
     if (event.button !== 0) {
          return;
     }

     const resizeMode = selectedItem && !event.target.closest(".planner-settings, .item-controls, .page-snap-controls")
          ? getResizeMode(selectedItem, event)
          : "";

     if (resizeMode) {
          startResize(selectedItem, event, resizeMode);
          return;
     }

     if (event.target.closest(".planner-item, .sticky-note, .planner-settings, .page-snap-controls")) {
          return;
     }

     const marquee = document.createElement("div");

     event.preventDefault();
     closeItemMenus();

     if (!event.metaKey && !event.ctrlKey) {
          clearSelection();
     }

     marquee.className = "selection-marquee";
     plannerDesk.append(marquee);
     activeAction = {
          type: "select",
          marquee,
          startX: event.clientX,
          startY: event.clientY,
          baseSelection: event.metaKey || event.ctrlKey ? new Set(selectedItems) : new Set()
     };
     setMarqueeBox(marquee, event.clientX, event.clientY, event.clientX, event.clientY);
}

function startMove(item, event) {
     const page = getItemPage(item);
     const itemRect = item.getBoundingClientRect();

     closeItemMenus();
     if (!selectedItems.has(item)) {
          selectItem(item);
     }

     const movingItems = Array.from(selectedItems);
     activeAction = {
          type: "pending-move",
          item,
          items: movingItems.map((movingItem) => {
               return {
                    item: movingItem,
                    page: getItemPage(movingItem),
                    box: getItemBox(movingItem),
                    rect: movingItem.getBoundingClientRect()
               };
          }),
          page,
          startX: event.clientX,
          startY: event.clientY,
          offsetX: event.clientX - itemRect.left,
          offsetY: event.clientY - itemRect.top
     };

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startSourceMove(event) {
     const source = event.currentTarget;
     const item = makePlannerItem(source.dataset.createType || "sticky");
     const sourceRect = source.getBoundingClientRect();
     const offsetX = event.clientX - sourceRect.left;
     const offsetY = event.clientY - sourceRect.top;

     event.preventDefault();
     closeItemMenus();
     closeSidebar();
     document.body.append(item);
     item.classList.add("is-floating-source", "is-dragging");
     item.style.width = `${sourceRect.width}px`;
     item.style.height = `${sourceRect.height}px`;
     setFloatingBox(item, event.clientX, event.clientY, offsetX, offsetY);

     activeAction = {
          type: "source",
          item,
          page: null,
          offsetX,
          offsetY
     };

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startResize(item, event, mode) {
     if (item.dataset.groupId) {
          return;
     }

     event.preventDefault();
     closeItemMenus();
     selectItem(item);
     updateItemSizeLabel(item);
     activeAction = {
          type: "resize",
          item,
          page: getItemPage(item),
          mode
     };
     item.classList.add("is-dragging", "is-resizing");

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function moveActiveItem(event) {
     if (!activeAction) {
          return;
     }

     if (activeAction.type === "sidebar-move") {
          activeAction.hasMoved = true;
          setSidebarBox(getMovedSidebarBox(event.clientX, event.clientY));
          return;
     }

     if (activeAction.type === "sidebar-resize") {
          setSidebarBox(getResizedSidebarBox(event.clientY));
          return;
     }

     if (activeAction.type === "select") {
          updateMarqueeSelection(setMarqueeBox(activeAction.marquee, activeAction.startX, activeAction.startY, event.clientX, event.clientY));
          return;
     }

     if (activeAction.type === "pending-move") {
          const deltaX = event.clientX - activeAction.startX;
          const deltaY = event.clientY - activeAction.startY;

          if (Math.hypot(deltaX, deltaY) < moveStartThreshold) {
               return;
          }

          event.preventDefault();
          activeAction.type = "move";
          activeAction.items.forEach(({ item }) => item.classList.add("is-dragging"));
     }

     const pointerPage = getPageFromPoint(event.clientX, event.clientY);
     const overlapPage = activeAction.type === "source" || activeAction.type === "move"
          ? getPageFromDraggedBox(activeAction.item, event.clientX, event.clientY, activeAction.offsetX, activeAction.offsetY)
          : null;
     const page = pointerPage || overlapPage;
     clearDragOver();
     markSnapReady(activeAction.item, Boolean(overlapPage || pointerPage));

     if (page) {
          page.classList.add("is-drag-over");
     }

     if (activeAction.type === "source") {
          setFloatingBox(activeAction.item, event.clientX, event.clientY, activeAction.offsetX, activeAction.offsetY);
          return;
     }

     if (activeAction.type === "move") {
          if (activeAction.page) {
               setItemBox(
                    activeAction.item,
                    getMovedBox(
                         activeAction.item,
                         activeAction.page,
                         event.clientX,
                         event.clientY,
                         activeAction.offsetX,
                         activeAction.offsetY,
                         false
                    )
               )
          } else {
               setItemBox(
                    activeAction.item,
                    getDeskBox(activeAction.item, event.clientX, event.clientY, activeAction.offsetX, activeAction.offsetY)
               );
          }

          const movedBox = getItemBox(activeAction.item);
          const startingBox = activeAction.items.find(({ item }) => item === activeAction.item).box;
          const deltaX = movedBox.x - startingBox.x;
          const deltaY = movedBox.y - startingBox.y;

          activeAction.items.forEach(({ item, page, box }) => {
               if (item === activeAction.item) {
                    return;
               }

               setItemBox(item, {
                    ...box,
                    x: box.x + deltaX,
                    y: box.y + deltaY
               });
          });
     }

     if (activeAction.type === "resize") {
          setItemBox(activeAction.item, getResizedBox(activeAction.item, activeAction.page, event.clientX, event.clientY, activeAction.mode));
          markGridState(activeAction.item, Boolean(activeAction.page));
     }
}

function endActiveItem(event) {
     if (!activeAction) {
          return;
     }

     if (activeAction.type === "sidebar-move" || activeAction.type === "sidebar-resize") {
          try {
               plannerSettings.releasePointerCapture(event.pointerId);
          } catch {
          }

          if (activeAction.type === "sidebar-move" && activeAction.hasMoved) {
               shouldSkipNextTabClick = true;
          }

          plannerSettings.classList.remove("is-dragging", "is-resizing");
          activeAction = null;
          return;
     }

     if (activeAction.type === "select") {
          activeAction.marquee.remove();
          shouldSkipNextClear = true;
          activeAction = null;
          return;
     }

     try {
          activeAction.item.releasePointerCapture(event.pointerId);
     } catch {
     }

     if (activeAction.type === "pending-move") {
          selectItem(activeAction.item);
          activeAction = null;
          clearDragOver();
          return;
     }

     if (activeAction.type === "source" || activeAction.type === "move") {
          const page = getPageFromDraggedBox(
               activeAction.item,
               event.clientX,
               event.clientY,
               activeAction.offsetX,
               activeAction.offsetY
          );

          if (page) {
               snapItemToPage(activeAction.item, page, event);
          } else {
               placeItemOnDesk(activeAction.item, event);
          }

          if (activeAction.type === "move" && activeAction.items.length > 1) {
               moveGroupItemsToDestination(page, activeAction.items.find(({ item }) => item === activeAction.item), activeAction.item.getBoundingClientRect());
          }

          if (activeAction.type === "move") {
               activeAction.items.forEach(({ item }) => item.classList.remove("is-dragging"));
          } else {
               activeAction.item.classList.remove("is-dragging");
               selectItem(activeAction.item);
          }
     } else {
          activeAction.item.classList.remove("is-dragging", "is-resizing");
          selectItem(activeAction.item);
     }

     markSnapReady(activeAction.item, false);
     notifyTemplateChanged();
     activeAction = null;
     clearDragOver();
}

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

window.perfectPlanner = {
     serializeTemplate: serializePlannerTemplate,
     snapViewToPage,
     turnNotebookSpread
};

syncAllSettingChoiceInputs();
initializeCustomSelects();
initializePalettePreview();
updateSettingsPanelSteps();
updateObjectControlsState();
syncResponsiveViewportClass();
applyPlannerConfig();
restorePlannerBook(plannerConfig.paperKey);
syncNotebookSpread();
if (isSinglePageViewport) {
     viewFocusIndex = 0;
}
applyViewControls();
syncSidebarSnap();
paperSelect.addEventListener("change", () => {
     syncSettingChoiceInputs("paper");
     changePaperSetting();
});
paperColorSelect.addEventListener("change", () => {
     changePlannerSetting();
     updatePalettePreview();
});
deskColorSelect.addEventListener("change", () => {
     syncSettingChoiceInputs("desk-color");
     changePlannerSetting();
});
settingSelects.forEach((select) => {
     select.addEventListener("change", () => updateCustomSelectDisplay(select));
});
settingChoiceInputs.forEach((input) => {
     input.addEventListener("change", () => changeSettingChoice(input));
});
guideInputs.forEach((input) => {
     input.addEventListener("change", changePlannerSetting);
});
insertPageButton?.addEventListener("click", insertFocusedPage);
deletePageButton?.addEventListener("click", deleteFocusedPage);
clearPageButton?.addEventListener("click", clearFocusedPage);
clearBookButton?.addEventListener("click", clearCurrentBook);
document.addEventListener("click", (event) => {
     const toggle = event.target.closest("[data-tertiary-matrix-toggle]");

     if (!toggle) {
          return;
     }

     event.preventDefault();
     event.stopPropagation();
     const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";

     activeTertiaryMatrixToggle = toggle;
     setTertiaryMatrixOpen(shouldOpen);
}, true);
pageSnapButtons.forEach((button) => {
     button.addEventListener("click", () => movePageSnap(button.dataset.pageSnap));
});
pages.forEach((page) => {
     page.addEventListener("click", (event) => {
          if (event.target.closest(".planner-item, .item-controls")) {
               return;
          }

          if (!isPageTurnCornerPointer(page, event)) {
               return;
          }

          turnNotebookSpread(page.dataset.turnPage === "next" ? 1 : -1);
     });
     page.addEventListener("pointermove", (event) => {
          page.classList.toggle("is-corner-hover", isPageTurnCornerPointer(page, event));
     });
     page.addEventListener("pointerleave", () => {
          page.classList.remove("is-corner-hover");
     });
});
settingsTabs.forEach((tab) => {
     tab.addEventListener("click", (event) => {
          if (shouldSkipNextTabClick) {
               shouldSkipNextTabClick = false;
               return;
          }

          const isActiveTab = tab.getAttribute("aria-selected") === "true";

          if (isActiveTab && plannerSettings.classList.contains("is-open")) {
               closeSidebar();
               return;
          }

          selectSettingsTab(tab.dataset.settingsTab);
          openSidebar();
     });
});
settingsStepButtons.forEach((button) => {
     button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (button.getAttribute("aria-disabled") === "true") {
               return;
          }
          stepSettingsTab(Number(button.dataset.settingsStep) || 0);
     });
});
plannerSettings.addEventListener("pointerdown", (event) => {
     if (event.target.closest("[data-settings-tab]")) {
          return;
     }

     const resizeMode = getSidebarVerticalResizeMode(event);

     if (resizeMode) {
          startSidebarResize(event, resizeMode);
     }
});
plannerSettings.addEventListener("pointermove", (event) => {
     if (activeAction) {
          return;
     }

     plannerSettings.classList.toggle("is-resize-ns", Boolean(getSidebarVerticalResizeMode(event)));
});
plannerSettings.addEventListener("pointerleave", () => {
     if (!activeAction) {
          plannerSettings.classList.remove("is-resize-ns");
     }
});
sourceItems.forEach((sourceItem) => {
     sourceItem.addEventListener("pointerdown", startSourceMove);
});
plannerDesk.addEventListener("pointerdown", startMarquee);
plannerDesk.addEventListener("pointermove", updateDeskResizeCursor);
plannerDesk.addEventListener("pointerleave", () => {
     plannerDesk.style.cursor = "";
     if (selectedItem) {
          setResizeCursor(selectedItem, "");
     }
});
plannerDesk.addEventListener("wheel", zoomViewFromWheel, {
     passive: false
});
document.addEventListener("pointerdown", collapseMenusFromOutsidePointer, true);
document.addEventListener("click", (event) => {
     if (shouldSkipNextClear) {
          shouldSkipNextClear = false;
          return;
     }

     customSelectDetails.forEach((details) => {
          if (!details.contains(event.target)) {
               details.removeAttribute("open");
          }
     });

     if (
          tertiaryMatrixPopover &&
          !tertiaryMatrixPopover.hidden &&
          !event.target.closest("[data-tertiary-matrix]") &&
          !event.target.closest("[data-tertiary-matrix-toggle]")
     ) {
          setTertiaryMatrixOpen(false);
     }

     if (!event.target.closest(".planner-item") && !event.target.closest(".planner-settings") && !event.target.closest(".page-snap-controls")) {
          clearSelection();
     }
});
document.addEventListener("pointerdown", closeHexPopoverFromOutsidePointer, true);
document.addEventListener("keydown", (event) => {
     if (event.key === "Escape") {
          closeCustomSelects();
          clearSelectFocus();
          setTertiaryMatrixOpen(false);
          closeHexPopover();
     }
});
window.addEventListener("pointermove", moveActiveItem);
window.addEventListener("pointerup", endActiveItem);
window.addEventListener("pointercancel", endActiveItem);
window.addEventListener("resize", handleWindowResize);
window.addEventListener("scroll", positionTertiaryMatrix, true);
singlePageViewportQuery.addEventListener("change", applyResponsiveViewMode);
