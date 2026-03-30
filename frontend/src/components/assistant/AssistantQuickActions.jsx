function AssistantQuickActions({ title, actions, onSelect, disabled, className = "" }) {
  if (!Array.isArray(actions) || actions.length === 0) {
    return null;
  }

  return (
    <section className={`assistant-quick-actions ${className}`.trim()}>
      {title ? <p className="assistant-quick-actions-title">{title}</p> : null}
      <div className="assistant-quick-actions-list">
        {actions.map((actionText) => (
          <button
            key={actionText}
            type="button"
            className="assistant-quick-action-button"
            onClick={() => onSelect(actionText)}
            disabled={disabled}
          >
            {actionText}
          </button>
        ))}
      </div>
    </section>
  );
}

export default AssistantQuickActions;
