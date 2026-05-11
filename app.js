// NOTE: Page Turns, Page Numbers, And Corner Folds
const PageControls = (() => {
     let pageTurnTimer = 0;

     function applyPageNumberLayering(root = document.documentElement) {
          PlannerRootControls.setRootProperties(PlannerRootControls.controls.pageNumbers.layering, root);
     }

     function applyCornerFlipControls(root = document.documentElement) {
          PlannerRootControls.setRootProperties({
               ...PlannerRootControls.controls.pageCornerFlip.layering,
               ...PlannerRootControls.controls.pageCornerFlip.debugColors
          }, root);
     }

     function applyControls(root = document.documentElement) {
          applyPageNumberLayering(root);
          applyCornerFlipControls(root);
     }

     function updatePageLabels({
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
     }) {
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

               page.querySelectorAll("[data-page-fold-number]").forEach((foldElement) => {
                    foldElement.textContent = canTurn ? formatPageNumber(foldNumber) : "";
               });
               page.querySelectorAll("[data-page-fold-behind-number]").forEach((foldElement) => {
                    foldElement.textContent = canTurn ? formatPageNumber(behindNumber) : "";
               });

               page.querySelector("[data-page-behind-number]")?.replaceChildren(canTurn ? formatPageNumber(behindNumber) : "");
          });

          notebook.dataset.spreadIndex = String(currentSpreadIndex);
          notebook.dataset.spreadCount = String(notebookSpreadCount);
          notebook.dataset.pageCount = String(notebookPageCount);
     }

     function getCurrentSpreadPageNumber({ currentSpreadIndex, side = "left" }) {
          return (currentSpreadIndex * 2) + (side === "right" ? 1 : 0);
     }

     function getSpreadCountForPageCount(pageCount) {
          return Math.max(1, Math.ceil(pageCount / 2));
     }

     function normalizeNotebookPageCount({ pageCount, initialNotebookPageCount, minNotebookPageCount, maxNotebookPageCount, clamp }) {
          const roundedPageCount = Math.round(Number(pageCount)) || initialNotebookPageCount;

          return clamp(roundedPageCount, minNotebookPageCount, maxNotebookPageCount);
     }

     function getPageSideForPageNumber(pageNumber) {
          return pageNumber % 2 === 0 ? "left" : "right";
     }

     function isPageNumberAvailable({ pageNumber, notebookPageCount }) {
          return pageNumber >= 0 && pageNumber < notebookPageCount;
     }

     function isFinalRightPlaceholderPage({ pageNumber, notebookPageCount }) {
          return pageNumber === notebookPageCount && pageNumber % 2 === 1;
     }

     function isPageSideAvailable({ side, spreadIndex, notebookPageCount }) {
          return isPageNumberAvailable({
               pageNumber: (spreadIndex * 2) + (side === "right" ? 1 : 0),
               notebookPageCount
          });
     }

     function formatPageNumber({ pageNumber, notebookPageCount }) {
          return isPageNumberAvailable({ pageNumber, notebookPageCount }) ? String(pageNumber) : "";
     }

     function getFocusedPageSide({ viewFocusPoints, viewFocusIndex }) {
          return viewFocusPoints[viewFocusIndex] || "left";
     }

     function getFocusedPageNumber({ currentSpreadIndex, viewFocusPoints, viewFocusIndex }) {
          return getCurrentSpreadPageNumber({
               currentSpreadIndex,
               side: getFocusedPageSide({ viewFocusPoints, viewFocusIndex })
          });
     }

     function getNotebookPageCountState({
          pageCount,
          currentSpreadIndex,
          viewFocusIndex,
          viewFocusPoints,
          initialNotebookPageCount,
          minNotebookPageCount,
          maxNotebookPageCount,
          clamp
     }) {
          const notebookPageCount = normalizeNotebookPageCount({
               pageCount,
               initialNotebookPageCount,
               minNotebookPageCount,
               maxNotebookPageCount,
               clamp
          });
          const notebookSpreadCount = getSpreadCountForPageCount(notebookPageCount);
          const nextSpreadIndex = clamp(currentSpreadIndex, 0, notebookSpreadCount - 1);
          const focusedSide = getFocusedPageSide({ viewFocusPoints, viewFocusIndex });
          const nextFocusIndex = isPageSideAvailable({
               side: focusedSide,
               spreadIndex: nextSpreadIndex,
               notebookPageCount
          }) ? viewFocusIndex : 0;

          return {
               currentSpreadIndex: nextSpreadIndex,
               notebookPageCount,
               notebookSpreadCount,
               viewFocusIndex: nextFocusIndex
          };
     }

     function getFocusedPageState({ pageNumber, notebookPageCount, notebookSpreadCount, viewFocusPoints, clamp }) {
          const nextPageNumber = clamp(Math.round(Number(pageNumber)) || 0, 0, notebookPageCount - 1);
          const nextSide = getPageSideForPageNumber(nextPageNumber);
          const nextFocusIndex = viewFocusPoints.indexOf(nextSide);

          return {
               currentSpreadIndex: clamp(Math.floor(nextPageNumber / 2), 0, notebookSpreadCount - 1),
               viewFocusIndex: nextFocusIndex === -1 ? 0 : nextFocusIndex
          };
     }

     function movePageSnap({ direction, moveViewFocus, moveViewVerticalFocus }) {
          if (direction === "previous" || direction === "next") {
               moveViewFocus(direction);
               return;
          }

          moveViewVerticalFocus(direction === "up" ? "previous" : "next");
     }

     function updatePageActionButtons({
          focusedPageNumber,
          notebookPageCount,
          minNotebookPageCount,
          maxNotebookPageCount,
          insertPageButton,
          deletePageButton,
          pageCountStatus
     }) {
          const focusedPageExists = isPageNumberAvailable({ pageNumber: focusedPageNumber, notebookPageCount });

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

     function updateSpreadItemVisibility({
          items,
          currentSpreadIndex,
          notebookPageCount,
          getItemSpreadIndex,
          getItemPageNumber,
          closeItemMenu,
          selectedItems,
          setSelectedItem,
          updateObjectControlsState
     }) {
          items.forEach((item) => {
               const isPageItem = Boolean(item.dataset.pageId);
               const isVisible = !isPageItem || (
                    getItemSpreadIndex(item) === currentSpreadIndex &&
                    isPageNumberAvailable({ pageNumber: getItemPageNumber(item), notebookPageCount })
               );

               item.classList.toggle("is-spread-hidden", !isVisible);
               if (!isVisible) {
                    closeItemMenu(item);
                    selectedItems.delete(item);
                    item.classList.remove("is-selected");
               }
          });
          setSelectedItem(selectedItems.size ? Array.from(selectedItems).at(-1) : null);
          updateObjectControlsState();
     }

     function syncNotebookSpread({ updatePageLabels, updateSpreadItemVisibility, updatePageSnapButtons, refreshPageItemViews }) {
          updatePageLabels();
          updateSpreadItemVisibility();
          updatePageSnapButtons();
          requestAnimationFrame(refreshPageItemViews);
     }

     function turnNotebookSpread({
          step,
          currentSpreadIndex,
          notebookSpreadCount,
          pendingSpreadTurn,
          notebook,
          clamp,
          clearSelection,
          setPendingSpreadTurn,
          setCurrentSpreadIndex,
          resetViewPanOffset,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     }) {
          const nextSpreadIndex = clamp(currentSpreadIndex + step, 0, notebookSpreadCount - 1);

          if (nextSpreadIndex === currentSpreadIndex || pendingSpreadTurn) {
               return;
          }

          clearSelection();
          setPendingSpreadTurn({
               from: currentSpreadIndex,
               to: nextSpreadIndex,
               direction: step
          });
          animateSpreadTurn({
               notebook,
               direction: step,
               onComplete: () => {
                    setPendingSpreadTurn(null);
               }
          });
          setCurrentSpreadIndex(nextSpreadIndex);
          resetViewPanOffset();
          window.setTimeout(() => {
               syncNotebookSpread();
               applyViewControls();
               notifyTemplateChanged();
          }, PlannerRootControls.controls.pageCornerFlip.animation.spreadSyncDelayMs);
     }

     function getClearPageSides({ viewFocusPoints, viewFocusIndex }) {
          const focus = getFocusedPageSide({ viewFocusPoints, viewFocusIndex });

          if (focus === "left" || focus === "right") {
               return [focus];
          }

          return ["left", "right"];
     }

     function insertFocusedPage({
          notebookPageCount,
          maxNotebookPageCount,
          focusedPageNumber,
          clamp,
          clearSelection,
          closeItemMenus,
          shiftPageItemsFromPage,
          setNotebookPageCount,
          setFocusedPageNumber,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     }) {
          if (notebookPageCount >= maxNotebookPageCount) {
               return;
          }

          const insertPageNumber = clamp(focusedPageNumber, 0, notebookPageCount);

          clearSelection();
          closeItemMenus();
          shiftPageItemsFromPage(insertPageNumber, 1);
          setNotebookPageCount(notebookPageCount + 1);
          setFocusedPageNumber(insertPageNumber);
          syncNotebookSpread();
          applyViewControls();
          notifyTemplateChanged();
     }

     function deleteFocusedPage({
          notebookPageCount,
          minNotebookPageCount,
          focusedPageNumber,
          clearSelection,
          closeItemMenus,
          removeFocusedPageItems,
          setNotebookPageCount,
          setFocusedPageNumber,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     }) {
          if (
               notebookPageCount <= minNotebookPageCount ||
               !isPageNumberAvailable({ pageNumber: focusedPageNumber, notebookPageCount })
          ) {
               return;
          }

          clearSelection();
          closeItemMenus();
          removeFocusedPageItems(focusedPageNumber);
          setNotebookPageCount(notebookPageCount - 1);
          setFocusedPageNumber(Math.min(focusedPageNumber, notebookPageCount - 1));
          syncNotebookSpread();
          applyViewControls();
          notifyTemplateChanged();
     }

     function clearFocusedPage({ clearItems, getFocusedPageItems, notifyTemplateChanged }) {
          clearItems(getFocusedPageItems());
          notifyTemplateChanged();
     }

     function clearCurrentBook({ clearCurrentBookItems, notifyTemplateChanged }) {
          clearCurrentBookItems();
          notifyTemplateChanged();
     }

     function isCornerPointer(page, event, { gridColumns, gridRows }) {
          if (!page.classList.contains("can-turn-page")) {
               return false;
          }

          const rect = page.getBoundingClientRect();
          const cellWidth = rect.width / gridColumns;
          const cellHeight = rect.height / gridRows;
          const localX = event.clientX - rect.left;
          const localY = event.clientY - rect.top;
          const hitAreaGridCells = PlannerRootControls.controls.pageCornerFlip.hitAreaGridCells;
          const isBottomCornerArea = localY >= rect.height - (cellHeight * hitAreaGridCells);

          if (page.dataset.turnPage === "next") {
               return isBottomCornerArea && localX >= rect.width - (cellWidth * hitAreaGridCells);
          }

          return isBottomCornerArea && localX <= cellWidth * hitAreaGridCells;
     }

     function bindPageTurnControls({ pages, getGridMetrics, turnNotebookSpread }) {
          pages.forEach((page) => {
               page.addEventListener("click", (event) => {
                    if (event.target.closest(".planner-item, .item-controls")) {
                         return;
                    }

                    if (!isCornerPointer(page, event, getGridMetrics())) {
                         return;
                    }

                    turnNotebookSpread(page.dataset.turnPage === "next" ? 1 : -1);
               });

               page.addEventListener("pointermove", (event) => {
                    page.classList.toggle("is-corner-hover", isCornerPointer(page, event, getGridMetrics()));
               });

               page.addEventListener("pointerleave", () => {
                    page.classList.remove("is-corner-hover");
               });
          });
     }

     function animateSpreadTurn({ notebook, direction, onComplete }) {
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
               onComplete?.();
          }, PlannerRootControls.controls.pageCornerFlip.animation.classResetDelayMs);
     }

     applyControls();

     return {
          animateSpreadTurn,
          applyControls,
          applyCornerFlipControls,
          applyPageNumberLayering,
          bindPageTurnControls,
          debugColors: PlannerRootControls.controls.pageCornerFlip.debugColors,
          formatPageNumber,
          getCurrentSpreadPageNumber,
          getFocusedPageNumber,
          getFocusedPageSide,
          getFocusedPageState,
          getClearPageSides,
          getNotebookPageCountState,
          getPageSideForPageNumber,
          getSpreadCountForPageCount,
          isCornerPointer,
          isFinalRightPlaceholderPage,
          isPageNumberAvailable,
          isPageSideAvailable,
          insertFocusedPage,
          layering: {
               ...PlannerRootControls.controls.pageNumbers.layering,
               ...PlannerRootControls.controls.pageCornerFlip.layering
          },
          movePageSnap,
          normalizeNotebookPageCount,
          clearCurrentBook,
          clearFocusedPage,
          deleteFocusedPage,
          syncNotebookSpread,
          turnNotebookSpread,
          updatePageActionButtons,
          updateSpreadItemVisibility,
          updatePageLabels
     };
})();

// NOTE: Things The App Grabs From The HTML
const pages = Array.from(document.querySelectorAll("[data-page]"));
const plannerDesk = document.querySelector(".planner-desk");
const plannerSettings = document.querySelector(".planner-settings");
const notebook = document.querySelector(".notebook");
const sourceItems = Array.from(document.querySelectorAll("[data-create-item]"));
const insertPageButton = document.querySelector("[data-insert-page]");
const deletePageButton = document.querySelector("[data-delete-page]");
const pastePageButton = document.querySelector("[data-paste-page]");
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
          return item.offsetHeight / (itemGridUnits[item.dataset.itemType]?.height || stickyGridUnits);
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
pastePageButton?.addEventListener("click", pastePlannerClipboard);
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
     turnNotebookSpread
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
initializeCalendarSourcePreviews(sourceItems);
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
     handleClipboardShortcut(event);
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
