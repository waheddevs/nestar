import { Injectable } from '@nestjs/common';
import { Follower, Following } from '../../libs/dto/follow/follow';
import { MemberService } from '../member/member.service';
import { Model } from 'mongoose';
import { InjectModel } from 'node_modules/@nestjs/mongoose/dist/common/mongoose.decorators';

@Injectable()
export class FollowService {
    constructor(@InjectModel('Follow') private readonly followModel: Model<Follower | Following>, private readonly memberService: MemberService
) {}
}
