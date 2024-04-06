import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';
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


    describe('create bookmarks', () => {

    })


    describe('get bookmarks', () => {

    })

    describe('edit bookmark', () => {

    })

    describe('get bookmark by id', () => {

    })

    describe('delete bookmark', () => {

    })

  })
})