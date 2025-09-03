import { Button, Heading, Input, Text } from "@chakra-ui/react";
import { useState, FormEvent } from "react";

interface WaitingRoomProps {
	joinChat: (userName: string, chatRoom: string) => void;
	error?: string | null;  // добавили
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ joinChat, error }) => {
	const [userName, setUserName] = useState<string>("");
	const [chatRoom, setChatRoom] = useState<string>("");

	const onSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		joinChat(userName, chatRoom);
	};

	return (
		<form
			onSubmit={onSubmit}
			className="max-w-sm w-full bg-white p-8 rounded shadow-lg"
		>
			<Heading size="lg">Онлайн чат</Heading>
			{error &&
				<div className="mb-4 text-red-600 font-semibold">
					Ошибка: {error}
				</div>
			}
			<div className="mb-4">
				<Text fontSize={"sm"}>Имя пользователя</Text>
				<Input
					name="username"
					placeholder="Введите ваше имя"
					value={userName}
					onChange={(e) => setUserName(e.target.value)}
				/>
			</div>
			<div className="mb-6">
				<Text fontSize={"sm"}>Название чата</Text>
				<Input
					name="chatname"
					placeholder="Введите название чата"
					value={chatRoom}
					onChange={(e) => setChatRoom(e.target.value)}
				/>
			</div>
			<Button type="submit" colorScheme="blue">
				Присоединиться
			</Button>
		</form>
	);
};
