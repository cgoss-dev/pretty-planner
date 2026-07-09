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
    tint25: "var(--tint-25)",
    tint50: "var(--tint-50)",
    tint75: "var(--tint-75)",
    shade25: "var(--shade-25)",
    shade50: "var(--shade-50)",
    shade75: "var(--shade-75)",
    sky: "var(--color-sky)",
  };

  return colorMap[colorKey] || colorKey || "";
}

function getThemeTextSize(theme, textTheme = {}) {
  const baseSize = Number(theme?.text?.body?.size) || 10;

  return (
    Number(textTheme.size) ||
    (Number(textTheme.sizeMultiplier)
      ? baseSize * Number(textTheme.sizeMultiplier)
      : baseSize)
  );
}

function sanitizeIntegerEntryValue(value) {
  const trimmedValue = String(value || "").trim();
  const isNegative = trimmedValue.startsWith("-");
  const digits = trimmedValue.replace(/\D/g, "");

  if (!digits) {
    return isNegative ? "-" : "";
  }

  return `${isNegative ? "-" : ""}${digits}`;
}

function normalizeIntegerEntryValue(value, fallbackValue = "0") {
  const sanitizedValue = sanitizeIntegerEntryValue(value);

  if (!sanitizedValue || sanitizedValue === "-") {
    return String(Number.parseInt(fallbackValue, 10) || 0);
  }

  return String(Number.parseInt(sanitizedValue, 10) || 0);
}

function setControlTitle(element, title) {
  const shouldWrapTitle =
    element.classList.contains("widget-panel-row") ||
    element.classList.contains("item-calendar-display-control");
  const titleElement = shouldWrapTitle
    ? document.createElement("span")
    : element;

  element.textContent = "";

  if (shouldWrapTitle) {
    titleElement.className = "widget-panel-title";
    element.append(titleElement);
  }

  if (Array.isArray(title)) {
    title.forEach((line) => {
      const titleLine = document.createElement("span");

      titleLine.className = "control-title-line";
      titleLine.textContent = line;
      titleElement.append(titleLine);
    });
    return;
  }

  titleElement.textContent = title;
}

function getThemeFillValue(theme, fillSlot) {
  const defaultGrid =
    typeof getPlannerDefaultGridSettings === "function"
      ? getPlannerDefaultGridSettings()
      : null;
  const fillColor =
    fillSlot === "fillColor1" && defaultGrid?.fill
      ? defaultGrid.fill
      : getThemeColorValue(theme.widget?.[fillSlot]);
  const baseFill =
    defaultGrid?.fill ||
    getThemeColorValue(theme.widget?.fillColor1 || "paper");

  if (!fillColor || fillSlot === "fillColor1") {
    return fillColor || baseFill;
  }

  return `linear-gradient(${fillColor}, ${fillColor}), ${baseFill}`;
}

function applyTextThemeToElement(
  element,
  textTheme = {},
  theme = null,
  overrides = {},
) {
  const nextTextTheme = {
    ...textTheme,
    ...overrides,
  };
  const partStyle =
    typeof getPlannerWidgetTextPartStyle === "function"
      ? getPlannerWidgetTextPartStyle(
          nextTextTheme.widgetType,
          nextTextTheme.partName,
        )
      : null;
  const defaultText =
    typeof getPlannerDefaultTextSettings === "function"
      ? getPlannerDefaultTextSettings(partStyle || {})
      : partStyle || null;

  element.style.fontFamily = getStickerTextFont(
    defaultText?.font || nextTextTheme.typeface || "annotation-mono",
  );
  element.style.fontSize = `${defaultText?.size || getThemeTextSize(theme, nextTextTheme)}px`;
  element.style.color =
    defaultText?.color || getThemeColorValue(nextTextTheme.color || "gray1");
  element.style.fontWeight =
    defaultText?.bold === "true" || nextTextTheme.style?.includes("bold")
      ? "800"
      : "400";
  element.style.fontStyle =
    defaultText?.italic === "true" || nextTextTheme.style?.includes("italic")
      ? "italic"
      : "normal";
  element.style.textDecoration = getTextDecorationValue(
    defaultText?.underline ??
      (nextTextTheme.style?.includes("underline") ? "true" : "false"),
    defaultText?.strike ??
      (nextTextTheme.style?.includes("strikethrough") ? "true" : "false"),
  );
  element.style.textAlign = defaultText?.align || "center";
  element.style.alignContent = getTextYAlignValue(
    defaultText?.yAlign || "center",
  );

  if (element.classList.contains("calendar-current-day-number")) {
    element.style.fontSize = "var(--font-size-md)";
    element.style.fontWeight = "800";
  }
}

function getWidgetTypeTextParts(type) {
  return plannerWidgetThemeSlots?.widgets?.[type]?.parts || {};
}

function getWidgetTextPartSlots(type, partName) {
  return getWidgetTypeTextParts(type)?.[partName] || null;
}

function getWidgetSharedTextPartName(type, partName) {
  if (
    (type === "weekly-view" || type === "diary-view") &&
    partName === "weekendDayHeader"
  ) {
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
      const isCustomBackgroundFill =
        hasCustomItemStyle &&
        partSlots.fillSlot &&
        partSlots.fillSlot === widgetSlots.parts?.background?.fillSlot;
      const isCustomBackgroundBorder =
        hasCustomItemStyle &&
        partSlots.borderSlot &&
        partSlots.borderSlot === widgetSlots.parts?.background?.borderSlot;

      if (
        partSlots.textSlot &&
        item.dataset.itemType === "sticker" &&
        partName === "text"
      ) {
        setStickerTextSettings(item);
      } else if (partSlots.textSlot) {
        const textPartName = getWidgetSharedTextPartName(
          item.dataset.itemType,
          partName,
        );

        applyTextThemeToElement(
          part,
          theme.text?.[partSlots.textSlot] || {},
          theme,
          {
            textSlot: partSlots.textSlot,
            widgetType: item.dataset.itemType,
            partName: textPartName,
            sizeMultiplier: partSlots.sizeMultiplier,
          },
        );
      }
      if (
        !isCustomBackgroundFill &&
        partSlots.fillSlot &&
        theme.widget?.[partSlots.fillSlot]
      ) {
        if (isCalendarItem(item) && partSlots.fillSlot !== "fillColor1") {
          part.style.background = "";
        } else {
          part.style.background = getThemeFillValue(theme, partSlots.fillSlot);
        }
      }
      if (
        !isCustomBackgroundBorder &&
        partSlots.borderSlot &&
        theme.widget?.[partSlots.borderSlot]
      ) {
        part.style.borderColor = "#ccc";
      }
    });
  });

  const backgroundSlots = widgetSlots.parts?.background;

  if (
    !hasCustomItemStyle &&
    backgroundSlots?.fillSlot &&
    theme.widget?.[backgroundSlots.fillSlot]
  ) {
    item.style.setProperty(
      "--sticker-fill",
      getThemeFillValue(theme, backgroundSlots.fillSlot),
    );
    item.style.setProperty(
      "--widget-box-fill",
      getThemeFillValue(theme, backgroundSlots.fillSlot),
    );
  }
  if (
    !hasCustomItemStyle &&
    backgroundSlots?.borderSlot &&
    theme.widget?.[backgroundSlots.borderSlot]
  ) {
    item.style.setProperty("--sticker-border-color", "#ccc");
  }
  if (!hasCustomItemStyle) {
    applyDefaultGridLineStyles(item);
  }
}

function getGridLineStyle(lineSettings = {}) {
  return {
    color: "#ccc",
    width: "1px",
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
      fetch("data/widget-theme-slots.json?v=planner-storage-12"),
    ]);

    plannerThemesData = await themesResponse.json();
    plannerWidgetThemeSlots = await slotsResponse.json();
    getAllPlannerItems()
      .filter((item) =>
        Boolean(plannerWidgetThemeSlots?.widgets?.[item.dataset.itemType]),
      )
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

function isAccentFillItem(item) {
  return (
    isTocItem(item) ||
    (typeof isCalendarItem === "function" && isCalendarItem(item))
  );
}

function getTocItems(items) {
  return items.filter(isTocItem);
}

function getTocDisplayTitle(title) {
  return String(title || "")
    .replace(/\s+/g, " ")
    .trim();
}

function renderToc(item, entries = []) {
  if (!isTocItem(item)) {
    return;
  }

  const tocEntries = Array.isArray(entries) ? entries : [];
  const tocTitleGridRows = 4;
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
  tocTitleName.dataset.themePart = "heading";
  tocTitleName.setAttribute("aria-label", "Table of Contents");
  tocTitleName.append("Table of", document.createElement("br"), "Contents");
  tocTitle.append(tocTitleName);
  list.append(tocTitle);

  if (!tocEntries.length) {
    const empty = document.createElement("div");
    const emptyNumber = document.createElement("span");
    const emptyTitle = document.createElement("span");

    empty.className = "toc-empty";
    emptyNumber.className = "toc-page-number";
    emptyNumber.dataset.themePart = "pageNumber";
    emptyTitle.className = "toc-empty-title";
    emptyTitle.dataset.themePart = "entryText";
    emptyTitle.textContent = "No page titles";
    empty.append(emptyNumber, emptyTitle);
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
    number.dataset.themePart = "pageNumber";
    number.textContent = String(entry.pageNumber);
    title.className = "toc-entry-title";
    title.dataset.themePart = "entryText";
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
  const titleGridRows = 4;
  const bodyGridRows = 2;
  const rowCount = Math.max(
    1,
    Math.floor(
      (Math.round(box.height / rowHeight) - titleGridRows) / bodyGridRows,
    ),
  );
  item.style.setProperty(
    "--toc-left-column-width",
    `${columnWidth * tocLeftColumnGridUnits}px`,
  );
  item.style.setProperty(
    "--toc-right-column-min-width",
    `${columnWidth * tocRightColumnMinGridUnits}px`,
  );
  item.style.setProperty("--toc-row-height", `${rowHeight}px`);
  item.style.setProperty(
    "--toc-title-row-height",
    `${rowHeight * titleGridRows}px`,
  );
  item.style.setProperty(
    "--toc-body-row-height",
    `${rowHeight * bodyGridRows}px`,
  );
  item.style.setProperty("--toc-row-count", String(rowCount));
}

function getTocMinGridColumns() {
  return 20;
}

function getTocMinGridRows() {
  return 14;
}

function clampTocBox(item, page, box) {
  if (!isTocItem(item)) {
    return box;
  }

  const grid = getGridSize(page);
  const minWidth = grid.x * getTocMinGridColumns();
  const minHeight = grid.y * getTocMinGridRows();
  const snappedWidth = Math.max(
    minWidth,
    Math.round(box.width / grid.x) * grid.x,
  );
  const snappedHeight = Math.max(
    minHeight,
    Math.round(box.height / grid.y) * grid.y,
  );

  return {
    ...box,
    width: snappedWidth,
    height: snappedHeight,
  };
}

function setItemStyle(item, style) {
  item.dataset.fillColor =
    style.fillColor || item.dataset.fillColor || "var(--color-white)";
  item.dataset.borderColor =
    style.borderColor || item.dataset.borderColor || "#ccc";
  item.dataset.borderWidth =
    style.borderWidth || item.dataset.borderWidth || "1";
  item.dataset.borderEnabled =
    style.borderEnabled || item.dataset.borderEnabled || "true";
  const hasClearFill = item.dataset.fillColor === "transparent";
  const hasClearBorder = item.dataset.borderEnabled !== "true";
  const usesAccentFill = isAccentFillItem(item);
  const bodyFill = usesAccentFill
    ? "var(--color-white)"
    : item.dataset.fillColor;

  item.dataset.hasClearFill = String(hasClearFill);
  item.dataset.hasClearBorder = String(hasClearBorder);
  delete item.dataset.fillAlpha;
  delete item.dataset.borderAlpha;
  applyDefaultGridLineStyles(item);
  item.style.setProperty("--sticker-fill", bodyFill);
  item.style.setProperty("--sticker-fill-opaque", bodyFill);
  item.style.setProperty("--widget-box-fill", bodyFill);
  if (usesAccentFill) {
    item.style.setProperty("--widget-accent-fill", item.dataset.fillColor);
    item.style.setProperty("--calendar-shaded-overlay", item.dataset.fillColor);
    item.style.setProperty(
      "--calendar-tint-background",
      `linear-gradient(var(--calendar-tint), var(--calendar-tint)), ${item.dataset.fillColor}`,
    );
    item.style.setProperty(
      "--calendar-weekday-header-background",
      `linear-gradient(var(--calendar-weekday-header-tint), var(--calendar-weekday-header-tint)), ${item.dataset.fillColor}`,
    );
  } else {
    item.style.removeProperty("--widget-accent-fill");
    item.style.removeProperty("--calendar-shaded-overlay");
    item.style.removeProperty("--calendar-tint-background");
    item.style.removeProperty("--calendar-weekday-header-background");
  }
  if (hasClearFill) {
    item.style.setProperty("--calendar-tint-alpha", "0");
  } else {
    item.style.removeProperty("--calendar-tint-alpha");
  }
  item.style.setProperty(
    "--sticker-border-color",
    hasClearBorder ? "transparent" : item.dataset.borderColor,
  );
  item.style.setProperty(
    "--sticker-border-size",
    `${item.dataset.borderWidth}px`,
  );

  const controls = getWidgetPanel(item) || item;
  const fillInput = controls.querySelector("[data-style-control='fill']");
  const fillSwatches = controls.querySelector("[data-style-swatches='fill']");
  const borderEnabledInput = controls.querySelector(
    "[data-style-control='border-enabled']",
  );
  const borderColorInput = controls.querySelector(
    "[data-style-control='border-color']",
  );
  const borderColorSwatches = controls.querySelector(
    "[data-style-swatches='border-color']",
  );
  if (fillInput) {
    setPaletteControlValue(fillInput, fillSwatches, item.dataset.fillColor);
  }

  if (borderEnabledInput) {
    borderEnabledInput.checked = item.dataset.borderEnabled === "true";
  }

  updateBorderWidthControls(controls, item.dataset.borderWidth);

  if (borderColorInput) {
    setPaletteControlValue(
      borderColorInput,
      borderColorSwatches,
      item.dataset.borderColor,
    );
  }

  controls
    .querySelectorAll("[data-border-dependent='true']")
    .forEach((control) => {
      control.hidden =
        item.dataset.borderEnabled !== "true" ||
        !isMainMenuControlVisibleForItem(item, control.dataset.mainMenuControl);
    });

  controls.querySelectorAll("select").forEach(updateCustomSelectDisplay);
}

function isMainMenuControlVisibleForItem(item, controlKey) {
  if (
    !item ||
    !controlKey ||
    typeof isPlannerWidgetControlVisible !== "function"
  ) {
    return true;
  }

  return isPlannerWidgetControlVisible(item.dataset.itemType, controlKey);
}

function applyMainMenuControlVisibility(item) {
  const controls = getWidgetPanel(item);

  if (!controls) {
    return;
  }

  controls.querySelectorAll("[data-main-menu-control]").forEach((control) => {
    const isVisibleForItem = isMainMenuControlVisibleForItem(
      item,
      control.dataset.mainMenuControl,
    );
    const isVisibleForDateMode = control.dataset.dateModeVisibility
      ? control.dataset.dateModeVisibility ===
        (item.dataset.dateMode || "fixed")
      : true;
    const isVisibleForBorderMode = control.dataset.borderDependent
      ? item.dataset.borderEnabled === "true"
      : true;

    control.hidden =
      !isVisibleForItem || !isVisibleForDateMode || !isVisibleForBorderMode;
  });
}

window.applyMainMenuControlVisibility = applyMainMenuControlVisibility;

// NOTE: Table Of Contents, And Page Ins/Rmv Rules
function getClearPageSides() {
  return PageControls.getClearPageSides();
}

function isStickerTextItemType(type) {
  return type === "sticker" || type === "page-flag" || type === "toc";
}

function isStickerTextItem(item) {
  return isStickerTextItemType(item?.dataset?.itemType);
}

function isPageFlagItem(item) {
  return item?.dataset?.itemType === "page-flag";
}

function isPageFlagOnCurrentSpread(item) {
  return (
    !isPageFlagItem(item) ||
    !item.dataset.pageId ||
    getItemSpreadIndex(item) === currentSpreadIndex
  );
}

function goToPageFlagItem(item) {
  if (
    !isPageFlagItem(item) ||
    !item.dataset.pageId ||
    isPageFlagOnCurrentSpread(item)
  ) {
    return false;
  }

  if (typeof finishAllTextEditing === "function") {
    finishAllTextEditing();
  }
  closeItemMenus();
  clearSelection();
  setFocusedPageNumber(getItemPageNumber(item));
  resetViewPanOffset();
  syncNotebookSpread();
  applyViewControls();
  return true;
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
  const yearDisplay =
    item.dataset.yearDisplay ||
    (item.dataset.yearVisible === "false" ? "none" : "full");
  const dateFormats =
    typeof getCalendarDateFormats === "function"
      ? getCalendarDateFormats(item)
      : {};
  const { month, year } =
    typeof getCalendarEffectiveMonthYear === "function"
      ? getCalendarEffectiveMonthYear(item)
      : {
          month: Number(item.dataset.month) || 0,
          year: Number(item.dataset.year) || new Date().getFullYear(),
        };
  const monthText =
    monthDisplay === "none" || typeof getCalendarMonthTitle !== "function"
      ? ""
      : getCalendarMonthTitle(
          month,
          dateFormats.monthFormat === "ddd" ? "short" : "full",
        );
  const yearText =
    yearDisplay === "none" || typeof getCalendarYearTitle !== "function"
      ? ""
      : getCalendarYearTitle(
          year,
          dateFormats.yearFormat === "yy" ? "short" : "full",
        );
  const title = [monthText, yearText].filter(Boolean).join(" ").trim();

  return title || "Full Month";
}

function getWidgetTextPartTocTitle(item, partName) {
  if (isFullMonthItem(item) && partName === "monthTitle") {
    return getFullMonthTocTitle(item);
  }

  const text = Array.from(
    item.querySelectorAll(`[data-theme-part="${partName}"]`),
  )
    .map((element) => element.textContent.trim())
    .find(Boolean);

  return text || getReadableTextPartName(partName);
}

function getTocTitleEntries() {
  const widgetTextEntries = getAllPlannerItems()
    .filter(
      (item) =>
        item.dataset.pageId && isPageNumberAvailable(getItemPageNumber(item)),
    )
    .flatMap((item) =>
      Array.from(
        new Set(
          Array.from(item.querySelectorAll("[data-theme-part]"))
            .map((part) => part.dataset.themePart)
            .filter(Boolean),
        ),
      )
        .filter((partName) =>
          getWidgetTextPartToc(item.dataset.itemType, partName),
        )
        .map((partName) => ({
          pageNumber: getItemPageNumber(item),
          title: getWidgetTextPartTocTitle(item, partName),
          sourceId: `${item.dataset.templateId}:${partName}`,
        })),
    )
    .filter((entry) => entry.title !== "");
  const uniqueEntries = [...widgetTextEntries, ...getManualTocEntries()].filter(
    (entry, index, entries) =>
      entries.findIndex(
        (candidate) =>
          candidate.pageNumber === entry.pageNumber &&
          getTocDisplayTitle(candidate.title) ===
            getTocDisplayTitle(entry.title),
      ) === index,
  );

  return uniqueEntries.sort(
    (first, second) => first.pageNumber - second.pageNumber,
  );
}

function getManualTocEntries() {
  const stickerEntries = getAllPlannerItems()
    .filter(
      (item) =>
        isStickerTextItem(item) &&
        item.dataset.pageId &&
        item.dataset.textAppearsInToc === "true" &&
        isPageNumberAvailable(getItemPageNumber(item)),
    )
    .map((item) => ({
      pageNumber: getItemPageNumber(item),
      title:
        getStickerTextElement(item)?.textContent?.trim() ||
        getReadableTextPartName(item.dataset.itemType),
    }))
    .filter((entry) => entry.title !== "");
  const calendarTextEntries = getAllPlannerItems()
    .filter(
      (item) =>
        typeof isCalendarTextItem === "function" &&
        isCalendarTextItem(item) &&
        item.dataset.pageId &&
        item.dataset.dayTextAppearsInToc === "true" &&
        isPageNumberAvailable(getItemPageNumber(item)),
    )
    .flatMap((item) =>
      Array.from(item.querySelectorAll(".calendar-day-text")).map(
        (textElement) => ({
          pageNumber: getItemPageNumber(item),
          title: textElement.textContent.trim(),
        }),
      ),
    )
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
    notifyTemplateChanged,
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
    notifyTemplateChanged,
  });
}

function clearFocusedPage() {
  PageControls.clearFocusedPage({
    clearItems,
    getFocusedPageItems: () => {
      const pageSides = new Set(getClearPageSides());

      return getAllPlannerItems().filter(
        (item) =>
          item.dataset.pageId &&
          getItemSpreadIndex(item) === currentSpreadIndex &&
          pageSides.has(item.dataset.pageId),
      );
    },
    notifyTemplateChanged,
  });
}

function clearCurrentBook() {
  PageControls.clearCurrentBook({
    clearCurrentBookItems,
    notifyTemplateChanged,
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
  window.dispatchEvent(
    new CustomEvent("perfectplanner:templatechange", {
      detail: serializePlannerTemplate(),
    }),
  );
}
