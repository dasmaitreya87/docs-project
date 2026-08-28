import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { auth, currentUser } from "@clerk/nextjs/server";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(req: Request) {
  console.log("========== LIVEBLOCKS AUTH REQUEST ==========");

  try {
    // --------------------------------------------
    // 1. Authenticate with Clerk
    // --------------------------------------------
    const { sessionClaims } = await auth();

    if (!sessionClaims) {
      console.error(
        "[Liveblocks] No session claims found"
      );

      return new Response("Unauthorized", {
        status: 401,
      });
    }

    console.log(
      "[Liveblocks] Session claims:",
      sessionClaims
    );

    // --------------------------------------------
    // 2. Get current user
    // --------------------------------------------
    const user = await currentUser();

    if (!user) {
      console.error(
        "[Liveblocks] No authenticated user found"
      );

      return new Response("Unauthorized", {
        status: 401,
      });
    }

    console.log("[Liveblocks] Current user:", {
      id: user.id,
      name: user.fullName,
      email:
        user.primaryEmailAddress?.emailAddress,
    });

    // --------------------------------------------
    // 3. Read room from request
    // --------------------------------------------
    let room: string;

    try {
      const body = await req.json();
      room = body.room;
    } catch (error) {
      console.error(
        "[Liveblocks] Failed to parse request body:",
        error
      );

      return new Response(
        "Invalid request body",
        {
          status: 400,
        }
      );
    }

    if (!room) {
      console.error(
        "[Liveblocks] Room ID is missing"
      );

      return new Response(
        "Room ID is required",
        {
          status: 400,
        }
      );
    }

    console.log(
      "[Liveblocks] Requested room:",
      room
    );

    // --------------------------------------------
    // 4. Get document from Convex
    // --------------------------------------------
    let document;

    try {
      document = await convex.query(
        api.documents.getById,
        {
          id: room as Id<"documents">,
        }
      );
    } catch (error) {
      console.error(
        "[Liveblocks] Failed to fetch document:",
        error
      );

      return new Response(
        "Failed to fetch document",
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------
    // 5. Make sure document exists
    // --------------------------------------------
    if (!document) {
      console.error(
        "[Liveblocks] Document not found:",
        room
      );

      return new Response(
        "Document not found",
        {
          status: 404,
        }
      );
    }

    console.log("[Liveblocks] Document:", {
      id: document._id,
      title: document.title,
      ownerId: document.ownerId,
      organizationId: document.organizationId,
    });

    // --------------------------------------------
    // 6. Check ownership
    // --------------------------------------------
    const isOwner =
      document.ownerId === user.id;

    // --------------------------------------------
    // 7. Get organization ID from Clerk
    //
    // IMPORTANT:
    // Your actual session claims contain:
    //
    // o: {
    //   id: "org_..."
    // }
    //
    // NOT:
    //
    // org_id
    // --------------------------------------------
    const sessionOrganizationId =
      (
        sessionClaims as {
          o?: {
            id?: string;
          };
        }
      ).o?.id;

    // --------------------------------------------
    // 8. Check organization membership
    // --------------------------------------------
    const isOrganizationMember =
      !!(
        document.organizationId &&
        sessionOrganizationId &&
        document.organizationId ===
          sessionOrganizationId
      );

    // --------------------------------------------
    // 9. Debug information
    // --------------------------------------------
    console.log(
      "========== LIVEBLOCKS DEBUG =========="
    );

    console.log(
      "User ID:",
      user.id
    );

    console.log(
      "Session Org ID:",
      sessionOrganizationId
    );

    console.log(
      "Document ID:",
      document._id
    );

    console.log(
      "Document Owner ID:",
      document.ownerId
    );

    console.log(
      "Document Organization ID:",
      document.organizationId
    );

    console.log(
      "Is Owner:",
      isOwner
    );

    console.log(
      "Is Organization Member:",
      isOrganizationMember
    );

    console.log(
      "======================================"
    );

    // --------------------------------------------
    // 10. Authorization check
    // --------------------------------------------
    if (
      !isOwner &&
      !isOrganizationMember
    ) {
      console.error(
        "[Liveblocks] ACCESS DENIED"
      );

      return new Response(
        "Unauthorized",
        {
          status: 401,
        }
      );
    }

    console.log(
      "[Liveblocks] ACCESS GRANTED"
    );

    // --------------------------------------------
    // 11. Create user information
    // --------------------------------------------
    const name =
      user.fullName ??
      user.primaryEmailAddress
        ?.emailAddress ??
      "Anonymous";

    const nameToNumber = name
      .split("")
      .reduce(
        (acc, char) =>
          acc + char.charCodeAt(0),
        0
      );

    const hue =
      Math.abs(nameToNumber) % 360;

    const color =
      `hsl(${hue}, 80%, 60%)`;

    // --------------------------------------------
    // 12. Prepare Liveblocks session
    // --------------------------------------------
    let session;

    try {
      session =
        liveblocks.prepareSession(
          user.id,
          {
            userInfo: {
              name,
              avatar: user.imageUrl,
              color,
            },
          }
        );

      session.allow(
        room,
        session.FULL_ACCESS
      );
    } catch (error) {
      console.error(
        "[Liveblocks] Failed to prepare session:",
        error
      );

      return new Response(
        "Failed to prepare Liveblocks session",
        {
          status: 500,
        }
      );
    }

    // --------------------------------------------
    // 13. Authorize Liveblocks session
    // --------------------------------------------
    try {
      const {
        body,
        status,
      } = await session.authorize();

      console.log(
        "[Liveblocks] Session authorized successfully"
      );

      return new Response(
        body,
        {
          status,
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "[Liveblocks] Failed to authorize session:",
        error
      );

      return new Response(
        "Liveblocks authorization failed",
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error(
      "[Liveblocks] Unexpected error:",
      error
    );

    return new Response(
      "Internal Server Error",
      {
        status: 500,
      }
    );
  } finally {
    console.log(
      "[Liveblocks] Request finished"
    );

    console.log(
      "==========================================="
    );
  }
}