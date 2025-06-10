import DeleteAccountButton from "./_components/delete-account-button";

export default function Page() {
  return (
    <div>
      <div className="bg-red-500/30 border border-red-500 dark:border-red-800 p-4 rounded-lg mt-4">
        <h1 className="text-2xl font-bold mb-4">Danger zone</h1>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
