import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) { }


    @Get()
    async getBookmarks(@GetUser('id') userId: number) {
        return this.bookmarkService.getBookmarks(userId);
    }

    @Post()
    async createBookmark(@GetUser('id') userId: number, @Body() dto: CreateBookmarkDto) {
        return this.bookmarkService.createBookmark(userId, dto);
    }

    @Get(":id")
    async getBookmarkById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.getBookmarkById(userId, bookmarkId);
    }

    @Patch(':id')
    async updateBookmarkById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number, @Body() dto: EditBookmarkDto) {
        return this.bookmarkService.updateBookmarkById(userId, bookmarkId, dto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deleteBookmarkById(@GetUser('id') userId: number, @Param('id', ParseIntPipe) bookmarkId: number) {
        return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
    }
}
