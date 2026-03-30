function formatSlugLabel(slug) {
  if (typeof slug !== "string" || !slug.trim()) {
    return "";
  }

  return slug
    .trim()
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function AssistantMessageList({
  messages,
  isSending,
  thinkingLabel,
  intentLabels,
  recommendationLabel,
  openRecommendationLabel,
  onActionClick,
  emptyState,
  className = "",
  feedRef
}) {
  function buildMeta(message, clickType) {
    return {
      interactionId: message.interactionId || null,
      pageIntent: message.pageIntent || null,
      recommendedEventSlug: message.recommendedEventSlug || null,
      clickType
    };
  }

  return (
    <div className={`assistant-feed ${className}`.trim()} ref={feedRef} aria-live="polite">
      {Array.isArray(messages) && messages.length > 0 ? (
        messages.map((message) => (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? "assistant-message assistant-message-user"
                : "assistant-message assistant-message-assistant"
            }
          >
            <p>{message.text}</p>

            {message.role === "assistant" && message.pageIntent ? (
              <small className="assistant-meta">
                {intentLabels?.[message.pageIntent] || message.pageIntent}
                {typeof message.confidence === "number"
                  ? ` - ${Math.round(message.confidence * 100)}%`
                  : ""}
              </small>
            ) : null}

            {message.role === "assistant" &&
            typeof message.recommendedEventSlug === "string" &&
            message.recommendedEventSlug.trim() ? (
              <div className="assistant-recommendation-card">
                <p className="assistant-recommendation-label">{recommendationLabel}</p>
                <p className="assistant-recommendation-title">
                  {formatSlugLabel(message.recommendedEventSlug)}
                </p>
                <button
                  type="button"
                  className="assistant-recommendation-button"
                  onClick={() =>
                    onActionClick({
                      type: "event",
                      label: openRecommendationLabel,
                      target: `/events/${message.recommendedEventSlug}`
                    }, buildMeta(message, "recommended-event"))
                  }
                >
                  {openRecommendationLabel}
                </button>
              </div>
            ) : null}

            {Array.isArray(message.suggestedActions) &&
            message.suggestedActions.length > 0 ? (
              <div className="assistant-actions">
                {message.suggestedActions.map((action) => (
                  <button
                    key={`${action.type}-${action.target}-${action.label}`}
                    type="button"
                    className="assistant-action"
                    onClick={() => onActionClick(action, buildMeta(message, "suggested-action"))}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}

            {Array.isArray(message.relatedLinks) && message.relatedLinks.length > 0 ? (
              <div className="assistant-links">
                {message.relatedLinks.map((link) => {
                  const isInternal = link.target.startsWith("/");
                  if (isInternal) {
                    return (
                      <button
                        key={`${link.label}-${link.target}`}
                        type="button"
                        className="assistant-link-button"
                        onClick={() =>
                          onActionClick({
                            type: "route",
                            label: link.label,
                            target: link.target
                          }, buildMeta(message, "related-link"))
                        }
                      >
                        {link.label}
                      </button>
                    );
                  }

                  return (
                    <button
                      key={`${link.label}-${link.target}`}
                      type="button"
                      className="assistant-link-button"
                      onClick={() =>
                        onActionClick(
                          {
                            type: "external",
                            label: link.label,
                            target: link.target
                          },
                          buildMeta(message, "related-link")
                        )
                      }
                    >
                      {link.label}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </article>
        ))
      ) : (
        <article className="assistant-empty-state">
          <p>{emptyState}</p>
        </article>
      )}

      {isSending ? (
        <article className="assistant-message assistant-message-assistant">
          <p>{thinkingLabel}</p>
        </article>
      ) : null}
    </div>
  );
}

export default AssistantMessageList;
