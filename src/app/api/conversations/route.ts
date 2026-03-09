import { NextResponse } from "next/server";
import { demoConversations, demoMessages } from "@/lib/demo-data";

export async function GET() {
  // Return conversations with last message preview
  const conversations = demoConversations.map((conv) => {
    const msgs = demoMessages.filter((m) => m.conversationId === conv.id);
    const lastMessage = msgs[msgs.length - 1];
    const messageCount = msgs.filter((m) => m.role !== "system").length;

    return {
      ...conv,
      lastMessage: lastMessage
        ? {
            content:
              lastMessage.content.length > 100
                ? lastMessage.content.slice(0, 100) + "..."
                : lastMessage.content,
            role: lastMessage.role,
            createdAt: lastMessage.createdAt,
          }
        : null,
      messageCount,
    };
  });

  // Sort by most recent first
  conversations.sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return NextResponse.json({ conversations });
}
