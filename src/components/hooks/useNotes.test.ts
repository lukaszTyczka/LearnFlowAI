import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useNotes } from "./useNotes";
import { toast } from "sonner";
import type { AppUser } from "../../stores/authStore"; // Adjust path if needed
import type { Note } from "./useNotes"; // Import the Note type

// Mock the toast module
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(() => "mock-toast-id"), // Remove unused _message parameter
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

// Mock user object - adjusted to match AppUser type
const mockUser: AppUser = {
  id: "test-user-id",
  email: "test@example.com",
  user_metadata: { test: "meta" }, // Optional, added for completeness
};

const mockNoteResponse = {
  note: {
    id: "new-note-id",
    content: "This is a test note content longer than 300 characters...".repeat(10),
    user_id: mockUser.id,
    category_id: "test-category-id",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    summary: null,
    summary_status: "pending",
    summary_error_message: null,
    embedding: null,
    qa_status: "pending",
    qa_error_message: null,
  },
};

const mockCategoryId = "test-category-id";
const initialNoteContent = "This is a test note content longer than 300 characters...".repeat(10); // Ensure length > 300

describe("useNotes hook - saveNote method", () => {
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
        json: vi.fn().mockResolvedValueOnce({ note: mockNoteResponse.note }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ success: true }),
      });

    // Set valid note content
    act(() => {
      result.current.setNoteContent(mockNoteResponse.note.content);
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
        content: mockNoteResponse.note.content,
        category_id: mockCategoryId,
        summary_status: "pending",
      }),
    });

    // Verify summarize fetch call
    expect(mockFetch).toHaveBeenNthCalledWith(2, `/api/ai/summarize/${mockNoteResponse.note.id}`, {
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
      result.current.setNoteContent(mockNoteResponse.note.content);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    // Expect the more specific error message from the catch block
    expect(toast.error).toHaveBeenCalledWith(`Failed to save note: ${notesErrorMessage}. Please try again.`);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle error response from the /api/ai/summarize API and still return true", async () => {
    const { result } = renderHook(() => useNotes(mockUser));

    // Mock successful save but failed summarize
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({ note: mockNoteResponse.note }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: vi.fn().mockResolvedValueOnce({ error: "Summarization failed" }),
      });

    // Set valid note content
    act(() => {
      result.current.setNoteContent(mockNoteResponse.note.content);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(true);
    });

    // Expect the updated warning message
    expect(toast.warning).toHaveBeenCalledWith(
      "Note saved, but failed to start summary generation. You can retry later."
    );
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("should handle network errors during note saving", async () => {
    const { result } = renderHook(() => useNotes(mockUser));
    const networkErrorMessage = "Network error";

    // Mock network error
    mockFetch.mockRejectedValueOnce(new Error(networkErrorMessage));

    // Set valid note content
    act(() => {
      result.current.setNoteContent(mockNoteResponse.note.content);
    });

    await act(async () => {
      const success = await result.current.saveNote(mockCategoryId);
      expect(success).toBe(false);
    });

    // Expect the more specific error message including the network error
    expect(toast.error).toHaveBeenCalledWith(`Failed to save note: ${networkErrorMessage}. Please try again.`);
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
          new: { ...mockNoteResponse.note, summary_status: "processing" },
        });
      });

      // Simulate completed status update
      act(() => {
        callback({
          new: { ...mockNoteResponse.note, summary_status: "completed" },
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

  it("should clear noteContent immediately after successful save, before summary request", async () => {
    // Mock fetch responses specifically for this test
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        // Mock successful save response
        ok: true,
        json: async () => mockNoteResponse,
      })
      .mockResolvedValueOnce({
        // Mock successful (or any) summary response
        ok: true,
        json: async () => ({}),
      });

    const { result } = renderHook(() => useNotes(mockUser));

    // Set initial note content
    act(() => {
      result.current.setNoteContent(initialNoteContent);
    });

    expect(result.current.noteContent).toBe(initialNoteContent);

    // Call saveNote
    let savePromise: Promise<boolean> | undefined;
    act(() => {
      savePromise = result.current.saveNote(mockCategoryId);
    });

    // Wait for the saveNote function to process the first fetch (save note)
    // We need to wait for the state update triggered by the fetch response
    await act(async () => {
      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/notes", expect.anything());
      });
    });

    // --- Core Assertion ---
    // Check if noteContent is cleared IMMEDIATELY after save is processed,
    // even if the summary fetch is still pending or hasn't started.
    expect(result.current.noteContent).toBe("");
    // --- End Core Assertion ---

    // Check if the success toast for saving was called
    expect(vi.mocked(global.fetch).mock.calls.length).toBeGreaterThanOrEqual(1); // Ensure save was called
    expect(toast.success).toHaveBeenCalledWith("Note saved successfully. Generating summary...");

    // Check if the summarization fetch was called *after* clearing content
    await act(async () => {
      await vi.waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(`/api/ai/summarize/${mockNoteResponse.note.id}`, expect.anything());
      });
    });

    // Wait for the entire saveNote promise to resolve (including summary call)
    const saveResult = await savePromise;
    expect(saveResult).toBe(true); // Ensure saveNote reported success

    // Final check: content should still be empty
    expect(result.current.noteContent).toBe("");
  });
});

describe("useNotes Hook", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    // Default fetch mock (can be overridden in specific tests)
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ notes: [] }), // Default for loadNotes
    } as Response);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- Test suite for deleteNote --- //
  describe("deleteNote Functionality", () => {
    it("should successfully delete a note and update state", async () => {
      const note1 = createMockNote("note-1", "Note 1", "completed");
      const noteToDelete = createMockNote("note-to-delete", "Note 2", "pending");
      const initialNotesData = { notes: [note1, noteToDelete] };

      // Mock fetch for initial load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => initialNotesData,
      } as Response);
      // Mock fetch specifically for the DELETE call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => null,
      } as Response);

      const { result } = renderHook(() => useNotes(mockUser));

      // Load initial notes
      await act(async () => {
        await result.current.loadNotes("some-category-id"); // Load notes first
      });

      // Wait for state update after loading
      await waitFor(() => {
        expect(result.current.notes).toHaveLength(2);
      });

      // Set the note to be deleted as selected
      act(() => {
        result.current.setSelectedNote(noteToDelete);
      });
      expect(result.current.selectedNote?.id).toBe("note-to-delete");

      // Call deleteNote
      let success = false;
      await act(async () => {
        success = await result.current.deleteNote("note-to-delete");
      });
      expect(success).toBe(true);

      // Assertions
      // Fetch call 1 (loadNotes), Fetch call 2 (deleteNote)
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/notes/note-to-delete", { method: "DELETE" });
      expect(toast.loading).toHaveBeenCalledWith("Deleting note...");
      expect(toast.success).toHaveBeenCalledWith("Note deleted successfully", { id: "mock-toast-id" }); // Check ID from mock
      expect(result.current.notes).toHaveLength(1);
      expect(result.current.notes[0].id).toBe("note-1");
      expect(result.current.selectedNote).toBeNull();
    });

    it("should not delete if user is not logged in", async () => {
      const { result } = renderHook(() => useNotes(null)); // No user

      let success = true; // Assume success initially
      await act(async () => {
        success = await result.current.deleteNote("some-note-id");
      });
      expect(success).toBe(false);

      expect(mockFetch).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("You must be logged in to delete notes");
    });

    it("should handle API error during deletion", async () => {
      const note1 = createMockNote("note-1", "Note 1", "completed");
      const initialNotesData = { notes: [note1] };

      // Mock fetch for initial load
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => initialNotesData,
      } as Response);
      // Mock fetch to return an error status for DELETE
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server exploded" }),
      } as Response);

      const { result } = renderHook(() => useNotes(mockUser));

      // Load initial notes
      await act(async () => {
        await result.current.loadNotes("some-category-id");
      });
      await waitFor(() => {
        expect(result.current.notes).toHaveLength(1);
      });

      let success = true;
      await act(async () => {
        success = await result.current.deleteNote("note-1");
      });
      expect(success).toBe(false);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/notes/note-1", { method: "DELETE" });
      expect(toast.loading).toHaveBeenCalledWith("Deleting note...");
      expect(toast.error).toHaveBeenCalledWith("Failed to delete note: Server exploded", { id: "mock-toast-id" });
      expect(result.current.notes).toHaveLength(1); // State should not change on error
    });

    it("should handle API returning 404 (note not found/access denied)", async () => {
      // Mock fetch to return 404 for DELETE
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: "Note not found or access denied." }),
      } as Response);

      const { result } = renderHook(() => useNotes(mockUser));

      // No initial notes needed for this specific scenario, just call delete
      let success = true;
      await act(async () => {
        success = await result.current.deleteNote("non-existent-note");
      });
      expect(success).toBe(false);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith("/api/notes/non-existent-note", { method: "DELETE" });
      expect(toast.loading).toHaveBeenCalledWith("Deleting note...");
      expect(toast.error).toHaveBeenCalledWith("Failed to delete note: Note not found or access denied.", {
        id: "mock-toast-id",
      });
    });
  });

  // Add other test suites for loadNotes, saveNote etc. if needed
});

// Helper to create a mock Note
const createMockNote = (id: string, content: string, status: Note["summary_status"]): Note => ({
  id,
  content,
  user_id: mockUser.id,
  summary_status: status,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  category_id: null,
  summary: status === "completed" ? `Summary for ${content}` : null,
  summary_error_message: status === "failed" ? "Mock error" : null,
  qa_status: "idle",
  qa_error_message: null,
});
