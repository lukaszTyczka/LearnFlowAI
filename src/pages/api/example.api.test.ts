import { describe, it, expect } from "vitest";
import { ApiTestHelper } from "../../../test/apiTestHelper";

describe.skip("API endpoints", () => {
  const api = new ApiTestHelper();

  it("should return valid data from example endpoint", async () => {
    const response = await api.get("/api/example");
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(true);
  });

  it("should handle invalid requests properly", async () => {
    const response = await api.get("/api/nonexistent", 404);
    expect(response.body).toBeDefined();
    expect(response.body.success).toBe(false);
  });
});
