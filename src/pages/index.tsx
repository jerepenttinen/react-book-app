import { type Book } from "@prisma/client";
import { type NextPage } from "next";
import Link from "next/link";
import Avatar from "~/components/Avatar";
import UpdateBlock from "~/components/UpdateBlock";
import { trpc } from "~/utils/trpc";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.books.getHomePageUpdates.useQuery();
  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {data?.map((a) => (
				<UpdateBlock updateBlock={a} />
      ))}
    </div>
  );
};

export default Home;
