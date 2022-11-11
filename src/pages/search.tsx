import { type NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";
import Image from "next/image";

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
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <h1>Hakutulokset: {q}</h1>
      <div className="flex flex-col gap-4">
        {booksData?.items.map((b) => (
          <div key={b.id} className="flex flex-row gap-4">
            {b.volumeInfo.imageLinks ? (
              <Image
                src={b.volumeInfo.imageLinks.thumbnail}
                alt={`Kirjan ${b.volumeInfo.title} kansikuva`}
                height={96}
                width={62}
                className="my-0 w-auto"
              />
            ) : (
              <div>empty</div>
            )}
            <div className="flex flex-col">
              <b>{b.volumeInfo.title}</b>
              <p>
                {b.volumeInfo.authors?.join(", ") ?? "Tuntematon kirjoittaja"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default SearchPage;
