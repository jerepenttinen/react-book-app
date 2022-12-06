import { type NextPage } from "next";
import { trpc } from "~/utils/trpc";
import Link from "next/link";

import { Menu, Tab } from "@headlessui/react";
import Avatar from "~/components/Avatar";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { Fragment } from "react";
import { useSession } from "next-auth/react";
import UserLink from "~/components/UserLink";

interface UserInfoProps {
	user: {
		id: string | undefined | null;
		name: string | undefined | null;
		image: string | undefined | null;
	}
}

function UserInfo({user}: UserInfoProps) {
  return (
    <div className="flex items-center gap-4">
      <Link href={`/users/${user.id}`} className="h-16 w-16">
        <Avatar user={user} size="m" />
      </Link>
      <UserLink user={user} className="font-bold" />
    </div>
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
                    className={active
                      ? "btn-primary no-animation btn rounded-none"
                      : "no-animation btn rounded-none"}
                  >
                    Tökkää
                  </div>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={active
                      ? "btn-primary no-animation btn rounded-none"
                      : "no-animation btn rounded-none"}
                  >
                    Poista kaveri
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
              className={selected
                ? "tab tab-bordered tab-active"
                : "tab tab-bordered"}
            >
              Kaverit
            </a>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <a
              className={selected
                ? "tab tab-bordered tab-active"
                : "tab tab-bordered"}
            >
              Kaveripyynnöt
            </a>
          )}
        </Tab>
        <Tab as={Fragment}>
          {({ selected }) => (
            <a
              className={selected
                ? "tab tab-bordered tab-active"
                : "tab tab-bordered"}
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
