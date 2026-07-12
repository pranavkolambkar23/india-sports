import { Suspense } from "react";
import { AdminEntityForm } from "@/components/admin/AdminEntityForm";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default async function EditTeamPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<LoadingScreen />}>
        <AdminEntityForm type="team" id={params.id} />
      </Suspense>
    </div>
  );
}
