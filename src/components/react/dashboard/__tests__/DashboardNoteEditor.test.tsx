import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardNoteEditor from "../DashboardNoteEditor";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("DashboardNoteEditor", () => {
  const defaultProps = {
    noteContent:
      "This is a test note that is long enough to be valid (more than 300 characters). ".repeat(
        5
      ),
    isSaving: false,
    isUserLoggedIn: true,
    hasCategorySelected: true,
    categoryId: "test-category-id",
    onContentChange: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Mock console.error
    vi.spyOn(console, "error").mockImplementation(() => {});
    // Setup default mock response for fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          noteId: "test-note-id",
          summary: "Test summary",
          keyPoints: ["Point 1", "Point 2"],
          wordCount: 100,
        }),
    });
  });

  it("renders correctly with default props", () => {
    render(<DashboardNoteEditor {...defaultProps} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /save note/i })
    ).toBeInTheDocument();
  });

  it("displays correct placeholder when user is logged in", () => {
    render(<DashboardNoteEditor {...defaultProps} isUserLoggedIn={true} />);

    expect(
      screen.getByPlaceholderText("Enter your note here... (300-10000 chars)")
    ).toBeInTheDocument();
  });

  it("displays login message when user is not logged in", () => {
    render(<DashboardNoteEditor {...defaultProps} isUserLoggedIn={false} />);

    expect(
      screen.getByPlaceholderText("Please log in to create notes")
    ).toBeInTheDocument();
  });

  it("disables textarea when saving", () => {
    render(<DashboardNoteEditor {...defaultProps} isSaving={true} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("disables textarea when user is not logged in", () => {
    render(<DashboardNoteEditor {...defaultProps} isUserLoggedIn={false} />);

    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it('shows "Saving..." text on button when saving', () => {
    render(<DashboardNoteEditor {...defaultProps} isSaving={true} />);

    expect(screen.getByRole("button", { name: /saving/i })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("disables save button when no category is selected", () => {
    render(
      <DashboardNoteEditor {...defaultProps} hasCategorySelected={false} />
    );

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

    expect(defaultProps.onContentChange).toHaveBeenCalledWith(
      "New note content"
    );
    expect(defaultProps.onContentChange).toHaveBeenCalledTimes(1);
  });

  it("calls summarize endpoint and onSave when save button is clicked", async () => {
    render(<DashboardNoteEditor {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: /save note/i });
    fireEvent.click(saveButton);

    // Verify the summarize API was called with correct parameters
    expect(mockFetch).toHaveBeenCalledWith("/api/ai/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: defaultProps.noteContent,
        maxLength: 500,
        categoryId: defaultProps.categoryId,
      }),
    });

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith("test-note-id");
    });
  });

  it("shows summarizing state while processing", async () => {
    // Make the fetch take some time
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<DashboardNoteEditor {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: /save note/i });
    fireEvent.click(saveButton);

    // Check for "Summarizing..." text
    expect(await screen.findByText("Summarizing...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("handles summarization failure gracefully", async () => {
    // Mock a failed API call with proper response structure
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve({ error: "Summarization failed" }),
    });

    render(<DashboardNoteEditor {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: /save note/i });
    fireEvent.click(saveButton);

    // Should still call onSave even if summarization fails
    await waitFor(() => {
      expect(defaultProps.onSave).toHaveBeenCalledWith();
    });

    // Verify error was logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error saving note with summary:",
        expect.any(Error)
      );
    });
  });

  it("displays the note content in the textarea", () => {
    const testContent = "Test note content";
    render(<DashboardNoteEditor {...defaultProps} noteContent={testContent} />);

    expect(screen.getByRole("textbox")).toHaveValue(testContent);
  });
});
