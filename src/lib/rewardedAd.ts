// The SDK is injected so lifecycle tests never load or show a real advertisement.
export type AdPhase = "loading" | "ready" | "watching" | "completed" | "dismissed" | "error" | "unsupported" | "busy" | "ineligible";
export interface AdStatus { phase: AdPhase; rewardGranted: boolean }
interface AdRequest {
  options: { adGroupId: string };
  onEvent: (event: { type: string }) => void;
  onError: (error: unknown) => void;
}
type AdMethod = ((request: AdRequest) => (() => void)) & { isSupported?: () => boolean };
export interface RewardedAdSdk { loadAppsInTossAdMob: AdMethod; showAppsInTossAdMob: AdMethod }
interface SessionOptions {
  groupId: string;
  sdk: RewardedAdSdk;
  getOwnerKey: () => string;
  isEligible: () => boolean;
  canReward?: () => boolean;
  onReward: (ownerKey: string) => boolean;
  onStatus: (status: AdStatus) => void;
}

// Growth and pest rewards use the same SDK group. Lock before any async callback.
const activeGroups = new Map<string, symbol>();
export function createRewardedAdSession(options: SessionOptions) {
  const token = Symbol("rewarded-ad-session");
  let status: AdStatus = { phase: "loading", rewardGranted: false };
  let started = false;
  let active = false;
  let owner = "";
  let rewardHandled = false;
  let rewardRejected = false;
  let loadCleanup: (() => void) | undefined;
  let showCleanup: (() => void) | undefined;
  let loadTimeout: ReturnType<typeof setTimeout> | undefined;
  const publish = (phase: AdPhase) => {
    status = { ...status, phase };
    options.onStatus(status);
  };
  const clean = (callback?: () => void) => { try { callback?.(); } catch { /* Clean up the other subscription too. */ } };
  const clearLoadTimeout = () => { if (loadTimeout) clearTimeout(loadTimeout); loadTimeout = undefined; };
  const eligible = (check = options.isEligible) => {
    try { return owner !== "" && options.getOwnerKey() === owner && check(); }
    catch { return false; }
  };
  const supported = (method: AdMethod) => { try { return method.isSupported?.() === true; } catch { return false; } };
  const finish = (phase: AdPhase, notify = true) => {
    active = false; // Invalidate callbacks before invoking SDK cleanup.
    clearLoadTimeout();
    const load = loadCleanup; const show = showCleanup;
    loadCleanup = undefined; showCleanup = undefined;
    clean(load); clean(show);
    if (activeGroups.get(options.groupId) === token) activeGroups.delete(options.groupId);
    if (notify) publish(phase); else status = { ...status, phase };
  };
  return {
    load() {
      if (started) return;
      started = true;
      try { owner = options.getOwnerKey(); } catch { finish("ineligible"); return; }
      if (!eligible()) { finish("ineligible"); return; }
      if (!options.groupId || !supported(options.sdk.loadAppsInTossAdMob) || !supported(options.sdk.showAppsInTossAdMob)) {
        finish("unsupported"); return;
      }
      if (activeGroups.has(options.groupId)) { finish("busy"); return; }
      activeGroups.set(options.groupId, token);
      active = true;
      publish("loading");
      // This bounds loading only; it never estimates or completes ad watching.
      loadTimeout = setTimeout(() => { if (active && status.phase === "loading") finish("error"); }, 15000);
      try {
        const cleanup = options.sdk.loadAppsInTossAdMob({
          options: { adGroupId: options.groupId },
          onEvent: event => {
            if (!active || status.phase !== "loading" || event.type !== "loaded") return;
            clearLoadTimeout();
            if (!eligible()) { finish("ineligible"); return; }
            publish("ready"); // A later explicit user tap is the only route to show().
            const load = loadCleanup; loadCleanup = undefined; clean(load);
          },
          onError: () => { if (active && status.phase === "loading") finish("error"); },
        });
        if (!active || status.phase !== "loading") clean(cleanup); else loadCleanup = cleanup;
      } catch { finish("error"); }
    },
    show() {
      if (!active || status.phase !== "ready") return;
      if (!eligible()) { finish("ineligible"); return; }
      if (!supported(options.sdk.showAppsInTossAdMob)) { finish("unsupported"); return; }
      publish("watching"); // A second tap in the same tick cannot show again.
      try {
        const cleanup = options.sdk.showAppsInTossAdMob({
          options: { adGroupId: options.groupId },
          onEvent: event => {
            if (!active || status.phase !== "watching") return;
            if (event.type === "userEarnedReward" && !rewardHandled) {
              rewardHandled = true;
              try { status = { ...status, rewardGranted: eligible(options.canReward ?? options.isEligible) && options.onReward(owner) }; }
              catch { finish("error"); return; }
              rewardRejected = !status.rewardGranted;
              options.onStatus(status);
            } else if (event.type === "dismissed") {
              finish(status.rewardGranted ? "completed" : rewardRejected ? "ineligible" : "dismissed");
            } else if (event.type === "failedToShow") finish("error");
          },
          onError: () => { if (active) finish("error"); },
        });
        if (!active) clean(cleanup); else showCleanup = cleanup;
      } catch { finish("error"); }
    },
    cancel() { started = true; finish("dismissed", false); },
    getStatus() { return status; },
  };
}
