import { type Notification, type User } from "@prisma/client";
import { type NextPage } from "next";
import Link from "next/link";
import Avatar from "~/components/Avatar";
import BookCover from "~/components/BookCover";
import { formatTitle } from "~/components/SearchResult";
import UserLink from "~/components/UserLink";
import { type RouterOutputs, trpc } from "~/utils/trpc";
import { AddToLibraryButton, BookScore } from "./books/[bookId]";

interface NotificationProps {
  notification: RouterOutputs["users"]["getMyNotifications"][number];
}

function FriendRequestNotification({ notification }: NotificationProps) {
  const handleFriendRequest = trpc.users.handleFriendRequest.useMutation();
  const trpcContext = trpc.useContext();

  if (!notification.fromUser) {
    return <>ERROR</>;
  }

  return (
    <section className="flex flex-col gap-2">
      <legend className="text-sm">Kaveripyyntö</legend>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-4">
          <Avatar user={notification.fromUser} size="s" />
          <UserLink user={notification.fromUser} />
        </div>
        <div className="flex flex-row gap-2">
          <button
            type="button"
            className="btn-error btn"
            onClick={() =>
              handleFriendRequest.mutate(
                {
                  notificationId: notification.id,
                  accept: false,
                },
                {
                  onSuccess: () => {
                    trpcContext.users.getMyNotifications.invalidate();
                    trpcContext.users.getMyNotificationsCount.invalidate();
                  },
                },
              )
            }
          >
            Hylkää
          </button>
          <button
            type="button"
            className="btn-success btn"
            onClick={() =>
              handleFriendRequest.mutate(
                {
                  notificationId: notification.id,
                  accept: true,
                },
                {
                  onSuccess: () => {
                    trpcContext.users.getMyNotifications.invalidate();
                    trpcContext.users.getMyNotificationsCount.invalidate();
                  },
                },
              )
            }
          >
            Hyväksy
          </button>
        </div>
      </div>
    </section>
  );
}

function RecommendedBookNotification({ notification }: NotificationProps) {
  const handleRecommendation = trpc.users.handleRecommendation.useMutation();
  const trpcContext = trpc.useContext();
  const { data: bookData } = trpc.books.getById.useQuery({
    id: notification.bookId as string,
  });

  if (!bookData) {
    return <span>Ei löydy!</span>;
  }

  if (!notification.fromUser) {
    return null;
  }

  const volume = bookData.volumeInfo;
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-4">
          <Avatar user={notification.fromUser} size="s" />
          <p>
            <UserLink user={notification.fromUser} /> Vinkkasi sinulle!
          </p>
        </div>
        <button
          type="button"
          className="btn-error btn"
          onClick={() =>
            handleRecommendation.mutate(
              {
                notificationId: notification.id,
                accept: false,
              },
              {
                onSuccess: () => {
                  trpcContext.users.getMyNotifications.invalidate();
                  trpcContext.users.getMyNotificationsCount.invalidate();
                },
              },
            )
          }
        >
          Hylkää
        </button>
      </div>
      <div className="ml-16 flex flex-row justify-between">
        <div className="flex flex-row gap-4">
          <BookCover book={bookData} size="s" />
          <div className="flex w-full grow flex-col">
            <Link href={`/books/${bookData.id}`} className="text-lg font-bold">
              {formatTitle(bookData)}
            </Link>
            <span className="text-sm">
              {volume.authors?.join(", ") ?? "Tuntematon kirjoittaja"}
            </span>

            <div className="inline-flex gap-2">
              <BookScore bookId={bookData.id} medium={true} />
            </div>
          </div>
        </div>
        <AddToLibraryButton bookId={bookData.id} />
      </div>
    </section>
  );
}

const NotificationsPage: NextPage = () => {
  const {
    data: notificationData,
    isLoading,
    isError,
    error,
  } = trpc.users.getMyNotifications.useQuery(undefined, {
    retry: 0,
  });

  if (isLoading) {
    return <h1>Ladataan...</h1>;
  }

  if (isError) {
    return <h1>{error.data?.code}</h1>;
  }

  return (
    <div className="flex flex-col gap-8">
      {notificationData.map((b) => {
        switch (b.type) {
          case "friend": {
            return <FriendRequestNotification notification={b} />;
          }
          case "recommendation": {
            return (
              <div key={b.bookId}>
                <RecommendedBookNotification notification={b} />
              </div>
            );
          }
          default: {
            return <div>Tuntematon ilmoitus tyyppi</div>;
          }
        }
      })}
    </div>
  );
};

export default NotificationsPage;
