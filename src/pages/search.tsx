import { type NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";
import SearchResult from "~/components/SearchResult";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const { q } = router.query;

  const { data: booksData, isLoading } = trpc.books.search.useQuery(
    {
      term: (q as string) ?? "",
      page: 0,
      pageLength: 20,
    },
    {
      enabled: !!q,
    },
  );

  if (typeof q !== "string" || q === undefined || q.length === 0) {
    return <></>;
  }

  if (isLoading) {
    return <h1>Ladataan...</h1>;
  }

  return (
    <>
      <h1>Hakutulokset: {q}</h1>
      <div className="flex flex-col gap-4">
        {booksData?.items?.map((b) => (
          <SearchResult key={"search" + b.id} book={b} />
        ))}
      </div>
    </>
  );
};

export default SearchPage;
