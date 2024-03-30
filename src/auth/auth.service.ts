import { Injectable } from "@nestjs/common";

@Injectable({})

export class AuthService {

    async login() {
        return 'signin'
    }

    async signup() {
        return 'signup'
    }
}