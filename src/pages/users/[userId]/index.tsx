import { type NextPage } from "next";
import { useRouter } from "next/router";
import Avatar from "~/components/Avatar";
import { trpc } from "~/utils/trpc";
import BookCover from "~/components/BookCover";
import Link from "next/link";
import { formatDate } from "./library";
import { IoCalendarOutline, IoLocationOutline } from "react-icons/io5";

function AddFriendButton(props: { userId: string }) {
  const addFriendMutation = trpc.users.sendFriendRequest.useMutation();
  return (
    <button
      type="button"
      className="btn-primary btn-lg btn rounded-full"
      onClick={() => {
        addFriendMutation.mutate({
          targetUserId: props.userId,
        });
      }}
    >
      Lisää kaveriksi
    </button>
  );
}

function LibraryPreview(props: { userId: string }) {
  const { data: previewData } = trpc.books.getLibraryPreviewBooks.useQuery(
    {
      userId: props.userId,
      bookCount: 8,
    },
    {
      enabled: !!props.userId,
      retry: 0,
    },
  );

  return (
    <section className="flex flex-col gap-4">
      <Link href={`/users/${props.userId}/library`}>
        <span className="font-bold">Kirjasto</span>
      </Link>

      <div className="flex flex-row gap-4">
        {previewData?.map((savedBook) => (
          <BookCover
            key={"preview" + savedBook.id}
            book={savedBook.book}
            size="s"
          />
        ))}
      </div>
    </section>
  );
}

function FavoriteBooks(props: { userId: string }) {
  const { data: favoriteData } = trpc.books.getFavoriteBooks.useQuery(
    {
      userId: props.userId,
      bookCount: 8,
    },
    {
      enabled: !!props.userId,
      retry: 0,
    },
  );

  return (
    <>
      {!!favoriteData ? (
        <section className="flex flex-col gap-4">
          <span className="text-lg font-bold">Lempi kirjat</span>
          <div className="flex flex-row gap-4">
            {favoriteData?.map((review) => (
              <BookCover
                key={"favorite" + review.id}
                book={review.book}
                size="s"
              />
            ))}
          </div>
        </section>
      ) : (
        <></>
      )}
    </>
  );
}

function ReadingBooks({ userId }: { userId: string }) {
  const { data: readingBooksData } = trpc.books.getReadingBooks.useQuery(
    {
      userId: userId as string,
    },
    {
      retry: 0,
      enabled: !!userId,
    },
  );

  return (
    <>
      {readingBooksData && readingBooksData.length > 0 && (
        <section className="flex flex-col gap-4">
          <span className="font-bold">Parhaillaan lukemassa</span>
          <div className="flex flex-col gap-8">
            {readingBooksData.map((savedBook) => (
              <div key={savedBook.id} className="flex h-min flex-row gap-4">
                <BookCover
                  book={savedBook.book}
                  size="s"
                  key={savedBook.id + "sidecover"}
                />
                <div className="flex w-3/5 flex-col gap-1 p-0">
                  <Link
                    href={`/books/${savedBook.bookId}`}
                    className="font-bold"
                  >
                    {savedBook.book.name}
                  </Link>
                  <span>
                    {savedBook.book.authors ?? "Tuntematon kirjoittaja"}
                  </span>
                  <span>Sivulla X/Y (Z%)</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

const UserPage: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = trpc.users.getById.useQuery(
    {
      id: userId as string,
    },
    {
      enabled: !!userId,
      retry: 0,
    },
  );

  if (
    typeof userId !== "string" ||
    userId === undefined ||
    userId.length === 0
  ) {
    return <></>;
  }

  if (isError) {
    return <>{error.message}</>;
  }

  if (isLoading) {
    return <>Ladataan...</>;
  }

  if (!userData) {
    return <>Ei löydy!</>;
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-row items-end justify-between">
        <Avatar user={userData} size="l" />
        <AddFriendButton userId={userData.id} />
      </section>

      <section className="flex flex-col gap-4">
        <span className="text-4xl font-extrabold">{userData.name}</span>

        {userData.biography ? <span>{userData.biography}</span> : <></>}

        <div className="flex flex-row gap-4 text-medium">
          {userData.location ? (
            <div className="inline-flex gap-1">
              <IoLocationOutline size={24} />
              <span>{userData.location}</span>
            </div>
          ) : (
            <></>
          )}

          {userData.createdAt ? (
            <div className="inline-flex gap-1">
              <IoCalendarOutline size={24} />
              <span>Liittyi {formatDate(userData.createdAt)}</span>
            </div>
          ) : (
            <></>
          )}
        </div>
      </section>

      <FavoriteBooks userId={userId} />

      <LibraryPreview userId={userId} />

      <ReadingBooks userId={userId} />

      {/* <h3>Päivitykset</h3> */}
    </div>
  );
};

export default UserPage;
