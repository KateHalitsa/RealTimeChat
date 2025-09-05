import {useEffect, useRef, useState} from "react";
import { WaitingRoom } from "./components/WaitingRoom";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { Chat } from "./components/Chat";
import { MessageInfo } from "./components/Message";
import {clearCurrentUserName, getCurrentUserName, setCurrentUserName, User} from "./components/UserInfo";

const App: React.FC = () => {
	const [connection, setConnection] = useState<HubConnection | null>(null);
	const [messages, setMessages] = useState<MessageInfo[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [error, setError] = useState<string | null>(null);
	const loginStartedRef = useRef(false); // флаг для предотвращения повторного запуска

	const joinChat = async (userName: string) => {

		var newConnection: HubConnection | null = new HubConnectionBuilder()
			.withUrl("http://localhost:5022/chat")
			.withAutomaticReconnect()
			.build();

		newConnection.on("ReceiveMessage", (userName: string, message: string) => {
			const time = new Date();
			setMessages((messages) => {
				return [...messages, {userName, message, time}];
			});
		});

		newConnection.on('ReceiveUsers', (users: User[]) => {
			setUsers(users); // Обновляем состояние пользователей
		});

		newConnection.onclose(error => {
			if (error) {
				console.error('Connection closed with error:', error);
				setError(error.message);
			} else {
				console.log('Connection closed');
			}
		});
		try {

			await newConnection.start();
			await newConnection.invoke("JoinChat", { userName });
			console.log(`JoinChat ${userName}`)

			setConnection(newConnection);
			setCurrentUserName(userName);
			setError(null);  // Очистить ошибку, если соединение успешно
		} catch (error: any) {
			console.error("Error while connecting:", error);
			// error.message содержит текст HubException
			setError(error.message || String(error));
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
		}
	};

	useEffect(() => {
		if (!connection) return;

		connection.on("ConnectionTimeout", (message: string) => {
			alert(message);
			closeChat();
		});

		return () => {
			connection.off("ConnectionTimeout");
		};
	}, [connection]);

	useEffect(() => {

		if (loginStartedRef.current) return; // если уже стартовали — не запускаем снова
		loginStartedRef.current = true;
		
		console.log("The component is mounted");

		var curUserName = getCurrentUserName();
		if ((!connection) && (curUserName != "")){
			joinChat(curUserName);
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
			console.log("The component is unmounted.");
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

					/>
				) : (
					<WaitingRoom joinChat={joinChat} error={error}/>
			)}
		</div>
	);

};

export default App;
