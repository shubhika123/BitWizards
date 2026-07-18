"use client";

import React, { Suspense, useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { GenieEntranceOverlay } from "../../components/genie/GenieEntranceOverlay";
import { GenieChatScreen } from "../../components/genie/GenieChatScreen";
import { GenieLegacyExperience } from "../../components/genie/GenieLegacyExperience";
import { useGenieUiStore } from "../../store/genieUiStore";

/** Set to true to restore canvas / Digital Twin UI (legacy). */
const SHOW_LEGACY_GENIE_UI = false;

function GeniePageContent() {
  const searchParams = useSearchParams();
  const shouldPlayEntrance = useGenieUiStore((s) => s.shouldPlayEntrance);
  const clearEntrance = useGenieUiStore((s) => s.clearEntrance);
  const pendingQuery = useGenieUiStore((s) => s.pendingQuery);
  const setPendingQuery = useGenieUiStore((s) => s.setPendingQuery);

  const enterParam = searchParams.get("enter") === "1";
  const qFromUrl = searchParams.get("q") ?? "";
  const initialQuery = qFromUrl || pendingQuery || "";

  const [phase, setPhase] = useState<"entrance" | "chat">(() =>
    enterParam || shouldPlayEntrance ? "entrance" : "chat"
  );

  const onEntranceComplete = useCallback(() => {
    clearEntrance();
    setPhase("chat");
    setPendingQuery(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("enter");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    }
  }, [clearEntrance, setPendingQuery]);

  if (SHOW_LEGACY_GENIE_UI) {
    /* LEGACY_GENIE_CANVAS_UI — full canvas, curate, Digital Twin */
    return <GenieLegacyExperience />;
  }

  return (
    <>
      <AnimatePresence>
        {phase === "entrance" && (
          <GenieEntranceOverlay key="entrance" onComplete={onEntranceComplete} />
        )}
      </AnimatePresence>
      {phase === "chat" && <GenieChatScreen initialComposerValue={initialQuery} />}
    </>
  );
}

export default function GeniePage() {
  return (
    <Suspense
      fallback={
        <div className="h-[100dvh] w-full bg-[#f5f5f6] flex items-center justify-center text-[#535766] text-sm font-medium">
          Loading Genie…
        </div>
      }
    >
      <GeniePageContent />
    </Suspense>
  );
}
