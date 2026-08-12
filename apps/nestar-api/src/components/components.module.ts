import { Module } from '@nestjs/common';
import { PropertyModule } from './property/property.module';
import { MemberModule } from './member/member.module';

@Module({
	imports: [MemberModule, PropertyModule],
})
export class ComponentsModule {}
