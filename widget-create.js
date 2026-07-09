// NOTE: Build New Items And Their Option Controls
function makePlannerItem(type = "sticker") {
  const hasWidgetControls = type === "sticker" || isCalendarItemType(type);
  const item = document.createElement("div");
  const sizeLabel = document.createElement("span");
  const pageFlagShape = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg",
  );
  const pageFlagShapePath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  const controls = document.createElement("div");
  const controlTabs = document.createElement("div");
  const textPanelTitle = document.createElement("div");
  const widgetPanelSectionTitle = document.createElement("div");
  const actionsTab = document.createElement("button");
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
  const layoutActionGroup = document.createElement("div");
  const layoutActionTitle = document.createElement("div");
  const textPanel = document.createElement("div");
  const widgetPanel = document.createElement("div");
  const calendarAttributesGrid = document.createElement("div");
  const duplicateButton = document.createElement("button");
  const sequenceButton = document.createElement("button");
  const duplicateGroupActions = document.createElement("div");
  const groupActions = document.createElement("div");
  const groupButton = document.createElement("button");
  const layerButtonGroup = document.createElement("div");
  const bringForwardButton = document.createElement("button");
  const sendBackwardButton = document.createElement("button");
  const fillLabel = document.createElement("label");
  const fillTitle = document.createElement("span");
  const fillInput = document.createElement("select");
  const fillSwatches = document.createElement("div");
  const borderToggleLabel = document.createElement("label");
  const borderToggleInput = document.createElement("input");
  const borderSizeLabel = document.createElement("div");
  const borderSizeTitle = document.createElement("span");
  const borderSizeGroup = document.createElement("div");
  const borderColorLabel = document.createElement("label");
  const borderColorTitle = document.createElement("span");
  const borderColorInput = document.createElement("select");
  const borderColorSwatches = document.createElement("div");
  const textElement = document.createElement("div");
  const tocElement = document.createElement("div");
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
  const textFormatOptions = document.createElement("div");
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
  const dateOffsetStepper = document.createElement("div");
  const dateOffsetPrevButton = document.createElement("button");
  const dateOffsetInput = document.createElement("input");
  const dateOffsetNextButton = document.createElement("button");
  const calendarSizeLabel = document.createElement("div");
  const calendarSizeOptions = document.createElement("div");
  const monthVisibleLabel = document.createElement("label");
  const monthVisibleInput = document.createElement("input");
  const yearVisibleLabel = document.createElement("label");
  const yearVisibleInput = document.createElement("input");
  const monthLabel = document.createElement("label");
  const monthSelect = document.createElement("select");
  const yearLabel = document.createElement("label");
  const yearSelect = document.createElement("select");
  const startDayLabel = document.createElement("label");
  const startDaySelect = document.createElement("select");
  const visibleDaysLabel = document.createElement("div");
  const visibleDaysSelect = document.createElement("select");
  const diaryLayoutLabel = document.createElement("label");
  const diaryLayoutSelect = document.createElement("select");
  const diaryTitleLinesLabel = document.createElement("label");
  const diaryTitleLinesSelect = document.createElement("select");
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
  if (type === "page-flag") {
    item.dataset.pageFlagSide = "right";
  }
  item.tabIndex = 0;
  item.setAttribute("role", "button");
  item.setAttribute("aria-label", getItemAriaLabel(type));
  pageFlagShape.classList.add("page-flag-shape");
  pageFlagShape.setAttribute("aria-hidden", "true");
  pageFlagShape.setAttribute("focusable", "false");
  pageFlagShape.setAttribute("preserveAspectRatio", "none");
  pageFlagShapePath.classList.add("page-flag-shape-path");
  pageFlagShape.append(pageFlagShapePath);

  sizeLabel.className = "item-size-label";
  sizeLabel.setAttribute("aria-hidden", "true");
  controls.className = `widget-panel widget-panel-${type}`;
  controls.dataset.ownerId = item.dataset.templateId;
  controls.setAttribute("role", "menu");
  controlTabs.className = "widget-panel-tabs";
  controlTabs.setAttribute("role", "tablist");
  actionsTab.className = "widget-panel-tab";
  actionsTab.type = "button";
  actionsTab.textContent = "Actions";
  actionsTab.dataset.widgetPanelTab = "actions";
  actionsTab.setAttribute("role", "tab");
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
  layoutActionGroup.className = "item-layout-action-group";
  layoutActionGroup.setAttribute("aria-label", "Layout actions");
  layoutActionTitle.className = "item-actions-section-title section-title";
  layoutActionTitle.textContent = "Layout";
  displayDateRow.className = "item-calendar-display-row";
  displayYearLabel.className = "item-calendar-display-control";
  displayYearLabel.dataset.mainMenuControl = "options.display-year";
  setControlTitle(displayYearLabel, "Year");
  displayYearSelect.dataset.widgetControl = "display-year";
  displayYearSelect.setAttribute("aria-label", "Display year");
  for (
    let year = calendarYearRange.start;
    year <= calendarYearRange.end;
    year += 1
  ) {
    const option = document.createElement("option");

    option.value = String(year);
    option.textContent = String(year);
    displayYearSelect.append(option);
  }
  displayMonthLabel.className = "item-calendar-display-control";
  displayMonthLabel.dataset.mainMenuControl = "options.display-month";
  displayMonthLabel.dataset.dateModeVisibility = "fixed";
  setControlTitle(displayMonthLabel, "Month");
  displayMonthSelect.dataset.widgetControl = "display-month";
  displayMonthSelect.setAttribute("aria-label", "Display month");
  calendarMonthNames.forEach((monthName, index) => {
    const option = document.createElement("option");

    option.value = String(index);
    option.textContent = monthName;
    displayMonthSelect.append(option);
  });
  displayDateModeLabel.className = "item-calendar-display-control";
  displayDateModeLabel.dataset.mainMenuControl = "options.display-date-mode";
  setControlTitle(displayDateModeLabel, ["Date", "Type"]);
  displayDateModeSelect.dataset.widgetControl = "display-date-mode";
  displayDateModeSelect.setAttribute("aria-label", "Display date mode");
  [
    ["fixed", "Actual"],
    ["relative", "Current"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    displayDateModeSelect.append(option);
  });
  displayDayLabel.className = "item-calendar-display-control";
  displayDayLabel.dataset.mainMenuControl = "options.display-day";
  setControlTitle(
    displayDayLabel,
    type === "diary-view" ? ["Week", "#"] : "Day",
  );
  displayDaySelect.dataset.widgetControl = "display-day";
  displayDaySelect.setAttribute(
    "aria-label",
    type === "diary-view" ? "Display week number" : "Display start day",
  );
  syncStartDayOptions(
    displayDaySelect,
    new Date().getFullYear(),
    new Date().getMonth(),
    "1",
  );
  displayWeekNumberLabel.className = "item-calendar-display-control";
  displayWeekNumberLabel.dataset.mainMenuControl =
    "options.display-week-number";
  setControlTitle(displayWeekNumberLabel, ["Week", "#"]);
  displayWeekNumberSelect.dataset.widgetControl = "display-week-number";
  displayWeekNumberSelect.setAttribute("aria-label", "Display week numbers");
  [
    ["off", "Off"],
    ["on", "On"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    displayWeekNumberSelect.append(option);
  });
  displayTitleVisibleLabel.className = "item-calendar-display-control";
  displayTitleVisibleLabel.dataset.mainMenuControl =
    "options.display-title-visible";
  setControlTitle(displayTitleVisibleLabel, ["Month", "Year"]);
  displayTitleVisibleSelect.dataset.widgetControl = "display-title-visible";
  displayTitleVisibleSelect.setAttribute(
    "aria-label",
    "Display month and year row",
  );
  [
    ["true", "On"],
    ["false", "Off"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    displayTitleVisibleSelect.append(option);
  });
  displayWeekStartLabel.className = "item-calendar-display-control";
  displayWeekStartLabel.dataset.mainMenuControl = "options.display-week-start";
  setControlTitle(displayWeekStartLabel, ["Week", "Start"]);
  displayWeekStartSelect.dataset.widgetControl = "display-week-start";
  displayWeekStartSelect.setAttribute("aria-label", "Display week start");
  [
    ["monday", "Mon"],
    ["sunday", "Sun"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    displayWeekStartSelect.append(option);
  });
  textPanel.className = "widget-panel-page text-panel";
  textPanel.dataset.textPanel = "true";
  textPanel.dataset.widgetPanelPage = "text";
  textPanel.setAttribute("role", "tabpanel");
  textPanelTitle.className = "widget-panel-section-title section-title";
  textPanelTitle.textContent = "Text";
  widgetPanel.className = "widget-panel-page widget-options-panel";
  widgetPanel.dataset.widgetPanelPage = "widget";
  widgetPanel.setAttribute("role", "tabpanel");
  widgetPanelSectionTitle.className =
    "widget-panel-section-title section-title";
  widgetPanelSectionTitle.textContent = "Options";
  calendarAttributesGrid.className = "item-calendar-attributes-grid";
  duplicateButton.className = "widget-panel-button";
  duplicateButton.type = "button";
  duplicateButton.textContent = "Duplicate";
  duplicateButton.dataset.mainMenuControl = "popup.duplicate";
  duplicateButton.setAttribute("aria-label", "Duplicate sticker");
  duplicateGroupActions.className = "item-action-row";
  sequenceButton.className = "widget-panel-button";
  sequenceButton.type = "button";
  sequenceButton.textContent = "Sequence";
  sequenceButton.dataset.mainMenuControl = "popup.sequence";
  sequenceButton.setAttribute("aria-label", "Duplicate and sequence sticker");
  groupActions.className = "item-action-row item-single-action-row";
  groupButton.className = "widget-panel-button";
  groupButton.type = "button";
  groupButton.textContent = "Group";
  groupButton.dataset.widgetAction = "group";
  groupButton.dataset.mainMenuControl = "popup.group";
  groupButton.setAttribute("aria-label", "Group selected stickers");
  layerButtonGroup.className = "item-layer-actions";
  bringForwardButton.className = "widget-panel-button";
  bringForwardButton.type = "button";
  bringForwardButton.textContent = "Bring Fwd";
  bringForwardButton.dataset.mainMenuControl = "popup.bring-forward";
  bringForwardButton.setAttribute("aria-label", "Bring selected item forward");
  sendBackwardButton.className = "widget-panel-button";
  sendBackwardButton.type = "button";
  sendBackwardButton.textContent = "Send Bwd";
  sendBackwardButton.dataset.mainMenuControl = "popup.send-backward";
  sendBackwardButton.setAttribute("aria-label", "Send selected item backward");
  fillLabel.className = "widget-panel-row color-panel-control";
  fillLabel.dataset.mainMenuControl = "text.fill";
  fillTitle.className = "widget-panel-title";
  setControlTitle(fillTitle, "Fill");
  fillInput.className = "native-select";
  fillInput.dataset.styleControl = "fill";
  fillInput.setAttribute("aria-label", "Sticker fill palette");
  fillSwatches.className = "color-panel-swatches";
  fillSwatches.dataset.styleSwatches = "fill";
  borderToggleLabel.className = "widget-panel-row text-panel-control";
  borderToggleLabel.dataset.mainMenuControl = "text.border";
  setControlTitle(borderToggleLabel, "Borders");
  borderToggleInput.type = "checkbox";
  borderToggleInput.dataset.styleControl = "border-enabled";
  borderToggleInput.setAttribute("aria-label", "Show widget borders");
  borderSizeLabel.className =
    "widget-panel-row text-panel-control text-panel-size-control";
  borderSizeLabel.dataset.mainMenuControl = "text.border-size";
  borderSizeLabel.dataset.borderDependent = "true";
  borderSizeTitle.className = "widget-panel-title";
  setControlTitle(borderSizeTitle, ["Border", "Size"]);
  borderSizeGroup.className = "text-panel-size-options";
  borderSizeGroup.setAttribute("role", "group");
  borderSizeGroup.setAttribute("aria-label", "Widget border size");
  [
    ["1", "1px"],
    ["3", "3px"],
    ["5", "5px"],
  ].forEach(([value, label]) => {
    const button = document.createElement("button");

    button.className = "text-panel-size-button";
    button.type = "button";
    button.textContent = label;
    button.dataset.borderWidthValue = value;
    button.setAttribute("aria-label", `${label} border size`);
    button.setAttribute("aria-pressed", "false");
    borderSizeGroup.append(button);
  });
  borderColorLabel.className =
    "widget-panel-row text-panel-control color-panel-control";
  borderColorLabel.dataset.mainMenuControl = "text.border-color";
  borderColorLabel.dataset.borderDependent = "true";
  borderColorTitle.className = "widget-panel-title";
  setControlTitle(borderColorTitle, ["Border", "Color"]);
  borderColorInput.className = "native-select";
  borderColorInput.dataset.styleControl = "border-color";
  borderColorInput.setAttribute("aria-label", "Widget border palette");
  borderColorSwatches.className = "color-panel-swatches";
  borderColorSwatches.dataset.styleSwatches = "border-color";
  textElement.className = "sticker-text";
  textElement.dataset.themePart = "text";
  textElement.hidden = true;
  textElement.spellcheck = true;
  textElement.setAttribute("contenteditable", "false");
  textElement.setAttribute("aria-label", "Sticker text");
  tocElement.className = "toc-widget";
  textToggleLabel.className =
    "widget-panel-row text-panel-control text-panel-settings-control";
  textToggleLabel.dataset.mainMenuControl = "text.font";
  textTitle.className = "widget-panel-title";
  setControlTitle(textTitle, "Typeface");
  textSizeLabel.className =
    "widget-panel-row text-panel-control text-panel-size-control";
  textSizeLabel.dataset.mainMenuControl = "text.size";
  textSizeTitle.className = "widget-panel-title";
  setControlTitle(textSizeTitle, ["Text", "Size"]);
  textSizeGroup.className = "text-panel-size-options";
  textSizeGroup.setAttribute("role", "group");
  textSizeGroup.setAttribute("aria-label", "Sticker text size");
  [
    ["10", "SM: 10px"],
    ["15", "MD: 15px"],
    ["30", "LG: 30px"],
    ["60", "1X: 60px"],
    ["90", "2X: 90px"],
    ["120", "3X: 120px"],
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
    ["serif", "Standard Serif"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    textFontSelect.append(option);
  });
  textColorLabel.className =
    "widget-panel-row text-panel-control color-panel-control";
  textColorLabel.dataset.mainMenuControl = "text.color";
  textColorTitle.className = "widget-panel-title";
  setControlTitle(textColorTitle, ["Text", "Color"]);
  textColorInput.className = "native-select";
  textColorInput.dataset.textControl = "color";
  textColorInput.setAttribute("aria-label", "Sticker text palette");
  textColorSwatches.className = "color-panel-swatches";
  textColorSwatches.dataset.textSwatches = "color";
  textTocLabel.className =
    "widget-panel-row text-panel-control text-panel-toc-control";
  textTocLabel.dataset.mainMenuControl = "options.appears-in-toc";
  setControlTitle(textTocLabel, ["Appears", "in ToC"]);
  textTocInput.type = "checkbox";
  textTocInput.dataset.textControl = "appears-in-toc";
  textTocInput.setAttribute(
    "aria-label",
    "Selected text appears in Table of Contents",
  );
  textFormatGroup.className = "text-panel-format text-panel-control";
  textFormatGroup.dataset.mainMenuControl = "text.style";
  textFormatTitle.className = "widget-panel-title";
  setControlTitle(textFormatTitle, ["Text", "Style"]);
  textFormatOptions.className = "text-panel-style-options";
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
  textUnderlineInput.className =
    "text-panel-toggle text-panel-toggle-underline";
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
  textAlignLabel.className =
    "widget-panel-row text-panel-control text-panel-align-control";
  textAlignLabel.dataset.mainMenuControl = "text.align";
  textAlignTitle.className = "widget-panel-title";
  setControlTitle(textAlignTitle, "Alignment");
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
    ["bottom", "Bottom"],
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
    ["bottom", "right"],
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
  textLineHeightLabel.className =
    "widget-panel-row text-panel-control text-panel-size-control";
  textLineHeightLabel.dataset.mainMenuControl = "text.line-height";
  setControlTitle(textLineHeightLabel, ["Line", "Height"]);
  textLineHeightSelect.dataset.textControl = "line-height";
  textLineHeightSelect.setAttribute(
    "aria-label",
    "Text line height in grid cells",
  );
  textLineHeightCellOptions.forEach((value) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = value;
    textLineHeightSelect.append(option);
  });
  deleteButton.className = "widget-panel-button widget-panel-danger";
  deleteButton.type = "button";
  deleteButton.textContent = "Delete";
  deleteButton.dataset.mainMenuControl = "popup.delete";
  deleteButton.setAttribute("aria-label", "Delete planner item");
  weekNumberLabel.className = "widget-panel-row widget-option-control";
  weekNumberLabel.dataset.mainMenuControl = "options.week-number-format";
  setControlTitle(weekNumberLabel, ["Show", "Week #"]);
  weekNumberInput.type = "checkbox";
  weekNumberInput.dataset.widgetControl = "week-number-format";
  weekNumberInput.setAttribute("aria-label", "Show week number column");
  weekStartLabel.className = "widget-panel-row widget-option-control";
  weekStartLabel.dataset.mainMenuControl = "options.week-start";
  setControlTitle(weekStartLabel, ["Week", "Start"]);
  weekStartSelect.dataset.widgetControl = "week-start";
  weekStartSelect.setAttribute("aria-label", "Calendar week start");
  ["monday", "sunday"].forEach((value) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = value[0].toUpperCase() + value.slice(1);
    weekStartSelect.append(option);
  });
  weekdayLabelLabel.className = "widget-panel-row widget-option-control";
  weekdayLabelLabel.dataset.mainMenuControl = "options.weekday-label-format";
  setControlTitle(weekdayLabelLabel, "Weekdays");
  weekdayLabelSelect.dataset.widgetControl = "weekday-label-format";
  weekdayLabelSelect.setAttribute("aria-label", "Weekday label format");
  [
    ["d", "d"],
    ["ddd", "ddd"],
    ["full", "full"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    weekdayLabelSelect.append(option);
  });
  dateModeLabel.className = "widget-panel-row widget-option-control";
  dateModeLabel.dataset.mainMenuControl = "options.date-mode";
  setControlTitle(dateModeLabel, ["Display", "Date"]);
  dateModeSelect.dataset.widgetControl = "date-mode";
  dateModeSelect.setAttribute("aria-label", "Calendar display date mode");
  [
    ["fixed", "Actual"],
    ["relative", "Current"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    dateModeSelect.append(option);
  });
  dateOffsetLabel.className = "widget-panel-row widget-option-control";
  dateOffsetLabel.dataset.mainMenuControl = "options.date-offset";
  dateOffsetLabel.dataset.dateModeVisibility = "relative";
  setControlTitle(dateOffsetLabel, "Offset");
  dateOffsetStepper.className = "date-offset-stepper";
  dateOffsetPrevButton.className =
    "date-offset-stepper-button date-offset-stepper-button-prev";
  dateOffsetPrevButton.type = "button";
  dateOffsetPrevButton.textContent = "‹";
  dateOffsetPrevButton.setAttribute("aria-label", "Decrease current offset");
  dateOffsetInput.type = "text";
  dateOffsetInput.inputMode = "numeric";
  dateOffsetInput.pattern = "-?[0-9]*";
  dateOffsetInput.dataset.widgetControl = "date-offset";
  dateOffsetInput.setAttribute("aria-label", "Calendar current date offset");
  syncRelativeDateOffsetInput(
    dateOffsetInput,
    getCalendarRelativeDateUnit(item),
    "0",
  );
  dateOffsetNextButton.className =
    "date-offset-stepper-button date-offset-stepper-button-next";
  dateOffsetNextButton.type = "button";
  dateOffsetNextButton.textContent = "›";
  dateOffsetNextButton.setAttribute("aria-label", "Increase current offset");
  calendarSizeLabel.className =
    "widget-panel-row widget-option-control calendar-size-control";
  calendarSizeLabel.dataset.mainMenuControl = "options.page-size";
  setControlTitle(calendarSizeLabel, "Size");
  calendarSizeOptions.className = "calendar-size-options";
  calendarSizeOptions.setAttribute("role", "group");
  calendarSizeOptions.setAttribute("aria-label", "Calendar size");
  [
    ["one-page", "One Page"],
    ["both-pages", "Both Pages"],
  ].forEach(([value, label]) => {
    const button = document.createElement("button");

    button.className = "calendar-size-button";
    button.type = "button";
    button.textContent = label;
    button.dataset.calendarPageSize = value;
    button.setAttribute("aria-label", `${label} calendar size`);
    button.setAttribute("aria-pressed", "false");
    calendarSizeOptions.append(button);
  });
  monthVisibleLabel.className = "widget-panel-row widget-option-control";
  monthVisibleLabel.dataset.mainMenuControl = "options.display-month";
  setControlTitle(monthVisibleLabel, ["Show", "Month"]);
  monthVisibleInput.type = "checkbox";
  monthVisibleInput.dataset.widgetControl = "month-visible";
  monthVisibleInput.setAttribute("aria-label", "Show month");
  monthVisibleInput.checked = true;
  yearVisibleLabel.className = "widget-panel-row widget-option-control";
  yearVisibleLabel.dataset.mainMenuControl = "options.display-year";
  setControlTitle(yearVisibleLabel, ["Show", "Year"]);
  yearVisibleInput.type = "checkbox";
  yearVisibleInput.dataset.widgetControl = "year-visible";
  yearVisibleInput.setAttribute("aria-label", "Show year");
  yearVisibleInput.checked = true;
  monthLabel.className = "widget-panel-row widget-option-control";
  monthLabel.dataset.mainMenuControl = "options.month";
  monthLabel.dataset.dateModeVisibility = "fixed";
  setControlTitle(monthLabel, "Month");
  monthSelect.dataset.widgetControl = "month";
  monthSelect.setAttribute("aria-label", "Calendar month");
  calendarMonthNames.forEach((monthName, index) => {
    const option = document.createElement("option");

    option.value = String(index);
    option.textContent = monthName;
    monthSelect.append(option);
  });
  yearLabel.className = "widget-panel-row widget-option-control";
  yearLabel.dataset.mainMenuControl = "options.year";
  yearLabel.dataset.dateModeVisibility = "fixed";
  setControlTitle(yearLabel, "Year");
  yearSelect.dataset.widgetControl = "year";
  yearSelect.setAttribute("aria-label", "Calendar year");
  for (
    let year = calendarYearRange.start;
    year <= calendarYearRange.end;
    year += 1
  ) {
    const option = document.createElement("option");

    option.value = String(year);
    option.textContent = String(year);
    yearSelect.append(option);
  }
  startDayLabel.className = "widget-panel-row widget-option-control";
  startDayLabel.dataset.mainMenuControl = "options.start-day";
  setControlTitle(startDayLabel, type === "diary-view" ? ["Week", "#"] : "Day");
  startDaySelect.dataset.widgetControl = "start-day";
  startDaySelect.setAttribute(
    "aria-label",
    type === "diary-view"
      ? "Daily Diary week number"
      : "Schedule View start day",
  );
  visibleDaysLabel.className = "widget-panel-row widget-option-control";
  visibleDaysLabel.dataset.mainMenuControl = "options.visible-days";
  setControlTitle(visibleDaysLabel, "Duration");
  visibleDaysSelect.dataset.widgetControl = "visible-days";
  visibleDaysSelect.setAttribute("aria-label", "Schedule View visible days");
  for (let dayCount = 1; dayCount <= 7; dayCount += 1) {
    const option = document.createElement("option");

    option.value = String(dayCount);
    option.textContent = `${dayCount} ${dayCount === 1 ? "day" : "days"}`;
    visibleDaysSelect.append(option);
  }
  diaryLayoutLabel.className = "widget-panel-row widget-option-control";
  diaryLayoutLabel.dataset.mainMenuControl = "options.diary-layout";
  setControlTitle(diaryLayoutLabel, "Layout");
  diaryLayoutSelect.dataset.widgetControl = "diary-layout";
  diaryLayoutSelect.setAttribute("aria-label", "Daily Diary layout");
  [
    ["horizontal", "Horizontal"],
    ["vertical", "Vertical"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    diaryLayoutSelect.append(option);
  });
  diaryTitleLinesLabel.className = "widget-panel-row widget-option-control";
  diaryTitleLinesLabel.dataset.mainMenuControl = "options.diary-title-lines";
  setControlTitle(diaryTitleLinesLabel, ["Title", "Lines"]);
  diaryTitleLinesSelect.dataset.widgetControl = "diary-title-lines";
  diaryTitleLinesSelect.setAttribute("aria-label", "Daily Diary title lines");
  [
    ["two", "Two"],
    ["one", "One"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    diaryTitleLinesSelect.append(option);
  });
  timeIncrementLabel.className = "widget-panel-row widget-option-control";
  timeIncrementLabel.dataset.mainMenuControl = "options.time-increment";
  setControlTitle(timeIncrementLabel, "Increments");
  timeIncrementSelect.dataset.widgetControl = "time-increment";
  timeIncrementSelect.setAttribute(
    "aria-label",
    "Schedule View time increment",
  );
  [
    ["15", "15m"],
    ["30", "30m"],
    ["60", "1h"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    timeIncrementSelect.append(option);
  });
  startTimeLabel.className = "widget-panel-row widget-option-control";
  startTimeLabel.dataset.mainMenuControl = "options.start-time";
  setControlTitle(startTimeLabel, "Start");
  startTimeSelect.dataset.widgetControl = "start-time";
  startTimeSelect.setAttribute("aria-label", "Schedule View start time");
  timeVisibleLabel.className = "widget-panel-row widget-option-control";
  timeVisibleLabel.dataset.mainMenuControl = "options.time-visible";
  setControlTitle(timeVisibleLabel, ["Time", "Column"]);
  timeVisibleInput.type = "checkbox";
  timeVisibleInput.checked = true;
  timeVisibleInput.dataset.widgetControl = "time-visible";
  timeVisibleInput.setAttribute("aria-label", "Show Schedule View time column");
  timeFormatLabel.className = "widget-panel-row widget-option-control";
  timeFormatLabel.dataset.mainMenuControl = "options.time-format";
  setControlTitle(timeFormatLabel, "Format");
  timeFormatSelect.dataset.widgetControl = "time-format";
  timeFormatSelect.setAttribute("aria-label", "Schedule View time format");
  [
    ["12", "12hr"],
    ["24", "24hr"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    timeFormatSelect.append(option);
  });
  shareWeekendsLabel.className = "widget-panel-row widget-option-control";
  shareWeekendsLabel.dataset.mainMenuControl = "options.share-weekends";
  setControlTitle(shareWeekendsLabel, ["Share", "Weekends"]);
  shareWeekendsInput.type = "checkbox";
  shareWeekendsInput.dataset.widgetControl = "share-weekends";
  shareWeekendsInput.setAttribute(
    "aria-label",
    "Share Saturday and Sunday in one column",
  );
  weekNotesLabel.className = "widget-panel-row widget-option-control";
  weekNotesLabel.dataset.mainMenuControl = "options.week-notes";
  setControlTitle(weekNotesLabel, ["Week", "Notes"]);
  weekNotesSelect.dataset.widgetControl = "week-notes";
  weekNotesSelect.setAttribute("aria-label", "Week notes column");
  [
    ["off", "Off"],
    ["first", "First"],
    ["last", "Last"],
  ].forEach(([value, label]) => {
    const option = document.createElement("option");

    option.value = value;
    option.textContent = label;
    weekNotesSelect.append(option);
  });
  for (let minute = 0; minute < 12 * 60; minute += 60) {
    const option = document.createElement("option");
    const time = formatMinutesAsTime(minute);
    const hour = minute / 60;

    option.value = time;
    option.textContent = `${hour === 0 ? 12 : hour} AM`;
    startTimeSelect.append(option);
  }

  fillLabel.append(fillTitle, fillInput, fillSwatches);
  borderToggleLabel.append(borderToggleInput);
  borderSizeLabel.append(borderSizeTitle, borderSizeGroup);
  borderColorLabel.append(
    borderColorTitle,
    borderColorInput,
    borderColorSwatches,
  );
  textToggleLabel.classList.add("text-panel-settings-control-no-toggle");
  textToggleLabel.append(textTitle, textFontSelect);
  textSizeLabel.append(textSizeTitle, textSizeGroup);
  textColorLabel.append(textColorTitle, textColorInput, textColorSwatches);
  textTocLabel.append(textTocInput);
  textFormatOptions.append(
    textBoldInput,
    textItalicInput,
    textUnderlineInput,
    textStrikeInput,
  );
  textFormatGroup.append(textFormatTitle, textFormatOptions);
  textAlignLabel.append(textAlignTitle, textAlignmentGrid);
  textLineHeightLabel.append(textLineHeightSelect);
  textPanel.append(
    textPanelTitle,
    textToggleLabel,
    textSizeLabel,
    textLineHeightLabel,
    textFormatGroup,
    textColorLabel,
    textAlignLabel,
    borderToggleLabel,
    borderColorLabel,
    borderSizeLabel,
    fillLabel,
  );
  monthLabel.append(monthSelect);
  yearLabel.append(yearSelect);
  displayYearLabel.append(displayYearSelect);
  displayMonthLabel.append(displayMonthSelect);
  displayDateModeLabel.append(displayDateModeSelect);
  displayDayLabel.append(displayDaySelect);
  displayWeekNumberLabel.append(displayWeekNumberSelect);
  displayTitleVisibleLabel.append(displayTitleVisibleSelect);
  displayWeekStartLabel.append(displayWeekStartSelect);
  if (isCalendarItemType(type)) {
    if (type === "full-month") {
      displayDateRow.append(
        displayDateModeLabel,
        displayTitleVisibleLabel,
        displayWeekNumberLabel,
        displayYearLabel,
        displayMonthLabel,
      );
    } else if (type === "mini-month") {
      displayDateRow.append(
        displayDateModeLabel,
        displayWeekNumberLabel,
        displayYearLabel,
        displayMonthLabel,
      );
    } else if (type === "weekly-view" || type === "diary-view") {
      displayDateRow.append(
        displayDateModeLabel,
        displayDayLabel,
        displayYearLabel,
        displayMonthLabel,
      );
    } else {
      displayDateRow.append(
        displayDateModeLabel,
        displayYearLabel,
        displayMonthLabel,
      );
    }
  }
  weekStartLabel.append(weekStartSelect);
  weekdayLabelLabel.append(weekdayLabelSelect);
  dateModeLabel.append(dateModeSelect);
  dateOffsetStepper.append(
    dateOffsetPrevButton,
    dateOffsetInput,
    dateOffsetNextButton,
  );
  dateOffsetLabel.append(dateOffsetStepper);
  calendarSizeLabel.append(calendarSizeOptions);
  monthVisibleLabel.append(monthVisibleInput);
  yearVisibleLabel.append(yearVisibleInput);
  weekNumberLabel.append(weekNumberInput);
  if (isCalendarItemType(type)) {
    calendarAttributesGrid.append(
      shareWeekendsLabel,
      weekdayLabelLabel,
      dateModeLabel,
      monthLabel,
      dateOffsetLabel,
      yearLabel,
      calendarSizeLabel,
      weekNotesLabel,
      startDayLabel,
      visibleDaysLabel,
      diaryLayoutLabel,
      diaryTitleLinesLabel,
      timeVisibleLabel,
      startTimeLabel,
      timeIncrementLabel,
      timeFormatLabel,
    );
  }
  startDayLabel.append(startDaySelect);
  visibleDaysLabel.append(visibleDaysSelect);
  diaryLayoutLabel.append(diaryLayoutSelect);
  diaryTitleLinesLabel.append(diaryTitleLinesSelect);
  timeIncrementLabel.append(timeIncrementSelect);
  startTimeLabel.append(startTimeSelect);
  timeVisibleLabel.append(timeVisibleInput);
  timeFormatLabel.append(timeFormatSelect);
  shareWeekendsLabel.append(shareWeekendsInput);
  weekNotesLabel.append(weekNotesSelect);
  duplicateGroupActions.append(duplicateButton, sequenceButton);
  groupActions.append(groupButton);
  layerButtonGroup.append(sendBackwardButton, bringForwardButton);
  layoutActionGroup.append(
    layoutActionTitle,
    duplicateGroupActions,
    groupActions,
    layerButtonGroup,
    deleteButton,
  );
  actionsPanel.append(actionsWidgetType);
  if (isCalendarItemType(type)) {
    actionsPanel.append(displayDateRow);
  }
  actionsPanel.append(layoutActionGroup);
  if (hasWidgetControls) {
    widgetPanel.append(widgetPanelSectionTitle);
  }
  if (isCalendarItemType(type)) {
    widgetPanel.append(
      monthVisibleLabel,
      yearVisibleLabel,
      weekNumberLabel,
      ...Array.from(calendarAttributesGrid.children),
    );
  }
  if (hasWidgetControls) {
    widgetPanel.append(textTocLabel);
  }
  [
    monthSelect,
    yearSelect,
    startDaySelect,
    visibleDaysSelect,
    startTimeSelect,
  ].forEach(createWidgetSelectStepper);
  controlTabs.append(textTab);
  if (hasWidgetControls) {
    controlTabs.append(widgetTab);
  }
  controls.append(controlTabs, actionsPanel, textPanel);
  if (hasWidgetControls) {
    controls.append(widgetPanel);
  }
  controls
    .querySelectorAll(
      "select:not([data-style-control='fill']):not([data-style-control='border-color']):not([data-text-control='color']):not([data-stepper-select='true'])",
    )
    .forEach((select) => {
      makeCustomSelect(select);
      select.addEventListener("change", () =>
        updateCustomSelectDisplay(select),
      );
    });
  setPaletteSelectionHandler(fillInput, (nextColor) => {
    fillInput.dataset.currentColor = nextColor;
    applyStyleToActionItems(item, {
      fillColor: nextColor,
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
      fillColor: nextColor,
    });
    setPaletteControlValue(fillInput, fillSwatches, nextColor);
  });
  setPaletteSelectionHandler(borderColorInput, (nextColor) => {
    borderColorInput.dataset.currentColor = nextColor;
    applyStyleToActionItems(item, {
      borderColor: nextColor,
    });
    setPaletteControlValue(borderColorInput, borderColorSwatches, nextColor);
  });
  borderColorSwatches.addEventListener("palettecolorselect", (event) => {
    const nextColor = event.detail?.color;

    if (!nextColor) {
      return;
    }

    borderColorInput.dataset.currentColor = nextColor;
    applyStyleToActionItems(item, {
      borderColor: nextColor,
    });
    setPaletteControlValue(borderColorInput, borderColorSwatches, nextColor);
  });
  setPaletteSelectionHandler(textColorInput, (nextColor) => {
    textColorInput.dataset.currentColor = nextColor;
    applyTextSettingsToActionItems(item, {
      color: nextColor,
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
      color: nextColor,
    });
    setPaletteControlValue(textColorInput, textColorSwatches, nextColor);
  });
  setWidgetPanelTab(controls, "actions");
  item.append(sizeLabel, ...createSelectionMoveHandles());
  if (type === "page-flag") {
    item.append(pageFlagShape);
  }
  if (isStickerTextItemType(type)) {
    item.append(textElement);
  }
  if (isTocItemType(type)) {
    item.append(tocElement);
  }
  item.append(controls);
  setItemStyle(
    item,
    typeof getPlannerDefaultItemStyle === "function"
      ? getPlannerDefaultItemStyle(type)
      : {
          fillColor: "var(--color-white)",
          borderColor: "#ccc",
          borderWidth: "1",
          borderEnabled: "true",
        },
  );
  setStickerTextSettings(
    item,
    typeof getPlannerDefaultTextSettings === "function"
      ? getPlannerDefaultTextSettings({
          enabled:
            isTocItemType(type) || type === "page-flag" ? "true" : "false",
        })
      : {},
  );
  setCalendarDayTextSettings(
    item,
    typeof getPlannerDefaultTextSettings === "function"
      ? getPlannerDefaultTextSettings()
      : {},
  );
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

    if (goToPageFlagItem(item)) {
      event.preventDefault();
      event.stopPropagation();
      shouldSkipNextItemClick = true;
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
      const canResize =
        selectedItems.size === 1 &&
        !item.dataset.groupId &&
        item.dataset.itemType !== "mini-month";

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

    if (goToPageFlagItem(item)) {
      event.preventDefault();
      event.stopPropagation();
      shouldSkipNextItemClick = true;
      return;
    }

    if (
      event.target.closest(
        "[data-calendar-style-key], .calendar-border-hit-target",
      )
    ) {
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
          key: "widget-border",
        });
      }
    }
  });
  item.addEventListener("dblclick", (event) => {
    if (event.target.closest(".widget-panel")) {
      return;
    }

    if (
      event.target.closest(
        ".sticker-text[contenteditable='true'], .calendar-day-text[contenteditable='true']",
      )
    ) {
      return;
    }

    const calendarText = event.target.closest(".calendar-day-text");

    if (calendarText && typeof startCalendarDayTextEditing === "function") {
      event.preventDefault();
      event.stopPropagation();
      selectItem(item);
      startCalendarDayTextEditing(calendarText, item);
      return;
    }

    if (event.target.closest(".sticker-text")) {
      event.preventDefault();
      event.stopPropagation();
      selectItem(item);
      startStickerTextEditing(item, {
        selectWordAtPoint: true,
        clientX: event.clientX,
        clientY: event.clientY,
      });
      return;
    }

    event.preventDefault();
    startStickerTextEditing(item);
  });
  item.addEventListener("focus", () => {
    if (
      !item.classList.contains("is-widget-panel-open") &&
      !selectedItems.has(item)
    ) {
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

    openItemPopupMenu(item, {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + Math.min(rect.height / 2, 36),
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
    openItemPopupMenu(item, event, actionItems);
  });
  controls.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  controls.addEventListener("keydown", handleWidgetPanelButtonKey);
  controls.querySelectorAll("[data-widget-panel-tab]").forEach((tab) => {
    tab.addEventListener("click", () =>
      setWidgetPanelTab(controls, tab.dataset.widgetPanelTab),
    );
  });
  duplicateButton.addEventListener("click", (event) => {
    event.stopPropagation();
    duplicateItem(item);
  });
  sequenceButton.addEventListener("click", (event) => {
    event.stopPropagation();
    sequenceItem(item);
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
  borderToggleInput.addEventListener("change", () => {
    applyStyleToActionItems(item, {
      borderEnabled: borderToggleInput.checked ? "true" : "false",
    });
  });
  borderSizeGroup
    .querySelectorAll("[data-border-width-value]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        applyStyleToActionItems(item, {
          borderWidth: button.dataset.borderWidthValue,
        });
      });
    });
  textSizeGroup.querySelectorAll("[data-text-size-value]").forEach((button) => {
    button.addEventListener("click", () => {
      applyTextSettingsToActionItems(item, {
        size: button.dataset.textSizeValue,
      });
    });
  });
  textFontSelect.addEventListener("change", () => {
    applyTextSettingsToActionItems(item, {
      font: textFontSelect.value,
    });
  });
  textTocInput.addEventListener("change", () => {
    const textTarget = getSelectedTextStyleTarget(item);

    if (textTarget) {
      applyPopupMenuTextToc(textTarget.item, textTarget, textTocInput.checked);
      setSelectedTextStyleTarget(textTarget.item, {
        ...textTarget,
        appearsInToc: textTocInput.checked,
      });
    }
  });
  textBoldInput.addEventListener("click", () => {
    const isActive = textBoldInput.getAttribute("aria-pressed") === "true";

    applyTextSettingsToActionItems(item, {
      bold: isActive ? "false" : "true",
    });
  });
  textItalicInput.addEventListener("click", () => {
    const isActive = textItalicInput.getAttribute("aria-pressed") === "true";

    applyTextSettingsToActionItems(item, {
      italic: isActive ? "false" : "true",
    });
  });
  textUnderlineInput.addEventListener("click", () => {
    const isActive = textUnderlineInput.getAttribute("aria-pressed") === "true";

    applyTextSettingsToActionItems(item, {
      underline: isActive ? "false" : "true",
    });
  });
  textStrikeInput.addEventListener("click", () => {
    const isActive = textStrikeInput.getAttribute("aria-pressed") === "true";

    applyTextSettingsToActionItems(item, {
      strike: isActive ? "false" : "true",
    });
  });
  textAlignmentGrid
    .querySelectorAll("[data-text-align-value][data-text-y-align-value]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        applyTextSettingsToActionItems(item, {
          align: button.dataset.textAlignValue,
          yAlign: button.dataset.textYAlignValue,
        });
      });
    });
  textLineHeightSelect.addEventListener("change", () => {
    applyTextSettingsToActionItems(item, {
      lineHeight: textLineHeightSelect.value,
    });
  });
  calendarSizeOptions
    .querySelectorAll("[data-calendar-page-size]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        applyCalendarPageSizeToActionItems(
          item,
          button.dataset.calendarPageSize,
        );
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
      weekNumberFormat: weekNumberInput.checked ? "no-outlines" : "off",
    });
  });
  displayWeekNumberSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      weekNumberFormat:
        displayWeekNumberSelect.value === "on" ? "no-outlines" : "off",
    });
  });
  displayTitleVisibleSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      titleVisible: displayTitleVisibleSelect.value,
    });
  });
  weekStartSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      weekStart: weekStartSelect.value,
    });
  });
  displayWeekStartSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      weekStart: displayWeekStartSelect.value,
    });
  });
  weekdayLabelSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      weekdayLabelFormat: weekdayLabelSelect.value,
    });
  });
  dateModeSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      dateMode: dateModeSelect.value,
    });
  });
  const applyDateOffsetValue = (nextValue) => {
    dateOffsetInput.value = nextValue;
    applyCalendarWidgetSettingsToActionItems(item, {
      dateMode: "relative",
      dateOffset: nextValue,
    });
  };

  dateOffsetInput.addEventListener("input", () => {
    const sanitizedValue = sanitizeIntegerEntryValue(dateOffsetInput.value);

    if (dateOffsetInput.value !== sanitizedValue) {
      dateOffsetInput.value = sanitizedValue;
    }

    if (!sanitizedValue || sanitizedValue === "-") {
      return;
    }

    applyDateOffsetValue(sanitizedValue);
  });
  dateOffsetInput.addEventListener("change", () => {
    const nextValue = normalizeIntegerEntryValue(
      dateOffsetInput.value,
      item.dataset.dateOffset || "0",
    );

    applyDateOffsetValue(nextValue);
  });
  dateOffsetPrevButton.addEventListener("click", () => {
    const currentValue = Number(
      normalizeIntegerEntryValue(
        dateOffsetInput.value,
        item.dataset.dateOffset || "0",
      ),
    );

    applyDateOffsetValue(String(currentValue - 1));
  });
  dateOffsetNextButton.addEventListener("click", () => {
    const currentValue = Number(
      normalizeIntegerEntryValue(
        dateOffsetInput.value,
        item.dataset.dateOffset || "0",
      ),
    );

    applyDateOffsetValue(String(currentValue + 1));
  });
  monthVisibleInput.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      monthDisplay: monthVisibleInput.checked ? "full" : "none",
    });
  });
  yearVisibleInput.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      yearDisplay: yearVisibleInput.checked ? "full" : "none",
    });
  });
  monthSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      dateMode: "fixed",
      month: monthSelect.value,
    });
  });
  displayMonthSelect.addEventListener("change", () => {
    if (item.dataset.dateMode === "relative") {
      applyCalendarWidgetSettingsToActionItems(item, {
        dateMode: "relative",
        dateOffset: getCalendarDisplayOffsetValue(
          displayYearSelect.value,
          displayMonthSelect.value,
        ),
      });
      return;
    }

    applyCalendarWidgetSettingsToActionItems(item, {
      dateMode: "fixed",
      month: displayMonthSelect.value,
    });
  });
  displayDateModeSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      dateMode: displayDateModeSelect.value,
      dateOffset:
        displayDateModeSelect.value === "relative"
          ? "0"
          : item.dataset.dateOffset,
    });
  });
  yearSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      dateMode: "fixed",
      year: yearSelect.value,
    });
  });
  displayYearSelect.addEventListener("change", () => {
    if (item.dataset.dateMode === "relative") {
      applyCalendarWidgetSettingsToActionItems(item, {
        dateMode: "relative",
        dateOffset: getCalendarDisplayOffsetValue(
          displayYearSelect.value,
          displayMonthSelect.value,
        ),
      });
      return;
    }

    applyCalendarWidgetSettingsToActionItems(item, {
      dateMode: "fixed",
      year: displayYearSelect.value,
    });
  });
  startDaySelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      dateMode: "fixed",
      startDay: startDaySelect.value,
    });
  });
  displayDaySelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      dateMode: "fixed",
      startDay: displayDaySelect.value,
    });
  });
  visibleDaysSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      visibleDays: visibleDaysSelect.value,
    });
  });
  diaryLayoutSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      diaryLayout: diaryLayoutSelect.value,
    });
  });
  diaryTitleLinesSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      diaryTitleLines: diaryTitleLinesSelect.value,
    });
  });
  timeIncrementSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      timeIncrement: timeIncrementSelect.value,
    });
  });
  startTimeSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      startTime: startTimeSelect.value,
    });
  });
  timeFormatSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      timeFormat: timeFormatSelect.value,
    });
  });
  timeVisibleInput.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      timeVisible: timeVisibleInput.checked ? "true" : "false",
    });
  });
  shareWeekendsInput.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      shareWeekends: shareWeekendsInput.checked ? "true" : "false",
    });
  });
  weekNotesSelect.addEventListener("change", () => {
    applyCalendarWidgetSettingsToActionItems(item, {
      weekNotes: weekNotesSelect.value,
    });
  });
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    deleteItem(item);
  });
  applyMainMenuControlVisibility(item);

  return item;
}
