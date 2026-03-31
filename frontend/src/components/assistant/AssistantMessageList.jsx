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
  feedRef,
  showAssistantAvatar = false,
  assistantAvatarSrc = "",
  assistantAvatarAlt = "Assistant avatar"
}) {
  function getIntentLabel(intentKey) {
    if (!intentKey || !intentLabels || typeof intentLabels !== "object") {
      return "";
    }

    if (!Object.prototype.hasOwnProperty.call(intentLabels, intentKey)) {
      return "";
    }

    const label = intentLabels[intentKey];
    return typeof label === "string" ? label.trim() : "";
  }

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
        messages.map((message) => {
          const intentLabel = getIntentLabel(message.pageIntent);
          const recommendedEventTarget =
            message.role === "assistant" &&
            typeof message.recommendedEventSlug === "string" &&
            message.recommendedEventSlug.trim()
              ? `/events/${message.recommendedEventSlug.trim()}`
              : null;
          const visibleActions = Array.isArray(message.suggestedActions)
            ? message.suggestedActions.filter((action) => {
                if (!action?.target) {
                  return false;
                }

                if (
                  recommendedEventTarget &&
                  action.target === recommendedEventTarget
                ) {
                  return false;
                }

                return true;
              })
            : [];
          const actionTargets = new Set(visibleActions.map((action) => action.target));
          const visibleLinks = Array.isArray(message.relatedLinks)
            ? message.relatedLinks.filter((link) => {
                if (!link?.target) {
                  return false;
                }

                if (recommendedEventTarget && link.target === recommendedEventTarget) {
                  return false;
                }

                if (actionTargets.has(link.target)) {
                  return false;
                }

                return true;
              })
            : [];

          return (
          <article
            key={message.id}
            className={
              message.role === "user"
                ? "assistant-message-row assistant-message-row-user"
                : "assistant-message-row assistant-message-row-assistant"
            }
          >
            {message.role === "assistant" && showAssistantAvatar ? (
              <img
                className="assistant-message-avatar"
                src={assistantAvatarSrc}
                alt={assistantAvatarAlt}
                loading="lazy"
              />
            ) : null}

            <div
              className={
                message.role === "user"
                  ? "assistant-message assistant-message-user"
                  : "assistant-message assistant-message-assistant"
              }
            >
              <p>{message.text}</p>

              {message.role === "assistant" && intentLabel ? (
                <small className="assistant-meta">
                  {intentLabel}
                  {typeof message.confidence === "number"
                    ? ` - ${Math.round(message.confidence * 100)}%`
                    : ""}
                </small>
              ) : null}

              {recommendedEventTarget ? (
                <div className="assistant-recommendation-card">
                  <p className="assistant-recommendation-label">{recommendationLabel}</p>
                  <p className="assistant-recommendation-title">
                    {formatSlugLabel(message.recommendedEventSlug)}
                  </p>
                  <button
                    type="button"
                    className="assistant-recommendation-button"
                    onClick={() =>
                      onActionClick(
                        {
                          type: "event",
                          label: openRecommendationLabel,
                          target: recommendedEventTarget
                        },
                        buildMeta(message, "recommended-event")
                      )
                    }
                  >
                    {openRecommendationLabel}
                  </button>
                </div>
              ) : null}

              {visibleActions.length > 0 ? (
                <div className="assistant-actions">
                  {visibleActions.map((action) => (
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

              {visibleLinks.length > 0 ? (
                <div className="assistant-links">
                  {visibleLinks.map((link) => {
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
            </div>
          </article>
          );
        })
      ) : (
        <article className="assistant-empty-state">
          <p>{emptyState}</p>
        </article>
      )}

      {isSending ? (
        <article className="assistant-message-row assistant-message-row-assistant">
          {showAssistantAvatar ? (
            <img
              className="assistant-message-avatar"
              src={assistantAvatarSrc}
              alt={assistantAvatarAlt}
              loading="lazy"
            />
          ) : null}
          <div className="assistant-message assistant-message-assistant">
            <p>{thinkingLabel}</p>
          </div>
        </article>
      ) : null}
    </div>
  );
}

export default AssistantMessageList;
