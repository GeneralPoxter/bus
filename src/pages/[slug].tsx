import Head from "next/head";
import Image from "next/image";
import type { GetStaticProps, NextPage } from "next/types";

import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { LoadingPage } from "~/components/loading";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading)
    return (
      <div className="h-full">
        <LoadingPage />
      </div>
    );

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {data.map((fullPost) => (
        <PostView data={fullPost} showParent={true} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`@${data.username}`}</title>
      </Head>
      <PageLayout>
        <div>
          <div className="relative h-32 bg-base-light">
            <Image
              src={data.imageUrl}
              alt="Profile image"
              className="absolute bottom-0 left-0 -mb-[64px] ml-8 rounded-full border-[3px] border-accent bg-base"
              width={128}
              height={128}
            />
          </div>
          <div className="h-[64px]"></div>
          <div className="mb-4 ml-8 mt-2 text-2xl font-bold">{`@${data.username}`}</div>
          <div className="border-b-4 border-slate-600"></div>
        </div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateSSGHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
