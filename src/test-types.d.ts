import "@testing-library/jest-dom";

declare global {
  namespace Vi {
    interface Assertion {
      toBeInTheDocument(): void;
      toHaveClass(className: string): void;
      toHaveAttribute(attr: string, value?: string): void;
      toBeVisible(): void;
      toBeDisabled(): void;
      toBeEnabled(): void;
      toBeChecked(): void;
      toHaveValue(value: string | string[] | number | null): void;
      toHaveStyle(css: Record<string, any>): void;
      toHaveFocus(): void;
      toContainElement(element: HTMLElement | SVGElement | null): void;
      toContainHTML(htmlText: string): void;
    }
  }
}
