import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CustomizationForm from "./form";

export default async function Page() {
  const session = await auth.api.getSession({headers: await headers()})
  if (!session) {
    return redirect("/auth");
  }

  const additionalInfo = session.user.additionalInfo;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customization</h1>
      <CustomizationForm defaultAdditionalInfo={additionalInfo} />
    </div>
  );
}