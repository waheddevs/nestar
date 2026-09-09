import * as dns from 'dns';
import { NestFactory } from '@nestjs/core';
import { NestarBatchModule } from './batch.module';

dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
	const app = await NestFactory.create(NestarBatchModule);
	await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();
