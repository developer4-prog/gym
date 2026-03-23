function ensureContainer(container) {
  if (!container) {
    throw new Error("Contenedor no válido en ui-state.js");
  }
  return container;
}

function clearState(container) {
  const safeContainer = ensureContainer(container);
  const oldState = safeContainer.querySelector(".ui-state");
  if (oldState) oldState.remove();
}

function createButton(text, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;

  if (typeof onClick === "function") {
    button.addEventListener("click", onClick);
  }

  return button;
}

function createStateElement({
  type = "",
  title = "",
  message = "",
  actions = [],
}) {
  const wrapper = document.createElement("div");
  wrapper.className = `ui-state ${type ? `ui-state-${type}` : ""}`.trim();

  const titleEl = document.createElement("h3");
  titleEl.className = "ui-state-title";
  titleEl.textContent = title;

  const textEl = document.createElement("p");
  textEl.className = "ui-state-text";
  textEl.textContent = message;

  wrapper.appendChild(titleEl);
  wrapper.appendChild(textEl);

  if (actions.length) {
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "ui-state-actions";

    actions.forEach((action) => {
      const btn = createButton(
        action.label || "Aceptar",
        action.className || "btn-secondary",
        action.onClick,
      );
      actionsWrap.appendChild(btn);
    });

    wrapper.appendChild(actionsWrap);
  }

  return wrapper;
}

function showState(container, config) {
  const safeContainer = ensureContainer(container);
  clearState(safeContainer);

  const stateEl = createStateElement(config);
  safeContainer.prepend(stateEl);
}

function showLoading(container, message = "Cargando...") {
  showState(container, {
    type: "loading",
    title: "Cargando",
    message,
  });
}

function showError(
  container,
  message = "Ocurrió un error inesperado.",
  retryFn,
) {
  const actions = [];

  if (typeof retryFn === "function") {
    actions.push({
      label: "Reintentar",
      className: "btn-primary",
      onClick: retryFn,
    });
  }

  showState(container, {
    type: "error",
    title: "Algo salió mal",
    message,
    actions,
  });
}

function showEmpty(container, message = "No hay datos disponibles.") {
  showState(container, {
    type: "warning",
    title: "Sin datos",
    message,
  });
}

function showSuccess(container, message = "Proceso completado correctamente.") {
  showState(container, {
    type: "success",
    title: "Correcto",
    message,
  });
}

window.UIState = {
  clearState,
  showState,
  showLoading,
  showError,
  showEmpty,
  showSuccess,
};
