import Head from "next/head";
import type { GetStaticProps, NextPage } from "next/types";

import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { PostView } from "~/components/postview";
import { CreatePostForm } from "~/components/postform";
import { PostFeed } from "~/components/postfeed";
import { useUser } from "@clerk/nextjs";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { isLoaded: userLoaded } = useUser();

  if (!userLoaded) return <div />;

  const { data } = api.posts.getById.useQuery({
    id,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`Post - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <CreatePostForm parentId={id} />
        <PostView {...data} />
        <div className="ml-14 flex grow flex-col overflow-y-auto border-l-4 border-slate-600">
          <PostFeed parentId={id} />
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id");

  await helpers.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
