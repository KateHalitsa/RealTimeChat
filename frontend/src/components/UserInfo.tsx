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
    name: string;
    connectionId: string;
    entranceTime: string;
    latestPingTime: string;
    exitTime: string;
}

export function getExitTimeoutMin(user: User): string
{
   var exitDate = new Date(user.exitTime);
   if(exitDate.getFullYear() < 1900){
       return ""
   }else{
       var now = new Date();
       const differenceInMilliseconds = Math.abs(now.getTime() - exitDate.getTime());
       const diffMinutes = Math.ceil(differenceInMilliseconds / (1000 * 60));
       return ` last seen ${diffMinutes} mins ago`;
   }

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
                        {user.name + getExitTimeoutMin(user)}
                        { /*
                        <br/>
                        {user.connectionId}<br/>
                        online {new Date(user.entranceTime).toLocaleTimeString()}<br/>
                        ping: {new Date(user.latestPingTime).toLocaleTimeString()}<br/>
                        exit {new Date(user.exitTime).toLocaleTimeString()}
                         */ }
                    </li>

                ))}

            </ul>
        </div>
    );
};

export default UserInfo;