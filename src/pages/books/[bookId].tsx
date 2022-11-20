import { type NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";

import Image from "next/image";
import { ImFileEmpty } from "react-icons/im";
import { formatTitle } from "~/components/SearchResult";

import parse from "html-react-parser";

interface ReviewSectionProps {
  bookId: string;
}
function ReviewSection(props: ReviewSectionProps) {
  const trpcContext = trpc.useContext();
  const {
    data: reviewData,
    isLoading,
    isError,
    error,
  } = trpc.books.getBookReviews.useQuery({
    id: props.bookId,
  });

  const createReview = trpc.books.createReview.useMutation({
    onSuccess: () => trpcContext.books.getBookReviews.invalidate(),
  });

  if (isError) {
    return <>{error.message}</>;
  }

  if (isLoading) {
    return <>Ladataan...</>;
  }

  return (
    <section className="flex flex-col">
      <span className="font-bold">Arvostelut</span>
      <button
        type="button"
        className="btn-primary btn"
        onClick={() =>
          createReview.mutate({
            bookId: props.bookId,
            score: 9,
            content: "TESTI ARVOSTELU, LUOTU PAINAMALLA TESTINAPPIA!",
          })
        }
      >
        Lisää testi arvostelu
      </button>
      {reviewData?.map((review) => (
        <div key={review.id}>{review.content}</div>
      ))}
    </section>
  );
}

const BookPage: NextPage = () => {
  const router = useRouter();
  const { bookId } = router.query;

  const {
    data: bookData,
    isLoading,
    isError,
    error,
  } = trpc.books.getById.useQuery(
    {
      id: bookId as string,
    },
    {
      enabled: !!bookId,
      retry: 0,
    },
  );

  if (
    typeof bookId !== "string" ||
    bookId === undefined ||
    bookId.length === 0
  ) {
    return <></>;
  }

  if (isError) {
    return <>{error.message}</>;
  }

  if (isLoading) {
    return <>Ladataan...</>;
  }

  if (!bookData) {
    return <>Ei löydy!</>;
  }

  const volume = bookData.volumeInfo;

  return (
    <>
      <div className="flex flex-row gap-8">
        {volume.imageLinks && volume.imageLinks.thumbnail ? (
          <Image
            src={volume.imageLinks.thumbnail}
            alt={`Kirjan ${volume.title} kansikuva`}
            width={128}
            height={300}
            className="my-0 h-min rounded"
            priority
          />
        ) : (
          <div className="flex h-48 w-32 justify-center rounded bg-neutral">
            <ImFileEmpty className="my-auto" />
          </div>
        )}
        <div className="flex flex-grow flex-col gap-4">
          <h1 className="my-0">{formatTitle(bookData)}</h1>
          <span>{volume.authors?.join(", ") ?? "Tuntematon kirjoittaja"}</span>

          <div className="my-0 inline-flex gap-2">
            {/* TODO: Komponentti tästä */}
            <div className="rating rating-lg rating-half my-0">
              <input type="radio" name="rating-10" className="rating-hidden" />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-1 mask-star-2 bg-secondary"
              />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-2 mask-star-2 bg-secondary"
              />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-1 mask-star-2 bg-secondary"
              />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-2 mask-star-2 bg-secondary"
              />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-1 mask-star-2 bg-secondary"
              />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-2 mask-star-2 bg-secondary"
              />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-1 mask-star-2 bg-secondary"
              />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-2 mask-star-2 bg-secondary"
              />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-1 mask-star-2 bg-secondary"
              />
              <input
                type="radio"
                name="rating-10"
                className="mask mask-half-2 mask-star-2 bg-secondary"
              />
            </div>

            <h1 className="my-0">5.00</h1>
          </div>
          {volume.description && (
            <div className="flex flex-col">
              <input
                type="checkbox"
                className="peer/more link order-2 appearance-none before:content-['Lisää'] before:checked:content-['Vähemmän']"
              />
              <div className="order-1 overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] peer-checked/more:contents">
                {parse(volume.description)}
              </div>
            </div>
          )}
          <div className="divider my-0"></div>
          <div className="ga-2 flex flex-col">
            {volume.pageCount && <span>{volume.pageCount} sivua</span>}
            <span>Julkaistu {volume.publishedDate}</span>
            <span>Kustantaja {volume.publisher}</span>
            {
              // TODO: Paremman näkösesti tulostus esim. ISBN 9522918253 (ISBN13 9789522918253)
              volume.industryIdentifiers?.map((identifier, i) => (
                <span key={"isbn" + i}>
                  {identifier.type} {identifier.identifier}
                </span>
              ))
            }
          </div>
        </div>
      </div>
      <div className="divider"></div>
      <ReviewSection bookId={bookId} />
    </>
  );
};

export default BookPage;
