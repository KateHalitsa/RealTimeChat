import React, { useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

interface User {
    id: number;
    name: string;
}

const UserInfo: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [hubConnection, setHubConnection] = useState<any>(null);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl('http://localhost:5022/chat') // Укажите ваш URL
            .withAutomaticReconnect()
            .build();

        connection.on('ReceiveUsers', (users: User[]) => {
            setUsers(users); // Обновляем состояние пользователей
        });

        connection
            .start()
            .then(() => {
                console.log('Connected to SignalR hub');
                setHubConnection(connection);

                // Запрашиваем список пользователей
                connection.invoke('SendUserList').catch(err => console.error('Error invoking SendUserList:', err));
            })
            .catch(err => console.error('Error connecting to SignalR hub:', err));

        return () => {
            connection.stop();
        };
    }, []);

    return (
        <div>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        {user.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserInfo;