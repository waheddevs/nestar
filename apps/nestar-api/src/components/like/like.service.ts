import { BadRequestException, Injectable } from '@nestjs/common';
import { Model, ObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { Properties } from '../../libs/dto/property/property';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavorite } from '../../libs/config';

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

	public async getFavoritProperties(memberId: ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		const { page, limit } = input;
		const match: T = { likeGroup: LikeGroup.PROPERTY, memberId: memberId };

		const data: T = await this.likeModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'properties',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'favoriteProperty',
					},
				},
				{ $unwind: '$favoriteProperty' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favoriteProperty.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Properties = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteProperty);
		
		return result;
	}
}
