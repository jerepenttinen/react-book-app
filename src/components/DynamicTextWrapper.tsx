interface DynamicTextWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function DynamicTextWrapper(props: DynamicTextWrapperProps) {
  return (
    <div
      className={
        "whitespace-pre-line break-words [hyphens:auto] " + props.className ??
        ""
      }
    >
      {props.children}
    </div>
  );
}
