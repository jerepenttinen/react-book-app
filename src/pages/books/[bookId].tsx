import { type NextPage } from "next";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";

import { ImRadioUnchecked, ImRadioChecked } from "react-icons/im";
import { IoLibrary } from "react-icons/io5";
import { formatTitle } from "~/components/SearchResult";

import parse from "html-react-parser";
import { useSession } from "next-auth/react";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { Popover, RadioGroup } from "@headlessui/react";
import BookCover from "~/components/BookCover";

import Avatar from "~/components/Avatar";
import Link from "next/link";

import { Menu } from "@headlessui/react";
import { Stars } from "~/components/Stars";

interface ReviewSectionProps {
  bookId: string;
}
function ReviewSection(props: ReviewSectionProps) {
  const session = useSession();
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

  if (session.status === "unauthenticated") {
    return (
      <>
        <span className="font-bold">Kirjan arvostelut</span>
        {reviewData?.map((review) => (
          <>
            <div className="flex flex-col gap-4 sm:flex-row" key={review.id}>
              {" "}
              <div className="w-80 flex-1 gap-4 overflow-hidden break-words">
                {review.content}
              </div>
              <ReviewScore reviewScore={review.score} />
              <div className="keep-all flex items-center gap-2 overflow-hidden">
                {review.user.name}
                <Menu as="div" className="dropdown-end dropdown h-12">
                  <Menu.Button>
                    <Avatar user={review.user} size="s" />
                  </Menu.Button>
                  <Menu.Items className="dropdown-content rounded-box flex w-32 flex-col border border-medium bg-base-100 py-4 shadow-xl">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href={`/users/${review.user?.id}`}
                          className={`no-animation btn w-full justify-start rounded-none ${
                            active ? "btn-primary" : ""
                          }`}
                        >
                          Profiili
                        </Link>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
            </div>
            <div className="w-100 flex sm:items-center sm:justify-center">
              <div className="divider flex w-60 opacity-10"></div>
            </div>
          </>
        ))}
      </>
    );
  } else if (session.status === "authenticated") {
    return (
      <section className="flex flex-col gap-4">
        <span className="font-bold">Kerro muille mitä pidit kirjasta!</span>
        <form
          id="myform"
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const arvostelu = (
              document.getElementById("arvosteluTeksti") as HTMLInputElement
            ).value;
            const tahtiLista = document.getElementsByName(
              "rating-10",
            ) as NodeListOf<HTMLElement>;
            let tahtia = "10";
            tahtiLista.forEach((tahti) => {
              if ((tahti as HTMLInputElement).checked) {
                tahtia = (tahti as HTMLInputElement).value;
              }
            });
            createReview.mutate({
              bookId: props.bookId,
              score: parseInt(tahtia),
              content: arvostelu,
            });
          }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-4">
              <Avatar user={session?.data?.user} size="s" />
              <div className="rating rating-lg rating-half my-0">
                <input
                  type="radio"
                  name="rating-10"
                  className="rating-hidden"
                />
                <input
                  value="1"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-1 mask-star-2 bg-secondary"
                />
                <input
                  value="2"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-2 mask-star-2 bg-secondary"
                />
                <input
                  value="3"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-1 mask-star-2 bg-secondary"
                />
                <input
                  value="4"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-2 mask-star-2 bg-secondary"
                />
                <input
                  value="5"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-1 mask-star-2 bg-secondary"
                />
                <input
                  value="6"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-2 mask-star-2 bg-secondary"
                />
                <input
                  value="7"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-1 mask-star-2 bg-secondary"
                />
                <input
                  value="8"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-2 mask-star-2 bg-secondary"
                />
                <input
                  value="9"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-1 mask-star-2 bg-secondary"
                />
                <input
                  value="10"
                  type="radio"
                  name="rating-10"
                  className="mask mask-half-2 mask-star-2 bg-secondary"
                />
              </div>
            </div>
            <textarea
              className="text-gray-900 border-gray-300 focus:text-gray-900 focus:bg-white flex w-full rounded border border-solid bg-base-300 bg-clip-padding
            px-3 py-1.5 text-base font-normal transition placeholder:text-medium focus:outline-none"
              id="arvosteluTeksti"
              placeholder="Muistathan kohteliaisuuden!"
            ></textarea>
            <button className="btn-primary btn w-32" type="submit">
              Lisää arvostelu
            </button>
          </div>
        </form>
        <div className="divider"></div>
        <span className="font-bold">Kirjan arvostelut</span>
        {reviewData?.map((review) => (
          <>
            <div className="flex flex-col gap-4 sm:flex-row" key={review.id}>
              {" "}
              <div className="w-80 flex-1 gap-4 overflow-hidden break-words">
                {review.content}
              </div>
              <ReviewScore reviewScore={review.score} />
              <div className="keep-all flex gap-3 overflow-hidden">
                {review.user.name}
                <Menu as="div" className="dropdown-end dropdown h-12">
                  <Menu.Button>
                    <Avatar user={review.user} size="s" />
                  </Menu.Button>
                  <Menu.Items className="dropdown-content rounded-box flex w-32 flex-col border border-medium bg-base-100 py-4 shadow-xl">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href={`/users/${review.user?.id}`}
                          className={`no-animation btn w-full justify-start rounded-none ${
                            active ? "btn-primary" : ""
                          }`}
                        >
                          Profiili
                        </Link>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
            </div>
            <div className="w-100 flex sm:items-center sm:justify-center">
              <div className="divider flex w-60 opacity-10"></div>
            </div>
          </>
        ))}
      </section>
    );
  }
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
  const trpcContext = trpc.useContext();
  const { data: savedBookData } = trpc.books.getSavedBookById.useQuery(
    {
      id: props.bookId,
    },
    {
      retry: 0,
      enabled: !!session.data,
    },
  );

  const updateSavedBook = trpc.books.updateSavedBook.useMutation();

  const [shelf, setShelf] = useState(savedBookData?.shelf ?? "none");
  useEffect(
    () => setShelf(savedBookData?.shelf ?? "none"),
    [savedBookData?.shelf],
  );

  if (!session.data) {
    return <></>;
  }

  return (
    <>
      <Popover className="dropdown">
        <Popover.Button className="btn-primary btn-sm btn w-32 min-w-max gap-2 lg:w-full">
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
                      className="label cursor-pointer rounded hover:bg-base-content/10 focus:outline-none"
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
              <button
                className="btn-primary btn-sm btn mt-3"
                onClick={() => {
                  if (
                    shelf === "none" ||
                    shelf === "shelf" ||
                    shelf === "reading" ||
                    shelf === "read"
                  ) {
                    updateSavedBook.mutate(
                      {
                        bookId: props.bookId,
                        shelf: shelf,
                      },
                      {
                        onSuccess: () => {
                          // TODO: Oma reititin savedbookeille?
                          trpcContext.books.getSavedBookById.invalidate();
                          trpcContext.books.getReadingBooks.invalidate();
                        },
                      },
                    );
                    close();
                  } else {
                    console.error("Invalid shelf", shelf);
                  }
                }}
              >
                Tallenna
              </button>
            </>
          )}
        </Popover.Panel>
      </Popover>
    </>
  );
}

function BookScore({ bookId }: { bookId: string }) {
  const { data: starData } = trpc.books.getBookAverageScoreById.useQuery(
    {
      id: bookId,
    },
    {
      enabled: !!bookId,
      retry: 0,
    },
  );
  const score = starData?._avg.score ? starData._avg.score / 2 : 0;
  const starPercentages = [0, 0, 0, 0, 0];

  for (let i = 0; i < score; i++) {
    starPercentages[i] = 1;
  }

  if (score < 5) {
    // Set last star to the fraction of the score
    starPercentages[Math.floor(score)] = score % 1;
  }

  return (
    <div className="my-0 inline-flex items-center gap-2">
      <Stars score={starData?._avg.score ?? 0} large />
      <h1
        className="text-4xl font-extrabold"
        title={`${starData?._count.score ?? 0} arvostelua`}
      >
        {score.toFixed(2)}
      </h1>
    </div>
  );
}

function ReviewScore({ reviewScore }: { reviewScore: number }) {
  const score = reviewScore / 2;
  const starPercentages = [0, 0, 0, 0, 0];

  for (let i = 0; i < score; i++) {
    starPercentages[i] = 1;
  }

  if (score < 5) {
    // Set last star to the fraction of the score
    starPercentages[Math.floor(score)] = score % 1;
  }

  return (
    <div className="my-0 inline-flex gap-2">
      <div className="inline-flex gap-px">
        {starPercentages.map((perc, i) => (
          <div key={i + "star"} className="relative h-10 w-10">
            <div
              style={{ width: `${2.5 * perc}rem` }}
              className="absolute h-10 overflow-hidden"
            >
              <div className="mask mask-star-2 h-10 w-10 bg-secondary"></div>
            </div>
            <div className="mask mask-star-2 absolute h-10 w-10 bg-secondary/20"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface FormatISBNProps {
  isbn?: {
    type: string;
    identifier: string;
  }[];
}

function FormatISBN({ isbn }: FormatISBNProps) {
  if (isbn === undefined) {
    return null;
  }

  if (isbn.length === 2) {
    const isbn10 = isbn?.at(0)?.identifier;
    const isbn13 = isbn?.at(0)?.identifier;
    if (isbn10 === undefined || isbn13 === undefined) {
      return null;
    }

    return (
      <span>
        ISBN {isbn10} (ISBN13 {isbn13})
      </span>
    );
  }

  const identifier = isbn?.at(0)?.identifier;
  if (identifier === undefined) {
    return null;
  }
  return <span>ISBN {identifier}</span>;
}

const BookPage: NextPage = () => {
  const router = useRouter();
  const { bookId } = router.query;

  const [descriptionHasOverflow, setDescriptionHasOverflow] = useState(false);

  const measureDescription = useCallback(
    (description: HTMLDivElement | null) => {
      setDescriptionHasOverflow(
        !!description
          ? description?.scrollHeight > description?.clientHeight
          : false,
      );
    },
    [],
  );

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
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex flex-col gap-4">
          <BookCover book={bookData} size="l" withoutLink={true} />
          <AddToLibraryButton bookId={bookId} />
        </div>
        <div className="flex w-full grow flex-col gap-4 lg:w-5/6">
          <h1 className="text-4xl font-extrabold">{formatTitle(bookData)}</h1>
          <span>{volume.authors?.join(", ") ?? "Tuntematon kirjoittaja"}</span>

          <div className="inline-flex gap-2">
            <BookScore bookId={bookId} />
          </div>
          {volume.description && (
            <div className="flex flex-shrink flex-col">
              {descriptionHasOverflow ? (
                <input
                  type="checkbox"
                  className="peer/more link order-2 appearance-none before:content-['Lisää'] before:checked:content-['Vähemmän']"
                />
              ) : (
                <></>
              )}
              <div
                ref={measureDescription}
                className="prose order-1 overflow-y-hidden text-lg [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] peer-checked/more:block"
              >
                {parse(volume.description)}
              </div>
            </div>
          )}
          <div className="divider my-0"></div>
          <div className="flex flex-col gap-1 text-sm">
            {volume.pageCount && <span>{volume.pageCount} sivua</span>}
            {volume.publishedDate && (
              <span>Julkaistu {volume.publishedDate}</span>
            )}
            {volume.publisher && <span>Kustantaja {volume.publisher}</span>}

            <FormatISBN isbn={volume.industryIdentifiers} />
          </div>
        </div>
      </div>
      <div className="divider"></div>
      <ReviewSection bookId={bookId} />
    </>
  );
};

export default BookPage;
