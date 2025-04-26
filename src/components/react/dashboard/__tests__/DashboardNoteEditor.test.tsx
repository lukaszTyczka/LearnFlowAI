import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardNoteEditor from "../DashboardNoteEditor";

// Removed fetch mock as it's no longer called directly by the component

describe("DashboardNoteEditor", () => {
  const defaultProps = {
    noteContent: "This is a test note that is long enough to be valid (more than 300 characters). ".repeat(5),
    isSaving: false,
    isUserLoggedIn: true,
    hasCategorySelected: true,
    // categoryId is no longer a prop
    onContentChange: vi.fn(),
    onSave: vi.fn(), // onSave no longer takes an argument
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Keep console.error mock if needed for other tests, or remove if not
    vi.spyOn(console, "error").mockImplementation(() => {
      /* Do noting */
    });
    // Remove fetch mock setup
  });

  it("renders correctly with default props", () => {
    render(<DashboardNoteEditor {...defaultProps} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save note/i })).toBeInTheDocument();
  });

  it("displays correct placeholder when user is logged in", () => {
    render(<DashboardNoteEditor {...defaultProps} isUserLoggedIn={true} />);

    expect(screen.getByPlaceholderText("Enter your note here... (300-10000 chars)")).toBeInTheDocument();
  });

  it("displays login message when user is not logged in", () => {
    render(<DashboardNoteEditor {...defaultProps} isUserLoggedIn={false} />);

    expect(screen.getByPlaceholderText("Please log in to create notes")).toBeInTheDocument();
  });

  it("disables textarea when saving", () => {
    render(<DashboardNoteEditor {...defaultProps} isSaving={true} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("disables textarea when user is not logged in", () => {
    render(<DashboardNoteEditor {...defaultProps} isUserLoggedIn={false} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it('shows "Saving & Summarizing..." text on button when saving', () => {
    render(<DashboardNoteEditor {...defaultProps} isSaving={true} />);

    // Check for the updated button text
    expect(screen.getByRole("button", { name: /saving & summarizing.../i })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables save button when no category is selected", () => {
    render(<DashboardNoteEditor {...defaultProps} hasCategorySelected={false} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables save button when user is not logged in", () => {
    render(<DashboardNoteEditor {...defaultProps} isUserLoggedIn={false} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onContentChange when textarea content changes", () => {
    render(<DashboardNoteEditor {...defaultProps} />);

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "New note content" } });

    expect(defaultProps.onContentChange).toHaveBeenCalledWith("New note content");
    expect(defaultProps.onContentChange).toHaveBeenCalledTimes(1);
  });

  // Test that onSave is called (without checking fetch)
  it("calls onSave when save button is clicked under valid conditions", async () => {
    render(<DashboardNoteEditor {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: /save note/i });
    fireEvent.click(saveButton);

    // Verify onSave was called (without arguments)
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSave).toHaveBeenCalledWith(); // Ensure it's called with no args
    });
  });

  it("displays the note content in the textarea", () => {
    const testContent = "Test note content";
    render(<DashboardNoteEditor {...defaultProps} noteContent={testContent} />);

    expect(screen.getByRole("textbox")).toHaveValue(testContent);
  });
});
