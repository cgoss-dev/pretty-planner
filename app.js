// Things The App Grabs From The HTML
const pages = Array.from(document.querySelectorAll("[data-page]"));
const plannerDesk = document.querySelector(".planner-desk");
const plannerMainMenu = document.querySelector("[data-planner-main-menu]");
const mainMenuToggleButton = document.querySelector("[data-main-menu-toggle]");
const controlPanel = document.querySelector(".control-panel");
const notebook = document.querySelector(".notebook");
const sourceItems = Array.from(document.querySelectorAll("[data-create-item]"));
const insertPageButton = document.querySelector("[data-insert-page]");
const deletePageButton = document.querySelector("[data-delete-page]");
const pageCountStatus = document.querySelector("[data-page-count-status]");
const clearBookButton = document.querySelector("[data-clear-book]");
const paperSelect = document.querySelector("[data-setting='paper']");
const paperColorSelect = document.querySelector("[data-setting='paper-color']");
const accentColorSelect = document.querySelector(
  "[data-setting='accent-color']",
);
const deskColorSelect = document.querySelector("[data-setting='desk-color']");
const palettePreviewSwatches = document.querySelector(
  "[data-palette-preview-swatches]",
);
const accentPaletteSwatches = document.querySelector(
  "[data-accent-palette-swatches]",
);
const keyboardControlsPanel = document.querySelector(
  "[data-keyboard-controls]",
);
const colorMatrixPopover = document.querySelector("[data-color-panel-matrix]");
const colorMatrixGrid = document.querySelector(
  "[data-color-panel-matrix-grid]",
);
const settingSelects = Array.from(
  document.querySelectorAll("[data-setting]"),
).filter(
  (select) =>
    !["paper", "grid", "paper-color", "accent-color", "desk-color"].includes(
      select.dataset.setting,
    ),
);
const guideInputs = Array.from(document.querySelectorAll("[data-guide]"));
const controlPanelTabs = Array.from(
  document.querySelectorAll("[data-control-panel-tab]"),
);
const controlPanelPages = Array.from(
  document.querySelectorAll("[data-control-panel-page]"),
);
const controlPanelStepButtons = Array.from(
  document.querySelectorAll("[data-control-panel-step]"),
);
const objectControlsShell = document.querySelector(
  "[data-object-controls-shell]",
);
const objectControlsEmpty = document.querySelector(
  "[data-object-controls-empty]",
);
const zoomToast = document.querySelector("[data-zoom-toast]");
const hintPanel = document.querySelector("[data-hint-panel]");
const defaultControls = Array.from(
  document.querySelectorAll("[data-default-control]"),
);
const defaultTextColorSwatches = document.querySelector(
  "[data-default-text-color-swatches]",
);
const dateOrderPicker = document.querySelector("[data-date-order-picker]");
const pageGridCursor = document.querySelector("[data-page-grid-cursor]");
const pageCornerFoldOverlay = document.createElement("div");
const pageCornerFoldOverlayNumber = document.createElement("span");
const controlChoiceInputs = Array.from(
  document.querySelectorAll("[data-control-choice]"),
);
let customSelectDetails = [];
const {
  app: appControls,
  calendar: calendarControls,
  colors: colorControls,
  guides: guideControls,
  items: widgetPanel,
  notebook: notebookControls,
  paper: paperControls,
  screenReferencePaper,
  storage: storageControls,
  text: textControls,
  view: viewControls,
} = PlannerRootControls.controls;
const singlePageViewportMaxWidth = appControls.singlePageViewportMaxWidth;
const singlePageViewportQuery = window.matchMedia(
  `(max-width: ${singlePageViewportMaxWidth}px)`,
);
const notebookViewportHeightReserve = appControls.notebookViewportHeightReserve;
const notebookViewportWidth = appControls.notebookViewportWidth;
const notebookMaxWidth = appControls.notebookMaxWidth;
const resizeEdgeSize = appControls.resizeEdgeSize;
const moveStartThreshold = appControls.moveStartThreshold;
const pageStickDepth = appControls.pageStickDepth;
const inchToCentimeters = appControls.inchToCentimeters;
const stickerGridUnits = widgetPanel.stickerGridUnits;
const tocLeftColumnGridUnits = widgetPanel.tocLeftColumnGridUnits;
const tocRightColumnMinGridUnits = widgetPanel.tocRightColumnMinGridUnits;
const perpetualCalendarMaxDayRows = widgetPanel.perpetualCalendarMaxDayRows;
const perpetualCalendarHeaderRows = widgetPanel.perpetualCalendarHeaderRows;
const perpetualCalendarLeftColumnGridUnits =
  widgetPanel.perpetualCalendarLeftColumnGridUnits;
const perpetualCalendarRightColumnMinGridUnits =
  widgetPanel.perpetualCalendarRightColumnMinGridUnits;
const itemGridUnits = widgetPanel.itemGridUnits;

const templateSchemaVersion = storageControls.templateSchemaVersion;
const plannerStorageKey = storageControls.plannerStorageKey;
const legacyPlannerStorageKey = storageControls.legacyPlannerStorageKey;
const plannerStateSchemaVersion = storageControls.plannerStateSchemaVersion;
const minNotebookPageCount = notebookControls.minPageCount;
const maxNotebookPageCount = notebookControls.maxPageCount;
const calendarMonthNames = calendarControls.monthNames;
const calendarYearRange = calendarControls.yearRange;
const viewZoomLevels = viewControls.zoomLevels;
const initialNotebookPageCount = notebookControls.initialPageCount;
const initialNotebookSpreadCount = notebookControls.initialSpreadCount;
let viewZoomIndex = 0;
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
const colorMatrixSteps = colorControls.colorMatrixSteps;
const paperColorPalette = paperControls.colorPalette;
const paperColors = {
  ...Object.fromEntries(paperColorPalette.map((color) => [color.key, color])),
  Custom: {
    key: "Custom",
    label: "Custom",
    display: "Hex",
    color: "#ffffff",
  },
};
const accentColorPalette = [
  {
    key: "Red",
    label: "Red",
    display: "F00",
    color: "var(--color-red)",
    ink: "var(--color-white)",
  },
  {
    key: "Orange",
    label: "Orange",
    display: "F40",
    color: "var(--color-orange)",
    ink: "var(--color-white)",
  },
  { key: "Amber", label: "Amber", display: "F80", color: "var(--color-amber)" },
  { key: "Gold", label: "Gold", display: "FC0", color: "var(--color-gold)" },
  {
    key: "Yellow",
    label: "Yellow",
    display: "FF0",
    color: "var(--color-yellow)",
  },
  { key: "Lime", label: "Lime", display: "8F0", color: "var(--color-lime)" },
  { key: "Green", label: "Green", display: "0F0", color: "var(--color-green)" },
  {
    key: "Sky",
    label: "Sky",
    display: "08F",
    color: "var(--color-sky)",
    ink: "var(--color-white)",
  },
  {
    key: "Blue",
    label: "Blue",
    display: "00F",
    color: "var(--color-blue)",
    ink: "var(--color-white)",
  },
  {
    key: "Violet",
    label: "Violet",
    display: "40F",
    color: "var(--color-violet)",
    ink: "var(--color-white)",
  },
  {
    key: "Purple",
    label: "Purple",
    display: "80F",
    color: "var(--color-purple)",
    ink: "var(--color-white)",
  },
  {
    key: "Magenta",
    label: "Magenta",
    display: "F0F",
    color: "var(--color-magenta)",
  },
];
const accentColors = {
  ...Object.fromEntries(accentColorPalette.map((color) => [color.key, color])),
  Custom: {
    key: "Custom",
    label: "Custom",
    display: "Hex",
    color: "#ff0000",
    ink: "var(--color-white)",
  },
};
const deskColors = colorControls.deskColors;
const textLineHeightCellOptions = textControls.lineHeightCellOptions;
const fixedWidgetLineColor = "#ccc";
const fixedWidgetLineWeight = "1";

let activeAction = null;
let selectedItem = null;
let selectedItems = new Set();
let nextTemplateItemId = 1;
let nextGroupId = 1;
let plannerClipboard = null;
let plannerAction = "browse";
let mainMenuContext = "root";
let lastMousePageTurnButton = null;
let lastMousePageTurnTime = 0;
let shouldSkipNextClear = false;
let shouldSkipNextItemClick = false;
let shouldSkipNextTabClick = false;
let keyboardCursor = {
  column: 1,
  row: 1,
  pageSide: "left",
  isInitialized: false,
};
let keyboardCursorIdleTimer = 0;
let isKeyboardCursorActive = false;
let hasUsedKeyboardCursor = false;
let widgetFocusItem = null;
let widgetFocusTarget = null;

pageCornerFoldOverlay.className = "page-corner-fold-overlay";
pageCornerFoldOverlayNumber.className = "page-corner-fold-overlay-number";
pageCornerFoldOverlay.append(pageCornerFoldOverlayNumber);
plannerDesk.append(pageCornerFoldOverlay);
let activeColorMatrixToggle = document.querySelector(
  "[data-color-panel-matrix-toggle]",
);
let activeHexTarget = null;
let isRestoringPlannerState = false;
const factoryPlannerDefaults = {
  hintPanel: "on",
  text: {
    size: "10",
    font: "annotation-mono",
    color: "var(--color-black)",
    bold: "false",
    italic: "false",
    underline: "false",
    strike: "false",
    align: "center",
    yAlign: "center",
    lineHeight: "1",
  },
  grid: {
    color: fixedWidgetLineColor,
    weight: fixedWidgetLineWeight,
    fill: "var(--color-white)",
    perimeter: {
      enabled: "true",
      color: fixedWidgetLineColor,
      weight: fixedWidgetLineWeight,
    },
    title: {
      enabled: "true",
      color: fixedWidgetLineColor,
      weight: fixedWidgetLineWeight,
    },
    bodyVertical: {
      enabled: "true",
      color: fixedWidgetLineColor,
      weight: fixedWidgetLineWeight,
    },
    bodyHorizontal: {
      enabled: "true",
      color: fixedWidgetLineColor,
      weight: fixedWidgetLineWeight,
    },
  },
  date: {
    weekStart: "monday",
    timeFormat: "24",
    dateOrder: ["month", "date", "year", "day"],
    yearFormat: "yyyy",
    monthFormat: "full",
    dayFormat: "ddd",
  },
  widgetTextStyles: {},
  widgetTextToc: {},
};

const dateOrderParts = [
  { key: "month", label: "Month" },
  { key: "date", label: "Date" },
  { key: "year", label: "Year" },
  { key: "day", label: "Day" },
];

function normalizeDateOrder(order) {
  const validKeys = dateOrderParts.map((part) => part.key);
  const orderedKeys = Array.isArray(order)
    ? order
    : String(order || "").split(",");
  const uniqueKeys = [];

  orderedKeys.forEach((key) => {
    if (validKeys.includes(key) && !uniqueKeys.includes(key)) {
      uniqueKeys.push(key);
    }
  });
  validKeys.forEach((key) => {
    if (!uniqueKeys.includes(key)) {
      uniqueKeys.push(key);
    }
  });

  return uniqueKeys;
}

function normalizeDateYearFormat(format) {
  return format === "yy" ? "yy" : "yyyy";
}

function normalizeDateMonthFormat(format) {
  return format === "ddd" ? "ddd" : "full";
}

function normalizeDateDayFormat(format) {
  return format === "full" ? "full" : "ddd";
}

let plannerDefaultSettings = getNormalizedPlannerDefaults();

function normalizeGridLineDefaults(lineDefaults = {}, fallback = {}) {
  return {
    enabled: "true",
    color: fixedWidgetLineColor,
    weight: fixedWidgetLineWeight,
  };
}

function getNormalizedPlannerDefaults(defaults = {}) {
  const dateDefaults =
    defaults.date && typeof defaults.date === "object" ? defaults.date : {};
  const widgetTextStyles =
    defaults.widgetTextStyles && typeof defaults.widgetTextStyles === "object"
      ? defaults.widgetTextStyles
      : {};

  return {
    hintPanel:
      defaults.hintPanel === "off" ? "off" : factoryPlannerDefaults.hintPanel,
    text: { ...factoryPlannerDefaults.text },
    grid: (() => {
      const gridDefaults =
        defaults.grid && typeof defaults.grid === "object" ? defaults.grid : {};
      const fallbackLine = {
        enabled: String(
          Number(gridDefaults.weight ?? factoryPlannerDefaults.grid.weight) > 0,
        ),
        color: gridDefaults.color || factoryPlannerDefaults.grid.color,
        weight: gridDefaults.weight || factoryPlannerDefaults.grid.weight,
      };

      return {
        ...factoryPlannerDefaults.grid,
        ...gridDefaults,
        color: fixedWidgetLineColor,
        weight: fixedWidgetLineWeight,
        perimeter: normalizeGridLineDefaults(
          gridDefaults.perimeter,
          fallbackLine,
        ),
        title: normalizeGridLineDefaults(gridDefaults.title, fallbackLine),
        bodyVertical: normalizeGridLineDefaults(
          gridDefaults.bodyVertical,
          fallbackLine,
        ),
        bodyHorizontal: normalizeGridLineDefaults(
          gridDefaults.bodyHorizontal,
          fallbackLine,
        ),
      };
    })(),
    date: {
      ...factoryPlannerDefaults.date,
      ...dateDefaults,
      dateOrder: normalizeDateOrder(
        dateDefaults.dateOrder || factoryPlannerDefaults.date.dateOrder,
      ),
      yearFormat: normalizeDateYearFormat(
        dateDefaults.yearFormat || factoryPlannerDefaults.date.yearFormat,
      ),
      monthFormat: normalizeDateMonthFormat(
        dateDefaults.monthFormat || factoryPlannerDefaults.date.monthFormat,
      ),
      dayFormat: normalizeDateDayFormat(
        dateDefaults.dayFormat || factoryPlannerDefaults.date.dayFormat,
      ),
    },
    widgetTextStyles,
    widgetTextToc:
      defaults.widgetTextToc && typeof defaults.widgetTextToc === "object"
        ? defaults.widgetTextToc
        : {},
  };
}

function serializePlannerDefaults() {
  return JSON.parse(JSON.stringify(plannerDefaultSettings));
}

function restorePlannerDefaults(defaults) {
  plannerDefaultSettings = getNormalizedPlannerDefaults(defaults);
}

function getPlannerDefaultTextSettings(overrides = {}) {
  return {
    ...plannerDefaultSettings.text,
    ...overrides,
  };
}

function getPlannerWidgetTextPartStyle(type, partName) {
  return plannerDefaultSettings.widgetTextStyles?.[type]?.[partName] || null;
}

function setPlannerWidgetTextPartStyle(type, partName, style = {}) {
  if (
    !plannerDefaultSettings.widgetTextStyles ||
    typeof plannerDefaultSettings.widgetTextStyles !== "object"
  ) {
    plannerDefaultSettings.widgetTextStyles = {};
  }
  if (!plannerDefaultSettings.widgetTextStyles[type]) {
    plannerDefaultSettings.widgetTextStyles[type] = {};
  }
  plannerDefaultSettings.widgetTextStyles[type][partName] = {
    ...(plannerDefaultSettings.widgetTextStyles[type][partName] || {}),
    ...style,
  };
}

function getPlannerWidgetTextPartToc(type, partName) {
  return plannerDefaultSettings.widgetTextToc?.[type]?.[partName] || "";
}

function setPlannerWidgetTextPartToc(type, partName, appearsInToc) {
  if (
    !plannerDefaultSettings.widgetTextToc ||
    typeof plannerDefaultSettings.widgetTextToc !== "object"
  ) {
    plannerDefaultSettings.widgetTextToc = {};
  }
  if (!plannerDefaultSettings.widgetTextToc[type]) {
    plannerDefaultSettings.widgetTextToc[type] = {};
  }
  plannerDefaultSettings.widgetTextToc[type][partName] = appearsInToc
    ? "true"
    : "false";
}

function getPlannerWidgetControls(type) {
  return widgetPanel.widgetControls?.[type] || {};
}

function isPlannerWidgetControlVisible(type, controlKey) {
  const controls = getPlannerWidgetControls(type);

  return (
    Object.prototype.hasOwnProperty.call(controls, controlKey) &&
    controls[controlKey] !== false
  );
}

window.getPlannerDefaultTextSettings = getPlannerDefaultTextSettings;
window.getPlannerWidgetTextPartStyle = getPlannerWidgetTextPartStyle;
window.setPlannerWidgetTextPartStyle = setPlannerWidgetTextPartStyle;
window.getPlannerWidgetTextPartToc = getPlannerWidgetTextPartToc;
window.setPlannerWidgetTextPartToc = setPlannerWidgetTextPartToc;
window.getPlannerWidgetControls = getPlannerWidgetControls;
window.isPlannerWidgetControlVisible = isPlannerWidgetControlVisible;

function getPlannerDefaultItemStyle(type = "sticker") {
  return {
    fillColor: plannerDefaultSettings.grid.fill,
    borderColor: fixedWidgetLineColor,
    borderWidth: fixedWidgetLineWeight,
    borderEnabled: "true",
  };
}

function getPlannerDefaultGridSettings() {
  return {
    ...plannerDefaultSettings.grid,
  };
}

function getPlannerDefaultDateSettings() {
  return {
    ...plannerDefaultSettings.date,
  };
}

function applyPlannerDefaultsToThemeWidgets() {
  getAllPlannerItems().forEach((item) => {
    applyThemeToWidget(item);
    if (isCalendarItem(item)) {
      applyCalendarPartStyles(item);
    }
  });
  renderTocWidgets();
}

function applyPlannerDefaultsToDateWidgets() {
  if (typeof setCalendarWidgetSettings !== "function") {
    return;
  }

  getAllPlannerItems()
    .filter((item) => isCalendarItem(item))
    .forEach((item) => {
      setCalendarWidgetSettings(item, getPlannerDefaultDateSettings());
    });
}

function applyHintPanelVisibility() {
  if (hintPanel) {
    hintPanel.hidden =
      plannerDefaultSettings.hintPanel === "off" &&
      !plannerMainMenu?.contains(hintPanel);
  }
}

function setDefaultControlValue(controlName, value) {
  if (controlName === "hint-panel") {
    plannerDefaultSettings.hintPanel = value === "off" ? "off" : "on";
    applyHintPanelVisibility();
    return;
  }

  const textMap = {
    "text-size": ["text", "size"],
    "text-font": ["text", "font"],
    "text-color": ["text", "color"],
    "body-text-font": ["text", "font"],
    "body-text-size": ["text", "size"],
    "body-text-color": ["text", "color"],
  };
  const dateMap = {
    "date-week-start": "weekStart",
    "date-time-format": "timeFormat",
    "date-year-format": "yearFormat",
    "date-month-format": "monthFormat",
    "date-day-format": "dayFormat",
  };

  if (Array.isArray(textMap[controlName])) {
    const [groupName, key] = textMap[controlName];

    plannerDefaultSettings[groupName][key] = value;
  } else if (dateMap[controlName]) {
    plannerDefaultSettings.date[dateMap[controlName]] = value;
    applyPlannerDefaultsToDateWidgets();
    return;
  }
  applyPlannerDefaultsToThemeWidgets();
}

function setDefaultDateOrder(order) {
  plannerDefaultSettings.date.dateOrder = normalizeDateOrder(order);
  renderDateOrderPicker();
  applyPlannerDefaultsToDateWidgets();
}

function toggleDefaultTextStyle(controlName, button) {
  const textMap = {
    "text-bold": ["text", "bold"],
    "text-italic": ["text", "italic"],
    "text-underline": ["text", "underline"],
    "text-strike": ["text", "strike"],
    "body-text-bold": ["text", "bold"],
    "body-text-italic": ["text", "italic"],
    "body-text-underline": ["text", "underline"],
    "body-text-strike": ["text", "strike"],
  };
  const textControl = textMap[controlName];

  if (!textControl) {
    return;
  }

  const [groupName, key] = textControl;
  const nextValue =
    plannerDefaultSettings[groupName][key] === "true" ? "false" : "true";

  plannerDefaultSettings[groupName][key] = nextValue;
  button.setAttribute("aria-pressed", String(nextValue === "true"));
  button.classList.toggle("is-active", nextValue === "true");
  applyPlannerDefaultsToThemeWidgets();
}

function syncDefaultControls() {
  defaultControls.forEach((control) => {
    const name = control.dataset.defaultControl;

    if (name === "hint-panel") {
      control.checked = control.value === plannerDefaultSettings.hintPanel;
    } else if (name === "text-size" || name === "body-text-size") {
      control.value = plannerDefaultSettings.text.size;
    } else if (name === "text-font" || name === "body-text-font") {
      control.value = plannerDefaultSettings.text.font;
      updateCustomSelectDisplay(control);
    } else if (name === "text-color" || name === "body-text-color") {
      setPaletteControlValue(
        control,
        defaultTextColorSwatches,
        plannerDefaultSettings.text.color,
      );
    } else if (name === "date-week-start") {
      control.value = plannerDefaultSettings.date.weekStart;
      updateCustomSelectDisplay(control);
    } else if (name === "date-time-format") {
      control.value = plannerDefaultSettings.date.timeFormat;
      updateCustomSelectDisplay(control);
    } else if (name === "date-year-format") {
      control.checked =
        control.value === plannerDefaultSettings.date.yearFormat;
    } else if (name === "date-month-format") {
      control.checked =
        control.value === plannerDefaultSettings.date.monthFormat;
    } else if (name === "date-day-format") {
      control.checked = control.value === plannerDefaultSettings.date.dayFormat;
    } else if (name.startsWith("body-text-") || name.startsWith("text-")) {
      const settings = plannerDefaultSettings.text;
      const styleName = name.replace("body-text-", "").replace("text-", "");
      const key = styleName === "strike" ? "strike" : styleName;
      const isActive = settings[key] === "true";

      control.setAttribute("aria-pressed", String(isActive));
      control.classList.toggle("is-active", isActive);
    }
  });
  renderDateOrderPicker();
  applyHintPanelVisibility();
}

function moveDateOrderPart(sourceKey, targetKey) {
  const currentOrder = normalizeDateOrder(
    plannerDefaultSettings.date.dateOrder,
  );
  const sourceIndex = currentOrder.indexOf(sourceKey);
  const targetIndex = currentOrder.indexOf(targetKey);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return;
  }

  const nextOrder = [...currentOrder];
  const [part] = nextOrder.splice(sourceIndex, 1);

  nextOrder.splice(targetIndex, 0, part);
  setDefaultDateOrder(nextOrder);
  savePlannerState();
}

function renderDateOrderPicker() {
  if (!dateOrderPicker) {
    return;
  }

  const order = normalizeDateOrder(plannerDefaultSettings.date.dateOrder);

  dateOrderPicker.replaceChildren();
  order.forEach((key, index) => {
    const part = dateOrderParts.find((entry) => entry.key === key);
    const button = document.createElement("button");

    button.className = "date-order-chip";
    button.type = "button";
    button.draggable = true;
    button.dataset.dateOrderPart = key;
    button.textContent = part?.label || key;
    button.setAttribute(
      "aria-label",
      `${button.textContent} date part. Drag to reorder.`,
    );
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", key);
      button.classList.add("is-dragging");
    });
    button.addEventListener("dragend", () => {
      button.classList.remove("is-dragging");
      dateOrderPicker
        .querySelectorAll(".date-order-chip")
        .forEach((chip) => chip.classList.remove("is-drop-target"));
    });
    button.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      button.classList.add("is-drop-target");
    });
    button.addEventListener("dragleave", () => {
      button.classList.remove("is-drop-target");
    });
    button.addEventListener("drop", (event) => {
      event.preventDefault();
      button.classList.remove("is-drop-target");
      moveDateOrderPart(event.dataTransfer.getData("text/plain"), key);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      const targetKey = order[clamp(index + direction, 0, order.length - 1)];

      moveDateOrderPart(key, targetKey);
    });
    dateOrderPicker.append(button);
  });
}

function convertLength(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) {
    return value;
  }

  return fromUnit === "in"
    ? value * inchToCentimeters
    : value / inchToCentimeters;
}
