import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { CreatePostForm } from "~/components/postform";
import { PostFeed } from "~/components/postfeed";

export default function Home() {
  const { isLoaded: userLoaded } = useUser();

  api.posts.getAllComments.useQuery({ parentId: null });

  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <CreatePostForm parentId={null} />
        <PostFeed parentId={null} />
      </PageLayout>
    </>
  );
}
