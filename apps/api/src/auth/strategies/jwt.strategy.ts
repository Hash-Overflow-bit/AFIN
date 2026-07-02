import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'AFIN_SUPER_SECRET_KEY_FOR_MVP',
    });
  }

  async validate(payload: any) {
    // The payload is what we signed in AuthService.login()
    // We return it here so it gets attached to the request object as req.user
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}
