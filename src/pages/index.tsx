import { type NextPage } from "next";
import Avatar from "~/components/Avatar";
import { Update } from "~/components/UpdateBlock";
import UserLink from "~/components/UserLink";
import { trpc } from "~/utils/trpc";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.updates.getHomePageUpdates.useQuery();
  if (isLoading) {
    return null;
  }

  return (
    <div className="flex flex-col gap-16">
      {data?.map((block) => (
				<section
					key={block.user.id + block.book.id}
					className="flex flex-col gap-4"
				>
					<div className="flex flex-row gap-4">
						<Avatar user={block.user} size="m" />
						<div className="flex flex-col gap-4">
							<UserLink user={block.user} className="font-bold" />
							<Update book={block.book} updates={block.updates} />
						</div>
					</div>
				</section>
      ))}
    </div>
  );
};

export default Home;
