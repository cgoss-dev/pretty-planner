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

  if (
    textElement.childNodes.length !== 1 ||
    textElement.firstChild?.nodeType !== Node.TEXT_NODE
  ) {
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

function updateBorderWidthControls(controls, width) {
  controls.querySelectorAll("[data-border-width-value]").forEach((button) => {
    const isActive = button.dataset.borderWidthValue === String(width);

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updateTextAlignmentControls(controls, align, yAlign) {
  controls
    .querySelectorAll("[data-text-align-value][data-text-y-align-value]")
    .forEach((button) => {
      const isActive =
        button.dataset.textAlignValue === align &&
        button.dataset.textYAlignValue === yAlign;

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
      textElement.style.lineHeight = getTextLineHeightPixels(
        item,
        item.dataset.textLineHeight,
      );
    }
  }

  if (isCalendarTextItem(item)) {
    item.querySelectorAll(".calendar-day-text").forEach((textElement) => {
      textElement.style.lineHeight = getTextLineHeightPixels(
        item,
        item.dataset.dayTextLineHeight,
      );
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
  const isDefaultTextEnabled =
    item.dataset.itemType === "page-flag" ? "true" : "false";
  const isEnabled = isGeneratedTextItem
    ? "true"
    : (settings.enabled ?? item.dataset.textEnabled ?? isDefaultTextEnabled);

  item.dataset.textEnabled = String(isEnabled);
  item.dataset.textSize = settings.size || item.dataset.textSize || "10";
  item.dataset.textFont =
    settings.font || item.dataset.textFont || "annotation-mono";
  item.dataset.textColor =
    settings.color || item.dataset.textColor || "var(--color-gray1)";
  delete item.dataset.textAlpha;
  item.dataset.textBold = settings.bold ?? item.dataset.textBold ?? "false";
  item.dataset.textItalic =
    settings.italic ?? item.dataset.textItalic ?? "false";
  item.dataset.textUnderline =
    settings.underline ?? item.dataset.textUnderline ?? "false";
  item.dataset.textStrike =
    settings.strike ?? item.dataset.textStrike ?? "false";
  item.dataset.textAlign = settings.align || item.dataset.textAlign || "center";
  item.dataset.textYAlign =
    settings.yAlign || item.dataset.textYAlign || "center";
  item.dataset.textLineHeight =
    settings.lineHeight || item.dataset.textLineHeight || "1";

  if (textElement) {
    if (!isTocItem(item) && settings.content !== undefined) {
      textElement.textContent = settings.content;
    }

    textElement.hidden = item.dataset.textEnabled !== "true";
    textElement.style.fontSize = `${item.dataset.textSize}px`;
    textElement.style.color = item.dataset.textColor;
    textElement.style.fontFamily = getStickerTextFont(item.dataset.textFont);
    textElement.style.fontWeight =
      item.dataset.textBold === "true" ? "800" : "400";
    textElement.style.fontStyle =
      item.dataset.textItalic === "true" ? "italic" : "normal";
    textElement.style.textDecoration = getTextDecorationValue(
      item.dataset.textUnderline,
      item.dataset.textStrike,
    );
    textElement.style.textAlign = item.dataset.textAlign;
    textElement.style.alignContent = getTextYAlignValue(
      item.dataset.textYAlign,
    );
    textElement.style.lineHeight = getTextLineHeightPixels(
      item,
      item.dataset.textLineHeight,
    );
  }

  const fontSelect = controls.querySelector("[data-text-control='font']");
  const colorInput = controls.querySelector("[data-text-control='color']");
  const colorSwatches = controls.querySelector("[data-text-swatches='color']");
  const boldInput = controls.querySelector("[data-text-control='bold']");
  const italicInput = controls.querySelector("[data-text-control='italic']");
  const underlineInput = controls.querySelector(
    "[data-text-control='underline']",
  );
  const strikeInput = controls.querySelector("[data-text-control='strike']");
  const alignSelect = controls.querySelector("[data-text-control='align']");
  const yAlignSelect = controls.querySelector("[data-text-control='y-align']");
  const lineHeightSelect = controls.querySelector(
    "[data-text-control='line-height']",
  );

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
    updateTextToggleControl(
      underlineInput,
      item.dataset.textUnderline === "true",
    );
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

  updateTextAlignmentControls(
    controls,
    item.dataset.textAlign,
    item.dataset.textYAlign,
  );

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
    serif: "Georgia, serif",
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
    item.dataset.textOverflow = String(
      textElement.scrollHeight > textElement.clientHeight + 1,
    );
  });
}

function updateTextEditingState() {
  plannerDesk.classList.toggle(
    "is-editing-text",
    Boolean(
      document.querySelector(
        ".planner-item.is-editing-text, .planner-item.is-editing-day-text",
      ),
    ),
  );
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
      selectStickerTextWordAtPoint(
        textElement,
        options.clientX,
        options.clientY,
      );
    }
    return;
  }

  if (item.dataset.textEnabled !== "true") {
    setStickerTextSettings(item, {
      enabled: "true",
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

    if (
      options.selectWordAtPoint &&
      selectStickerTextWordAtPoint(
        textElement,
        options.clientX,
        options.clientY,
      )
    ) {
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
    y: clientY - deskRect.top - offsetY,
  };
}

function getPageOverlap(box, page) {
  const overlapWidth = Math.max(
    0,
    Math.min(box.x + box.width, page.clientWidth) - Math.max(box.x, 0),
  );
  const overlapHeight = Math.max(
    0,
    Math.min(box.y + box.height, page.clientHeight) - Math.max(box.y, 0),
  );

  return {
    width: overlapWidth,
    height: overlapHeight,
  };
}

function hasRequiredGridOverlap(box, page) {
  const grid = getGridSize(page);
  const overlap = getPageOverlap(box, page);
  const isOffLeft = box.x < 0;
  const isOffRight = box.x + box.width > page.clientWidth;
  const isOffTop = box.y < 0;
  const isOffBottom = box.y + box.height > page.clientHeight;
  const hasHorizontalDepth =
    isOffLeft || isOffRight ? overlap.width >= grid.x * pageStickDepth : true;
  const hasVerticalDepth =
    isOffTop || isOffBottom ? overlap.height >= grid.y * pageStickDepth : true;

  return (
    overlap.width > 0 &&
    overlap.height > 0 &&
    hasHorizontalDepth &&
    hasVerticalDepth
  );
}

function getGridSnappedSize(item, page) {
  const grid = getGridSize(page);
  const current = getItemBox(item);
  const units = getItemGridUnits(item);
  const fallbackSize = {
    width: grid.x * units.width,
    height: grid.y * units.height,
  };

  if (item.classList.contains("is-floating-source")) {
    return fallbackSize;
  }

  return {
    width: current.width
      ? Math.round(current.width / grid.x) * grid.x
      : fallbackSize.width,
    height: current.height
      ? Math.round(current.height / grid.y) * grid.y
      : fallbackSize.height,
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
      height: plannerConfig.gridRows,
    };
  }

  return itemGridUnits[item.dataset.itemType] || itemGridUnits.sticker;
}
