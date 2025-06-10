import { headers } from "next/headers";
import ChatPage from "./_components/chat-page";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { use } from "react";

export default async function Home({ params }: { params: Promise<{ id: string }> }) {
  const {id} = use(params);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth");
  }

  return <ChatPage id={id} />;
}
