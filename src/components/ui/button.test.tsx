import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with the correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies variant and size classes correctly", () => {
    render(
      <Button variant="outline" size="sm">
        Custom Button
      </Button>
    );
    const button = screen.getByText("Custom Button");

    // Check for variant-specific class
    expect(button.className).toContain("border border-input");
    expect(button.className).toContain("bg-background");

    // Check for size-specific class
    expect(button.className).toContain("h-8 rounded-md");
    expect(button.className).toContain("px-3");
  });
});
