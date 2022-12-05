import { type NextPage } from "next";
import { useRouter } from "next/router";
import Avatar from "~/components/Avatar";
import { type RouterTypes, trpc } from "~/utils/trpc";
import BookCover from "~/components/BookCover";
import Link from "next/link";
import { IoCalendarOutline, IoLocationOutline } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { FriendshipStatus } from "~/types/friendship-status";
import { formatDate } from "~/utils/format-date";
import { Dialog } from "@headlessui/react";
import { editProfileValidator } from "~/server/common/users-validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ErrorMessage } from "@hookform/error-message";
import { formatBookProgress } from "~/utils/format-book-progress";

function EditProfileModal(props: {
  userData: RouterTypes["users"]["getById"]["output"];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const trpcContext = trpc.useContext();
  const updateProfileMutation = trpc.users.updateMyProfile.useMutation();

  const { register, handleSubmit, formState } = useForm<
    z.infer<typeof editProfileValidator>
  >({
    defaultValues: {
      biography: props.userData.biography ?? undefined,
      location: props.userData.location ?? undefined,
    },
    resolver: zodResolver(editProfileValidator),
  });

  return (
    <Dialog
      as="div"
      className="modal modal-open"
      open={props.isOpen}
      onClose={() => props.setIsOpen(false)}
    >
      <Dialog.Panel
        as="form"
        onSubmit={handleSubmit(async (data) => {
          await updateProfileMutation.mutateAsync(data);
          trpcContext.users.getById.invalidate();
          props.setIsOpen(false);
        })}
        className="modal-box flex flex-col gap-4 border border-base-content border-opacity-20"
      >
        <div className="form-control">
          <label className="label">
            <span className="label-text">Sijainti</span>
          </label>
          <input
            type="text"
            className="input-bordered input border-medium text-lg text-base-content placeholder:text-medium"
            placeholder="Sijainti tähän"
            {...register("location")}
          />
          <ErrorMessage
            errors={formState.errors}
            name="location"
            as="p"
            className="text-error"
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Biografia</span>
          </label>
          <textarea
            className="textarea-bordered textarea border-medium text-lg text-base-content placeholder:text-medium"
            rows={4}
            placeholder="Biografia teksti tähän"
            {...register("biography")}
          >
          </textarea>
          <ErrorMessage
            errors={formState.errors}
            name="biography"
            as="p"
            className="text-error"
          />
        </div>
        <div className="flex flex-row justify-end gap-4">
          <input
            type="button"
            className="btn-ghost btn"
            value="Peruuta"
            onClick={() => props.setIsOpen(false)}
          />
          <input type="submit" className="btn-success btn" value="Päivitä" />
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

function AddFriendButton(props: {
  userData: RouterTypes["users"]["getById"]["output"];
}) {
  const session = useSession();
  const addFriendMutation = trpc.users.sendFriendRequest.useMutation();
  const trpcContext = trpc.useContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: friendStatus } = trpc.users.getFriendshipStatus.useQuery(
    {
      userId: props.userData.id,
    },
    {
      enabled: !!session.data?.user,
      retry: 0,
    },
  );

  if (!session.data?.user) {
    return null;
  }

  if (session.data?.user.id === props.userData.id) {
    return (
      <>
        <button
          className="btn-primary btn-lg btn rounded-full"
          onClick={() => setIsEditModalOpen(true)}
        >
          Muokkaa profiilia
        </button>
        <EditProfileModal
          userData={props.userData}
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
        />
      </>
    );
  }

  if (friendStatus === undefined) {
    return null;
  }

  switch (friendStatus) {
    case FriendshipStatus.NOT_FRIENDS:
    case FriendshipStatus.RECEIVED_REQUEST: {
      return (
        <button
          type="button"
          className="btn-primary btn-lg btn rounded-full"
          onClick={() => {
            addFriendMutation.mutate(
              {
                targetUserId: props.userData.id,
              },
              {
                onSuccess: () =>
                  trpcContext.users.getFriendshipStatus.invalidate(),
              },
            );
          }}
        >
          Lisää kaveriksi
        </button>
      );
    }
    case FriendshipStatus.FRIENDS: {
      return (
        <button
          type="button"
          className="btn-primary no-animation btn-lg btn rounded-full"
        >
          Kavereita
        </button>
      );
    }
    case FriendshipStatus.SENT_REQUEST: {
      return (
        <button
          type="button"
          className="btn-primary no-animation btn-lg btn rounded-full"
        >
          Kaveripyyntö lähetetty
        </button>
      );
    }
  }
  throw new Error("AddFriendButton non exhaustive");
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
      {!!favoriteData && favoriteData.length > 0
        ? (
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
        )
        : <></>}
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
            {readingBooksData.map((savedBook) => {
              const update = savedBook.updates?.at(0);
              return (
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
                    <span>
                      {formatBookProgress(update, savedBook.book.pageCount)}
                    </span>
                  </div>
                </div>
              );
            })}
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
        <AddFriendButton userData={userData} />
      </section>

      <section className="flex flex-col gap-4">
        <span className="text-4xl font-extrabold">{userData.name}</span>

        {userData.biography ? <span>{userData.biography}</span> : <></>}

        <div className="flex flex-row gap-4 text-medium">
          {userData.location
            ? (
              <div className="inline-flex gap-1">
                <IoLocationOutline size={24} />
                <span>{userData.location}</span>
              </div>
            )
            : <></>}

          {userData.createdAt
            ? (
              <div className="inline-flex gap-1">
                <IoCalendarOutline size={24} />
                <span>Liittyi {formatDate(userData.createdAt)}</span>
              </div>
            )
            : <></>}
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
