import { type NextPage } from "next";
import Avatar from "~/components/Avatar";
import { trpc } from "~/utils/trpc";

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
      {notificationData.map((b) => (
        <div key={"friend" + b.id}>
          {b.fromUser && (
            <>
              <Avatar user={b.fromUser} size="s" />
              <div>{b.fromUser.name}</div>
            </>
          )}
          {b.type}
        </div>
      ))}
    </div>
  );
};

export default NotificationsPage;
