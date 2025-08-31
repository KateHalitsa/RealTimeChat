import { useState } from "react";
import { WaitingRoom } from "./components/WaitingRoom";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { Chat } from "./components/Chat";

interface MessageInfo {
	userName: string;
	message: string;
}

const App: React.FC = () => {
	const [connection, setConnection] = useState<HubConnection | null>(null);
	const [messages, setMessages] = useState<MessageInfo[]>([]);
	const [chatRoom, setChatRoom] = useState<string>("");

	const joinChat = async (userName: string, chatRoom: string) => {
		const connection = new HubConnectionBuilder()
			.withUrl("http://localhost:5022/chat")
			.withAutomaticReconnect()
			.build();

		connection.on("ReceiveMessage", (userName: string, message: string) => {
			setMessages((messages) => [...messages, { userName, message }]);
		});

		try {
			await connection.start();
			await connection.invoke("JoinChat", { userName, chatRoom });

			setConnection(connection);
			setChatRoom(chatRoom);
		} catch (error) {
			console.error(error);
		}
	};

	const sendMessage = async (message: string) => {
		if (connection) {
			await connection.invoke("SendMessage", message);
		}
	};

	const closeChat = async () => {
		if (connection) {
			await connection.stop();
			setConnection(null);
			setMessages([]);
			setChatRoom("");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			{connection ? (
				<Chat
					messages={messages}
					sendMessage={sendMessage}
					closeChat={closeChat}
					chatRoom={chatRoom}
				/>
			) : (
				<WaitingRoom joinChat={joinChat} />
			)}
		</div>
	);
};

export default App;
