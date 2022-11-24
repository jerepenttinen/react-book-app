import { type NextPage } from "next";
import Avatar from "~/components/Avatar";
import { type RouterTypes, trpc } from "~/utils/trpc";

function FriendRequestNotification({
  notification,
}: {
  notification: RouterTypes["users"]["getMyNotifications"]["output"][number];
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
          default: {
            return <div>Tuntematon ilmoitus tyyppi</div>;
          }
        }
      })}
    </div>
  );
};

export default NotificationsPage;
