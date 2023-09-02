import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

import { api } from "~/utils/api";
import { LoadingSpinner } from "~/components/loading";

import { useState } from "react";
import toast from "react-hot-toast";

const CreatePostWizard = (props: { parentId: string | null }) => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAllComments.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else if (e.data) {
        toast.error(`Failed to post: ${e.data.code}`);
      } else {
        toast.error("Failed to post, please try again later");
      }
    },
  });

  const submitForm = () => {
    mutate({
      content: input,
      parentId: props.parentId,
    });
  };

  if (!user) return null;

  return (
    <div className="flex w-full items-center gap-3">
      <Image
        src={user.imageUrl}
        alt="Profile image"
        className="rounded-full border-2 border-slate-500"
        width={64}
        height={64}
      />
      <input
        placeholder={`${props.parentId ? "Comment" : "Post"} about buses! 🚌`}
        className="grow bg-transparent placeholder-gray-300 outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              submitForm();
            }
          }
        }}
        disabled={isPosting}
      />
      {input !== "" && !isPosting && (
        <button
          className="bg-accent rounded-lg px-4 py-2 font-bold hover:scale-110"
          onClick={submitForm}
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

export const CreatePostForm = (props: { parentId: string | null }) => {
  const { isSignedIn } = useUser();

  return (
    <div className="bg-base-light flex border-b-2 border-slate-500 p-4">
      {!isSignedIn && (
        <div className="flex justify-center">
          <SignInButton />
        </div>
      )}
      {isSignedIn && <CreatePostWizard parentId={props.parentId} />}
    </div>
  );
};
