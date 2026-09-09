import { Injectable } from '@nestjs/common';
import { Member } from '../../nestar-api/src/libs/dto/member/member';
import { Property } from '../../nestar-api/src/libs/dto/property/property';
import { MemberStatus, MemberType } from '../../nestar-api/src/libs/enums/member.enum';
import { PropertyStatus } from '../../nestar-api/src/libs/enums/property.enum';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}

	public async batchRollback(): Promise<void> {
		console.log('Batch Rollback executed');
		await this.propertyModel
			.updateMany(
				{
					propertyStatus: PropertyStatus.ACTIVE,
				},
				{
					propertyRank: 0,
				},
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: PropertyStatus.ACTIVE,
					memberType: MemberType.AGENT,
				},
				{
					memberRank: 0,
				},
			)
			.exec();
	}

	public async batchProperties(): Promise<void> {
		console.log('Batch Top Properties executed');
		const properties: Property[] = await this.propertyModel
			.find({
				propertyStatus: PropertyStatus.ACTIVE,
				propertyRank: 0,
			})
			.exec();

		const promisedList = properties.map(async (ele: Property) => {
			const { _id, propertyLikes, propertyViews } = ele;
			const rank = propertyLikes * 2 + propertyViews + 1;
			return await this.propertyModel.findOneAndUpdate(_id, { propertyRank: rank });
		});

		await Promise.all(promisedList);
	}

	public async batchAgents(): Promise<void> {
		console.log('Batch Top Agents executed');
		const agents: Member[] = await this.memberModel
			.find({
				memberStatus: MemberStatus.ACTIVE,
				memberType: MemberType.AGENT,
				memberRank: 0,
			})
			.exec();

		const promisedList = agents.map(async (ele: Member) => {
			const { _id, memberProperties, memberArticle, memberLikes, memberViews } = ele;
			const rank = memberProperties * 5 + memberArticle * 3 + memberLikes * 2 + memberViews * 1;
			return await this.memberModel.findOneAndUpdate(_id, { memberRank: rank });
		}); 

		await Promise.all(promisedList);
	}

	getHello(): string {
		return 'Welcome to Nestar Batch Server!';
	}
}
