import { Module } from "@nestjs/common";
import { GlobalModule } from "#global/global.module";

@Module({
  imports: [GlobalModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
