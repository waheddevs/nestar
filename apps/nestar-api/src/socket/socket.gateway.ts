import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { type Server } from 'ws';
import * as WebSocket from 'ws';
import { AuthModule } from '../components/auth/auth.module';
import { Member } from '../libs/dto/member/member';
import * as url from 'url';
import { AuthService } from '../components/auth/auth.service';

interface MessagePayload {
	event: string;
	text: string;
	memberData: Member | null;
}

interface InfoPayload {
	event: string;
	totalClients: number;
	memberData: Member | null;
	action: string;
}

@WebSocketGateway({ transport: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryClient: number = 0;
	private clientAuthMap: Map<WebSocket, Member | null> = new Map();
	private messageList: MessagePayload[] = [];

	constructor(private authService: AuthService) {}

	@WebSocketServer()
	server: Server;

	public afterInit(server: Server) {
		this.logger.verbose(`WebSocket server initialized & total [${this.summaryClient}]`);
	}

	private async retrieveAuth(req: any): Promise<Member | null> {
		try {
			const parseUrl = url.parse(req.url, true);
			const { token } = parseUrl.query;
			console.log('Token:', token);
			return await this.authService.verifyToken(token as string);
		} catch (err) {
			return null;
		}
	}

	public async handleConnection(client: WebSocket, req: any) {
		const authMember = await this.retrieveAuth(req);
		this.summaryClient++;
		this.clientAuthMap.set(client, authMember);

		const clientNickL: string = authMember?.memberNick ?? 'GUEST';
		this.logger.verbose(`Connection [${clientNickL}] & total [${this.summaryClient}]`);

		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'connected',
		};

		this.emitMessage(infoMsg);
		// CLIENT MESSAGES
		client.send(JSON.stringify({ event: 'getMessages', list: this.messageList }));
	}

	public handleDisconnect(client: WebSocket) {
		const authMember = this.clientAuthMap.get(client) ?? null;
		this.clientAuthMap.delete(client);

		this.summaryClient--;
		this.logger.verbose(`Disconnected total [${this.summaryClient}]`);

		const clientNickL: string = authMember?.memberNick ?? 'GUEST';
		this.logger.verbose(`Disconnected [${clientNickL}] & total [${this.summaryClient}]`);
		const infoMsg: InfoPayload = {
			event: 'info',
			totalClients: this.summaryClient,
			memberData: authMember,
			action: 'disconnected',
		};

		this.broadcastMessage(client, infoMsg);
	}

	@SubscribeMessage('message')
	public async handleMessage(client: WebSocket, payload: string): Promise<void> {
		const authMember = this.clientAuthMap.get(client) ?? null;
		const newMessage: MessagePayload = { event: 'message', text: payload, memberData: authMember };

		const clientNickL: string = authMember?.memberNick ?? 'GUEST';
		this.logger.verbose(`NEW MESSAGE [${clientNickL}]: ${payload}`);

		this.messageList.push(newMessage);
		if (this.messageList.length > 5) this.messageList.splice(0, this.messageList.length - 5); // Keep only the last 5 messages

		this.emitMessage(newMessage);
	}

	private broadcastMessage(sender: WebSocket, message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client !== sender && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}

	private emitMessage(message: InfoPayload | MessagePayload) {
		this.server.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		});
	}
}

/* 
	MESSAGE TARGET:
	1. Client(only client)
	2. Broadcast(all clients except sender)
	3. Emit(all clients)
*/
