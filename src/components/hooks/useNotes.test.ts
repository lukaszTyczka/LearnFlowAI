import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotes } from "./useNotes";
import { toast } from "sonner";

// Mock the toast module
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("useNotes hook - saveNote method", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };
  const mockCategoryId = "category-123";
  const validNoteContent = "a".repeat(500); // Valid note content (between 300-10000 chars)
  const mockSummary = "This is a summary.";

  beforeEach(() => {
    vi.resetAllMocks();
    (global.fetch as any).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return false if user is not logged in", async () => {
    const { result } = renderHook(() => useNotes(null));

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith(
      "You must be logged in to save notes"
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should return false if categoryId is not provided", async () => {
    const { result } = renderHook(() => useNotes(mockUser));

    await act(async () => {
      const success = await result.current.saveNote(null);
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("Please select a category first");
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should return false if note content is too short", async () => {
    const { result } = renderHook(() => useNotes(mockUser));

    // Set a short note (less than 300 chars)
    act(() => {
      result.current.setNoteContent("a".repeat(299));
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Note must be between 300 and 10000 characters"
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should return false if note content is too long", async () => {
    const { result } = renderHook(() => useNotes(mockUser));

    // Set a long note (more than 10000 chars)
    act(() => {
      result.current.setNoteContent("a".repeat(10001));
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Note must be between 300 and 10000 characters"
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should save note and return true when all conditions are met", async () => {
    const { result } = renderHook(() => useNotes(mockUser));

    // Mock successful fetch responses for BOTH summarize and notes
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ summary: mockSummary }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ id: "note-123" }),
      });

    // Set valid note content
    act(() => {
      result.current.setNoteContent(validNoteContent);
    });

    // Verify isSaving state changes correctly
    expect(result.current.isSaving).toBe(false);

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(true);
    });

    // Verify isSaving went back to false
    expect(result.current.isSaving).toBe(false);

    // Verify summarize fetch call
    expect(global.fetch).toHaveBeenCalledWith("/api/ai/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: validNoteContent,
        maxLength: 500,
        categoryId: mockCategoryId,
      }),
    });

    // Verify notes fetch call (including summary)
    expect(global.fetch).toHaveBeenCalledWith("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: validNoteContent,
        category_id: mockCategoryId,
        summary: mockSummary,
      }),
    });

    // Verify toast success was called
    expect(toast.success).toHaveBeenCalledWith("Note saved successfully");
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    // Verify note content was cleared
    expect(result.current.noteContent).toBe("");
  });

  it("should handle error response from the /api/notes API", async () => {
    const { result } = renderHook(() => useNotes(mockUser));
    const notesErrorMessage = "Failed to save the note"; // This specific message is no longer shown

    // Mock SUCCESSFUL summarize, FAILED notes
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ summary: mockSummary }),
      })
      .mockResolvedValueOnce({
        ok: false,
        // The content of the error in the JSON response doesn't matter for the toast message anymore
        json: vi.fn().mockResolvedValueOnce({ error: notesErrorMessage }),
      });

    // Set valid note content
    act(() => {
      result.current.setNoteContent(validNoteContent);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    // Expect the generic error message from the catch block
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to save note. Please try again."
    );
    expect(toast.warning).not.toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);
  });

  it("should handle error response from the /api/ai/summarize API and still attempt save", async () => {
    // Add spy for console.error specifically for this test or in beforeEach
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const { result } = renderHook(() => useNotes(mockUser));
    const summarizeErrorMessage = "Summarization failed badly";

    // Mock FAILED summarize, SUCCESSFUL notes
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({ error: summarizeErrorMessage }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ id: "note-123" }),
      });

    // Set valid note content
    act(() => {
      result.current.setNoteContent(validNoteContent);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(true);
    });

    expect(toast.warning).toHaveBeenCalledWith(
      "Could not generate summary, but saving note."
    );
    // Check that console.error was called with the specific message
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Summarization failed:",
      summarizeErrorMessage
    );
    expect(toast.success).toHaveBeenCalledWith("Note saved successfully");
    expect(toast.error).not.toHaveBeenCalled();
    expect(result.current.isSaving).toBe(false);

    // Verify notes fetch call (with empty summary)
    expect(global.fetch).toHaveBeenCalledWith("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: validNoteContent,
        category_id: mockCategoryId,
        summary: "",
      }),
    });

    // Restore console.error spy after the test
    consoleErrorSpy.mockRestore();
  });

  it("should handle network errors during summarization", async () => {
    const { result } = renderHook(() => useNotes(mockUser));
    const networkError = new Error("Network error on summarize");

    // Mock network error on the FIRST fetch call (summarize)
    (global.fetch as any).mockRejectedValueOnce(networkError);

    // Set valid note content
    act(() => {
      result.current.setNoteContent(validNoteContent);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    // Expect the generic error message from the catch block
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to save note. Please try again."
    );
    expect(result.current.isSaving).toBe(false);
  });

  it("should handle network errors during note saving", async () => {
    const { result } = renderHook(() => useNotes(mockUser));
    const networkError = new Error("Network error on save");

    // Mock successful summarize, network error on notes
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ summary: mockSummary }),
      })
      .mockRejectedValueOnce(networkError); // Mock network error on /api/notes

    // Set valid note content
    act(() => {
      result.current.setNoteContent(validNoteContent);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    // Expect the generic error message from the catch block
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to save note. Please try again."
    );
    expect(result.current.isSaving).toBe(false);
  });
});
