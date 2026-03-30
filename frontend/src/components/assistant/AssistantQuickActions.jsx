import { getQuickActionPrompt } from "./assistantConfig";

function AssistantQuickActions({ title, actions, onSelect, disabled, className = "" }) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return null;
  }

  return (
    <section className={`assistant-quick-actions ${className}`.trim()}>
      {title ? <p className="assistant-quick-actions-title">{title}</p> : null}
      <div className="assistant-quick-actions-list">
        {actions.map((actionItem, index) => {
          const actionText = getQuickActionPrompt(actionItem);
          if (!actionText) {
            return null;
          }

          const actionKey =
            typeof actionItem === "object" && actionItem?.id
              ? `${actionItem.id}-${index}`
              : `${actionText}-${index}`;

          return (
          <button
            key={actionKey}
            type="button"
            className="assistant-quick-action-button"
            onClick={() => onSelect(actionItem)}
            disabled={disabled}
          >
            {actionText}
          </button>
          );
        })}
      </div>
    </section>
  );
}

export default AssistantQuickActions;
