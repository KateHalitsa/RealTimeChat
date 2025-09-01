import { Button, CloseButton, Heading, Input } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Message } from "./Message";
import UserInfo from "./UserInfo";


interface MessageInfo {
	userName: string;
	message: string;
	// добавьте другие поля, если есть
}

interface ChatProps {
	messages: MessageInfo[];
	chatRoom: string;
	sendMessage: (message: string) => void;
	closeChat: () => void;
}

export const Chat: React.FC<ChatProps> = ({
											  messages,
											  chatRoom,
											  sendMessage,
											  closeChat,
										  }) => {
	const [message, setMessage] = useState<string>("");
	const messagesEndRef = useRef<HTMLSpanElement | null>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const onSendMessage = () => {
		sendMessage(message);
		setMessage("");
	};

	return (
		<div className=" flex gap-4 p-2 bg-gray-100 rounded shadow-lg max-w-1xl mx-auto">
			{/* Боковая панель Пользователи слева */}
			<div className="w-1/4 bg-white p-4 rounded shadow-md">
				<Heading size="sm">Users</Heading>
				<UserInfo/>
			</div>

			{/* Основной чат справа */}
			<div className="w-3/4 bg-white p-8 rounded shadow-lg flex flex-col">
				<div className="flex flex-row justify-between mb-5">
					<Heading size="lg">{chatRoom}</Heading>
					<CloseButton onClick={closeChat} />
				</div>

				<div className="flex flex-col overflow-auto scroll-smooth h-96 gap-3 pb-3">
					{messages.map((messageInfo, index) => (
						<Message messageInfo={messageInfo} key={index} />
					))}
					<span ref={messagesEndRef} />
				</div>

				<div className="flex gap-3 mt-auto">
					<Input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Введите сообщение"
					/>
					<Button colorScheme="blue" onClick={onSendMessage}>
						Отправить
					</Button>
				</div>
			</div>
		</div>
	);

};
