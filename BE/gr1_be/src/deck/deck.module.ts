import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Deck, DeckSchema } from './deck.entity';
import { DeckService } from './deck.service';
import { DeckController } from './deck.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
            {
                name: Deck.name,
                schema: DeckSchema,
            },
        ]),
    ],
    controllers: [DeckController],
    providers: [DeckService],
    exports: [MongooseModule, DeckService],
})
export class DeckModule { }
