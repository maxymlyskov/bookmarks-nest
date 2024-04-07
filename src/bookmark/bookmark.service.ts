import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prismaService: PrismaService) { }

    async getBookmarks(userId: number) {
        return this.prismaService.bookmark.findMany(
            {
                where: {
                    userId
                }
            }
        )
    }


    async getBookmarkById(userId: number, bookmarkId: number) {
        return this.prismaService.bookmark.findUnique(
            {
                where: {
                    id: bookmarkId,
                    userId
                }
            }
        )
    }
    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        return this.prismaService.bookmark.create(
            {
                data: {
                    ...dto,
                    userId
                }
            }
        )
    }

    async updateBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
        //get bookmark by id and userId
        const bookmark = await this.prismaService.bookmark.findUnique(
            {
                where: {
                    id: bookmarkId,
                }
            }
        )

        //if bookmark not found
        if (!bookmark) {
            throw new ForbiddenException('Bookmark not found')
        }

        //if bookmark found but userId not match
        if (bookmark.userId !== userId) {
            throw new ForbiddenException('Access denied! ')
        }

        return this.prismaService.bookmark.update(
            {
                where: {
                    id: bookmarkId
                },
                data: {
                    ...dto
                }
            }
        )
    }

    async deleteBookmarkById(userId: number, bookmarkId: number) {
        return this.prismaService.bookmark.delete(
            {
                where: {
                    id: bookmarkId
                }
            }
        )
    }
}
