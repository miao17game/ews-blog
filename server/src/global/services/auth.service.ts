import { Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export abstract class AuthService {
  public abstract hasAccess(roles: string[]): boolean | Promise<boolean> | Observable<boolean>;
}
