import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Explicitly define types for jest-dom
declare module "vitest" {
  interface Assertion<T> {
    toBeInTheDocument(): T;
    toHaveClass(className: string): T;
    toHaveAttribute(attr: string, value?: string): T;
    toBeVisible(): T;
    toBeDisabled(): T;
    toBeEnabled(): T;
    toBeChecked(): T;
    toHaveValue(value: string | string[] | number | null): T;
    toHaveStyle(css: Record<string, string>): T;
    toHaveFocus(): T;
    toContainElement(element: HTMLElement | SVGElement | null): T;
    toContainHTML(htmlText: string): T;
  }
}

// Extend Vitest's expect method with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
