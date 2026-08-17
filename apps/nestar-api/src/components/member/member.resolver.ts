import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => String)
	public async signup(): Promise<String> {
		console.log('Mutation, signup');
		return await this.memberService.signup();
	}

	@Mutation(() => String)
	public async login(): Promise<String> {
		console.log('Mutation, login');
		return await this.memberService.login();
	}

	@Mutation(() => String)
	public async updateMember(): Promise<String> {
		console.log('Mutation, updateMember');
		return await this.memberService.updateMember();
	}

	@Query(() => String)
	public async getMember(): Promise<String> {
		console.log('Mutation, getMember');
		return await this.memberService.getMember();
	}
}
