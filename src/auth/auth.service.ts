import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import * as argon from 'argon2';
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";

@Injectable()

export class AuthService {
    constructor(private prisma: PrismaService) { }

    async login(dto: AuthDto) {

        return {
            message: dto.email + ' login'
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
            return user

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