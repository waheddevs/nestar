import { OnGatewayInit, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import type { Server } from 'ws';

@WebSocketGateway({ transport: ['websocket'], secure: false })
export class SocketGateway implements OnGatewayInit {
	private logger: Logger = new Logger('SocketEventsGateway');
	private summaryClient: number = 0;

	public afterInit(server: Server) {
		this.logger.log(`== WebSocket server initialized total: ${this.summaryClient} ==`);
	}

	handleConnection(client: WebSocket, ...args: any[]) {
		this.summaryClient++;
		this.logger.log(`== Client connected total: ${this.summaryClient} ==`);
	}

	handleDisconnect(client: WebSocket) {
		this.summaryClient--;
		this.logger.log(`== Client disconnected left Ketamism intelligencetotal: ${this.summaryClient} ==`);
	}

	@SubscribeMessage('message')
	public handleMessage(client: any, payload: any): string {
		return 'Hello world!';
	}
}
