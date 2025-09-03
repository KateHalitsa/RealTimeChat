import {useEffect, useState} from "react";
import { WaitingRoom } from "./components/WaitingRoom";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { Chat } from "./components/Chat";
import { MessageInfo } from "./components/Message";
import {clearCurrentUserName, getCurrentUserName, setCurrentUserName, User} from "./components/UserInfo";

const App: React.FC = () => {
	const [connection, setConnection] = useState<HubConnection | null>(null);
	const [messages, setMessages] = useState<MessageInfo[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [chatRoom, setChatRoom] = useState<string>("");

	const joinChat = async (userName: string, chatRoom: string) => {

		var newConnection: HubConnection | null = new HubConnectionBuilder()
			.withUrl("http://localhost:5022/chat")
			.withAutomaticReconnect()
			.build();

		newConnection.on("ReceiveMessage", (userName: string, message: string) => {
			setMessages((messages) => [...messages, { userName, message }]);
		});

		newConnection.on('ReceiveUsers', (users: User[]) => {
			setUsers(users); // Обновляем состояние пользователей
		});

		try {
			await newConnection.start();
			await newConnection.invoke("JoinChat", { userName, chatRoom });
			console.log(`JoinChat ${userName}`)

			setConnection(newConnection);
			setChatRoom(chatRoom);
			setCurrentUserName(userName);
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
			clearCurrentUserName();
			await connection.stop();
			setConnection( null);
			setMessages([]);
			setUsers([]);
			setChatRoom("");
		}
	};

	useEffect(() => {
		console.log("Компонент смонтирован");

		var curUserName = getCurrentUserName();
		if ((!connection) && (curUserName != "")){
			joinChat(curUserName, "mi");
		}

		if (connection){
			console.log(`Connected ${curUserName}`);
		}else {
			console.log(`NOT connected ${curUserName}`);
		}

		// Если нужен cleanup
		return () => {
			if (connection) {
				connection.stop();
				setConnection(null);
			}
			console.log("Компонент размонтирован");
		};
	}, []); // пустой массив зависимостей → вызов один раз


	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-100">
			{connection ? (
					<Chat
						messages={messages}
						users={users}
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
