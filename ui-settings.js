// NOTE: What Happens When Notebook Controls Change
function changePlannerSetting() {
  plannerConfig = buildPlannerConfig();
  applyPlannerConfig();
  notifyTemplateChanged();
}

function syncSettingChoiceInputs(settingName) {
  const select = document.querySelector(`[data-setting='${settingName}']`);

  if (!select) {
    return;
  }

  controlChoiceInputs
    .filter((input) => input.dataset.controlChoice === settingName)
    .forEach((input) => {
      input.checked = input.value === select.value;
    });
}

function syncAllSettingChoiceInputs() {
  ["paper", "desk-color"].forEach(syncSettingChoiceInputs);
}

function changeSettingChoice(input) {
  const settingName = input.dataset.controlChoice;
  const select = document.querySelector(`[data-setting='${settingName}']`);

  if (!select) {
    return;
  }

  if (input.type === "checkbox" && !input.checked) {
    input.checked = true;
    return;
  }

  select.value = input.value;
  syncSettingChoiceInputs(settingName);
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

const Palette = {
  appendColorSwatches,
  closeHexPopover,
  closeHexPopoverFromOutsidePointer,
  createHexButton,
  createColorMatrixToggle,
  getClearColor: getClearPaletteColor,
  getColorKey: getPaletteKeyForColor,
  getGrayColors: getGrayPaletteColors,
  getMatrixRows: getColorMatrixRows,
  getColorMatrixSwatchValue,
  getPalette,
  getPaperColors: getPaperPaletteColors,
  hexToAlphaColor,
  initializeColorControl: initializePaletteColorControl,
  initializePreview: initializePalettePreview,
  openHexPopover,
  positionMatrix: positionColorMatrix,
  renderControl: renderPaletteControl,
  renderMatrix: renderColorMatrix,
  setControlValue: setPaletteControlValue,
  setMatrixOpen: setColorMatrixOpen,
  syncMatrixSwatchSize: syncColorMatrixSwatchSize,
  updateCustomPaperColor,
  updatePreview: updatePalettePreview,
};

const Select = {
  buildOptions: buildCustomSelectOptions,
  clearFocus: clearSelectFocus,
  closeAll: closeCustomSelects,
  getFocusMenu: getSelectFocusMenu,
  getFocusPanel: getSelectFocusPanel,
  getFocusRow: getSelectFocusRow,
  initialize: initializeCustomSelects,
  make: makeCustomSelect,
  setFocus: setSelectFocus,
  sync: syncCustomSelect,
  updateDisplay: updateCustomSelectDisplay,
  updateFocusSpace: updateSelectFocusSpace,
};

const ControlPanel = {
  changeChoice: changeSettingChoice,
  changePlannerSetting,
  getActiveTabName: getActiveControlPanelTabName,
  selectTab: selectControlPanelTab,
  stepTab: stepControlPanelTab,
  syncAllChoiceInputs: syncAllSettingChoiceInputs,
  syncChoiceInputs: syncSettingChoiceInputs,
  syncObjectControlsTab: syncObjectControlsTab,
  updatePanelSteps: updateControlPanelSteps,
};

const ControlPanelSurface = {
  close: closeControlPanel,
  collapseFromOutsidePointer: collapseMenusFromOutsidePointer,
  getCenter: getControlPanelCenter,
  isPointerInsideElementBox,
  open: openControlPanel,
  syncSnap: syncControlPanelSnap,
  updateObjectControlsState,
};

const Clipboard = {
  updateControls: updateClipboardControls,
};

// These module slots are intentionally small for now. As widget creation moves out
// of widgets.js, these become the shared homes for text, widget, and pressed-state UI.
const TextInput = {};
const WidgetStyle = {};
const Selection = {};

window.PlannerUI = {
  Clipboard,
  Palette,
  Select,
  Selection,
  ControlPanel,
  ControlPanelSurface,
  TextInput,
  WidgetStyle,
};
