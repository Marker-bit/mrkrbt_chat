import { auth } from "@/lib/auth";
import { getAPIKeys } from "@/lib/cookie-utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MainPage from "./_components/main-page";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/auth");
  }
  
  const apiKeys = await getAPIKeys()

  return (
    <MainPage
      apiKeys={apiKeys}
    />
  );
}
