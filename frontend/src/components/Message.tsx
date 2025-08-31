
import React from 'react';

interface MessageInfo {
	userName: string;
	message: string;
}

interface MessageProps {
	messageInfo: MessageInfo;
}

export const Message: React.FC<MessageProps> = ({ messageInfo }) => {
	return (
		<div className="w-fit">
			<span className="text-sm text-slate-600">{messageInfo.userName}</span>
			<div className="p-2 bg-gray-100 rounded-lg shadow-md">
				{messageInfo.message}
			</div>
		</div>
	);
};
