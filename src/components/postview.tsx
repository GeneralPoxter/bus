import Link from "next/link";
import Image from "next/image";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { type LucideIcon, MessageCircle, Heart } from "lucide-react";

const PostIcon = (props: { icon: LucideIcon; label: string }) => {
  return (
    <div className="group flex w-16 items-center gap-1">
      <props.icon className="stroke-accent group-hover:stroke-accent-light h-5" />
      <span className="text-accent group-hover:text-accent-light">
        {props.label}
      </span>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAllComments"][number];
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-600 p-4">
      <Image
        src={author.imageUrl}
        alt="Profile image"
        className="h-[48px] rounded-full border border-slate-600"
        width={48}
        height={48}
      />
      <div className="flex flex-col">
        <div className="text-accent flex gap-1 ">
          <Link
            href={`/@${author.username}`}
            className="hover:text-accent-light no-underline hover:underline"
          >
            <span>{`@${author.username}`}</span>
          </Link>
          <span className="font-thin">{`🚍 ${dayjs(
            post.createdAt,
          ).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
        <div className="flex pt-3">
          <Link href={`/post/${post.id}`}>
            <PostIcon icon={MessageCircle} label={`${post.comments.length}`} />
          </Link>
          <button>
            <PostIcon icon={Heart} label="0" />
          </button>
        </div>
      </div>
    </div>
  );
};
