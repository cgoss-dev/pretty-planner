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
const deskColorSelect = document.querySelector("[data-setting='desk-color']");
const palettePreviewSwatches = document.querySelector("[data-palette-preview-swatches]");
const tertiaryMatrixPopover = document.querySelector("[data-tertiary-matrix]");
const tertiaryMatrixGrid = document.querySelector("[data-tertiary-matrix-grid]");
const settingSelects = Array.from(document.querySelectorAll("[data-setting]")).filter((select) => !["paper", "grid", "paper-color", "desk-color"].includes(select.dataset.setting));
const guideInputs = Array.from(document.querySelectorAll("[data-guide]"));
const settingsTabs = Array.from(document.querySelectorAll("[data-settings-tab]"));
const settingsPanels = Array.from(document.querySelectorAll("[data-settings-panel]"));
const settingsStepButtons = Array.from(document.querySelectorAll("[data-settings-step]"));
const objectInspector = document.querySelector("[data-object-inspector]");
const objectControlsShell = document.querySelector("[data-object-controls-shell]");
const objectControlsEmpty = document.querySelector("[data-object-controls-empty]");
const pageSnapButtons = Array.from(document.querySelectorAll("[data-page-snap]"));
const zoomToast = document.querySelector("[data-zoom-toast]");
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
const stickyGridUnits = itemControls.stickyGridUnits;
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
const deskColors = colorControls.deskColors;
const textLineHeightCellOptions = textControls.lineHeightCellOptions;

let activeAction = null;
let selectedItem = null;
let selectedItems = new Set();
let nextTemplateItemId = 1;
let nextGroupId = 1;
let plannerClipboard = null;
let shouldSkipNextClear = false;
let shouldSkipNextItemClick = false;
let shouldSkipNextTabClick = false;

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

     if (isStickyTextItem(item)) {
          return item.offsetHeight / (getItemGridUnits(item)?.height || stickyGridUnits);
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

     if (shouldCenterFocusedPage) {
          syncViewTargetCenter(zoomAnchor);
     } else {
          requestAnimationFrame(refreshPageItemViews);
     }
     updatePageSnapButtons();
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
     if (
          activeAction ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          isTextInputShortcutTarget(event.target)
     ) {
          return;
     }

     if (event.key === "PageDown") {
          event.preventDefault();
          turnNotebookSpread(-1);
     } else if (event.key === "PageUp") {
          event.preventDefault();
          turnNotebookSpread(1);
     }
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
     if (event.key !== "Escape" || activeAction || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
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
     const sourceStickyRatio = 50 / plannerConfig.gridColumns * stickyGridUnits;
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

// NOTE: Start The App And Connect The Buttons
window.prettyPlanner = {
     serializeTemplate: serializePlannerTemplate,
     snapViewToPage,
     turnNotebookSpread,
     version: "planner-storage-151"
};
window.perfectPlanner = window.prettyPlanner;

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
sourceItems.forEach((sourceItem) => {
     sourceItem.addEventListener("pointerdown", startSourceMove, true);
     sourceItem.addEventListener("mousedown", startSourceMove, true);
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
     handleClipboardShortcut(event);
     handlePageTurnKey(event);
     if (event.key === "Escape") {
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
