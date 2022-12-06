import Link from "next/link";

interface UserLinkProps {
  user: {
    id: string | undefined | null;
    name: string | undefined | null;
  };
  className?: string;
}

function UserLink({ user, className }: UserLinkProps) {
  return (
    <Link href={`/users/${user.id}`} className={className} title={user.name}>
      {user.name}
    </Link>
  );
}

export default UserLink;
