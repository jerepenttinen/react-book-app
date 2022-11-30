import dayjs from "dayjs";

export function formatDate(date?: Date | null) {
  return date ? dayjs(date).format("DD.MM.YYYY") : "";
}
