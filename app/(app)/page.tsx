import { cookies, headers } from "next/headers";
import MainPage from "./_components/main-page";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth");
  }

  const cookiesInfo = await cookies();
  let apiKeys: Record<string, string>;
  try {
    apiKeys = JSON.parse(cookiesInfo.get("apiKeys")?.value || "{}");
  } catch {
    apiKeys = {};
    cookiesInfo.set("apiKeys", JSON.stringify(apiKeys));
  }

  return (
    <MainPage
      selectedModelId={
        cookiesInfo.get("selectedModelId")?.value || "gemini-2.5-flash"
      }
      apiKeys={apiKeys}
    />
  );
}
