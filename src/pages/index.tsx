import { SignInButton, useUser } from "@clerk/nextjs";

import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { LoadingPage } from "~/components/loading";
import { CreatePostForm } from "~/components/postform";

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

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

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <PageLayout>
        <div className="flex border-b border-orange-200 p-4">
          {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton />
            </div>
          )}
          {isSignedIn && <CreatePostForm type="post" />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
}
