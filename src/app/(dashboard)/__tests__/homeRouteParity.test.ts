jest.mock("../dashboard", () => ({
  __esModule: true,
  default: () => null,
}));

import HomeRoute from "../index";
import DashboardRoute from "../dashboard";

describe("home route parity", () => {
  it("exports the same component for / and /dashboard", () => {
    expect(HomeRoute).toBe(DashboardRoute);
  });
});
