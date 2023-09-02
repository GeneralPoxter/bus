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
      if (props.parentId) {
        void ctx.posts.getById.invalidate();
      }
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
        className="rounded-full border-2 border-accent"
        width={64}
        height={64}
      />
      <input
        placeholder={`${props.parentId ? "Comment" : "Post"} about buses! 🚌`}
        className="w-0 flex-1 bg-transparent text-xl placeholder-gray-300 outline-none"
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
          className="rounded-lg bg-accent px-4 py-2 text-base text-xl font-bold hover:bg-accent-light"
          onClick={submitForm}
        >
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={48} />
        </div>
      )}
    </div>
  );
};

export const CreatePostForm = (props: { parentId: string | null }) => {
  const { isSignedIn } = useUser();

  return (
    <div className="flex border-b-4 border-slate-600 bg-base-light p-4">
      {!isSignedIn && (
        <div className="flex w-full justify-center">
          <SignInButton>
            <button className="rounded-lg bg-accent px-4 py-2 text-base text-xl font-bold hover:bg-accent-light">
              Sign in
            </button>
          </SignInButton>
        </div>
      )}
      {isSignedIn && <CreatePostWizard parentId={props.parentId} />}
    </div>
  );
};
