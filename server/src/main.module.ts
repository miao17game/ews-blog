import { Module } from "@nestjs/common";
import { AppModule } from "./app/app.module";
import { GlobalModule } from "@global/global.module";

@Module({
  imports: [GlobalModule, AppModule],
  controllers: [],
  providers: [],
})
export class MainModule {}
