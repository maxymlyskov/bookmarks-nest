import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as argon from 'argon2';
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable()

export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }

    async signin(dto: AuthDto) {
        //find user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        // if user is not found
        if (!user) {
            throw new ForbiddenException('Credentials are invalid!')
        }

        // verify the password
        const isPasswordValid = await argon.verify(user.hash, dto.password);

        if (!isPasswordValid) {
            throw new ForbiddenException('Invalid password')
        }
        delete user.hash
        return this.signToken(user.id, user.email)
    }

    async signToken(userId: number, email: string,): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email
        }
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: this.config.get('JWT_SECRET')
        })
        return {
            access_token: token
        }
    }

    async signup(dto: AuthDto) {

        // get the password from the dto to hash it
        const hash = await argon.hash(dto.password);
        // create a new user
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                },
                select: {
                    id: true,
                    email: true,
                    createdAt: true
                }
            })
            return this.signToken(user.id, user.email)

        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Email already exists')
                }
            }

            throw error
        }
    }
}