import { type NextPage } from "next";
import { trpc } from "~/utils/trpc";
import { Menu, Tab } from "@headlessui/react";
import Avatar from "~/components/Avatar";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { Fragment, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import UserLink from "~/components/UserLink";
import Image from "next/image";
import { ImFileEmpty } from "react-icons/im";

interface UserInfoProps {
  user: {
    id: string | undefined | null;
    name: string | undefined | null;
    image: string | undefined | null;
  };
  friendId?: string | undefined;
}

function UserInfo({ user }: UserInfoProps) {
  return (
    <div className="flex items-center gap-4">
      <Avatar user={user} size="m" />
      <UserLink user={user} className="font-bold" />
    </div>
  );
}

function Library({ user, friendId }: UserInfoProps) {
  const addRecommendationMutation =
    trpc.users.sendBookRecommendation.useMutation();
  const trpcContext = trpc.useContext();
  const friend = friendId ?? "";
  const session = useSession();
  const userId = user.id;
  const [isMyLibrary, setIsMyLibrary] = useState(
    userId === session.data?.user?.id,
  );
  useEffect(() => {
    setIsMyLibrary(userId === session.data?.user?.id);
  }, [session.data?.user?.id, userId]);
  const { data } = trpc.books.getSavedBooks.useQuery(
    {
      userId: userId as string,
    },
    {
      enabled: !!userId,
    },
  );
  return (
    <>
      {isMyLibrary ? (
        <Menu as="div" className="dropdown dropdown-end h-6">
          <Menu.Button>Vinkkaa kirjaa</Menu.Button>
          <Menu.Items className="dropdown-content rounded-box flex w-32 flex-col border border-medium bg-base-100 py-4 shadow-xl">
            {data && (
              <div className="my-6 flex flex-col gap-4">
                {data.map((b) => (
                  <Menu.Item key={b.id}>
                    {({ active }) => (
                      <div
                        className={
                          active
                            ? "btn-primary no-animation btn rounded-none"
                            : "no-animation btn rounded-none"
                        }
                      >
                        <button
                          onClick={() => {
                            addRecommendationMutation.mutate({
                              bookId: b.book.id,
                              targetUserId: friend,
                            });
                          }}
                        >
                          {b.book.thumbnailUrl ? (
                            <Image
                              src={b.book.thumbnailUrl}
                              alt={`Kirjan ${b.book.name} kansikuva`}
                              width={32}
                              height={30}
                              className="my-0 h-min rounded"
                              title={b.book.name ?? ""}
                              priority
                            />
                          ) : (
                            <div
                              className={`flex ${32} ${30} items-center justify-center rounded bg-base-content text-base-300`}
                              title={b.book.name ?? ""}
                            >
                              <ImFileEmpty />
                            </div>
                          )}
                        </button>
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </div>
            )}
          </Menu.Items>
        </Menu>
      ) : (
        <div></div>
      )}
    </>
  );
}

function FriendsPanel() {
  const {
    data: userData,
    isLoading,
    isError,
    error,
  } = trpc.users.getMyFriends.useQuery(undefined, {
    retry: 0,
  });

  const deleteFriendMutation = trpc.users.deleteMyFriend.useMutation();

  const trpcContext = trpc.useContext();

  if (isLoading) {
    return <span>Ladataan...</span>;
  }

  if (isError) {
    return <span>{error.data?.code}</span>;
  }

  return (
    <div className="flex flex-col gap-8">
      {userData.friends?.map((friend) => (
        <section
          key={"friend" + friend.id}
          className="flex items-center justify-between"
        >
          <UserInfo user={friend} />
          <Menu as="div" className="dropdown dropdown-end h-6">
            <Menu.Button>
              <IoEllipsisHorizontal size={24} />
            </Menu.Button>
            <Menu.Items className="dropdown-content rounded-box flex w-32 flex-col border border-medium bg-base-100 py-4 shadow-xl">
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={
                      active
                        ? "btn-primary no-animation btn rounded-none"
                        : "no-animation btn rounded-none"
                    }
                  >
                    Tökkää
                  </div>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={
                      active
                        ? "btn-primary no-animation btn rounded-none"
                        : "no-animation btn rounded-none"
                    }
                    onClick={async () => {
                      await deleteFriendMutation.mutateAsync({
                        friendId: friend.id,
                      });
                      trpcContext.users.getMyFriends.invalidate();
                    }}
                  >
                    Poista kaveri
                  </div>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={
                      active
                        ? "btn-primary no-animation btn rounded-none"
                        : "no-animation btn rounded-none"
                    }
                  >
                    <Library user={userData} friendId={friend.id} />
                  </div>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </section>
      ))}
    </div>
  );
}

function FriendRequestsPanel() {
  const {
    data: friendRequests,
    isLoading,
    isError,
    error,
  } = trpc.users.getMySentFriendRequests.useQuery(undefined, {
    retry: 0,
  });

  if (isLoading) {
    return <span>Ladataan...</span>;
  }

  if (isError) {
    return <span>{error.data?.code}</span>;
  }
  return (
    <div className="flex flex-col gap-8">
      {friendRequests?.map((notification) => (
        <section
          key={"fr" + notification.id}
          className="flex items-center justify-between"
        >
          <UserInfo user={notification.toUser} />
          <button className="btn-error btn-sm btn">Peruuta</button>
        </section>
      ))}
    </div>
  );
}

function FriendSearchPanel() {
  return <>Haku</>;
}

const FriendsPage: NextPage = () => {
  const session = useSession();
  if (!session.data) {
    return null;
  }

  return (
    <Tab.Group>
      <Tab.List as="div" className="tabs">
        <Tab as={Fragment}>
          {({ selected }) => (
            <a
              className={
                selected ? "tab tab-bordered tab-active" : "tab tab-bordered"
              }
            >
              Kaverit
            </a>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <a
              className={
                selected ? "tab tab-bordered tab-active" : "tab tab-bordered"
              }
            >
              Kaveripyynnöt
            </a>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <a
              className={
                selected ? "tab tab-bordered tab-active" : "tab tab-bordered"
              }
            >
              Haku
            </a>
          )}
        </Tab>
      </Tab.List>
      <Tab.Panels className="mt-8">
        <Tab.Panel>
          <FriendsPanel />
        </Tab.Panel>
        <Tab.Panel>
          <FriendRequestsPanel />
        </Tab.Panel>
        <Tab.Panel>
          <FriendSearchPanel />
        </Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default FriendsPage;
