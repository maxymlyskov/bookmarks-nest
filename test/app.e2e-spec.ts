import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EditUserDto } from 'src/user/dto';
import { AppModule } from "../src/app.module";
describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
    }));
    await app.init();
    await app.listen(3334);
    await pactum.request.setBaseUrl('http://localhost:3334')

    prisma = app.get(PrismaService)

    await prisma.cleanDb()
  })

  afterAll(async () => {
    await app.close();
  })

  describe('auth', () => {
    describe('signup', () => {

      it('should throw error if email empty', () => {
        const dto: AuthDto = {
          email: '',
          password: 'password',
        }
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400)

      })
      it('should throw error if password empty', () => {
        const dto: AuthDto = {
          email: 'test@domain.com',
          password: '',
        }
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(400)
      })

      it('should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400)
      })

      it('should sign up', () => {
        const dto: AuthDto = {
          email: 'test@domain.com',
          password: 'password',
        }
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
      })

    })

    describe('signin', () => {

      it('should throw error if email empty', () => {
        const dto: AuthDto = {
          email: '',
          password: 'password',
        }
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(400)

      })
      it('should throw error if password empty', () => {
        const dto: AuthDto = {
          email: 'test@domain.com',
          password: '',
        }
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(400)
      })

      it('should throw error if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400)
      })
      it('should sign in', () => {
        const dto: AuthDto = {
          email: 'test@domain.com',
          password: 'password',
        }
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', "access_token")
      })
    })
  })

  describe('user', () => {

    describe('get me', () => {
      it('should get current user ', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })

    describe('edit user', () => {
      it('should edit user  ', () => {
        const dto: EditUserDto = {
          firstName: 'test',
          email: 'test@domain.com'
        }
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(
            dto.firstName
          )
          .expectBodyContains(
            dto.email
          )
      })
    })



  })

  describe('bookmarks', () => {
    describe('get empty bookmarks', () => {
      it('should get empty bookmarks ', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(200)
          .expectBody([])

      })
    })

    describe('create bookmarks', () => {
      it('should create bookmarks ', () => {
        const dto: CreateBookmarkDto = {
          title: 'Google',
          description: 'Search Engine',
          link: 'https://google.com'

        }
        return pactum
          .spec()
          .post('/bookmarks')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(
            dto.link
          )
          .expectBodyContains(
            dto.title
          )
          .expectBodyContains(
            dto.description
          )
          .stores('bookmarkId', 'id')
      })
    })



    describe('get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams(
            'id', '$S{bookmarkId}'
          )
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })
    })
    describe('edit bookmark', () => {
      it('should edit bookmark', () => {
        const dto: EditBookmarkDto = {
          title: 'Google',
          description: 'Search Engine',
          link: 'https://google.com'
        }
        return pactum
          .spec()
          .withPathParams(

            'id', '$S{bookmarkId}'

          )
          .patch('/bookmarks/{id}')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(
            dto.link
          )
          .expectBodyContains(
            dto.title
          )
          .expectBodyContains(
            dto.description
          )
      })
    })
    describe('get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(200)

      })
    })


    describe('delete bookmark', () => {

      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams(
            'id', '$S{bookmarkId}'
          )
          .withHeaders({
            'Authorization': 'Bearer $S{userAt}'
          })
          .expectStatus(200)
      })

    })

  })
})