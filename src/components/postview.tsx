import Link from "next/link";
import Image from "next/image";
import { api, type RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { type LucideIcon, MessageCircle, Heart } from "lucide-react";

const PostIcon = (props: {
  icon: LucideIcon;
  label: string;
  small: boolean;
}) => {
  return (
    <div className="group flex w-16 items-center gap-1">
      <props.icon
        className={`${
          props.small ? "h-4" : "h-5"
        } stroke-accent group-hover:stroke-accent-light`}
      />
      <span className="text-accent group-hover:text-accent-light">
        {props.label}
      </span>
    </div>
  );
};

const ProfileImage = (props: { src: string; size: number }) => {
  return (
    <Image
      src={props.src}
      alt="Profile image"
      className={`h-[48px] rounded-full border border-slate-600`}
      width={props.size}
      height={props.size}
    />
  );
};

const PostContent = (props: { data: PostWithUser; small: boolean }) => {
  const { post, author } = props.data;
  return (
    <div className={`flex flex-col ${props.small && "text-xs"}`}>
      <div className="flex gap-1">
        <Link
          href={`/@${author.username}`}
          className="text-accent no-underline hover:text-accent-light hover:underline"
        >
          <span>{`@${author.username}`}</span>
        </Link>
        <span className="font-thin text-accent">{`🚍 ${dayjs(
          post.createdAt,
        ).fromNow()}`}</span>
      </div>
      <span>{post.content}</span>
      <div className={`flex ${props.small ? "pt-2" : "pt-3"}`}>
        <Link href={`/post/${post.id}`}>
          <PostIcon
            icon={MessageCircle}
            label={`${post.comments.length}`}
            small={props.small}
          />
        </Link>
        <button>
          <PostIcon icon={Heart} label="0" small={props.small} />
        </button>
      </div>
    </div>
  );
};

const ParentPost = (props: { id: string | null }) => {
  if (props.id == null) return null;

  const { data } = api.posts.getById.useQuery({
    id: props.id,
  });

  if (!data) return null;

  return (
    <div className="flex gap-3">
      <div className="flex min-w-[48px] flex-col items-center">
        <ProfileImage src={data.author.imageUrl} size={36} />
        <div className="h-full min-h-[24px] w-0 border-l border-dashed border-slate-600"></div>
      </div>
      <div className="pb-3">
        <PostContent data={data} small={true} />
      </div>
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAllComments"][number];
export const PostView = (props: {
  data: PostWithUser;
  showParent: boolean;
}) => {
  const {
    data: { post, author },
    showParent,
  } = props;
  return (
    <div className="flex flex-col border-b border-slate-600 p-4">
      {showParent && <ParentPost id={post.parentId} />}
      <div key={post.id} className="flex gap-3">
        <ProfileImage src={author.imageUrl} size={48} />
        <PostContent data={props.data} small={false} />
      </div>
    </div>
  );
};
