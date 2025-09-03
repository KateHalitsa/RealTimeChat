import React, { useEffect, useState } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

const CHAT_USER_KEY = 'chatUserForMyApp';
export function getCurrentUserName(): string
{
    var name = localStorage.getItem(CHAT_USER_KEY);
    if (name){
        return name;
    }else{
        return ""
    };
}

export function setCurrentUserName(name: string)
{
    localStorage.setItem(CHAT_USER_KEY, name);
}

export function clearCurrentUserName()
{
    localStorage.removeItem(CHAT_USER_KEY);
}

export interface User {
    id: number;
    name: string;
    connectionId: string;
    entranceTime: string;
    latestPingTime: string;
    exitTime?: string | null;
}

interface UserInfoProps
{
    users: User[];
}

const UserInfo: React.FC<UserInfoProps> = ({users}) => {

    const getStatusColor = (exitTime: string | null | undefined) => {
        if (!exitTime) return 'bg-red-500';
        const lastTime=new Date(exitTime);
        if (lastTime.getFullYear() < 1900) {
            return "bg-green-500";
        }else
        {
            return "bg-red-500";
        }
    };

    return (
        <div>
            <ul >
                {users.map((user, index) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <span
                            className={`w-3 h-3 rounded-full ${getStatusColor(user.exitTime)}`}
                            title={getStatusColor(user.exitTime) === 'bg-green-500' ? 'Online' : 'Offline'}
                            style={{ marginRight: '8px', flexShrink: 0 }}
                        ></span>
                        {user.connectionId}<br/>
                        {user.name} — online с {new Date(user.entranceTime).toLocaleTimeString()}
                        {user.exitTime && `, покинул в ${new Date(user.exitTime).toLocaleTimeString()}`}

                    </li>

                ))}

            </ul>
        </div>
    );
};

export default UserInfo;