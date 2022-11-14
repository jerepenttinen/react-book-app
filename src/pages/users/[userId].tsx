import { type NextPage } from "next";
import { useRouter } from "next/router";
import Avatar from "~/components/Avatar";
import { trpc } from "~/utils/trpc";

const UserPage: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  console.log("moi");

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
      <Avatar user={userData} size="l" />
      <h1>{userData.name}</h1>
    </div>
  );
};

export default UserPage;
