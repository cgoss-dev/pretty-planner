// Click Items, Select Items, And Open Item Menus
function clearDragOver() {
  pages.forEach((page) => page.classList.remove("is-drag-over"));
}

function getWidgetPanel(item) {
  return document.querySelector(
    `.widget-panel[data-owner-id="${item.dataset.templateId}"]`,
  );
}

function getItemTypeLabel(type) {
  return (
    {
      sticker: "Sticker",
      "page-flag": "Page Flag",
      toc: "Table of Contents",
      "mini-month": "Mini Month",
      "full-month": "Full Month",
      "perpetual-calendar": "Perpetual Calendar",
      "weekly-view": "Schedule View",
      "diary-view": "Daily Diary",
    }[type] || "Widget"
  );
}

function getItemAriaLabel(type) {
  return `${getItemTypeLabel(type)} widget`;
}

function createSelectionMoveHandles() {
  return ["top", "right", "bottom", "left"].map((side) => {
    const handle = document.createElement("span");

    handle.className = `selection-move-handle selection-move-handle-${side}`;
    handle.dataset.selectionMoveHandle = side;
    handle.setAttribute("aria-hidden", "true");

    return handle;
  });
}

function getActionItemsTypeLabel(items) {
  if (!items.length) {
    return "Widget";
  }

  const type = items[0]?.dataset.itemType || "sticker";

  return items.every((item) => item.dataset.itemType === type)
    ? getItemTypeLabel(type)
    : "Multiple";
}

function updatePopupMenuTypeLabel(controls, items) {
  const typeLabel = controls.querySelector("[data-actions-widget-type]");

  if (typeLabel) {
    typeLabel.textContent = getActionItemsTypeLabel(items);
  }
}

function positionItemPopupMenu(controls, event) {
  const deskRect = plannerDesk.getBoundingClientRect();
  const gap = 8;
  const menuWidth = controls.offsetWidth || 156;
  const menuHeight = controls.offsetHeight || 0;
  const x = clamp(
    event.clientX - deskRect.left,
    gap,
    Math.max(gap, deskRect.width - menuWidth - gap),
  );
  const y = clamp(
    event.clientY - deskRect.top,
    gap,
    Math.max(gap, deskRect.height - menuHeight - gap),
  );

  controls.style.left = `${x}px`;
  controls.style.top = `${y}px`;
}

function getSelectedOrGroupedActionItems(item) {
  if (selectedItems.has(item)) {
    return Array.from(selectedItems);
  }

  if (item.dataset.groupId) {
    return getPlannerItems().filter(
      (plannerItem) => plannerItem.dataset.groupId === item.dataset.groupId,
    );
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
  controls.dataset.actionItemIds = items
    .map((item) => item.dataset.templateId)
    .filter(Boolean)
    .join(" ");
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

  closeWidgetPopupMenus();
  closeItemMenu(item);
  closeItemMenus();
  objectControlsShell.append(controls);
  setControlsActionItems(controls, actionItems);
  controls.classList.remove("is-popup-menu");
  controls.classList.add("is-docked");
  setWidgetPanelTab(controls, "text");
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

function getPopupMenuEventElement(event) {
  const target = event?.target || null;

  return target?.nodeType === Node.TEXT_NODE ? target.parentElement : target;
}

function getWidgetTextPopupMenuTarget(item, event) {
  const type = item?.dataset?.itemType || "";
  const eventElement = getPopupMenuEventElement(event);
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
      type: "sticker",
    };
  }

  if (partName === "dayNotes") {
    return {
      label: "Freeform Text",
      appearsInToc: item.dataset.dayTextAppearsInToc === "true",
      partName,
      scope: "item",
      type: "calendar-day",
    };
  }

  return {
    label: getReadableTextPartName(partName),
    appearsInToc: getWidgetTextPartToc(type, partName),
    partName,
    scope: "type",
    type,
  };
}

function getSelectedTextTargetFromRange() {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed || !selection.rangeCount) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const container =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? range.commonAncestorContainer.parentElement
      : range.commonAncestorContainer;
  const item = container?.closest?.(".planner-item");
  const partElement =
    container?.closest?.("[data-theme-part]") ||
    range.startContainer.parentElement?.closest?.("[data-theme-part]");

  if (!item || !partElement || !item.contains(partElement)) {
    return null;
  }

  const textTarget = getWidgetTextPopupMenuTarget(item, {
    target: partElement,
  });

  return textTarget
    ? {
        item,
        textTarget,
      }
    : null;
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
  selectedTextStyleTarget =
    item && textTarget
      ? {
          item,
          ...textTarget,
        }
      : null;
  syncSelectedTextStyleControls(item || selectedItem);
}

function getSelectedTextStyleTarget(item = selectedItem) {
  if (
    selectedTextStyleTarget?.item &&
    getAllPlannerItems().includes(selectedTextStyleTarget.item)
  ) {
    return selectedTextStyleTarget;
  }

  if (!item) {
    return null;
  }

  if (isTocItem(item)) {
    return {
      item,
      label: "ToC Text",
      appearsInToc: getWidgetTextPartToc("toc", "entryText"),
      partName: "entryText",
      scope: "type",
      type: "toc",
    };
  }

  return isCalendarTextItem(item)
    ? {
        item,
        label: "Freeform Text",
        appearsInToc: item.dataset.dayTextAppearsInToc === "true",
        partName: "dayNotes",
        scope: "item",
        type: "calendar-day",
      }
    : isStickerTextItem(item)
      ? {
          item,
          label: "Sticky Text",
          appearsInToc: item.dataset.textAppearsInToc === "true",
          partName: "text",
          scope: "item",
          type: "sticker",
        }
      : null;
}

function getTextSettingsForTarget(textTarget) {
  if (!textTarget) {
    return typeof getPlannerDefaultTextSettings === "function"
      ? getPlannerDefaultTextSettings()
      : {};
  }

  if (textTarget.scope === "type") {
    const partStyle =
      typeof getPlannerWidgetTextPartStyle === "function"
        ? getPlannerWidgetTextPartStyle(textTarget.type, textTarget.partName)
        : null;

    return typeof getPlannerDefaultTextSettings === "function"
      ? getPlannerDefaultTextSettings(partStyle || {})
      : partStyle || {};
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
      lineHeight: item.dataset.dayTextLineHeight || "1",
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
    lineHeight: item.dataset.textLineHeight || "1",
  };
}

function syncSelectedTextStyleControls(item = selectedItem) {
  const controls = item ? getWidgetPanel(item) : null;
  const textTarget = getSelectedTextStyleTarget(item);

  if (!controls || !textTarget) {
    return;
  }

  const settings = getTextSettingsForTarget(textTarget);
  const tocInput = controls.querySelector(
    "[data-text-control='appears-in-toc']",
  );
  const fontSelect = controls.querySelector("[data-text-control='font']");
  const colorInput = controls.querySelector("[data-text-control='color']");
  const colorSwatches = controls.querySelector("[data-text-swatches='color']");
  const lineHeightSelect = controls.querySelector(
    "[data-text-control='line-height']",
  );

  updateTextSizeControls(controls, settings.size);
  if (fontSelect) {
    fontSelect.value = settings.font;
  }
  if (colorInput) {
    setPaletteControlValue(colorInput, colorSwatches, settings.color);
  }
  updateTextToggleControl(
    controls.querySelector("[data-text-control='bold']"),
    settings.bold === "true",
  );
  updateTextToggleControl(
    controls.querySelector("[data-text-control='italic']"),
    settings.italic === "true",
  );
  updateTextToggleControl(
    controls.querySelector("[data-text-control='underline']"),
    settings.underline === "true",
  );
  updateTextToggleControl(
    controls.querySelector("[data-text-control='strike']"),
    settings.strike === "true",
  );
  updateTextAlignmentControls(controls, settings.align, settings.yAlign);
  if (lineHeightSelect) {
    lineHeightSelect.value = settings.lineHeight;
  }

  if (tocInput) {
    tocInput.checked =
      textTarget.appearsInToc === true || textTarget.appearsInToc === "true";
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
      enabled: textTarget.item.dataset.textEnabled ?? "true",
    });
    notifyTemplateChanged();
    return;
  }

  if (textTarget.type === "calendar-day") {
    setCalendarDayTextSettings(textTarget.item, settings);
    notifyTemplateChanged();
  }
}

function applyPopupMenuTextToc(item, textTarget, appearsInToc) {
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

function openItemPopupMenu(
  item,
  event,
  actionItems = getSelectedOrGroupedActionItems(item),
) {
  const controls = getWidgetPanel(item);

  if (!controls) {
    return;
  }

  setControlsActionItems(controls, actionItems);
  closeWidgetPopupMenus();
  const popup = document.createElement("div");
  const popupTitle = document.createElement("div");
  const widgetType = document.createElement("div");
  const textGroup = document.createElement("div");
  const duplicateGroup = document.createElement("div");
  const layerGroup = document.createElement("div");
  const textTarget = getWidgetTextPopupMenuTarget(item, event);
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
    closeWidgetPopupMenus();
  };

  popup.className = "widget-popup-menu widget-panel is-popup-menu";
  popup.dataset.ownerId = item.dataset.templateId;
  popup.setAttribute("role", "menu");
  popupTitle.className = "item-actions-menu-title title";
  popupTitle.textContent = "Popup Menu";
  widgetType.className = "item-actions-widget-type subtitle";
  widgetType.textContent = getActionItemsTypeLabel(actionItems);
  textGroup.className = "item-text-role-action-group";
  duplicateGroup.className = "item-action-row";
  const groupAction = document.createElement("div");

  groupAction.className = "item-action-row item-single-action-row";
  layerGroup.className = "item-layer-actions";

  const duplicateButton = makeButton(
    "Duplicate",
    closeAfter(() => duplicateItem(item)),
  );
  const sequenceButton = makeButton(
    "Sequence",
    closeAfter(() => sequenceItem(item)),
  );
  const flipButton = makeButton(
    "Flip",
    closeAfter(() => togglePageFlagSide(item)),
  );
  const groupButton = makeButton(
    itemsHaveGroup(actionItems) ? "Ungroup" : "Group",
    closeAfter(() => {
      const nextItems = getActionItems(item);

      if (itemsHaveGroup(nextItems)) {
        ungroupItems(nextItems);
      } else {
        groupItems(nextItems, item);
      }
    }),
    itemsHaveGroup(actionItems) ? "is-grouped" : "",
  );
  const sendBackwardButton = makeButton(
    "Send Bwd",
    closeAfter(() => moveActionItemsLayer(item, "backward")),
  );
  const bringForwardButton = makeButton(
    "Bring Fwd",
    closeAfter(() => moveActionItemsLayer(item, "forward")),
  );
  const deleteButton = makeButton(
    "Delete",
    closeAfter(() => deleteItem(item)),
    "widget-panel-danger",
  );

  if (textTarget && item.dataset.itemType === "sticker") {
    textGroup.append(
      makeButton(
        "Appears in ToC",
        closeAfter(() =>
          applyPopupMenuTextToc(item, textTarget, !textTarget.appearsInToc),
        ),
        textTarget.appearsInToc ? "is-active" : "",
      ),
    );
  }
  if (isPageFlagItem(item)) {
    duplicateGroup.append(flipButton);
  }
  duplicateGroup.append(duplicateButton, sequenceButton);
  groupAction.append(groupButton);
  layerGroup.append(sendBackwardButton, bringForwardButton);
  popup.append(popupTitle, widgetType);
  if (textGroup.childElementCount) {
    popup.append(textGroup);
  }
  popup.append(layerGroup, duplicateGroup, groupAction, deleteButton);
  plannerDesk.append(popup);
  positionItemPopupMenu(popup, event);
  updateObjectControlsState();
  updateClipboardControls();
}

function closeWidgetPopupMenus() {
  document
    .querySelectorAll(".widget-popup-menu")
    .forEach((popup) => popup.remove());
}

function closeItemMenu(item) {
  const controls = getWidgetPanel(item);

  item.classList.remove("is-widget-panel-open");
  if (!controls) {
    return;
  }

  closeCustomSelects(controls);
  clearSelectFocus(controls);
  controls.classList.remove("is-docked", "is-popup-menu");
  controls.removeAttribute("style");
  clearControlsActionItems(controls);
  item.append(controls);
  updateObjectControlsState();
}

function getAllPlannerItems() {
  return Array.from(
    document.querySelectorAll(".planner-item:not(.is-floating-source)"),
  );
}

function getPlannerItems() {
  return getAllPlannerItems().filter(
    (item) => !item.classList.contains("is-spread-hidden"),
  );
}

function clearItemSelectionClasses(item) {
  closeItemMenu(item);
  clearCalendarStyleTarget(item);
  item.classList.remove(
    "is-selected",
    "is-resizing",
    "is-resize-nwse",
    "is-resize-nesw",
  );
}

function isWidgetContentTarget(target) {
  return Boolean(
    target?.closest?.(
      "button, input, select, textarea, [contenteditable='true'], .custom-select, [data-theme-part], .calendar-day-text, .dayCell, .toc-row, .sticker-text",
    ),
  );
}

function hasActiveWidgetTextSelection() {
  const selection = window.getSelection?.();

  return Boolean(
    selection && !selection.isCollapsed && String(selection).trim(),
  );
}

function setItemSelected(item, isSelected) {
  item.classList.toggle("is-selected", isSelected);
  item.setAttribute("aria-selected", String(isSelected));

  if (isSelected) {
    selectedItems.add(item);
    selectedItem = item;
    if (document.activeElement !== item) {
      item.focus({
        preventScroll: true,
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
    selectItems(
      getPlannerItems().filter(
        (plannerItem) => plannerItem.dataset.groupId === item.dataset.groupId,
      ),
    );
    selectedItem = item;
    openItemMenu(item);
    return;
  }

  selectItems([item]);
  openItemMenu(item);
}

function clearSelection() {
  closeWidgetPopupMenus();
  selectedItems.forEach((item) => clearItemSelectionClasses(item));
  selectedItems = new Set();
  selectedItem = null;
  renderKeyHints();
}

function closeItemMenus(exceptItem = null) {
  document
    .querySelectorAll(".planner-item.is-widget-panel-open")
    .forEach((item) => {
      if (item !== exceptItem) {
        closeItemMenu(item);
      }
    });
}

function closeFloatingWidgetPanelsFromOutsidePointer(event) {
  // Dismisses right-click widget popup menus when the pointer starts outside the popup menu
  if (event.target.closest(".widget-panel, .widget-popup-menu")) {
    return;
  }

  closeWidgetPopupMenus();
}

function syncSelectionToActionItems(items, preferredItem = null) {
  const nextSelection = new Set(items);

  selectedItems.forEach((item) => {
    if (!nextSelection.has(item)) {
      item.classList.remove(
        "is-selected",
        "is-resizing",
        "is-resize-nwse",
        "is-resize-nesw",
      );
    }
  });
  items.forEach((item) => item.classList.add("is-selected"));
  selectedItems = nextSelection;
  selectedItem =
    preferredItem && nextSelection.has(preferredItem)
      ? preferredItem
      : items.at(-1) || null;
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
  const groupIds = new Set(
    items.map((item) => item.dataset.groupId).filter(Boolean),
  );

  if (!groupIds.size) {
    return false;
  }

  getPlannerItems().forEach((item) => {
    if (groupIds.has(item.dataset.groupId)) {
      delete item.dataset.groupId;
    }
  });
  syncSelectionToActionItems(
    items.filter((item) => getPlannerItems().includes(item)),
    selectedItem,
  );
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
  button.setAttribute(
    "aria-label",
    isGrouped ? "Ungroup selected stickers" : "Group selected stickers",
  );
}

// Bring Forward, Send Back, Group, And Shared Actions
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
  const orderedActionItems = plannerItems.filter((plannerItem) =>
    actionSet.has(plannerItem),
  );

  if (!orderedActionItems.length) {
    return;
  }

  const firstIndex = plannerItems.indexOf(orderedActionItems[0]);
  const lastIndex = plannerItems.indexOf(orderedActionItems.at(-1));

  if (direction === "forward") {
    const nextItem = plannerItems
      .slice(lastIndex + 1)
      .find((plannerItem) => !actionSet.has(plannerItem));

    if (!nextItem) {
      return;
    }

    nextItem.after(...orderedActionItems);
  } else {
    const previousItem = plannerItems
      .slice(0, firstIndex)
      .reverse()
      .find((plannerItem) => !actionSet.has(plannerItem));

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
      borderEnabled: style.borderEnabled ?? targetItem.dataset.borderEnabled,
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
  if (Object.hasOwn(settings, "dateMode")) {
    applyMainMenuControlVisibility(item);
  }
  notifyTemplateChanged();
}

function applyCalendarPageSizeToItem(item, pageSize) {
  if (
    item.dataset.itemType !== "weekly-view" &&
    item.dataset.itemType !== "full-month"
  ) {
    return;
  }

  item.dataset.calendarPageSize = normalizeCalendarPageSize(pageSize);
  setCalendarWidgetSettings(item, {
    pageSize: item.dataset.calendarPageSize,
  });

  const page = getItemPage(item);

  if (!page) {
    return;
  }

  const grid = getGridSize(page);
  const size = getCalendarPageSizeGridUnits(item);

  if (!size) {
    return;
  }

  setItemBox(item, {
    ...getItemBox(item),
    width: grid.x * size.width,
    height: grid.y * size.height,
  });
}

function applyCalendarPageSizeToActionItems(item, pageSize) {
  getActionItems(item).forEach((targetItem) => {
    applyCalendarPageSizeToItem(targetItem, pageSize);
  });
  notifyTemplateChanged();
}

function createWidgetSelectStepper(select) {
  const existingControl = select.nextElementSibling;

  if (existingControl?.classList.contains("select-stepper")) {
    updateCustomSelectDisplay(select);
    return existingControl;
  }

  const stepper = document.createElement("div");
  const previousButton = document.createElement("button");
  const valueDisplay = document.createElement("span");
  const nextButton = document.createElement("button");

  select.dataset.stepperSelect = "true";
  select.classList.add("native-select");
  stepper.className = "select-stepper date-offset-stepper";
  stepper.dataset.selectStepper = select.dataset.widgetControl || "";
  previousButton.className =
    "select-stepper-button select-stepper-button-prev date-offset-stepper-button date-offset-stepper-button-prev";
  previousButton.type = "button";
  previousButton.textContent = "‹";
  previousButton.setAttribute(
    "aria-label",
    `Previous ${select.getAttribute("aria-label") || "option"}`,
  );
  valueDisplay.className = "select-stepper-value";
  valueDisplay.setAttribute("aria-live", "polite");
  nextButton.className =
    "select-stepper-button select-stepper-button-next date-offset-stepper-button date-offset-stepper-button-next";
  nextButton.type = "button";
  nextButton.textContent = "›";
  nextButton.setAttribute(
    "aria-label",
    `Next ${select.getAttribute("aria-label") || "option"}`,
  );

  const stepValue = (direction) => {
    const currentIndex = select.selectedIndex >= 0 ? select.selectedIndex : 0;
    const nextIndex = clamp(
      currentIndex + direction,
      0,
      Math.max(0, select.options.length - 1),
    );

    if (nextIndex === currentIndex) {
      return;
    }

    select.selectedIndex = nextIndex;
    select.dispatchEvent(new Event("change", { bubbles: true }));
    updateCustomSelectDisplay(select);
  };

  previousButton.addEventListener("click", () => stepValue(-1));
  nextButton.addEventListener("click", () => stepValue(1));
  select.addEventListener("change", () => updateCustomSelectDisplay(select));
  stepper.append(previousButton, valueDisplay, nextButton);
  select.after(stepper);
  updateCustomSelectDisplay(select);

  return stepper;
}

function setWidgetPanelTab(controls, tabName) {
  closeCustomSelects(controls);
  clearSelectFocus(controls);
  const visiblePanelNames =
    controls.classList.contains("is-docked") &&
    (tabName === "text" || tabName === "widget")
      ? ["text", "widget"]
      : [tabName];

  controls.dataset.activeWidgetPanelTab = visiblePanelNames.join("-");
  controls.querySelector(".widget-panel-tabs")?.removeAttribute("hidden");

  controls.querySelectorAll("[data-widget-panel-tab]").forEach((tab) => {
    const isActive = visiblePanelNames.includes(tab.dataset.widgetPanelTab);

    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  controls.querySelectorAll("[data-widget-panel-page]").forEach((panel) => {
    panel.hidden = !visiblePanelNames.includes(panel.dataset.widgetPanelPage);
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

  if (
    !button ||
    button.disabled ||
    button.getAttribute("aria-disabled") === "true"
  ) {
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

  const escapedKey =
    typeof CSS !== "undefined" && typeof CSS.escape === "function"
      ? CSS.escape(target.key)
      : String(target.key).replaceAll('"', '\\"');

  item
    .querySelectorAll(`[data-calendar-style-key="${escapedKey}"]`)
    .forEach((element) => {
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
      cell.style.fontWeight = style.textBold === "true" ? "800" : "400";
    }
    if (style.textItalic !== undefined) {
      cell.style.fontStyle = style.textItalic === "true" ? "italic" : "normal";
    }
    if (style.textUnderline !== undefined || style.textStrike !== undefined) {
      cell.style.textDecoration = getTextDecorationValue(
        style.textUnderline,
        style.textStrike,
      );
    }
    cell.style.borderRightColor = style.borderColor || "";
    cell.style.borderBottomColor = style.borderColor || "";
    cell.style.borderRightWidth = style.borderWidth
      ? `${style.borderWidth}px`
      : "";
    cell.style.borderBottomWidth = style.borderWidth
      ? `${style.borderWidth}px`
      : "";
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
        borderWidth: style.borderWidth,
        borderEnabled: style.borderEnabled,
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
      ...(styles[target.key] || {}),
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
      ...(styles[target.key] || {}),
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
  const isInside =
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;

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
    key: "widget-border",
  });
}
