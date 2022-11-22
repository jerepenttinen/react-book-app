import { type NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";
import SearchResult from "~/components/SearchResult";
import { useState } from "react";

const pageLength = 20;

const SearchPage: NextPage = () => {
  const router = useRouter();
  const { q } = router.query;
  const [page, setPage] = useState(0);

  const {
    data: booksData,
    isLoading,
    isError,
    error,
  } = trpc.books.search.useQuery(
    {
      term: (q as string) ?? "",
      page,
      pageLength,
    },
    {
      enabled: !!q,
      retry: 0,
    },
  );

  if (typeof q !== "string" || q === undefined || q.length === 0) {
    return <></>;
  }

  if (isLoading) {
    return <h1>Ladataan...</h1>;
  }

  if (isError) {
    return <h1>{error.data?.code}</h1>;
  }

  const lastPage = !!booksData?.totalItems
    ? Math.ceil(booksData.totalItems / pageLength)
    : 0;

  const pageNumbers: number[] = [];
  for (let i = 0; i < lastPage; i++) {
    pageNumbers.push(i + 1);
  }

  return (
    <div className="flex flex-col gap-8">
      <h1>Hakutulokset: {q}</h1>
      <div className="flex flex-col gap-4">
        {booksData?.items?.map((b) => (
          <SearchResult key={"search" + b.id} book={b} />
        ))}
      </div>
      <div className="btn-group">
        <button
          type="button"
          className="btn"
          disabled={page === 0}
          onClick={() => setPage((page) => page - 1)}
        >
          {"<"}
        </button>
        <div className="btn">Sivu {page + 1}</div>
        <button
          type="button"
          className="btn"
          disabled={page === lastPage}
          onClick={() => setPage((page) => page + 1)}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default SearchPage;
