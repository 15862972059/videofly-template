import { auth } from "../src/lib/auth/auth";

async function main() {
  console.log("Auth initialized successfully!");
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    });
    console.log("Session retrieval completed!", session);
  } catch (error) {
    console.error("Session retrieval error:", error);
  }
}

main().catch(console.error);
