// NOTE: Paper Size, Grid Size, And Planner Measurements
function buildPlannerConfig() {
  const paperKey = paperSelect ? paperSelect.value : "letter";
  const gridKey = getGridKeyForPaper(paperKey);
  const paperColorKey = paperColorSelect ? paperColorSelect.value : "White";
  const accentColorKey = accentColorSelect ? accentColorSelect.value : "Red";
  const deskColorKey = deskColorSelect ? deskColorSelect.value : "pink";
  const guides = {
    thirds: false,
    fourths: true,
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
  const halfLeftColumn = getNearestSnapUnit(
    centerColumn,
    getGridSnapOriginUnitsForPaper(paperKey, "left").x,
  );
  const halfRightColumn = getNearestSnapUnit(
    centerColumn,
    getGridSnapOriginUnitsForPaper(paperKey, "right").x,
  );
  const halfRow = gridRows / 2;
  const outerFourthColumns = Math.floor(
    (halfColumn - outerEdgeLeewayColumns) / 2,
  );
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
    paperColor: paperColors[paperColorKey] || paperColors.White,
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
    fourthColumnThree: Math.round((guideColumns * 3) / 4),
    fourthRowOne: halfRow - fourthRowOffset,
    fourthRowTwo: halfRow,
    fourthRowThree: halfRow + fourthRowOffset,
    fourthLeftColumnOne: guideColumns - (halfColumn + outerFourthColumns),
    fourthLeftColumnTwo: halfLeftColumn,
    fourthLeftColumnThree: guideColumns - (halfColumn - outerFourthColumns),
    fourthRightColumnOne: halfColumn - outerFourthColumns,
    fourthRightColumnTwo: halfRightColumn,
    fourthRightColumnThree: halfColumn + outerFourthColumns,
  };
}

restoreSavedSettings();
let plannerConfig = buildPlannerConfig();

function getGridKeyForPaper(paperKey) {
  return paperSizes[paperKey]?.unit === "cm"
    ? "half-centimeter"
    : "quarter-inch";
}

function getGridSize(page) {
  const rect = page.getBoundingClientRect();
  const viewZoom = getViewZoom();

  return {
    x: rect.width / viewZoom / plannerConfig.gridColumns,
    y: rect.height / viewZoom / plannerConfig.gridRows,
  };
}

function getNearestSnapUnit(targetUnit, originUnit) {
  return originUnit + Math.round(targetUnit - originUnit);
}

function getGridSnapOriginUnitsForPaper() {
  return {
    x: 0,
    y: 0,
  };
}

function getGridSnapOriginUnitsForPageId(pageId) {
  return getGridSnapOriginUnitsForPaper(plannerConfig.paperKey, pageId);
}

function getGridSnapOriginUnits(page) {
  const fallback = page
    ? getGridSnapOriginUnitsForPageId(getPageId(page))
    : { x: 0, y: 0 };
  const x = Number(page?.dataset.gridSnapOriginX);
  const y = Number(page?.dataset.gridSnapOriginY);

  return {
    x: Number.isFinite(x) ? x : fallback.x,
    y: Number.isFinite(y) ? y : fallback.y,
  };
}

function getGridSnapOrigin(page) {
  const grid = getGridSize(page);
  const origin = getGridSnapOriginUnits(page);

  return {
    x: origin.x * grid.x,
    y: origin.y * grid.y,
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

function getMiniMonthGridUnits() {
  return {
    width: 10,
    height: 9,
  };
}

function getRootPixelValue(name) {
  const value = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(name),
  );

  return Number.isFinite(value) ? value : 0;
}

function getTextLineHeightCellSize(item) {
  if (!item) {
    return 0;
  }

  if (isStickerTextItem(item)) {
    return (
      item.offsetHeight / (getItemGridUnits(item)?.height || stickerGridUnits)
    );
  }

  if (item.dataset.itemType === "mini-month") {
    return item.offsetHeight / getMiniMonthGridUnits(item).height;
  }

  if (
    item.dataset.itemType === "full-month" ||
    item.dataset.itemType === "weekly-view"
  ) {
    const rowCellHeight = Number.parseFloat(
      item.style.getPropertyValue("--weekly-row-cell-height"),
    );

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
