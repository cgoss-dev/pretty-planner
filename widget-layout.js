// Item Position, Size, And Grid Snapping
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
    const box = getMovedBox(
      item,
      page,
      clientX,
      clientY,
      offsetX,
      offsetY,
      false,
    );

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
    height: rect.height,
  };
}

function getItemPage(item) {
  if (item.dataset.pageId) {
    if (
      getItemSpreadIndex(item) !== currentSpreadIndex &&
      !isPageFlagItem(item)
    ) {
      return null;
    }
    return (
      pages.find((page) => getPageId(page) === item.dataset.pageId) || null
    );
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
    height: Number(item.dataset.height) || item.offsetHeight,
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
    box = clampScheduleViewBox(item, page, box);
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

    item.style.left = `${pageRect.left - deskRect.left + box.x * viewZoom}px`;
    item.style.top = `${pageRect.top - deskRect.top + box.y * viewZoom}px`;
  } else {
    item.style.left = `${box.x}px`;
    item.style.top = `${box.y}px`;
  }
  item.style.width = `${box.width}px`;
  item.style.height = `${box.height}px`;
  item.style.setProperty("--item-width", `${box.width}px`);
  item.style.setProperty("--item-height", `${box.height}px`);
  updatePageFlagMetrics(item, page, box);
  updateItemSizeLabel(item);
  if (
    item.dataset.itemType === "full-month" ||
    isTimeGridCalendarType(item.dataset.itemType)
  ) {
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

function updatePageFlagMetrics(item, page, box) {
  if (item.dataset.itemType !== "page-flag") {
    return;
  }

  const grid = page ? getGridSize(page) : null;
  const gridUnits = itemGridUnits["page-flag"] || { width: 6, height: 2 };

  item.style.setProperty(
    "--page-flag-grid-x",
    `${grid ? grid.x : box.width / gridUnits.width}px`,
  );
  item.style.setProperty(
    "--page-flag-grid-y",
    `${grid ? grid.y : box.height / gridUnits.height}px`,
  );
  updatePageFlagShape(item, page, box);
  updatePageFlagExposure(item, page, box);
}

function updatePageFlagExposure(item, page, box) {
  if (!isPageFlagItem(item)) {
    return;
  }

  const isCoveredByOtherPage = Boolean(
    page &&
    item.dataset.pageId &&
    getItemSpreadIndex(item) !== currentSpreadIndex,
  );

  item.classList.toggle("is-page-flag-covered", isCoveredByOtherPage);
  if (!isCoveredByOtherPage) {
    item.style.removeProperty("clip-path");
    return;
  }

  const pageRect = page.getBoundingClientRect();
  const viewZoom = getViewZoom();
  const pageWidth = pageRect.width / viewZoom;
  const leftExposure = Math.max(0, -box.x);
  const rightExposure = Math.max(0, box.x + box.width - pageWidth);

  if (rightExposure >= leftExposure && rightExposure > 0) {
    item.style.clipPath = `inset(0 0 0 ${Math.max(0, box.width - rightExposure)}px)`;
    return;
  }

  if (leftExposure > 0) {
    item.style.clipPath = `inset(0 ${Math.max(0, box.width - leftExposure)}px 0 0)`;
    return;
  }

  item.style.clipPath = "inset(0 0 0 100%)";
}

function getPageFlagPathData(widthUnits, heightUnits, side) {
  const width = Math.max(2, widthUnits);
  const height = Math.max(1, heightUnits);
  const notch = Math.min(1, Math.max(0.25, width / 2));
  const radius = Math.min(0.35, width / 4, height / 4);

  if (side === "left") {
    return [
      `M ${width - radius} 0`,
      `Q ${width} 0 ${width} ${radius}`,
      `L ${width} ${height - radius}`,
      `Q ${width} ${height} ${width - radius} ${height}`,
      `L 0 ${height}`,
      `L ${notch} ${height / 2}`,
      "L 0 0",
      "Z",
    ].join(" ");
  }

  return [
    `M ${radius} 0`,
    `L ${width} 0`,
    `L ${width - notch} ${height / 2}`,
    `L ${width} ${height}`,
    `L ${radius} ${height}`,
    `Q 0 ${height} 0 ${height - radius}`,
    `L 0 ${radius}`,
    `Q 0 0 ${radius} 0`,
    "Z",
  ].join(" ");
}

function updatePageFlagShape(item, page, box) {
  if (!isPageFlagItem(item)) {
    return;
  }

  const shape = item.querySelector(".page-flag-shape");
  const path = shape?.querySelector(".page-flag-shape-path");

  if (!shape || !path) {
    return;
  }

  const grid = page ? getGridSize(page) : null;
  const gridUnits = itemGridUnits["page-flag"] || { width: 6, height: 2 };
  const widthUnits = grid ? Math.max(1, box.width / grid.x) : gridUnits.width;
  const heightUnits = grid
    ? Math.max(1, box.height / grid.y)
    : gridUnits.height;

  shape.setAttribute("viewBox", `0 0 ${widthUnits} ${heightUnits}`);
  path.setAttribute(
    "d",
    getPageFlagPathData(widthUnits, heightUnits, item.dataset.pageFlagSide),
  );
}

function setPageFlagSide(item, side) {
  if (!isPageFlagItem(item)) {
    return;
  }

  item.dataset.pageFlagSide = side === "left" ? "left" : "right";
  updatePageFlagShape(item, getItemPage(item), getItemBox(item));
  updateStickerTextOverflow(item);
  notifyTemplateChanged();
}

function togglePageFlagSide(item) {
  const nextSide = item.dataset.pageFlagSide === "left" ? "right" : "left";

  getActionItems(item)
    .filter(isPageFlagItem)
    .forEach((flag) => setPageFlagSide(flag, nextSide));
}
