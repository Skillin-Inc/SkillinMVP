// Main database module exports
// This file re-exports all database functions and types for easy importing

// Export types
export * from "./types";

// Export connection utilities
export { getPool, executeQuery } from "./connection";

// Export user functions
export * from "./users";

// Export message functions
export * from "./messages";

// Export category functions
export * from "./categories";

// Export course functions
export * from "./courses";

// Export lesson functions
export * from "./lessons";

// Export progress functions
export * from "./progress";
