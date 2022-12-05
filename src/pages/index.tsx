import { type Book } from "@prisma/client";
import { type NextPage } from "next";
import Avatar from "~/components/Avatar";
import BookCover from "~/components/BookCover";
import { formatBookProgress } from "~/utils/format-book-progress";
import { formatDate } from "~/utils/format-date";
import { trpc } from "~/utils/trpc";

const Home: NextPage = () => {
  const { data, isLoading } = trpc.books.getHomePageUpdates.useQuery();
  if (isLoading) {
    return null;
  }

  console.log(data);
  return (
    <div className="flex flex-col gap-16">
      {data?.map((a) => (
        <div key={a.user.id + a.book.id} className="flex flex-col gap-4">
          <div>
						<Avatar user={a.user} size="m" />
					</div>
          <div>
						<BookCover book={a.book as unknown as Book} size="s" />
					</div>
          <ul className="steps steps-vertical">
						{a.updates.map(update => (
							<li key={update.id} className="step step-primary">
								<div>{formatDate(update.createdAt)} {formatBookProgress(update, a.book.pageCount)}</div>
							</li>
						))}
					</ul>
        </div>
      ))}
    </div>
  );
};

export default Home;
