import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotes } from "./useNotes";
import { toast } from "sonner";

// Mock the toast module
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe("useNotes hook - saveNote method", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };
  const mockCategoryId = "category-123";
  const validNoteContent = "a".repeat(500); // Valid note content (between 300-10000 chars)

  beforeEach(() => {
    vi.resetAllMocks();
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

    // Mock successful fetch response
    (global.fetch as any).mockResolvedValueOnce({
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

    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: validNoteContent,
        category_id: mockCategoryId,
      }),
    });

    // Verify toast success was called
    expect(toast.success).toHaveBeenCalledWith("Note saved successfully");

    // Verify note content was cleared
    expect(result.current.noteContent).toBe("");
  });

  it("should handle error response from API", async () => {
    const { result } = renderHook(() => useNotes(mockUser));
    const errorMessage = "API error occurred";

    // Mock failed fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValueOnce({ error: errorMessage }),
    });

    // Set valid note content
    act(() => {
      result.current.setNoteContent(validNoteContent);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(result.current.isSaving).toBe(false);
  });

  it("should handle network errors", async () => {
    const { result } = renderHook(() => useNotes(mockUser));
    const networkError = new Error("Network error");

    // Mock network error
    (global.fetch as any).mockRejectedValueOnce(networkError);

    // Set valid note content
    act(() => {
      result.current.setNoteContent(validNoteContent);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("Network error");
    expect(result.current.isSaving).toBe(false);
  });
});
