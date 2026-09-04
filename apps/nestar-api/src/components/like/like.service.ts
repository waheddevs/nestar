import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class LikeService {
	constructor(@InjectModel('Like') private readonly likeModel: Model<Like>) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId, likeGroup: input.likeGroup },
			exist = await this.likeModel.findOne(search).exec();

		if (exist) {
			await this.likeModel.deleteOne(search).exec();
		} else {
			try {
				await this.likeModel.create(input);
			} catch (err) {
				console.log('Error, likeModel', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}

		return await this.likeModel.countDocuments({ likeRefId: input.likeRefId, likeGroup: input.likeGroup }).exec();
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId, likeGroup } = input;
		const result = await this.likeModel.findOne({ memberId, likeRefId, likeGroup }).exec();
	
		return result ? [{ memberId, likeRefId, myFavorite: true }] : [];
	}
}
