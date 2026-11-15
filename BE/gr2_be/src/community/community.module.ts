import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { Deck, DeckSchema } from '../deck/deck.entity';
import { User, UserSchema } from '../user/user.entity';
import { DeckRating, DeckRatingSchema } from './deck-rating.entity';
import { SavedDeck, SavedDeckSchema } from './saved-deck.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Deck.name, schema: DeckSchema },
            { name: User.name, schema: UserSchema },
            { name: DeckRating.name, schema: DeckRatingSchema },
            { name: SavedDeck.name, schema: SavedDeckSchema },
        ]),
    ],
    controllers: [CommunityController],
    providers: [CommunityService],
    exports: [CommunityService],
})
export class CommunityModule { }
