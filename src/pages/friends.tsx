import { type NextPage } from "next";
import { trpc } from "~/utils/trpc";

const FriendsPage: NextPage = () => {
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = trpc.users.getMyFriends.useQuery(undefined, {
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
      {userData.friends?.map((b) => (
        <div key={"friend" + b.id}>{b.name}</div>
      ))}
    </div>
  );
};

export default FriendsPage;
