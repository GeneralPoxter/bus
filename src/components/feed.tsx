import { api } from "~/utils/api";
import { PostView } from "~/components/postview";
import { LoadingPage } from "~/components/loading";

export const Feed = (props: { parentId: string | null }) => {
  const { data, isLoading: postsLoading } = api.posts.getAllComments.useQuery(
    props.parentId,
  );

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};
