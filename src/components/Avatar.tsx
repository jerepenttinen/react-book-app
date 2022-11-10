import Image from "next/image";

interface AvatarProps {
  src: string;
  alt: string;
  size: "s" | "m" | "l";
}

const sizes = {
  s: 40,
  m: 64,
  l: 256,
};

function Avatar(props: AvatarProps) {
  const size = sizes[props.size];

  return (
    <div className="avatar">
      <div className={`rounded-full w-[${size}px] h-[${size}px]`}>
        <Image
          src={props.src}
          alt={props.alt}
          width={size}
          height={size}
          className="object-contain"
        />
      </div>
    </div>
  );
}

export default Avatar;
