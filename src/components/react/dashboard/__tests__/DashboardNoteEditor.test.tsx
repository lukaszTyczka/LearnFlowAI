import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardNoteEditor from "../DashboardNoteEditor";

describe("DashboardNoteEditor", () => {
  const defaultProps = {
    noteContent: "",
    isSaving: false,
    isUserLoggedIn: true,
    hasCategorySelected: true,
    onContentChange: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
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

  it("calls onSave when save button is clicked", () => {
    render(<DashboardNoteEditor {...defaultProps} />);

    const saveButton = screen.getByRole("button", { name: /save note/i });
    fireEvent.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
  });

  it("displays the note content in the textarea", () => {
    const testContent = "Test note content";
    render(<DashboardNoteEditor {...defaultProps} noteContent={testContent} />);

    expect(screen.getByRole("textbox")).toHaveValue(testContent);
  });
});
