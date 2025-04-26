import request from "supertest";
import { expect } from "vitest";

/**
 * Helper class for testing API endpoints
 */
export class ApiTestHelper {
  private baseUrl: string;

  constructor(baseUrl = "http://localhost:4321") {
    this.baseUrl = baseUrl;
  }

  /**
   * Perform a GET request to an API endpoint
   */
  async get(endpoint: string, expectedStatus = 200) {
    const response = await request(this.baseUrl).get(endpoint).set("Accept", "application/json");

    expect(response.status).toBe(expectedStatus);
    return response;
  }

  /**
   * Perform a POST request to an API endpoint
   */
  async post(endpoint: string, data: string | object, expectedStatus = 200) {
    const response = await request(this.baseUrl)
      .post(endpoint)
      .send(data)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(expectedStatus);
    return response;
  }

  /**
   * Perform a PUT request to an API endpoint
   */
  async put(endpoint: string, data: string | object, expectedStatus = 200) {
    const response = await request(this.baseUrl)
      .put(endpoint)
      .send(data)
      .set("Accept", "application/json")
      .set("Content-Type", "application/json");

    expect(response.status).toBe(expectedStatus);
    return response;
  }

  /**
   * Perform a DELETE request to an API endpoint
   */
  async delete(endpoint: string, expectedStatus = 200) {
    const response = await request(this.baseUrl).delete(endpoint).set("Accept", "application/json");

    expect(response.status).toBe(expectedStatus);
    return response;
  }
}
