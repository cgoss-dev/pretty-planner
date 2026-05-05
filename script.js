const pages = Array.from(document.querySelectorAll("[data-page]"));
const plannerDesk = document.querySelector(".planner-desk");
const plannerSettings = document.querySelector(".planner-settings");
const notebook = document.querySelector(".notebook");
const sourceItems = Array.from(document.querySelectorAll("[data-create-item]"));
const paperSelect = document.querySelector("[data-setting='paper']");
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
const pageSnapButtons = Array.from(document.querySelectorAll("[data-page-snap]"));
const sidebarSnapControls = document.querySelector(".sidebar-snap-controls");
const sidebarSnapButtons = Array.from(document.querySelectorAll("[data-sidebar-snap]"));
const sidebarCollapseButton = document.querySelector("[data-sidebar-collapse]");
let customSelectDetails = [];
const singlePageViewportQuery = window.matchMedia("(max-width: 880px)");

const resizeEdgeSize = 12;
const pageStickDepth = 2;
const stickyGridUnits = 12;
const itemGridUnits = {
     sticky: {
          width: 12,
          height: 12
     },
     "mini-cal": {
          width: 8,
          height: 8
     }
};
const templateSchemaVersion = 1;
const inchToCentimeters = 2.54;
const calendarMonthNames = [
     "January",
     "February",
     "March",
     "April",
     "May",
     "June",
     "July",
     "August",
     "September",
     "October",
     "November",
     "December"
];
const calendarYearRange = {
     start: 2024,
     end: 2035
};
const viewZoomLevels = [
     {
          label: "100%",
          value: 1
     },
     {
          label: "125%",
          value: 1.25
     },
     {
          label: "150%",
          value: 1.5
     }
];
const sidebarSnapPositions = ["left", "center", "right"];
const viewFocusPoints = ["left", "center", "right"];
const viewVerticalFocusPoints = ["top", "center", "bottom"];
let viewZoomIndex = 0;
let viewFocusIndex = 1;
let viewVerticalFocusIndex = 1;
let isSinglePageViewport = singlePageViewportQuery.matches;
let responsiveViewFrame = 0;
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
     const pageWidth = convertLength(paper.width, paper.unit, grid.unit);
     const pageHeight = convertLength(paper.height, paper.unit, grid.unit);
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

function getGridSize(page) {
     const rect = page.getBoundingClientRect();
     const viewZoom = getViewZoom();

     return {
          x: rect.width / viewZoom / plannerConfig.gridColumns,
          y: rect.height / viewZoom / plannerConfig.gridRows
     };
}

function setRootNumber(name, value) {
     document.documentElement.style.setProperty(name, String(value));
}

function setRootLength(name, value) {
     document.documentElement.style.setProperty(name, `${value}%`);
}

function applyViewControls() {
     const zoom = viewZoomLevels[viewZoomIndex];
     const focus = viewFocusPoints[viewFocusIndex];
     const verticalFocus = viewVerticalFocusPoints[viewVerticalFocusIndex];
     const panFactor = 0.25 * zoom.value;
     const pan = {
          left: `calc(var(--notebook-width) * ${panFactor})`,
          center: "0px",
          right: `calc(var(--notebook-width) * -${panFactor})`
     };
     const tilt = {
          top: `calc(var(--notebook-height) * ${panFactor})`,
          center: "0px",
          bottom: `calc(var(--notebook-height) * -${panFactor})`
     };

     setRootNumber("--view-zoom", zoom.value);
     setRootNumber("--view-pan-x", isSinglePageViewport ? "0px" : pan[focus]);
     setRootNumber("--view-pan-y", tilt[verticalFocus]);

     syncResponsivePageCenter();
     updatePageSnapButtons();
     requestAnimationFrame(refreshPageItemViews);
}

function syncResponsivePageCenter() {
     window.cancelAnimationFrame(responsiveViewFrame);

     if (!isSinglePageViewport) {
          return;
     }

     responsiveViewFrame = window.requestAnimationFrame(() => {
          const page = viewFocusPoints[viewFocusIndex] === "left" ? pages[0] : pages[1];

          if (!page) {
               return;
          }

          const pageRect = page.getBoundingClientRect();
          const deskRect = plannerDesk.getBoundingClientRect();
          const pageCenter = pageRect.left + pageRect.width / 2;
          const pageMiddle = pageRect.top + pageRect.height / 2;
          const deskCenter = deskRect.left + deskRect.width / 2;
          const deskMiddle = deskRect.top + deskRect.height / 2;

          if (viewFocusIndex !== 1) {
               setRootNumber("--view-pan-x", `${deskCenter - pageCenter}px`);
          }

          if (viewVerticalFocusIndex === 1) {
               setRootNumber("--view-pan-y", `${deskMiddle - pageMiddle}px`);
          }

          requestAnimationFrame(refreshPageItemViews);
     });
}

function getNotebookWidthFormula(pageWidthInches, pageHeightInches) {
     const spreadRatio = pageWidthInches * 2 / pageHeightInches;
     const maxViewportWidth = isSinglePageViewport ? 156 : 92;

     return `min(${maxViewportWidth}vw, 1120px, calc((100vh - 112px) * (${spreadRatio})))`;
}

function applyResponsiveViewMode() {
     const nextIsSinglePageViewport = singlePageViewportQuery.matches;

     if (nextIsSinglePageViewport === isSinglePageViewport) {
          if (isSinglePageViewport) {
               applyViewControls();
          }
          return false;
     }

     isSinglePageViewport = nextIsSinglePageViewport;
     if (isSinglePageViewport && viewFocusIndex === 1) {
          viewFocusIndex = 0;
     } else if (!isSinglePageViewport) {
          viewFocusIndex = 1;
     }

     applyPlannerConfig();
     applyViewControls();
     return true;
}

function handleWindowResize() {
     applyResponsiveViewMode();
     syncSidebarSnap();
}

function cycleViewZoom() {
     viewZoomIndex = (viewZoomIndex + 1) % viewZoomLevels.length;
     applyViewControls();
}

function moveViewFocus(direction) {
     const step = direction === "next" ? 1 : -1;

     viewFocusIndex = clamp(viewFocusIndex + step, 0, viewFocusPoints.length - 1);
     applyViewControls();
}

function snapViewToPage(pageSide) {
     const nextFocusIndex = viewFocusPoints.indexOf(pageSide);

     if (nextFocusIndex === -1 || pageSide === "center") {
          return;
     }

     viewFocusIndex = nextFocusIndex;
     applyViewControls();
}

function updatePageSnapButtons() {
     pageSnapButtons.forEach((button) => {
          const direction = button.dataset.pageSnap;

          button.disabled = direction === "previous" ? viewFocusIndex <= 0 : viewFocusIndex >= viewFocusPoints.length - 1;
     });
}

function movePageSnap(direction) {
     if (direction === "previous") {
          snapViewToPage("left");
     } else {
          snapViewToPage("right");
     }
}

function moveViewVerticalFocus(direction) {
     const step = direction === "next" ? 1 : -1;

     viewVerticalFocusIndex = clamp(viewVerticalFocusIndex + step, 0, viewVerticalFocusPoints.length - 1);
     applyViewControls();
}

function getViewZoom() {
     return viewZoomLevels[viewZoomIndex].value;
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
     setRootNumber("--notebook-width", getNotebookWidthFormula(pageWidthInches, pageHeightInches));
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

function openSidebar() {
     plannerSettings.classList.add("is-open");
}

function closeSidebar() {
     plannerSettings.classList.remove("is-open");
}

function syncSidebarSnap() {
     const box = getSidebarBox();
     const bounds = getSidebarHeightBounds();
     const snapPosition = plannerSettings.dataset.snapPosition || "center";
     const nextHeight = clamp(box.height, bounds.min, bounds.max);

     setSidebarBox({
          ...box,
          y: plannerDesk.getBoundingClientRect().height - nextHeight,
          centerX: getSidebarSnapCenter(box.width, snapPosition),
          height: nextHeight
     });
     updateSidebarSnapButtons();
}

function setSidebarSnapControlsBox(box) {
     if (!sidebarSnapControls) {
          return;
     }

     sidebarSnapControls.style.left = `${box.centerX}px`;
     sidebarSnapControls.style.width = `${box.width}px`;
}

function updateSidebarSnapButtons() {
     const snapPosition = plannerSettings.dataset.snapPosition || "center";
     const snapIndex = sidebarSnapPositions.indexOf(snapPosition);

     sidebarSnapButtons.forEach((button) => {
          const direction = button.dataset.sidebarSnap;
          const isDisabled = direction === "previous" ? snapIndex <= 0 : snapIndex >= sidebarSnapPositions.length - 1;

          button.disabled = isDisabled;
     });
}

function moveSidebarSnap(direction) {
     const currentPosition = plannerSettings.dataset.snapPosition || "center";
     const currentIndex = Math.max(sidebarSnapPositions.indexOf(currentPosition), 0);
     const delta = direction === "previous" ? -1 : 1;
     const nextIndex = clamp(currentIndex + delta, 0, sidebarSnapPositions.length - 1);
     const snapPosition = sidebarSnapPositions[nextIndex];
     const box = getSidebarBox();

     plannerSettings.dataset.snapPosition = snapPosition;
     setSidebarBox({
          ...box,
          centerX: getSidebarSnapCenter(box.width, snapPosition)
     });
     updateSidebarSnapButtons();
}

function getSidebarSnapCenter(width, snapPosition = plannerSettings.dataset.snapPosition || "center") {
     const deskRect = plannerDesk.getBoundingClientRect();
     const snapRatios = {
          left: 0.1,
          center: 0.5,
          right: 0.9
     };
     const ratio = snapRatios[snapPosition] || snapRatios.center;
     const minCenter = width / 2 + 12;
     const maxCenter = deskRect.width - width / 2 - 12;

     return clamp(deskRect.width * ratio, minCenter, maxCenter);
}

function getNearestSidebarSnapPosition(centerX) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const positions = [
          {
               name: "left",
               center: deskRect.width * 0.1
          },
          {
               name: "center",
               center: deskRect.width * 0.5
          },
          {
               name: "right",
               center: deskRect.width * 0.9
          }
     ];

     return positions.reduce((nearest, position) => {
          return Math.abs(position.center - centerX) < Math.abs(nearest.center - centerX) ? position : nearest;
     }, positions[1]).name;
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
     return getPlannerItems().flatMap((item) => {
          const page = getItemPage(item);

          if (!page) {
               return [];
          }

          return {
               item,
               page,
               grid: getGridTemplateBox(item, page)
          };
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
     const page = getItemPage(item);
     const baseItem = {
          id: item.dataset.templateId,
          type: item.dataset.itemType || "sticky",
          groupId: item.dataset.groupId || null,
          style: {
               fillColor: item.dataset.fillColor,
               borderColor: item.dataset.borderColor,
               borderWidth: Number(item.dataset.borderWidth)
          },
          widget: item.dataset.itemType === "mini-cal"
               ? {
                    weekNumbers: item.dataset.weekNumbers !== "false",
                    weekStart: item.dataset.weekStart || "sunday",
                    month: Number(item.dataset.month) || 0,
                    monthLabel: calendarMonthNames[Number(item.dataset.month) || 0],
                    year: Number(item.dataset.year) || new Date().getFullYear()
               }
               : null
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

function getItemPage(item) {
     if (item.dataset.pageId) {
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
               positionItemControls(item);
          }
     });
}

function setItemBox(item, box) {
     const page = getItemPage(item);
     const shouldScaleWithPage = page && item.parentElement === plannerDesk;
     const viewZoom = shouldScaleWithPage ? getViewZoom() : 1;

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
     updateItemSizeLabel(item);
}

function setItemStyle(item, style) {
     item.dataset.fillColor = style.fillColor || item.dataset.fillColor || "#f9e2af";
     item.dataset.borderColor = style.borderColor || item.dataset.borderColor || "rgba(17, 17, 17, 0.18)";
     item.dataset.borderWidth = style.borderWidth || item.dataset.borderWidth || "1";
     item.style.setProperty("--sticky-fill", item.dataset.fillColor);
     item.style.setProperty("--sticky-border-color", item.dataset.borderColor);
     item.style.setProperty("--sticky-border-size", `${item.dataset.borderWidth}px`);

     const controls = getItemControls(item) || item;
     const fillInput = controls.querySelector("[data-style-control='fill']");
     const borderColorInput = controls.querySelector("[data-style-control='border-color']");
     const borderWidthSelect = controls.querySelector("[data-style-control='border-width']");

     if (fillInput && item.dataset.fillColor.startsWith("#")) {
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
     return itemGridUnits[item.dataset.itemType] || itemGridUnits.sticky;
}

function clearDragOver() {
     pages.forEach((page) => page.classList.remove("is-drag-over"));
}

function getItemControls(item) {
     return document.querySelector(`.item-controls[data-owner-id="${item.dataset.templateId}"]`);
}

function positionItemControls(item) {
     const controls = getItemControls(item);

     if (!controls || !controls.classList.contains("is-floating")) {
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

function openItemMenu(item) {
     const controls = getItemControls(item);

     if (!controls) {
          return;
     }

     closeItemMenus(item);
     plannerDesk.append(controls);
     controls.classList.add("is-floating");
     item.classList.add("is-menu-open");
     positionItemControls(item);
}

function closeItemMenu(item) {
     const controls = getItemControls(item);

     item.classList.remove("is-menu-open");
     if (!controls) {
          return;
     }

     controls.classList.remove("is-floating");
     controls.removeAttribute("style");
     item.append(controls);
}

function getPlannerItems() {
     return Array.from(document.querySelectorAll(".planner-item:not(.is-floating-source)"));
}

function clearItemSelectionClasses(item) {
     closeItemMenu(item);
     item.classList.remove("is-selected", "is-resizing", "is-resize-ew", "is-resize-ns", "is-resize-nwse", "is-resize-nesw");
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
               closeItemMenu(item);
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

function getActionItems(item) {
     if (selectedItems.has(item)) {
          return Array.from(selectedItems);
     }

     if (item.dataset.groupId) {
          return getPlannerItems().filter((plannerItem) => plannerItem.dataset.groupId === item.dataset.groupId);
     }

     return [item];
}

function applyStyleToActionItems(item, style) {
     getActionItems(item).forEach((targetItem) => setItemStyle(targetItem, style));
     notifyTemplateChanged();
}

function setItemControlsTab(controls, tabName) {
     controls.querySelectorAll("[data-item-control-tab]").forEach((tab) => {
          const isActive = tab.dataset.itemControlTab === tabName;

          tab.classList.toggle("is-active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
     });
     controls.querySelectorAll("[data-item-control-panel]").forEach((panel) => {
          panel.hidden = panel.dataset.itemControlPanel !== tabName;
     });
}

function markGridState(item, isOnGrid, page = null) {
     item.classList.toggle("is-on-grid", isOnGrid);
     if (isOnGrid && page) {
          item.dataset.pageId = getPageId(page);
     } else if (!isOnGrid) {
          delete item.dataset.pageId;
     }
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
     const viewZoom = getViewZoom();
     const grid = getGridSize(page);
     const current = getItemBox(item);
     const rawX = (clientX - pageRect.left - offsetX) / viewZoom;
     const rawY = (clientY - pageRect.top - offsetY) / viewZoom;
     const nextX = shouldClamp ? snap(rawX, grid.x) : rawX;
     const nextY = shouldClamp ? snap(rawY, grid.y) : rawY;
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
     const viewZoom = getViewZoom();
     const grid = getGridSize(page);
     const minWidth = grid.x * 2;
     const minHeight = grid.y * 2;
     const right = current.x + current.width;
     const bottom = current.y + current.height;
     const pointerX = snap((clientX - pageRect.left) / viewZoom, grid.x);
     const pointerY = snap((clientY - pageRect.top) / viewZoom, grid.y);
     const nextLeft = resizeLeft ? clamp(pointerX, grid.x * pageStickDepth - current.width, right - minWidth) : current.x;
     const nextTop = resizeTop ? clamp(pointerY, grid.y * pageStickDepth - current.height, bottom - minHeight) : current.y;
     const nextRight = resizeRight ? clamp(pointerX, current.x + minWidth, (pageRect.width / viewZoom) - grid.x * pageStickDepth + current.width) : right;
     const nextBottom = resizeBottom ? clamp(pointerY, current.y + minHeight, (pageRect.height / viewZoom) - grid.y * pageStickDepth + current.height) : bottom;

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
     const deskRect = plannerDesk.getBoundingClientRect();
     const rect = plannerSettings.getBoundingClientRect();
     const width = Number(plannerSettings.dataset.width) || rect.width;
     const height = Number(plannerSettings.dataset.height) || rect.height;
     const centerX = Number(plannerSettings.dataset.centerX) || getSidebarSnapCenter(width);

     return {
          x: centerX - width / 2,
          y: deskRect.height - height,
          centerX,
          width,
          height
     };
}

function setSidebarBox(box) {
     plannerSettings.dataset.width = String(box.width);
     plannerSettings.dataset.height = String(box.height);
     plannerSettings.dataset.centerX = String(box.centerX);
     plannerSettings.style.left = `${box.centerX}px`;
     plannerSettings.style.width = `${box.width}px`;
     plannerSettings.style.height = `${box.height}px`;
     setSidebarSnapControlsBox(box);
}

function getMovedSidebarBox(clientX, clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const rawX = clientX - deskRect.left - activeAction.offsetX;
     const minX = 12;
     const maxX = deskRect.width - current.width - 12;
     const x = clamp(rawX, minX, maxX);

     return {
          ...current,
          x,
          centerX: x + current.width / 2
     };
}

function getSidebarVerticalResizeMode(event) {
     const rect = plannerSettings.getBoundingClientRect();
     const isTopEdge = event.clientY >= rect.top - resizeEdgeSize && event.clientY <= rect.top + resizeEdgeSize;

     if (isTopEdge) {
          return "top";
     }

     return "";
}

function getSidebarHeightBounds() {
     const pageRect = pages[0].getBoundingClientRect();
     const notebookRect = notebook.getBoundingClientRect();
     const deskRect = plannerDesk.getBoundingClientRect();
     const measuredHeight = Math.max(pageRect.height, notebookRect.height);
     const fullHeight = measuredHeight > 220 ? measuredHeight : deskRect.height * 0.68;
     const gridRowHeight = Math.max(fullHeight / plannerConfig.gridRows, 8);
     const maxHeight = Math.min(fullHeight, deskRect.height * 0.78);

     return {
          min: Math.min(Math.max(fullHeight / 2, 220), maxHeight),
          max: maxHeight,
          grid: gridRowHeight
     };
}

function getResizedSidebarBox(clientY) {
     const deskRect = plannerDesk.getBoundingClientRect();
     const current = activeAction.box;
     const bounds = getSidebarHeightBounds();
     const bottom = deskRect.height;
     const pointerY = snap(clientY - deskRect.top, bounds.grid);

     const nextTop = clamp(pointerY, bottom - bounds.max, bottom - bounds.min);

     return {
          ...current,
          y: nextTop,
          height: bottom - nextTop
     };
}

function startSidebarMove(event) {
     const tab = event.target.closest("[data-settings-tab]");

     if (event.button !== 0 || !tab || tab.getAttribute("aria-selected") !== "true") {
          return;
     }

     const box = getSidebarBox();
     const rect = plannerSettings.getBoundingClientRect();

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

     const page = getItemPage(item);
     const box = getItemBox(item);
     const width = page ? Math.round(box.width / getGridSize(page).x) : Math.round(box.width);
     const height = page ? Math.round(box.height / getGridSize(page).y) : Math.round(box.height);

     label.textContent = `${width} x ${height}`;
}

function getWeekStartDate(date, weekStart) {
     const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
     const offset = weekStart === "monday"
          ? (nextDate.getDay() + 6) % 7
          : nextDate.getDay();

     nextDate.setDate(nextDate.getDate() - offset);
     return nextDate;
}

function getCalendarWeekNumber(date, weekStart) {
     if (weekStart === "monday") {
          const nextDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const day = nextDate.getDay() || 7;

          nextDate.setDate(nextDate.getDate() + 4 - day);

          const yearStart = new Date(nextDate.getFullYear(), 0, 1);

          return Math.ceil((((nextDate - yearStart) / 86400000) + 1) / 7);
     }

     const weekStartDate = getWeekStartDate(date, weekStart);
     const yearStart = getWeekStartDate(new Date(weekStartDate.getFullYear(), 0, 1), weekStart);

     return Math.floor((weekStartDate - yearStart) / 604800000) + 1;
}

function renderMiniCal(item) {
     let calendar = item.querySelector(".mini-cal");
     const weekNumbersEnabled = item.dataset.weekNumbers !== "false";
     const weekStart = item.dataset.weekStart || "sunday";
     const month = Number(item.dataset.month) || 0;
     const year = Number(item.dataset.year) || new Date().getFullYear();
     const firstDay = new Date(year, month, 1);
     const daysInMonth = new Date(year, month + 1, 0).getDate();
     const firstDayOffset = weekStart === "monday"
          ? (firstDay.getDay() + 6) % 7
          : firstDay.getDay();
     const dayLabels = weekStart === "monday"
          ? ["M", "T", "W", "T", "F", "S", "S"]
          : ["S", "M", "T", "W", "T", "F", "S"];
     const weekendIndexes = weekStart === "monday" ? [5, 6] : [0, 6];

     if (!calendar) {
          calendar = document.createElement("div");
          calendar.className = "mini-cal";
          item.append(calendar);
     }

     calendar.replaceChildren();
     calendar.classList.toggle("has-week-numbers", weekNumbersEnabled);
     for (let row = 0; row < 8; row += 1) {
          for (let column = 0; column < 8; column += 1) {
               const cell = document.createElement("span");
               const dayIndex = column - 1;

               cell.className = "mini-cal-cell";
               if (!weekNumbersEnabled && column === 0) {
                    cell.classList.add("mini-cal-hidden");
                    cell.setAttribute("aria-hidden", "true");
                    calendar.append(cell);
                    continue;
               }

               if (row === 0) {
                    if ((weekNumbersEnabled && column === 0) || (!weekNumbersEnabled && column === 1)) {
                         cell.classList.add("mini-cal-month");
                         cell.textContent = `${calendarMonthNames[month]} ${year}`;
                    } else {
                         cell.classList.add("mini-cal-hidden");
                         cell.setAttribute("aria-hidden", "true");
                    }
               } else if (column === 0) {
                    cell.classList.add("mini-cal-week");
                    if (row === 1) {
                         cell.textContent = "#";
                    } else {
                         const weekDate = new Date(year, month, 1 - firstDayOffset + ((row - 2) * 7));

                         cell.textContent = String(getCalendarWeekNumber(weekDate, weekStart));
                    }
               } else if (row === 1) {
                    cell.classList.add("mini-cal-day-name");
                    cell.textContent = dayLabels[dayIndex];
                    if (weekendIndexes.includes(dayIndex)) {
                         cell.classList.add("mini-cal-weekend");
                    }
               } else {
                    const dayNumber = ((row - 2) * 7) + column - firstDayOffset;

                    if (weekendIndexes.includes(dayIndex)) {
                         cell.classList.add("mini-cal-weekend");
                    }
                    cell.textContent = dayNumber >= 1 && dayNumber <= daysInMonth ? String(dayNumber) : "";
               }
               if (column === 7) {
                    cell.classList.add("mini-cal-edge-right");
               }
               if (row === 7) {
                    cell.classList.add("mini-cal-edge-bottom");
               }

               calendar.append(cell);
          }
     }
}

function setMiniCalSettings(item, settings = {}) {
     const today = new Date();

     item.dataset.weekNumbers = settings.weekNumbers || item.dataset.weekNumbers || "true";
     item.dataset.weekStart = settings.weekStart || item.dataset.weekStart || "sunday";
     item.dataset.month = settings.month || item.dataset.month || String(today.getMonth());
     item.dataset.year = settings.year || item.dataset.year || String(today.getFullYear());
     renderMiniCal(item);

     const controls = getItemControls(item) || item;
     const weekNumberInput = controls.querySelector("[data-widget-control='week-numbers']");
     const weekStartSelect = controls.querySelector("[data-widget-control='week-start']");
     const monthSelect = controls.querySelector("[data-widget-control='month']");
     const yearSelect = controls.querySelector("[data-widget-control='year']");

     if (weekNumberInput) {
          weekNumberInput.checked = item.dataset.weekNumbers !== "false";
     }

     if (weekStartSelect) {
          weekStartSelect.value = item.dataset.weekStart;
     }

     if (monthSelect) {
          monthSelect.value = item.dataset.month;
     }

     if (yearSelect) {
          yearSelect.value = item.dataset.year;
     }
}

function makePlannerItem(type = "sticky") {
     const item = document.createElement("div");
     const sizeLabel = document.createElement("span");
     const controls = document.createElement("div");
     const controlTabs = document.createElement("div");
     const actionsTab = document.createElement("button");
     const styleTab = document.createElement("button");
     const widgetTab = document.createElement("button");
     const actionsPanel = document.createElement("div");
     const stylePanel = document.createElement("div");
     const widgetPanel = document.createElement("div");
     const duplicateButton = document.createElement("button");
     const groupButton = document.createElement("button");
     const fillLabel = document.createElement("label");
     const fillInput = document.createElement("input");
     const borderColorLabel = document.createElement("label");
     const borderColorInput = document.createElement("input");
     const borderWidthLabel = document.createElement("label");
     const borderWidthSelect = document.createElement("select");
     const weekNumberLabel = document.createElement("label");
     const weekNumberInput = document.createElement("input");
     const weekStartLabel = document.createElement("label");
     const weekStartSelect = document.createElement("select");
     const monthLabel = document.createElement("label");
     const monthSelect = document.createElement("select");
     const yearLabel = document.createElement("label");
     const yearSelect = document.createElement("select");
     const deleteButton = document.createElement("button");

     item.className = `planner-item planner-item-${type}`;
     item.dataset.itemType = type;
     item.dataset.templateId = `${type}-${nextTemplateItemId}`;
     nextTemplateItemId += 1;
     item.tabIndex = 0;
     item.setAttribute("role", "button");
     item.setAttribute("aria-label", type === "mini-cal" ? "Mini calendar widget" : "Sticky note");

     sizeLabel.className = "item-size-label";
     sizeLabel.setAttribute("aria-hidden", "true");
     controls.className = `item-controls item-controls-${type}`;
     controls.dataset.ownerId = item.dataset.templateId;
     controls.setAttribute("role", "menu");
     controlTabs.className = "item-control-tabs";
     controlTabs.setAttribute("role", "tablist");
     actionsTab.className = "item-control-tab";
     actionsTab.type = "button";
     actionsTab.textContent = "Actions";
     actionsTab.dataset.itemControlTab = "actions";
     actionsTab.setAttribute("role", "tab");
     styleTab.className = "item-control-tab";
     styleTab.type = "button";
     styleTab.textContent = "Style";
     styleTab.dataset.itemControlTab = "style";
     styleTab.setAttribute("role", "tab");
     widgetTab.className = "item-control-tab";
     widgetTab.type = "button";
     widgetTab.textContent = "Widget";
     widgetTab.dataset.itemControlTab = "widget";
     widgetTab.setAttribute("role", "tab");
     actionsPanel.className = "item-control-panel";
     actionsPanel.dataset.itemControlPanel = "actions";
     actionsPanel.setAttribute("role", "tabpanel");
     stylePanel.className = "item-control-panel";
     stylePanel.dataset.itemControlPanel = "style";
     stylePanel.setAttribute("role", "tabpanel");
     widgetPanel.className = "item-control-panel item-widget-panel";
     widgetPanel.dataset.itemControlPanel = "widget";
     widgetPanel.setAttribute("role", "tabpanel");
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
     fillInput.value = type === "mini-cal" ? "#ffffff" : "#f9e2af";
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
     deleteButton.setAttribute("aria-label", "Delete planner item");
     weekNumberLabel.className = "item-control-row item-widget-control";
     weekNumberLabel.textContent = "Week #";
     weekNumberInput.type = "checkbox";
     weekNumberInput.checked = true;
     weekNumberInput.dataset.widgetControl = "week-numbers";
     weekNumberInput.setAttribute("aria-label", "Show week numbers");
     weekStartLabel.className = "item-control-row item-widget-control";
     weekStartLabel.textContent = "Week start";
     weekStartSelect.dataset.widgetControl = "week-start";
     weekStartSelect.setAttribute("aria-label", "Calendar week start");
     ["sunday", "monday"].forEach((value) => {
          const option = document.createElement("option");

          option.value = value;
          option.textContent = value[0].toUpperCase() + value.slice(1);
          weekStartSelect.append(option);
     });
     monthLabel.className = "item-control-row item-widget-control";
     monthLabel.textContent = "Month";
     monthSelect.dataset.widgetControl = "month";
     monthSelect.setAttribute("aria-label", "Calendar month");
     calendarMonthNames.forEach((monthName, index) => {
          const option = document.createElement("option");

          option.value = String(index);
          option.textContent = monthName;
          monthSelect.append(option);
     });
     yearLabel.className = "item-control-row item-widget-control";
     yearLabel.textContent = "Year";
     yearSelect.dataset.widgetControl = "year";
     yearSelect.setAttribute("aria-label", "Calendar year");
     for (let year = calendarYearRange.start; year <= calendarYearRange.end; year += 1) {
          const option = document.createElement("option");

          option.value = String(year);
          option.textContent = String(year);
          yearSelect.append(option);
     }

     fillLabel.append(fillInput);
     borderColorLabel.append(borderColorInput);
     borderWidthLabel.append(borderWidthSelect);
     weekNumberLabel.append(weekNumberInput);
     weekStartLabel.append(weekStartSelect);
     monthLabel.append(monthSelect);
     yearLabel.append(yearSelect);
     controlTabs.append(actionsTab, styleTab);
     actionsPanel.append(duplicateButton, groupButton, deleteButton);
     stylePanel.append(fillLabel, borderColorLabel, borderWidthLabel);
     widgetPanel.append(monthLabel, yearLabel, weekNumberLabel, weekStartLabel);
     if (type === "mini-cal") {
          controlTabs.append(widgetTab);
     }
     controls.append(controlTabs, actionsPanel, stylePanel, widgetPanel);
     setItemControlsTab(controls, "actions");
     item.append(sizeLabel, controls);
     setItemStyle(item, {
          fillColor: type === "mini-cal" ? "transparent" : fillInput.value,
          borderColor: borderColorInput.value,
          borderWidth: borderWidthSelect.value
     });
     if (type === "mini-cal") {
          setMiniCalSettings(item);
     }

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
          openItemMenu(item);
     });
     controls.addEventListener("pointerdown", (event) => event.stopPropagation());
     controls.addEventListener("click", (event) => event.stopPropagation());
     controls.querySelectorAll("[data-item-control-tab]").forEach((tab) => {
          tab.addEventListener("click", () => setItemControlsTab(controls, tab.dataset.itemControlTab));
     });
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
          applyStyleToActionItems(item, {
               fillColor: fillInput.value
          });
     });
     borderColorInput.addEventListener("input", () => {
          applyStyleToActionItems(item, {
               borderColor: borderColorInput.value
          });
     });
     borderWidthSelect.addEventListener("change", () => {
          applyStyleToActionItems(item, {
               borderWidth: borderWidthSelect.value
          });
     });
     weekNumberInput.addEventListener("change", () => {
          setMiniCalSettings(item, {
               weekNumbers: weekNumberInput.checked ? "true" : "false"
          });
          notifyTemplateChanged();
     });
     weekStartSelect.addEventListener("change", () => {
          setMiniCalSettings(item, {
               weekStart: weekStartSelect.value
          });
          notifyTemplateChanged();
     });
     monthSelect.addEventListener("change", () => {
          setMiniCalSettings(item, {
               month: monthSelect.value
          });
          notifyTemplateChanged();
     });
     yearSelect.addEventListener("change", () => {
          setMiniCalSettings(item, {
               year: yearSelect.value
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

     markGridState(item, true, page);
     plannerDesk.append(item);
     setItemBox(item, box);
     selectItem(item);

     return item;
}

function copyItemConfiguration(source, target) {
     setItemStyle(target, {
          fillColor: source.dataset.fillColor,
          borderColor: source.dataset.borderColor,
          borderWidth: source.dataset.borderWidth
     });
     if (source.dataset.itemType === "mini-cal") {
          setMiniCalSettings(target, {
               weekNumbers: source.dataset.weekNumbers,
               weekStart: source.dataset.weekStart,
               month: source.dataset.month,
               year: source.dataset.year
          });
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
     const duplicate = makePlannerItem(item.dataset.itemType || "sticky");
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
          const duplicate = makePlannerItem(item.dataset.itemType || "sticky");
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

     plannerDesk.append(item);
     item.classList.remove("is-floating-source");
     markGridState(item, true, page);
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

               plannerDesk.append(item);
               markGridState(item, true, destinationPage);
               setItemBox(item, {
                    ...nextBox,
                    x: snap(nextBox.x, grid.x),
                    y: snap(nextBox.y, grid.y),
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
     if (event.button !== 0 || event.target.closest(".planner-item, .sticky-note, .planner-settings, .page-snap-controls")) {
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
     movingItems.forEach((movingItem) => movingItem.classList.add("is-dragging"));

     try {
          item.setPointerCapture(event.pointerId);
     } catch {
     }
}

function startSourceMove(event) {
     const source = event.currentTarget;
     const item = makePlannerItem(source.dataset.createType || "sticky");
     const sourceRect = source.getBoundingClientRect();
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

     if (activeAction.type === "sidebar-move" || activeAction.type === "sidebar-resize") {
          try {
               plannerSettings.releasePointerCapture(event.pointerId);
          } catch {
          }

          if (activeAction.type === "sidebar-move" && activeAction.hasMoved) {
               const snapPosition = getNearestSidebarSnapPosition(getSidebarBox().centerX);
               const box = {
                    ...getSidebarBox(),
                    centerX: getSidebarSnapCenter(getSidebarBox().width, snapPosition)
               };

               plannerSettings.dataset.snapPosition = snapPosition;
               setSidebarBox(box);
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
     serializeTemplate: serializePlannerTemplate,
     snapViewToPage
};

initializeCustomSelects();
applyPlannerConfig();
if (isSinglePageViewport) {
     viewFocusIndex = 0;
}
applyViewControls();
syncSidebarSnap();
paperSelect.addEventListener("change", changePlannerSetting);
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
pageSnapButtons.forEach((button) => {
     button.addEventListener("click", () => movePageSnap(button.dataset.pageSnap));
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
sidebarSnapButtons.forEach((button) => {
     button.addEventListener("click", () => moveSidebarSnap(button.dataset.sidebarSnap));
});
if (sidebarCollapseButton) {
     sidebarCollapseButton.addEventListener("click", closeSidebar);
}
plannerSettings.addEventListener("pointerdown", (event) => {
     if (event.target.closest("[data-settings-tab], [data-sidebar-snap], [data-sidebar-collapse]")) {
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
sourceItems.forEach((sourceItem) => {
     sourceItem.addEventListener("pointerdown", startSourceMove);
});
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

     if (!event.target.closest(".planner-item") && !event.target.closest(".planner-settings") && !event.target.closest(".page-snap-controls")) {
          clearSelection();
     }
});
window.addEventListener("pointermove", moveActiveItem);
window.addEventListener("pointerup", endActiveItem);
window.addEventListener("pointercancel", endActiveItem);
window.addEventListener("resize", handleWindowResize);
singlePageViewportQuery.addEventListener("change", applyResponsiveViewMode);
