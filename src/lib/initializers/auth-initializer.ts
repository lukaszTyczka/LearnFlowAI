import { setUser } from "@/stores/authStore";
import type { User } from "@supabase/supabase-js";

// Type guard to check if the element is a script tag
function isScriptElement(element: Element | null): element is HTMLScriptElement {
  return element instanceof HTMLScriptElement;
}

// Find the script tag containing the initial user data
const scriptTag = document.getElementById("__INITIAL_USER_DATA__");

let initialUser: User | null = null;

if (isScriptElement(scriptTag) && scriptTag.textContent) {
  try {
    initialUser = JSON.parse(scriptTag.textContent);
  } catch (error) {
    console.error("Failed to parse initial user data:", error);
    // Handle the error appropriately, maybe default to null
    initialUser = null;
  }
} else {
  console.warn("Initial user data script tag not found or empty.");
}

// Set the user in the client-side store
if (setUser) {
  setUser(initialUser);
  console.log("Auth Initializer: User set in store", initialUser);
} else {
  console.error("Auth Initializer: setUser function not found in authStore.");
}
