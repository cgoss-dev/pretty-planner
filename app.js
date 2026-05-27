// NOTE: Things The App Grabs From The HTML
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
const accentColorSelect = document.querySelector("[data-setting='accent-color']");
const deskColorSelect = document.querySelector("[data-setting='desk-color']");
const palettePreviewSwatches = document.querySelector("[data-palette-preview-swatches]");
const accentPaletteSwatches = document.querySelector("[data-accent-palette-swatches]");
const keyboardControlsPanel = document.querySelector("[data-keyboard-controls]");
const tertiaryMatrixPopover = document.querySelector("[data-tertiary-matrix]");
const tertiaryMatrixGrid = document.querySelector("[data-tertiary-matrix-grid]");
const settingSelects = Array.from(document.querySelectorAll("[data-setting]")).filter((select) => !["paper", "grid", "paper-color", "accent-color", "desk-color"].includes(select.dataset.setting));
const guideInputs = Array.from(document.querySelectorAll("[data-guide]"));
const settingsTabs = Array.from(document.querySelectorAll("[data-settings-tab]"));
const settingsPanels = Array.from(document.querySelectorAll("[data-settings-panel]"));
const settingsStepButtons = Array.from(document.querySelectorAll("[data-settings-step]"));
const objectControlsShell = document.querySelector("[data-object-controls-shell]");
const objectControlsEmpty = document.querySelector("[data-object-controls-empty]");
const pageSnapButtons = Array.from(document.querySelectorAll("[data-page-snap]"));
const zoomToast = document.querySelector("[data-zoom-toast]");
const keyHintPanel = document.querySelector("[data-key-hint-panel]");
const pageGridCursor = document.querySelector("[data-page-grid-cursor]");
const pageCornerFoldOverlay = document.createElement("div");
const pageCornerFoldOverlayNumber = document.createElement("span");
const settingChoiceInputs = Array.from(document.querySelectorAll("[data-setting-choice]"));
let customSelectDetails = [];
const {
     app: appControls,
     calendar: calendarControls,
     colors: colorControls,
     guides: guideControls,
     items: itemControls,
     notebook: notebookControls,
     paper: paperControls,
     screenReferencePaper,
     storage: storageControls,
     text: textControls,
     view: viewControls
} = PlannerRootControls.controls;
const singlePageViewportMaxWidth = appControls.singlePageViewportMaxWidth;
const singlePageViewportQuery = window.matchMedia(`(max-width: ${singlePageViewportMaxWidth}px)`);
const notebookViewportHeightReserve = appControls.notebookViewportHeightReserve;
const notebookViewportWidth = appControls.notebookViewportWidth;
const notebookMaxWidth = appControls.notebookMaxWidth;
const resizeEdgeSize = appControls.resizeEdgeSize;
const moveStartThreshold = appControls.moveStartThreshold;
const pageStickDepth = appControls.pageStickDepth;
const inchToCentimeters = appControls.inchToCentimeters;
const stickerGridUnits = itemControls.stickerGridUnits;
const tocLeftColumnGridUnits = itemControls.tocLeftColumnGridUnits;
const tocRightColumnMinGridUnits = itemControls.tocRightColumnMinGridUnits;
const perpetualCalendarMaxDayRows = itemControls.perpetualCalendarMaxDayRows;
const perpetualCalendarHeaderRows = itemControls.perpetualCalendarHeaderRows;
const perpetualCalendarLeftColumnGridUnits = itemControls.perpetualCalendarLeftColumnGridUnits;
const perpetualCalendarRightColumnMinGridUnits = itemControls.perpetualCalendarRightColumnMinGridUnits;
const itemGridUnits = itemControls.itemGridUnits;

const templateSchemaVersion = storageControls.templateSchemaVersion;
const plannerStorageKey = storageControls.plannerStorageKey;
const legacyPlannerStorageKey = storageControls.legacyPlannerStorageKey;
const plannerStateSchemaVersion = storageControls.plannerStateSchemaVersion;
const minNotebookPageCount = notebookControls.minPageCount;
const maxNotebookPageCount = notebookControls.maxPageCount;
const calendarMonthNames = calendarControls.monthNames;
const calendarYearRange = calendarControls.yearRange;
const viewZoomLevels = viewControls.zoomLevels;
const viewFocusPoints = viewControls.focusPoints;
const viewVerticalFocusPoints = viewControls.verticalFocusPoints;
const initialNotebookPageCount = notebookControls.initialPageCount;
const initialNotebookSpreadCount = notebookControls.initialSpreadCount;
let viewZoomIndex = 0;
let viewFocusIndex = 0;
let viewVerticalFocusIndex = 1;
let notebookPageCount = initialNotebookPageCount;
let currentSpreadIndex = 0;
let notebookSpreadCount = initialNotebookSpreadCount;
let pendingSpreadTurn = null;
let isSinglePageViewport = singlePageViewportQuery.matches;
let responsiveViewFrame = 0;
let wheelZoomDelta = 0;
let zoomToastTimer = 0;
let viewPanOffsetX = 0;
let viewPanOffsetY = 0;
const paperSizes = paperControls.sizes;
const paperViewScales = paperControls.viewScales;
const gridSizes = paperControls.gridSizes;
const colorPalettes = colorControls.palettes;
const colorPaletteOrder = colorControls.paletteOrder;
const tertiaryMatrixSteps = colorControls.tertiaryMatrixSteps;
const paperColorPalette = paperControls.colorPalette;
const paperColors = {
     ...Object.fromEntries(paperColorPalette.map((color) => [color.key, color])),
     Custom: {
          key: "Custom",
          label: "Custom",
          display: "Hex",
          color: "#ffffee"
     }
};
const accentColorPalette = [
     { key: "Red", label: "Red", display: "F00", color: "var(--tertiary-01)", ink: "var(--color-white)" },
     { key: "Orange", label: "Orange", display: "F40", color: "var(--tertiary-02)", ink: "var(--color-white)" },
     { key: "Amber", label: "Amber", display: "F80", color: "var(--tertiary-03)" },
     { key: "Gold", label: "Gold", display: "FC0", color: "var(--tertiary-04)" },
     { key: "Yellow", label: "Yellow", display: "FF0", color: "var(--tertiary-05)" },
     { key: "Lime", label: "Lime", display: "8F0", color: "var(--tertiary-06)" },
     { key: "Green", label: "Green", display: "0F0", color: "var(--tertiary-07)" },
     { key: "Sky", label: "Sky", display: "08F", color: "var(--tertiary-08)", ink: "var(--color-white)" },
     { key: "Blue", label: "Blue", display: "00F", color: "var(--tertiary-09)", ink: "var(--color-white)" },
     { key: "Violet", label: "Violet", display: "40F", color: "var(--tertiary-10)", ink: "var(--color-white)" },
     { key: "Purple", label: "Purple", display: "80F", color: "var(--tertiary-11)", ink: "var(--color-white)" },
     { key: "Magenta", label: "Magenta", display: "F0F", color: "var(--tertiary-12)" }
];
const accentColors = {
     ...Object.fromEntries(accentColorPalette.map((color) => [color.key, color])),
     Custom: {
          key: "Custom",
          label: "Custom",
          display: "Hex",
          color: "#ff0000",
          ink: "var(--color-white)"
     }
};
const deskColors = colorControls.deskColors;
const textLineHeightCellOptions = textControls.lineHeightCellOptions;

let activeAction = null;
let selectedItem = null;
let selectedItems = new Set();
let nextTemplateItemId = 1;
let nextGroupId = 1;
let plannerClipboard = null;
let keyboardMode = "interact";
let designBranch = "root";
let shouldSkipNextClear = false;
let shouldSkipNextItemClick = false;
let shouldSkipNextTabClick = false;
let keyboardCursor = {
     column: 1,
     row: 1,
     pageSide: "left",
     isInitialized: false
};
let keyboardCursorIdleTimer = 0;
let isKeyboardCursorActive = false;
let hasUsedKeyboardCursor = false;
let interactFocusItem = null;
let interactFocusTarget = null;

pageCornerFoldOverlay.className = "page-corner-fold-overlay";
pageCornerFoldOverlayNumber.className = "page-corner-fold-overlay-number";
pageCornerFoldOverlay.append(pageCornerFoldOverlayNumber);
plannerDesk.append(pageCornerFoldOverlay);
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

// NOTE: Paper Size, Grid Size, And Planner Measurements
function buildPlannerConfig() {
     const paperKey = paperSelect ? paperSelect.value : "letter";
     const gridKey = getGridKeyForPaper(paperKey);
     const paperColorKey = paperColorSelect ? paperColorSelect.value : "Offwhite";
     const accentColorKey = accentColorSelect ? accentColorSelect.value : "Red";
     const deskColorKey = deskColorSelect ? deskColorSelect.value : "pink";
     const guides = {
          thirds: false,
          fourths: true
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
          accentColorKey,
          deskColorKey,
          guides,
          paper,
          paperColor: paperColors[paperColorKey] || paperColors.Offwhite,
          accentColor: accentColors[accentColorKey] || accentColors.Red,
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

function syncGridSnapOrigins() {
     pages.forEach((page) => {
          const pageId = getPageId(page);
          const origin = getGridSnapOriginUnitsForPageId(pageId);

          page.dataset.gridSnapOriginX = String(origin.x);
          page.dataset.gridSnapOriginY = String(origin.y);
          page.style.setProperty("--grid-snap-origin-x", String(origin.x));
          page.style.setProperty("--grid-snap-origin-y", String(origin.y));
     });
}

function setRootNumber(name, value) {
     document.documentElement.style.setProperty(name, String(value));
}

function setRootLength(name, value) {
     document.documentElement.style.setProperty(name, `${value}%`);
}

function getMiniMonthGridUnits(item) {
     return {
          width: 8,
          height: 8
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

     if (isStickerTextItem(item)) {
          return item.offsetHeight / (getItemGridUnits(item)?.height || stickerGridUnits);
     }

     if (item.dataset.itemType === "mini-month") {
          return item.offsetHeight / getMiniMonthGridUnits(item).height;
     }

     if (item.dataset.itemType === "full-month" || item.dataset.itemType === "weekly-vertical") {
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

// NOTE: Zoom And Which Page You Are Looking At
function applyViewControls(zoomAnchor = null) {
     const zoom = viewZoomLevels[viewZoomIndex];
     const shouldCenterFocusedPage = isSinglePageViewport || viewZoomIndex > 0;

     document.documentElement.dataset.viewFocus = viewFocusPoints[viewFocusIndex];
     setRootNumber("--view-zoom", zoom.value);
     setRootNumber("--view-pan-x", "0px");
     setRootNumber("--view-pan-y", "0px");
     syncKeyboardCursorWithFocusedPage();

     if (shouldCenterFocusedPage) {
          syncViewTargetCenter(zoomAnchor);
     } else {
          requestAnimationFrame(() => {
               refreshPageItemViews();
               scheduleKeyboardCursorUpdate();
          });
     }
     updatePageSnapButtons();
     scheduleKeyboardCursorUpdate();
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

          requestAnimationFrame(() => {
               refreshPageItemViews();
               scheduleKeyboardCursorUpdate();
          });
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
     if (direction === "out") {
          resetViewPanOffset();
          viewVerticalFocusIndex = 1;
     }
     applyViewControls(direction === "in" ? zoomAnchor : null);
     showZoomToast();
}

function cycleViewZoom() {
     // NOTE: Cycles through zoom levels with one key, wrapping back to 100% after the closest zoom
     const nextZoomIndex = viewZoomIndex >= viewZoomLevels.length - 1 ? 0 : viewZoomIndex + 1;

     if (nextZoomIndex === viewZoomIndex) {
          return;
     }

     viewZoomIndex = nextZoomIndex;
     if (viewZoomIndex === 0) {
          resetViewPanOffset();
          viewVerticalFocusIndex = viewVerticalFocusPoints.indexOf("mid");
          if (viewVerticalFocusIndex === -1) {
               viewVerticalFocusIndex = 0;
          }
     }
     applyViewControls();
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
     if (event.target.closest(".sticker-text[contenteditable='true'], .calendar-day-text[contenteditable='true']")) {
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
     const canUseHorizontalSnapControls = isSinglePageViewport || viewZoomIndex > 0;
     const canUseVerticalSnapControls = viewZoomIndex > 0;

     pageSnapButtons.forEach((button) => {
          const direction = button.dataset.pageSnap;

          if ((direction === "previous" || direction === "next") && !canUseHorizontalSnapControls) {
               button.hidden = true;
               return;
          }

          if ((direction === "up" || direction === "down") && !canUseVerticalSnapControls) {
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

     PageControls.movePageSnap({
          direction,
          moveViewFocus,
          moveViewVerticalFocus
     });
}

function getCurrentSpreadPageNumber(side = "left") {
     return PageControls.getCurrentSpreadPageNumber({ currentSpreadIndex, side });
}

function getSpreadCountForPageCount(pageCount) {
     return PageControls.getSpreadCountForPageCount(pageCount);
}

function normalizeNotebookPageCount(pageCount) {
     return PageControls.normalizeNotebookPageCount({
          pageCount,
          initialNotebookPageCount,
          minNotebookPageCount,
          maxNotebookPageCount,
          clamp
     });
}

function getPageSideForPageNumber(pageNumber) {
     return PageControls.getPageSideForPageNumber(pageNumber);
}

function isPageNumberAvailable(pageNumber) {
     return PageControls.isPageNumberAvailable({ pageNumber, notebookPageCount });
}

function isFinalRightPlaceholderPage(pageNumber) {
     return PageControls.isFinalRightPlaceholderPage({ pageNumber, notebookPageCount });
}

function isPageSideAvailable(side, spreadIndex = currentSpreadIndex) {
     return PageControls.isPageSideAvailable({ side, spreadIndex, notebookPageCount });
}

function formatPageNumber(pageNumber) {
     return PageControls.formatPageNumber({ pageNumber, notebookPageCount });
}

function getFocusedPageSide() {
     return PageControls.getFocusedPageSide({ viewFocusPoints, viewFocusIndex });
}

function getFocusedPageNumber() {
     return PageControls.getFocusedPageNumber({ currentSpreadIndex, viewFocusPoints, viewFocusIndex });
}

function setNotebookPageCount(pageCount) {
     const pageState = PageControls.getNotebookPageCountState({
          pageCount,
          currentSpreadIndex,
          viewFocusIndex,
          viewFocusPoints,
          initialNotebookPageCount,
          minNotebookPageCount,
          maxNotebookPageCount,
          clamp
     });

     notebookPageCount = pageState.notebookPageCount;
     notebookSpreadCount = pageState.notebookSpreadCount;
     currentSpreadIndex = pageState.currentSpreadIndex;
     viewFocusIndex = pageState.viewFocusIndex;
}

function setFocusedPageNumber(pageNumber) {
     const pageState = PageControls.getFocusedPageState({
          pageNumber,
          notebookPageCount,
          notebookSpreadCount,
          viewFocusPoints,
          clamp
     });

     currentSpreadIndex = pageState.currentSpreadIndex;
     viewFocusIndex = pageState.viewFocusIndex;
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
     PageControls.updatePageActionButtons({
          focusedPageNumber: getFocusedPageNumber(),
          notebookPageCount,
          minNotebookPageCount,
          maxNotebookPageCount,
          insertPageButton,
          deletePageButton,
          pageCountStatus
     });
}

function updatePageLabels() {
     PageControls.updatePageLabels({
          pages,
          notebook,
          currentSpreadIndex,
          notebookSpreadCount,
          notebookPageCount,
          getPageId,
          getCurrentSpreadPageNumber,
          isPageNumberAvailable,
          isFinalRightPlaceholderPage,
          formatPageNumber
     });
}

function updateSpreadItemVisibility() {
     PageControls.updateSpreadItemVisibility({
          items: getAllPlannerItems(),
          currentSpreadIndex,
          notebookPageCount,
          getItemSpreadIndex,
          getItemPageNumber,
          closeItemMenu,
          selectedItems,
          setSelectedItem: (item) => {
               selectedItem = item;
          },
          updateObjectControlsState
     });
}

function syncNotebookSpread() {
     PageControls.syncNotebookSpread({
          updatePageLabels,
          updateSpreadItemVisibility,
          updatePageSnapButtons,
          refreshPageItemViews
     });
}

function turnNotebookSpread(step) {
     PageControls.turnNotebookSpread({
          step,
          currentSpreadIndex,
          notebookSpreadCount,
          pendingSpreadTurn,
          notebook,
          clamp,
          clearSelection,
          setPendingSpreadTurn: (turn) => {
               pendingSpreadTurn = turn;
          },
          setCurrentSpreadIndex: (spreadIndex) => {
               currentSpreadIndex = spreadIndex;
          },
          resetViewPanOffset,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     });
}

function handlePageTurnKey(event) {
     // NOTE: Uses Q/E for previous/next page or menu tab, with bracket and page keys kept as legacy aliases
     if (
          event.defaultPrevented ||
          activeAction ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTypingFieldShortcutTarget(event.target)
     ) {
          return;
     }

     const key = event.key.toLowerCase();

     if (key === "q" || event.key === "[" || event.key === "PageDown") {
          event.preventDefault();
          if (plannerSettings.classList.contains("is-open")) {
               stepSettingsTab(-1);
          } else {
               turnNotebookSpread(-1);
          }
     } else if (key === "e" || event.key === "]" || event.key === "PageUp") {
          event.preventDefault();
          if (plannerSettings.classList.contains("is-open")) {
               stepSettingsTab(1);
          } else {
               turnNotebookSpread(1);
          }
     }
}

function handleMainMenuToggleKey(event) {
     // NOTE: Legacy no-op; numeric keyboard mode handling owns Design/Interact transitions
     if (
          event.defaultPrevented ||
          activeAction ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTextInputShortcutTarget(event.target)
     ) {
          return;
     }
}

function isTypingFieldShortcutTarget(target) {
     // NOTE: Detects fields where letter or arrow shortcuts should not interrupt text entry
     const input = target?.closest?.("textarea, [contenteditable='true'], input");

     if (!input) {
          return false;
     }

     if (input.matches("textarea, [contenteditable='true']")) {
          return true;
     }

     const type = (input.getAttribute("type") || "text").toLowerCase();

     return !["button", "checkbox", "radio", "range", "color", "submit", "reset"].includes(type);
}

function handleMenuEnterKey(event) {
     // NOTE: Activates the focused menu control with E or Enter while the main menu is open
     if (
          event.defaultPrevented ||
          activeAction ||
          !plannerSettings.classList.contains("is-open") ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTypingFieldShortcutTarget(event.target)
     ) {
          return;
     }

     if (event.key !== "Enter" && event.key.toLowerCase() !== "e") {
          return;
     }

     const activeElement = document.activeElement;

     if (!activeElement || !plannerSettings.contains(activeElement)) {
          return;
     }

     event.preventDefault();
     if (activeElement.matches("[data-create-item]")) {
          startKeyboardSourcePlacement(activeElement);
          return;
     }

     activateMenuFocusedElement(activeElement);
}

function getKeyboardDirection(event) {
     // NOTE: Normalizes WASD and arrow keys to one shared movement vocabulary
     const directions = {
          ArrowLeft: "left",
          ArrowRight: "right",
          ArrowUp: "up",
          ArrowDown: "down",
          a: "left",
          d: "right",
          w: "up",
          s: "down"
     };

     return directions[event.key] || directions[event.key.toLowerCase()];
}

function isCancelKey(event) {
     // NOTE: Treats Delete as the right-hand companion to Escape for backing out of modes
     return event.key === "Escape" || event.key === "Delete";
}

function getKeyboardCursorPage() {
     // NOTE: Finds the current page for the keyboard grid cursor
     const page = pages.find((plannerPage) => getPageId(plannerPage) === keyboardCursor.pageSide);

     if (page && !page.classList.contains("is-missing-page")) {
          return page;
     }

     const focusedSide = getFocusedPageSide();
     const focusedPage = pages.find((plannerPage) => getPageId(plannerPage) === focusedSide);

     return focusedPage || pages.find((plannerPage) => !plannerPage.classList.contains("is-missing-page")) || pages[0] || null;
}

function getKeyboardGridMetrics(page) {
     // NOTE: Returns page grid metrics for cursor labels and keyboard movement
     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);

     return {
          grid,
          origin,
          columns: Math.max(1, Math.round(plannerConfig.gridColumns)),
          rows: Math.max(1, Math.round(plannerConfig.gridRows))
     };
}

function getKeyboardCursorPageNumber() {
     // NOTE: Matches the cursor label page number to the page badge number
     const side = keyboardCursor.pageSide;

     return getCurrentSpreadPageNumber(side);
}

function getKeyboardCursorLabel() {
     // NOTE: Formats the cursor anchor as page, row, and column
     const pageSide = keyboardCursor.pageSide === "right" ? "PR" : "PL";

     return `${pageSide}${getKeyboardCursorPageNumber()} R${keyboardCursor.row} C${keyboardCursor.column}`;
}

function getKeyboardCursorAnchor(page = getKeyboardCursorPage()) {
     // NOTE: Returns the page-local upper-left anchor point for keyboard actions
     if (!page) {
          return null;
     }

     const metrics = getKeyboardGridMetrics(page);

     return {
          x: metrics.origin.x + ((keyboardCursor.column - 1) * metrics.grid.x),
          y: metrics.origin.y + ((keyboardCursor.row - 1) * metrics.grid.y),
          ...metrics
     };
}

function setKeyboardCursor(page, column, row) {
     // NOTE: Moves the keyboard grid cursor to a clamped row and column on a page
     if (!page) {
          return;
     }

     const metrics = getKeyboardGridMetrics(page);

     keyboardCursor = {
          pageSide: getPageId(page),
          column: clamp(Math.round(Number(column)) || 1, 1, metrics.columns),
          row: clamp(Math.round(Number(row)) || 1, 1, metrics.rows),
          isInitialized: true
     };
     updateKeyboardCursor();
}

function setKeyboardCursorFromBox(item, page = getItemPage(item)) {
     // NOTE: Moves the keyboard cursor to an item's upper-left grid anchor
     if (!item || !page) {
          return;
     }

     const box = getItemBox(item);
     const metrics = getKeyboardGridMetrics(page);
     const column = Math.round((box.x - metrics.origin.x) / metrics.grid.x) + 1;
     const row = Math.round((box.y - metrics.origin.y) / metrics.grid.y) + 1;

     setKeyboardCursor(page, column, row);
}

function syncKeyboardCursorWithFocusedPage() {
     // NOTE: Initializes or clamps the cursor when the visible page or paper grid changes
     const focusedSide = getFocusedPageSide();
     const page = pages.find((plannerPage) => getPageId(plannerPage) === focusedSide) || getKeyboardCursorPage();

     if (!page) {
          return;
     }

     const metrics = getKeyboardGridMetrics(page);
     const shouldCenter = !keyboardCursor.isInitialized;
     const column = shouldCenter ? Math.ceil(metrics.columns / 2) : keyboardCursor.column;
     const row = shouldCenter ? Math.ceil(metrics.rows / 2) : keyboardCursor.row;

     setKeyboardCursor(page, column, row);
}

function shouldShowKeyboardCursor() {
     // NOTE: Shows the cursor only when keyboard page actions are relevant
     return Boolean(
          pageGridCursor &&
          hasUsedKeyboardCursor &&
          !plannerSettings.classList.contains("is-open") &&
          !document.querySelector("[contenteditable='true']")
     );
}

function wakeKeyboardCursor() {
     // NOTE: Reveals the keyboard cursor after directional-key use, then dims it after three idle seconds
     hasUsedKeyboardCursor = true;
     isKeyboardCursorActive = true;
     window.clearTimeout(keyboardCursorIdleTimer);
     keyboardCursorIdleTimer = window.setTimeout(() => {
          hasUsedKeyboardCursor = false;
          isKeyboardCursorActive = false;
          updateKeyboardCursor();
          renderKeyHints();
     }, 3000);
     updateKeyboardCursor();
}

function hideKeyboardCursorForPointer() {
     // NOTE: Leaves keyboard navigation mode when the user goes back to pointer navigation
     if (!hasUsedKeyboardCursor) {
          return;
     }

     hasUsedKeyboardCursor = false;
     isKeyboardCursorActive = false;
     window.clearTimeout(keyboardCursorIdleTimer);
     updateKeyboardCursor();
     renderKeyHints();
}

function scheduleKeyboardCursorUpdate() {
     // NOTE: Repositions the cursor after page layout, pan, and turn animation transforms settle
     requestAnimationFrame(() => {
          requestAnimationFrame(updateKeyboardCursor);
     });
}

function updateKeyboardCursor() {
     // NOTE: Positions the visible page cursor and updates its anchor label
     if (!pageGridCursor) {
          return;
     }

     const page = getKeyboardCursorPage();

     if (!page || !keyboardCursor.isInitialized || !shouldShowKeyboardCursor()) {
          pageGridCursor.classList.remove("is-visible", "is-idle");
          return;
     }

     const anchor = getKeyboardCursorAnchor(page);
     const deskRect = plannerDesk.getBoundingClientRect();
     const pageRect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();

     pageGridCursor.style.left = `${pageRect.left - deskRect.left + (anchor.x * viewZoom)}px`;
     pageGridCursor.style.top = `${pageRect.top - deskRect.top + (anchor.y * viewZoom)}px`;
     pageGridCursor.style.width = `${anchor.grid.x * viewZoom}px`;
     pageGridCursor.style.height = `${anchor.grid.y * viewZoom}px`;
     pageGridCursor.classList.add("is-visible");
     pageGridCursor.classList.toggle("is-idle", !isKeyboardCursorActive);
}

function moveKeyboardCursor(direction) {
     // NOTE: Moves the page grid cursor by one row or column
     const page = getKeyboardCursorPage();

     if (!page) {
          return;
     }

     const deltas = {
          left: { column: -1, row: 0 },
          right: { column: 1, row: 0 },
          up: { column: 0, row: -1 },
          down: { column: 0, row: 1 }
     };
     const delta = deltas[direction];

     if (!delta) {
          return;
     }

     setKeyboardCursor(page, keyboardCursor.column + delta.column, keyboardCursor.row + delta.row);
     wakeKeyboardCursor();
     renderKeyHints();
}

function getItemAtKeyboardCursor() {
     // NOTE: Finds the topmost visible widget under the cursor anchor
     const page = getKeyboardCursorPage();
     const anchor = getKeyboardCursorAnchor(page);

     if (!page || !anchor) {
          return null;
     }

     return getPlannerItems().reverse().find((item) => {
          const itemPage = getItemPage(item);

          if (itemPage !== page || item.classList.contains("is-spread-hidden")) {
               return false;
          }

          const box = getItemBox(item);

          return anchor.x >= box.x &&
               anchor.x <= box.x + box.width &&
               anchor.y >= box.y &&
               anchor.y <= box.y + box.height;
     }) || null;
}

function activateKeyboardCursor() {
     // NOTE: Selects, edits, or clears based on what sits under the keyboard cursor
     const item = getItemAtKeyboardCursor();

     if (!item) {
          return false;
     }

     if (item === selectedItem && selectedItems.size === 1 && startSelectedItemTextEditing(item)) {
          return true;
     }

     selectItem(item);
     setKeyboardCursorFromBox(item);
     return true;
}

function getElementCenter(element) {
     const rect = element.getBoundingClientRect();

     return {
          rect,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
     };
}

function isElementVisibleForFocus(element) {
     const rect = element.getBoundingClientRect();

     return rect.width > 0 && rect.height > 0 && !element.closest(".is-spread-hidden, [hidden]");
}

function chooseSpatialElement(elements, currentElement, direction) {
     const visibleElements = elements.filter(isElementVisibleForFocus);

     if (!visibleElements.length) {
          return null;
     }

     const orderedElements = [...visibleElements].sort((first, second) => {
          const firstRect = first.getBoundingClientRect();
          const secondRect = second.getBoundingClientRect();

          return firstRect.top - secondRect.top || firstRect.left - secondRect.left;
     });

     if (!currentElement || !visibleElements.includes(currentElement)) {
          return orderedElements[0];
     }

     const current = getElementCenter(currentElement);
     const directionalCandidates = visibleElements
          .filter((element) => element !== currentElement)
          .map((element) => {
               const candidate = getElementCenter(element);
               const deltaX = candidate.x - current.x;
               const deltaY = candidate.y - current.y;
               const isDirectional = (
                    (direction === "left" && deltaX < -1) ||
                    (direction === "right" && deltaX > 1) ||
                    (direction === "up" && deltaY < -1) ||
                    (direction === "down" && deltaY > 1)
               );

               if (!isDirectional) {
                    return null;
               }

               const primary = direction === "left" || direction === "right" ? Math.abs(deltaX) : Math.abs(deltaY);
               const cross = direction === "left" || direction === "right" ? Math.abs(deltaY) : Math.abs(deltaX);

               return {
                    element,
                    score: primary + cross * 0.65
               };
          })
          .filter(Boolean)
          .sort((first, second) => first.score - second.score);

     if (directionalCandidates[0]) {
          return directionalCandidates[0].element;
     }

     const currentIndex = orderedElements.indexOf(currentElement);

     if (currentIndex === -1) {
          return orderedElements[0];
     }

     return direction === "left" || direction === "up"
          ? orderedElements[(currentIndex - 1 + orderedElements.length) % orderedElements.length]
          : orderedElements[(currentIndex + 1) % orderedElements.length];
}

function getInteractFocusItems() {
     return getPlannerItems().filter((item) => getItemPage(item) && isElementVisibleForFocus(item));
}

function clearInteractFocusTarget() {
     document.querySelectorAll(".is-interact-target").forEach((element) => element.classList.remove("is-interact-target"));
     interactFocusTarget = null;
}

function clearInteractFocus() {
     clearInteractFocusTarget();
     document.querySelectorAll(".is-interact-focus").forEach((element) => element.classList.remove("is-interact-focus"));
     interactFocusItem = null;
}

function setInteractFocusItem(item) {
     clearInteractFocus();

     if (!item) {
          renderKeyHints();
          return false;
     }

     interactFocusItem = item;
     item.classList.add("is-interact-focus");
     item.scrollIntoView({
          block: "nearest",
          inline: "nearest"
     });
     renderKeyHints();
     return true;
}

function setInteractFocusTarget(item, target) {
     clearInteractFocusTarget();

     if (!item || !target) {
          renderKeyHints();
          return false;
     }

     interactFocusItem = item;
     item.classList.add("is-interact-focus");
     interactFocusTarget = target;
     target.classList.add("is-interact-target");
     target.scrollIntoView({
          block: "nearest",
          inline: "nearest"
     });
     renderKeyHints();
     return true;
}

function getInteractWidgetTargets(item) {
     if (!item) {
          return [];
     }

     if (item.dataset.itemType === "mini-month") {
          return Array.from(item.querySelectorAll(".mini-month .dayCell[data-day-key]"));
     }

     if (item.dataset.itemType === "full-month") {
          return Array.from(item.querySelectorAll(".mini-month .dayCell[data-day-key]"));
     }

     if (item.dataset.itemType === "perpetual-calendar") {
          return Array.from(item.querySelectorAll(".perpetual-calendar-row[data-day-key]"));
     }

     if (item.dataset.itemType === "weekly-vertical") {
          return Array.from(item.querySelectorAll(".weekly-vertical-slot.dayCell[data-day-key]"));
     }

     const stickerText = item.querySelector(".sticker-text");

     return stickerText ? [stickerText] : [];
}

function moveInteractFocus(direction) {
     if (keyboardMode !== "interact") {
          return false;
     }

     if (interactFocusTarget && interactFocusItem) {
          const targets = getInteractWidgetTargets(interactFocusItem);
          const nextTarget = chooseSpatialElement(targets, interactFocusTarget, direction);

          if (nextTarget) {
               return setInteractFocusTarget(interactFocusItem, nextTarget);
          }
     }

     const nextItem = chooseSpatialElement(getInteractFocusItems(), interactFocusItem, direction);

     return setInteractFocusItem(nextItem);
}

function enterInteractWidgetFocus(item = interactFocusItem) {
     if (!item) {
          return false;
     }

     const targets = getInteractWidgetTargets(item);

     if (!targets.length) {
          return false;
     }

     if (isStickerTextItem(item) || isPageTitleItem(item)) {
          startStickerTextEditing(item);
          return true;
     }

     return setInteractFocusTarget(item, targets[0]);
}

function activateInteractFocus() {
     if (keyboardMode !== "interact") {
          return false;
     }

     if (!interactFocusItem) {
          return setInteractFocusItem(selectedItem || getInteractFocusItems()[0]);
     }

     if (!interactFocusTarget) {
          return enterInteractWidgetFocus(interactFocusItem);
     }

     const textElement = interactFocusTarget.matches(".calendar-day-text")
          ? interactFocusTarget
          : interactFocusTarget.querySelector(".calendar-day-text");

     if (textElement) {
          startCalendarDayTextEditing(textElement, interactFocusItem);
          return true;
     }

     return false;
}

function stepBackInteractFocus() {
     if (interactFocusTarget) {
          clearInteractFocusTarget();
          renderKeyHints();
          return true;
     }

     if (interactFocusItem) {
          clearInteractFocus();
          renderKeyHints();
          return true;
     }

     return false;
}

function handleKeyboardCursorActivateKey(event) {
     // NOTE: Uses E or Enter as the page cursor activate key when the menu is closed
     if (
          event.defaultPrevented ||
          activeAction ||
          plannerSettings.classList.contains("is-open") ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTypingFieldShortcutTarget(event.target)
     ) {
          return;
     }

     if (event.key !== "Enter") {
          return;
     }

     if (keyboardMode === "interact") {
          const hadInteractFocus = Boolean(interactFocusItem);

          if (activateInteractFocus() || hadInteractFocus) {
               event.preventDefault();
          }
          return;
     }

     if (activateKeyboardCursor()) {
          event.preventDefault();
          renderKeyHints();
     }
}

function getKeyboardPlacementPage() {
     // NOTE: Finds the visible page that should receive a keyboard-placed widget
     const cursorPage = getKeyboardCursorPage();

     if (cursorPage && !cursorPage.classList.contains("is-missing-page")) {
          return cursorPage;
     }

     const focusedSide = getFocusedPageSide();
     const focusedPage = pages.find((page) => getPageId(page) === focusedSide);

     if (focusedPage && !focusedPage.classList.contains("is-missing-page")) {
          return focusedPage;
     }

     return pages.find((page) => !page.classList.contains("is-missing-page")) || pages[0] || null;
}

function centerKeyboardPlacementItem(item, page) {
     // NOTE: Centers a newly keyboard-created widget on the active page grid
     if (!page || isFullPageCalendarType(item.dataset.itemType)) {
          return;
     }

     const box = getItemBox(item);
     const pageRect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();
     const pageWidth = pageRect.width / viewZoom;
     const pageHeight = pageRect.height / viewZoom;
     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const centeredX = snapToGridOrigin((pageWidth - box.width) / 2, origin.x, grid.x);
     const centeredY = snapToGridOrigin((pageHeight - box.height) / 2, origin.y, grid.y);

     setItemBox(item, {
          ...box,
          x: clamp(centeredX, 0, Math.max(0, pageWidth - box.width)),
          y: clamp(centeredY, 0, Math.max(0, pageHeight - box.height))
     });
}

function placeKeyboardPlacementItemAtCursor(item, page) {
     // NOTE: Places a new keyboard widget with its upper-left corner on the cursor anchor
     if (!page || isFullPageCalendarType(item.dataset.itemType)) {
          return;
     }

     if (getPageId(page) !== keyboardCursor.pageSide) {
          setKeyboardCursorFromBox(item, page);
          return;
     }

     const box = getItemBox(item);
     const anchor = getKeyboardCursorAnchor(page);
     const pageRect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();
     const pageWidth = pageRect.width / viewZoom;
     const pageHeight = pageRect.height / viewZoom;

     setItemBox(item, {
          ...box,
          x: clamp(anchor.x, 0, Math.max(0, pageWidth - box.width)),
          y: clamp(anchor.y, 0, Math.max(0, pageHeight - box.height))
     });
     setKeyboardCursorFromBox(item, page);
}

function startKeyboardSourcePlacement(source) {
     // NOTE: Creates a widget from the menu and enters keyboard placement mode
     if (activeAction || !source?.matches?.("[data-create-item]")) {
          return false;
     }

     const page = getKeyboardPlacementPage();

     if (!page) {
          return false;
     }

     const item = makePlannerItem(source.dataset.createType || "sticker");
     const sourceRect = source.getBoundingClientRect();
     const pageRect = page.getBoundingClientRect();
     const offsetX = sourceRect.width / 2;
     const offsetY = sourceRect.height / 2;
     const fakeEvent = {
          clientX: pageRect.left + (pageRect.width / 2),
          clientY: pageRect.top + (pageRect.height / 2)
     };

     closeItemMenus();
     document.body.append(item);
     item.classList.add("is-floating-source", "is-dragging");
     item.style.width = `${sourceRect.width}px`;
     item.style.height = `${sourceRect.height}px`;

     activeAction = {
          type: "source",
          item,
          page,
          didMove: true,
          offsetX,
          offsetY
     };

     if (!snapItemToPage(item, page, fakeEvent)) {
          removeRejectedSourceItem();
          activeAction = null;
          renderKeyHints();
          return false;
     }

     placeKeyboardPlacementItemAtCursor(item, page);
     markSnapReady(item, true);
     selectItem(item);
     activeAction = {
          type: "keyboard-source",
          item,
          page
     };
     closeSidebar();
     renderKeyHints();
     return true;
}

function moveKeyboardPlacementItem(direction) {
     // NOTE: Moves the keyboard-held widget by one grid cell in the requested direction
     const item = activeAction?.item;
     const page = activeAction?.page;

     if (!item || !page) {
          return;
     }

     const box = getItemBox(item);
     const grid = getGridSize(page);
     const pageRect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();
     const pageWidth = pageRect.width / viewZoom;
     const pageHeight = pageRect.height / viewZoom;
     const delta = {
          left: { x: -grid.x, y: 0 },
          right: { x: grid.x, y: 0 },
          up: { x: 0, y: -grid.y },
          down: { x: 0, y: grid.y }
     }[direction];

     if (!delta) {
          return;
     }

     setItemBox(item, {
          ...box,
          x: clamp(box.x + delta.x, 0, Math.max(0, pageWidth - box.width)),
          y: clamp(box.y + delta.y, 0, Math.max(0, pageHeight - box.height))
     });
     setKeyboardCursorFromBox(item, page);
     wakeKeyboardCursor();
     renderKeyHints();
}

function finishKeyboardPlacement() {
     // NOTE: Places the keyboard-held widget and saves the planner state
     if (activeAction?.type !== "keyboard-source") {
          return;
     }

     const item = activeAction.item;

     item.classList.remove("is-dragging");
     markSnapReady(item, false);
     selectItem(item);
     notifyTemplateChanged();
     activeAction = null;
     clearDragOver();
     setKeyboardCursorFromBox(item);
     renderKeyHints();
}

function cancelKeyboardPlacement() {
     // NOTE: Removes a keyboard-created widget when placement is cancelled
     if (activeAction?.type !== "keyboard-source") {
          return;
     }

     const item = activeAction.item;

     selectedItems.delete(item);
     if (selectedItem === item) {
          selectedItem = null;
     }
     item.remove();
     activeAction = null;
     clearDragOver();
     updateObjectControlsState();
     renderKeyHints();
}

function handleKeyboardPlacementKey(event) {
     // NOTE: Handles WASD/arrow movement, E/Enter placement, and Delete/Escape cancel while placing a widget
     if (activeAction?.type !== "keyboard-source" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return;
     }

     const direction = getKeyboardDirection(event);

     if (direction) {
          event.preventDefault();
          moveKeyboardPlacementItem(direction);
          return;
     }

     if (event.key === "Enter" || event.key.toLowerCase() === "e") {
          event.preventDefault();
          finishKeyboardPlacement();
          return;
     }

     if (isCancelKey(event)) {
          event.preventDefault();
          cancelKeyboardPlacement();
     }
}

function getKeyboardMovableItems() {
     // NOTE: Gets selected page items that can be moved as one keyboard pickup
     return Array.from(selectedItems).filter((item) => getPlannerItems().includes(item) && getItemPage(item));
}

function startKeyboardMove() {
     // NOTE: Picks up the current selection for one-grid-cell keyboard movement
     if (activeAction || !selectedItems.size || !selectedItem) {
          return false;
     }

     const movingItems = getKeyboardMovableItems();

     if (!movingItems.length || !movingItems.includes(selectedItem)) {
          return false;
     }

     closeItemMenus();
     setKeyboardCursorFromBox(selectedItem);
     activeAction = {
          type: "keyboard-move",
          item: selectedItem,
          items: movingItems.map((item) => ({
               item,
               page: getItemPage(item),
               box: getItemBox(item)
          }))
     };
     activeAction.items.forEach(({ item }) => item.classList.add("is-dragging"));
     markSnapReady(selectedItem, true);
     renderKeyHints();
     return true;
}

function getKeyboardMoveDelta(direction) {
     // NOTE: Calculates a clamped one-cell delta for the keyboard-held selection
     const primary = activeAction?.items?.find(({ item }) => item === activeAction.item) || activeAction?.items?.[0];

     if (!primary?.page) {
          return null;
     }

     const grid = getGridSize(primary.page);
     const rawDelta = {
          left: { x: -grid.x, y: 0 },
          right: { x: grid.x, y: 0 },
          up: { x: 0, y: -grid.y },
          down: { x: 0, y: grid.y }
     }[direction];

     if (!rawDelta) {
          return null;
     }

     return activeAction.items.reduce((delta, { page, box }) => {
          if (!page) {
               return delta;
          }

          const pageRect = page.getBoundingClientRect();
          const viewZoom = getViewZoom();
          const pageWidth = pageRect.width / viewZoom;
          const pageHeight = pageRect.height / viewZoom;

          return {
               x: clamp(delta.x, -box.x, Math.max(0, pageWidth - box.width) - box.x),
               y: clamp(delta.y, -box.y, Math.max(0, pageHeight - box.height) - box.y)
          };
     }, rawDelta);
}

function moveKeyboardMoveItems(direction) {
     // NOTE: Moves every keyboard-held selected item by the same clamped grid delta
     if (activeAction?.type !== "keyboard-move") {
          return;
     }

     const delta = getKeyboardMoveDelta(direction);

     if (!delta) {
          return;
     }

     activeAction.items.forEach(({ item }) => {
          const box = getItemBox(item);

          setItemBox(item, {
               ...box,
               x: box.x + delta.x,
               y: box.y + delta.y
          });
     });
     setKeyboardCursorFromBox(activeAction.item);
     wakeKeyboardCursor();
     renderKeyHints();
}

function finishKeyboardMove() {
     // NOTE: Places the keyboard-held selection and saves the planner state
     if (activeAction?.type !== "keyboard-move") {
          return;
     }

     const item = activeAction.item;

     activeAction.items.forEach(({ item: movedItem }) => movedItem.classList.remove("is-dragging"));
     markSnapReady(item, false);
     selectItem(item);
     notifyTemplateChanged();
     activeAction = null;
     clearDragOver();
     setKeyboardCursorFromBox(item);
     renderKeyHints();
}

function cancelKeyboardMove() {
     // NOTE: Restores the original positions when keyboard pickup is cancelled
     if (activeAction?.type !== "keyboard-move") {
          return;
     }

     const item = activeAction.item;

     activeAction.items.forEach(({ item: movedItem, box }) => {
          setItemBox(movedItem, box);
          movedItem.classList.remove("is-dragging");
     });
     markSnapReady(item, false);
     selectItem(item);
     activeAction = null;
     clearDragOver();
     setKeyboardCursorFromBox(item);
     renderKeyHints();
}

function handleKeyboardMoveKey(event) {
     // NOTE: Handles WASD/arrow movement, numeric resize toggle, Enter place, and Delete/Escape cancel while moving selected items
     if (activeAction?.type !== "keyboard-move" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return;
     }

     const direction = getKeyboardDirection(event);

     if (direction) {
          event.preventDefault();
          moveKeyboardMoveItems(direction);
          return;
     }

     if (event.key === "2") {
          event.preventDefault();
          switchKeyboardMoveToResize();
          return;
     }

     if (event.key === "Enter" || event.key === "1") {
          event.preventDefault();
          finishKeyboardMove();
          return;
     }

     if (isCancelKey(event)) {
          event.preventDefault();
          cancelKeyboardMove();
     }
}

function switchKeyboardMoveToResize() {
     // NOTE: Changes keyboard reposition mode into anchored resize mode for the same selected object
     if (activeAction?.type !== "keyboard-move") {
          return false;
     }

     const item = activeAction.item;
     const primary = activeAction.items.find(({ item: movingItem }) => movingItem === item) || activeAction.items[0];
     const page = primary?.page || getItemPage(item);

     if (!item || !page) {
          return false;
     }

     activeAction.items.forEach(({ item: movedItem }) => movedItem.classList.remove("is-dragging"));
     markSnapReady(item, false);
     selectItem(item);
     activeAction = {
          type: "keyboard-resize",
          item,
          page,
          startBox: getItemBox(item)
     };
     item.classList.add("is-dragging", "is-resizing", "is-resize-nwse");
     markSnapReady(item, true);
     renderKeyHints();
     return true;
}

function handleStartKeyboardMoveKey(event) {
     // NOTE: Numeric transform controls own keyboard move starts now
}

function canKeyboardResizeItem(item = selectedItem) {
     // NOTE: Checks whether the selected object can use anchored keyboard resize
     return Boolean(
          item &&
          selectedItems.size === 1 &&
          getPlannerItems().includes(item) &&
          getItemPage(item) &&
          !item.dataset.groupId &&
          item.dataset.itemType !== "mini-month" &&
          item.dataset.itemType !== "full-month"
     );
}

function startKeyboardResize(item = selectedItem) {
     // NOTE: Starts anchored keyboard resize from the object's upper-left grid point
     if (activeAction || !canKeyboardResizeItem(item)) {
          return false;
     }

     const page = getItemPage(item);

     closeItemMenus();
     selectItem(item);
     setKeyboardCursorFromBox(item, page);
     activeAction = {
          type: "keyboard-resize",
          item,
          page,
          startBox: getItemBox(item)
     };
     item.classList.add("is-dragging", "is-resizing", "is-resize-nwse");
     markSnapReady(item, true);
     renderKeyHints();
     return true;
}

function getKeyboardResizePointer(page, box, direction) {
     // NOTE: Converts a one-cell resize request into the pointer position used by existing resize math
     const grid = getGridSize(page);
     const pageRect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();
     const nextRight = box.x + box.width + (direction === "right" ? grid.x : direction === "left" ? -grid.x : 0);
     const nextBottom = box.y + box.height + (direction === "down" ? grid.y : direction === "up" ? -grid.y : 0);

     return {
          clientX: pageRect.left + (nextRight * viewZoom),
          clientY: pageRect.top + (nextBottom * viewZoom)
     };
}

function moveKeyboardResizeItem(direction) {
     // NOTE: Resizes the selected object from its fixed upper-left anchor by one grid cell
     const item = activeAction?.item;
     const page = activeAction?.page;

     if (!item || !page) {
          return;
     }

     const box = getItemBox(item);
     const pointer = getKeyboardResizePointer(page, box, direction);
     const mode = direction === "left" || direction === "right" ? "right" : "bottom";

     setItemBox(item, getResizedBox(item, page, pointer.clientX, pointer.clientY, mode));
     setKeyboardCursorFromBox(item, page);
     wakeKeyboardCursor();
     renderKeyHints();
}

function finishKeyboardResize() {
     // NOTE: Confirms anchored keyboard resize and saves the planner state
     if (activeAction?.type !== "keyboard-resize") {
          return;
     }

     const item = activeAction.item;

     item.classList.remove("is-dragging", "is-resizing", "is-resize-nwse");
     markSnapReady(item, false);
     selectItem(item);
     notifyTemplateChanged();
     activeAction = null;
     renderKeyHints();
}

function cancelKeyboardResize() {
     // NOTE: Restores the original size when anchored keyboard resize is cancelled
     if (activeAction?.type !== "keyboard-resize") {
          return;
     }

     const { item, startBox } = activeAction;

     setItemBox(item, startBox);
     item.classList.remove("is-dragging", "is-resizing", "is-resize-nwse");
     markSnapReady(item, false);
     selectItem(item);
     activeAction = null;
     renderKeyHints();
}

function handleKeyboardResizeKey(event) {
     // NOTE: Handles WASD/arrow resize, numeric reposition toggle, Enter confirm, and Delete/Escape cancel in resize mode
     if (event.defaultPrevented || activeAction?.type !== "keyboard-resize" || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return;
     }

     const direction = getKeyboardDirection(event);

     if (direction) {
          event.preventDefault();
          moveKeyboardResizeItem(direction);
          return;
     }

     if (event.key === "1") {
          event.preventDefault();
          switchKeyboardResizeToMove();
          return;
     }

     if (event.key === "Enter" || event.key === "2") {
          event.preventDefault();
          finishKeyboardResize();
          return;
     }

     if (isCancelKey(event)) {
          event.preventDefault();
          cancelKeyboardResize();
     }
}

function switchKeyboardResizeToMove() {
     // NOTE: Changes anchored keyboard resize mode back into keyboard reposition mode
     if (activeAction?.type !== "keyboard-resize") {
          return false;
     }

     const item = activeAction.item;

     item.classList.remove("is-dragging", "is-resizing", "is-resize-nwse");
     markSnapReady(item, false);
     activeAction = null;
     return startKeyboardMove();
}

function handleStartKeyboardResizeKey(event) {
     // NOTE: Numeric transform controls own keyboard move/resize starts now
}

function handleObjectSettingsKey(event) {
     // NOTE: Numeric object controls own keyboard object settings now
}

function getSelectedTextEditItem() {
     // NOTE: Returns the single selected planner item that can enter text editing
     if (selectedItems.size !== 1 || !selectedItem || !getPlannerItems().includes(selectedItem)) {
          return null;
     }

     return selectedItem.querySelector(".sticker-text, .calendar-day-text") ? selectedItem : null;
}

function startSelectedItemTextEditing(item) {
     // NOTE: Starts text editing for the selected planner item using its primary editable text area
     const stickerText = item.querySelector(".sticker-text");

     if (stickerText) {
          startStickerTextEditing(item);
          return true;
     }

     const calendarText = item.querySelector(".calendar-day-text");

     if (calendarText) {
          startCalendarDayTextEditing(calendarText, item);
          return true;
     }

     return false;
}

function handleSelectedTextEditKey(event) {
     // NOTE: Uses Enter to edit text on the selected object when directly activating it
     if (
          event.defaultPrevented ||
          activeAction ||
          plannerSettings.classList.contains("is-open") ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTypingFieldShortcutTarget(event.target)
     ) {
          return;
     }

     if (event.key !== "Enter") {
          return;
     }

     const item = getSelectedTextEditItem();

     if (!item) {
          return;
     }

     event.preventDefault();
     startSelectedItemTextEditing(item);
}

function enterDesignModeFromEmptyContextMenu(event) {
     // NOTE: Lets a mouse user right-click outside widgets to enter Design Mode
     if (
          event.defaultPrevented ||
          keyboardMode !== "interact" ||
          event.target.closest(".planner-item, .item-controls, .planner-settings")
     ) {
          return;
     }

     event.preventDefault();
     clearSelection();
     enterKeyboardDesignMode();
}

function syncKeyboardModeUi() {
     // NOTE: Reflects Interact/Design mode on the menu so unavailable tabs look unavailable
     plannerSettings.classList.toggle("is-interact-mode", keyboardMode === "interact");
     plannerSettings.classList.toggle("is-design-mode", keyboardMode === "design");
     document.documentElement.dataset.keyboardMode = keyboardMode;
}

function enterKeyboardDesignMode() {
     // NOTE: Enters the top-level keyboard Design Mode without opening a specific panel
     keyboardMode = "design";
     designBranch = "root";
     clearInteractFocus();
     syncKeyboardModeUi();
     closeSidebar();
     renderKeyHints();
}

function exitKeyboardDesignMode() {
     // NOTE: Returns keyboard mode to Interact and closes any design panel
     keyboardMode = "interact";
     designBranch = "root";
     syncKeyboardModeUi();
     closeSidebar();
     renderKeyHints();
}

function handleModeToggleKey(event) {
     // NOTE: Uses Tab as the single-key switch between Interact and Design modes
     if (
          event.defaultPrevented ||
          activeAction ||
          event.key !== "Tab" ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          isTypingFieldShortcutTarget(event.target)
     ) {
          return;
     }

     event.preventDefault();
     if (keyboardMode === "design") {
          exitKeyboardDesignMode();
     } else {
          enterKeyboardDesignMode();
     }
}

function enterKeyboardMenuBranch(branch, tabName) {
     // NOTE: Opens a numbered Design branch backed by a main menu tab
     keyboardMode = "design";
     designBranch = branch;
     syncKeyboardModeUi();
     selectSettingsTab(tabName);
     openSidebar();
     renderKeyHints();
}

function returnToKeyboardDesignRoot() {
     // NOTE: Goes one level up from a Design branch to the top-level Design choices
     designBranch = "root";
     closeSidebar();
     renderKeyHints();
}

function openSelectedObjectSettingsFromKeyboard() {
     // NOTE: Opens selected object settings from Design > Object via number key
     if (!selectedItem || !selectedItems.size) {
          return false;
     }

     keyboardMode = "design";
     designBranch = "object-settings";
     syncKeyboardModeUi();
     openItemMenu(selectedItem);
     openSidebar();
     renderKeyHints();
     return true;
}

function toggleSelectedGroupFromKeyboard() {
     // NOTE: Groups or ungroups selected objects from Design > Object via number key
     const items = getKeyboardGroupItems();

     if (!items.length) {
          return false;
     }

     if (itemsHaveGroup(items)) {
          ungroupItems(items);
     } else {
          groupItems(items, selectedItem);
     }
     renderKeyHints();
     return true;
}

function deleteSelectedItemsFromKeyboard() {
     // NOTE: Deletes selected objects from Design > Object via number key
     if (!selectedItem || !selectedItems.size) {
          return false;
     }

     deleteItem(selectedItem);
     designBranch = "root";
     renderKeyHints();
     return true;
}

function handleKeyboardModeNumberKey(event) {
     // NOTE: Uses number keys for the keyboard mode stack and mode-specific choices
     if (
          event.defaultPrevented ||
          activeAction ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTypingFieldShortcutTarget(event.target)
     ) {
          return;
     }

     if (!/^[1-9]$/.test(event.key)) {
          return;
     }

     if (keyboardMode !== "design") {
          if (event.key !== "1") {
               return;
          }

          event.preventDefault();
          enterKeyboardDesignMode();
          return;
     }

     if (designBranch === "root") {
          event.preventDefault();
          if (event.key === "1") {
               exitKeyboardDesignMode();
          } else if (event.key === "2") {
               enterKeyboardMenuBranch("notebook", "page");
          } else if (event.key === "3") {
               enterKeyboardMenuBranch("menu", "add");
          } else if (event.key === "4") {
               designBranch = "object";
               syncKeyboardModeUi();
               closeSidebar();
               renderKeyHints();
          } else if (event.key === "5") {
               designBranch = "transform";
               syncKeyboardModeUi();
               closeSidebar();
               renderKeyHints();
          }
          return;
     }

     if (designBranch === "notebook" && event.key === "2") {
          event.preventDefault();
          returnToKeyboardDesignRoot();
          return;
     }

     if (designBranch === "menu" && event.key === "3") {
          event.preventDefault();
          returnToKeyboardDesignRoot();
          return;
     }

     if (designBranch === "object-settings" && event.key === "1") {
          event.preventDefault();
          designBranch = "object";
          syncKeyboardModeUi();
          closeSidebar();
          renderKeyHints();
          return;
     }

     if (designBranch === "notebook" || designBranch === "menu" || designBranch === "object-settings") {
          const tab = settingsTabs[Number(event.key) - 1];

          if (!tab || tab.disabled) {
               return;
          }

          event.preventDefault();
          selectSettingsTab(tab.dataset.settingsTab);
          openSidebar();
          renderKeyHints();
          return;
     }

     if (designBranch === "object") {
          event.preventDefault();
          if (event.key === "4") {
               returnToKeyboardDesignRoot();
          } else if (event.key === "1") {
               openSelectedObjectSettingsFromKeyboard();
          } else if (event.key === "2") {
               toggleSelectedGroupFromKeyboard();
          } else if (event.key === "3") {
               deleteSelectedItemsFromKeyboard();
          }
          return;
     }

     if (designBranch === "transform") {
          event.preventDefault();
          if (event.key === "5") {
               returnToKeyboardDesignRoot();
          } else if (event.key === "1") {
               startKeyboardMove();
          } else if (event.key === "2") {
               startKeyboardResize();
          }
     }
}

function handleNumberedMenuTabKey(event) {
     // NOTE: Backward wrapper for the numeric keyboard mode stack
     handleKeyboardModeNumberKey(event);
}

function handleCancelKey(event) {
     // NOTE: Uses Delete/Escape as the same keyboard cancel key for open planner UI
     if (
          event.defaultPrevented ||
          activeAction ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTypingFieldShortcutTarget(event.target)
     ) {
          return;
     }

     if (!isCancelKey(event)) {
          return;
     }

     event.preventDefault();
     if (keyboardMode === "design" && designBranch !== "root") {
          returnToKeyboardDesignRoot();
          return;
     }

     if (keyboardMode === "design" && designBranch === "root") {
          exitKeyboardDesignMode();
          return;
     }

     if (keyboardMode === "interact" && stepBackInteractFocus()) {
          return;
     }

     if (plannerSettings.classList.contains("is-open")) {
          closeSidebar();
          return;
     }

     closeCustomSelects();
     clearSelectFocus();
     setTertiaryMatrixOpen(false);
     closeHexPopover();
     clearSelection();
}

function handleTextEditFinishKey(event) {
     // NOTE: Uses Enter/Delete/Escape to finish active text editing by leaving the editable text field
     if (
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
     ) {
          return;
     }

     if (event.key !== "Escape" && event.key !== "Delete" && event.key !== "Enter") {
          return;
     }

     const editingTarget = event.target?.closest?.("[contenteditable='true']");

     if (!editingTarget) {
          return;
     }

     event.preventDefault();
     editingTarget.blur();
}

function finishTextEditingFromOutsidePointer(event) {
     // NOTE: Leaves text editing when pointer input starts outside the widget being edited
     const editingTarget = document.querySelector("[contenteditable='true']");

     if (!editingTarget) {
          return;
     }

     const editingItem = editingTarget.closest(".planner-item");

     if (!editingItem || editingItem.contains(event.target)) {
          return;
     }

     editingTarget.blur();
}

function blockSpacebarShortcut(event) {
     // NOTE: Prevents Space from acting as a custom planner keyboard control outside typing fields
     if (
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTextInputShortcutTarget(event.target)
     ) {
          return;
     }

     if (event.key !== " ") {
          return;
     }

     event.preventDefault();
}

function getActiveSettingsPanel() {
     // NOTE: Finds the currently visible main menu panel for keyboard scrolling
     const activeTabName = settingsTabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.settingsTab;

     return settingsPanels.find((panel) => panel.dataset.settingsPanel === activeTabName) || null;
}

function getMenuFocusableElements() {
     // NOTE: Gets visible controls in the active menu panel for arrow-key menu navigation
     const activePanel = getActiveSettingsPanel();

     if (!activePanel) {
          return [];
     }

     return Array.from(activePanel.querySelectorAll("button, .setting-choice, input, select, textarea, [tabindex]:not([tabindex='-1'])"))
          .filter((element) => {
               if (element.matches(".setting-choice input")) {
                    return false;
               }

               const isDisabled = element.disabled || element.getAttribute("aria-disabled") === "true";
               const isHidden = element.hidden || element.closest("[hidden]");
               const rect = element.getBoundingClientRect();

               return !isDisabled && !isHidden && element.offsetParent !== null && rect.width > 0 && rect.height > 0;
          });
}

function getElementGeometry(element) {
     // NOTE: Calculates the screen center point used for spatial keyboard focus movement
     const rect = element.getBoundingClientRect();

     return {
          height: rect.height,
          width: rect.width,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
     };
}

function getMenuFocusCandidateScore(fromGeometry, candidateGeometry, direction) {
     // NOTE: Scores possible menu focus targets by direction first, then nearest visual distance
     const deltaX = candidateGeometry.x - fromGeometry.x;
     const deltaY = candidateGeometry.y - fromGeometry.y;
     const absX = Math.abs(deltaX);
     const absY = Math.abs(deltaY);
     const horizontalLaneSize = Math.max(fromGeometry.height, candidateGeometry.height, 24);
     const verticalLaneSize = Math.max(fromGeometry.width, candidateGeometry.width, 48);

     if (direction === "up" && deltaY >= -1) {
          return null;
     }

     if (direction === "down" && deltaY <= 1) {
          return null;
     }

     if (direction === "left" && deltaX >= -1) {
          return null;
     }

     if (direction === "right" && deltaX <= 1) {
          return null;
     }

     if (direction === "up" || direction === "down") {
          return absX <= verticalLaneSize ? absY : 1000000 + absX * 1000 + absY;
     }

     return absY <= horizontalLaneSize ? absX : 1000000 + absY * 1000 + absX;
}

function moveMenuFocus(direction) {
     // NOTE: Moves focus spatially to the closest visible control in the requested menu direction
     const focusableElements = getMenuFocusableElements();

     if (!focusableElements.length) {
          return false;
     }

     const activeElement = focusableElements.includes(document.activeElement) ? document.activeElement : null;
     const currentElement = activeElement || focusableElements[0];
     const currentGeometry = getElementGeometry(currentElement);
     const nextElement = activeElement
          ? focusableElements.reduce((best, element) => {
               if (element === activeElement) {
                    return best;
               }

               const score = getMenuFocusCandidateScore(currentGeometry, getElementGeometry(element), direction);

               if (score === null || (best && score >= best.score)) {
                    return best;
               }

               return {
                    element,
                    score
               };
          }, null)?.element
          : currentElement;

     if (!nextElement) {
          return false;
     }

     if (nextElement.matches(".setting-choice") && !nextElement.hasAttribute("tabindex")) {
          nextElement.tabIndex = -1;
     }
     plannerSettings.querySelectorAll(".is-menu-keyboard-focus").forEach((element) => {
          element.classList.remove("is-menu-keyboard-focus");
     });
     nextElement.classList.add("is-menu-keyboard-focus");
     nextElement.focus();
     nextElement.scrollIntoView({
          block: "nearest",
          inline: "nearest"
     });

     return true;
}

function activateMenuFocusedElement(element) {
     // NOTE: Activates the visible menu tile or native control currently selected by keyboard navigation
     if (element.matches(".setting-choice")) {
          const input = element.querySelector("input");

          if (input && !input.disabled) {
               input.click();
               return true;
          }
     }

     if (typeof element.click === "function") {
          element.click();
          return true;
     }

     return false;
}

function scrollActiveMenuPanel(direction, distance = 64) {
     // NOTE: Scrolls the active menu panel when spatial focus cannot move farther vertically
     const activePanel = getActiveSettingsPanel();

     if (!activePanel) {
          return false;
     }

     activePanel.scrollBy({
          top: direction === "down" ? distance : -distance,
          behavior: "smooth"
     });

     return true;
}

function handleMainMenuArrowKey(event) {
     // NOTE: Uses arrow keys to move through visible controls in the open menu
     if (
          activeAction ||
          !plannerSettings.classList.contains("is-open") ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTypingFieldShortcutTarget(event.target)
     ) {
          return;
     }

     if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveMenuFocus("left");
     } else if (event.key === "ArrowRight") {
          event.preventDefault();
          moveMenuFocus("right");
     } else if (event.key === "ArrowUp") {
          event.preventDefault();
          if (!moveMenuFocus("up")) {
               scrollActiveMenuPanel("up");
          }
     } else if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!moveMenuFocus("down")) {
               scrollActiveMenuPanel("down");
          }
     } else if (event.key === "PageUp" || event.key === "PageDown") {
          const activePanel = getActiveSettingsPanel();

          if (!activePanel) {
               return;
          }

          event.preventDefault();
          activePanel.scrollBy({
               top: event.key === "PageDown" ? activePanel.clientHeight * 0.8 : activePanel.clientHeight * -0.8,
               behavior: "smooth"
          });
     }
}

function handleMainMenuWasdKey(event) {
     // NOTE: Uses WASD to move through visible controls in the open menu
     if (
          event.defaultPrevented ||
          activeAction ||
          !plannerSettings.classList.contains("is-open") ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTypingFieldShortcutTarget(event.target)
     ) {
          return;
     }

     const key = event.key.toLowerCase();

     if (key === "a") {
          event.preventDefault();
          moveMenuFocus("left");
     } else if (key === "d") {
          event.preventDefault();
          moveMenuFocus("right");
     } else if (key === "w") {
          event.preventDefault();
          if (!moveMenuFocus("up")) {
               scrollActiveMenuPanel("up");
          }
     } else if (key === "s") {
          event.preventDefault();
          if (!moveMenuFocus("down")) {
               scrollActiveMenuPanel("down");
          }
     }
}

function handleViewZoomKey(event) {
     // NOTE: Cycles zoom levels with Z when the user is not typing or moving an object
     if (
          event.defaultPrevented ||
          activeAction ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTextInputShortcutTarget(event.target)
     ) {
          return;
     }

     if (event.key.toLowerCase() === "z") {
          event.preventDefault();
          cycleViewZoom();
     }
}

function handlePageFocusNavigationKey(event) {
     // NOTE: Moves Interact focus between real widgets/targets, falling back to the legacy grid cursor outside Interact
     if (
          event.defaultPrevented ||
          activeAction ||
          plannerSettings.classList.contains("is-open") ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTextInputShortcutTarget(event.target)
     ) {
          return;
     }

     const direction = getKeyboardDirection(event);

     if (!direction) {
          return;
     }

     event.preventDefault();
     if (keyboardMode === "interact") {
          moveInteractFocus(direction);
          return;
     }

     moveKeyboardCursor(direction);
}

function cycleViewCenter() {
     // NOTE: Cycles center targets: 100% swaps pages; zoomed views cycle page halves
     if (viewZoomIndex === 0) {
          snapViewToPage(getFocusedPageSide() === "left" ? "right" : "left");
          syncKeyboardCursorWithFocusedPage();
          return;
     }

     const verticalCycle = ["top", "bottom"];
     const availableTargets = viewFocusPoints.flatMap((pageSide) => (
          isPageSideAvailable(pageSide)
               ? verticalCycle.map((vertical) => ({ pageSide, vertical }))
               : []
     ));
     const currentTargetIndex = availableTargets.findIndex(({ pageSide, vertical }) => (
          pageSide === getFocusedPageSide() &&
          vertical === viewVerticalFocusPoints[viewVerticalFocusIndex]
     ));
     const nextTarget = currentTargetIndex === -1
          ? availableTargets.find(({ pageSide, vertical }) => pageSide === getFocusedPageSide() && vertical === "top")
          : availableTargets[(currentTargetIndex + 1) % availableTargets.length];

     if (!nextTarget) {
          return;
     }

     resetViewPanOffset();
     viewFocusIndex = viewFocusPoints.indexOf(nextTarget.pageSide);
     viewVerticalFocusIndex = viewVerticalFocusPoints.indexOf(nextTarget.vertical);
     if (viewFocusIndex === -1) {
          viewFocusIndex = 0;
     }
     if (viewVerticalFocusIndex === -1) {
          viewVerticalFocusIndex = 1;
     }
     applyViewControls();
     syncKeyboardCursorWithFocusedPage();
}

function handleViewFocusToggleKey(event) {
     // NOTE: Cycles page centering with C without stealing WASD from cursor movement
     if (
          event.defaultPrevented ||
          activeAction ||
          plannerSettings.classList.contains("is-open") ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTextInputShortcutTarget(event.target)
     ) {
          return;
     }

     if (event.key.toLowerCase() !== "c") {
          return;
     }

     event.preventDefault();
     cycleViewCenter();
     renderKeyHints();
}

function getKeyboardGroupItems() {
     // NOTE: Gets the current selection that can be grouped or ungrouped from the keyboard
     if (!selectedItems.size) {
          return [];
     }

     return Array.from(selectedItems).filter((item) => getPlannerItems().includes(item));
}

function toggleGroupFromKeyboard(event) {
     // NOTE: Numeric object controls own keyboard group/ungroup now
}

function toggleGuidesFromKeyboard(event) {
     // NOTE: Toggles every page guide checkbox on or off as one keyboard command
     if (
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTextInputShortcutTarget(event.target)
     ) {
          return;
     }

     if (event.key.toLowerCase() !== "x") {
          return;
     }

     event.preventDefault();
     const hasActiveGuide = guideInputs.some((input) => input.checked);
     const shouldShowAllGuides = !hasActiveGuide;

     guideInputs.forEach((input) => {
          input.checked = shouldShowAllGuides;
     });

     changePlannerSetting();
}

function getKeyHintState() {
     // NOTE: Chooses the visible keyboard hint mode label and actions for the current planner state
     if (activeAction?.type === "keyboard-source") {
          return {
               mode: "Design Mode > Place Widget",
               entries: [
               ["Enter", "Place"],
               ["X", "Gridlines"],
               ["Delete / Esc", "Cancel"]
               ]
          };
     }

     if (activeAction?.type === "keyboard-move") {
          return {
               mode: "Design Mode > Transform > Move",
               entries: [
               ["1", "Place"],
               ["2", "Resize"],
               ["X", "Gridlines"],
               ["Delete / Esc", "Cancel"]
               ]
          };
     }

     if (activeAction?.type === "keyboard-resize") {
          return {
               mode: "Design Mode > Transform > Resize",
               entries: [
               ["1", "Reposition"],
               ["2", "Confirm"],
               ["X", "Gridlines"],
               ["Delete / Esc", "Cancel"]
               ]
          };
     }

     if (document.querySelector("[contenteditable='true']")) {
          return {
               mode: "Interact Mode > Text Edit",
               entries: [
               ["Type", "Enter text"],
               ["Enter / Delete", "Finish editing"]
               ]
          };
     }

     if (keyboardMode === "design" && designBranch === "notebook") {
          return {
               mode: "Design Mode > Notebook",
               entries: [
               ["2", "Back"],
               ["1-5", "Tabs"],
               ["Q / E", "Last / Next Tab"],
               ["Enter", "Select"],
               ["Delete / Esc", "Back"]
               ]
          };
     }

     if (keyboardMode === "design" && designBranch === "menu") {
          return {
               mode: "Design Mode > Menu",
               entries: [
               ["3", "Back"],
               ["1-5", "Tabs"],
               ["Q / E", "Last / Next Tab"],
               ["Enter", "Select"],
               ["Delete / Esc", "Back"]
               ]
          };
     }

     if (keyboardMode === "design" && designBranch === "object-settings") {
          return {
               mode: "Design Mode > Object > Settings",
               entries: [
               ["1", "Back"],
               ["1-5", "Tabs"],
               ["Q / E", "Last / Next Tab"],
               ["Enter", "Select"],
               ["Delete / Esc", "Back"]
               ]
          };
     }

     if (keyboardMode === "design" && designBranch === "object") {
          return {
               mode: "Design Mode > Object",
               entries: [
               ["4", "Back"],
               ["1", "Settings"],
               ["2", "Group / Ungroup"],
               ["3", "Delete selected"],
               ["X", "Gridlines"],
               ["Delete / Esc", "Back"]
               ]
          };
     }

     if (keyboardMode === "design" && designBranch === "transform") {
          return {
               mode: "Design Mode > Transform",
               entries: [
               ["5", "Back"],
               ["1", "Move"],
               ["2", "Resize"],
               ["X", "Gridlines"],
               ["Delete / Esc", "Back"]
               ]
          };
     }

     if (keyboardMode === "design") {
          return {
               mode: "Design Mode",
               entries: [
               ["Tab", "Interact Mode"],
               ["2", "Notebook"],
               ["3", "Menu"],
               ["4", "Object"],
               ["5", "Transform"],
               ["X", "Gridlines"],
               ["Delete / Esc", "Interact Mode"]
               ]
          };
     }

     if (interactFocusTarget) {
          return {
               mode: "Interact Mode > Widget Navigate",
               entries: [
               ["Arrows", "Move focus"],
               ["WASD", "Move focus"],
               ["Enter", "Edit focused text"],
               ["Delete / Esc", "Back"],
               ["Tab", "Design Mode"]
               ]
          };
     }

     if (interactFocusItem) {
          return {
               mode: "Interact Mode > Widget Focus",
               entries: [
               ["Arrows", "Move between widgets"],
               ["WASD", "Move between widgets"],
               ["Enter", "Open widget"],
               ["Delete / Esc", "Clear focus"],
               ["Tab", "Design Mode"]
               ]
          };
     }

     return {
          mode: "Interact Mode",
          entries: [
          ["Tab", "Design Mode"],
          ["Arrows", "Move focus"],
          ["WASD", "Move focus"],
          ["Enter", "Open focused widget"],
          ["Q / E", "Last / Next Page"],
          ["Z", "Zoom"],
          ["X", "Gridlines"],
          ["C", "Center"]
          ]
     };
}

function renderKeyHints() {
     // NOTE: Renders the upper-left keyboard shortcut popup for the current app state
     if (!keyHintPanel) {
          return;
     }

     keyHintPanel.replaceChildren();
     const hintState = getKeyHintState();
     const modeRow = document.createElement("div");

     modeRow.className = "key-hint-mode";
     modeRow.textContent = hintState.mode;
     keyHintPanel.append(modeRow);

     if (hasUsedKeyboardCursor && !plannerSettings.classList.contains("is-open")) {
          const coordinateRow = document.createElement("div");

          coordinateRow.className = "key-hint-coordinates";
          coordinateRow.classList.toggle("is-idle", !isKeyboardCursorActive);
          coordinateRow.textContent = getKeyboardCursorLabel();
          keyHintPanel.append(coordinateRow);
     }
     hintState.entries.forEach(([key, action]) => {
          const row = document.createElement("div");
          const keyElement = document.createElement("kbd");
          const actionElement = document.createElement("span");

          row.className = "key-hint-row";
          keyElement.className = "key-hint-key";
          keyElement.textContent = key;
          actionElement.className = "key-hint-action";
          actionElement.textContent = action;
          row.append(keyElement, actionElement);
          keyHintPanel.append(row);
     });
     updateKeyboardCursor();
}

function getItemForMenuKeyboardToggle(target) {
     const targetItem = target?.closest?.(".planner-item");

     if (targetItem && getPlannerItems().includes(targetItem)) {
          return targetItem;
     }

     const targetControls = target?.closest?.(".item-controls");
     const ownerId = targetControls?.dataset.ownerId;
     const ownerItem = ownerId
          ? getPlannerItems().find((item) => item.dataset.templateId === ownerId)
          : null;

     if (ownerItem) {
          return ownerItem;
     }

     return selectedItem && getPlannerItems().includes(selectedItem) ? selectedItem : null;
}

function handleMenuToggleKey(event) {
     if (!isCancelKey(event) || activeAction || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
          return false;
     }

     if (event.target.closest("[contenteditable='true']")) {
          return false;
     }

     const item = getItemForMenuKeyboardToggle(event.target);

     if (!item) {
          return false;
     }

     event.preventDefault();
     if (!selectedItems.has(item)) {
          selectItem(item);
     }

     if (item.classList.contains("is-menu-open")) {
          closeItemMenu(item);
     } else {
          openItemMenu(item);
     }

     return true;
}

function setPageCornerOverlay(page, isVisible) {
     if (!isVisible || !page) {
          pageCornerFoldOverlay.classList.remove("is-visible");
          pageCornerFoldOverlayNumber.textContent = "";
          return;
     }

     const fold = page.querySelector(".page-corner-fold");
     const foldNumber = page.querySelector("[data-page-fold-number]");

     if (!fold) {
          return;
     }

     const deskRect = plannerDesk.getBoundingClientRect();
     const foldRect = fold.getBoundingClientRect();
     const side = getPageId(page);

     pageCornerFoldOverlay.style.left = `${foldRect.left - deskRect.left}px`;
     pageCornerFoldOverlay.style.top = `${foldRect.top - deskRect.top}px`;
     pageCornerFoldOverlay.style.width = `${foldRect.width}px`;
     pageCornerFoldOverlay.style.height = `${foldRect.height}px`;
     pageCornerFoldOverlayNumber.textContent = foldNumber?.textContent || "";
     pageCornerFoldOverlay.classList.toggle("is-left", side === "left");
     pageCornerFoldOverlay.classList.toggle("is-right", side === "right");
     pageCornerFoldOverlay.classList.add("is-visible");
}

// NOTE: Drawing The Notebook Pages
function getViewZoom() {
     return viewZoomLevels[viewZoomIndex].value;
}

function applyPlannerConfig() {
     const pageWidthInches = convertLength(plannerConfig.pageWidth, plannerConfig.grid.unit, "in");
     const pageHeightInches = convertLength(plannerConfig.pageHeight, plannerConfig.grid.unit, "in");
     const referencePaper = getReferencePaperSizeInches();
     const referenceSpreadRatio = referencePaper.width * 2 / referencePaper.height;
     const notebookHeightRatio = Math.min(50.47, 78 / referenceSpreadRatio);
     const sourceStickerRatio = 50 / plannerConfig.gridColumns * stickerGridUnits;
     const pageViewScale = paperViewScales[plannerConfig.paperKey] || 1;
     const screenPageWidthInches = pageWidthInches * pageViewScale;
     const screenPageHeightInches = pageHeightInches * pageViewScale;
     const pageSpreadWidth = screenPageWidthInches / (referencePaper.width * 2) * 100;
     const pageScreenHeightRatio = screenPageHeightInches / referencePaper.height;
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
     PlannerRootControls.setRootProperties(PlannerRootControls.getPageBadgeRootProperties({
          pageSpreadWidth,
          pageScreenHeightRatio,
          gridColumns: plannerConfig.gridColumns,
          gridRows: plannerConfig.gridRows
     }));
     syncGridSnapOrigins();
     setRootNumber("--notebook-width", getNotebookWidthFormula());
     setRootNumber("--notebook-height", `min(${notebookHeightRatio}vw, 724px, calc(100vh - ${notebookViewportHeightReserve}px))`);
     setRootNumber("--source-sticker-size", `calc(var(--notebook-width) * ${sourceStickerRatio / 100})`);
     setRootNumber("--print-page-width", `${pageWidthInches}in`);
     setRootNumber("--print-page-height", `${pageHeightInches}in`);
     setRootNumber("--print-spread-width", `${pageWidthInches * 2}in`);
     setRootNumber("--paper", plannerConfig.paperColor.color);
     setRootNumber("--color-rainbow", plannerConfig.accentColor.color);
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
     document.documentElement.dataset.accentColor = plannerConfig.accentColorKey;
     document.documentElement.dataset.deskColor = plannerConfig.deskColorKey;
     document.documentElement.dataset.grid = plannerConfig.gridKey;
     document.documentElement.dataset.guideThirds = String(plannerConfig.guides.thirds);
     document.documentElement.dataset.guideFourths = String(plannerConfig.guides.fourths);
}

// NOTE: Start The App And Connect The Buttons
window.prettyPlanner = {
     serializeTemplate: serializePlannerTemplate,
     snapViewToPage,
     turnNotebookSpread,
     version: "planner-storage-151"
};
window.perfectPlanner = window.prettyPlanner;

syncAllSettingChoiceInputs();
KeyboardControls.renderControlsPanel(keyboardControlsPanel);
initializeCustomSelects();
initializeNotebookSettingsSections();
initializeSettingsSections(plannerSettings);
initializePalettePreview();
updateSettingsPanelSteps();
updateObjectControlsState();
updateSidebarPanelFocusState();
syncResponsiveViewportClass();
syncKeyboardModeUi();
applyPlannerConfig();
restorePlannerBook(plannerConfig.paperKey);
syncNotebookSpread();
if (isSinglePageViewport) {
     viewFocusIndex = 0;
}
applyViewControls();
renderKeyHints();
syncSidebarSnap();
paperSelect.addEventListener("change", () => {
     syncSettingChoiceInputs("paper");
     changePaperSetting();
});
paperColorSelect.addEventListener("change", () => {
     changePlannerSetting();
     updatePalettePreview();
});
accentColorSelect?.addEventListener("change", () => {
     changePlannerSetting();
     updateAccentPalettePreview();
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
plannerSettings.addEventListener("change", (event) => {
     const section = event.target.closest("[data-settings-section]");

     if (section) {
          window.setTimeout(() => closeSettingsSection(section), 0);
     }
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
PageControls.bindPageTurnControls({
     pages,
     getGridMetrics: () => ({
          gridColumns: plannerConfig.gridColumns,
          gridRows: plannerConfig.gridRows
     }),
     turnNotebookSpread,
     setCornerOverlay: setPageCornerOverlay
});
settingsTabs.forEach((tab) => {
     tab.addEventListener("click", (event) => {
          if (keyboardMode === "interact") {
               event.preventDefault();
               return;
          }

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
plannerSettings.addEventListener("pointerdown", (event) => {
     const tab = event.target.closest("[data-settings-tab]");

     if (!tab || plannerSettings.classList.contains("is-open")) {
          return;
     }

     if (keyboardMode === "interact") {
          event.preventDefault();
          return;
     }

     selectSettingsTab(tab.dataset.settingsTab);
     openSidebar();
     shouldSkipNextTabClick = true;
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
initializeCalendarSourcePreviews(sourceItems);
loadPlannerThemeData();
sourceItems.forEach((sourceItem) => {
     sourceItem.addEventListener("pointerdown", startSourceMove, true);
     sourceItem.addEventListener("mousedown", startSourceMove, true);
});
document.addEventListener("pointerdown", hideKeyboardCursorForPointer, true);
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
plannerDesk.addEventListener("contextmenu", enterDesignModeFromEmptyContextMenu);
document.addEventListener("pointerdown", finishTextEditingFromOutsidePointer, true);
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

     document.querySelectorAll("[data-settings-section].is-open").forEach((section) => {
          if (
               !section.contains(event.target) &&
               !event.target.closest("[data-tertiary-matrix], [data-hex-popover]")
          ) {
               closeSettingsSection(section);
          }
     });

     if (
          !event.target.closest(".planner-item") &&
          !event.target.closest(".planner-settings") &&
          !event.target.closest(".page-snap-controls") &&
          !event.target.closest("[data-tertiary-matrix], [data-hex-popover]")
     ) {
          clearSelection();
     }
});
document.addEventListener("pointerdown", closeHexPopoverFromOutsidePointer, true);
document.addEventListener("keydown", (event) => {
     handleClipboardShortcut(event);
     handleTextEditFinishKey(event);
     blockSpacebarShortcut(event);
     handleModeToggleKey(event);
     handleKeyboardPlacementKey(event);
     handleKeyboardMoveKey(event);
     handleKeyboardResizeKey(event);
     handleMainMenuArrowKey(event);
     handleMainMenuWasdKey(event);
     handlePageTurnKey(event);
     handleMenuEnterKey(event);
     handleKeyboardCursorActivateKey(event);
     handleSelectedTextEditKey(event);
     handleObjectSettingsKey(event);
     handleStartKeyboardMoveKey(event);
     handleStartKeyboardResizeKey(event);
     handleNumberedMenuTabKey(event);
     handleMainMenuToggleKey(event);
     handleCancelKey(event);
     handleViewZoomKey(event);
     handlePageFocusNavigationKey(event);
     handleViewFocusToggleKey(event);
     toggleGroupFromKeyboard(event);
     toggleGuidesFromKeyboard(event);
     if (!event.defaultPrevented && isCancelKey(event)) {
          const didToggleMenu = handleMenuToggleKey(event);

          closeCustomSelects();
          clearSelectFocus();
          setTertiaryMatrixOpen(false);
          closeHexPopover();
          if (didToggleMenu) {
               return;
          }
     }
});
document.documentElement.dataset.appReady = "true";
window.addEventListener("pointermove", moveActiveItem);
window.addEventListener("pointerup", endActiveItem);
window.addEventListener("pointercancel", endActiveItem);
window.addEventListener("resize", handleWindowResize);
window.addEventListener("scroll", positionTertiaryMatrix, true);
window.setInterval(refreshRelativeCalendarWidgets, 60 * 60 * 1000);
document.addEventListener("visibilitychange", () => {
     if (!document.hidden) {
          refreshRelativeCalendarWidgets();
     }
});
singlePageViewportQuery.addEventListener("change", applyResponsiveViewMode);
