import { Notification, User } from "@prisma/client";
import { type NextPage } from "next";
import Avatar from "~/components/Avatar";
import BookCover from "~/components/BookCover";
import { formatTitle } from "~/components/SearchResult";
import { type RouterOutputs, trpc } from "~/utils/trpc";
import { AddToLibraryButton, BookScore } from "./books/[bookId]";

function FriendRequestNotification({
  notification,
}: {
  notification: RouterOutputs["users"]["getMyNotifications"][number];
}) {
  const handleFriendRequest = trpc.users.handleFriendRequest.useMutation();
  const trpcContext = trpc.useContext();

  if (!notification.fromUser) {
    return <>ERROR</>;
  }

  return (
    <div>
      <Avatar user={notification.fromUser} size="s" />
      <div>{notification.fromUser.name}</div>
      {notification.type}
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
  );
}

interface RecommendedBookProps {
  notification: Notification;
  fromUser: User;
}

function RecommendedBookNotification({ notification, fromUser }: RecommendedBookProps) {
  const handleRecommendation = trpc.users.handleRecommendation.useMutation();
  const trpcContext = trpc.useContext();
  const {
    data: bookData,
  } = trpc.books.getById.useQuery(
    {
      id: notification.bookId as string,
    },
  );

  if (!bookData) {
    return <span>Ei löydy!</span>;
  }

  const volume = bookData.volumeInfo;
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex flex-col gap-4">
        <BookCover book={bookData} size="l" withoutLink={true} />
        <AddToLibraryButton bookId={bookData.id} />
      </div>
      <div className="flex w-full grow flex-col gap-4 lg:w-5/6">
        <h1 className="text-4xl font-extrabold">{formatTitle(bookData)}</h1>
        <span>{volume.authors?.join(", ") ?? "Tuntematon kirjoittaja"}</span>

        <div className="inline-flex gap-2">
          <BookScore bookId={bookData.id} />
        </div>
        <div className="inline-flex gap-2">
        <Avatar user={fromUser} size="s" />
        <div>{fromUser.name} Vinkkasi sinulle!</div>
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
      </div>
    </div>
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
            return <div key={b.bookId}><RecommendedBookNotification notification={b} fromUser={b.fromUser as User}/></div>;
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
