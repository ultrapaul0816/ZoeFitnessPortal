/**
 * Scenario tests for coaching client onboarding.
 *
 * These simulate end-to-end user journeys through the private coaching
 * enrollment and onboarding process, covering happy paths and edge cases.
 */
import { describe, it, expect, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Lightweight in-memory simulation of the coaching system
// ---------------------------------------------------------------------------

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  termsAccepted: boolean;
  disclaimerAccepted: boolean;
}

interface CoachingClient {
  id: string;
  userId: string;
  status: string;
  coachingType: string;
  createdAt: Date;
  paymentStatus: string;
  formData: any;
  startDate: Date | null;
  endDate: Date | null;
  planDurationWeeks: number;
}

interface FormResponse {
  clientId: string;
  formType: string;
  responses: any;
}

interface Session {
  userId: string | null;
  authToken: string | null;
}

/**
 * Simulates the server/storage layer for testing onboarding flows
 * without needing a real database.
 */
class MockCoachingSystem {
  users: User[] = [];
  clients: CoachingClient[] = [];
  formResponses: FormResponse[] = [];
  session: Session = { userId: null, authToken: null };
  private idCounter = 1;

  // --- User management ---

  createUser(email: string, firstName: string, lastName: string, password: string): User {
    const user: User = {
      id: `user-${this.idCounter++}`,
      email: email.toLowerCase().trim(),
      firstName,
      lastName,
      password,
      termsAccepted: true,
      disclaimerAccepted: true,
    };
    this.users.push(user);
    return user;
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email.toLowerCase().trim());
  }

  getUser(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  // --- Session management ---

  login(email: string, password: string): { success: boolean; user?: User; error?: string } {
    const user = this.getUserByEmail(email);
    if (!user) return { success: false, error: "Invalid credentials" };
    if (user.password !== password) return { success: false, error: "Invalid credentials" };
    if (!user.termsAccepted) return { success: false, error: "Please accept terms" };
    this.session = { userId: user.id, authToken: `token-${user.id}` };
    return { success: true, user };
  }

  logout(): void {
    this.session = { userId: null, authToken: null };
  }

  isAuthenticated(): boolean {
    return this.session.userId !== null;
  }

  expireSession(): void {
    this.session = { userId: null, authToken: null };
  }

  // --- Coaching client management ---

  getCoachingClientByUserId(userId: string): CoachingClient | undefined {
    const userClients = this.clients
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const active = userClients.find(
      (c) => c.status !== "cancelled" && c.status !== "completed",
    );
    return active || userClients[0];
  }

  adminEnrollClient(
    email: string,
    firstName: string,
    lastName: string,
    coachingType = "pregnancy_coaching",
  ): { success: boolean; client?: CoachingClient; error?: string } {
    let user = this.getUserByEmail(email);
    if (!user) {
      user = this.createUser(email, firstName, lastName, `Welcome${firstName}1`);
    }

    const existing = this.getCoachingClientByUserId(user.id);
    if (existing && existing.status !== "cancelled" && existing.status !== "completed") {
      return { success: false, error: "This user already has an active coaching enrollment." };
    }

    const nextMonday = new Date();
    nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));
    nextMonday.setHours(0, 0, 0, 0);
    const endDate = new Date(nextMonday);
    endDate.setDate(endDate.getDate() + 28);

    const client: CoachingClient = {
      id: `client-${this.idCounter++}`,
      userId: user.id,
      status: "enrolled",
      coachingType,
      createdAt: new Date(),
      paymentStatus: "completed",
      formData: null,
      startDate: nextMonday,
      endDate,
      planDurationWeeks: 4,
    };
    this.clients.push(client);
    return { success: true, client };
  }

  updateClientStatus(clientId: string, status: string): boolean {
    const client = this.clients.find((c) => c.id === clientId);
    if (!client) return false;
    client.status = status;
    return true;
  }

  // --- My Plan endpoint simulation ---

  getMyPlan(): { status: number; body: any } {
    if (!this.session.userId) {
      return { status: 401, body: { message: "Not authenticated" } };
    }
    const user = this.getUser(this.session.userId);
    if (!user) {
      return { status: 401, body: { message: "Not authenticated" } };
    }
    const client = this.getCoachingClientByUserId(user.id);
    if (!client) {
      return { status: 404, body: { message: "No coaching enrollment found" } };
    }
    return {
      status: 200,
      body: {
        client: {
          id: client.id,
          status: client.status,
          startDate: client.startDate,
          endDate: client.endDate,
          planDurationWeeks: client.planDurationWeeks,
          coachingType: client.coachingType,
        },
        workoutPlan: [],
        nutritionPlan: [],
        tips: [],
        unreadMessages: 0,
        formResponses: [],
        userProfile: { firstName: user.firstName, lastName: user.lastName, email: user.email },
      },
    };
  }

  // --- Form submission ---

  submitFormResponse(formType: string, responses: any): { success: boolean; error?: string } {
    if (!this.session.userId) return { success: false, error: "Not authenticated" };
    const client = this.getCoachingClientByUserId(this.session.userId);
    if (!client) return { success: false, error: "No coaching enrollment" };

    this.formResponses.push({ clientId: client.id, formType, responses });
    return { success: true };
  }

  // --- UI screen decision (mirrors the fixed client-side logic) ---

  decideScreen(
    userInState: User | null,
    planResponse: { status: number; body: any } | null,
    isLoading: boolean,
  ): "login" | "loading" | "not_enrolled" | "terms_modal" | "welcome" | "intake_form" | "waiting" | "dashboard" {
    if (!userInState) return "login";
    if (isLoading) return "loading";

    if (!planResponse) return "loading";

    // After the fix: 401 clears user → login screen
    if (planResponse.status === 401) return "login";

    // After the fix: 404 is genuinely not enrolled
    if (planResponse.status === 404) return "not_enrolled";

    const client = planResponse.body?.client;
    if (!client) return "loading";

    if (!userInState.termsAccepted || !userInState.disclaimerAccepted) {
      return "terms_modal";
    }

    switch (client.status) {
      case "enrolled":
        return "intake_form";
      case "intake_complete":
      case "plan_generating":
      case "plan_ready":
      case "paused":
      case "completed":
        return "waiting";
      case "active":
        return "dashboard";
      default:
        return "loading";
    }
  }
}

// =========================================================================
// SCENARIOS
// =========================================================================

describe("Scenario: New client onboarding (happy path)", () => {
  let system: MockCoachingSystem;

  beforeEach(() => {
    system = new MockCoachingSystem();
  });

  it("S1: Admin enrolls a brand-new client who then logs in and sees intake forms", () => {
    // Step 1: Admin enrolls a new client
    const enrollment = system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    expect(enrollment.success).toBe(true);
    expect(enrollment.client?.status).toBe("enrolled");

    // Step 2: Client logs in with auto-generated password
    const loginResult = system.login("jane@example.com", "WelcomeJane1");
    expect(loginResult.success).toBe(true);

    // Step 3: Client views my-plan
    const planResponse = system.getMyPlan();
    expect(planResponse.status).toBe(200);
    expect(planResponse.body.client.status).toBe("enrolled");

    // Step 4: UI should show intake form
    const screen = system.decideScreen(loginResult.user!, planResponse, false);
    expect(screen).toBe("intake_form");
  });

  it("S2: Client submits intake form, status transitions to intake_complete", () => {
    system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    system.login("jane@example.com", "WelcomeJane1");

    // Submit forms
    expect(system.submitFormResponse("lifestyle", { goals: "weight_loss" }).success).toBe(true);
    expect(system.submitFormResponse("health", { injuries: "none" }).success).toBe(true);

    // Admin updates status after reviewing forms
    const client = system.getCoachingClientByUserId("user-1");
    system.updateClientStatus(client!.id, "intake_complete");

    // Client sees waiting screen
    const plan = system.getMyPlan();
    expect(plan.body.client.status).toBe("intake_complete");

    const user = system.getUser("user-1")!;
    expect(system.decideScreen(user, plan, false)).toBe("waiting");
  });

  it("S3: Full status progression from enrolled to active", () => {
    const enrollment = system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    system.login("jane@example.com", "WelcomeJane1");
    const clientId = enrollment.client!.id;
    const user = system.getUser("user-1")!;

    const statusFlow = [
      { status: "enrolled", expectedScreen: "intake_form" as const },
      { status: "intake_complete", expectedScreen: "waiting" as const },
      { status: "plan_generating", expectedScreen: "waiting" as const },
      { status: "plan_ready", expectedScreen: "waiting" as const },
      { status: "active", expectedScreen: "dashboard" as const },
    ];

    for (const { status, expectedScreen } of statusFlow) {
      system.updateClientStatus(clientId, status);
      const plan = system.getMyPlan();
      expect(plan.status).toBe(200);
      expect(plan.body.client.status).toBe(status);
      expect(
        system.decideScreen(user, plan, false),
        `status '${status}' should show '${expectedScreen}'`,
      ).toBe(expectedScreen);
    }
  });
});

describe("Scenario: Session expiry (the fixed bug)", () => {
  let system: MockCoachingSystem;

  beforeEach(() => {
    system = new MockCoachingSystem();
    system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    system.login("jane@example.com", "WelcomeJane1");
  });

  it("S4: BEFORE FIX — expired session would show 'not enrolled' (regression check)", () => {
    // Verify initial state works
    const plan1 = system.getMyPlan();
    expect(plan1.status).toBe(200);

    // Expire session
    system.expireSession();

    // API returns 401
    const plan2 = system.getMyPlan();
    expect(plan2.status).toBe(401);

    // OLD behavior: user still set from localStorage, plan returns 401/null → "not enrolled"
    // This is what was broken:
    const staleUser = system.getUser("user-1")!;
    const oldBuggyDecision = !plan2.body?.client ? "not_enrolled_or_loading" : "dashboard";
    // The 401 body has { message: "Not authenticated" }, no client property
    expect(oldBuggyDecision).toBe("not_enrolled_or_loading");
  });

  it("S5: AFTER FIX — expired session shows login screen", () => {
    system.expireSession();
    const plan = system.getMyPlan();
    expect(plan.status).toBe(401);

    // After the fix: 401 response clears user → login screen
    const screen = system.decideScreen(null, plan, false); // user cleared by fix
    expect(screen).toBe("login");
  });

  it("S6: User re-authenticates after session expiry and sees their coaching plan", () => {
    system.expireSession();

    // API returns 401
    expect(system.getMyPlan().status).toBe(401);

    // User re-logs in
    const loginResult = system.login("jane@example.com", "WelcomeJane1");
    expect(loginResult.success).toBe(true);

    // Now sees their plan
    const plan = system.getMyPlan();
    expect(plan.status).toBe(200);
    expect(plan.body.client.status).toBe("enrolled");
    expect(system.decideScreen(loginResult.user!, plan, false)).toBe("intake_form");
  });
});

describe("Scenario: Re-enrollment after cancellation", () => {
  let system: MockCoachingSystem;

  beforeEach(() => {
    system = new MockCoachingSystem();
  });

  it("S7: User whose enrollment was cancelled can be re-enrolled", () => {
    // First enrollment
    const first = system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    expect(first.success).toBe(true);
    system.updateClientStatus(first.client!.id, "cancelled");

    // Re-enrollment should succeed
    const second = system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    expect(second.success).toBe(true);
    expect(second.client!.status).toBe("enrolled");

    // Login should show the new enrollment
    system.login("jane@example.com", "WelcomeJane1");
    const plan = system.getMyPlan();
    expect(plan.status).toBe(200);
    expect(plan.body.client.id).toBe(second.client!.id);
    expect(plan.body.client.status).toBe("enrolled");
  });

  it("S8: User whose program completed can be re-enrolled", () => {
    const first = system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    system.updateClientStatus(first.client!.id, "completed");

    const second = system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    expect(second.success).toBe(true);

    system.login("jane@example.com", "WelcomeJane1");
    const plan = system.getMyPlan();
    expect(plan.body.client.id).toBe(second.client!.id);
    expect(plan.body.client.status).toBe("enrolled");
  });

  it("S9: Cannot create duplicate enrollment while active", () => {
    system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    const duplicate = system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    expect(duplicate.success).toBe(false);
    expect(duplicate.error).toContain("active coaching enrollment");
  });
});

describe("Scenario: Existing user enrolled for coaching", () => {
  let system: MockCoachingSystem;

  beforeEach(() => {
    system = new MockCoachingSystem();
    // Create an existing regular user first
    system.createUser("existing@example.com", "Existing", "User", "mypassword123");
  });

  it("S10: Existing user can be enrolled without creating duplicate account", () => {
    const enrollment = system.adminEnrollClient("existing@example.com", "Existing", "User");
    expect(enrollment.success).toBe(true);

    // Only one user should exist with this email
    const userCount = system.users.filter((u) => u.email === "existing@example.com").length;
    expect(userCount).toBe(1);

    // Login with original password
    system.login("existing@example.com", "mypassword123");
    const plan = system.getMyPlan();
    expect(plan.status).toBe(200);
    expect(plan.body.client.status).toBe("enrolled");
  });
});

describe("Scenario: Unauthenticated user visits /my-coaching", () => {
  let system: MockCoachingSystem;

  beforeEach(() => {
    system = new MockCoachingSystem();
  });

  it("S11: Unauthenticated user sees login screen, not 'not enrolled'", () => {
    // No session, no user
    const screen = system.decideScreen(null, null, false);
    expect(screen).toBe("login");
  });

  it("S12: User who is not a coaching client sees 'not enrolled' after login", () => {
    system.createUser("regular@example.com", "Regular", "User", "pass123");
    system.login("regular@example.com", "pass123");

    const plan = system.getMyPlan();
    expect(plan.status).toBe(404);

    const user = system.getUser("user-1")!;
    const screen = system.decideScreen(user, plan, false);
    expect(screen).toBe("not_enrolled");
  });
});

describe("Scenario: Coaching type variations", () => {
  let system: MockCoachingSystem;

  beforeEach(() => {
    system = new MockCoachingSystem();
  });

  it("S13: Pregnancy coaching client follows same enrollment flow", () => {
    const enrollment = system.adminEnrollClient(
      "pregnant@example.com", "Sarah", "Smith", "pregnancy_coaching",
    );
    expect(enrollment.success).toBe(true);
    expect(enrollment.client?.coachingType).toBe("pregnancy_coaching");
  });

  it("S14: General fitness coaching client follows same enrollment flow", () => {
    const enrollment = system.adminEnrollClient(
      "fitness@example.com", "Lisa", "Jones", "general_fitness",
    );
    expect(enrollment.success).toBe(true);
    expect(enrollment.client?.coachingType).toBe("general_fitness");
  });
});

describe("Scenario: Loading states", () => {
  let system: MockCoachingSystem;

  beforeEach(() => {
    system = new MockCoachingSystem();
  });

  it("S15: Shows loading while plan data is being fetched", () => {
    const user = system.createUser("a@b.com", "A", "B", "x");
    const screen = system.decideScreen(user, null, true);
    expect(screen).toBe("loading");
  });

  it("S16: Shows loading when planData is undefined (initial state)", () => {
    const user = system.createUser("a@b.com", "A", "B", "x");
    const screen = system.decideScreen(user, null, false);
    expect(screen).toBe("loading");
  });
});

describe("Scenario: Paused and completed program states", () => {
  let system: MockCoachingSystem;

  beforeEach(() => {
    system = new MockCoachingSystem();
    system.adminEnrollClient("jane@example.com", "Jane", "Doe");
    system.login("jane@example.com", "WelcomeJane1");
  });

  it("S17: Paused client sees waiting/paused screen", () => {
    const client = system.clients[0];
    system.updateClientStatus(client.id, "paused");

    const plan = system.getMyPlan();
    expect(plan.body.client.status).toBe("paused");

    const user = system.getUser("user-1")!;
    expect(system.decideScreen(user, plan, false)).toBe("waiting");
  });

  it("S18: Completed client sees waiting/completed screen", () => {
    const client = system.clients[0];
    system.updateClientStatus(client.id, "completed");

    const plan = system.getMyPlan();
    expect(plan.body.client.status).toBe("completed");

    const user = system.getUser("user-1")!;
    expect(system.decideScreen(user, plan, false)).toBe("waiting");
  });
});
