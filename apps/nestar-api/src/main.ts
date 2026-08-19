import * as dns from 'dns';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';

// Ba'zi wi-fi router DNS'lari MongoDB Atlas'ning SRV so'rovini bloklaydi
// (querySrv ECONNREFUSED). Node resolverini barqaror DNS'ga qaratamiz.
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(new ValidationPipe());
	app.useGlobalInterceptors(new LoggingInterceptor());
	await app.listen(process.env.PORT_API ?? 3000);
}
bootstrap();
