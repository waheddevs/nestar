import { Module } from '@nestjs/common';
import { LikeResolver } from './like.resolver';
import { LikeService } from './like.service';
import { MongooseModule } from 'node_modules/@nestjs/mongoose/dist/mongoose.module';
import LikeSchema from '../../schemas/Like.model';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Like', schema: LikeSchema }])],
	providers: [LikeResolver, LikeService],
})
export class LikeModule {}
