import { useCallback } from "react";
import { trackAssistantClick } from "../../services/assistantService";
import { getQuickActionTelemetry, normalizeActionTarget } from "./assistantConfig";

export function useAssistantActionRouter({
  source,
  language,
  pageContext,
  pageSlug,
  sessionId,
  navigate,
  onAfterInternalNavigate
}) {
  const reportClick = useCallback(
    (payload) => {
      trackAssistantClick({
        source,
        language,
        pageContext,
        pageSlug,
        sessionId,
        ...payload
      });
    },
    [language, pageContext, pageSlug, sessionId, source]
  );

  const handleActionClick = useCallback(
    (action, meta = {}) => {
      const target = normalizeActionTarget(action);
      if (!target) {
        return;
      }

      reportClick({
        interactionId: meta.interactionId || null,
        clickType: meta.clickType || "suggested-action",
        actionType: action.type || null,
        pageIntent: meta.pageIntent || null,
        recommendedEventSlug: meta.recommendedEventSlug || null,
        label: action.label || target,
        target
      });

      if (/^https?:\/\//i.test(target)) {
        window.open(target, "_blank", "noopener,noreferrer");
        return;
      }

      navigate(target);
      onAfterInternalNavigate?.();
    },
    [navigate, onAfterInternalNavigate, reportClick]
  );

  const handleQuickActionClick = useCallback(
    (quickAction) => {
      const telemetry = getQuickActionTelemetry(quickAction);
      if (!telemetry) {
        return;
      }

      reportClick({
        clickType: "quick-action",
        actionType: telemetry.id,
        label: telemetry.label,
        target: telemetry.target
      });
    },
    [reportClick]
  );

  return {
    handleActionClick,
    handleQuickActionClick
  };
}
