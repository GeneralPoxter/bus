import { useUser } from "@clerk/nextjs";
import Image from "next/image";

import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading";
import type { PostType } from "~/server/api/routers/posts";

import { useState } from "react";
import toast from "react-hot-toast";

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const CreatePostForm = (props: { type: PostType }) => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post, please bus again later");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.imageUrl}
        alt="Profile image"
        className="rounded-full"
        width={56}
        height={56}
      />
      <input
        placeholder={`${titleCase(props.type)} about buses! 🚌`}
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ type: props.type, content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button
          className="rounded-lg bg-orange-300 px-4 py-2 font-bold hover:bg-orange-400"
          onClick={() => mutate({ type: props.type, content: input })}
        >
          BUS!
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={24} />
        </div>
      )}
    </div>
  );
};
