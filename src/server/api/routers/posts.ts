import { clerkClient } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const postWithComments = Prisma.validator<Prisma.PostDefaultArgs>()({
  include: { comments: true },
});
type PostWithData = Prisma.PostGetPayload<typeof postWithComments>;

const addUserDataToPosts = async (posts: PostWithData[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author?.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
        include: { comments: true },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return (await addUserDataToPosts([post]))[0];
    }),

  getAllComments: publicProcedure
    .input(z.object({ parentId: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      const posts = await ctx.prisma.post.findMany({
        take: 100,
        orderBy: [{ createdAt: "desc" }],
        where: {
          parentId: input.parentId,
        },
        include: { comments: true },
      });

      return addUserDataToPosts(posts);
    }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          take: 100,
          orderBy: [{ createdAt: "desc" }],
          where: {
            authorId: input.userId,
          },
          include: { comments: true },
        })
        .then(addUserDataToPosts),
    ),

  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .regex(new RegExp("bus", "i"), {
            message: `Post must contain the word 'bus' 🚌`,
          })
          .min(1)
          .max(255),
        parentId: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;

      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
          parentId: input.parentId,
        },
      });

      return post;
    }),

  getLikesByPostId: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .query(({ ctx, input }) =>
      ctx.prisma.like.findMany({
        where: { postId: input.postId },
      }),
    ),

  like: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const alreadyLiked = await ctx.prisma.like.findMany({
        where: { userId: ctx.userId, postId: input.postId },
      });

      if (alreadyLiked.length > 0) throw new TRPCError({ code: "BAD_REQUEST" });

      const like = await ctx.prisma.like.create({
        data: {
          userId: ctx.userId,
          postId: input.postId,
        },
      });

      return like;
    }),

  unlike: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.like.deleteMany({
        where: { userId: ctx.userId, postId: input.postId },
      });
    }),
});
