import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { CreatePostForm } from "~/components/postform";
import { Feed } from "~/components/feed";

export default function Home() {
  const { isLoaded: userLoaded } = useUser();

  api.posts.getAllComments.useQuery(null);

  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <CreatePostForm parentId={null} />
        <Feed parentId={null} />
      </PageLayout>
    </>
  );
}
