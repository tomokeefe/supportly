import { NextRequest, NextResponse } from "next/server";
import { getConversation, getMessagesForConversation } from "@/lib/demo-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conversation = getConversation(id);

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const messages = getMessagesForConversation(id);

  return NextResponse.json({ conversation, messages });
}
