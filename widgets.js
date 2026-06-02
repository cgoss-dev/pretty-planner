// NOTE: Widget Theme Defaults
let plannerThemesData = null;
let plannerWidgetThemeSlots = null;

function getThemeColorValue(colorKey) {
     const colorMap = {
          gray1: "var(--color-gray1)",
          gray2: "var(--color-gray2)",
          gray3: "var(--color-gray3)",
          gray4: "var(--color-gray4)",
          paper: "var(--paper)",
          tint30: "var(--tint-30)",
          tint70: "var(--tint-70)",
          shade10: "var(--shade-10)",
          shade30: "var(--shade-30)",
          shade50: "var(--shade-50)",
          shade70: "var(--shade-70)",
          tertiary8: "var(--tertiary-08)"
     };

     return colorMap[colorKey] || colorKey || "";
}

function getThemeTextSize(theme, textTheme = {}) {
     const baseSize = Number(theme?.text?.body?.size) || 10;

     return Number(textTheme.size) || (Number(textTheme.sizeMultiplier) ? baseSize * Number(textTheme.sizeMultiplier) : baseSize);
}

function getThemeFillValue(theme, fillSlot) {
     const defaultGrid = typeof getPlannerDefaultGridSettings === "function" ? getPlannerDefaultGridSettings() : null;
     const fillColor = fillSlot === "fillColor1" && defaultGrid?.fill
          ? defaultGrid.fill
          : getThemeColorValue(theme.widget?.[fillSlot]);
     const baseFill = defaultGrid?.fill || getThemeColorValue(theme.widget?.fillColor1 || "paper");

     if (!fillColor || fillSlot === "fillColor1") {
          return fillColor || baseFill;
     }

     return `linear-gradient(${fillColor}, ${fillColor}), ${baseFill}`;
}

function applyTextThemeToElement(element, textTheme = {}, theme = null, overrides = {}) {
     const nextTextTheme = {
          ...textTheme,
          ...overrides
     };
     const partStyle = typeof getPlannerWidgetTextPartStyle === "function"
          ? getPlannerWidgetTextPartStyle(nextTextTheme.widgetType, nextTextTheme.partName)
          : null;
     const defaultText = typeof getPlannerDefaultTextSettings === "function" ? getPlannerDefaultTextSettings(partStyle || {}) : (partStyle || null);

     element.style.fontFamily = getStickerTextFont(defaultText?.font || nextTextTheme.typeface || "annotation-mono");
     element.style.fontSize = `${defaultText?.size || getThemeTextSize(theme, nextTextTheme)}px`;
     element.style.color = defaultText?.color || getThemeColorValue(nextTextTheme.color || "gray1");
     element.style.fontWeight = (defaultText?.bold === "true" || nextTextTheme.style?.includes("bold")) ? "700" : "400";
     element.style.fontStyle = (defaultText?.italic === "true" || nextTextTheme.style?.includes("italic")) ? "italic" : "normal";
     element.style.textDecoration = getTextDecorationValue(
          defaultText?.underline ?? (nextTextTheme.style?.includes("underline") ? "true" : "false"),
          defaultText?.strike ?? (nextTextTheme.style?.includes("strikethrough") ? "true" : "false")
     );
     element.style.textAlign = defaultText?.align || "center";
     element.style.alignContent = getTextYAlignValue(defaultText?.yAlign || "center");
}

function getWidgetTypeTextParts(type) {
     return plannerWidgetThemeSlots?.widgets?.[type]?.parts || {};
}

function getWidgetTextPartSlots(type, partName) {
     return getWidgetTypeTextParts(type)?.[partName] || null;
}

function getWidgetSharedTextPartName(type, partName) {
     if ((type === "weekly-view" || type === "day-view" || type === "diary-view") && partName === "weekendDayHeader") {
          return "dayHeader";
     }

     return partName;
}

function getDefaultWidgetTextPartToc(type, partName) {
     return false;
}

function getWidgetTextPartToc(type, partName) {
     if (typeof getPlannerWidgetTextPartToc === "function") {
          const storedValue = getPlannerWidgetTextPartToc(type, partName);

          if (storedValue === "true" || storedValue === "false") {
               return storedValue === "true";
          }
     }

     return getDefaultWidgetTextPartToc(type, partName);
}

function setWidgetTextPartToc(type, partName, appearsInToc) {
     if (typeof setPlannerWidgetTextPartToc !== "function") {
          return;
     }

     setPlannerWidgetTextPartToc(type, partName, appearsInToc);
}

function setWidgetTextPartStyle(type, partName, style) {
     if (typeof setPlannerWidgetTextPartStyle !== "function") {
          return;
     }

     setPlannerWidgetTextPartStyle(type, partName, style);
}

function applyThemeToWidget(item) {
     const theme = plannerThemesData?.themes?.[0];
     const widgetSlots = plannerWidgetThemeSlots?.widgets?.[item.dataset.itemType];
     const hasCustomItemStyle = item.dataset.themeMode === "custom";

     if (!theme || !widgetSlots) {
          return;
     }

     Object.entries(widgetSlots.parts || {}).forEach(([partName, partSlots]) => {
          item.querySelectorAll(`[data-theme-part="${partName}"]`).forEach((part) => {
               const isCustomBackgroundFill = hasCustomItemStyle
                    && partSlots.fillSlot
                    && partSlots.fillSlot === widgetSlots.parts?.background?.fillSlot;
               const isCustomBackgroundBorder = hasCustomItemStyle
                    && partSlots.borderSlot
                    && partSlots.borderSlot === widgetSlots.parts?.background?.borderSlot;

               if (partSlots.textSlot && item.dataset.itemType === "sticker" && partName === "text") {
                    setStickerTextSettings(item);
               } else if (partSlots.textSlot) {
                    const textPartName = getWidgetSharedTextPartName(item.dataset.itemType, partName);

                    applyTextThemeToElement(part, theme.text?.[partSlots.textSlot] || {}, theme, {
                         textSlot: partSlots.textSlot,
                         widgetType: item.dataset.itemType,
                         partName: textPartName,
                         sizeMultiplier: partSlots.sizeMultiplier
                    });
               }
               if (!isCustomBackgroundFill && partSlots.fillSlot && theme.widget?.[partSlots.fillSlot]) {
                    if (isCalendarItem(item) && partSlots.fillSlot !== "fillColor1") {
                         part.style.background = "";
                    } else {
                         part.style.background = getThemeFillValue(theme, partSlots.fillSlot);
                    }
               }
               if (!isCustomBackgroundBorder && partSlots.borderSlot && theme.widget?.[partSlots.borderSlot]) {
                    part.style.borderColor = "#ccc";
               }
          });
     });

     const backgroundSlots = widgetSlots.parts?.background;

     if (!hasCustomItemStyle && backgroundSlots?.fillSlot && theme.widget?.[backgroundSlots.fillSlot]) {
          item.style.setProperty("--sticker-fill", getThemeFillValue(theme, backgroundSlots.fillSlot));
          item.style.setProperty("--widget-box-fill", getThemeFillValue(theme, backgroundSlots.fillSlot));
     }
     if (!hasCustomItemStyle && backgroundSlots?.borderSlot && theme.widget?.[backgroundSlots.borderSlot]) {
          item.style.setProperty("--sticker-border-color", "#ccc");
     }
     if (!hasCustomItemStyle) {
          applyDefaultGridLineStyles(item);
     }
}

function getGridLineStyle(lineSettings = {}) {
     return {
          color: "#ccc",
          width: "1px"
     };
}

function applyDefaultGridLineStyles(item) {
     if (typeof getPlannerDefaultGridSettings !== "function") {
          return;
     }

     const grid = getPlannerDefaultGridSettings();
     const perimeter = getGridLineStyle(grid.perimeter);
     const title = getGridLineStyle(grid.title);
     const bodyVertical = getGridLineStyle(grid.bodyVertical);
     const bodyHorizontal = getGridLineStyle(grid.bodyHorizontal);

     item.style.setProperty("--widget-perimeter-line-color", perimeter.color);
     item.style.setProperty("--widget-perimeter-line-width", perimeter.width);
     item.style.setProperty("--widget-title-line-color", title.color);
     item.style.setProperty("--widget-title-line-width", title.width);
     item.style.setProperty("--widget-body-v-line-color", bodyVertical.color);
     item.style.setProperty("--widget-body-v-line-width", bodyVertical.width);
     item.style.setProperty("--widget-body-h-line-color", bodyHorizontal.color);
     item.style.setProperty("--widget-body-h-line-width", bodyHorizontal.width);
     item.style.setProperty("--sticker-border-color", perimeter.color);
     item.style.setProperty("--sticker-border-size", perimeter.width);
}

async function loadPlannerThemeData() {
     try {
          const [themesResponse, slotsResponse] = await Promise.all([
               fetch("data/themes.json?v=planner-storage-8"),
               fetch("data/widget-theme-slots.json?v=planner-storage-8")
          ]);

          plannerThemesData = await themesResponse.json();
          plannerWidgetThemeSlots = await slotsResponse.json();
          getAllPlannerItems()
               .filter((item) => Boolean(plannerWidgetThemeSlots?.widgets?.[item.dataset.itemType]))
               .forEach((item) => {
                    applyThemeToWidget(item);
                    if (isCalendarItem(item)) {
                         applyCalendarPartStyles(item);
                    }
               });
     } catch (error) {
          console.warn("Theme data could not be loaded.", error);
     }
}





// NOTE: Table Of Contents Helpers
function isTocItemType(type) {
     return type === "toc";
}

function isTocItem(item) {
     return isTocItemType(item?.dataset?.itemType);
}

function getTocItems(items) {
     return items.filter(isTocItem);
}

function getTocDisplayTitle(title) {
     return String(title || "").replace(/\s+/g, " ").trim();
}

function renderToc(item, entries = []) {
     if (!isTocItem(item)) {
          return;
     }

     const tocEntries = Array.isArray(entries) ? entries : [];
     const tocTitleGridRows = 5;
     const tocBodyGridRows = 2;
     let toc = item.querySelector(".toc-widget");

     if (!toc) {
          toc = document.createElement("div");
          toc.className = "toc-widget";
          item.append(toc);
     }

     const list = document.createElement("div");
     const tocTitle = document.createElement("div");
     const tocTitleName = document.createElement("span");

     list.className = "toc-list";
     list.style.setProperty("--toc-title-row-span", String(tocTitleGridRows));
     list.style.setProperty("--toc-body-row-span", String(tocBodyGridRows));
     toc.replaceChildren(list);
     tocTitle.className = "toc-title";
     tocTitle.style.gridRow = "1";
     tocTitle.dataset.themePart = "heading";
     tocTitleName.className = "toc-title-name";
     tocTitleName.textContent = "Contents";
     tocTitle.append(tocTitleName);
     list.append(tocTitle);

     if (!tocEntries.length) {
          const empty = document.createElement("div");

          empty.className = "toc-empty";
          empty.textContent = "No page titles";
          list.append(empty);
          applyThemeToWidget(item);
          return;
     }

     tocEntries.forEach((entry) => {
          const row = document.createElement("button");
          const number = document.createElement("span");
          const title = document.createElement("span");

          row.className = "toc-row";
          row.type = "button";
          row.dataset.tocPageNumber = String(entry.pageNumber);
          row.setAttribute("aria-label", `Go to page ${entry.pageNumber}`);
          row.addEventListener("click", (event) => {
               event.stopPropagation();
               if (typeof activeAction !== "undefined" && activeAction) {
                    return;
               }
               if (typeof setFocusedPageNumber === "function") {
                    setFocusedPageNumber(entry.pageNumber);
               }
               if (typeof resetViewPanOffset === "function") {
                    resetViewPanOffset();
               }
               if (typeof syncNotebookSpread === "function") {
                    syncNotebookSpread();
               }
               if (typeof applyViewControls === "function") {
                    applyViewControls();
               }
          });
          number.className = "toc-page-number";
          number.textContent = String(entry.pageNumber);
          title.className = "toc-entry-title";
          title.textContent = getTocDisplayTitle(entry.title);
          row.append(number, title);
          list.append(row);
     });

     applyThemeToWidget(item);
}

function renderTocWidgetsForItems(items, getEntries) {
     getTocItems(items).forEach((item) => renderToc(item, getEntries()));
}

function updateTocGridMetrics(item, page, box) {
     if (!isTocItem(item)) {
          return;
     }

     const grid = page ? getGridSize(page) : null;
     const fallbackWidthUnits = itemGridUnits.toc?.width || 18;
     const fallbackHeightUnits = itemGridUnits.toc?.height || 19;
     const columnWidth = grid ? grid.x : box.width / fallbackWidthUnits;
     const rowHeight = grid ? grid.y : box.height / fallbackHeightUnits;
     const titleGridRows = 5;
     const bodyGridRows = 2;
     const rowCount = Math.max(1, Math.floor((Math.round(box.height / rowHeight) - titleGridRows) / bodyGridRows));
     item.style.setProperty("--toc-left-column-width", `${columnWidth * tocLeftColumnGridUnits}px`);
     item.style.setProperty("--toc-right-column-min-width", `${columnWidth * tocRightColumnMinGridUnits}px`);
     item.style.setProperty("--toc-row-height", `${rowHeight}px`);
     item.style.setProperty("--toc-title-row-height", `${rowHeight * titleGridRows}px`);
     item.style.setProperty("--toc-body-row-height", `${rowHeight * bodyGridRows}px`);
     item.style.setProperty("--toc-row-count", String(rowCount));
}

function getTocMinGridColumns() {
     return tocLeftColumnGridUnits + tocRightColumnMinGridUnits;
}

function clampTocBox(item, page, box) {
     if (!isTocItem(item)) {
          return box;
     }

     const grid = getGridSize(page);
     const minWidth = grid.x * getTocMinGridColumns();
     const snappedWidth = Math.max(minWidth, Math.round(box.width / grid.x) * grid.x);

     return {
          ...box,
          width: snappedWidth
     };
}

function setItemStyle(item, style) {
     item.dataset.fillColor = style.fillColor || item.dataset.fillColor || "var(--color-white)";
     item.dataset.borderColor = "#ccc";
     item.dataset.borderWidth = "1";
     item.dataset.dotGrid = style.dotGrid || item.dataset.dotGrid || "false";
     item.dataset.titleBarVisible = style.titleBarVisible ?? item.dataset.titleBarVisible ?? "true";
     delete item.dataset.titleFillVisible;
     delete item.dataset.titleBorderVisible;
     const hasClearFill = item.dataset.fillColor === "transparent";
     const hasClearBorder = false;

     item.dataset.hasClearFill = String(hasClearFill);
     item.dataset.hasClearBorder = String(hasClearBorder);
     delete item.dataset.fillAlpha;
     delete item.dataset.borderAlpha;
     applyDefaultGridLineStyles(item);
     item.style.setProperty("--sticker-fill", item.dataset.fillColor);
     item.style.setProperty("--sticker-fill-opaque", item.dataset.fillColor);
     item.style.setProperty("--widget-box-fill", item.dataset.fillColor);
     if (hasClearFill) {
          item.style.setProperty("--calendar-tint-alpha", "0");
     } else {
          item.style.removeProperty("--calendar-tint-alpha");
     }
     item.style.setProperty("--sticker-border-color", item.dataset.borderColor);
     item.style.setProperty("--sticker-border-size", `${item.dataset.borderWidth}px`);

     const controls = getWidgetPanel(item) || item;
     const fillInput = controls.querySelector("[data-style-control='fill']");
     const fillSwatches = controls.querySelector("[data-style-swatches='fill']");
     const dotGridInput = controls.querySelector("[data-style-control='dot-grid']");
     const titleBarInput = controls.querySelector("[data-widget-control='title-bar-visible']");

     if (fillInput) {
          setPaletteControlValue(fillInput, fillSwatches, item.dataset.fillColor);
     }

     if (dotGridInput) {
          dotGridInput.checked = item.dataset.dotGrid === "true";
     }

     if (titleBarInput) {
          titleBarInput.checked = item.dataset.titleBarVisible !== "false";
     }

     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
}

function isSidebarControlVisibleForItem(item, controlKey) {
     if (!item || !controlKey || typeof isPlannerWidgetControlVisible !== "function") {
          return true;
     }

     return isPlannerWidgetControlVisible(item.dataset.itemType, controlKey);
}

function applySidebarControlVisibility(item) {
     const controls = getWidgetPanel(item);

     if (!controls) {
          return;
     }

     controls.querySelectorAll("[data-sidebar-control]").forEach((control) => {
          control.hidden = !isSidebarControlVisibleForItem(item, control.dataset.sidebarControl);
     });
}

window.applySidebarControlVisibility = applySidebarControlVisibility;

// NOTE: Table Of Contents, And Page Ins/Rmv Rules
function getClearPageSides() {
     return PageControls.getClearPageSides({ viewFocusPoints, viewFocusIndex });
}

function isStickerTextItemType(type) {
     return type === "sticker" || type === "toc";
}

function isStickerTextItem(item) {
     return isStickerTextItemType(item?.dataset?.itemType);
}

function getPageNumberForPage(page) {
     return getCurrentSpreadPageNumber(getPageId(page));
}

function isFullMonthItem(item) {
     return item?.dataset?.itemType === "full-month";
}

function getFullMonthTocTitle(item) {
     if (!isFullMonthItem(item)) {
          return "";
     }

     const monthDisplay = item.dataset.monthDisplay || "full";
     const yearDisplay = item.dataset.yearDisplay || (item.dataset.yearVisible === "false" ? "none" : "full");
     const dateFormats = typeof getCalendarDateFormats === "function" ? getCalendarDateFormats(item) : {};
     const { month, year } = typeof getCalendarEffectiveMonthYear === "function"
          ? getCalendarEffectiveMonthYear(item)
          : {
               month: Number(item.dataset.month) || 0,
               year: Number(item.dataset.year) || new Date().getFullYear()
          };
     const monthText = monthDisplay === "none" || typeof getCalendarMonthTitle !== "function"
          ? ""
          : getCalendarMonthTitle(month, dateFormats.monthFormat === "ddd" ? "short" : "full");
     const yearText = yearDisplay === "none" || typeof getCalendarYearTitle !== "function"
          ? ""
          : getCalendarYearTitle(year, dateFormats.yearFormat === "yy" ? "short" : "full");
     const title = [monthText, yearText].filter(Boolean).join(" ").trim();

     return title || "Full Month";
}

function getWidgetTextPartTocTitle(item, partName) {
     if (isFullMonthItem(item) && partName === "monthTitle") {
          return getFullMonthTocTitle(item);
     }

     const text = Array.from(item.querySelectorAll(`[data-theme-part="${partName}"]`))
          .map((element) => element.textContent.trim())
          .find(Boolean);

     return text || getReadableTextPartName(partName);
}

function getTocTitleEntries() {
     const widgetTextEntries = getAllPlannerItems()
          .filter((item) => item.dataset.pageId && isPageNumberAvailable(getItemPageNumber(item)))
          .flatMap((item) => Array.from(new Set(Array.from(item.querySelectorAll("[data-theme-part]")).map((part) => part.dataset.themePart).filter(Boolean)))
               .filter((partName) => getWidgetTextPartToc(item.dataset.itemType, partName))
               .map((partName) => ({
                    pageNumber: getItemPageNumber(item),
                    title: getWidgetTextPartTocTitle(item, partName),
                    sourceId: `${item.dataset.templateId}:${partName}`
               })))
          .filter((entry) => entry.title !== "");
     const uniqueEntries = [...widgetTextEntries, ...getManualTocEntries()]
          .filter((entry, index, entries) => entries.findIndex((candidate) => candidate.pageNumber === entry.pageNumber && getTocDisplayTitle(candidate.title) === getTocDisplayTitle(entry.title)) === index);

     return uniqueEntries
          .sort((first, second) => first.pageNumber - second.pageNumber);
}

function getManualTocEntries() {
     const stickerEntries = getAllPlannerItems()
          .filter((item) => isStickerTextItem(item) && item.dataset.pageId && item.dataset.textAppearsInToc === "true" && isPageNumberAvailable(getItemPageNumber(item)))
          .map((item) => ({
               pageNumber: getItemPageNumber(item),
               title: getStickerTextElement(item)?.textContent?.trim() || getReadableTextPartName(item.dataset.itemType)
          }))
          .filter((entry) => entry.title !== "");
     const calendarTextEntries = getAllPlannerItems()
          .filter((item) => typeof isCalendarTextItem === "function" && isCalendarTextItem(item) && item.dataset.pageId && item.dataset.dayTextAppearsInToc === "true" && isPageNumberAvailable(getItemPageNumber(item)))
          .flatMap((item) => Array.from(item.querySelectorAll(".calendar-day-text"))
               .map((textElement) => ({
                    pageNumber: getItemPageNumber(item),
                    title: textElement.textContent.trim()
               })))
          .filter((entry) => entry.title !== "");

     return [...stickerEntries, ...calendarTextEntries];
}

function renderTocWidgets() {
     renderTocWidgetsForItems(getAllPlannerItems(), getTocTitleEntries);
}

function canPlaceItemOnPage(item, page) {
     return true;
}

function canPlaceActiveMoveItemsOnPage(page) {
     return true;
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
     PageControls.insertFocusedPage({
          notebookPageCount,
          maxNotebookPageCount,
          focusedPageNumber: getFocusedPageNumber(),
          clamp,
          clearSelection,
          closeItemMenus,
          shiftPageItemsFromPage,
          setNotebookPageCount,
          setFocusedPageNumber,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     });
}

function deleteFocusedPage() {
     const deletePageNumber = getFocusedPageNumber();

     PageControls.deleteFocusedPage({
          notebookPageCount,
          minNotebookPageCount,
          focusedPageNumber: deletePageNumber,
          clearSelection,
          closeItemMenus,
          removeFocusedPageItems: (pageToDelete) => {
               const removedItems = [];

               getAllPlannerItems().forEach((item) => {
                    if (!item.dataset.pageId) {
                         return;
                    }

                    const pageNumber = getItemPageNumber(item);

                    if (pageNumber === pageToDelete) {
                         removedItems.push(item);
                    } else if (pageNumber > pageToDelete) {
                         setItemPageNumber(item, pageNumber - 1);
                    }
               });
               clearItems(removedItems);
          },
          setNotebookPageCount,
          setFocusedPageNumber,
          syncNotebookSpread,
          applyViewControls,
          notifyTemplateChanged
     });
}

function clearFocusedPage() {
     PageControls.clearFocusedPage({
          clearItems,
          getFocusedPageItems: () => {
               const pageSides = new Set(getClearPageSides());

               return getAllPlannerItems().filter((item) => (
                    item.dataset.pageId &&
                    getItemSpreadIndex(item) === currentSpreadIndex &&
                    pageSides.has(item.dataset.pageId)
               ));
          },
          notifyTemplateChanged
     });
}

function clearCurrentBook() {
     PageControls.clearCurrentBook({
          clearCurrentBookItems,
          notifyTemplateChanged
     });
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
     renderTocWidgets();
     savePlannerState();
     window.dispatchEvent(new CustomEvent("perfectplanner:templatechange", {
          detail: serializePlannerTemplate()
     }));
}

// NOTE: Item Position, Size, And Grid Snapping
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
               applyThemeToWidget(item);
               if (isCalendarItem(item)) {
                    applyCalendarPartStyles(item);
               }
               positionWidgetPanel(item);
          }
     });
}

function setItemBox(item, box) {
     const page = getItemPage(item);
     const shouldScaleWithPage = page && item.parentElement === plannerDesk;
     const viewZoom = shouldScaleWithPage ? getViewZoom() : 1;

     if (page) {
          box = clampPerpetualCalendarBox(item, page, box);
          box = clampMiniMonthBox(item, page, box);
          box = clampTocBox(item, page, box);
     }

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
     item.style.setProperty("--item-width", `${box.width}px`);
     item.style.setProperty("--item-height", `${box.height}px`);
     updateStickerDotGrid(item, page, box);
     updateItemSizeLabel(item);
     if (item.dataset.itemType === "full-month" || isTimeGridCalendarType(item.dataset.itemType)) {
          updateCalendarGridMetrics(item, page, box);
     }
     updateTocGridMetrics(item, page, box);
     updatePerpetualCalendarGridMetrics(item, page, box);
     updateItemTextLineHeight(item);
     updateStickerTextOverflow(item);
     renderToc(item, getTocTitleEntries());
     if (isTimeGridCalendarType(item.dataset.itemType)) {
          renderWeeklyVertical(item);
     }
     updateCalendarTextOverflow(item);
}

function updateStickerDotGrid(item, page, box) {
     if (item.dataset.itemType !== "sticker") {
          return;
     }

     if (!page) {
          item.style.setProperty("--sticker-dot-grid-size-x", `${box.width / stickerGridUnits}px`);
          item.style.setProperty("--sticker-dot-grid-size-y", `${box.height / stickerGridUnits}px`);
          item.style.setProperty("--sticker-dot-grid-offset-x", "0px");
          item.style.setProperty("--sticker-dot-grid-offset-y", "0px");
          return;
     }

     const grid = getGridSize(page);
     const origin = getGridSnapOrigin(page);
     const offsetX = (((box.x - origin.x) % grid.x) + grid.x) % grid.x;
     const offsetY = (((box.y - origin.y) % grid.y) + grid.y) % grid.y;

     item.style.setProperty("--sticker-dot-grid-size-x", `${grid.x}px`);
     item.style.setProperty("--sticker-dot-grid-size-y", `${grid.y}px`);
     item.style.setProperty("--sticker-dot-grid-offset-x", `${-offsetX}px`);
     item.style.setProperty("--sticker-dot-grid-offset-y", `${-offsetY}px`);
}

// NOTE: Text Inside Notes, Titles, And Calendars
function getStickerTextElement(item) {
     if (isTocItem(item)) {
          return item.querySelector(".toc-widget");
     }

     return item.querySelector(".sticker-text");
}

function getTextYAlignValue(value = "top") {
     if (value === "center") {
          return "center";
     }
     if (value === "bottom") {
          return "end";
     }
     return "start";
}

function normalizeEditablePlainText(textElement) {
     // NOTE: Strips pasted rich text markup while preserving the visible text
     if (!textElement) {
          return;
     }

     const text = textElement.textContent || "";

     if (textElement.childNodes.length !== 1 || textElement.firstChild?.nodeType !== Node.TEXT_NODE) {
          textElement.textContent = text;
     }
}

function insertPlainTextAtSelection(text) {
     // NOTE: Inserts clipboard text without carrying over HTML styles
     const selection = window.getSelection();

     if (!selection || !selection.rangeCount) {
          return false;
     }

     selection.deleteFromDocument();

     const range = selection.getRangeAt(0);
     const textNode = document.createTextNode(text);

     range.insertNode(textNode);
     range.setStartAfter(textNode);
     range.collapse(true);
     selection.removeAllRanges();
     selection.addRange(range);
     return true;
}

function handlePlainTextPaste(event) {
     // NOTE: Keeps pasted text from importing spans, backgrounds, or other source styling
     const text = event.clipboardData?.getData("text/plain");

     if (text === undefined || text === null) {
          return;
     }

     event.preventDefault();
     insertPlainTextAtSelection(text);
}

function updateTextToggleControl(control, isActive) {
     if (!control) {
          return;
     }

     control.classList.toggle("is-active", Boolean(isActive));
     control.setAttribute("aria-pressed", String(Boolean(isActive)));
}

function updateTextSizeControls(controls, size) {
     controls.querySelectorAll("[data-text-size-value]").forEach((button) => {
          const isActive = button.dataset.textSizeValue === String(size);

          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-pressed", String(isActive));
     });
}

function updateTextAlignmentControls(controls, align, yAlign) {
     controls.querySelectorAll("[data-text-align-value][data-text-y-align-value]").forEach((button) => {
          const isActive = button.dataset.textAlignValue === align && button.dataset.textYAlignValue === yAlign;

          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-pressed", String(isActive));
     });
}

function updateItemTextLineHeight(item) {
     if (!item) {
          return;
     }

     if (isStickerTextItem(item)) {
          const textElement = getStickerTextElement(item);

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

function setStickerTextSettings(item, settings = {}) {
     if (!isStickerTextItem(item)) {
          return;
     }

     const textElement = getStickerTextElement(item);
     const controls = getWidgetPanel(item) || item;
     const isGeneratedTextItem = isTocItem(item);
     const isEnabled = isGeneratedTextItem ? "true" : settings.enabled ?? item.dataset.textEnabled ?? "false";

     item.dataset.textEnabled = String(isEnabled);
     item.dataset.textSize = settings.size || item.dataset.textSize || "10";
     item.dataset.textFont = settings.font || item.dataset.textFont || "annotation-mono";
     item.dataset.textColor = settings.color || item.dataset.textColor || "var(--color-gray1)";
     delete item.dataset.textAlpha;
     item.dataset.textBold = settings.bold ?? item.dataset.textBold ?? "false";
     item.dataset.textItalic = settings.italic ?? item.dataset.textItalic ?? "false";
     item.dataset.textUnderline = settings.underline ?? item.dataset.textUnderline ?? "false";
     item.dataset.textStrike = settings.strike ?? item.dataset.textStrike ?? "false";
     item.dataset.textAlign = settings.align || item.dataset.textAlign || "center";
     item.dataset.textYAlign = settings.yAlign || item.dataset.textYAlign || "center";
     item.dataset.textLineHeight = settings.lineHeight || item.dataset.textLineHeight || "1";

     if (textElement) {
          if (!isTocItem(item) && settings.content !== undefined) {
               textElement.textContent = settings.content;
          }

          textElement.hidden = item.dataset.textEnabled !== "true";
          textElement.style.fontSize = `${item.dataset.textSize}px`;
          textElement.style.color = item.dataset.textColor;
          textElement.style.fontFamily = getStickerTextFont(item.dataset.textFont);
          textElement.style.fontWeight = item.dataset.textBold === "true" ? "700" : "400";
          textElement.style.fontStyle = item.dataset.textItalic === "true" ? "italic" : "normal";
          textElement.style.textDecoration = getTextDecorationValue(item.dataset.textUnderline, item.dataset.textStrike);
          textElement.style.textAlign = item.dataset.textAlign;
          textElement.style.alignContent = getTextYAlignValue(item.dataset.textYAlign);
          textElement.style.lineHeight = getTextLineHeightPixels(item, item.dataset.textLineHeight);
     }

     const fontSelect = controls.querySelector("[data-text-control='font']");
     const colorInput = controls.querySelector("[data-text-control='color']");
     const colorSwatches = controls.querySelector("[data-text-swatches='color']");
     const boldInput = controls.querySelector("[data-text-control='bold']");
     const italicInput = controls.querySelector("[data-text-control='italic']");
     const underlineInput = controls.querySelector("[data-text-control='underline']");
     const strikeInput = controls.querySelector("[data-text-control='strike']");
     const alignSelect = controls.querySelector("[data-text-control='align']");
     const yAlignSelect = controls.querySelector("[data-text-control='y-align']");
     const lineHeightSelect = controls.querySelector("[data-text-control='line-height']");

     updateTextSizeControls(controls, item.dataset.textSize);

     if (fontSelect) {
          fontSelect.value = item.dataset.textFont;
     }

     if (colorInput) {
          setPaletteControlValue(colorInput, colorSwatches, item.dataset.textColor);
     }

     if (boldInput) {
          updateTextToggleControl(boldInput, item.dataset.textBold === "true");
     }

     if (italicInput) {
          updateTextToggleControl(italicInput, item.dataset.textItalic === "true");
     }

     if (underlineInput) {
          updateTextToggleControl(underlineInput, item.dataset.textUnderline === "true");
     }

     if (strikeInput) {
          updateTextToggleControl(strikeInput, item.dataset.textStrike === "true");
     }

     if (alignSelect) {
          alignSelect.value = item.dataset.textAlign;
     }

     if (yAlignSelect) {
          yAlignSelect.value = item.dataset.textYAlign;
     }

     updateTextAlignmentControls(controls, item.dataset.textAlign, item.dataset.textYAlign);

     if (lineHeightSelect) {
          lineHeightSelect.value = item.dataset.textLineHeight;
     }

     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
     updateStickerTextOverflow(item);
}

function getStickerTextFont(fontKey) {
     const normalizedFontKey = fontKey === "noto" ? "noto-sans-mono" : fontKey;
     const fonts = {
          "annotation-mono": "var(--font-annotation-mono)",
          "noto-sans-mono": "var(--font-noto-sans-mono)",
          bungee: "var(--font-bungee)",
          "bungee-outline": "var(--font-bungee-outline)",
          "bungee-shade": "var(--font-bungee-shade)",
          dancing: "var(--font-dancing)",
          caveat: "var(--font-caveat)",
          miltonian: "var(--font-miltonian)",
          "permanent-marker": "var(--font-permanent-marker)",
          "rock-salt": "var(--font-rock-salt)",
          "sedgwick-ave-display": "var(--font-sedgwick-ave-display)",
          "sofia-sans-ec": "var(--font-sofia-sans-ec)",
          sans: "Arial, Verdana, sans-serif",
          serif: "Georgia, serif"
     };

     return fonts[normalizedFontKey] || fonts["annotation-mono"];
}

function getTextDecorationValue(underline, strike) {
     const decorations = [];

     if (underline === "true") {
          decorations.push("underline");
     }

     if (strike === "true") {
          decorations.push("line-through");
     }

     return decorations.length ? decorations.join(" ") : "none";
}

function updateStickerTextOverflow(item) {
     if (!item || !isStickerTextItem(item)) {
          return;
     }

     const textElement = getStickerTextElement(item);

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

function stopStickerTextEditing(item) {
     const textElement = getStickerTextElement(item);

     if (!textElement) {
          return;
     }

     textElement.setAttribute("contenteditable", "false");
     normalizeEditablePlainText(textElement);
     item.classList.remove("is-editing-text");
     updateTextEditingState();
     renderKeyHints();
     updateStickerTextOverflow(item);
     notifyTemplateChanged();
}

function selectStickerTextWordAtPoint(textElement, clientX, clientY) {
     const selection = window.getSelection();
     let range = null;

     if (!selection) {
          return false;
     }
     if (typeof document.caretRangeFromPoint === "function") {
          range = document.caretRangeFromPoint(clientX, clientY);
     } else if (typeof document.caretPositionFromPoint === "function") {
          const position = document.caretPositionFromPoint(clientX, clientY);

          if (position) {
               range = document.createRange();
               range.setStart(position.offsetNode, position.offset);
               range.collapse(true);
          }
     }
     if (!range || !textElement.contains(range.startContainer)) {
          range = document.createRange();
          range.selectNodeContents(textElement);
     } else if (range.startContainer.nodeType === Node.TEXT_NODE) {
          const text = range.startContainer.textContent || "";
          let start = range.startOffset;
          let end = range.startOffset;

          while (start > 0 && !/\s/.test(text[start - 1])) {
               start -= 1;
          }
          while (end < text.length && !/\s/.test(text[end])) {
               end += 1;
          }
          range.setStart(range.startContainer, start);
          range.setEnd(range.startContainer, Math.max(start, end));
     } else {
          range.selectNodeContents(textElement);
     }

     selection.removeAllRanges();
     selection.addRange(range);
     return true;
}

function startStickerTextEditing(item, options = {}) {
     if (typeof activeAction !== "undefined" && activeAction) {
          return;
     }

     if (!isStickerTextItem(item) || isTocItem(item)) {
          return;
     }

     const textElement = getStickerTextElement(item);

     if (!textElement) {
          return;
     }

     if (textElement.isContentEditable) {
          textElement.focus();
          if (options.selectWordAtPoint) {
               selectStickerTextWordAtPoint(textElement, options.clientX, options.clientY);
          }
          return;
     }

     if (item.dataset.textEnabled !== "true") {
          setStickerTextSettings(item, {
               enabled: "true"
          });
     }

     item.classList.add("is-editing-text");
     textElement.hidden = false;
     textElement.setAttribute("contenteditable", "true");
     textElement.addEventListener("paste", handlePlainTextPaste);
     updateTextEditingState();
     renderKeyHints();

     requestAnimationFrame(() => {
          textElement.focus();

          if (options.selectWordAtPoint && selectStickerTextWordAtPoint(textElement, options.clientX, options.clientY)) {
               return;
          }

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
     if (item.dataset.itemType === "mini-month") {
          return getMiniMonthGridUnits(item);
     }

     if (item.dataset.itemType === "full-month") {
          return getFullMonthGridUnits(item);
     }

     if (item.dataset.itemType === "perpetual-calendar") {
          return itemGridUnits["perpetual-calendar"];
     }

     if (isFullPageCalendarType(item.dataset.itemType)) {
          return {
               width: plannerConfig.gridColumns,
               height: plannerConfig.gridRows
          };
     }

     return itemGridUnits[item.dataset.itemType] || itemGridUnits.sticker;
}

// NOTE: Click Items, Select Items, And Open Item Menus
function clearDragOver() {
     pages.forEach((page) => page.classList.remove("is-drag-over"));
}

function getWidgetPanel(item) {
     return document.querySelector(`.widget-panel[data-owner-id="${item.dataset.templateId}"]`);
}

function getItemTypeLabel(type) {
     return {
          sticker: "Sticker",
          toc: "Table of Contents",
          "mini-month": "Mini Month",
          "full-month": "Full Month",
          "perpetual-calendar": "Perpetual Calendar",
          "weekly-view": "WeeklyView",
          "day-view": "Day View",
          "diary-view": "Diary View"
     }[type] || "Widget";
}

function getItemAriaLabel(type) {
     return `${getItemTypeLabel(type)} widget`;
}

function getActionItemsTypeLabel(items) {
     if (!items.length) {
          return "Widget";
     }

     const type = items[0]?.dataset.itemType || "sticker";

     return items.every((item) => item.dataset.itemType === type) ? getItemTypeLabel(type) : "Multiple";
}

function updateActionsPopupTypeLabel(controls, items) {
     const typeLabel = controls.querySelector("[data-actions-widget-type]");

     if (typeLabel) {
          typeLabel.textContent = getActionItemsTypeLabel(items);
     }
}

function positionWidgetPanel(item) {
     const controls = getWidgetPanel(item);

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

function getFloatingControlsBox(controls) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const rect = controls.getBoundingClientRect();

     return {
          x: rect.left - deskRect.left,
          y: rect.top - deskRect.top,
          width: rect.width,
          height: rect.height
     };
}

function setFloatingControlsBox(controls, box) {
     controls.style.left = `${box.x}px`;
     controls.style.top = `${box.y}px`;
}

function getMovedFloatingControlsBox(clientX, clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const rawX = clientX - deskRect.left - activeAction.offsetX;
     const rawY = clientY - deskRect.top - activeAction.offsetY;
     const gap = 8;

     return {
          ...current,
          x: clamp(rawX, gap, Math.max(gap, deskRect.width - current.width - gap)),
          y: clamp(rawY, gap, Math.max(gap, deskRect.height - current.height - gap))
     };
}

function startFloatingControlsMove(controls, event) {
     if (
          activeAction ||
          event.button !== 0 ||
          !controls.classList.contains("is-floating") ||
          event.target.closest("button, input, select, textarea, [contenteditable='true'], .custom-select")
     ) {
          return;
     }

     const box = getFloatingControlsBox(controls);

     activeAction = {
          type: "pending-controls-move",
          controls,
          box,
          startX: event.clientX,
          startY: event.clientY,
          offsetX: event.clientX - controls.getBoundingClientRect().left,
          offsetY: event.clientY - controls.getBoundingClientRect().top,
          didMove: false
     };

     try {
          controls.setPointerCapture(event.pointerId);
     } catch {
     }
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
     const controls = getWidgetPanel(item);
     const actionItems = getSelectedOrGroupedActionItems(item);

     if (!controls || !objectControlsShell) {
          return;
     }

     if (!itemsShareWidgetType(actionItems)) {
          return;
     }

     closeWidgetActionPopovers();
     closeItemMenu(item);
     closeItemMenus();
     objectControlsShell.append(controls);
     setControlsActionItems(controls, actionItems);
     controls.classList.remove("is-floating", "is-actions-popup");
     controls.classList.add("is-docked");
     setWidgetPanelTab(controls, "style");
     item.classList.add("is-widget-panel-open");
     updateObjectControlsState();
     if (typeof selectControlPanelTab === "function") {
          selectControlPanelTab("object-selected");
          openControlPanel();
     }
     updateClipboardControls();
}

function getReadableTextPartName(partName) {
     return String(partName || "Text")
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

let selectedTextStyleTarget = null;

function getPopupEventElement(event) {
     const target = event?.target || null;

     return target?.nodeType === Node.TEXT_NODE ? target.parentElement : target;
}

function getWidgetTextPopupTarget(item, event) {
     const type = item?.dataset?.itemType || "";
     const eventElement = getPopupEventElement(event);
     const partElement = eventElement?.closest?.("[data-theme-part]");
     const rawPartName = partElement?.dataset?.themePart;
     const partName = getWidgetSharedTextPartName(type, rawPartName);

     if (!item || !partName) {
          return null;
     }

     const partSlots = getWidgetTextPartSlots(type, rawPartName);

     if (!partSlots?.textSlot) {
          return null;
     }

     if (type === "sticker" && partName === "text") {
         return {
               label: "Sticky Text",
               appearsInToc: item.dataset.textAppearsInToc === "true",
               partName,
               scope: "item",
               type: "sticker"
          };
     }

     if (partName === "dayNotes") {
         return {
               label: "Freeform Text",
               appearsInToc: item.dataset.dayTextAppearsInToc === "true",
               partName,
               scope: "item",
               type: "calendar-day"
          };
     }

     return {
          label: getReadableTextPartName(partName),
          appearsInToc: getWidgetTextPartToc(type, partName),
          partName,
          scope: "type",
          type
     };
}

function getSelectedTextTargetFromRange() {
     const selection = window.getSelection();

     if (!selection || selection.isCollapsed || !selection.rangeCount) {
          return null;
     }

     const range = selection.getRangeAt(0);
     const container = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentElement
          : range.commonAncestorContainer;
     const item = container?.closest?.(".planner-item");
     const partElement = container?.closest?.("[data-theme-part]") || range.startContainer.parentElement?.closest?.("[data-theme-part]");

     if (!item || !partElement || !item.contains(partElement)) {
          return null;
     }

     const textTarget = getWidgetTextPopupTarget(item, {
          target: partElement
     });

     return textTarget ? {
          item,
          textTarget
     } : null;
}

let selectedTextRangeFrame = 0;

function syncSelectedTextTargetFromSelection() {
     cancelAnimationFrame(selectedTextRangeFrame);
     selectedTextRangeFrame = requestAnimationFrame(() => {
          const target = getSelectedTextTargetFromRange();

          if (!target) {
               return;
          }

          if (!selectedItems.has(target.item) || selectedItems.size !== 1) {
               selectItem(target.item);
          }

          setSelectedTextStyleTarget(target.item, target.textTarget);
          openItemMenu(target.item);
          const controls = getWidgetPanel(target.item);

          if (controls) {
               setWidgetPanelTab(controls, "text");
          }
     });
}

function setSelectedTextStyleTarget(item, textTarget) {
     selectedTextStyleTarget = item && textTarget ? {
          item,
          ...textTarget
     } : null;
     syncSelectedTextStyleControls(item || selectedItem);
}

function getSelectedTextStyleTarget(item = selectedItem) {
     if (selectedTextStyleTarget?.item && getAllPlannerItems().includes(selectedTextStyleTarget.item)) {
          return selectedTextStyleTarget;
     }

     if (!item) {
          return null;
     }

     return isCalendarTextItem(item)
          ? {
               item,
               label: "Freeform Text",
               appearsInToc: item.dataset.dayTextAppearsInToc === "true",
               partName: "dayNotes",
               scope: "item",
               type: "calendar-day"
          }
          : (isStickerTextItem(item) ? {
               item,
               label: "Sticky Text",
               appearsInToc: item.dataset.textAppearsInToc === "true",
               partName: "text",
               scope: "item",
               type: "sticker"
          } : null);
}

function getTextSettingsForTarget(textTarget) {
     if (!textTarget) {
          return typeof getPlannerDefaultTextSettings === "function" ? getPlannerDefaultTextSettings() : {};
     }

     if (textTarget.scope === "type") {
          const partStyle = typeof getPlannerWidgetTextPartStyle === "function"
               ? getPlannerWidgetTextPartStyle(textTarget.type, textTarget.partName)
               : null;

          return typeof getPlannerDefaultTextSettings === "function" ? getPlannerDefaultTextSettings(partStyle || {}) : (partStyle || {});
     }

     if (textTarget.type === "calendar-day") {
          const item = textTarget.item;

          return {
               size: item.dataset.dayTextSize || "10",
               font: item.dataset.dayTextFont || "annotation-mono",
               color: item.dataset.dayTextColor || "var(--color-gray1)",
               bold: item.dataset.dayTextBold || "false",
               italic: item.dataset.dayTextItalic || "false",
               underline: item.dataset.dayTextUnderline || "false",
               strike: item.dataset.dayTextStrike || "false",
               align: item.dataset.dayTextAlign || "center",
               yAlign: item.dataset.dayTextYAlign || "center",
               lineHeight: item.dataset.dayTextLineHeight || "1"
          };
     }

     const item = textTarget.item;

     return {
          size: item.dataset.textSize || "10",
          font: item.dataset.textFont || "annotation-mono",
          color: item.dataset.textColor || "var(--color-gray1)",
          bold: item.dataset.textBold || "false",
          italic: item.dataset.textItalic || "false",
          underline: item.dataset.textUnderline || "false",
          strike: item.dataset.textStrike || "false",
          align: item.dataset.textAlign || "center",
          yAlign: item.dataset.textYAlign || "center",
          lineHeight: item.dataset.textLineHeight || "1"
     };
}

function syncSelectedTextStyleControls(item = selectedItem) {
     const controls = item ? getWidgetPanel(item) : null;
     const textTarget = getSelectedTextStyleTarget(item);

     if (!controls || !textTarget) {
          return;
     }

     const settings = getTextSettingsForTarget(textTarget);
     const tocInput = controls.querySelector("[data-text-control='appears-in-toc']");
     const fontSelect = controls.querySelector("[data-text-control='font']");
     const colorInput = controls.querySelector("[data-text-control='color']");
     const colorSwatches = controls.querySelector("[data-text-swatches='color']");
     const lineHeightSelect = controls.querySelector("[data-text-control='line-height']");

     updateTextSizeControls(controls, settings.size);
     if (fontSelect) {
          fontSelect.value = settings.font;
     }
     if (colorInput) {
          setPaletteControlValue(colorInput, colorSwatches, settings.color);
     }
     updateTextToggleControl(controls.querySelector("[data-text-control='bold']"), settings.bold === "true");
     updateTextToggleControl(controls.querySelector("[data-text-control='italic']"), settings.italic === "true");
     updateTextToggleControl(controls.querySelector("[data-text-control='underline']"), settings.underline === "true");
     updateTextToggleControl(controls.querySelector("[data-text-control='strike']"), settings.strike === "true");
     updateTextAlignmentControls(controls, settings.align, settings.yAlign);
     if (lineHeightSelect) {
          lineHeightSelect.value = settings.lineHeight;
     }

     if (tocInput) {
          tocInput.checked = textTarget.appearsInToc === true || textTarget.appearsInToc === "true";
     }
     controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
}

function applyTextSettingsToTarget(textTarget, settings) {
     if (!textTarget) {
          return false;
     }

     if (textTarget.scope === "type") {
          setWidgetTextPartStyle(textTarget.type, textTarget.partName, settings);
          getAllPlannerItems()
               .filter((plannerItem) => plannerItem.dataset.itemType === textTarget.type)
               .forEach((plannerItem) => {
                    applyThemeToWidget(plannerItem);
                    if (isCalendarItem(plannerItem)) {
                         applyCalendarPartStyles(plannerItem);
                    }
               });
          notifyTemplateChanged();
          return;
     }

     if (textTarget.type === "sticker") {
          setStickerTextSettings(textTarget.item, {
               ...settings,
               enabled: textTarget.item.dataset.textEnabled ?? "true"
          });
          notifyTemplateChanged();
          return;
     }

     if (textTarget.type === "calendar-day") {
          setCalendarDayTextSettings(textTarget.item, settings);
          notifyTemplateChanged();
     }
}

function applyPopupTextToc(item, textTarget, appearsInToc) {
     if (textTarget.scope === "type") {
          setWidgetTextPartToc(textTarget.type, textTarget.partName, appearsInToc);
          getAllPlannerItems()
               .filter((plannerItem) => plannerItem.dataset.itemType === textTarget.type)
               .forEach((plannerItem) => {
                    applyThemeToWidget(plannerItem);
                    if (isCalendarItem(plannerItem)) {
                         applyCalendarPartStyles(plannerItem);
                    }
               });
          renderTocWidgets();
          notifyTemplateChanged();
          return;
     }

     if (textTarget.type === "sticker") {
          item.dataset.textAppearsInToc = appearsInToc ? "true" : "false";
     } else if (textTarget.type === "calendar-day") {
          item.dataset.dayTextAppearsInToc = appearsInToc ? "true" : "false";
     }
     renderTocWidgets();
     notifyTemplateChanged();
}

function openItemActionsPopup(item, event, actionItems = getSelectedOrGroupedActionItems(item)) {
     const controls = getWidgetPanel(item);

     if (!controls) {
          return;
     }

     setControlsActionItems(controls, actionItems);
     closeWidgetActionPopovers();
     const popup = document.createElement("div");
     const popupTitle = document.createElement("div");
     const widgetType = document.createElement("div");
     const textGroup = document.createElement("div");
     const layoutGroup = document.createElement("div");
     const duplicateGroup = document.createElement("div");
     const layerGroup = document.createElement("div");
     const textTarget = getWidgetTextPopupTarget(item, event);
     if (textTarget) {
          setSelectedTextStyleTarget(item, textTarget);
     }
     const makeButton = (label, action, className = "") => {
          const button = document.createElement("button");
          const runAction = (buttonEvent) => {
               buttonEvent.preventDefault();
               buttonEvent.stopPropagation();
               if (button.dataset.actionHandled === "true") {
                    return;
               }

               button.dataset.actionHandled = "true";
               action(button);
               requestAnimationFrame(() => {
                    delete button.dataset.actionHandled;
               });
          };

          button.className = `widget-panel-button${className ? ` ${className}` : ""}`;
          button.type = "button";
          button.textContent = label;
          button.addEventListener("pointerdown", runAction);
          button.addEventListener("mousedown", runAction);
          button.addEventListener("pointerup", runAction);
          button.addEventListener("click", runAction);
          return button;
     };
     const closeAfter = (action) => (button) => {
          action(button);
          closeWidgetActionPopovers();
     };

     popup.className = "widget-action-popover widget-panel is-floating is-actions-popup";
     popup.dataset.ownerId = item.dataset.templateId;
     popup.setAttribute("role", "menu");
     popupTitle.className = "item-actions-menu-title title";
     popupTitle.textContent = "Popup Menu";
     widgetType.className = "item-actions-widget-type subtitle";
     widgetType.textContent = getActionItemsTypeLabel(actionItems);
     textGroup.className = "item-text-role-action-group";
     layoutGroup.className = "item-action-row item-layout-action-group";
     duplicateGroup.className = "item-action-row";
     layerGroup.className = "item-layer-actions";

     const moveButton = makeButton("Move", closeAfter(() => {
          if (typeof startKeyboardMoveFromPopup === "function") {
               startKeyboardMoveFromPopup(item);
          }
     }));
     const resizeButton = makeButton("Resize", closeAfter(() => {
          if (typeof startKeyboardResizeFromPopup === "function") {
               startKeyboardResizeFromPopup(item);
          }
     }));
     const duplicateButton = makeButton("Duplicate", closeAfter(() => duplicateItem(item)));
     const groupButton = makeButton(itemsHaveGroup(actionItems) ? "Ungroup" : "Group", closeAfter(() => {
          const nextItems = getActionItems(item);

          if (itemsHaveGroup(nextItems)) {
               ungroupItems(nextItems);
          } else {
               groupItems(nextItems, item);
          }
     }), itemsHaveGroup(actionItems) ? "is-grouped" : "");
     const sendBackwardButton = makeButton("Send Bwd", closeAfter(() => moveActionItemsLayer(item, "backward")));
     const bringForwardButton = makeButton("Bring Fwd", closeAfter(() => moveActionItemsLayer(item, "forward")));
     const deleteButton = makeButton("Delete", closeAfter(() => deleteItem(item)), "widget-panel-danger");

     if (textTarget) {
          textGroup.append(makeButton("Appears in ToC", closeAfter(() => applyPopupTextToc(item, textTarget, !textTarget.appearsInToc)), textTarget.appearsInToc ? "is-active" : ""));
     }
     layoutGroup.append(moveButton, resizeButton);
     duplicateGroup.append(duplicateButton, groupButton);
     layerGroup.append(sendBackwardButton, bringForwardButton);
     popup.append(popupTitle, widgetType);
     if (textTarget) {
          popup.append(textGroup);
     }
     popup.append(layoutGroup, layerGroup, duplicateGroup, deleteButton);
     plannerDesk.append(popup);
     positionItemActionsPopup(popup, event);
     updateObjectControlsState();
     updateClipboardControls();
}

function closeWidgetActionPopovers() {
     document.querySelectorAll(".widget-action-popover").forEach((popup) => popup.remove());
}

function closeItemMenu(item) {
     const controls = getWidgetPanel(item);

     item.classList.remove("is-widget-panel-open");
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
     clearCalendarStyleTarget(item);
     item.classList.remove("is-selected", "is-resizing", "is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");
}

function isWidgetContentTarget(target) {
     return Boolean(target?.closest?.("button, input, select, textarea, [contenteditable='true'], .custom-select, [data-theme-part], .calendar-day-text, .dayCell, .toc-row, .sticker-text"));
}

function hasActiveWidgetTextSelection() {
     const selection = window.getSelection?.();

     return Boolean(selection && !selection.isCollapsed && String(selection).trim());
}

function setItemSelected(item, isSelected) {
     item.classList.toggle("is-selected", isSelected);
     item.setAttribute("aria-selected", String(isSelected));

     if (isSelected) {
          selectedItems.add(item);
          selectedItem = item;
          if (document.activeElement !== item) {
               item.focus({
                    preventScroll: true
               });
          }
          renderKeyHints();
          return;
     }

     selectedItems.delete(item);
     clearItemSelectionClasses(item);

     if (selectedItem === item) {
          selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     }
     renderKeyHints();
}

function selectItems(items) {
     clearSelection();
     items.forEach((item) => setItemSelected(item, true));
}

function selectItem(item, shouldAdd = false) {
     if (shouldAdd) {
          setItemSelected(item, !selectedItems.has(item));
          if (selectedItem && selectedItems.has(selectedItem)) {
               openItemMenu(selectedItem);
          }
          return;
     }

     if (item.dataset.groupId) {
          selectItems(getPlannerItems().filter((plannerItem) => plannerItem.dataset.groupId === item.dataset.groupId));
          selectedItem = item;
          openItemMenu(item);
          return;
     }

     selectItems([item]);
     openItemMenu(item);
}

function clearSelection() {
     closeWidgetActionPopovers();
     selectedItems.forEach((item) => clearItemSelectionClasses(item));
     selectedItems = new Set();
     selectedItem = null;
     renderKeyHints();
}

function closeItemMenus(exceptItem = null) {
     document.querySelectorAll(".planner-item.is-widget-panel-open").forEach((item) => {
          if (item !== exceptItem) {
               closeItemMenu(item);
          }
     });
}

function closeFloatingWidgetPanelsFromOutsidePointer(event) {
     // NOTE: Dismisses right-click widget popups when the pointer starts outside the popup
     if (event.target.closest(".widget-panel, .widget-action-popover")) {
          return;
     }

     closeWidgetActionPopovers();
     document.querySelectorAll(".planner-item.is-widget-panel-open").forEach((item) => {
          const controls = getWidgetPanel(item);

          if (controls?.classList.contains("is-floating")) {
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

function itemsHaveGroup(items) {
     return items.some((item) => item.dataset.groupId);
}

function updateGroupButton(button, items = Array.from(selectedItems)) {
     if (!button) {
          return;
     }

     const isGrouped = itemsHaveGroup(items);

     button.classList.toggle("is-grouped", isGrouped);
     button.textContent = isGrouped ? "Ungroup" : "Group";
     button.setAttribute("aria-label", isGrouped ? "Ungroup selected stickers" : "Group selected stickers");
}

// NOTE: Bring Forward, Send Back, Group, And Shared Actions
function getActionItems(item) {
     const controlsActionItems = getControlsActionItems(getWidgetPanel(item));

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
     if (applyStyleToCalendarStyleTarget(item, style)) {
          notifyTemplateChanged();
          return;
     }

     getActionItems(item).forEach((targetItem) => {
          targetItem.dataset.themeMode = "custom";
          setItemStyle(targetItem, {
               fillColor: style.fillColor ?? targetItem.dataset.fillColor,
               borderColor: style.borderColor ?? targetItem.dataset.borderColor,
               borderWidth: style.borderWidth ?? targetItem.dataset.borderWidth,
               dotGrid: style.dotGrid ?? targetItem.dataset.dotGrid,
               titleBarVisible: style.titleBarVisible ?? targetItem.dataset.titleBarVisible
          });
     });
     notifyTemplateChanged();
}

function applyTextSettingsToActionItems(item, settings) {
     const textTarget = getSelectedTextStyleTarget(item);

     if (textTarget) {
          applyTextSettingsToTarget(textTarget, settings);
          syncSelectedTextStyleControls(textTarget.item);
          return;
     }

     notifyTemplateChanged();
}

function applyCalendarWidgetSettingsToActionItems(item, settings) {
     getActionItems(item).forEach((targetItem) => {
          if (isCalendarItem(targetItem)) {
               setCalendarWidgetSettings(targetItem, settings);
          }
     });
     notifyTemplateChanged();
}

function setWidgetPanelTab(controls, tabName) {
     closeCustomSelects(controls);
     clearSelectFocus(controls);
     controls.dataset.activeWidgetPanelTab = tabName;
     controls.querySelector(".widget-panel-tabs")?.removeAttribute("hidden");

     controls.querySelectorAll("[data-widget-panel-tab]").forEach((tab) => {
          const isActive = tab.dataset.widgetPanelTab === tabName;

          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
     });
     controls.querySelectorAll("[data-widget-panel-page]").forEach((panel) => {
          panel.hidden = panel.dataset.widgetPanelPage !== tabName;
     });
}

function handleWidgetPanelButtonKey(event) {
     if (
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          (event.key !== "Enter" && event.key.toLowerCase() !== "e")
     ) {
          return;
     }

     const button = event.target.closest(".widget-panel-button");

     if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") {
          return;
     }

     event.preventDefault();
     event.stopPropagation();
     button.click();
}

function getCalendarPartStyles(item) {
     return {};
}

function setCalendarPartStyles(item, styles) {
     delete item.dataset.calendarPartStyles;
}

function getCalendarStyleTarget(item) {
     try {
          const target = JSON.parse(item.dataset.calendarStyleTarget || "null");

          return target && target.type && target.key ? target : null;
     } catch {
          return null;
     }
}

function setCalendarStyleTarget(item, target) {
     if (!item || !target?.type || !target?.key) {
          return;
     }

     item.dataset.calendarStyleTarget = JSON.stringify(target);
     syncCalendarStyleTarget(item);
}

function clearCalendarStyleTarget(item) {
     if (!item) {
          return;
     }

     delete item.dataset.calendarStyleTarget;
     syncCalendarStyleTarget(item);
}

function syncCalendarStyleTarget(item) {
     const target = getCalendarStyleTarget(item);

     item.querySelectorAll(".is-calendar-style-target").forEach((element) => {
          element.classList.remove("is-calendar-style-target");
     });
     item.classList.toggle("is-calendar-border-target", target?.type === "border");
     if (target?.type !== "cell") {
          return;
     }

     const escapedKey = typeof CSS !== "undefined" && typeof CSS.escape === "function"
          ? CSS.escape(target.key)
          : String(target.key).replaceAll('"', '\\"');

     item.querySelectorAll(`[data-calendar-style-key="${escapedKey}"]`).forEach((element) => {
          element.classList.add("is-calendar-style-target");
     });
}

function getSelectedCalendarStyleItem(item) {
     if (!item || !isCalendarItem(item)) {
          return null;
     }

     return getCalendarStyleTarget(item) ? item : null;
}

function getCalendarStyleScopeItems(item) {
     const target = getCalendarStyleTarget(item);

     if (!target) {
          return [];
     }

     return [item];
}

function applyCalendarPartStyles(item) {
     const styles = getCalendarPartStyles(item);

     item.querySelectorAll("[data-calendar-style-key]").forEach((cell) => {
          const style = styles[cell.dataset.calendarStyleKey] || {};
          const hasCustomStyle = Object.keys(style).length > 0;

          if (hasCustomStyle) {
               cell.dataset.themeMode = "custom";
          } else {
               delete cell.dataset.themeMode;
          }
          cell.style.background = style.fillColor || "";
          if (style.textColor) {
               cell.style.color = style.textColor;
          }
          if (style.textFont) {
               cell.style.fontFamily = getStickerTextFont(style.textFont);
          }
          if (style.textBold !== undefined) {
               cell.style.fontWeight = style.textBold === "true" ? "700" : "400";
          }
          if (style.textItalic !== undefined) {
               cell.style.fontStyle = style.textItalic === "true" ? "italic" : "normal";
          }
          if (style.textUnderline !== undefined || style.textStrike !== undefined) {
               cell.style.textDecoration = getTextDecorationValue(style.textUnderline, style.textStrike);
          }
          cell.style.borderRightColor = style.borderColor || "";
          cell.style.borderBottomColor = style.borderColor || "";
          cell.style.borderRightWidth = style.borderWidth ? `${style.borderWidth}px` : "";
          cell.style.borderBottomWidth = style.borderWidth ? `${style.borderWidth}px` : "";
     });
     syncCalendarStyleTarget(item);
}

function applyStyleToCalendarStyleTarget(item, style) {
     const target = getCalendarStyleTarget(item);

     if (!target) {
          return false;
     }

     if (target.type === "border") {
          getCalendarStyleScopeItems(item).forEach((targetItem) => {
               targetItem.dataset.themeMode = "custom";
               setItemStyle(targetItem, {
                    borderColor: style.borderColor,
                    borderWidth: style.borderWidth
               });
          });
          return true;
     }

     if (target.type !== "cell") {
          return false;
     }

     getCalendarStyleScopeItems(item).forEach((targetItem) => {
          const styles = getCalendarPartStyles(targetItem);
          const nextStyle = {
               ...(styles[target.key] || {})
          };

          if (style.fillColor !== undefined) {
               nextStyle.fillColor = style.fillColor;
          }
          if (style.borderColor !== undefined) {
               nextStyle.borderColor = style.borderColor;
          }
          if (style.borderWidth !== undefined) {
               nextStyle.borderWidth = style.borderWidth;
          }
          styles[target.key] = nextStyle;
          setCalendarPartStyles(targetItem, styles);
          applyCalendarPartStyles(targetItem);
     });
     return true;
}

function applyTextSettingsToCalendarStyleTarget(item, settings) {
     const target = getCalendarStyleTarget(item);

     if (!target || target.type !== "cell") {
          return false;
     }

     getCalendarStyleScopeItems(item).forEach((targetItem) => {
          const styles = getCalendarPartStyles(targetItem);
          const nextStyle = {
               ...(styles[target.key] || {})
          };

          if (settings.color !== undefined) {
               nextStyle.textColor = settings.color;
          }
          if (settings.font !== undefined) {
               nextStyle.textFont = settings.font;
          }
          if (settings.bold !== undefined) {
               nextStyle.textBold = settings.bold;
          }
          if (settings.italic !== undefined) {
               nextStyle.textItalic = settings.italic;
          }
          if (settings.underline !== undefined) {
               nextStyle.textUnderline = settings.underline;
          }
          if (settings.strike !== undefined) {
               nextStyle.textStrike = settings.strike;
          }
          styles[target.key] = nextStyle;
          setCalendarPartStyles(targetItem, styles);
          applyCalendarPartStyles(targetItem);
     });
     return true;
}

function selectCalendarCellStyleTarget(item, cell, event) {
     if (!cell?.dataset.calendarStyleKey) {
          return;
     }

     event.stopPropagation();
     selectItem(item);
}

function isCalendarBorderStylePointer(item, event) {
     const calendar = item.querySelector(".mini-month");

     if (!calendar) {
          return false;
     }

     const rect = calendar.getBoundingClientRect();
     const edgeSize = Math.max(8, Number(item.dataset.borderWidth || 1) + 6);
     const isInside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;

     if (!isInside) {
          return false;
     }

     return (
          event.clientX - rect.left <= edgeSize ||
          rect.right - event.clientX <= edgeSize ||
          event.clientY - rect.top <= edgeSize ||
          rect.bottom - event.clientY <= edgeSize
     );
}

function selectCalendarBorderStyleTarget(item, event) {
     event.stopPropagation();
     selectItem(item);
     setCalendarStyleTarget(item, {
          type: "border",
          key: "widget-border"
     });
}

// NOTE: Drag Items, Resize Items, And Move The Control Panel
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

     if (item.dataset.itemType === "mini-month" || item.dataset.itemType === "full-month") {
          return "";
     }

     if (selectedItems.size !== 1) {
          return "";
     }

     if (item.dataset.groupId) {
          return "";
     }

     if (item.dataset.itemType === "perpetual-calendar" && event.target.closest(".perpetual-calendar-title")) {
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

function getResizedPerpetualCalendarBox(item, page, clientX, current, mode, grid, origin, pageRect, viewZoom) {
     const resizeLeft = mode.includes("left");
     const resizeRight = mode.includes("right");
     const minWidth = grid.x * getPerpetualCalendarMinGridColumns();
     const fixedHeight = grid.y * getPerpetualCalendarMaxGridRows();
     const right = current.x + current.width;
     const pointerX = snapToGridOrigin((clientX - pageRect.left) / viewZoom, origin.x, grid.x);
     let nextX = current.x;
     let nextWidth = current.width;

     if (resizeLeft) {
          nextX = clamp(pointerX, grid.x * pageStickDepth - current.width, right - minWidth);
          nextWidth = right - nextX;
     } else if (resizeRight) {
          const nextRight = clamp(pointerX, current.x + minWidth, (pageRect.width / viewZoom) - grid.x * pageStickDepth + current.width);

          nextWidth = nextRight - current.x;
     }

     nextWidth = Math.max(minWidth, Math.round(nextWidth / grid.x) * grid.x);

     return clampPerpetualCalendarBox(item, page, {
          ...current,
          x: resizeLeft ? right - nextWidth : nextX,
          width: nextWidth,
          height: fixedHeight
     });
}

function getItemMinGridHeight(item) {
     if (item.dataset.itemType === "perpetual-calendar") {
          return getPerpetualCalendarMaxGridRows();
     }

     if (item.dataset.itemType === "diary-view") {
          return getDiaryViewMinGridRows(item);
     }

     if (isFullPageCalendarType(item.dataset.itemType)) {
          return 14;
     }

     return 2;
}

function getResizedBox(item, page, clientX, clientY, mode) {
     const current = getItemBox(item);

     if (item.dataset.itemType === "mini-month" || item.dataset.itemType === "full-month") {
          return current;
     }

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
     if (item.dataset.itemType === "perpetual-calendar") {
          return getResizedPerpetualCalendarBox(item, page, clientX, current, mode, grid, origin, pageRect, viewZoom);
     }

     const minGridWidth = isTocItem(item) ? getTocMinGridColumns() : (item.dataset.itemType === "perpetual-calendar" ? getPerpetualCalendarMinGridColumns() : (item.dataset.itemType === "diary-view" ? getDiaryViewMinGridColumns() : (isTimeGridCalendarType(item.dataset.itemType) ? getWeeklyVerticalMinGridColumns(item) : (isFullPageCalendarType(item.dataset.itemType) ? 16 : 2))));
     const minGridHeight = getItemMinGridHeight(item);
     const minWidth = grid.x * minGridWidth;
     const minHeight = grid.y * minGridHeight;
     const maxHeight = item.dataset.itemType === "perpetual-calendar"
          ? grid.y * getPerpetualCalendarMaxGridRows()
          : (item.dataset.itemType === "diary-view" ? grid.y * getDiaryViewMaxGridRows() : Infinity);
     const right = current.x + current.width;
     const bottom = current.y + current.height;
     const pointerX = snapToGridOrigin((clientX - pageRect.left) / viewZoom, origin.x, grid.x);
     const pointerY = snapToGridOrigin((clientY - pageRect.top) / viewZoom, origin.y, grid.y);
     const nextLeft = resizeLeft ? clamp(pointerX, grid.x * pageStickDepth - current.width, right - minWidth) : current.x;
     const nextTop = resizeTop ? clamp(pointerY, Math.max(grid.y * pageStickDepth - current.height, bottom - maxHeight), bottom - minHeight) : current.y;
     const nextRight = resizeRight ? clamp(pointerX, current.x + minWidth, (pageRect.width / viewZoom) - grid.x * pageStickDepth + current.width) : right;
     const nextBottom = resizeBottom ? clamp(pointerY, current.y + minHeight, Math.min((pageRect.height / viewZoom) - grid.y * pageStickDepth + current.height, current.y + maxHeight)) : bottom;

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

function clearSelectedResizeCursors() {
     selectedItems.forEach((item) => setResizeCursor(item, ""));
}

function updateDeskResizeCursor(event) {
     if (activeAction || !selectedItem || selectedItems.size !== 1 || event.target.closest(".control-panel, .widget-panel, .page-snap-controls")) {
          plannerDesk.style.cursor = "";
          clearSelectedResizeCursors();
          return;
     }

     const resizeMode = getResizeMode(selectedItem, event);

     setResizeCursor(selectedItem, resizeMode);
     plannerDesk.style.cursor = getResizeCursorValue(resizeMode);
}

function getControlPanelBox() {
     const deskRect = plannerDesk.getBoundingClientRect();
     const rect = controlPanel.getBoundingClientRect();
     const width = rect.width;
     const height = Number(controlPanel.dataset.height) || rect.height;
     const x = rect.left - deskRect.left;
     const y = rect.top - deskRect.top;

     return {
          x,
          y,
          width,
          height
     };
}

function setControlPanelBox(box) {
     controlPanel.dataset.height = String(box.height);
     controlPanel.dataset.userPositioned = "true";
     controlPanel.style.left = `${box.x}px`;
     controlPanel.style.top = `${box.y}px`;
     controlPanel.style.height = `${box.height}px`;
}

function getMovedControlPanelBox(clientX, clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const rawX = clientX - deskRect.left - activeAction.offsetX;
     const minX = 12;
     const maxX = deskRect.width - current.width - 12;
     const x = clamp(rawX, minX, maxX);

     return {
          ...current,
          x,
          y: clamp(clientY - deskRect.top - activeAction.offsetY, 8, Math.max(8, deskRect.height - current.height - 8))
     };
}

function startControlPanelMove(event) {
     if (
          controlPanel.closest("[data-planner-sidebar]") ||
          activeAction ||
          event.button !== 0 ||
          event.target.closest("button, input, select, textarea, [contenteditable='true'], .custom-select")
     ) {
          return;
     }

     const box = getControlPanelBox();

     event.preventDefault();
     activeAction = {
          type: "control-panel-move",
          box,
          offsetX: event.clientX - controlPanel.getBoundingClientRect().left,
          offsetY: event.clientY - controlPanel.getBoundingClientRect().top,
          hasMoved: false
     };
     controlPanel.classList.add("is-dragging");
     try {
          controlPanel.setPointerCapture(event.pointerId);
     } catch {
     }
     document.addEventListener("pointermove", moveActiveItem, true);
     document.addEventListener("pointerup", endActiveItem, true);
     document.addEventListener("pointercancel", endActiveItem, true);
}

function getControlPanelVerticalResizeMode(event) {
     // NOTE: Main menu is a floating panel now, so it no longer has a drawer resize edge
     return "";
}

function getControlPanelHeightBounds() {
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

function getResizedControlPanelBox(clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const bounds = getControlPanelHeightBounds();
     const bottom = deskRect.height;
     const pointerY = snap(clientY - deskRect.top, bounds.grid);

     const nextTop = clamp(pointerY, bottom - bounds.max, bottom - bounds.min);

     return {
          ...current,
          y: nextTop,
          height: bottom - nextTop
     };
}

function startControlPanelResize(event, mode) {
     const box = getControlPanelBox();

     event.preventDefault();
     setControlPanelBox(box);
     activeAction = {
          type: "control-panel-resize",
          box,
          mode
     };
     controlPanel.classList.add("is-resizing");

     try {
          controlPanel.setPointerCapture(event.pointerId);
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

// NOTE: Build New Items And Their Option Controls
function makePlannerItem(type = "sticker") {
     const hasWidgetControls = type === "sticker" || isCalendarItemType(type) || isTocItemType(type);
     const item = document.createElement("div");
     const sizeLabel = document.createElement("span");
     const controls = document.createElement("div");
     const widgetPanelTitle = document.createElement("div");
     const controlTabs = document.createElement("div");
     const stylePanelTitle = document.createElement("div");
     const textPanelTitle = document.createElement("div");
     const widgetPanelSectionTitle = document.createElement("div");
     const actionsTab = document.createElement("button");
     const styleTab = document.createElement("button");
     const textTab = document.createElement("button");
     const widgetTab = document.createElement("button");
     const actionsPanel = document.createElement("div");
     const actionsWidgetType = document.createElement("div");
     const displayDateRow = document.createElement("div");
     const displayYearLabel = document.createElement("label");
     const displayYearSelect = document.createElement("select");
     const displayMonthLabel = document.createElement("label");
     const displayMonthSelect = document.createElement("select");
     const displayDateModeLabel = document.createElement("label");
     const displayDateModeSelect = document.createElement("select");
     const displayDayLabel = document.createElement("label");
     const displayDaySelect = document.createElement("select");
     const displayWeekNumberLabel = document.createElement("label");
     const displayWeekNumberSelect = document.createElement("select");
     const displayTitleVisibleLabel = document.createElement("label");
     const displayTitleVisibleSelect = document.createElement("select");
     const displayWeekStartLabel = document.createElement("label");
     const displayWeekStartSelect = document.createElement("select");
     const layoutMoveButton = document.createElement("button");
     const layoutResizeButton = document.createElement("button");
     const layoutActionGroup = document.createElement("div");
     const layoutActionTitle = document.createElement("div");
     const layoutTransformActions = document.createElement("div");
     const stylePanel = document.createElement("div");
     const textPanel = document.createElement("div");
     const widgetPanel = document.createElement("div");
     const dateWidgetGroup = document.createElement("div");
     const dateWidgetTitle = document.createElement("div");
     const calendarAttributesGrid = document.createElement("div");
     const timeWidgetGroup = document.createElement("div");
     const timeWidgetTitle = document.createElement("div");
     const duplicateButton = document.createElement("button");
     const duplicateGroupActions = document.createElement("div");
     const groupButton = document.createElement("button");
     const layerButtonGroup = document.createElement("div");
     const bringForwardButton = document.createElement("button");
     const sendBackwardButton = document.createElement("button");
     const fillLabel = document.createElement("label");
     const fillTitle = document.createElement("span");
     const fillInput = document.createElement("select");
     const fillSwatches = document.createElement("div");
     const dotGridLabel = document.createElement("label");
     const dotGridInput = document.createElement("input");
     const textElement = document.createElement("div");
     const tocElement = document.createElement("div");
     const textControlsRow = document.createElement("div");
     const textToggleLabel = document.createElement("label");
     const textTitle = document.createElement("span");
     const textSizeLabel = document.createElement("div");
     const textSizeTitle = document.createElement("span");
     const textSizeGroup = document.createElement("div");
     const textFontSelect = document.createElement("select");
     const textColorLabel = document.createElement("label");
     const textColorTitle = document.createElement("span");
     const textColorInput = document.createElement("select");
     const textColorSwatches = document.createElement("div");
     const textTocLabel = document.createElement("label");
     const textTocInput = document.createElement("input");
     const textFormatGroup = document.createElement("div");
     const textFormatTitle = document.createElement("span");
     const textBoldInput = document.createElement("button");
     const textItalicInput = document.createElement("button");
     const textUnderlineInput = document.createElement("button");
     const textStrikeInput = document.createElement("button");
     const textAlignLabel = document.createElement("label");
     const textAlignTitle = document.createElement("span");
     const textAlignmentGrid = document.createElement("div");
     const textAlignSelect = document.createElement("select");
     const textYAlignSelect = document.createElement("select");
     const textLineHeightLabel = document.createElement("label");
     const textLineHeightSelect = document.createElement("select");
     const weekNumberLabel = document.createElement("label");
     const weekNumberInput = document.createElement("input");
     const weekStartLabel = document.createElement("label");
     const weekStartSelect = document.createElement("select");
     const weekdayLabelLabel = document.createElement("label");
     const weekdayLabelSelect = document.createElement("select");
     const dateModeLabel = document.createElement("label");
     const dateModeSelect = document.createElement("select");
     const dateOffsetLabel = document.createElement("label");
     const dateOffsetSelect = document.createElement("select");
     const titleVisibleLabel = document.createElement("label");
     const titleVisibleInput = document.createElement("input");
     const titleBarLabel = document.createElement("label");
     const titleBarInput = document.createElement("input");
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
     const visibleDaysLabel = document.createElement("div");
     const visibleDaysSelect = document.createElement("select");
     const timeIncrementLabel = document.createElement("div");
     const timeIncrementSelect = document.createElement("select");
     const startTimeLabel = document.createElement("div");
     const startTimeSelect = document.createElement("select");
     const timeVisibleLabel = document.createElement("div");
     const timeVisibleInput = document.createElement("input");
     const timeFormatLabel = document.createElement("div");
     const timeFormatSelect = document.createElement("select");
     const shareWeekendsLabel = document.createElement("label");
     const shareWeekendsInput = document.createElement("input");
     const weekNotesLabel = document.createElement("label");
     const weekNotesSelect = document.createElement("select");
     const deleteButton = document.createElement("button");

     item.className = `planner-item planner-item-${type}`;
     item.dataset.itemType = type;
     item.dataset.templateId = `${type}-${nextTemplateItemId}`;
     nextTemplateItemId += 1;
     item.tabIndex = 0;
     item.setAttribute("role", "button");
     item.setAttribute("aria-label", getItemAriaLabel(type));

     sizeLabel.className = "item-size-label";
     sizeLabel.setAttribute("aria-hidden", "true");
     controls.className = `widget-panel widget-panel-${type}`;
     controls.dataset.ownerId = item.dataset.templateId;
     controls.setAttribute("role", "menu");
     widgetPanelTitle.className = "panel-title title widget-panel-name";
     widgetPanelTitle.textContent = "Selection";
     controlTabs.className = "widget-panel-tabs";
     controlTabs.setAttribute("role", "tablist");
     actionsTab.className = "widget-panel-tab";
     actionsTab.type = "button";
     actionsTab.textContent = "Actions";
     actionsTab.dataset.widgetPanelTab = "actions";
     actionsTab.setAttribute("role", "tab");
     styleTab.className = "widget-panel-tab";
     styleTab.type = "button";
     styleTab.textContent = "Appearance";
     styleTab.dataset.widgetPanelTab = "style";
     styleTab.setAttribute("role", "tab");
     textTab.className = "widget-panel-tab";
     textTab.type = "button";
     textTab.textContent = "Text";
     textTab.dataset.widgetPanelTab = "text";
     textTab.setAttribute("role", "tab");
     widgetTab.className = "widget-panel-tab";
     widgetTab.type = "button";
     widgetTab.textContent = "Options";
     widgetTab.dataset.widgetPanelTab = "widget";
     widgetTab.setAttribute("role", "tab");
     actionsPanel.className = "widget-panel-page";
     actionsPanel.dataset.widgetPanelPage = "actions";
     actionsPanel.setAttribute("role", "tabpanel");
     actionsWidgetType.className = "item-actions-widget-type subtitle";
     actionsWidgetType.dataset.actionsWidgetType = "true";
     actionsWidgetType.textContent = getItemTypeLabel(type);
     layoutMoveButton.className = "widget-panel-button";
     layoutMoveButton.type = "button";
     layoutMoveButton.textContent = "Move";
     layoutMoveButton.dataset.sidebarControl = "actions.move";
     layoutMoveButton.setAttribute("aria-label", "Move this widget with keys");
     layoutResizeButton.className = "widget-panel-button";
     layoutResizeButton.type = "button";
     layoutResizeButton.textContent = "Resize";
     layoutResizeButton.dataset.sidebarControl = "actions.resize";
     layoutResizeButton.setAttribute("aria-label", "Resize this widget with keys");
     layoutActionGroup.className = "item-layout-action-group";
     layoutActionGroup.setAttribute("aria-label", "Layout actions");
     layoutActionTitle.className = "item-actions-section-title section-title";
     layoutActionTitle.textContent = "Layout";
     layoutTransformActions.className = "item-action-row";
     displayDateRow.className = "item-calendar-display-row";
     displayYearLabel.className = "item-calendar-display-control";
     displayYearLabel.dataset.sidebarControl = "options.display-year";
     displayYearLabel.textContent = "Year";
     displayYearSelect.dataset.widgetControl = "display-year";
     displayYearSelect.setAttribute("aria-label", "Display year");
     for (let year = calendarYearRange.start; year <= calendarYearRange.end; year += 1) {
          const option = document.createElement("option");

          option.value = String(year);
          option.textContent = String(year);
          displayYearSelect.append(option);
     }
     displayMonthLabel.className = "item-calendar-display-control";
     displayMonthLabel.dataset.sidebarControl = "options.display-month";
     displayMonthLabel.textContent = "Month";
     displayMonthSelect.dataset.widgetControl = "display-month";
     displayMonthSelect.setAttribute("aria-label", "Display month");
     calendarMonthNames.forEach((monthName, index) => {
          const option = document.createElement("option");

          option.value = String(index);
          option.textContent = monthName;
          displayMonthSelect.append(option);
     });
     displayDateModeLabel.className = "item-calendar-display-control";
     displayDateModeLabel.dataset.sidebarControl = "options.display-date-mode";
     displayDateModeLabel.textContent = "Date Type";
     displayDateModeSelect.dataset.widgetControl = "display-date-mode";
     displayDateModeSelect.setAttribute("aria-label", "Display date mode");
     [
          ["fixed", "Actual"],
          ["relative", "Current"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          displayDateModeSelect.append(option);
     });
     displayDayLabel.className = "item-calendar-display-control";
     displayDayLabel.dataset.sidebarControl = "options.display-day";
     displayDayLabel.textContent = type === "diary-view" ? "Week #" : "Day";
     displayDaySelect.dataset.widgetControl = "display-day";
     displayDaySelect.setAttribute("aria-label", type === "diary-view" ? "Display week number" : "Display start day");
     syncStartDayOptions(displayDaySelect, new Date().getFullYear(), new Date().getMonth(), "1");
     displayWeekNumberLabel.className = "item-calendar-display-control";
     displayWeekNumberLabel.dataset.sidebarControl = "options.display-week-number";
     displayWeekNumberLabel.textContent = "Week #";
     displayWeekNumberSelect.dataset.widgetControl = "display-week-number";
     displayWeekNumberSelect.setAttribute("aria-label", "Display week numbers");
     [
          ["off", "Off"],
          ["on", "On"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          displayWeekNumberSelect.append(option);
     });
     displayTitleVisibleLabel.className = "item-calendar-display-control";
     displayTitleVisibleLabel.dataset.sidebarControl = "options.display-title-visible";
     displayTitleVisibleLabel.textContent = "Month/Year";
     displayTitleVisibleSelect.dataset.widgetControl = "display-title-visible";
     displayTitleVisibleSelect.setAttribute("aria-label", "Display month and year row");
     [
          ["true", "On"],
          ["false", "Off"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          displayTitleVisibleSelect.append(option);
     });
     displayWeekStartLabel.className = "item-calendar-display-control";
     displayWeekStartLabel.dataset.sidebarControl = "options.display-week-start";
     displayWeekStartLabel.textContent = "Week Start";
     displayWeekStartSelect.dataset.widgetControl = "display-week-start";
     displayWeekStartSelect.setAttribute("aria-label", "Display week start");
     [
          ["monday", "Mon"],
          ["sunday", "Sun"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          displayWeekStartSelect.append(option);
     });
     stylePanel.className = "widget-panel-page";
     stylePanel.dataset.widgetPanelPage = "style";
     stylePanel.setAttribute("role", "tabpanel");
     stylePanelTitle.className = "widget-panel-section-title section-title";
     stylePanelTitle.textContent = "Appearance";
     textPanel.className = "widget-panel-page text-panel";
     textPanel.dataset.textPanel = "true";
     textPanel.dataset.widgetPanelPage = "text";
     textPanel.setAttribute("role", "tabpanel");
     textPanelTitle.className = "widget-panel-section-title section-title";
     textPanelTitle.textContent = "Text";
     widgetPanel.className = "widget-panel-page widget-options-panel";
     widgetPanel.dataset.widgetPanelPage = "widget";
     widgetPanel.setAttribute("role", "tabpanel");
     widgetPanelSectionTitle.className = "widget-panel-section-title section-title";
     widgetPanelSectionTitle.textContent = "Options";
     dateWidgetGroup.className = "widget-option-group widget-option-date-group";
     dateWidgetTitle.className = "widget-option-group-title";
     dateWidgetTitle.textContent = "Day";
     calendarAttributesGrid.className = "item-calendar-attributes-grid";
     timeWidgetGroup.className = "widget-option-group widget-option-time-group";
     timeWidgetTitle.className = "widget-option-group-title";
     timeWidgetTitle.textContent = "Time";
     duplicateButton.className = "widget-panel-button";
     duplicateButton.type = "button";
     duplicateButton.textContent = "Duplicate";
     duplicateButton.dataset.sidebarControl = "actions.duplicate";
     duplicateButton.setAttribute("aria-label", "Duplicate sticker");
     duplicateGroupActions.className = "item-action-row";
     groupButton.className = "widget-panel-button";
     groupButton.type = "button";
     groupButton.textContent = "Group";
     groupButton.dataset.widgetAction = "group";
     groupButton.dataset.sidebarControl = "actions.group";
     groupButton.setAttribute("aria-label", "Group selected stickers");
     layerButtonGroup.className = "item-layer-actions";
     bringForwardButton.className = "widget-panel-button";
     bringForwardButton.type = "button";
     bringForwardButton.textContent = "Bring Fwd";
     bringForwardButton.dataset.sidebarControl = "actions.bring-forward";
     bringForwardButton.setAttribute("aria-label", "Bring selected item forward");
     sendBackwardButton.className = "widget-panel-button";
     sendBackwardButton.type = "button";
     sendBackwardButton.textContent = "Send Bwd";
     sendBackwardButton.dataset.sidebarControl = "actions.send-backward";
     sendBackwardButton.setAttribute("aria-label", "Send selected item backward");
     fillLabel.className = "widget-panel-row color-panel-control";
     fillLabel.dataset.sidebarControl = "style.fill";
     fillTitle.className = "widget-panel-title";
     fillTitle.textContent = "Fill";
     fillInput.className = "native-select";
     fillInput.dataset.styleControl = "fill";
     fillInput.setAttribute("aria-label", "Sticker fill palette");
     fillSwatches.className = "color-panel-swatches";
     fillSwatches.dataset.styleSwatches = "fill";
     dotGridLabel.className = "widget-panel-row";
     dotGridLabel.dataset.sidebarControl = "options.dot-grid";
     dotGridLabel.textContent = "Dot Grid";
     dotGridInput.type = "checkbox";
     dotGridInput.dataset.styleControl = "dot-grid";
     dotGridInput.setAttribute("aria-label", "Show sticker dot grid");
     textElement.className = "sticker-text";
     textElement.dataset.themePart = "text";
     textElement.hidden = true;
     textElement.spellcheck = true;
     textElement.setAttribute("contenteditable", "false");
     textElement.setAttribute("aria-label", "Sticker text");
     tocElement.className = "toc-widget";
     textToggleLabel.className = "widget-panel-row text-panel-control text-panel-settings-control";
     textToggleLabel.dataset.sidebarControl = "text.font";
     textTitle.className = "widget-panel-title";
     textTitle.textContent = "Typeface";
     textSizeLabel.className = "widget-panel-row text-panel-control text-panel-size-control";
     textSizeLabel.dataset.sidebarControl = "text.size";
     textSizeTitle.className = "widget-panel-title";
     textSizeTitle.textContent = "Text Size";
     textSizeGroup.className = "text-panel-size-options";
     textSizeGroup.setAttribute("role", "group");
     textSizeGroup.setAttribute("aria-label", "Sticker text size");
     [
          ["10", "SM: 10px"],
          ["25", "MD: 25px"],
          ["50", "LG: 50px"],
          ["75", "1X: 75px"],
          ["100", "2X: 100px"]
     ].forEach(([value, label]) => {
          const button = document.createElement("button");

          button.className = "text-panel-size-button";
          button.type = "button";
          button.textContent = label;
          button.dataset.textSizeValue = value;
          button.setAttribute("aria-label", `${label} text size`);
          button.setAttribute("aria-pressed", "false");
          textSizeGroup.append(button);
     });
     textFontSelect.dataset.textControl = "font";
     textFontSelect.setAttribute("aria-label", "Sticker text font");
     [
          ["annotation-mono", "Annotation Mono"],
          ["bungee", "Bungee"],
          ["bungee-outline", "Bungee Outline"],
          ["bungee-shade", "Bungee Shade"],
          ["caveat", "Caveat"],
          ["dancing", "Dancing Script"],
          ["miltonian", "Miltonian"],
          ["noto-sans-mono", "Noto Sans Mono"],
          ["permanent-marker", "Permanent Marker"],
          ["rock-salt", "Rock Salt"],
          ["sedgwick-ave-display", "Sedgwick Ave Display"],
          ["sofia-sans-ec", "Sofia Sans EC"],
          ["sans", "Standard Sans"],
          ["serif", "Standard Serif"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          textFontSelect.append(option);
     });
     textColorLabel.className = "widget-panel-row text-panel-control color-panel-control";
     textColorLabel.dataset.sidebarControl = "text.color";
     textColorTitle.className = "widget-panel-title";
     textColorTitle.textContent = "Text Color";
     textColorInput.className = "native-select";
     textColorInput.dataset.textControl = "color";
     textColorInput.setAttribute("aria-label", "Sticker text palette");
     textColorSwatches.className = "color-panel-swatches";
     textColorSwatches.dataset.textSwatches = "color";
     textTocLabel.className = "widget-panel-row text-panel-control text-panel-toc-control";
     textTocLabel.dataset.sidebarControl = "text.appears-in-toc";
     textTocLabel.textContent = "Appears in ToC";
     textTocInput.type = "checkbox";
     textTocInput.dataset.textControl = "appears-in-toc";
     textTocInput.setAttribute("aria-label", "Selected text appears in Table of Contents");
     textControlsRow.className = "text-panel-control-row";
     textFormatGroup.className = "text-panel-format text-panel-control";
     textFormatGroup.dataset.sidebarControl = "text.format";
     textFormatTitle.className = "widget-panel-title";
     textFormatTitle.textContent = "Text Style";
     textBoldInput.className = "text-panel-toggle text-panel-toggle-bold";
     textBoldInput.type = "button";
     textBoldInput.textContent = "Bold";
     textBoldInput.dataset.textControl = "bold";
     textBoldInput.setAttribute("aria-label", "Bold sticker text");
     textBoldInput.setAttribute("aria-pressed", "false");
     textItalicInput.className = "text-panel-toggle text-panel-toggle-italic";
     textItalicInput.type = "button";
     textItalicInput.textContent = "Italic";
     textItalicInput.dataset.textControl = "italic";
     textItalicInput.setAttribute("aria-label", "Italic sticker text");
     textItalicInput.setAttribute("aria-pressed", "false");
     textUnderlineInput.className = "text-panel-toggle text-panel-toggle-underline";
     textUnderlineInput.type = "button";
     textUnderlineInput.textContent = "Underline";
     textUnderlineInput.dataset.textControl = "underline";
     textUnderlineInput.setAttribute("aria-label", "Underline sticker text");
     textUnderlineInput.setAttribute("aria-pressed", "false");
     textStrikeInput.className = "text-panel-toggle text-panel-toggle-strike";
     textStrikeInput.type = "button";
     textStrikeInput.textContent = "Strike";
     textStrikeInput.dataset.textControl = "strike";
     textStrikeInput.setAttribute("aria-label", "Strikethrough sticker text");
     textStrikeInput.setAttribute("aria-pressed", "false");
     textAlignLabel.className = "widget-panel-row text-panel-control text-panel-align-control";
     textAlignLabel.dataset.sidebarControl = "text.align";
     textAlignTitle.className = "widget-panel-title";
     textAlignTitle.textContent = "Alignment";
     textAlignmentGrid.className = "text-panel-alignment-grid";
     textAlignmentGrid.setAttribute("role", "group");
     textAlignmentGrid.setAttribute("aria-label", "Text placement");
     textAlignSelect.dataset.textControl = "align";
     textAlignSelect.setAttribute("aria-label", "Sticker horizontal alignment");
     ["left", "center", "right"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value[0].toUpperCase() + value.slice(1);
          textAlignSelect.append(option);
     });
     textYAlignSelect.dataset.textControl = "y-align";
     textYAlignSelect.setAttribute("aria-label", "Sticker vertical alignment");
     [
          ["top", "Top"],
          ["center", "Center"],
          ["bottom", "Bottom"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          textYAlignSelect.append(option);
     });
     [
          ["top", "left"],
          ["top", "center"],
          ["top", "right"],
          ["center", "left"],
          ["center", "center"],
          ["center", "right"],
          ["bottom", "left"],
          ["bottom", "center"],
          ["bottom", "right"]
     ].forEach(([yAlign, align]) => {
          const button = document.createElement("button");
          const glyph = document.createElement("span");

          button.className = "text-panel-alignment-button";
          button.type = "button";
          button.dataset.textAlignValue = align;
          button.dataset.textYAlignValue = yAlign;
          button.setAttribute("aria-label", `${yAlign} ${align} text alignment`);
          button.setAttribute("aria-pressed", "false");
          glyph.className = "text-panel-alignment-glyph";
          glyph.textContent = "☰";
          button.append(glyph);
          textAlignmentGrid.append(button);
     });
     textLineHeightLabel.className = "widget-panel-row text-panel-control";
     textLineHeightLabel.dataset.sidebarControl = "text.line-height";
     textLineHeightLabel.textContent = "Line Height";
     textLineHeightSelect.dataset.textControl = "line-height";
     textLineHeightSelect.setAttribute("aria-label", "Text line height in grid cells");
     textLineHeightCellOptions.forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value;
          textLineHeightSelect.append(option);
     });
     deleteButton.className = "widget-panel-button widget-panel-danger";
     deleteButton.type = "button";
     deleteButton.textContent = "Delete";
     deleteButton.dataset.sidebarControl = "actions.delete";
     deleteButton.setAttribute("aria-label", "Delete planner item");
     weekNumberLabel.className = "widget-panel-row widget-option-control";
     weekNumberLabel.dataset.sidebarControl = "options.week-number-format";
     weekNumberLabel.textContent = "Week #";
     weekNumberInput.type = "checkbox";
     weekNumberInput.dataset.widgetControl = "week-number-format";
     weekNumberInput.setAttribute("aria-label", "Show week number column");
     weekStartLabel.className = "widget-panel-row widget-option-control";
     weekStartLabel.dataset.sidebarControl = "options.week-start";
     weekStartLabel.textContent = "Week Start";
     weekStartSelect.dataset.widgetControl = "week-start";
     weekStartSelect.setAttribute("aria-label", "Calendar week start");
     ["monday", "sunday"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value[0].toUpperCase() + value.slice(1);
          weekStartSelect.append(option);
     });
     weekdayLabelLabel.className = "widget-panel-row widget-option-control";
     weekdayLabelLabel.dataset.sidebarControl = "options.weekday-label-format";
     weekdayLabelLabel.textContent = "Weekdays";
     weekdayLabelSelect.dataset.widgetControl = "weekday-label-format";
     weekdayLabelSelect.setAttribute("aria-label", "Weekday label format");
     [
          ["d", "d"],
          ["ddd", "ddd"],
          ["full", "full"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          weekdayLabelSelect.append(option);
     });
     dateModeLabel.className = "widget-panel-row widget-option-control";
     dateModeLabel.dataset.sidebarControl = "options.date-mode";
     dateModeLabel.textContent = "Display Date";
     dateModeSelect.dataset.widgetControl = "date-mode";
     dateModeSelect.setAttribute("aria-label", "Calendar display date mode");
     [
          ["fixed", "Actual"],
          ["relative", "Current"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          dateModeSelect.append(option);
     });
     dateOffsetLabel.className = "widget-panel-row widget-option-control";
     dateOffsetLabel.dataset.sidebarControl = "options.date-offset";
     dateOffsetLabel.textContent = "Current Offset";
     dateOffsetSelect.dataset.widgetControl = "date-offset";
     dateOffsetSelect.setAttribute("aria-label", "Calendar current date offset");
     populateRelativeDateOffsetSelect(dateOffsetSelect, getCalendarRelativeDateUnit(item), "0");
     titleVisibleLabel.className = "widget-panel-row widget-option-control";
     titleVisibleLabel.dataset.sidebarControl = "options.calendar-title-visible";
     titleVisibleLabel.textContent = "Month/Year";
     titleVisibleInput.type = "checkbox";
     titleVisibleInput.dataset.widgetControl = "calendar-title-visible";
     titleVisibleInput.setAttribute("aria-label", "Show calendar month and year row");
     titleVisibleInput.checked = true;
     titleBarLabel.className = "widget-panel-row widget-option-control";
     titleBarLabel.dataset.sidebarControl = "options.title-bar-visible";
     titleBarLabel.textContent = "Title Bar";
     titleBarInput.type = "checkbox";
     titleBarInput.dataset.widgetControl = "title-bar-visible";
     titleBarInput.setAttribute("aria-label", "Show widget title bar fill and border");
     titleBarInput.checked = true;
     monthLabel.className = "widget-panel-row widget-option-control";
     monthLabel.dataset.sidebarControl = "options.month";
     monthLabel.textContent = "Month";
     monthSelect.dataset.widgetControl = "month";
     monthSelect.setAttribute("aria-label", "Calendar month");
     calendarMonthNames.forEach((monthName, index) => {
          const option = document.createElement("option");

          option.value = String(index);
          option.textContent = monthName;
          monthSelect.append(option);
     });
     monthDisplayLabel.className = "widget-panel-row widget-option-control";
     monthDisplayLabel.dataset.sidebarControl = "options.month-display";
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
     yearLabel.className = "widget-panel-row widget-option-control";
     yearLabel.dataset.sidebarControl = "options.year";
     yearLabel.textContent = "Year";
     yearSelect.dataset.widgetControl = "year";
     yearSelect.setAttribute("aria-label", "Calendar year");
     for (let year = calendarYearRange.start; year <= calendarYearRange.end; year += 1) {
          const option = document.createElement("option");

          option.value = String(year);
          option.textContent = String(year);
          yearSelect.append(option);
     }
     yearDisplayLabel.className = "widget-panel-row widget-option-control";
     yearDisplayLabel.dataset.sidebarControl = "options.year-display";
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
     startDayLabel.className = "widget-panel-row widget-option-control";
     startDayLabel.dataset.sidebarControl = "options.start-day";
     startDayLabel.textContent = type === "diary-view" ? "Week #" : "Day";
     startDaySelect.dataset.widgetControl = "start-day";
     startDaySelect.setAttribute("aria-label", type === "diary-view" ? "Diary view week number" : "Weekly planner start day");
     visibleDaysLabel.className = "widget-panel-row widget-option-control";
     visibleDaysLabel.dataset.sidebarControl = "options.visible-days";
     visibleDaysLabel.textContent = "Duration";
     visibleDaysSelect.dataset.widgetControl = "visible-days";
     visibleDaysSelect.setAttribute("aria-label", "Weekly planner visible days");
     for (let dayCount = 1; dayCount <= 7; dayCount += 1) {
          const option = document.createElement("option");

          option.value = String(dayCount);
          option.textContent = `${dayCount} ${dayCount === 1 ? "day" : "days"}`;
          visibleDaysSelect.append(option);
     }
     timeIncrementLabel.className = "widget-panel-row widget-option-control";
     timeIncrementLabel.dataset.sidebarControl = "options.time-increment";
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
     startTimeLabel.className = "widget-panel-row widget-option-control";
     startTimeLabel.dataset.sidebarControl = "options.start-time";
     startTimeLabel.textContent = "Start";
     startTimeSelect.dataset.widgetControl = "start-time";
     startTimeSelect.setAttribute("aria-label", "Weekly planner start time");
     timeVisibleLabel.className = "widget-panel-row widget-option-control";
     timeVisibleLabel.dataset.sidebarControl = "options.time-visible";
     timeVisibleLabel.textContent = "Time Column";
     timeVisibleInput.type = "checkbox";
     timeVisibleInput.checked = true;
     timeVisibleInput.dataset.widgetControl = "time-visible";
     timeVisibleInput.setAttribute("aria-label", "Show weekly planner time column");
     timeFormatLabel.className = "widget-panel-row widget-option-control";
     timeFormatLabel.dataset.sidebarControl = "options.time-format";
     timeFormatLabel.textContent = "Format";
     timeFormatSelect.dataset.widgetControl = "time-format";
     timeFormatSelect.setAttribute("aria-label", "Weekly planner time format");
     [
          ["12", "12hr - 11:00a / 3:30p"],
          ["24", "24hr - 11:00 / 15:30"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          timeFormatSelect.append(option);
     });
     shareWeekendsLabel.className = "widget-panel-row widget-option-control";
     shareWeekendsLabel.dataset.sidebarControl = "options.share-weekends";
     shareWeekendsLabel.textContent = "Share Weekends";
     shareWeekendsInput.type = "checkbox";
     shareWeekendsInput.dataset.widgetControl = "share-weekends";
     shareWeekendsInput.setAttribute("aria-label", "Share Saturday and Sunday in one column");
     weekNotesLabel.className = "widget-panel-row widget-option-control";
     weekNotesLabel.dataset.sidebarControl = "options.week-notes";
     weekNotesLabel.textContent = "Week Notes";
     weekNotesSelect.dataset.widgetControl = "week-notes";
     weekNotesSelect.setAttribute("aria-label", "Week notes column");
     [
          ["off", "Off"],
          ["first", "First"],
          ["last", "Last"]
     ].forEach(([value, label]) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = label;
          weekNotesSelect.append(option);
     });
     for (let minute = 0; minute < 24 * 60; minute += 30) {
          const option = document.createElement("option");
          const time = formatMinutesAsTime(minute);

          option.value = time;
          option.textContent = time;
          startTimeSelect.append(option);
     }

     fillLabel.append(fillTitle, fillInput, fillSwatches);
     dotGridLabel.append(dotGridInput);
     textToggleLabel.classList.add("text-panel-settings-control-no-toggle");
     textToggleLabel.append(textTitle, textFontSelect);
     textSizeLabel.append(textSizeTitle, textSizeGroup);
     textColorLabel.append(textColorTitle, textColorInput, textColorSwatches);
     textTocLabel.append(textTocInput);
     textFormatGroup.append(textFormatTitle, textBoldInput, textItalicInput, textUnderlineInput, textStrikeInput);
     textAlignLabel.append(textAlignTitle, textAlignmentGrid);
     textLineHeightLabel.append(textLineHeightSelect);
     textControlsRow.append(textColorLabel, textToggleLabel, textLineHeightLabel, textSizeLabel, textFormatGroup, textAlignLabel);
     stylePanel.append(stylePanelTitle, fillLabel);
     textPanel.append(textPanelTitle, textTocLabel, textControlsRow);
     monthLabel.append(monthSelect);
     monthDisplayLabel.append(monthDisplaySelect);
     yearLabel.append(yearSelect);
     yearDisplayLabel.append(yearDisplaySelect);
     displayYearLabel.append(displayYearSelect);
     displayMonthLabel.append(displayMonthSelect);
     displayDateModeLabel.append(displayDateModeSelect);
     displayDayLabel.append(displayDaySelect);
     displayWeekNumberLabel.append(displayWeekNumberSelect);
     displayTitleVisibleLabel.append(displayTitleVisibleSelect);
     displayWeekStartLabel.append(displayWeekStartSelect);
     if (isCalendarItemType(type)) {
          if (type === "full-month") {
               displayDateRow.append(displayDateModeLabel, displayTitleVisibleLabel, displayWeekNumberLabel, displayYearLabel, displayMonthLabel);
          } else if (type === "mini-month") {
               displayDateRow.append(displayDateModeLabel, displayWeekNumberLabel, displayYearLabel, displayMonthLabel);
          } else if (type === "weekly-view" || type === "day-view" || type === "diary-view") {
               displayDateRow.append(displayDateModeLabel, displayDayLabel, displayYearLabel, displayMonthLabel);
          } else {
               displayDateRow.append(displayDateModeLabel, displayYearLabel, displayMonthLabel);
          }
     }
     weekStartLabel.append(weekStartSelect);
     weekdayLabelLabel.append(weekdayLabelSelect);
     dateModeLabel.append(dateModeSelect);
     dateOffsetLabel.append(dateOffsetSelect);
     titleVisibleLabel.append(titleVisibleInput);
     titleBarLabel.append(titleBarInput);
     weekNumberLabel.append(weekNumberInput);
     if (type === "perpetual-calendar") {
          calendarAttributesGrid.append(titleBarLabel, dateModeLabel, dateOffsetLabel, titleVisibleLabel, monthLabel, monthDisplayLabel);
     } else if (type === "weekly-view") {
          calendarAttributesGrid.append(titleBarLabel, weekdayLabelLabel, shareWeekendsLabel, weekNotesLabel, dateModeLabel, dateOffsetLabel, monthLabel, yearLabel, startDayLabel);
     } else if (type === "diary-view") {
          calendarAttributesGrid.append(titleBarLabel, weekdayLabelLabel, dateModeLabel, dateOffsetLabel, monthLabel, yearLabel, startDayLabel);
     } else if (type === "day-view") {
          calendarAttributesGrid.append(titleBarLabel, dateModeLabel, dateOffsetLabel, monthLabel, yearLabel, startDayLabel);
     } else if (type === "full-month") {
          calendarAttributesGrid.append(titleBarLabel, weekdayLabelLabel, shareWeekendsLabel, weekNotesLabel, dateModeLabel, dateOffsetLabel, titleVisibleLabel, monthLabel, yearLabel, weekNumberLabel, monthDisplayLabel, yearDisplayLabel);
     } else if (type === "toc") {
          calendarAttributesGrid.append(titleBarLabel);
     } else {
          calendarAttributesGrid.append(titleBarLabel, weekdayLabelLabel, shareWeekendsLabel, dateModeLabel, dateOffsetLabel, titleVisibleLabel, monthLabel, yearLabel, weekNumberLabel, monthDisplayLabel, yearDisplayLabel);
     }
     startDayLabel.append(startDaySelect);
     visibleDaysLabel.append(visibleDaysSelect);
     timeIncrementLabel.append(timeIncrementSelect);
     startTimeLabel.append(startTimeSelect);
     timeVisibleLabel.append(timeVisibleInput);
     timeFormatLabel.append(timeFormatSelect);
     shareWeekendsLabel.append(shareWeekendsInput);
     weekNotesLabel.append(weekNotesSelect);
     duplicateGroupActions.append(duplicateButton, groupButton);
     layoutTransformActions.append(layoutMoveButton, layoutResizeButton);
     layerButtonGroup.append(sendBackwardButton, bringForwardButton);
     layoutActionGroup.append(layoutActionTitle, layoutTransformActions, duplicateGroupActions, layerButtonGroup, deleteButton);
     actionsPanel.append(actionsWidgetType);
     if (isCalendarItemType(type)) {
          actionsPanel.append(displayDateRow);
     }
     actionsPanel.append(layoutActionGroup);
     if (type === "sticker") {
          widgetPanel.append(widgetPanelSectionTitle);
          widgetPanel.append(dotGridLabel);
     }
     if (isCalendarItemType(type) && type !== "weekly-view") {
          widgetPanel.append(widgetPanelSectionTitle);
          widgetPanel.append(calendarAttributesGrid);
     }
     if (type === "toc") {
          widgetPanel.append(widgetPanelSectionTitle, calendarAttributesGrid);
     }
     if (type === "weekly-view") {
          widgetPanel.append(widgetPanelSectionTitle);
          dateWidgetGroup.append(dateWidgetTitle, calendarAttributesGrid);
          timeWidgetGroup.append(timeWidgetTitle, timeVisibleLabel, startTimeLabel, timeIncrementLabel, visibleDaysLabel);
          widgetPanel.append(dateWidgetGroup, timeWidgetGroup);
     }
     if (type === "day-view") {
          widgetPanel.append(widgetPanelSectionTitle);
          dateWidgetGroup.append(dateWidgetTitle, calendarAttributesGrid);
          timeWidgetGroup.append(timeWidgetTitle, timeVisibleLabel, startTimeLabel, timeIncrementLabel);
          widgetPanel.append(dateWidgetGroup, timeWidgetGroup);
     }
     if (type === "diary-view") {
          widgetPanel.append(widgetPanelSectionTitle);
          dateWidgetGroup.append(dateWidgetTitle, calendarAttributesGrid, visibleDaysLabel);
          widgetPanel.append(dateWidgetGroup);
     }
     controlTabs.append(styleTab, textTab);
     if (hasWidgetControls) {
          controlTabs.append(widgetTab);
     }
     controls.append(widgetPanelTitle, controlTabs, actionsPanel, stylePanel, textPanel);
     if (hasWidgetControls) {
          controls.append(widgetPanel);
     }
     controls.querySelectorAll("select:not([data-style-control='fill']):not([data-text-control='color'])").forEach((select) => {
          makeCustomSelect(select);
          select.addEventListener("change", () => updateCustomSelectDisplay(select));
     });
     setPaletteSelectionHandler(fillInput, (nextColor) => {
          fillInput.dataset.currentColor = nextColor;
          applyStyleToActionItems(item, {
               fillColor: nextColor
          });
          setPaletteControlValue(fillInput, fillSwatches, nextColor);
     });
     fillSwatches.addEventListener("palettecolorselect", (event) => {
          const nextColor = event.detail?.color;

          if (!nextColor) {
               return;
          }

          fillInput.dataset.currentColor = nextColor;
          applyStyleToActionItems(item, {
               fillColor: nextColor
          });
          setPaletteControlValue(fillInput, fillSwatches, nextColor);
     });
     setPaletteSelectionHandler(textColorInput, (nextColor) => {
          textColorInput.dataset.currentColor = nextColor;
          applyTextSettingsToActionItems(item, {
               color: nextColor
          });
          setPaletteControlValue(textColorInput, textColorSwatches, nextColor);
     });
     textColorSwatches.addEventListener("palettecolorselect", (event) => {
          const nextColor = event.detail?.color;

          if (!nextColor) {
               return;
          }

          textColorInput.dataset.currentColor = nextColor;
          applyTextSettingsToActionItems(item, {
               color: nextColor
          });
          setPaletteControlValue(textColorInput, textColorSwatches, nextColor);
     });
     setWidgetPanelTab(controls, "actions");
     item.append(sizeLabel);
     if (isStickerTextItemType(type)) {
          item.append(textElement);
     }
     if (isTocItemType(type)) {
          item.append(tocElement);
     }
     item.append(controls);
     setItemStyle(item, typeof getPlannerDefaultItemStyle === "function" ? getPlannerDefaultItemStyle(type) : {
          fillColor: "var(--color-white)",
          borderColor: "#ccc",
          borderWidth: "1",
          dotGrid: "false"
     });
     setStickerTextSettings(item, typeof getPlannerDefaultTextSettings === "function"
          ? getPlannerDefaultTextSettings({
               enabled: isTocItemType(type) ? "true" : "false"
          }) : {});
     setCalendarDayTextSettings(item, typeof getPlannerDefaultTextSettings === "function" ? getPlannerDefaultTextSettings() : {});
     if (isCalendarItemType(type)) {
          setCalendarWidgetSettings(item);
     }
     renderToc(item);
     applyThemeToWidget(item);

     item.addEventListener("pointerdown", (event) => {
          if (event.target.closest(".widget-panel")) {
               return;
          }

          if (event.button !== 0) {
               return;
          }

          if (isWidgetContentTarget(event.target)) {
               return;
          }

          if (typeof finishAllTextEditing === "function") {
               finishAllTextEditing();
          }

          if (isStickerTextItem(item) && event.detail > 1) {
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
               const canResize = selectedItems.size === 1 && !item.dataset.groupId && item.dataset.itemType !== "mini-month";

               if (canResize) {
                    startResize(item, event, resizeMode);
                    return;
               }
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
          if (hasActiveWidgetTextSelection()) {
               return;
          }

          if (event.target.closest("[data-calendar-style-key], .calendar-border-hit-target")) {
               return;
          }

          if (shouldSkipNextItemClick) {
               shouldSkipNextItemClick = false;
               return;
          }

          if (event.metaKey || event.ctrlKey) {
               selectItem(item, true);
          } else if (!activeAction) {
               if (!selectedItems.has(item) || selectedItems.size < 2) {
                    selectItem(item);
               }
               if (isCalendarItem(item) && isCalendarBorderStylePointer(item, event)) {
                    setCalendarStyleTarget(item, {
                         type: "border",
                         key: "widget-border"
                    });
               }
          }
     });
     item.addEventListener("dblclick", (event) => {
          if (event.target.closest(".widget-panel")) {
               return;
          }

          if (event.target.closest(".sticker-text[contenteditable='true']")) {
               return;
          }

          if (event.target.closest(".sticker-text")) {
               event.preventDefault();
               event.stopPropagation();
               selectItem(item);
               startStickerTextEditing(item, {
                    selectWordAtPoint: true,
                    clientX: event.clientX,
                    clientY: event.clientY
               });
               return;
          }

          event.preventDefault();
          startStickerTextEditing(item);
     });
     item.addEventListener("focus", () => {
          if (!item.classList.contains("is-widget-panel-open") && !selectedItems.has(item)) {
               selectItem(item);
          }
     });
     item.addEventListener("keydown", (event) => {
          if (
               event.defaultPrevented ||
               activeAction ||
               event.key !== "Enter" ||
               event.altKey ||
               event.ctrlKey ||
               event.metaKey ||
               event.shiftKey ||
               event.target !== item
          ) {
               return;
          }

          if (!selectedItems.has(item)) {
               selectItem(item);
          }

          event.preventDefault();
          if (isStickerTextItem(item)) {
               startStickerTextEditing(item);
               return;
          }

          const rect = item.getBoundingClientRect();

          openItemActionsPopup(item, {
               clientX: rect.left + (rect.width / 2),
               clientY: rect.top + Math.min(rect.height / 2, 36)
          });
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
     controls.addEventListener("pointerdown", (event) => {
          startFloatingControlsMove(controls, event);
          event.stopPropagation();
     });
     controls.addEventListener("click", (event) => {
          if (controls.dataset.skipNextClick === "true") {
               delete controls.dataset.skipNextClick;
               event.preventDefault();
               event.stopPropagation();
               return;
          }

          event.stopPropagation();
     });
     controls.addEventListener("keydown", handleWidgetPanelButtonKey);
     controls.querySelectorAll("[data-widget-panel-tab]").forEach((tab) => {
          tab.addEventListener("click", () => setWidgetPanelTab(controls, tab.dataset.widgetPanelTab));
     });
     duplicateButton.addEventListener("click", (event) => {
          event.stopPropagation();
          duplicateItem(item);
     });
     layoutMoveButton.addEventListener("click", (event) => {
          event.stopPropagation();
          if (typeof startKeyboardMoveFromPopup === "function") {
               startKeyboardMoveFromPopup(item);
          }
     });
     layoutResizeButton.addEventListener("click", (event) => {
          event.stopPropagation();
          if (typeof startKeyboardResizeFromPopup === "function") {
               startKeyboardResizeFromPopup(item);
          }
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
     dotGridInput.addEventListener("change", () => {
          applyStyleToActionItems(item, {
               dotGrid: dotGridInput.checked ? "true" : "false"
          });
     });
     textSizeGroup.querySelectorAll("[data-text-size-value]").forEach((button) => {
          button.addEventListener("click", () => {
               applyTextSettingsToActionItems(item, {
                    size: button.dataset.textSizeValue
               });
          });
     });
     textFontSelect.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               font: textFontSelect.value
          });
     });
     textTocInput.addEventListener("change", () => {
          const textTarget = getSelectedTextStyleTarget(item);

          if (textTarget) {
               applyPopupTextToc(textTarget.item, textTarget, textTocInput.checked);
               setSelectedTextStyleTarget(textTarget.item, {
                    ...textTarget,
                    appearsInToc: textTocInput.checked
               });
          }
     });
     textBoldInput.addEventListener("click", () => {
          const isActive = textBoldInput.getAttribute("aria-pressed") === "true";

          applyTextSettingsToActionItems(item, {
               bold: isActive ? "false" : "true"
          });
     });
     textItalicInput.addEventListener("click", () => {
          const isActive = textItalicInput.getAttribute("aria-pressed") === "true";

          applyTextSettingsToActionItems(item, {
               italic: isActive ? "false" : "true"
          });
     });
     textUnderlineInput.addEventListener("click", () => {
          const isActive = textUnderlineInput.getAttribute("aria-pressed") === "true";

          applyTextSettingsToActionItems(item, {
               underline: isActive ? "false" : "true"
          });
     });
     textStrikeInput.addEventListener("click", () => {
          const isActive = textStrikeInput.getAttribute("aria-pressed") === "true";

          applyTextSettingsToActionItems(item, {
               strike: isActive ? "false" : "true"
          });
     });
     textAlignmentGrid.querySelectorAll("[data-text-align-value][data-text-y-align-value]").forEach((button) => {
          button.addEventListener("click", () => {
               applyTextSettingsToActionItems(item, {
                    align: button.dataset.textAlignValue,
                    yAlign: button.dataset.textYAlignValue
               });
          });
     });
     textLineHeightSelect.addEventListener("change", () => {
          applyTextSettingsToActionItems(item, {
               lineHeight: textLineHeightSelect.value
          });
     });
     textElement.addEventListener("input", () => {
          updateStickerTextOverflow(item);
     });
     textElement.addEventListener("blur", () => stopStickerTextEditing(item));
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
          applyCalendarWidgetSettingsToActionItems(item, {
               weekNumberFormat: weekNumberInput.checked ? "no-outlines" : "off"
          });
     });
     displayWeekNumberSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               weekNumberFormat: displayWeekNumberSelect.value === "on" ? "no-outlines" : "off"
          });
     });
     displayTitleVisibleSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               titleVisible: displayTitleVisibleSelect.value
          });
     });
     weekStartSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               weekStart: weekStartSelect.value
          });
     });
     displayWeekStartSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               weekStart: displayWeekStartSelect.value
          });
     });
     weekdayLabelSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               weekdayLabelFormat: weekdayLabelSelect.value
          });
     });
     dateModeSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               dateMode: dateModeSelect.value
          });
     });
     dateOffsetSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               dateMode: "relative",
               dateOffset: dateOffsetSelect.value
          });
     });
     titleVisibleInput.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               titleVisible: titleVisibleInput.checked ? "true" : "false"
          });
     });
     titleBarInput.addEventListener("change", () => {
          applyStyleToActionItems(item, {
               titleBarVisible: titleBarInput.checked ? "true" : "false"
          });
     });
     monthSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               dateMode: "fixed",
               month: monthSelect.value
          });
     });
     displayMonthSelect.addEventListener("change", () => {
          if (item.dataset.dateMode === "relative") {
               applyCalendarWidgetSettingsToActionItems(item, {
                    dateMode: "relative",
                    dateOffset: getCalendarDisplayOffsetValue(displayYearSelect.value, displayMonthSelect.value)
               });
               return;
          }

          applyCalendarWidgetSettingsToActionItems(item, {
               dateMode: "fixed",
               month: displayMonthSelect.value
          });
     });
     displayDateModeSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               dateMode: displayDateModeSelect.value,
               dateOffset: displayDateModeSelect.value === "relative" ? "0" : item.dataset.dateOffset
          });
     });
     monthDisplaySelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               monthDisplay: monthDisplaySelect.value
          });
     });
     yearSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               dateMode: "fixed",
               year: yearSelect.value
          });
     });
     displayYearSelect.addEventListener("change", () => {
          if (item.dataset.dateMode === "relative") {
               applyCalendarWidgetSettingsToActionItems(item, {
                    dateMode: "relative",
                    dateOffset: getCalendarDisplayOffsetValue(displayYearSelect.value, displayMonthSelect.value)
               });
               return;
          }

          applyCalendarWidgetSettingsToActionItems(item, {
               dateMode: "fixed",
               year: displayYearSelect.value
          });
     });
     yearDisplaySelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               yearDisplay: yearDisplaySelect.value
          });
     });
     startDaySelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               dateMode: "fixed",
               startDay: startDaySelect.value
          });
     });
     displayDaySelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               dateMode: "fixed",
               startDay: displayDaySelect.value
          });
     });
     visibleDaysSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               visibleDays: visibleDaysSelect.value
          });
     });
     timeIncrementSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               timeIncrement: timeIncrementSelect.value
          });
     });
     startTimeSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               startTime: startTimeSelect.value
          });
     });
     timeFormatSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               timeFormat: timeFormatSelect.value
          });
     });
     timeVisibleInput.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               timeVisible: timeVisibleInput.checked ? "true" : "false"
          });
     });
     shareWeekendsInput.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               shareWeekends: shareWeekendsInput.checked ? "true" : "false"
          });
     });
     weekNotesSelect.addEventListener("change", () => {
          applyCalendarWidgetSettingsToActionItems(item, {
               weekNotes: weekNotesSelect.value
          });
     });
     deleteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteItem(item);
     });
     applySidebarControlVisibility(item);

     return item;
}

// NOTE: Copy, Paste, Duplicate, And Delete Items
function copyItemConfiguration(source, target) {
     setItemStyle(target, {
          fillColor: source.dataset.fillColor,
          borderColor: source.dataset.borderColor,
          borderWidth: source.dataset.borderWidth,
          dotGrid: source.dataset.dotGrid,
          titleBarVisible: source.dataset.titleBarVisible
     });
     if (source.dataset.themeMode) {
          target.dataset.themeMode = source.dataset.themeMode;
     }
     setStickerTextSettings(target, {
          enabled: source.dataset.textEnabled,
          content: isTocItem(source) ? undefined : getStickerTextElement(source) ? getStickerTextElement(source).textContent : "",
          size: source.dataset.textSize,
          font: source.dataset.textFont,
          color: source.dataset.textColor,
          bold: source.dataset.textBold,
          italic: source.dataset.textItalic,
          underline: source.dataset.textUnderline,
          strike: source.dataset.textStrike,
          align: source.dataset.textAlign,
          yAlign: source.dataset.textYAlign,
          lineHeight: source.dataset.textLineHeight
     });
     if (isCalendarItem(source)) {
          setCalendarWidgetSettings(target, {
               weekNumbers: source.dataset.weekNumbers,
               weekNumberFormat: source.dataset.weekNumberFormat,
               weekStart: source.dataset.weekStart,
               weekdayLabelFormat: source.dataset.weekdayLabelFormat,
               dateOrder: source.dataset.dateOrder,
               yearFormat: source.dataset.dateYearFormat,
               monthFormat: source.dataset.dateMonthFormat,
               dayFormat: source.dataset.dateDayFormat,
               dateMode: source.dataset.dateMode,
               dateOffset: source.dataset.dateOffset,
               titleVisible: source.dataset.calendarTitleVisible,
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
               shareWeekends: source.dataset.shareWeekends,
               weekNotes: source.dataset.weekNotes
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
                    strike: source.dataset.dayTextStrike,
                    align: source.dataset.dayTextAlign,
                    yAlign: source.dataset.dayTextYAlign,
                    lineHeight: source.dataset.dayTextLineHeight
               });
          }
          renderMiniMonth(target);
     }
}

function getOrderedPlannerItems(items) {
     const itemSet = new Set(items);

     return getAllPlannerItems().filter((item) => itemSet.has(item));
}

function copyPlannerItems(items = Array.from(selectedItems)) {
     const orderedItems = getOrderedPlannerItems(items);

     if (!orderedItems.length) {
          return false;
     }

     plannerClipboard = {
          pasteCount: 0,
          items: orderedItems.map((item) => {
               const pageNumber = item.dataset.pageId ? getItemPageNumber(item) : null;

               return {
                    data: serializePlannerItem(item),
                    box: getItemBox(item),
                    groupId: item.dataset.groupId || "",
                    sourcePageId: item.dataset.pageId || "",
                    sourcePageNumber: Number.isFinite(pageNumber) ? pageNumber : null
               };
          })
     };
     updateClipboardControls();
     return true;
}

function getClipboardTargetPage(entry) {
     const preferredSide = entry.sourcePageId || getFocusedPageSide();
     const preferredPage = pages.find((page) => getPageId(page) === preferredSide) || null;

     if (preferredPage && isPageNumberAvailable(getPageNumberForPage(preferredPage))) {
          return preferredPage;
     }

     const focusedSide = getFocusedPageSide();
     const focusedPage = pages.find((page) => getPageId(page) === focusedSide) || null;

     if (focusedPage && isPageNumberAvailable(getPageNumberForPage(focusedPage))) {
          return focusedPage;
     }

     return pages.find((page) => isPageNumberAvailable(getPageNumberForPage(page))) || null;
}

function getClipboardPasteBox(entry, page) {
     const box = entry.box;

     if (!page) {
          const offset = 16 * Math.max(1, plannerClipboard.pasteCount + 1);

          return {
               ...box,
               x: box.x + offset,
               y: box.y + offset
          };
     }

     const grid = getGridSize(page);
     const targetPageNumber = getPageNumberForPage(page);
     const isOriginalPage = targetPageNumber === entry.sourcePageNumber;
     const offset = grid.x * (isOriginalPage ? plannerClipboard.pasteCount + 1 : plannerClipboard.pasteCount);

     return {
          ...box,
          x: clamp(box.x + offset, 0, page.clientWidth - box.width),
          y: clamp(box.y + offset, 0, page.clientHeight - box.height)
     };
}

function pasteClipboardItem(entry, copiedGroupIds) {
     const type = normalizePlannerItemType(entry.data.type || "sticker");

     if (!itemGridUnits[type]) {
          return null;
     }

     const duplicate = makePlannerItem(type);
     const itemData = {
          ...entry.data,
          groupId: null
     };

     plannerDesk.append(duplicate);
     restorePlannerItemSettings(duplicate, itemData);
     delete duplicate.dataset.groupId;

     if (entry.data.placement === "page" || entry.sourcePageId) {
          const page = getClipboardTargetPage(entry);

          if (!page) {
               duplicate.remove();
               return null;
          }

          markGridState(duplicate, true, page);
          setItemBox(duplicate, getClipboardPasteBox(entry, page));
     } else {
          markGridState(duplicate, false);
          setItemBox(duplicate, getClipboardPasteBox(entry, null));
     }

     if (entry.groupId) {
          if (!copiedGroupIds.has(entry.groupId)) {
               copiedGroupIds.set(entry.groupId, `group-${nextGroupId}`);
               nextGroupId += 1;
          }

          duplicate.dataset.groupId = copiedGroupIds.get(entry.groupId);
     }

     return duplicate;
}

function pastePlannerClipboard() {
     if (!plannerClipboard?.items?.length) {
          return false;
     }

     const pastedItems = [];
     const copiedGroupIds = new Map();

     plannerClipboard.items.forEach((entry) => {
          const pastedItem = pasteClipboardItem(entry, copiedGroupIds);

          if (pastedItem) {
               pastedItems.push(pastedItem);
          }
     });

     if (!pastedItems.length) {
          return false;
     }

     plannerClipboard.pasteCount += 1;
     selectItems(pastedItems);
     notifyTemplateChanged();
     updateClipboardControls();
     return true;
}

function isTextInputShortcutTarget(target) {
     return Boolean(target?.closest?.("input, textarea, select, [contenteditable='true']"));
}

function handleClipboardShortcut(event) {
     if (activeAction || isTextInputShortcutTarget(event.target) || !(event.metaKey || event.ctrlKey) || event.altKey) {
          return;
     }

     const key = event.key.toLowerCase();

     if (key === "c") {
          if (copyPlannerItems()) {
               event.preventDefault();
          }
     } else if (key === "v") {
          if (pastePlannerClipboard()) {
               event.preventDefault();
          }
     }
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
     const duplicate = makePlannerItem(item.dataset.itemType || "sticker");
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
          const duplicate = makePlannerItem(item.dataset.itemType || "sticker");
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

     if (!copies.length) {
          return;
     }

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

// NOTE: Drop Items Onto Pages Or Back Onto The Desk
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
     if (!canPlaceItemOnPage(item, page)) {
          return false;
     }

     const snappedSize = getGridSnappedSize(item, page);
     const isNewPageCalendar = activeAction.type === "source" && isFullPageCalendarType(item.dataset.itemType);

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
               height: Math.max(grid.y, Math.min(
                    snappedSize.height - (grid.y * 2),
                    item.dataset.itemType === "perpetual-calendar"
                         ? grid.y * getPerpetualCalendarMaxGridRows()
                         : (item.dataset.itemType === "diary-view" ? grid.y * getDiaryViewMaxGridRows() : Infinity)
               ))
          });
          return true;
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
     return true;
}

function restoreActiveMoveItems() {
     activeAction.items.forEach(({ item, page, box }) => {
          plannerDesk.append(item);
          markGridState(item, Boolean(page), page);
          setItemBox(item, box);
          item.classList.remove("is-dragging");
     });
}

function removeRejectedSourceItem() {
     selectedItems.delete(activeAction.item);
     if (selectedItem === activeAction.item) {
          selectedItem = null;
     }
     activeAction.item.remove();
     updateObjectControlsState();
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

     if (event.target.closest(".planner-item, .sticker-source, .control-panel, .page-snap-controls, [data-color-panel-matrix], [data-color-panel-hex]")) {
          return;
     }

     const resizeMode = selectedItem && !event.target.closest(".control-panel, .widget-panel, .page-snap-controls")
          ? getResizeMode(selectedItem, event)
          : "";

     if (resizeMode) {
          startResize(selectedItem, event, resizeMode);
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
          wasSelected: selectedItems.has(item),
          selectionSize: selectedItems.size,
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
     if (activeAction || event.button > 0) {
          return;
     }

     event.preventDefault();
     event.stopPropagation();

     const source = event.currentTarget;
     const item = makePlannerItem(source.dataset.createType || "sticker");
     const sourceRect = source.getBoundingClientRect();
     const offsetX = event.clientX - sourceRect.left;
     const offsetY = event.clientY - sourceRect.top;

     closeItemMenus();
     document.body.append(item);
     item.classList.add("is-floating-source", "is-dragging");
     item.style.width = `${sourceRect.width}px`;
     item.style.height = `${sourceRect.height}px`;
     setFloatingBox(item, event.clientX, event.clientY, offsetX, offsetY);

     activeAction = {
          type: "source",
          item,
          page: null,
          didMove: false,
          offsetX,
          offsetY
     };

     document.addEventListener("pointermove", moveActiveItem, true);
     document.addEventListener("pointerup", endActiveItem, true);
     document.addEventListener("pointercancel", endActiveItem, true);
     document.addEventListener("mousemove", moveActiveItem, true);
     document.addEventListener("mouseup", endActiveItem, true);
}

function startResize(item, event, mode) {
     if (selectedItems.size !== 1 || item.dataset.groupId || item.dataset.itemType === "mini-month") {
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

     if (activeAction.type === "control-panel-move") {
          activeAction.hasMoved = true;
          setControlPanelBox(getMovedControlPanelBox(event.clientX, event.clientY));
          return;
     }

     if (activeAction.type === "control-panel-resize") {
          setControlPanelBox(getResizedControlPanelBox(event.clientY));
          return;
     }

     if (activeAction.type === "pending-controls-move") {
          const deltaX = event.clientX - activeAction.startX;
          const deltaY = event.clientY - activeAction.startY;

          if (Math.hypot(deltaX, deltaY) < moveStartThreshold) {
               return;
          }

          event.preventDefault();
          activeAction.type = "controls-move";
          activeAction.didMove = true;
          activeAction.controls.classList.add("is-dragging");
     }

     if (activeAction.type === "controls-move") {
          activeAction.didMove = true;
          setFloatingControlsBox(activeAction.controls, getMovedFloatingControlsBox(event.clientX, event.clientY));
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
          activeAction.didMove = true;
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

     document.removeEventListener("pointermove", moveActiveItem, true);
     document.removeEventListener("pointerup", endActiveItem, true);
     document.removeEventListener("pointercancel", endActiveItem, true);
     document.removeEventListener("mousemove", moveActiveItem, true);
     document.removeEventListener("mouseup", endActiveItem, true);

     if (activeAction.type === "control-panel-move" || activeAction.type === "control-panel-resize") {
          try {
               controlPanel.releasePointerCapture(event.pointerId);
          } catch {
          }

          if (activeAction.type === "control-panel-move" && activeAction.hasMoved) {
               shouldSkipNextTabClick = true;
          }

          controlPanel.classList.remove("is-dragging", "is-resizing");
          activeAction = null;
          return;
     }

     if (activeAction.type === "pending-controls-move" || activeAction.type === "controls-move") {
          try {
               activeAction.controls.releasePointerCapture(event.pointerId);
          } catch {
          }

          activeAction.controls.classList.remove("is-dragging");
          if (activeAction.didMove) {
               activeAction.controls.dataset.skipNextClick = "true";
          }
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
          if (!activeAction.wasSelected || activeAction.selectionSize < 2) {
               selectItem(activeAction.item);
          }
          activeAction = null;
          clearDragOver();
          return;
     }

     if (activeAction.type === "source" || activeAction.type === "move") {
          const pointerPage = getPageFromPoint(event.clientX, event.clientY);
          const overlapPage = getPageFromDraggedBox(
               activeAction.item,
               event.clientX,
               event.clientY,
               activeAction.offsetX,
               activeAction.offsetY
          );
          const page = pointerPage || overlapPage;

          if (page && !canPlaceActiveMoveItemsOnPage(page)) {
               restoreActiveMoveItems();
               markSnapReady(activeAction.item, false);
               activeAction = null;
               clearDragOver();
               return;
          }

          if (page) {
               const didPlaceOnPage = snapItemToPage(activeAction.item, page, event);

               if (!didPlaceOnPage) {
                    if (activeAction.type === "source") {
                         removeRejectedSourceItem();
                    } else {
                         restoreActiveMoveItems();
                    }
                    markSnapReady(activeAction.item, false);
                    activeAction = null;
                    clearDragOver();
                    return;
               }
               if (activeAction.type === "source") {
                    closeControlPanel();
               }
          } else {
               if (activeAction.type === "source") {
                    removeRejectedSourceItem();
                    activeAction = null;
                    clearDragOver();
                    return;
               }
               placeItemOnDesk(activeAction.item, event);
          }

          if (activeAction.type === "move" && activeAction.items.length > 1) {
               moveGroupItemsToDestination(page, activeAction.items.find(({ item }) => item === activeAction.item), activeAction.item.getBoundingClientRect());
          }

          if (activeAction.type === "move") {
               activeAction.items.forEach(({ item }) => item.classList.remove("is-dragging"));
               shouldSkipNextItemClick = true;
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

document.addEventListener("selectionchange", syncSelectedTextTargetFromSelection);
