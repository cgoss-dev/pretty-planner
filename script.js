const pages = Array.from(document.querySelectorAll("[data-page]"));
const plannerDesk = document.querySelector(".planner-desk");
const plannerSettings = document.querySelector(".planner-settings");
const notebook = document.querySelector(".notebook");
const sourceSticky = document.querySelector("[data-create-item]");
const paperSelect = document.querySelector("[data-setting='paper']");
const orientationSelect = document.querySelector("[data-setting='orientation']");
const gridSelect = document.querySelector("[data-setting='grid']");
const paperColorSelect = document.querySelector("[data-setting='paper-color']");
const deskColorSelect = document.querySelector("[data-setting='desk-color']");
const settingSelects = Array.from(document.querySelectorAll("[data-setting]"));
const guideInputs = Array.from(document.querySelectorAll("[data-guide]"));
const guideDetails = document.querySelector(".guide-settings");
const guideSummary = document.querySelector(".guide-settings summary");
const guideToggle = document.querySelector("[data-guide-toggle]");
const settingsTabs = Array.from(document.querySelectorAll("[data-settings-tab]"));
const settingsPanels = Array.from(document.querySelectorAll("[data-settings-panel]"));
let customSelectDetails = [];

const resizeEdgeSize = 12;
const pageStickDepth = 2;
const stickyGridUnits = 12;
const templateSchemaVersion = 1;
const inchToCentimeters = 2.54;
const paperSizes = {
     "letter": {
          label: "ANSI A Letter",
          unit: "in",
          width: 8.5,
          height: 11
     },
     "half-letter": {
          label: "Half Letter",
          unit: "in",
          width: 5.5,
          height: 8.5
     },
     "a4": {
          label: "ISO A4",
          unit: "cm",
          width: 21,
          height: 29.7
     },
     "a5": {
          label: "ISO A5",
          unit: "cm",
          width: 14.8,
          height: 21
     }
};
const gridSizes = {
     "quarter-inch": {
          label: "1/4 inch",
          unit: "in",
          size: 0.25
     },
     "eighth-inch": {
          label: "1/8 inch",
          unit: "in",
          size: 0.125
     },
     "half-centimeter": {
          label: "1/2 cm",
          unit: "cm",
          size: 0.5
     },
     "quarter-centimeter": {
          label: "1/4 cm",
          unit: "cm",
          size: 0.25
     }
};
const paperColors = {
     "white": {
          label: "White",
          color: "#fff8fb"
     },
     "vanilla": {
          label: "Vanilla",
          color: "#f4ecde"
     },
     "beige": {
          label: "Beige",
          color: "#ead9bd"
     },
     "black": {
          label: "Black",
          color: "#333"
     }
};
const deskColors = {
     "pink": {
          label: "Pink",
          color: "var(--mocha-02)",
          accent: "var(--mocha-12)"
     },
     "gray": {
          label: "Gray",
          color: "var(--color-gray3)",
          accent: "var(--color-gray3)"
     },
     "black": {
          label: "Black",
          color: "var(--color-black)",
          accent: "var(--color-black)"
     },
     "white": {
          label: "White",
          color: "#f1ebef",
          accent: "#f1ebef"
     },
     "wood-white": {
          label: "White Wood",
          color: "#edece8",
          accent: "#edece8",
          image: "url('images/desk/desk-wood-white.png')",
          size: "cover"
     },
     "wood-brown": {
          label: "Brown Wood",
          color: "#8d6243",
          accent: "#8d6243",
          image: "url('images/desk/desk-wood-brown.png')",
          size: "cover"
     }
};
const guideLabels = {
     halves: "1/2",
     thirds: "1/3",
     fourths: "1/4"
};
const guideOrder = ["halves", "thirds", "fourths"];

let activeAction = null;
let selectedItem = null;
let selectedItems = new Set();
let nextTemplateItemId = 1;
let nextGroupId = 1;
let shouldSkipNextClear = false;
let shouldSkipNextItemClick = false;
let shouldSkipNextTabClick = false;
let plannerConfig = buildPlannerConfig();

function convertLength(value, fromUnit, toUnit) {
     if (fromUnit === toUnit) {
          return value;
     }

     return fromUnit === "in" ? value * inchToCentimeters : value / inchToCentimeters;
}

function buildPlannerConfig() {
     const paperKey = paperSelect ? paperSelect.value : "letter";
     const orientation = orientationSelect ? orientationSelect.value : "portrait";
     const gridKey = gridSelect ? gridSelect.value : "quarter-inch";
     const paperColorKey = paperColorSelect ? paperColorSelect.value : "white";
     const deskColorKey = deskColorSelect ? deskColorSelect.value : "pink";
     const guides = {
          halves: true,
          thirds: true,
          fourths: true
     };
     const paper = paperSizes[paperKey];
     const grid = gridSizes[gridKey];
     const portraitWidth = convertLength(paper.width, paper.unit, grid.unit);
     const portraitHeight = convertLength(paper.height, paper.unit, grid.unit);
     const pageWidth = orientation === "landscape" ? portraitHeight : portraitWidth;
     const pageHeight = orientation === "landscape" ? portraitWidth : portraitHeight;
     const gridColumns = pageWidth / grid.size;
     const gridRows = pageHeight / grid.size;
     const guideColumns = Math.round(gridColumns);
     const guideRows = Math.round(gridRows);
     const outerEdgeLeewayColumns = 1;
     const halfColumn = Math.round(guideColumns / 2);
     const halfLeftColumn = guideColumns - halfColumn;
     const halfRightColumn = halfColumn;
     const halfRow = Math.floor(guideRows / 2);
     const outerFourthColumns = Math.floor((halfColumn - outerEdgeLeewayColumns) / 2);
     const thirdColumnOffset = Math.floor(guideColumns / 6);
     const thirdRowOffset = Math.floor(guideRows / 6);

     guideInputs.forEach((input) => {
          guides[input.dataset.guide] = input.checked;
     });

     return {
          paperKey,
          gridKey,
          paperColorKey,
          deskColorKey,
          orientation,
          guides,
          paper,
          paperColor: paperColors[paperColorKey],
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
          fourthRowOne: Math.floor(guideRows / 4),
          fourthRowTwo: halfRow,
          fourthRowThree: Math.floor(guideRows / 4) * 3,
          fourthLeftColumnOne: guideColumns - (halfColumn + outerFourthColumns),
          fourthLeftColumnTwo: halfLeftColumn,
          fourthLeftColumnThree: guideColumns - (halfColumn - outerFourthColumns),
          fourthRightColumnOne: halfColumn - outerFourthColumns,
          fourthRightColumnTwo: halfRightColumn,
          fourthRightColumnThree: halfColumn + outerFourthColumns
     };
}

function getGridSize(page) {
     const rect = page.getBoundingClientRect();

     return {
          x: rect.width / plannerConfig.gridColumns,
          y: rect.height / plannerConfig.gridRows
     };
}

function setRootNumber(name, value) {
     document.documentElement.style.setProperty(name, String(value));
}

function setRootLength(name, value) {
     document.documentElement.style.setProperty(name, `${value}%`);
}

function applyPlannerConfig() {
     const pageWidthInches = convertLength(plannerConfig.pageWidth, plannerConfig.grid.unit, "in");
     const pageHeightInches = convertLength(plannerConfig.pageHeight, plannerConfig.grid.unit, "in");
     const notebookHeightRatio = Math.min(50.47, 78 / (pageWidthInches * 2 / pageHeightInches));
     const sourceStickyRatio = 50 / plannerConfig.gridColumns * stickyGridUnits;

     setRootNumber("--page-aspect", `${pageWidthInches} / ${pageHeightInches}`);
     setRootNumber("--spread-aspect", `${pageWidthInches * 2} / ${pageHeightInches}`);
     setRootNumber("--dot-grid-size-x", `calc(100% / ${plannerConfig.gridColumns})`);
     setRootNumber("--dot-grid-size-y", `calc(100% / ${plannerConfig.gridRows})`);
     setRootNumber("--notebook-dot-grid-size-x", `calc(50% / ${plannerConfig.gridColumns})`);
     setRootNumber("--notebook-grid-cell-width", `calc(var(--notebook-width) / ${plannerConfig.gridColumns * 2})`);
     setRootNumber("--notebook-width", `min(78vw, 1120px, calc((100vh - 112px) * (${pageWidthInches * 2} / ${pageHeightInches})))`);
     setRootNumber("--notebook-height", `min(${notebookHeightRatio}vw, 724px, calc(100vh - 112px))`);
     setRootNumber("--source-sticky-size", `calc(var(--notebook-width) * ${sourceStickyRatio / 100})`);
     setRootNumber("--print-page-width", `${pageWidthInches}in`);
     setRootNumber("--print-page-height", `${pageHeightInches}in`);
     setRootNumber("--print-spread-width", `${pageWidthInches * 2}in`);
     setRootNumber("--paper", plannerConfig.paperColor.color);
     setRootNumber("--desk", plannerConfig.deskColor.color);
     setRootNumber("--desk-accent", plannerConfig.deskColor.accent || plannerConfig.deskColor.color);
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

     if (!plannerSettings.dataset.x && !plannerSettings.dataset.y) {
          delete plannerSettings.dataset.width;
          delete plannerSettings.dataset.height;
          plannerSettings.style.width = "";
          plannerSettings.style.height = "";
     }

     document.documentElement.dataset.paper = plannerConfig.paperKey;
     document.documentElement.dataset.paperColor = plannerConfig.paperColorKey;
     document.documentElement.dataset.deskColor = plannerConfig.deskColorKey;
     document.documentElement.dataset.orientation = plannerConfig.orientation;
     document.documentElement.dataset.grid = plannerConfig.gridKey;
     document.documentElement.dataset.guideHalves = String(plannerConfig.guides.halves);
     document.documentElement.dataset.guideThirds = String(plannerConfig.guides.thirds);
     document.documentElement.dataset.guideFourths = String(plannerConfig.guides.fourths);
     updateGuideSummary();
}

function updateGuideSummary() {
     if (!guideSummary) {
          return;
     }

     const selectedGuides = guideOrder.filter((guide) => plannerConfig.guides[guide]);
     const hasAllGuides = selectedGuides.length === guideOrder.length;
     const summaryList = document.createElement("span");

     summaryList.className = "guide-summary-list";
     if (selectedGuides.length) {
          selectedGuides.forEach((guide) => {
               const option = document.createElement("span");
               const checkbox = document.createElement("input");
               const label = document.createElement("span");

               option.className = "guide-summary-option";
               option.dataset.guideOption = guide;
               checkbox.type = "checkbox";
               checkbox.checked = true;
               checkbox.tabIndex = -1;
               checkbox.setAttribute("aria-hidden", "true");
               label.textContent = guideLabels[guide];
               option.append(checkbox, label);
               summaryList.append(option);
          });
     } else {
          summaryList.textContent = "None";
     }

     guideSummary.replaceChildren(summaryList);

     if (guideToggle) {
          guideToggle.textContent = hasAllGuides ? "None" : "All";
     }
}

function updateCustomSelectDisplay(select) {
     const dropdown = select.nextElementSibling;

     if (!dropdown || !dropdown.classList.contains("custom-select")) {
          return;
     }

     const summary = dropdown.querySelector("summary");
     const selectedOption = select.options[select.selectedIndex];

     summary.textContent = selectedOption ? selectedOption.textContent : "";
     dropdown.querySelectorAll(".custom-select-option").forEach((option) => {
          const isSelected = option.dataset.value === select.value;

          option.classList.toggle("is-selected", isSelected);
          option.setAttribute("aria-selected", String(isSelected));
     });
}

function makeCustomSelect(select) {
     const dropdown = document.createElement("details");
     const summary = document.createElement("summary");
     const optionsBox = document.createElement("div");

     select.classList.add("native-select");
     dropdown.className = "custom-select";
     dropdown.dataset.customSelect = select.dataset.setting;
     summary.setAttribute("role", "button");
     optionsBox.className = "custom-select-options";

     Array.from(select.options).forEach((selectOption) => {
          const option = document.createElement("button");

          option.className = "custom-select-option";
          option.type = "button";
          option.dataset.value = selectOption.value;
          option.setAttribute("role", "option");
          option.textContent = selectOption.textContent;
          option.addEventListener("click", (event) => {
               event.preventDefault();
               event.stopPropagation();
               select.value = selectOption.value;
               select.dispatchEvent(new Event("change", { bubbles: true }));
               updateCustomSelectDisplay(select);
               dropdown.removeAttribute("open");
          });
          optionsBox.append(option);
     });

     dropdown.append(summary, optionsBox);
     select.after(dropdown);
     updateCustomSelectDisplay(select);

     return dropdown;
}

function initializeCustomSelects() {
     customSelectDetails = settingSelects.map(makeCustomSelect);
}

function toggleAllGuides() {
     const shouldSelectAll = guideInputs.some((input) => !input.checked);

     guideInputs.forEach((input) => {
          input.checked = shouldSelectAll;
     });
     changePlannerSetting();
}

function removeGuideFromSummary(event) {
     const option = event.target.closest(".guide-summary-option");

     if (!option) {
          return;
     }

     const input = guideInputs.find((guideInput) => guideInput.dataset.guide === option.dataset.guideOption);

     event.preventDefault();
     event.stopPropagation();

     if (!input) {
          return;
     }

     input.checked = false;
     changePlannerSetting();
}

function selectSettingsTab(tabName) {
     settingsTabs.forEach((tab) => {
          const isActive = tab.dataset.settingsTab === tabName;

          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
     });

     settingsPanels.forEach((panel) => {
          panel.hidden = panel.dataset.settingsPanel !== tabName;
     });

     const activeTab = settingsTabs.find((tab) => tab.dataset.settingsTab === tabName);

     if (activeTab) {
          plannerSettings.style.setProperty("--active-settings-color", `var(${activeTab.dataset.tabColor})`);
     }
}

function getPageId(page) {
     return page === pages[0] ? "left" : "right";
}

function getGridTemplateBox(item, page) {
     const grid = getGridSize(page);
     const box = getItemBox(item);

     return {
          x: Math.round(box.x / grid.x),
          y: Math.round(box.y / grid.y),
          width: Math.round(box.width / grid.x),
          height: Math.round(box.height / grid.y)
     };
}

function getDeskTemplateBox(item) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const box = getItemBox(item);

     return {
          x: Number((box.x / deskRect.width).toFixed(4)),
          y: Number((box.y / deskRect.height).toFixed(4)),
          width: Number((box.width / deskRect.width).toFixed(4)),
          height: Number((box.height / deskRect.height).toFixed(4))
     };
}

function getPageTemplateItems() {
     return pages.flatMap((page) => {
          return Array.from(page.querySelectorAll(".planner-item:not(.is-floating-source)")).map((item) => {
               return {
                    item,
                    page,
                    grid: getGridTemplateBox(item, page)
               };
          });
     });
}

function resizePageTemplateItems(items) {
     items.forEach(({ item, page, grid }) => {
          const nextGrid = getGridSize(page);
          const maxX = plannerConfig.gridColumns - Math.max(1, grid.width);
          const maxY = plannerConfig.gridRows - Math.max(1, grid.height);
          const nextBox = {
               x: clamp(grid.x, 0, maxX) * nextGrid.x,
               y: clamp(grid.y, 0, maxY) * nextGrid.y,
               width: Math.max(1, grid.width) * nextGrid.x,
               height: Math.max(1, grid.height) * nextGrid.y
          };

          setItemBox(item, nextBox);
     });
}

function serializePlannerItem(item) {
     const page = item.closest("[data-page]");
     const baseItem = {
          id: item.dataset.templateId,
          type: "sticky-note",
          groupId: item.dataset.groupId || null,
          style: {
               fillColor: item.dataset.fillColor,
               borderColor: item.dataset.borderColor,
               borderWidth: Number(item.dataset.borderWidth)
          }
     };

     if (page) {
          return {
               ...baseItem,
               placement: "page",
               page: getPageId(page),
               grid: getGridTemplateBox(item, page)
          };
     }

     return {
          ...baseItem,
          placement: "desk",
          frame: getDeskTemplateBox(item)
     };
}

function serializePlannerTemplate() {
     return {
          schemaVersion: templateSchemaVersion,
          type: "planner-layout-template",
          page: {
               size: plannerConfig.paperKey,
               label: plannerConfig.paper.label,
               orientation: plannerConfig.orientation,
               width: Number(plannerConfig.pageWidth.toFixed(4)),
               height: Number(plannerConfig.pageHeight.toFixed(4)),
               unit: plannerConfig.grid.unit,
               color: plannerConfig.paperColorKey,
               colorLabel: plannerConfig.paperColor.label,
               colorValue: plannerConfig.paperColor.color,
               deskColor: plannerConfig.deskColorKey,
               deskColorLabel: plannerConfig.deskColor.label,
               deskColorValue: plannerConfig.deskColor.color,
               deskImageValue: plannerConfig.deskColor.image || null,
               widthInches: Number(convertLength(plannerConfig.pageWidth, plannerConfig.grid.unit, "in").toFixed(4)),
               heightInches: Number(convertLength(plannerConfig.pageHeight, plannerConfig.grid.unit, "in").toFixed(4)),
               grid: plannerConfig.gridKey,
               gridLabel: plannerConfig.grid.label,
               gridInterval: plannerConfig.grid.size,
               gridUnit: plannerConfig.grid.unit,
               gridIntervalInches: Number(convertLength(plannerConfig.grid.size, plannerConfig.grid.unit, "in").toFixed(4)),
               gridColumns: plannerConfig.gridColumns,
               gridRows: plannerConfig.gridRows
          },
          spread: {
               pages: ["left", "right"],
               spineLeewayGridColumns: 1
          },
          guides: {
               halves: plannerConfig.guides.halves,
               thirds: plannerConfig.guides.thirds,
               fourths: plannerConfig.guides.fourths
          },
          items: Array.from(document.querySelectorAll(".planner-item:not(.is-floating-source)")).map(serializePlannerItem)
     };
}

function notifyTemplateChanged() {
     window.dispatchEvent(new CustomEvent("perfectplanner:templatechange", {
          detail: serializePlannerTemplate()
     }));
}

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

function getDeskGrid() {
     const page = pages[0];
     const deskRect = plannerDesk.getBoundingClientRect();
     const pageRect = page.getBoundingClientRect();
     const grid = getGridSize(page);
     const squareGridSize = grid.x;

     return {
          x: squareGridSize,
          y: squareGridSize,
          originX: pageRect.left - deskRect.left,
          originY: pageRect.top - deskRect.top
     };
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

function setItemBox(item, box) {
     item.dataset.x = String(box.x);
     item.dataset.y = String(box.y);
     item.dataset.width = String(box.width);
     item.dataset.height = String(box.height);
     item.style.left = `${box.x}px`;
     item.style.top = `${box.y}px`;
     item.style.width = `${box.width}px`;
     item.style.height = `${box.height}px`;
     updateItemSizeLabel(item);
}

function setItemStyle(item, style) {
     item.dataset.fillColor = style.fillColor || item.dataset.fillColor || "#f9e2af";
     item.dataset.borderColor = style.borderColor || item.dataset.borderColor || "rgba(17, 17, 17, 0.18)";
     item.dataset.borderWidth = style.borderWidth || item.dataset.borderWidth || "1";
     item.style.setProperty("--sticky-fill", item.dataset.fillColor);
     item.style.setProperty("--sticky-border-color", item.dataset.borderColor);
     item.style.setProperty("--sticky-border-size", `${item.dataset.borderWidth}px`);

     const fillInput = item.querySelector("[data-style-control='fill']");
     const borderColorInput = item.querySelector("[data-style-control='border-color']");
     const borderWidthSelect = item.querySelector("[data-style-control='border-width']");

     if (fillInput) {
          fillInput.value = item.dataset.fillColor;
     }

     if (borderColorInput && item.dataset.borderColor.startsWith("#")) {
          borderColorInput.value = item.dataset.borderColor;
     }

     if (borderWidthSelect) {
          borderWidthSelect.value = item.dataset.borderWidth;
     }
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
     const fallbackSize = {
          width: grid.x * stickyGridUnits,
          height: grid.y * stickyGridUnits
     };

     if (item.classList.contains("is-floating-source")) {
          return fallbackSize;
     }

     return {
          width: current.width ? Math.round(current.width / grid.x) * grid.x : fallbackSize.width,
          height: current.height ? Math.round(current.height / grid.y) * grid.y : fallbackSize.height
     };
}

function clearDragOver() {
     pages.forEach((page) => page.classList.remove("is-drag-over"));
}

function getPlannerItems() {
     return Array.from(document.querySelectorAll(".planner-item:not(.is-floating-source)"));
}

function clearItemSelectionClasses(item) {
     item.classList.remove("is-selected", "is-menu-open", "is-resizing", "is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");
}

function setItemSelected(item, isSelected) {
     item.classList.toggle("is-selected", isSelected);

     if (isSelected) {
          selectedItems.add(item);
          selectedItem = item;
          return;
     }

     selectedItems.delete(item);
     clearItemSelectionClasses(item);

     if (selectedItem === item) {
          selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     }
}

function selectItems(items) {
     clearSelection();
     items.forEach((item) => setItemSelected(item, true));
}

function selectItem(item, shouldAdd = false) {
     if (shouldAdd) {
          setItemSelected(item, !selectedItems.has(item));
          return;
     }

     if (item.dataset.groupId) {
          selectItems(getPlannerItems().filter((plannerItem) => plannerItem.dataset.groupId === item.dataset.groupId));
          selectedItem = item;
          return;
     }

     selectItems([item]);
}

function clearSelection() {
     selectedItems.forEach((item) => clearItemSelectionClasses(item));
     selectedItems = new Set();
     selectedItem = null;
}

function closeItemMenus(exceptItem = null) {
     document.querySelectorAll(".planner-item.is-menu-open").forEach((item) => {
          if (item !== exceptItem) {
               item.classList.remove("is-menu-open");
          }
     });
}

function groupSelectedItems() {
     if (selectedItems.size < 2) {
          return;
     }

     const groupId = `group-${nextGroupId}`;
     nextGroupId += 1;
     selectedItems.forEach((item) => {
          item.dataset.groupId = groupId;
     });
     notifyTemplateChanged();
}

function ungroupSelectedItems() {
     const groupIds = new Set(Array.from(selectedItems).map((item) => item.dataset.groupId).filter(Boolean));

     if (!groupIds.size) {
          return;
     }

     getPlannerItems().forEach((item) => {
          if (groupIds.has(item.dataset.groupId)) {
               delete item.dataset.groupId;
          }
     });
     notifyTemplateChanged();
}

function selectedItemsHaveGroup() {
     return Array.from(selectedItems).some((item) => item.dataset.groupId);
}

function updateGroupButton(button) {
     const isGrouped = selectedItemsHaveGroup();

     button.textContent = isGrouped ? "Ungroup" : "Group";
     button.setAttribute("aria-label", isGrouped ? "Ungroup selected sticky notes" : "Group selected sticky notes");
}

function markGridState(item, isOnGrid) {
     item.classList.toggle("is-on-grid", isOnGrid);
}

function markSnapReady(item, isSnapReady) {
     item.classList.toggle("is-snap-ready", isSnapReady);
}

function getResizeMode(item, event) {
     if (item !== selectedItem) {
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
     const grid = getGridSize(page);
     const current = getItemBox(item);
     const rawX = clientX - pageRect.left - offsetX;
     const rawY = clientY - pageRect.top - offsetY;
     const nextX = shouldClamp ? snap(rawX, grid.x) : rawX;
     const nextY = shouldClamp ? snap(rawY, grid.y) : rawY;
     const minX = grid.x * pageStickDepth - current.width;
     const minY = grid.y * pageStickDepth - current.height;
     const maxX = pageRect.width - grid.x * pageStickDepth;
     const maxY = pageRect.height - grid.y * pageStickDepth;

     return {
          ...current,
          x: shouldClamp ? clamp(nextX, minX, maxX) : nextX,
          y: shouldClamp ? clamp(nextY, minY, maxY) : nextY
     };
}

function getResizedBox(item, page, clientX, clientY, mode) {
     const current = getItemBox(item);
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
     const grid = getGridSize(page);
     const minWidth = grid.x * 2;
     const minHeight = grid.y * 2;
     const right = current.x + current.width;
     const bottom = current.y + current.height;
     const pointerX = snap(clientX - pageRect.left, grid.x);
     const pointerY = snap(clientY - pageRect.top, grid.y);
     const nextLeft = resizeLeft ? clamp(pointerX, grid.x * pageStickDepth - current.width, right - minWidth) : current.x;
     const nextTop = resizeTop ? clamp(pointerY, grid.y * pageStickDepth - current.height, bottom - minHeight) : current.y;
     const nextRight = resizeRight ? clamp(pointerX, current.x + minWidth, pageRect.width - grid.x * pageStickDepth + current.width) : right;
     const nextBottom = resizeBottom ? clamp(pointerY, current.y + minHeight, pageRect.height - grid.y * pageStickDepth + current.height) : bottom;

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

function setResizeCursor(item, resizeMode) {
     item.classList.remove("is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");

     const resizeClass = getResizeClass(resizeMode);

     if (resizeClass) {
          item.classList.add(resizeClass);
     }
}

function getSidebarBox() {
     const rect = getDeskRelativeRect(plannerSettings);

     return {
          x: Number(plannerSettings.dataset.x) || rect.x,
          y: Number(plannerSettings.dataset.y) || rect.y,
          width: Number(plannerSettings.dataset.width) || rect.width,
          height: Number(plannerSettings.dataset.height) || rect.height
     };
}

function setSidebarBox(box) {
     plannerSettings.dataset.x = String(box.x);
     plannerSettings.dataset.y = String(box.y);
     plannerSettings.dataset.width = String(box.width);
     plannerSettings.dataset.height = String(box.height);
     plannerSettings.style.left = `${box.x}px`;
     plannerSettings.style.top = `${box.y}px`;
     plannerSettings.style.width = `${box.width}px`;
     plannerSettings.style.height = `${box.height}px`;
     plannerSettings.style.transform = "none";
}

function getMovedSidebarBox(clientX, clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const grid = getDeskGrid();
     const current = activeAction.box;
     const rawX = clientX - deskRect.left - activeAction.offsetX;
     const rawY = clientY - deskRect.top - activeAction.offsetY;
     const maxX = deskRect.width - current.width;
     const maxY = deskRect.height - current.height;

     return {
          ...current,
          x: clamp(snapToGridOrigin(rawX, grid.originX, grid.x), 0, maxX),
          y: clamp(snapToGridOrigin(rawY, grid.originY, grid.y), 0, maxY)
     };
}

function getSidebarVerticalResizeMode(event) {
     const rect = plannerSettings.getBoundingClientRect();
     const isTopEdge = event.clientY >= rect.top - resizeEdgeSize && event.clientY <= rect.top + resizeEdgeSize;
     const isBottomEdge = event.clientY >= rect.bottom - resizeEdgeSize && event.clientY <= rect.bottom + resizeEdgeSize;

     if (isTopEdge) {
          return "top";
     }

     if (isBottomEdge) {
          return "bottom";
     }

     return "";
}

function getSidebarHeightBounds() {
     const pageRect = pages[0].getBoundingClientRect();
     const notebookRect = notebook.getBoundingClientRect();
     const fullHeight = pageRect.height || notebookRect.height;
     const gridRowHeight = fullHeight / plannerConfig.gridRows;

     return {
          min: fullHeight / 2,
          max: fullHeight,
          grid: gridRowHeight
     };
}

function getResizedSidebarBox(clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const bounds = getSidebarHeightBounds();
     const bottom = current.y + current.height;
     const pointerY = snap(clientY - deskRect.top, bounds.grid);

     if (activeAction.mode === "top") {
          const nextTop = clamp(pointerY, bottom - bounds.max, bottom - bounds.min);

          return {
               ...current,
               y: nextTop,
               height: bottom - nextTop
          };
     }

     return {
          ...current,
          height: clamp(snap(pointerY - current.y, bounds.grid), bounds.min, bounds.max)
     };
}

function startSidebarMove(event) {
     const tab = event.target.closest("[data-settings-tab]");

     if (event.button !== 0 || !tab || tab.getAttribute("aria-selected") !== "true") {
          return;
     }

     const box = getSidebarBox();
     const rect = plannerSettings.getBoundingClientRect();

     event.preventDefault();
     setSidebarBox(box);
     activeAction = {
          type: "sidebar-move",
          box,
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top,
          hasMoved: false
     };
     plannerSettings.classList.add("is-dragging");

     try {
          plannerSettings.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startSidebarResize(event, mode) {
     const box = getSidebarBox();

     event.preventDefault();
     setSidebarBox(box);
     activeAction = {
          type: "sidebar-resize",
          box,
          mode
     };
     plannerSettings.classList.add("is-resizing");

     try {
          plannerSettings.setPointerCapture(event.pointerId);
     } catch {
     }
}

function updateItemSizeLabel(item) {
     const label = item.querySelector(".item-size-label");

     if (!label) {
          return;
     }

     const page = item.closest("[data-page]");
     const box = getItemBox(item);
     const width = page ? Math.round(box.width / getGridSize(page).x) : Math.round(box.width);
     const height = page ? Math.round(box.height / getGridSize(page).y) : Math.round(box.height);

     label.textContent = `${width} x ${height}`;
}

function makePlannerItem() {
     const item = document.createElement("div");
     const sizeLabel = document.createElement("span");
     const controls = document.createElement("div");
     const duplicateButton = document.createElement("button");
     const groupButton = document.createElement("button");
     const fillLabel = document.createElement("label");
     const fillInput = document.createElement("input");
     const borderColorLabel = document.createElement("label");
     const borderColorInput = document.createElement("input");
     const borderWidthLabel = document.createElement("label");
     const borderWidthSelect = document.createElement("select");
     const deleteButton = document.createElement("button");

     item.className = "planner-item";
     item.dataset.templateId = `sticky-${nextTemplateItemId}`;
     nextTemplateItemId += 1;
     item.tabIndex = 0;
     item.setAttribute("role", "button");
     item.setAttribute("aria-label", "Sticky note");

     sizeLabel.className = "item-size-label";
     sizeLabel.setAttribute("aria-hidden", "true");
     controls.className = "item-controls";
     controls.setAttribute("role", "menu");
     duplicateButton.className = "item-control";
     duplicateButton.type = "button";
     duplicateButton.textContent = "Duplicate";
     duplicateButton.setAttribute("aria-label", "Duplicate sticky note");
     groupButton.className = "item-control";
     groupButton.type = "button";
     groupButton.textContent = "Group";
     groupButton.setAttribute("aria-label", "Group selected sticky notes");
     fillLabel.className = "item-control-row";
     fillLabel.textContent = "Fill";
     fillInput.type = "color";
     fillInput.value = "#f9e2af";
     fillInput.dataset.styleControl = "fill";
     fillInput.setAttribute("aria-label", "Sticky note fill color");
     borderColorLabel.className = "item-control-row";
     borderColorLabel.textContent = "Border";
     borderColorInput.type = "color";
     borderColorInput.value = "#d4ccd0";
     borderColorInput.dataset.styleControl = "border-color";
     borderColorInput.setAttribute("aria-label", "Sticky note border color");
     borderWidthLabel.className = "item-control-row";
     borderWidthLabel.textContent = "Border size";
     borderWidthSelect.setAttribute("aria-label", "Sticky note border thickness");
     borderWidthSelect.dataset.styleControl = "border-width";
     ["1", "2", "3", "4", "5"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = `${value}px`;
          borderWidthSelect.append(option);
     });
     deleteButton.className = "item-control";
     deleteButton.type = "button";
     deleteButton.textContent = "Delete";
     deleteButton.setAttribute("aria-label", "Delete sticky note");

     fillLabel.append(fillInput);
     borderColorLabel.append(borderColorInput);
     borderWidthLabel.append(borderWidthSelect);
     controls.append(duplicateButton, groupButton, fillLabel, borderColorLabel, borderWidthLabel, deleteButton);
     item.append(sizeLabel, controls);
     setItemStyle(item, {
          fillColor: fillInput.value,
          borderColor: borderColorInput.value,
          borderWidth: borderWidthSelect.value
     });

     item.addEventListener("pointerdown", (event) => {
          if (event.target.closest(".item-controls")) {
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
               startResize(item, event, resizeMode);
               return;
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
          if (shouldSkipNextItemClick) {
               shouldSkipNextItemClick = false;
               return;
          }

          if (event.metaKey || event.ctrlKey) {
               selectItem(item, true);
          } else if (!activeAction) {
               selectItem(item);
          }
     });
     item.addEventListener("focus", () => selectItem(item));
     item.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          if (!selectedItems.has(item)) {
               selectItem(item);
          }
          closeItemMenus(item);
          updateGroupButton(groupButton);
          item.classList.add("is-menu-open");
     });
     controls.addEventListener("pointerdown", (event) => event.stopPropagation());
     controls.addEventListener("click", (event) => event.stopPropagation());
     duplicateButton.addEventListener("click", (event) => {
          event.stopPropagation();
          duplicateItem(item);
     });
     groupButton.addEventListener("click", (event) => {
          event.stopPropagation();
          if (selectedItemsHaveGroup()) {
               ungroupSelectedItems();
          } else {
               groupSelectedItems();
          }
          updateGroupButton(groupButton);
     });
     fillInput.addEventListener("input", () => {
          setItemStyle(item, {
               fillColor: fillInput.value
          });
          notifyTemplateChanged();
     });
     borderColorInput.addEventListener("input", () => {
          setItemStyle(item, {
               borderColor: borderColorInput.value
          });
          notifyTemplateChanged();
     });
     borderWidthSelect.addEventListener("change", () => {
          setItemStyle(item, {
               borderWidth: borderWidthSelect.value
          });
          notifyTemplateChanged();
     });
     deleteButton.addEventListener("click", (event) => {
          event.stopPropagation();
          deleteItem(item);
     });

     return item;
}

function addItemToPage(page, x = 4, y = 4) {
     const item = makePlannerItem();
     const grid = getGridSize(page);
     const box = {
          x: snap(x * grid.x, grid.x),
          y: snap(y * grid.y, grid.y),
          width: grid.x * stickyGridUnits,
          height: grid.y * stickyGridUnits
     };

     page.append(item);
     setItemBox(item, box);
     markGridState(item, true);
     selectItem(item);

     return item;
}

function duplicateItem(item) {
     if (selectedItems.size > 1 && selectedItems.has(item)) {
          duplicateSelectedItems();
          return;
     }

     const page = item.closest("[data-page]");
     const box = getItemBox(item);
     const duplicate = makePlannerItem();
     const parent = page || plannerDesk;
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
     setItemStyle(duplicate, {
          fillColor: item.dataset.fillColor,
          borderColor: item.dataset.borderColor,
          borderWidth: item.dataset.borderWidth
     });
     setItemBox(duplicate, nextBox);
     markGridState(duplicate, Boolean(page));
     selectItem(duplicate);
     notifyTemplateChanged();
}

function duplicateSelectedItems() {
     const copies = [];
     const copiedGroupIds = new Map();

     selectedItems.forEach((item) => {
          const page = item.closest("[data-page]");
          const box = getItemBox(item);
          const duplicate = makePlannerItem();
          const parent = page || plannerDesk;
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
          setItemStyle(duplicate, {
               fillColor: item.dataset.fillColor,
               borderColor: item.dataset.borderColor,
               borderWidth: item.dataset.borderWidth
          });
          setItemBox(duplicate, nextBox);
          markGridState(duplicate, Boolean(page));

          if (item.dataset.groupId) {
               if (!copiedGroupIds.has(item.dataset.groupId)) {
                    copiedGroupIds.set(item.dataset.groupId, `group-${nextGroupId}`);
                    nextGroupId += 1;
               }

               duplicate.dataset.groupId = copiedGroupIds.get(item.dataset.groupId);
          }

          copies.push(duplicate);
     });

     selectItems(copies);
     notifyTemplateChanged();
}

function deleteItem(item) {
     selectedItems.delete(item);
     item.remove();
     selectedItem = selectedItems.size ? Array.from(selectedItems).at(-1) : null;
     notifyTemplateChanged();
}

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
     const snappedSize = getGridSnappedSize(item, page);

     page.append(item);
     item.classList.remove("is-floating-source");
     markGridState(item, true);
     setItemBox(item, {
          ...getItemBox(item),
          width: snappedSize.width,
          height: snappedSize.height
     });
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
}

function moveGroupItemsToDestination(destinationPage, activeStart, activeFinalRect) {
     const deltaLeft = activeFinalRect.left - activeStart.rect.left;
     const deltaTop = activeFinalRect.top - activeStart.rect.top;
     const destinationRect = destinationPage ? destinationPage.getBoundingClientRect() : plannerDesk.getBoundingClientRect();

     activeAction.items.forEach(({ item, rect }) => {
          if (item === activeAction.item) {
               return;
          }

          const nextLeft = rect.left + deltaLeft;
          const nextTop = rect.top + deltaTop;
          const current = getItemBox(item);
          const nextBox = {
               ...current,
               x: nextLeft - destinationRect.left,
               y: nextTop - destinationRect.top
          };

          if (destinationPage) {
               const grid = getGridSize(destinationPage);

               destinationPage.append(item);
               setItemBox(item, {
                    ...nextBox,
                    x: snap(nextBox.x, grid.x),
                    y: snap(nextBox.y, grid.y),
                    width: current.width,
                    height: current.height
               });
               markGridState(item, true);
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
     if (event.button !== 0 || event.target.closest(".planner-item, .sticky-note, .planner-settings")) {
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
     const page = item.closest("[data-page]");
     const itemRect = item.getBoundingClientRect();

     event.preventDefault();
     closeItemMenus();
     if (!selectedItems.has(item)) {
          selectItem(item);
     }

     const movingItems = Array.from(selectedItems);
     activeAction = {
          type: "move",
          item,
          items: movingItems.map((movingItem) => {
               return {
                    item: movingItem,
                    page: movingItem.closest("[data-page]"),
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
     movingItems.forEach((movingItem) => movingItem.classList.add("is-dragging"));

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startSourceMove(event) {
     const item = makePlannerItem();
     const sourceRect = sourceSticky.getBoundingClientRect();
     const offsetX = event.clientX - sourceRect.left;
     const offsetY = event.clientY - sourceRect.top;

     event.preventDefault();
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
          offsetX,
          offsetY
     };

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startResize(item, event, mode) {
     event.preventDefault();
     closeItemMenus();
     selectItem(item);
     updateItemSizeLabel(item);
     activeAction = {
          type: "resize",
          item,
          page: item.closest("[data-page]"),
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

     if (activeAction.type === "sidebar-move") {
          activeAction.hasMoved = true;
          setSidebarBox(getMovedSidebarBox(event.clientX, event.clientY));
          return;
     }

     if (activeAction.type === "sidebar-resize") {
          setSidebarBox(getResizedSidebarBox(event.clientY));
          return;
     }

     if (activeAction.type === "select") {
          updateMarqueeSelection(setMarqueeBox(activeAction.marquee, activeAction.startX, activeAction.startY, event.clientX, event.clientY));
          return;
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
               markGridState(item, Boolean(page) && false);
          });

          activeAction.items.forEach(({ item }) => markGridState(item, false));
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

     if (activeAction.type === "sidebar-move" || activeAction.type === "sidebar-resize") {
          try {
               plannerSettings.releasePointerCapture(event.pointerId);
          } catch {
          }

          if (activeAction.type === "sidebar-move" && activeAction.hasMoved) {
               shouldSkipNextTabClick = true;
          }

          plannerSettings.classList.remove("is-dragging", "is-resizing");
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

     if (activeAction.type === "source" || activeAction.type === "move") {
          const page = getPageFromDraggedBox(
               activeAction.item,
               event.clientX,
               event.clientY,
               activeAction.offsetX,
               activeAction.offsetY
          );

          if (page) {
               snapItemToPage(activeAction.item, page, event);
          } else {
               placeItemOnDesk(activeAction.item, event);
          }

          if (activeAction.type === "move" && activeAction.items.length > 1) {
               moveGroupItemsToDestination(page, activeAction.items.find(({ item }) => item === activeAction.item), activeAction.item.getBoundingClientRect());
          }

          if (activeAction.type === "move") {
               activeAction.items.forEach(({ item }) => item.classList.remove("is-dragging"));
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

function changePlannerSetting() {
     const pageItems = getPageTemplateItems();

     plannerConfig = buildPlannerConfig();
     applyPlannerConfig();

     requestAnimationFrame(() => {
          resizePageTemplateItems(pageItems);
          notifyTemplateChanged();
     });
}

window.perfectPlanner = {
     serializeTemplate: serializePlannerTemplate
};

initializeCustomSelects();
applyPlannerConfig();
paperSelect.addEventListener("change", changePlannerSetting);
orientationSelect.addEventListener("change", changePlannerSetting);
gridSelect.addEventListener("change", changePlannerSetting);
paperColorSelect.addEventListener("change", changePlannerSetting);
deskColorSelect.addEventListener("change", changePlannerSetting);
settingSelects.forEach((select) => {
     select.addEventListener("change", () => updateCustomSelectDisplay(select));
});
guideInputs.forEach((input) => {
     input.addEventListener("change", changePlannerSetting);
});
if (guideToggle) {
     guideToggle.addEventListener("click", toggleAllGuides);
}
if (guideSummary) {
     guideSummary.addEventListener("click", removeGuideFromSummary);
}
settingsTabs.forEach((tab) => {
     tab.addEventListener("pointerdown", startSidebarMove);
     tab.addEventListener("click", () => {
          if (shouldSkipNextTabClick) {
               shouldSkipNextTabClick = false;
               return;
          }

          selectSettingsTab(tab.dataset.settingsTab);
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
sourceSticky.addEventListener("pointerdown", startSourceMove);
plannerDesk.addEventListener("pointerdown", startMarquee);
document.addEventListener("click", (event) => {
     if (shouldSkipNextClear) {
          shouldSkipNextClear = false;
          return;
     }

     if (guideDetails && !event.target.closest(".guide-settings")) {
          guideDetails.removeAttribute("open");
     }

     customSelectDetails.forEach((details) => {
          if (!details.contains(event.target)) {
               details.removeAttribute("open");
          }
     });

     if (!event.target.closest(".planner-item") && !event.target.closest(".planner-settings")) {
          clearSelection();
     }
});
window.addEventListener("pointermove", moveActiveItem);
window.addEventListener("pointerup", endActiveItem);
window.addEventListener("pointercancel", endActiveItem);
