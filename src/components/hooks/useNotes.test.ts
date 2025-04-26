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
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the supabase client
const mockUnsubscribe = vi.fn();
const mockSubscribe = vi.fn();
const mockOn = vi.fn();

vi.mock("../../db/supabase.client", () => ({
  supabaseClient: {
    channel: vi.fn(() => ({
      on: mockOn.mockReturnThis(),
      subscribe: mockSubscribe.mockReturnValue({
        unsubscribe: mockUnsubscribe,
      }),
    })),
  },
}));

describe("useNotes hook - saveNote method", () => {
  const mockUser = { id: "user-123", email: "test@example.com" };
  const mockCategoryId = "category-123";
  const validNoteContent = "a".repeat(500); // Valid note content (between 300-10000 chars)
  const mockNote = {
    id: "note-123",
    content: validNoteContent,
    category_id: mockCategoryId,
    user_id: mockUser.id,
    summary_status: "pending" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch.mockReset();
    mockUnsubscribe.mockReset();
    mockSubscribe.mockReset();
    mockOn.mockReset().mockReturnThis();
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

    expect(toast.error).toHaveBeenCalledWith("You must be logged in to save notes");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should return false if categoryId is not provided", async () => {
    const { result } = renderHook(() => useNotes(mockUser));

    await act(async () => {
      const success = await result.current.saveNote(null);
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("Please select a category first");
    expect(mockFetch).not.toHaveBeenCalled();
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

    expect(toast.error).toHaveBeenCalledWith("Note must be between 300 and 10000 characters");
    expect(mockFetch).not.toHaveBeenCalled();
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

    expect(toast.error).toHaveBeenCalledWith("Note must be between 300 and 10000 characters");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should save note and return true when all conditions are met", async () => {
    const { result } = renderHook(() => useNotes(mockUser));

    // Mock successful responses for both save and summarize
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ note: mockNote }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ success: true }),
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

    // Verify save note fetch call
    expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: validNoteContent,
        category_id: mockCategoryId,
        summary_status: "pending",
      }),
    });

    // Verify summarize fetch call
    expect(mockFetch).toHaveBeenNthCalledWith(2, `/api/ai/summarize/${mockNote.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    // Verify toast success was called
    expect(toast.success).toHaveBeenCalledWith("Note saved successfully. Generating summary...");
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();

    // Verify note content was cleared
    expect(result.current.noteContent).toBe("");
  });

  it("should handle error response from the /api/notes API", async () => {
    const { result } = renderHook(() => useNotes(mockUser));
    const notesErrorMessage = "Failed to save the note";

    // Mock failed save response
    mockFetch.mockResolvedValueOnce({
      ok: false,
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

    expect(toast.error).toHaveBeenCalledWith("Failed to save note. Please try again.");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle error response from the /api/ai/summarize API and still return true", async () => {
    const { result } = renderHook(() => useNotes(mockUser));

    // Mock successful save but failed summarize
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ note: mockNote }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({ error: "Summarization failed" }),
      });

    // Set valid note content
    act(() => {
      result.current.setNoteContent(validNoteContent);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(true);
    });

    expect(toast.warning).toHaveBeenCalledWith("Note saved, but summary generation failed. You can retry later.");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should handle network errors during note saving", async () => {
    const { result } = renderHook(() => useNotes(mockUser));

    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    // Set valid note content
    act(() => {
      result.current.setNoteContent(validNoteContent);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to save note. Please try again.");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  describe("useNotes hook - async summarization", () => {
    it("should handle realtime updates for summary status changes", async () => {
      renderHook(() => useNotes(mockUser));

      // Get the realtime callback that was registered
      const [[, , callback]] = mockOn.mock.calls;

      // Simulate processing status update
      act(() => {
        callback({
          new: { ...mockNote, summary_status: "processing" },
        });
      });

      // Simulate completed status update
      act(() => {
        callback({
          new: { ...mockNote, summary_status: "completed" },
        });
      });

      expect(toast.success).toHaveBeenCalledWith("Note summary generated successfully");
    });

    it("should cleanup realtime subscription on unmount", () => {
      const { unmount } = renderHook(() => useNotes(mockUser));

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
