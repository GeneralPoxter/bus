import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="h-full w-full overflow-y-auto border-x border-orange-400 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};
