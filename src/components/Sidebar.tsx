import { Dialog } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
	IoHome,
	IoHomeOutline,
	IoLibrary,
	IoLibraryOutline,
	IoNotifications,
	IoNotificationsOutline,
	IoPeople,
	IoPeopleOutline,
} from "react-icons/io5";
import { type z } from "zod";
import { useDialog } from "~/pages/users/[userId]/library";
import { createProgressUpdateValidator } from "~/server/common/books-validators";
import { formatBookProgress } from "~/utils/format-book-progress";
import { type RouterTypes, trpc } from "~/utils/trpc";
import BookCover from "./BookCover";
import { Divider } from "./Divider";
import { Searchbar } from "./Topbar";

interface IconLinkProps {
	href: string;
	icon: JSX.Element;
	hoverIcon: JSX.Element;
	text: string;
}
function IconLink(props: IconLinkProps) {
	const [isHovering, setIsHovering] = useState(false);
	return (
		<Link
			className="inline-flex items-baseline justify-start gap-2 py-4 text-lg font-bold"
			href={props.href}
			onMouseOver={() => setIsHovering(true)}
			onMouseOut={() => setIsHovering(false)}
		>
			{isHovering ? props.hoverIcon : props.icon}
			{props.text}
		</Link>
	);
}

function NotificationsLink() {
	const session = useSession();
	const { data: notificationCountData } = trpc.users.getMyNotificationsCount
		.useQuery(undefined, {
			retry: 0,
			enabled: !!session.data,
		});
	const [isHovering, setIsHovering] = useState(false);

	return (
		<Link
			className="inline-flex items-baseline justify-start gap-2 py-4 text-lg font-bold"
			href="/notifications"
			onMouseOver={() => setIsHovering(true)}
			onMouseOut={() => setIsHovering(false)}
		>
			<div className="indicator">
				<span
					className={`badge-error badge badge-xs indicator-item ${notificationCountData ? "" : "hidden"
						}`}
				>
					{notificationCountData}
				</span>
				{isHovering ? <IoNotifications /> : <IoNotificationsOutline />}
			</div>
			Ilmoitukset
		</Link>
	);
}

function Sidebar() {
	const session = useSession();
	const { data: readingBooksData } = trpc.updates.getReadingBooks.useQuery(
		undefined,
		{
			retry: 0,
			enabled: !!session.data,
		},
	);

	const [book, setBook, modalIsOpen, closeModal] = useDialog<
		RouterTypes["updates"]["getReadingBooks"]["output"][number]
	>();

	return (
		<>
			<div className="drawer-side text-lg">
				<label htmlFor="my-drawer" className="drawer-overlay"></label>
				<ul className="menu w-72 bg-base-300">
					<li>
						<IconLink
							href="/"
							icon={<IoHomeOutline />}
							hoverIcon={<IoHome />}
							text="Koti"
						/>
					</li>
					{!!session.data?.user
						? (
							<>
								<li>
									<IconLink
										href={`/users/${session.data?.user?.id}/library`}
										icon={<IoLibraryOutline />}
										hoverIcon={<IoLibrary />}
										text="Kirjasto"
									/>
								</li>
								<li>
									<IconLink
										href="/friends"
										icon={<IoPeopleOutline />}
										hoverIcon={<IoPeople />}
										text="Kaverit"
									/>
								</li>
								<li>
									<NotificationsLink />
								</li>
							</>
						)
						: <></>}
					<div className="visible mx-4 mt-4 mb-2 lg:hidden">
						<Searchbar />
					</div>
					{readingBooksData && readingBooksData.length > 0 && (
						<>
							<section className="mb-8 mt-6 flex flex-col gap-8 px-4">
								<Divider />
								<span className="text-lg font-bold">Parhaillaan lukemassa</span>
								{readingBooksData.map((savedBook) => {
									const update = savedBook.updates?.at(0);
									return (
										<div
											key={savedBook.id}
											className="flex h-min flex-row gap-4"
										>
											<BookCover
												book={savedBook.book}
												size="s"
												key={savedBook.id + "sidecover"}
											/>
											<div className="flex w-3/4 flex-col gap-1 p-0">
												<Link
													href={`/books/${savedBook.bookId}`}
													className="font-bold"
												>
													{savedBook.book.name}
												</Link>
												<span className="text-sm">
													{savedBook.book.authors ?? "Tuntematon kirjoittaja"}
												</span>
												{!!update
													? (
														<span className="text-sm">
															{formatBookProgress(update, savedBook.book.pageCount)}
														</span>
													)
													: null}
												<button
													type="button"
													className="btn-xs btn btn-ghost w-min border-medium px-8 hover:border-medium/50 focus:outline-medium bg-base-100"
													onClick={() => setBook(savedBook)}
												>
													Päivitä
												</button>
											</div>
										</div>
									);
								})}
							</section>
						</>
					)}
				</ul>
			</div>
			{!!book
				? (
					<UpdateProgressModal
						book={book}
						open={modalIsOpen}
						close={closeModal}
					/>
				)
				: null}
		</>
	);
}

function UpdateProgressModal({
	book,
	open,
	close,
}: {
	book: RouterTypes["updates"]["getReadingBooks"]["output"][number];
	open: boolean;
	close: () => void;
}) {
	const trpcContext = trpc.useContext();
	const { data: lastUpdateData, isLoading: updateIsLoading } = trpc.updates
		.getMyLastProgressUpdateForBook.useQuery(
			{
				savedBookId: book.id,
			},
			{
				refetchOnWindowFocus: false,
			},
		);

	// Lisää olen valmis mutaatio
	const createProgressUpdateMutation = trpc.updates.createProgressUpdate
		.useMutation();

	const { register, handleSubmit, setFocus, setValue } = useForm<
		z.infer<typeof createProgressUpdateValidator>
	>({
		resolver: zodResolver(createProgressUpdateValidator),
	});

	useEffect(() => {
		if (lastUpdateData?.progress !== undefined) {
			setValue("progress", lastUpdateData.progress);
			setFocus("progress", { shouldSelect: true });
		}
	}, [lastUpdateData, setValue, setFocus]);

	if (updateIsLoading) {
		return null;
	}

	return (
		<Dialog as="div" className="modal modal-open" open={open} onClose={close}>
			<Dialog.Panel
				as="form"
				onSubmit={handleSubmit(async (data) => {
					await createProgressUpdateMutation.mutateAsync(data);
					trpcContext.updates.invalidate();
					close();
				})}
				className="modal-box flex flex-col gap-4 border border-base-content border-opacity-20"
			>
				<input type="hidden" value={book.id} {...register("savedBookId")} />
				<div className="flex flex-row justify-between">
					<div className="flex flex-row items-center gap-2">
						<span>Sivu</span>
						<input
							size={3}
							className="input text-right"
							type="number"
							min={0}
							{...register("progress")}
						/>
						{!!book.book.pageCount
							? (
								<>
									<span>/</span>
									<span>{book.book.pageCount}</span>
								</>
							)
							: null}
					</div>
					<input type="button" className="btn-ghost btn focus:outline-medium" value="Olen valmis" onClick={() => alert("todo...")} />
				</div>
				<textarea
					className="textarea-bordered textarea border-medium text-lg text-base-content placeholder:text-medium"
					rows={4}
					placeholder="Päivitys teksti tähän"
					{...register("content")}
				>
				</textarea>
				<div className="flex flex-row justify-end gap-4">
					<input
						type="button"
						className="btn-ghost btn focus:outline-medium"
						value="Peruuta"
						onClick={close}
					/>
					<input
						type="submit"
						className="btn btn-ghost border w-min border-medium px-8 hover:border-medium/50 focus:outline-medium"
						value="Päivitä"
					/>
				</div>
			</Dialog.Panel>
		</Dialog>
	);
}

export default Sidebar;
