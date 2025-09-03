
import React from 'react';

export interface MessageInfo {
	userName: string;
	message: string;
	time: Date;
}

interface MessageProps {
	messageInfo: MessageInfo;
}

export const Message: React.FC<MessageProps> = ({ messageInfo }) => {
	return (
		<div className="w-fit">
			<span className="text-sm text-slate-600">{messageInfo.userName} </span>
			<span>{messageInfo.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
			<div className="p-2 bg-gray-100 rounded-lg shadow-md">
				{messageInfo.message}
			</div>
		</div>
	);
};
