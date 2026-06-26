import GroupDetailPage from "@/components/groups/GroupDetailPage";

export default function Page({ params }: { params: { id: string } }) {
  return <GroupDetailPage groupId={params.id} />;
}
