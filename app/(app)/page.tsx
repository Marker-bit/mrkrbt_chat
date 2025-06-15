import { auth } from "@/lib/auth";
import { getAPIKeys, getModelData } from "@/lib/cookie-utils";
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
  const selectedModelData = await getModelData();

  return (
    <MainPage
      selectedModelData={selectedModelData}
      apiKeys={apiKeys}
    />
  );
}
