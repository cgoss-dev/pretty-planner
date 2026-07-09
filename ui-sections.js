// NOTE: Creates a collapsible control section button and places the provided controls under it.
function createControlSection(title, elements = [], isOpen = false) {
  const section = document.createElement("section");
  const toggle = document.createElement("button");
  const body = document.createElement("div");
  const bodyId = `control-section-${controlSectionId}`;

  controlSectionId += 1;
  section.className = "control-section";
  section.dataset.controlSection = "true";
  section.dataset.controlSectionTitle = title;
  section.classList.toggle("is-open", isOpen);
  toggle.className = "control-section-button";
  toggle.type = "button";
  toggle.dataset.controlSectionToggle = "true";
  toggle.textContent = title;
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-controls", bodyId);
  toggle.style.setProperty(
    "--section-button-units",
    String(getControlSectionButtonUnits(title)),
  );
  body.className = "control-section-body";
  body.dataset.controlSectionBody = "true";
  body.id = bodyId;
  body.hidden = !isOpen;
  elements.forEach((element) => {
    if (element) {
      body.append(element);
    }
  });
  section.append(toggle, body);

  return section;
}

function setControlSectionOpen(section, isOpen) {
  const toggle = section?.querySelector(
    ":scope > [data-control-section-toggle]",
  );
  const body = section?.querySelector(":scope > [data-control-section-body]");

  if (!section || !toggle || !body) {
    return;
  }

  section.classList.toggle("is-open", isOpen);
  toggle.setAttribute("aria-expanded", String(isOpen));
  body.hidden = !isOpen;
}

// NOTE: Closes a control section and any inline color matrix it contains.
function closeControlSection(section) {
  if (!section) {
    return;
  }

  if (section.contains(colorMatrixPopover)) {
    setColorMatrixOpen(false);
  }
  setControlSectionOpen(section, false);
}

function closeControlSections(root = document) {
  root
    .querySelectorAll("[data-control-section].is-open")
    .forEach(closeControlSection);
}

// NOTE: Opens one control section and closes its sibling sections in the same panel.
function openControlSection(section) {
  const panel = section?.closest(".control-panel-page, .widget-panel-page");

  if (!section || !panel) {
    return;
  }

  panel.querySelectorAll(":scope > .control-section").forEach((sibling) => {
    setControlSectionOpen(sibling, sibling === section);
  });
}

function toggleControlSection(section) {
  if (section?.classList.contains("is-open")) {
    closeControlSection(section);
    return;
  }

  openControlSection(section);
}

// NOTE: Attaches click behavior to control section buttons and keeps all sections closed by default.
function initializeControlSections(root = document) {
  root.querySelectorAll("[data-control-section]").forEach((section) => {
    const toggle = section.querySelector(
      ":scope > [data-control-section-toggle]",
    );
    const body = section.querySelector(":scope > [data-control-section-body]");
    const isOpen = section.classList.contains("is-open");

    if (!toggle || !body) {
      return;
    }

    toggle.setAttribute("aria-expanded", String(isOpen));
    body.hidden = !isOpen;
    if (section.dataset.controlSectionReady === "true") {
      return;
    }

    section.dataset.controlSectionReady = "true";
    toggle.addEventListener("click", () => toggleControlSection(section));
  });

  const panels = [];

  if (root.matches?.(".control-panel-page, .widget-panel-page")) {
    panels.push(root);
  }
  panels.push(
    ...root.querySelectorAll(".control-panel-page, .widget-panel-page"),
  );
  panels.forEach((panel) => {
    const sections = Array.from(
      panel.querySelectorAll(":scope > [data-control-section]"),
    );

    panel.classList.toggle("is-sectioned-panel", sections.length > 0);
    if (sections.length) {
      panel.style.setProperty(
        "--control-section-count",
        String(sections.length),
      );
    }
  });
}

// NOTE: Converts the Notebook tab's current controls into one-open-at-a-time section buttons.
function initializeNotebookControlSections() {
  const pagePanel = document.querySelector("[data-control-panel-page='page']");

  if (!pagePanel || pagePanel.dataset.controlSectionsWrapped === "true") {
    return;
  }

  const children = Array.from(pagePanel.children);
  const guideField = children.find((child) =>
    child.querySelector?.("[data-guide]"),
  );
  const paperField = children.find((child) =>
    child.querySelector?.("[data-setting='paper']"),
  );
  const deskField = children.find((child) =>
    child.querySelector?.("[data-setting='desk-color']"),
  );
  const paperColorField = children.find((child) =>
    child.querySelector?.("[data-palette-preview-swatches]"),
  );
  const accentColorField = children.find((child) =>
    child.querySelector?.("[data-accent-palette-swatches]"),
  );
  const sections = [
    ["Guides", guideField],
    ["Desk", deskField],
    ["Notebook", paperField],
    ["Paper", paperColorField],
    ["Accent", accentColorField],
  ];
  const anchor =
    children.find((child) => child.classList?.contains("page-panel-actions")) ||
    null;

  sections.forEach(([title, element]) => {
    if (!element) {
      return;
    }

    pagePanel.insertBefore(
      createControlSection(title, [element], false),
      anchor,
    );
  });

  pagePanel.dataset.controlSectionsWrapped = "true";
  initializeControlSections(pagePanel);
}

function getSelectFocusMenu(dropdown) {
  return dropdown.closest(".control-panel, .widget-panel");
}

function getSelectFocusPanel(dropdown) {
  return dropdown.closest(".control-panel-page, .widget-panel-page");
}

function getSelectFocusRow(dropdown) {
  return (
    dropdown.closest(".control-section") ||
    dropdown.closest(
      "label, .control-field, .palette-preview, .widget-panel-row",
    )
  );
}

function rememberSelectPanelScroll(dropdown) {
  const panel = getSelectFocusPanel(dropdown);

  if (!panel) {
    return;
  }

  dropdown.dataset.selectScrollTop = String(panel.scrollTop);
  dropdown.dataset.selectScrollLeft = String(panel.scrollLeft);
}

function restoreSelectPanelScroll(dropdown) {
  const panel = getSelectFocusPanel(dropdown);
  const hasTop = Object.prototype.hasOwnProperty.call(
    dropdown.dataset,
    "selectScrollTop",
  );
  const hasLeft = Object.prototype.hasOwnProperty.call(
    dropdown.dataset,
    "selectScrollLeft",
  );

  if (!panel || !hasTop || !hasLeft) {
    return;
  }

  const scrollTop = Number(dropdown.dataset.selectScrollTop);
  const scrollLeft = Number(dropdown.dataset.selectScrollLeft);

  if (!Number.isFinite(scrollTop) || !Number.isFinite(scrollLeft)) {
    return;
  }

  panel.scrollTop = scrollTop;
  panel.scrollLeft = scrollLeft;
  requestAnimationFrame(() => {
    panel.scrollTop = scrollTop;
    panel.scrollLeft = scrollLeft;
  });
}

function clearRememberedSelectPanelScroll(dropdown) {
  delete dropdown.dataset.selectScrollTop;
  delete dropdown.dataset.selectScrollLeft;
}

function animateSelectFocusRow(row, fromRect) {
  if (
    !row ||
    !fromRect ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const toRect = row.getBoundingClientRect();
  const deltaX = fromRect.left - toRect.left;
  const deltaY = fromRect.top - toRect.top;

  if (Math.abs(deltaX) < 1 && Math.abs(deltaY) < 1) {
    return;
  }

  row.animate(
    [
      {
        opacity: 0.86,
        transform: `translate(${deltaX}px, ${deltaY}px)`,
      },
      {
        opacity: 1,
        transform: "translate(0, 0)",
      },
    ],
    {
      duration: 200,
      easing: "cubic-bezier(0.2, 0.85, 0.25, 1)",
    },
  );
}

function clearSelectFocus(scope = document, shouldAnimate = true) {
  const focusRows = shouldAnimate
    ? Array.from(scope.querySelectorAll(".is-select-focus")).map((row) => ({
        row,
        rect: row.getBoundingClientRect(),
      }))
    : [];

  scope
    .querySelectorAll(".is-select-focused")
    .forEach((element) => element.classList.remove("is-select-focused"));
  scope
    .querySelectorAll(".is-select-focus")
    .forEach((element) => element.classList.remove("is-select-focus"));
  scope
    .querySelectorAll(".is-select-focus-group")
    .forEach((element) => element.classList.remove("is-select-focus-group"));
  scope
    .querySelectorAll(".custom-select")
    .forEach((dropdown) =>
      dropdown.style.removeProperty("--select-focus-options-height"),
    );
  focusRows.forEach(({ row, rect }) => animateSelectFocusRow(row, rect));
}

function closeCustomSelects(scope = document) {
  scope
    .querySelectorAll(".custom-select[open]")
    .forEach((dropdown) => dropdown.removeAttribute("open"));
}

function updateSelectFocusSpace(dropdown) {
  const menu = getSelectFocusMenu(dropdown);
  const summary = dropdown.querySelector("summary");

  if (!menu || !summary || !dropdown.open) {
    return;
  }

  const menuRect = menu.getBoundingClientRect();
  const summaryRect = summary.getBoundingClientRect();
  const opensUp = Boolean(dropdown.closest(".widget-option-time-group"));
  const availableSpace = opensUp
    ? summaryRect.top - menuRect.top - 12
    : menuRect.bottom - summaryRect.bottom - 12;
  let availableHeight = Math.max(92, Math.floor(availableSpace));

  if (["font", "text-font"].includes(dropdown.dataset.customSelect)) {
    availableHeight = Math.min(availableHeight, 300);
  }

  dropdown.style.setProperty(
    "--select-focus-options-height",
    `${availableHeight}px`,
  );
}

function setSelectFocus(dropdown) {
  const menu = getSelectFocusMenu(dropdown);
  const panel = getSelectFocusPanel(dropdown);
  const row = getSelectFocusRow(dropdown);
  const group = row
    ? row.closest(
        ".text-panel-control-row, .widget-option-group, .item-calendar-attributes-grid",
      )
    : null;

  if (!menu || !panel || !row) {
    return;
  }

  if (menu.classList.contains("widget-panel")) {
    updateSelectFocusSpace(dropdown);
    return;
  }

  const startRect = row.getBoundingClientRect();

  clearSelectFocus(menu, false);
  menu.classList.add("is-select-focused");
  panel.classList.add("is-select-focused");
  row.classList.add("is-select-focus");

  if (group) {
    group.classList.add("is-select-focus-group");
  }

  requestAnimationFrame(() => {
    updateSelectFocusSpace(dropdown);
    animateSelectFocusRow(row, startRect);
  });
}

function makeCustomSelect(select) {
  if (select.dataset.stepperSelect === "true") {
    updateCustomSelectDisplay(select);
    return select.nextElementSibling;
  }

  if (shouldUseButtonSelect(select)) {
    return makeButtonSelect(select);
  }

  const dropdown = document.createElement("details");
  const summary = document.createElement("summary");
  const optionsBox = document.createElement("div");

  if (select.nextElementSibling?.classList.contains("button-select")) {
    select.nextElementSibling.remove();
  }

  if (select.nextElementSibling?.classList.contains("custom-select")) {
    return select.nextElementSibling;
  }

  select.classList.add("native-select");
  dropdown.className = "custom-select";
  dropdown.dataset.customSelect =
    select.dataset.setting ||
    select.dataset.styleControl ||
    select.dataset.textControl ||
    select.dataset.widgetControl ||
    select.dataset.defaultControl ||
    "";
  summary.setAttribute("role", "button");
  optionsBox.className = "custom-select-options";

  dropdown.append(summary, optionsBox);
  select.after(dropdown);
  buildCustomSelectOptions(select, dropdown);
  updateCustomSelectDisplay(select);
  summary.addEventListener("pointerdown", () => {
    rememberSelectPanelScroll(dropdown);
  });
  summary.addEventListener("keydown", (event) => {
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
      rememberSelectPanelScroll(dropdown);
    }
  });
  dropdown.addEventListener("toggle", () => {
    if (dropdown.open) {
      if (
        !Object.prototype.hasOwnProperty.call(
          dropdown.dataset,
          "selectScrollTop",
        )
      ) {
        rememberSelectPanelScroll(dropdown);
      }
      customSelectDetails.forEach((details) => {
        if (details !== dropdown) {
          details.removeAttribute("open");
        }
      });
      updateSelectFocusSpace(dropdown);
      restoreSelectPanelScroll(dropdown);
    } else {
      const menu = getSelectFocusMenu(dropdown);

      if (!menu || !menu.querySelector(".custom-select[open]")) {
        clearSelectFocus(menu || document);
      }
      clearRememberedSelectPanelScroll(dropdown);
    }
  });

  if (!customSelectDetails.includes(dropdown)) {
    customSelectDetails.push(dropdown);
  }

  return dropdown;
}

function initializeCustomSelects() {
  settingSelects.forEach(makeCustomSelect);
}

function syncObjectControlsTab(tabName) {
  if (!objectControlsShell) {
    return;
  }

  const controls = objectControlsShell.querySelector(".widget-panel");
  const itemPanelNames = getObjectControlWidgetPanelPageNames(tabName);

  if (controls && itemPanelNames.length) {
    setWidgetPanelVisiblePanels(controls, itemPanelNames);
  }
}

function getObjectControlWidgetPanelPageNames(tabName) {
  return (
    {
      "object-selected": ["text", "widget"],
    }[tabName] || []
  );
}

function setWidgetPanelVisiblePanels(controls, panelNames) {
  closeCustomSelects(controls);
  clearSelectFocus(controls);
  controls.dataset.activeWidgetPanelTab = panelNames.join("-");

  controls.querySelectorAll("[data-widget-panel-tab]").forEach((tab) => {
    const isActive = panelNames.includes(tab.dataset.widgetPanelTab);

    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  controls.querySelectorAll("[data-widget-panel-page]").forEach((panel) => {
    panel.hidden = !panelNames.includes(panel.dataset.widgetPanelPage);
  });
}

function isObjectControlTab(tabName) {
  return tabName.startsWith("object-");
}

function selectControlPanelTab(tabName) {
  closeCustomSelects(controlPanel);
  clearSelectFocus(controlPanel);
  closeControlSections(controlPanel);

  controlPanelTabs.forEach((tab) => {
    const isActive = tab.dataset.controlPanelTab === tabName;

    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  controlPanelPages.forEach((panel) => {
    const isObjectPanel =
      isObjectControlTab(tabName) &&
      panel.dataset.controlPanelPage === "object";

    panel.hidden = !isObjectPanel && panel.dataset.controlPanelPage !== tabName;
  });
  updateControlPanelFocusState();

  syncObjectControlsTab(tabName);

  const activeTab = controlPanelTabs.find(
    (tab) => tab.dataset.controlPanelTab === tabName,
  );

  if (activeTab) {
    controlPanel.style.setProperty(
      "--active-controls-color",
      "var(--menu-fill)",
    );
  }

  updateControlPanelSteps(tabName);
  updateObjectControlsState();
}

function getActiveControlPanelTabName() {
  return (
    controlPanelTabs.find((tab) => tab.getAttribute("aria-selected") === "true")
      ?.dataset.controlPanelTab ||
    controlPanelTabs[0]?.dataset.controlPanelTab ||
    ""
  );
}

function updateControlPanelSteps(tabName = getActiveControlPanelTabName()) {
  const activeIndex = controlPanelTabs.findIndex(
    (tab) => tab.dataset.controlPanelTab === tabName,
  );

  controlPanelStepButtons.forEach((button) => {
    const step = Number(button.dataset.controlPanelStep) || 0;
    const nextIndex = getNextEnabledControlPanelTabIndex(activeIndex, step);
    const isDisabled = nextIndex === activeIndex;

    if ("disabled" in button) {
      button.disabled = isDisabled;
    }
    button.setAttribute("aria-disabled", String(isDisabled));
  });
}

function getNextEnabledControlPanelTabIndex(activeIndex, step) {
  let nextIndex = activeIndex;

  while (true) {
    const candidateIndex = nextIndex + step;

    if (candidateIndex < 0 || candidateIndex >= controlPanelTabs.length) {
      return activeIndex;
    }

    nextIndex = candidateIndex;
    if (!controlPanelTabs[nextIndex].disabled) {
      return nextIndex;
    }
  }
}

function stepControlPanelTab(step) {
  const activeIndex = controlPanelTabs.findIndex(
    (tab) => tab.getAttribute("aria-selected") === "true",
  );
  const nextIndex = getNextEnabledControlPanelTabIndex(activeIndex, step);
  const nextTab = controlPanelTabs[nextIndex];

  if (nextIndex === activeIndex || !nextTab || nextTab.disabled) {
    return;
  }

  selectControlPanelTab(nextTab.dataset.controlPanelTab);
  openControlPanel();
}

function updateObjectControlsState() {
  if (!objectControlsShell || !objectControlsEmpty) {
    return;
  }

  const hasSelection =
    typeof selectedItems !== "undefined" &&
    selectedItems.size > 0 &&
    selectedItem;
  const controls = objectControlsShell.querySelector(".widget-panel");
  const hasControls = Boolean(hasSelection && controls);

  objectControlsShell.classList.toggle("is-inactive", !hasControls);
  objectControlsEmpty.hidden = hasControls;
  controlPanelTabs
    .filter((tab) => isObjectControlTab(tab.dataset.controlPanelTab || ""))
    .forEach((tab) => {
      const itemPanelNames = getObjectControlWidgetPanelPageNames(
        tab.dataset.controlPanelTab || "",
      );
      const hasItemPanel = itemPanelNames.some((panelName) =>
        Boolean(
          controls?.querySelector(`[data-widget-panel-page="${panelName}"]`),
        ),
      );
      const isDisabled = !hasControls || !hasItemPanel;

      tab.disabled = isDisabled;
      tab.setAttribute("aria-disabled", String(isDisabled));
    });

  const activeTab = controlPanelTabs.find(
    (tab) => tab.getAttribute("aria-selected") === "true",
  );

  if (
    activeTab &&
    isObjectControlTab(activeTab.dataset.controlPanelTab || "") &&
    activeTab.disabled
  ) {
    const fallbackObjectTab = controlPanelTabs.find(
      (tab) =>
        isObjectControlTab(tab.dataset.controlPanelTab || "") && !tab.disabled,
    );
    const fallbackTab =
      fallbackObjectTab ||
      controlPanelTabs.find((tab) => tab.dataset.controlPanelTab === "guide");

    if (fallbackTab) {
      selectControlPanelTab(fallbackTab.dataset.controlPanelTab);
    }
  } else if (
    activeTab &&
    hasControls &&
    isObjectControlTab(activeTab.dataset.controlPanelTab || "")
  ) {
    syncObjectControlsTab(activeTab.dataset.controlPanelTab);
  }
}

function updateClipboardControls() {
  document
    .querySelectorAll("[data-clipboard-action='paste']")
    .forEach((button) => {
      button.disabled = !plannerClipboard;
    });
}

function updateControlPanelFocusState() {
  const isOpen = controlPanel.classList.contains("is-open");

  controlPanelPages.forEach((panel) => {
    panel.inert = !isOpen;
    panel.setAttribute("aria-hidden", String(!isOpen || panel.hidden));
  });
}

function openControlPanel() {
  controlPanel.classList.add("is-open");
  plannerMainMenu?.classList.add("is-open");
  mainMenuToggleButton?.setAttribute("aria-expanded", "true");
  plannerDesk.classList.add("has-open-control-panel");
  updateControlPanelFocusState();
  renderKeyHints();
}

function closeControlPanel() {
  closeCustomSelects(controlPanel);
  clearSelectFocus(controlPanel);
  setColorMatrixOpen(false);
  controlPanel.classList.remove("is-open");
  plannerMainMenu?.classList.remove("is-open");
  mainMenuToggleButton?.setAttribute("aria-expanded", "false");
  plannerDesk.classList.remove("has-open-control-panel");
  updateControlPanelFocusState();
  renderKeyHints();
}

function isPointerInsideElementBox(event, element) {
  const rect = element.getBoundingClientRect();

  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

function collapseMenusFromOutsidePointer(event) {
  if (event.target.closest("[data-create-item]")) {
    return;
  }

  if (
    event.target.closest("[data-color-panel-matrix], [data-color-panel-hex]")
  ) {
    return;
  }

  if (
    controlPanel.classList.contains("is-open") &&
    !isPointerInsideElementBox(event, controlPanel)
  ) {
    closeControlPanel();
  }
}

function syncControlPanelSnap() {
  delete controlPanel.dataset.width;
  controlPanel.style.width = "";
  delete controlPanel.dataset.height;
  controlPanel.style.height = "";
  delete controlPanel.dataset.centerX;
  controlPanel.style.left = "";
  controlPanel.style.top = "";
  if (typeof syncControlPanelHintAnchor === "function") {
    syncControlPanelHintAnchor();
  }
}

function getControlPanelCenter(width) {
  const deskRect = plannerDesk.getBoundingClientRect();
  const minCenter = width / 2 + 12;
  const maxCenter = deskRect.width - width / 2 - 12;
  const preferredCenter = deskRect.width / 2;

  return clamp(preferredCenter, minCenter, maxCenter);
}
