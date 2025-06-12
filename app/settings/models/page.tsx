import { MODELS } from "@/lib/models";
import ModelCard from "./model-card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ModelsList from "./models-list";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return redirect("/auth");
  }
  const favouriteModels = session.user.favouriteModels;
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Models</h1>
      <ModelsList initialFavouriteModels={favouriteModels} />
    </div>
  );
}
