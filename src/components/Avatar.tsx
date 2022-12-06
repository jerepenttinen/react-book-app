import Image from "next/image";
import Link from "next/link";
import { ConditionalWrapper } from "./BookCover";

interface AvatarProps {
  user?: {
    id?: string | null;
    image?: string | null;
    name?: string | null;
  };
  size: "s" | "m" | "l";
  noLink?: boolean;
  noTitle?: boolean;
}

interface Sizes {
  s: [number, string, string, string];
  m: [number, string, string, string];
  l: [number, string, string, string];
}

const sizes: Sizes = {
  s: [48, "w-12", "h-12", "text-lg"],
  m: [64, "w-16", "h-16", "text-2xl"],
  l: [256, "w-64", "h-64", "text-7xl"],
};

function Avatar(props: AvatarProps) {
  const [size, w, h, fontSize] = sizes[props.size];
  if (!props.user) {
    return <>Error</>;
  }

  return (
    <ConditionalWrapper
      as={(children) => (
        <Link href={`/users/${props.user?.id}`} className="w-min h-min">{children}</Link>
      )}
      condition={!!!props.noLink}
    >
      <div className={`avatar ${!props.user.image && "placeholder"}`} {...!!props.user.name && !!!props.noTitle ? {"title": props.user.name} : null}>
        <div
          className={`rounded-full ${w} ${h} ${
            !!props.user.image ? "" : "bg-accent"
          } text-accent-content ${fontSize}`}
        >
          {props.user.image
            ? (
              <Image
                src={props.user.image}
                alt="Avatar"
                width={size}
                height={size}
                className="my-0 object-contain"
                priority
              />
            )
            : (
              <span className="select-none">
                {props.user.name?.at(0)?.toUpperCase() ?? "?"}
              </span>
            )}
        </div>
      </div>
    </ConditionalWrapper>
  );
}

export default Avatar;
