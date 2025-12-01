"use server"

/**
 * Server actions for user-related operations that can be called from client components.
 * These use dynamic imports to avoid bundling server-only code in client bundles.
 * This allows the app to preview without a backend connection.
 */

export const getCurrentUser = async () => {
  try {
    // Dynamically import to avoid bundling server-only code in client
    const cookiesModule = await import("./cookies")
    return await cookiesModule.getCurrentUser()
  } catch (error) {
    // Gracefully handle errors when backend is unavailable (preview mode)
    console.warn("getCurrentUser: Backend unavailable, returning null", error)
    return null
  }
}

export const removeAuthToken = async () => {
  try {
    // Dynamically import to avoid bundling server-only code in client
    const cookiesModule = await import("./cookies")
    return await cookiesModule.removeAuthToken()
  } catch (error) {
    // Gracefully handle errors when backend is unavailable (preview mode)
    console.warn("removeAuthToken: Backend unavailable", error)
  }
}

