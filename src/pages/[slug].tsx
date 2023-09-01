import Head from "next/head";
import Image from "next/image";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import type { GetStaticProps, NextPage } from "next/types";

import { api } from "~/utils/api";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PageLayout } from "~/components/layout";

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
        <div className="relative h-36 bg-slate-700">
          <Image
            src={data.imageUrl}
            alt="Profile image"
            className="absolute bottom-0 left-0 -mb-[64px] ml-8 rounded-full border-4 border-orange-400 bg-slate-800"
            width={128}
            height={128}
          />
        </div>
        <div className="h-[64px]"></div>
        <div className="ml-8 py-4 text-2xl font-bold">{`@${data.username}`}</div>
        <div className="border-b border-orange-400"></div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

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
