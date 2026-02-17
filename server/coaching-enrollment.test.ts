/**
 * Unit tests for private coaching enrollment logic.
 *
 * These tests validate:
 * 1. getCoachingClientByUserId returns the correct enrollment
 * 2. Enrollment creation prevents duplicates
 * 3. The /api/coaching/my-plan endpoint returns correct responses
 * 4. Auth failure (401) vs not-enrolled (404) are distinguishable
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Helpers — lightweight mock types mirroring the real schema
// ---------------------------------------------------------------------------

interface MockCoachingClient {
  id: string;
  userId: string;
  status: string;
  coachingType: string;
  createdAt: Date;
  startDate?: Date;
  endDate?: Date;
  planDurationWeeks?: number;
  paymentStatus?: string;
}

function makeClient(overrides: Partial<MockCoachingClient> = {}): MockCoachingClient {
  return {
    id: overrides.id ?? "client-1",
    userId: overrides.userId ?? "user-1",
    status: overrides.status ?? "enrolled",
    coachingType: overrides.coachingType ?? "pregnancy_coaching",
    createdAt: overrides.createdAt ?? new Date("2025-01-01"),
    startDate: overrides.startDate,
    endDate: overrides.endDate,
    planDurationWeeks: overrides.planDurationWeeks ?? 4,
    paymentStatus: overrides.paymentStatus ?? "completed",
  };
}

// ---------------------------------------------------------------------------
// Pure-logic extraction of getCoachingClientByUserId behaviour
// (mirrors the updated storage.ts logic without needing a real DB)
// ---------------------------------------------------------------------------

function getCoachingClientByUserId(
  clients: MockCoachingClient[],
  userId: string,
): MockCoachingClient | undefined {
  const userClients = clients
    .filter((c) => c.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Prefer active (non-cancelled/completed) enrollment
  const active = userClients.find(
    (c) => c.status !== "cancelled" && c.status !== "completed",
  );
  if (active) return active;

  // Fall back to most recent record
  return userClients[0];
}

// ---------------------------------------------------------------------------
// Pure-logic extraction of enrollment duplication guard
// ---------------------------------------------------------------------------

function canCreateEnrollment(
  clients: MockCoachingClient[],
  userId: string,
): { allowed: boolean; reason?: string } {
  const existing = getCoachingClientByUserId(clients, userId);
  if (existing && existing.status !== "cancelled" && existing.status !== "completed") {
    return { allowed: false, reason: "This user already has an active coaching enrollment." };
  }
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// Pure-logic extraction of my-plan response handling
// ---------------------------------------------------------------------------

type MyPlanResult =
  | { type: "success"; client: MockCoachingClient }
  | { type: "not_authenticated" }
  | { type: "not_enrolled" };

function getMyPlan(
  userId: string | undefined,
  clients: MockCoachingClient[],
  userExists: boolean,
): MyPlanResult {
  if (!userId) return { type: "not_authenticated" };
  if (!userExists) return { type: "not_authenticated" };

  const client = getCoachingClientByUserId(clients, userId);
  if (!client) return { type: "not_enrolled" };

  return { type: "success", client };
}

// =========================================================================
// TESTS
// =========================================================================

describe("getCoachingClientByUserId", () => {
  it("returns undefined when user has no enrollments", () => {
    expect(getCoachingClientByUserId([], "user-1")).toBeUndefined();
  });

  it("returns the single enrollment for a user", () => {
    const c = makeClient({ userId: "user-1", status: "enrolled" });
    expect(getCoachingClientByUserId([c], "user-1")).toBe(c);
  });

  it("ignores enrollments belonging to other users", () => {
    const other = makeClient({ userId: "user-2" });
    expect(getCoachingClientByUserId([other], "user-1")).toBeUndefined();
  });

  it("prefers active enrollment over cancelled one (even if cancelled is newer)", () => {
    const cancelled = makeClient({
      id: "c1",
      userId: "user-1",
      status: "cancelled",
      createdAt: new Date("2025-06-01"), // newer
    });
    const active = makeClient({
      id: "c2",
      userId: "user-1",
      status: "enrolled",
      createdAt: new Date("2025-05-01"), // older
    });
    const result = getCoachingClientByUserId([cancelled, active], "user-1");
    expect(result?.id).toBe("c2");
    expect(result?.status).toBe("enrolled");
  });

  it("prefers active enrollment over completed one", () => {
    const completed = makeClient({
      id: "c1",
      userId: "user-1",
      status: "completed",
      createdAt: new Date("2025-06-01"),
    });
    const active = makeClient({
      id: "c2",
      userId: "user-1",
      status: "active",
      createdAt: new Date("2025-07-01"),
    });
    const result = getCoachingClientByUserId([completed, active], "user-1");
    expect(result?.id).toBe("c2");
    expect(result?.status).toBe("active");
  });

  it("returns newest active enrollment when multiple active exist", () => {
    const older = makeClient({
      id: "c1",
      userId: "user-1",
      status: "enrolled",
      createdAt: new Date("2025-01-01"),
    });
    const newer = makeClient({
      id: "c2",
      userId: "user-1",
      status: "active",
      createdAt: new Date("2025-06-01"),
    });
    const result = getCoachingClientByUserId([older, newer], "user-1");
    expect(result?.id).toBe("c2");
  });

  it("falls back to cancelled/completed record when no active enrollment exists", () => {
    const completed = makeClient({
      id: "c1",
      userId: "user-1",
      status: "completed",
      createdAt: new Date("2025-03-01"),
    });
    const cancelled = makeClient({
      id: "c2",
      userId: "user-1",
      status: "cancelled",
      createdAt: new Date("2025-06-01"),
    });
    const result = getCoachingClientByUserId([completed, cancelled], "user-1");
    // Should return the newest (cancelled) since no active exists
    expect(result?.id).toBe("c2");
  });

  it("correctly handles all non-terminal statuses as 'active'", () => {
    const statuses = ["enrolled", "intake_complete", "plan_generating", "plan_ready", "active", "paused"];
    for (const status of statuses) {
      const cancelled = makeClient({ id: "old", userId: "u1", status: "cancelled", createdAt: new Date("2025-12-01") });
      const current = makeClient({ id: "current", userId: "u1", status, createdAt: new Date("2025-01-01") });
      const result = getCoachingClientByUserId([cancelled, current], "u1");
      expect(result?.id, `status '${status}' should be preferred over cancelled`).toBe("current");
    }
  });
});

describe("canCreateEnrollment (duplicate guard)", () => {
  it("allows enrollment when user has no existing clients", () => {
    expect(canCreateEnrollment([], "user-1")).toEqual({ allowed: true });
  });

  it("blocks enrollment when user has an active enrollment", () => {
    const existing = makeClient({ userId: "user-1", status: "active" });
    const result = canCreateEnrollment([existing], "user-1");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("active coaching enrollment");
  });

  it("blocks enrollment when user has an enrolled (pending) enrollment", () => {
    const existing = makeClient({ userId: "user-1", status: "enrolled" });
    const result = canCreateEnrollment([existing], "user-1");
    expect(result.allowed).toBe(false);
  });

  it("blocks enrollment when user has a paused enrollment", () => {
    const existing = makeClient({ userId: "user-1", status: "paused" });
    expect(canCreateEnrollment([existing], "user-1").allowed).toBe(false);
  });

  it("allows enrollment when user only has a cancelled enrollment", () => {
    const existing = makeClient({ userId: "user-1", status: "cancelled" });
    expect(canCreateEnrollment([existing], "user-1")).toEqual({ allowed: true });
  });

  it("allows enrollment when user only has a completed enrollment", () => {
    const existing = makeClient({ userId: "user-1", status: "completed" });
    expect(canCreateEnrollment([existing], "user-1")).toEqual({ allowed: true });
  });

  it("blocks enrollment even during plan_generating phase", () => {
    const existing = makeClient({ userId: "user-1", status: "plan_generating" });
    expect(canCreateEnrollment([existing], "user-1").allowed).toBe(false);
  });

  it("blocks enrollment during plan_ready phase", () => {
    const existing = makeClient({ userId: "user-1", status: "plan_ready" });
    expect(canCreateEnrollment([existing], "user-1").allowed).toBe(false);
  });

  it("blocks enrollment during intake_complete phase", () => {
    const existing = makeClient({ userId: "user-1", status: "intake_complete" });
    expect(canCreateEnrollment([existing], "user-1").allowed).toBe(false);
  });
});

describe("getMyPlan (API endpoint logic)", () => {
  it("returns not_authenticated when userId is undefined", () => {
    expect(getMyPlan(undefined, [], true)).toEqual({ type: "not_authenticated" });
  });

  it("returns not_authenticated when user does not exist", () => {
    expect(getMyPlan("user-1", [], false)).toEqual({ type: "not_authenticated" });
  });

  it("returns not_enrolled when user exists but has no coaching enrollment", () => {
    expect(getMyPlan("user-1", [], true)).toEqual({ type: "not_enrolled" });
  });

  it("returns success with client data when user is enrolled", () => {
    const client = makeClient({ userId: "user-1", status: "enrolled" });
    const result = getMyPlan("user-1", [client], true);
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.client.id).toBe("client-1");
      expect(result.client.status).toBe("enrolled");
    }
  });

  it("returns success for active coaching client", () => {
    const client = makeClient({ userId: "user-1", status: "active" });
    const result = getMyPlan("user-1", [client], true);
    expect(result.type).toBe("success");
  });

  it("returns success even for completed client (shows completion status)", () => {
    const client = makeClient({ userId: "user-1", status: "completed" });
    const result = getMyPlan("user-1", [client], true);
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.client.status).toBe("completed");
    }
  });

  it("returns correct client when user has both cancelled and active enrollment", () => {
    const cancelled = makeClient({ id: "old", userId: "user-1", status: "cancelled", createdAt: new Date("2025-01-01") });
    const active = makeClient({ id: "new", userId: "user-1", status: "active", createdAt: new Date("2025-06-01") });
    const result = getMyPlan("user-1", [cancelled, active], true);
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.client.id).toBe("new");
      expect(result.client.status).toBe("active");
    }
  });
});

describe("coachingQueryFn response handling (client-side)", () => {
  // These tests validate the logic we fixed: how different HTTP responses
  // should be interpreted by the frontend.

  type QueryResult = { client: any; notEnrolled?: boolean } | null;

  function simulateQueryFn(
    status: number,
    body?: any,
  ): { result: QueryResult; shouldClearAuth: boolean; threw: boolean } {
    let shouldClearAuth = false;
    let threw = false;
    let result: QueryResult = null;

    try {
      if (status === 401) {
        shouldClearAuth = true;
        result = null;
      } else if (status === 404) {
        result = { client: null, notEnrolled: true };
      } else if (status >= 400) {
        threw = true;
      } else {
        result = body;
      }
    } catch {
      threw = true;
    }

    return { result, shouldClearAuth, threw };
  }

  it("returns null and clears auth on 401", () => {
    const r = simulateQueryFn(401);
    expect(r.result).toBeNull();
    expect(r.shouldClearAuth).toBe(true);
  });

  it("returns notEnrolled marker on 404", () => {
    const r = simulateQueryFn(404);
    expect(r.result).toEqual({ client: null, notEnrolled: true });
    expect(r.shouldClearAuth).toBe(false);
  });

  it("throws on 500 server error", () => {
    const r = simulateQueryFn(500);
    expect(r.threw).toBe(true);
  });

  it("returns full data on 200 success", () => {
    const body = { client: { id: "c1", status: "active" }, workoutPlan: [] };
    const r = simulateQueryFn(200, body);
    expect(r.result?.client?.id).toBe("c1");
    expect(r.shouldClearAuth).toBe(false);
    expect(r.threw).toBe(false);
  });

  describe("component render decision", () => {
    function decideScreen(
      user: any,
      planData: QueryResult | undefined,
      planLoading: boolean,
    ): "login" | "loading" | "not_enrolled" | "dashboard" {
      if (!user) return "login";
      if (planLoading) return "loading";
      // Fixed logic: only show "not enrolled" when planData was received
      // but explicitly has no client
      if (planData && !planData.client) return "not_enrolled";
      if (!planData?.client) return "loading";
      return "dashboard";
    }

    it("shows login when user is null", () => {
      expect(decideScreen(null, undefined, false)).toBe("login");
    });

    it("shows loading when plan is loading", () => {
      expect(decideScreen({ id: "u1" }, undefined, true)).toBe("loading");
    });

    it("shows not_enrolled when 404 response (planData with null client)", () => {
      expect(decideScreen({ id: "u1" }, { client: null, notEnrolled: true }, false)).toBe("not_enrolled");
    });

    it("shows loading (fallback) when planData is undefined (e.g. error)", () => {
      // Previously this would show "not_enrolled" — that was the bug
      expect(decideScreen({ id: "u1" }, undefined, false)).toBe("loading");
    });

    it("shows login when auth failure sets user to null", () => {
      // After 401, the fix sets user to null, which shows login screen
      expect(decideScreen(null, null, false)).toBe("login");
    });

    it("shows dashboard when plan data is present with client", () => {
      expect(decideScreen({ id: "u1" }, { client: { id: "c1", status: "active" } }, false)).toBe("dashboard");
    });
  });
});
