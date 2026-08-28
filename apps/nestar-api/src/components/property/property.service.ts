import { BadRequestException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Mutation } from 'node_modules/@nestjs/graphql/dist';
import { Property } from '../../libs/dto/property/property';
import { Message } from '../../libs/enums/common.enum';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { MemberService } from '../member/member.service';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property>,
		private memberServive: MemberService,
	) {}

	public async createProperty(input: PropertyInput): Promise<Property> {
		try {
			const result = await this.propertyModel.create(input);
			// increase memberProperties
			await this.memberServive.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProperties',
				modifier: 1,
			});
			return result;
		} catch (err) {
			console.log('Error, serviceModel', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}
}
