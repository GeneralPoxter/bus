import { api } from "~/utils/api";
import { PostView } from "~/components/postview";
import { LoadingPage } from "~/components/loading";

const Message = (props: { text: string }) => {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="text-accent text-xl italic">{props.text}</span>
    </div>
  );
};

export const PostFeed = (props: { parentId: string | null }) => {
  const { data, isLoading: postsLoading } = api.posts.getAllComments.useQuery({
    parentId: props.parentId,
  });

  if (postsLoading) return <LoadingPage />;

  if (!data) return <Message text="Something went wrong" />;

  if (data.length === 0) return <Message text="No posts/comments yet" />;

  return (
    <div className="flex flex-col overflow-y-auto">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};
