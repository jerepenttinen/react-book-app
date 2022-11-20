import { type NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";

import Image from "next/image";
import { ImFileEmpty, ImRadioUnchecked, ImRadioChecked } from "react-icons/im";
import { IoLibrary } from "react-icons/io5";
import { formatTitle } from "~/components/SearchResult";

import parse from "html-react-parser";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Popover, RadioGroup } from "@headlessui/react";

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

const shelves = [
  {
    value: "none",
    text: "Ei hyllyssä?", // TODO: Parempi teksi tähän
  },
  {
    value: "shelf",
    text: "Hyllyssä",
  },
  {
    value: "reading",
    text: "Lukemassa",
  },
  {
    value: "read",
    text: "Luettu",
  },
];

function AddToLibraryButton(props: ReviewSectionProps) {
  const session = useSession();
  const { data: savedBookData } = trpc.books.getSavedBookById.useQuery(
    {
      id: props.bookId,
    },
    {
      retry: 0,
      enabled: !!session.data,
    },
  );

  const [shelf, setShelf] = useState(savedBookData?.shelf ?? "none");

  if (!session.data) {
    return <></>;
  }

  return (
    <>
      <Popover className="dropdown">
        <Popover.Button className="btn w-full min-w-max gap-2">
          <IoLibrary />
          Kirjasto
        </Popover.Button>
        <Popover.Panel className="dropdown-content menu rounded-box w-40 bg-base-300 p-2 shadow">
          {({ close }) => (
            <>
              <RadioGroup value={shelf} onChange={setShelf}>
                <RadioGroup.Label as="li" className="menu-title">
                  <span>Valitse hylly</span>
                </RadioGroup.Label>
                {shelves.map((s) => (
                  <div className="form-control" key={s.value}>
                    <RadioGroup.Option
                      value={s.value}
                      as="label"
                      className="label cursor-pointer hover:bg-primary-focus/25 focus:outline-none"
                    >
                      {({ checked }) => (
                        <>
                          <span className={checked ? "text-primary" : ""}>
                            {checked ? (
                              <ImRadioChecked />
                            ) : (
                              <ImRadioUnchecked />
                            )}
                          </span>
                          <span
                            className={`${checked ? "active" : ""} label-text`}
                          >
                            {s.text}
                          </span>
                        </>
                      )}
                    </RadioGroup.Option>
                  </div>
                ))}
              </RadioGroup>
              {/* TODO: Toteuta tallennus! */}
              <button className="btn-sm btn" onClick={() => close()}>
                Tallenna
              </button>
            </>
          )}
        </Popover.Panel>
      </Popover>
    </>
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
        <div className="flex flex-col gap-4">
          {volume.imageLinks?.thumbnail ? (
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
          <AddToLibraryButton bookId={bookId} />
        </div>
        <div className="flex w-5/6 grow flex-col gap-4">
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
            <div className="flex flex-shrink flex-col">
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
